import React, { useState, useCallback } from "react";
import { 
  View, Text, StyleSheet, FlatList, ActivityIndicator, 
  TouchableOpacity, Alert 
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { getUserBookings, cancelBooking } from "../../services/bookingService";
import { getEventById } from "../../services/eventService";
import { scheduleLocalNotification } from "../../services/notificationService";
import { Booking, EventItem } from "../../types";

type BookingWithEvent = Booking & { event?: EventItem | null };

export default function MyBookingsScreen() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingWithEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userBookings = await getUserBookings(user.uid);
      
      // Fetch event details for each booking
      const bookingsWithEvents = await Promise.all(
        userBookings.map(async (b) => {
          const ev = await getEventById(b.eventId);
          return { ...b, event: ev };
        })
      );
      
      // Sort by bookedAt desc
      bookingsWithEvents.sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime());
      
      setBookings(bookingsWithEvents);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [user])
  );

  const handleCancel = (booking: BookingWithEvent) => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes, Cancel", 
          style: "destructive",
          onPress: async () => {
            try {
              setCancelingId(booking.id);
              await cancelBooking(booking.id, booking.eventId, booking.numberOfSeats);
              const eventName = booking.event ? booking.event.name : "the event";
              await scheduleLocalNotification("Booking Cancelled", `You have successfully cancelled your booking for ${eventName}.`);
              Alert.alert("Cancelled", "Your booking has been cancelled successfully.");
              fetchBookings();
            } catch (error: any) {
              Alert.alert("Error", error.message);
            } finally {
              setCancelingId(null);
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: BookingWithEvent }) => {
    const isCancelled = item.status === "cancelled";
    return (
      <View style={[styles.card, isCancelled && styles.cardCancelled]}>
        <View style={styles.cardHeader}>
          <Text style={styles.eventName} numberOfLines={1}>
            {item.event ? item.event.name : "Unknown Event"}
          </Text>
          <View style={[styles.statusBadge, isCancelled ? styles.statusBadgeCancelled : styles.statusBadgeConfirmed]}>
            <Text style={[styles.statusText, isCancelled ? styles.statusTextCancelled : styles.statusTextConfirmed]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.infoText}>
          <Ionicons name="calendar-outline" /> {new Date(item.bookedAt).toLocaleDateString()}
        </Text>
        <Text style={styles.infoText}>
          <Ionicons name="people-outline" /> {item.numberOfSeats} Seats
        </Text>
        <Text style={styles.priceText}>Total: ${item.totalPrice.toFixed(2)}</Text>

        {!isCancelled && (
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => handleCancel(item)}
            disabled={cancelingId === item.id}
          >
            {cancelingId === item.id ? (
              <ActivityIndicator color="red" size="small" />
            ) : (
              <Text style={styles.cancelButtonText}>Cancel Booking</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#4A47F5" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.emptyText}>You have no bookings yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { 
    backgroundColor: "#fff", padding: 16, marginBottom: 16, 
    borderRadius: 12, elevation: 2,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2
  },
  cardCancelled: { opacity: 0.6 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  eventName: { fontSize: 18, fontWeight: "bold", flex: 1, color: "#333", marginRight: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusBadgeConfirmed: { backgroundColor: "#e6f4ea" },
  statusBadgeCancelled: { backgroundColor: "#fce8e6" },
  statusText: { fontSize: 12, fontWeight: "bold" },
  statusTextConfirmed: { color: "#137333" },
  statusTextCancelled: { color: "#c5221f" },
  infoText: { fontSize: 14, color: "#666", marginBottom: 6 },
  priceText: { fontSize: 16, fontWeight: "bold", color: "#4A47F5", marginTop: 8 },
  cancelButton: { 
    marginTop: 16, padding: 10, borderRadius: 8, 
    borderWidth: 1, borderColor: "red", alignItems: "center" 
  },
  cancelButtonText: { color: "red", fontWeight: "600" },
  emptyText: { textAlign: "center", color: "#666", marginTop: 40, fontSize: 16 }
});
