import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";

export default function CriarViagemScreen({ navigation }) {
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [horario, setHorario] = useState("");
  const [preco, setPreco] = useState("");

  const handleCreateTrip = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          Alert.alert("Erro", "Você precisa estar logado para cadastrar uma viagem.");
          return;
        }

        const response = await api.post(
          "/api/viagens",
          { origem, destino, horario, preco, formaPagamento, carro },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        Alert.alert("Sucesso", "Viagem cadastrada com sucesso!");
        navigation.navigate("Home");
      } catch (error) {
        console.error("Erro ao cadastrar viagem:", error.response?.data || error.message);
        Alert.alert("Erro", "Falha ao cadastrar viagem.");
      }
    };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Criar Nova Viagem</Text>

      <TextInput
        label="Origem"
        value={origem}
        onChangeText={setOrigem}
        style={styles.input}
        mode="outlined"
      />

      <TextInput
        label="Destino"
        value={destino}
        onChangeText={setDestino}
        style={styles.input}
        mode="outlined"
      />

      <TextInput
        label="Horário"
        value={horario}
        onChangeText={setHorario}
        style={styles.input}
        mode="outlined"
        placeholder="Ex: 09:30"
      />

      <TextInput
        label="Preço"
        value={preco}
        onChangeText={setPreco}
        style={styles.input}
        mode="outlined"
        keyboardType="numeric"
      />

      <Button mode="contained" onPress={() => navigation.goBack()} style={styles.button}>
        Salvar Viagem
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  button: {
    marginTop: 10,
    backgroundColor: "#000",
  },
});
