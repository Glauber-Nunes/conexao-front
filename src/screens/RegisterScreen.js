import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, TextInput, Button, RadioButton } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, setAuthToken } from "../services/api";
import { useNavigation } from "@react-navigation/native";

export default function RegisterScreen() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState("PASSAGEIRO"); // Default PASSAGEIRO
  const navigation = useNavigation();

  const handleRegister = async () => {
    try {
      const response = await api.post("/auth/cadastrar", { nome, email, telefone, senha, tipo: tipoUsuario });

      console.log("Resposta da API:", response.data);

      const token = response.data.token;
      const tipo = response.data.tipoUsuario;

      if (!token || !tipo) {
        alert("Erro ao cadastrar. Tente novamente!");
        return;
      }

      // Armazena o token e tipo do usuário
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("tipoUsuario", tipo);

      setAuthToken(token);
      navigation.navigate("Home");
    } catch (error) {
      console.error("Erro ao cadastrar:", error.response?.data || error.message);
      alert("Erro ao cadastrar. Verifique os dados!");
    }
  };

  return (
    <View style={styles.container}>


      <TextInput label="Nome" value={nome} onChangeText={setNome} style={styles.input} mode="outlined" />
      <TextInput label="E-mail" value={email} onChangeText={setEmail} style={styles.input} mode="outlined" />
      <TextInput label="Telefone" value={telefone} onChangeText={setTelefone} style={styles.input} mode="outlined" />
      <TextInput label="Senha" value={senha} onChangeText={setSenha} secureTextEntry style={styles.input} mode="outlined" />

      <Text style={styles.label}>Tipo de Usuário:</Text>
      <RadioButton.Group onValueChange={setTipoUsuario} value={tipoUsuario}>
        <View style={styles.radioButton}>
          <RadioButton value="PASSAGEIRO" />
          <Text>Passageiro</Text>
        </View>
        <View style={styles.radioButton}>
          <RadioButton value="MOTORISTA" />
          <Text>Motorista</Text>
        </View>
      </RadioButton.Group>

      <Button mode="contained" onPress={handleRegister} style={styles.button}>
        Cadastrar
      </Button>

      <Button mode="text" onPress={() => navigation.navigate("Login")} style={styles.link}>
        Já tem uma conta? Faça login
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
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 2,
    color: "#333",
  },
  input: {
    width: "100%",
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    marginTop: 10,
    width: "100%",
    backgroundColor: "#000",
  },
  link: {
    marginTop: 15,
  },
});
