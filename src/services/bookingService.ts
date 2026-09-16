import { runTransaction, doc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { Booking } from "../types";

export async function bookEvent(eventId: string, userId: string, seats: number, price: number) {
  const eventRef = doc(db, "events", eventId);
  const bookingRef = doc(collection(db, "bookings"));

  await runTransaction(db, async (tx) => {
    const eventSnap = await tx.get(eventRef);
    if (!eventSnap.exists()) throw new Error("Event not found");
    const available = eventSnap.data().availableSeats;
    if (available < seats) throw new Error("Not enough seats available");

    tx.update(eventRef, { availableSeats: available - seats });
    tx.set(bookingRef, {
      eventId, 
      userId, 
      numberOfSeats: seats,
      status: "confirmed", 
      bookedAt: new Date().toISOString(),
      totalPrice: price * seats,
    });
  });

  return bookingRef.id;
}

export async function getUserBookings(userId: string): Promise<Booking[]> {
  const q = query(collection(db, "bookings"), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
}

export async function cancelBooking(bookingId: string, eventId: string, seatsToRelease: number) {
  const eventRef = doc(db, "events", eventId);
  const bookingRef = doc(db, "bookings", bookingId);

  await runTransaction(db, async (tx) => {
    const eventSnap = await tx.get(eventRef);
    if (eventSnap.exists()) {
      const currentAvailable = eventSnap.data().availableSeats;
      tx.update(eventRef, { availableSeats: currentAvailable + seatsToRelease });
    }
    tx.update(bookingRef, { status: "cancelled" });
  });
}
