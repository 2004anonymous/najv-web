
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
} from "firebase/firestore";

import { db } from "./client";

export type SchoolContent = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "draft" | "published";
  pinned?: boolean;
  date?: string;
  pdfUrl?: string;
  createdBy: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

type ContentInput = Omit<
  SchoolContent,
  "id" | "createdAt" | "updatedAt" | "createdBy"
>;

function toSchoolContent(
  id: string,
  data: DocumentData
): SchoolContent {
  return { id, ...data } as SchoolContent;
}

export async function getPublishedContent(
  type: "notices" | "events"
): Promise<SchoolContent[]> {
  const q = query(
    collection(db, type),
    where("status", "==", "published"),
    orderBy("updatedAt", "desc"),
    limit(50)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) =>
    toSchoolContent(item.id, item.data())
  );
}

export async function getAdminContent(
  type: "notices" | "events"
): Promise<SchoolContent[]> {
  const q = query(
    collection(db, type),
    orderBy("updatedAt", "desc"),
    limit(100)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) =>
    toSchoolContent(item.id, item.data())
  );
}

export async function createContent(
  type: "notices" | "events",
  input: ContentInput,
  uid: string
) {
  return addDoc(collection(db, type), {
    ...input,
    createdBy: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateContent(
  type: "notices" | "events",
  id: string,
  input: Partial<ContentInput>
) {
  return updateDoc(doc(db, type, id), {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export async function removeContent(
  type: "notices" | "events",
  id: string
) {
  return deleteDoc(doc(db, type, id));
}
