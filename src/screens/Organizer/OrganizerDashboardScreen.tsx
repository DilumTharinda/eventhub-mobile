import React, { useState, useCallback } from "react";
import { 
  View, Text, StyleSheet, FlatList, ActivityIndicator, 
  TouchableOpacity, Alert, Image 
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { getEventsByOrganizer, deleteEvent } from "../../services/eventService";
import { EventItem } from "../../types";

export default function OrganizerDashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyEvents = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getEventsByOrganizer(user.uid);
      setEvents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMyEvents();
    }, [user])
  );

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteEvent(id);
              fetchMyEvents();
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: EventItem }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUrl || "https://via.placeholder.com/150" }} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={styles.eventName}>{item.name || "Unnamed Event"}</Text>
        <Text style={styles.eventInfo}>
          <Ionicons name="calendar" /> {item.dateTime ? new Date(item.dateTime).toLocaleDateString() : "TBD"}
        </Text>
        <Text style={styles.eventInfo}>
          <Ionicons name="people" /> {(item.totalSeats || 0) - (item.availableSeats || 0)} / {item.totalSeats || 0} Booked
        </Text>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={() => navigation.navigate("EventBookings", { eventId: item.id, eventName: item.name })}
          >
            <Ionicons name="list" size={20} color="#fff" />
            <Text style={styles.actionText}>Bookings</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: "#f5a623" }]}
            onPress={() => navigation.navigate("CreateEditEvent", { eventToEdit: item })}
          >
            <Ionicons name="create" size={20} color="#fff" />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: "#d9534f" }]}
            onPress={() => handleDelete(item.id)}
          >
            <Ionicons name="trash" size={20} color="#fff" />
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#4A47F5" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Text style={styles.emptyText}>You haven't created any events yet.</Text>}
        />
      )}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate("CreateEditEvent")}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  card: { 
    backgroundColor: "#fff", marginBottom: 16, borderRadius: 12, 
    overflow: "hidden", elevation: 2, shadowColor: "#000", 
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2
  },
  image: { width: "100%", height: 120 },
  cardContent: { padding: 16 },
  eventName: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  eventInfo: { color: "#666", marginBottom: 4 },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  actionBtn: { 
    flex: 1, flexDirection: "row", backgroundColor: "#4A47F5", 
    padding: 8, borderRadius: 6, justifyContent: "center", 
    alignItems: "center", marginHorizontal: 4 
  },
  actionText: { color: "#fff", marginLeft: 4, fontSize: 12, fontWeight: "bold" },
  emptyText: { textAlign: "center", color: "#666", marginTop: 40 },
  fab: { 
    position: "absolute", bottom: 20, right: 20, 
    backgroundColor: "#4A47F5", width: 60, height: 60, 
    borderRadius: 30, justifyContent: "center", alignItems: "center",
    elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.2, shadowRadius: 4
  }
});
