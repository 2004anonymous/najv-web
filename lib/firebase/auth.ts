
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";

import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./client";

export type StaffRole = "admin" | "editor";

export async function loginStaff(
  email: string,
  password: string
) {
  const credential = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );

  try {
    const userDoc = await getDoc(
      doc(db, "users", credential.user.uid)
    );

    if (!userDoc.exists() || userDoc.data().active !== true) {
      await signOut(auth);
      throw new Error("This account is not authorized.");
    }

    return {
      user: credential.user,
      role: userDoc.data().role as StaffRole,
    };
  } catch (error) {
    if (auth.currentUser) await signOut(auth);
    throw error;
  }
}

export { signOut, onAuthStateChanged };
export type { User };
