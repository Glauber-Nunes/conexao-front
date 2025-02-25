import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Alert, FlatList } from "react-native";
import { Text, Card, Button } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native"; // 🔹 Para recarregar os dados ao voltar à tela
import { api } from "../services/api";

export default function TripDetailsScreen({ route, navigation }) {
  const { viagem } = route.params;
  const [dadosViagem, setDadosViagem] = useState(viagem);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [usuarioNaViagem, setUsuarioNaViagem] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 🔹 Carrega o usuário logado
  useEffect(() => {
    const carregarUsuario = async () => {
      const emailUsuario = await AsyncStorage.getItem("email");
      setUsuarioLogado(emailUsuario);
    };

    carregarUsuario();
  }, []);

  // 🔹 Recarrega a viagem sempre que a tela for focada
  useFocusEffect(
    useCallback(() => {
      const atualizarViagem = async () => {
        try {
          setIsLoading(true);
          const token = await AsyncStorage.getItem("token");
          const response = await api.get(`/viagens/${viagem.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          setDadosViagem(response.data);
          setIsLoading(false);

          // 🔹 Atualiza se o usuário está na viagem
          if (response.data.passageiros.some((p) => p.email === usuarioLogado)) {
            setUsuarioNaViagem(true);
          } else {
            setUsuarioNaViagem(false);
          }
        } catch (error) {
          console.error("Erro ao buscar viagem:", error.response?.data || error.message);
          setIsLoading(false);
        }
      };

      atualizarViagem();
    }, [viagem.id, usuarioLogado])
  );

  // 🔹 Entrar na viagem
  const entrarNaViagem = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem("token");

      await api.post(
        `/viagens/${dadosViagem.id}/entrar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Sucesso", "Você entrou na viagem!");
      setUsuarioNaViagem(true);
    } catch (error) {
      Alert.alert("Atenção", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Sair da viagem
  const cancelarViagem = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem("token");

      await api.post(
        `/viagens/${dadosViagem.id}/cancelar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Sucesso", "Você saiu da viagem!");
      setUsuarioNaViagem(false);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível sair da viagem.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>{dadosViagem.motoristaEmail}</Text>
          <Text>{`⏰ ${dadosViagem.horario}  |  🚗 ${dadosViagem.carro}`}</Text>
          <Text>{`🛣️ ${dadosViagem.origem} ➡ ${dadosViagem.destino}`}</Text>
          <Text>{`💰 ${dadosViagem.preco}  |  💸 ${dadosViagem.formaPagamento}`}</Text>

          {/* 🔹 Lista de passageiros */}
          <Text style={styles.passageirosTitle}>
            Passageiros ({dadosViagem.passageiros.length}):
          </Text>
          <FlatList
            data={dadosViagem.passageiros}
            keyExtractor={(item) => String(item.id || item.email)}
            renderItem={({ item }) => (
              <Text style={styles.passageiroItem}>• {item.nome}</Text>
            )}
          />
        </Card.Content>

        <Card.Actions>
          {usuarioNaViagem ? (
            <Button mode="contained" onPress={cancelarViagem} color="red" loading={isLoading}>
              Cancelar Viagem
            </Button>
          ) : (
            <Button mode="contained" onPress={entrarNaViagem} loading={isLoading}>
              Entrar na Viagem
            </Button>
          )}
        </Card.Actions>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  card: {
    width: "100%",
    padding: 20,
    borderRadius: 10,
    backgroundColor: "white",
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  passageirosTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
  },
  passageiroItem: {
    fontSize: 16,
    marginTop: 5,
  },
});
