import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Switch } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) return Alert.alert("Validation", "All fields are required");
    try {
      setLoading(true);
      await register(name, email, password, isOrganizer ? "organizer" : "user");
    } catch (e: any) {
      Alert.alert("Registration failed", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Register as an Event Organizer</Text>
        <Switch 
          value={isOrganizer} 
          onValueChange={setIsOrganizer}
          trackColor={{ false: "#767577", true: "#4A47F5" }}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Registering..." : "Register"}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Already have an account? Log In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: { fontSize: 32, fontWeight: "700", marginBottom: 24, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 12 },
  switchContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingHorizontal: 4 },
  switchLabel: { fontSize: 16, color: "#333" },
  button: { backgroundColor: "#4A47F5", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontWeight: "600" },
  link: { marginTop: 16, textAlign: "center", color: "#4A47F5" }
});
