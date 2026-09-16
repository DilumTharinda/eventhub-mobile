import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { db } from "../config/firebase";
import { EventItem } from "../types";

const eventsRef = collection(db, "events");

export async function getAllEvents(): Promise<EventItem[]> {
  const snap = await getDocs(eventsRef);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as EventItem));
}

export async function getEventById(id: string): Promise<EventItem | null> {
  const snap = await getDoc(doc(db, "events", id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as EventItem) : null;
}

export async function getEventsByOrganizer(organizerId: string): Promise<EventItem[]> {
  const q = query(eventsRef, where("organizerId", "==", organizerId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as EventItem));
}

export async function createEvent(data: Omit<EventItem, "id">) {
  return addDoc(eventsRef, data);
}

export async function updateEvent(id: string, data: Partial<EventItem>) {
  return updateDoc(doc(db, "events", id), data);
}

export async function deleteEvent(id: string) {
  return deleteDoc(doc(db, "events", id));
}