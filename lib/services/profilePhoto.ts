"use client";

import { ref, deleteObject } from "firebase/storage";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db, storage } from "../firebase";

const MAX_SOURCE_BYTES = 10 * 1024 * 1024;
const OUTPUT_SIZE = 256;
const MAX_DATA_URL_CHARS = 160_000; // Cap inline images to keep Firestore user docs small.

async function imageBitmapFromFile(file: File) {
  return createImageBitmap(file, { imageOrientation: "from-image" });
}

async function cropToAvatarBlob(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Kies een afbeelding.");
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error("De foto mag maximaal 10 MB zijn.");
  }

  const bitmap = await imageBitmapFromFile(file);
  const cropSize = Math.min(bitmap.width, bitmap.height);
  const sourceX = Math.max(0, (bitmap.width - cropSize) / 2);
  const sourceY = Math.max(0, (bitmap.height - cropSize) / 2);

  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("De foto kon niet worden verwerkt.");
  }

  context.drawImage(
    bitmap,
    sourceX,
    sourceY,
    cropSize,
    cropSize,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE,
  );
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.84),
  );
  if (!blob) throw new Error("De foto kon niet worden opgeslagen.");
  return blob;
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("De profielfoto kon niet worden gelezen."));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}

export async function uploadOwnProfilePhoto(uid: string, file: File) {
  const avatar = await cropToAvatarBlob(file);
  const photoUrl = await blobToDataUrl(avatar);
  if (photoUrl.length > MAX_DATA_URL_CHARS) {
    throw new Error("De geoptimaliseerde foto is nog te groot. Kies een andere foto.");
  }

  // Keep the existing profile.photoUrl interface for all components while storing
  // the optimized Base64 data URL directly in the owner's Firestore user document.
  await updateDoc(doc(db, "users", uid), {
    "profile.photoUrl": photoUrl,
    updatedAt: serverTimestamp(),
  });
  return photoUrl;
}

export async function removeOwnProfilePhoto(uid: string) {
  // Clear the active Base64 value first. Legacy Storage cleanup is best effort.
  await updateDoc(doc(db, "users", uid), {
    "profile.photoUrl": null,
    updatedAt: serverTimestamp(),
  });
  try {
    await deleteObject(ref(storage, `profile-photos/${uid}/avatar.webp`));
  } catch {
    // Older uploaded photos may already be missing or lack Storage delete permission.
  }
}
