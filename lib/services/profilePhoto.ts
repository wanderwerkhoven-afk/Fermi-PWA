"use client";

import { ref, deleteObject } from "firebase/storage";
import { doc, getDocFromServer, runTransaction, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../firebase";
import { syncOwnCommunityProfile } from "./community";
import type { FermiUser } from "../models/backend";

const MAX_SOURCE_BYTES = 10 * 1024 * 1024;
const OUTPUT_SIZE = 256;
const MAX_DATA_URL_CHARS = 160_000;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("De foto kon niet worden geopend.")); };
    image.src = url;
  });
}

export type ProfilePhotoCrop = {
  zoom: number;
  offsetX: number;
  offsetY: number;
  viewportSize: number;
};

async function photoDataUrl(file: File, crop?: ProfilePhotoCrop): Promise<string> {
  if (!file.type.startsWith("image/") && !/\.(heic|heif)$/i.test(file.name)) {
    throw new Error("Kies een foto uit je album.");
  }
  if (file.size > MAX_SOURCE_BYTES) throw new Error("De foto mag maximaal 10 MB zijn.");

  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Je browser kan deze foto niet verwerken.");
  const ctx = context;
  const renderCrop = (dimension: number) => {
    canvas.width = dimension;
    canvas.height = dimension;
    ctx.clearRect(0, 0, dimension, dimension);
    ctx.fillStyle = "#021722";
    ctx.fillRect(0, 0, dimension, dimension);

    if (!crop) {
      const size = Math.min(img.naturalWidth, img.naturalHeight);
      ctx.drawImage(img, (img.naturalWidth - size) / 2, (img.naturalHeight - size) / 2, size, size, 0, 0, dimension, dimension);
      return;
    }

    const zoom = Math.max(1, Math.min(3, crop.zoom));
    const baseScale = Math.min(dimension / img.naturalWidth, dimension / img.naturalHeight);
    const scale = baseScale * zoom;
    const drawWidth = img.naturalWidth * scale;
    const drawHeight = img.naturalHeight * scale;
    const viewportScale = dimension / Math.max(1, crop.viewportSize);
    const maxX = Math.max(0, (drawWidth - dimension) / 2);
    const maxY = Math.max(0, (drawHeight - dimension) / 2);
    const offsetX = Math.max(-maxX, Math.min(maxX, crop.offsetX * viewportScale));
    const offsetY = Math.max(-maxY, Math.min(maxY, crop.offsetY * viewportScale));

    ctx.drawImage(
      img,
      (dimension - drawWidth) / 2 + offsetX,
      (dimension - drawHeight) / 2 + offsetY,
      drawWidth,
      drawHeight,
    );
  };

  renderCrop(OUTPUT_SIZE);

  // Same canvas-to-Data-URL approach used for saved Cocktail Maestro recipes.
  // JPEG is reliably decoded by iOS Safari, including installed Home Screen PWAs.
  // Automatically reduce JPEG quality, then resolution, instead of rejecting
  // normal detailed photos that exceed the Firestore inline-image budget.
  for (const dimension of [256, 224, 192, 160, 128]) {
    if (canvas.width !== dimension) {
      renderCrop(dimension);
    }
    for (const quality of [0.78, 0.65, 0.52, 0.4, 0.3]) {
      const result = canvas.toDataURL("image/jpeg", quality);
      if (result.startsWith("data:image/jpeg;base64,") && result.length <= MAX_DATA_URL_CHARS) {
        return result;
      }
    }
  }
  throw new Error("Deze foto kon niet voldoende worden verkleind.");
}

async function persistProfilePhoto(uid: string, photoUrl: string | null) {
  await runTransaction(db, async (tx) => {
    const accountRef = doc(db, "users", uid);
    const accountSnap = await tx.get(accountRef);
    if (!accountSnap.exists()) throw new Error("profile/account-not-found");
    const account = accountSnap.data() as FermiUser;
    const memberRef = account.memberId ? doc(db, "members", account.memberId) : null;
    const memberSnap = memberRef ? await tx.get(memberRef) : null;
    if (memberRef && (!memberSnap?.exists() || memberSnap.data().authUid !== uid)) {
      throw new Error("member/inconsistent-link");
    }
    const profile = { ...account.profile, photoUrl };
    tx.update(accountRef, { profile, updatedAt: serverTimestamp() });
    if (memberRef) tx.update(memberRef, { profile, updatedAt: serverTimestamp() });
  });
}

export async function uploadOwnProfilePhoto(uid: string, file: File, crop?: ProfilePhotoCrop) {
  const photoUrl = await photoDataUrl(file, crop);
  await persistProfilePhoto(uid, photoUrl);

  // Confirm the server actually persisted the avatar, not just the local cache.
  const snapshot = await getDocFromServer(doc(db, "users", uid));
  if (snapshot.data()?.profile?.photoUrl !== photoUrl) {
    throw new Error("Firebase heeft de profielfoto niet bevestigd. Probeer het opnieuw.");
  }
  await syncOwnCommunityProfile(uid, (snapshot.data() as FermiUser).profile);
  return photoUrl;
}

export async function removeOwnProfilePhoto(uid: string) {
  await persistProfilePhoto(uid, null);
  const saved = await getDocFromServer(doc(db, "users", uid));
  if (saved.exists()) await syncOwnCommunityProfile(uid, (saved.data() as FermiUser).profile);
  try {
    await deleteObject(ref(storage, `profile-photos/${uid}/avatar.webp`));
  } catch {
    // Legacy Storage cleanup is optional.
  }
}
