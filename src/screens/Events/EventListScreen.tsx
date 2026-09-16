import React, { useEffect, useState, useCallback } from "react";
import { 
  View, Text, FlatList, StyleSheet, TextInput, 
  TouchableOpacity, ActivityIndicator, Image 
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAllEvents } from "../../services/eventService";
import { EventItem } from "../../types";

const CATEGORIES = ["All", "Music", "Tech", "Sports", "Art", "Food"];

export default function EventListScreen({ navigation }: any) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [favorites, setFavorites] = useState<string[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAllEvents();
      setEvents(data);
      const favs = await AsyncStorage.getItem("favorites");
      if (favs) setFavorites(JSON.parse(favs));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const toggleFavorite = async (eventId: string) => {
    let newFavs = [...favorites];
    if (newFavs.includes(eventId)) {
      newFavs = newFavs.filter(id => id !== eventId);
    } else {
      newFavs.push(eventId);
    }
    setFavorites(newFavs);
    await AsyncStorage.setItem("favorites", JSON.stringify(newFavs));
  };

  const filteredEvents = events.filter((e) => {
    const matchesSearch = (e.name || "").toLowerCase().includes((search || "").toLowerCase());
    const matchesCategory = category === "All" || e.category === category;
    return matchesSearch && matchesCategory;
  });

  const renderEvent = ({ item }: { item: EventItem }) => {
    const isFav = favorites.includes(item.id);
    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => navigation.navigate("EventDetails", { eventId: item.id })}
      >
        <Image 
          source={{ uri: item.imageUrl || "https://via.placeholder.com/150" }} 
          style={styles.image} 
        />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.eventName}>{item.name}</Text>
            <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
              <Ionicons name={isFav ? "heart" : "heart-outline"} size={24} color={isFav ? "red" : "gray"} />
            </TouchableOpacity>
          </View>
          <Text style={styles.eventInfo}><Ionicons name="calendar-outline" /> {item.dateTime ? new Date(item.dateTime).toLocaleDateString() : "TBD"}</Text>
          <Text style={styles.eventInfo}><Ionicons name="location-outline" /> {item.location || "TBA"}</Text>
          <Text style={styles.eventPrice}>${(item.price || 0).toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput 
        style={styles.searchInput} 
        placeholder="Search events..." 
        value={search} 
        onChangeText={setSearch} 
      />
      
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.categoryBadge, category === item && styles.categoryBadgeActive]}
              onPress={() => setCategory(item)}
            >
              <Text style={[styles.categoryText, category === item && styles.categoryTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4A47F5" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          renderItem={renderEvent}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No events found</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  searchInput: { 
    margin: 16, padding: 12, backgroundColor: "#fff", 
    borderRadius: 8, borderWidth: 1, borderColor: "#ddd" 
  },
  categoryContainer: { paddingHorizontal: 16, marginBottom: 10 },
  categoryBadge: { 
    paddingHorizontal: 16, paddingVertical: 8, 
    borderRadius: 20, backgroundColor: "#e0e0e0", 
    marginRight: 8 
  },
  categoryBadgeActive: { backgroundColor: "#4A47F5" },
  categoryText: { color: "#333", fontWeight: "600" },
  categoryTextActive: { color: "#fff" },
  card: { 
    backgroundColor: "#fff", marginHorizontal: 16, marginBottom: 16, 
    borderRadius: 12, overflow: "hidden", elevation: 3, 
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 
  },
  image: { width: "100%", height: 150 },
  cardContent: { padding: 16 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  eventName: { fontSize: 18, fontWeight: "bold", flex: 1 },
  eventInfo: { color: "#666", marginBottom: 4 },
  eventPrice: { fontSize: 16, fontWeight: "bold", color: "#4A47F5", marginTop: 8 },
  emptyText: { textAlign: "center", color: "#666", marginTop: 40 }
});
