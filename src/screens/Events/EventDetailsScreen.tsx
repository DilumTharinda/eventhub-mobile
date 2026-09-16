import React, { useEffect, useState } from "react";
import { 
  View, Text, StyleSheet, Image, ActivityIndicator, 
  ScrollView, TouchableOpacity, Alert 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getEventById } from "../../services/eventService";
import { bookEvent } from "../../services/bookingService";
import { useAuth } from "../../context/AuthContext";
import { scheduleLocalNotification } from "../../services/notificationService";
import { EventItem } from "../../types";

export default function EventDetailsScreen({ route, navigation }: any) {
  const { eventId } = route.params;
  const { user } = useAuth();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [seats, setSeats] = useState(1);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await getEventById(eventId);
        setEvent(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  const handleBook = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to book an event.");
      return;
    }
    if (!event) return;

    try {
      setBookingLoading(true);
      await bookEvent(event.id, user.uid, seats, event.price);
      await scheduleLocalNotification("Booking Confirmed! 🎉", `You have successfully booked ${seats} seat(s) for ${event.name}.`);
      Alert.alert("Success", "Booking confirmed!");
      // Navigate back or to MyBookings
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Booking failed", error.message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#4A47F5" style={styles.loader} />;
  }

  if (!event) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Event not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <Image 
          source={{ uri: event.imageUrl || "https://via.placeholder.com/400x200" }} 
          style={styles.image} 
        />
        <View style={styles.content}>
          <Text style={styles.title}>{event.name}</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color="#4A47F5" />
            <Text style={styles.infoText}>{new Date(event.dateTime).toLocaleString()}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color="#4A47F5" />
            <Text style={styles.infoText}>{event.location}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="pricetag" size={20} color="#4A47F5" />
            <Text style={styles.infoText}>${event.price.toFixed(2)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="people" size={20} color="#4A47F5" />
            <Text style={styles.infoText}>{event.availableSeats} / {event.totalSeats} seats available</Text>
          </View>

          <Text style={styles.sectionTitle}>About Event</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.seatSelector}>
          <TouchableOpacity 
            style={styles.seatButton} 
            onPress={() => setSeats(Math.max(1, seats - 1))}
            disabled={bookingLoading}
          >
            <Ionicons name="remove" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.seatCount}>{seats}</Text>
          <TouchableOpacity 
            style={styles.seatButton} 
            onPress={() => setSeats(Math.min(event.availableSeats, seats + 1))}
            disabled={bookingLoading}
          >
            <Ionicons name="add" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={[styles.bookButton, bookingLoading && styles.bookButtonDisabled]} 
          onPress={handleBook}
          disabled={bookingLoading || event.availableSeats === 0}
        >
          <Text style={styles.bookButtonText}>
            {bookingLoading ? "Processing..." : `Book - $${(event.price * seats).toFixed(2)}`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { textAlign: "center", marginTop: 40, fontSize: 18, color: "red" },
  image: { width: "100%", height: 250 },
  content: { padding: 20 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 16, color: "#333" },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  infoText: { fontSize: 16, color: "#666", marginLeft: 12 },
  sectionTitle: { fontSize: 20, fontWeight: "600", marginTop: 24, marginBottom: 8, color: "#333" },
  description: { fontSize: 16, color: "#666", lineHeight: 24 },
  footer: { 
    flexDirection: "row", padding: 16, borderTopWidth: 1, 
    borderColor: "#eee", backgroundColor: "#fff", alignItems: "center" 
  },
  seatSelector: { flexDirection: "row", alignItems: "center", marginRight: 16 },
  seatButton: { 
    width: 40, height: 40, borderRadius: 20, backgroundColor: "#f0f0f0", 
    justifyContent: "center", alignItems: "center" 
  },
  seatCount: { fontSize: 18, fontWeight: "600", marginHorizontal: 16 },
  bookButton: { 
    flex: 1, backgroundColor: "#4A47F5", paddingVertical: 14, 
    borderRadius: 8, alignItems: "center" 
  },
  bookButtonDisabled: { backgroundColor: "#a09ff5" },
  bookButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
