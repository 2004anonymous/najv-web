
import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

import { storage } from "@/lib/firebase/client";

export async function uploadNoticePdf(file: File): Promise<string> {
  const maxBytes = 10 * 1024 * 1024;

  if (file.type !== "application/pdf") {
    throw new Error("Please select a PDF file.");
  }

  if (file.size > maxBytes) {
    throw new Error("The PDF must be smaller than 10 MB.");
  }

  const safeName = file.name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(-100);

  const path = `school-pdfs/${crypto.randomUUID()}-${safeName}`;
  const fileRef = ref(storage, path);

  await uploadBytes(fileRef, file, {
    contentType: "application/pdf",
  });

  return getDownloadURL(fileRef);
}
