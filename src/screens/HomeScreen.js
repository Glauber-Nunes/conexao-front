import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { Text, Card, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { api } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FAB } from "react-native-paper";

export default function HomeScreen() {
  const navigation = useNavigation();
  const [viagens, setViagens] = useState([]);
  const [tipoUsuario, setTipoUsuario] = useState("");

  const carregarViagens = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const tipo = await AsyncStorage.getItem("tipoUsuario");

      if (!token || !tipo) {
        console.log("Token não encontrado. Redirecionando para login.");
        navigation.navigate("Login");
        return;
      }

      setTipoUsuario(tipo);
      console.log("Token encontrado:", token);

      const response = await api.get("/viagens/disponiveis", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Viagens recebidas:", response.data);
      setViagens(response.data);
    } catch (error) {
      console.error("Erro ao buscar viagens:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    carregarViagens();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Viagens Disponíveis</Text>

      <FlatList
        data={viagens}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.motorista}>{item.motorista.nome}</Text>
              <Text>{`⏰ ${item.horario}  |  🚗 ${item.carro}`}</Text>
              <Text>{`🛣️ ${item.origem} ➡ ${item.destino}`}</Text>
              <Text>{`💰 ${item.preco}  |  💸 ${item.formaPagamento}`}</Text>
            </Card.Content>
            <Card.Actions>
              <Button mode="contained" onPress={() => navigation.navigate("DetalhesViagem", { viagem: item })}>
                              Ver Viagem
                            </Button>
            </Card.Actions>
          </Card>
        )}
      />

      {tipoUsuario === "MOTORISTA" && (
              <FAB
                icon="plus"
                style={styles.fab}
                onPress={() => navigation.navigate("CriarViagem")}
              />
            )}
    </View>
  );
}

// 🔹 Definição dos estilos para evitar erro
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  card: {
    marginBottom: 15,
    backgroundColor: "#fff",
    elevation: 3,
  },
  motorista: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  fab: {
      position: "absolute",
      bottom: 20,
      right: 20,
    },
});
