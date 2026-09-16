import React, { useState } from "react";
import { 
  View, Text, StyleSheet, TextInput, ScrollView, 
  TouchableOpacity, Alert, ActivityIndicator 
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { createEvent, updateEvent } from "../../services/eventService";

export default function CreateEditEventScreen({ route, navigation }: any) {
  const { user } = useAuth();
  const eventToEdit = route.params?.eventToEdit;
  const isEditing = !!eventToEdit;

  const [name, setName] = useState(eventToEdit?.name || "");
  const [description, setDescription] = useState(eventToEdit?.description || "");
  const [imageUrl, setImageUrl] = useState(eventToEdit?.imageUrl || "");
  const [dateTime, setDateTime] = useState(eventToEdit?.dateTime || new Date().toISOString());
  const [location, setLocation] = useState(eventToEdit?.location || "");
  const [category, setCategory] = useState(eventToEdit?.category || "Music");
  const [price, setPrice] = useState(eventToEdit?.price?.toString() || "0");
  const [totalSeats, setTotalSeats] = useState(eventToEdit?.totalSeats?.toString() || "100");
  
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name || !description || !location || !price || !totalSeats) {
      Alert.alert("Validation", "Please fill all required fields.");
      return;
    }
    
    setLoading(true);
    try {
      const eventData = {
        name,
        description,
        imageUrl: imageUrl || "https://via.placeholder.com/400x200",
        dateTime,
        location,
        category,
        price: parseFloat(price),
        totalSeats: parseInt(totalSeats, 10),
        availableSeats: isEditing ? eventToEdit.availableSeats : parseInt(totalSeats, 10),
        organizerId: user!.uid,
      };

      if (isEditing) {
        await updateEvent(eventToEdit.id, eventData);
        Alert.alert("Success", "Event updated successfully!");
      } else {
        await createEvent(eventData);
        Alert.alert("Success", "Event created successfully!");
      }
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <Text style={styles.label}>Event Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Summer Music Festival" />

      <Text style={styles.label}>Description</Text>
      <TextInput 
        style={[styles.input, { height: 100 }]} 
        value={description} 
        onChangeText={setDescription} 
        placeholder="Event details..." 
        multiline 
      />

      <Text style={styles.label}>Image URL</Text>
      <TextInput style={styles.input} value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." />

      <Text style={styles.label}>Date & Time (ISO String for now)</Text>
      <TextInput style={styles.input} value={dateTime} onChangeText={setDateTime} placeholder="YYYY-MM-DDTHH:mm:ss.sssZ" />

      <Text style={styles.label}>Location</Text>
      <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Venue address" />

      <Text style={styles.label}>Category</Text>
      <TextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="e.g. Music, Tech, Sports" />

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.label}>Price ($)</Text>
          <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" />
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.label}>Total Seats</Text>
          <TextInput style={styles.input} value={totalSeats} onChangeText={setTotalSeats} keyboardType="numeric" />
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{isEditing ? "Update Event" : "Create Event"}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 6 },
  input: { 
    borderWidth: 1, borderColor: "#ddd", borderRadius: 8, 
    padding: 12, marginBottom: 16, backgroundColor: "#fafafa" 
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  button: { 
    backgroundColor: "#4A47F5", padding: 16, borderRadius: 8, 
    alignItems: "center", marginTop: 20 
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
