import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { AppUser } from "../types";

export async function updateUserProfile(userId: string, data: Partial<AppUser>) {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, data);
}

export async function getUserProfile(userId: string): Promise<AppUser | null> {
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return { uid: snap.id, ...snap.data() } as AppUser;
  }
  return null;
}
