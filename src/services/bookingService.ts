import { runTransaction, doc, collection } from "firebase/firestore";
import { db } from "../config/firebase";

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
