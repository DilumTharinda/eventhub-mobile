import React, { useState, useEffect } from "react";
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ActivityIndicator, Alert 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { updateUserProfile } from "../../services/userService";

export default function ProfileScreen() {
  const { user, profile, logout } = useAuth();
  
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile?.displayName) {
      setDisplayName(profile.displayName);
    }
  }, [profile]);

  const handleUpdate = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateUserProfile(user.uid, { displayName });
      Alert.alert("Success", "Profile updated successfully!");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e: any) {
      Alert.alert("Logout Error", e.message);
    }
  };

  if (!profile) {
    return <ActivityIndicator size="large" color="#4A47F5" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="person-circle-outline" size={100} color="#4A47F5" />
        <Text style={styles.emailText}>{profile.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{profile.role.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Display Name</Text>
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Enter your name"
        />

        <TouchableOpacity 
          style={styles.updateButton} 
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.updateButtonText}>Update Profile</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#d9534f" />
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { alignItems: "center", marginBottom: 30, marginTop: 20 },
  emailText: { fontSize: 18, color: "#333", fontWeight: "bold", marginTop: 10 },
  roleBadge: { 
    marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, 
    backgroundColor: "#e0e0e0", borderRadius: 12 
  },
  roleText: { fontSize: 12, fontWeight: "bold", color: "#555" },
  form: { flex: 1 },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8 },
  input: { 
    borderWidth: 1, borderColor: "#ddd", borderRadius: 8, 
    padding: 12, marginBottom: 20, backgroundColor: "#fafafa" 
  },
  updateButton: { 
    backgroundColor: "#4A47F5", padding: 14, borderRadius: 8, 
    alignItems: "center" 
  },
  updateButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  logoutButton: { 
    flexDirection: "row", alignItems: "center", justifyContent: "center", 
    padding: 16, marginTop: 20 
  },
  logoutButtonText: { color: "#d9534f", fontSize: 18, fontWeight: "bold", marginLeft: 8 },
});
