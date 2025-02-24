import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, setAuthToken } from "../services/api";
import { useNavigation } from "@react-navigation/native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      const response = await api.post("/auth/login", { email, senha });
      const token = response.data.token;
      const tipoUsuario = response.data.tipoUsuario; // "PASSAGEIRO" ou "MOTORISTA"

      // Armazena o token e o tipo de usuário no AsyncStorage
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("tipoUsuario", tipoUsuario);

      setAuthToken(token); // Configura o token no Axios

      navigation.navigate("Home");
    } catch (error) {
      console.error("Erro ao fazer login:", error.response?.data || error.message);
      alert("Erro ao fazer login. Verifique suas credenciais.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo ao Conexão</Text>

      <TextInput
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        mode="outlined"
      />

      <TextInput
        label="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        style={styles.input}
        mode="outlined"
      />

      <Button mode="contained" onPress={handleLogin} style={styles.button}>
        Entrar
      </Button>

      <Button mode="text" onPress={() => navigation.navigate("Register")} style={styles.link}>
        Criar uma conta
      </Button>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
  },
  input: {
    width: "100%",
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  button: {
    marginTop: 10,
    width: "100%",
    backgroundColor: "#000",
  },
});
