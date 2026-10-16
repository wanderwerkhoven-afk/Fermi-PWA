"use client";

import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db, storage } from "../firebase";

const MAX_SOURCE_BYTES = 10 * 1024 * 1024;
const OUTPUT_SIZE = 512;

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

export async function uploadOwnProfilePhoto(uid: string, file: File) {
  const avatar = await cropToAvatarBlob(file);
  const objectRef = ref(storage, `profile-photos/${uid}/avatar.webp`);

  await uploadBytes(objectRef, avatar, {
    contentType: "image/webp",
    cacheControl: "public,max-age=3600",
    customMetadata: { ownerUid: uid },
  });

  const photoUrl = await getDownloadURL(objectRef);
  await updateDoc(doc(db, "users", uid), {
    "profile.photoUrl": photoUrl,
    updatedAt: serverTimestamp(),
  });

  return photoUrl;
}

export async function removeOwnProfilePhoto(uid: string) {
  const objectRef = ref(storage, `profile-photos/${uid}/avatar.webp`);
  try {
    await deleteObject(objectRef);
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code !== "storage/object-not-found") throw error;
  }

  await updateDoc(doc(db, "users", uid), {
    "profile.photoUrl": null,
    updatedAt: serverTimestamp(),
  });
}
