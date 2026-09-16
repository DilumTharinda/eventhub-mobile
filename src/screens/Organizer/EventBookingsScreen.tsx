import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { getEventBookings } from "../../services/bookingService";
import { Booking } from "../../types";
import { Ionicons } from "@expo/vector-icons";

export default function EventBookingsScreen({ route }: any) {
  const { eventId, eventName } = route.params;
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await getEventBookings(eventId);
        setBookings(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [eventId]);

  const renderItem = ({ item }: { item: Booking }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.userIdText}>User ID: {item.userId.slice(0, 8)}...</Text>
        <Text style={[styles.statusText, item.status === 'cancelled' && styles.statusCancelled]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.infoText}>
        <Ionicons name="people-outline" /> {item.numberOfSeats} Seats
      </Text>
      <Text style={styles.infoText}>
        <Ionicons name="time-outline" /> {new Date(item.bookedAt).toLocaleString()}
      </Text>
      <Text style={styles.priceText}>Total: ${item.totalPrice.toFixed(2)}</Text>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#4A47F5" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bookings for {eventName}</Text>
      <FlatList
        data={bookings}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.emptyText}>No bookings yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "bold", margin: 16, color: "#333", textAlign: "center" },
  card: { 
    backgroundColor: "#fff", padding: 16, marginBottom: 12, 
    borderRadius: 8, elevation: 1, shadowColor: "#000", 
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  userIdText: { fontSize: 16, fontWeight: "bold", color: "#444" },
  statusText: { fontSize: 14, fontWeight: "bold", color: "#137333" },
  statusCancelled: { color: "#c5221f" },
  infoText: { fontSize: 14, color: "#666", marginBottom: 4 },
  priceText: { fontSize: 16, fontWeight: "bold", color: "#4A47F5", marginTop: 8 },
  emptyText: { textAlign: "center", color: "#666", marginTop: 40 },
});
