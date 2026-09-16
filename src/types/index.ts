export interface EventItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  dateTime: string; // ISO string
  location: string;
  category: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  organizerId: string;
}

export interface Booking {
  id: string;
  eventId: string;
  userId: string;
  numberOfSeats: number;
  status: "confirmed" | "cancelled";
  bookedAt: string;
  totalPrice: number;
}

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  role: "user" | "organizer";
}