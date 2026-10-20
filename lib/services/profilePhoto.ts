"use client";

import { ref, deleteObject } from "firebase/storage";
import { doc, getDocFromServer, serverTimestamp, updateDoc } from "firebase/firestore";
import { db, storage } from "../firebase";

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

async function photoDataUrl(file: File): Promise<string> {
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
  const size = Math.min(img.naturalWidth, img.naturalHeight);
  context.drawImage(img, (img.naturalWidth - size) / 2, (img.naturalHeight - size) / 2, size, size, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  // Same canvas-to-Data-URL approach used for saved Cocktail Maestro recipes.
  // JPEG is reliably decoded by iOS Safari, including installed Home Screen PWAs.
  const dataUrl = canvas.toDataURL("image/jpeg", 0.72);
  if (!dataUrl.startsWith("data:image/jpeg;base64,") || dataUrl.length > MAX_DATA_URL_CHARS) {
    throw new Error("De foto is te groot om op te slaan. Kies een andere foto.");
  }
  return dataUrl;
}

export async function uploadOwnProfilePhoto(uid: string, file: File) {
  const photoUrl = await photoDataUrl(file);
  await updateDoc(doc(db, "users", uid), {
    "profile.photoUrl": photoUrl,
    updatedAt: serverTimestamp(),
  });

  // Confirm the server actually persisted the avatar, not just the local cache.
  const snapshot = await getDocFromServer(doc(db, "users", uid));
  if (snapshot.data()?.profile?.photoUrl !== photoUrl) {
    throw new Error("Firebase heeft de profielfoto niet bevestigd. Probeer het opnieuw.");
  }
  return photoUrl;
}

export async function removeOwnProfilePhoto(uid: string) {
  await updateDoc(doc(db, "users", uid), {
    "profile.photoUrl": null,
    updatedAt: serverTimestamp(),
  });
  try {
    await deleteObject(ref(storage, `profile-photos/${uid}/avatar.webp`));
  } catch {
    // Legacy Storage cleanup is optional.
  }
}
