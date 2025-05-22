import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Alert,
  Modal,
  Image,
  TextInput,
  ScrollView,
  FlatList
} from "react-native";
import {
  Text,
  Card,
  Button,
  Avatar,
  ActivityIndicator
} from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../services/api";
import { format, differenceInMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Ionicons } from "@expo/vector-icons";

export default function TripDetailsScreen({ route, navigation }) {
  const { viagem } = route.params;
  const [dadosViagem, setDadosViagem] = useState(viagem);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [usuarioNaViagem, setUsuarioNaViagem] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(null);
  const [tipoUsuario, setTipoUsuario] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [pontoEncontro, setPontoEncontro] = useState("");

  useEffect(() => {
    const carregarUsuario = async () => {
      const emailUsuario = await AsyncStorage.getItem("email");
      const tipo = await AsyncStorage.getItem("tipoUsuario");
      setUsuarioLogado(emailUsuario);
      setTipoUsuario(tipo);

       // ⚠️ Carrega dados da viagem com o email já setado
          atualizarViagem(emailUsuario);
    };

    carregarUsuario();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const atualizarViagem = async () => {
        try {
          setIsLoading(true);
          const token = await AsyncStorage.getItem("token");

         const response = await api.get(`/api/viagens/${viagem.id}`, {
           headers: { Authorization: `Bearer ${token}` },
         });

          setDadosViagem(response.data);
          setIsLoading(false);

          if (response.data.passageiros.some((p) => p.email === usuarioLogado)) {
            setUsuarioNaViagem(true);

            const entrada = response.data.dataEntrada?.[usuarioLogado]
              ? new Date(response.data.dataEntrada[usuarioLogado])
              : null;

            if (entrada) {
              const minutosDesdeEntrada = differenceInMinutes(new Date(), entrada);
              setTempoRestante(minutosDesdeEntrada < 60 ? 60 - minutosDesdeEntrada : 0);
            }
          } else {
            setUsuarioNaViagem(false);
            setTempoRestante(null);
          }
        } catch (error) {
          //console.error("Erro ao buscar viagem:", error.response?.data || error.message);
          setIsLoading(false);
        }
      };

      atualizarViagem();
    }, [viagem.id, usuarioLogado])
  );

  const entrarNaViagem = async () => {
    setModalVisible(true);
  };

  const confirmarParticipacao = async () => {
    try {
      if (!pontoEncontro.trim()) {
        Alert.alert("Atenção", "Por favor, informe o seu ponto de encontro.");
        return;
      }

      setIsLoading(true);
      const token = await AsyncStorage.getItem("token");

      await api.post(
        `/api/viagens/${dadosViagem.id}/entrar`,
        { localEncontro: pontoEncontro },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Sucesso", "Você entrou na viagem!");

      setModalVisible(false);
      setPontoEncontro(""); // Limpa input

      // 🔄 Atualiza a viagem após entrada
      const response = await api.get(`/api/viagens/${dadosViagem.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDadosViagem(response.data);
      setUsuarioNaViagem(true);

      // ⏱️ Calcula tempo restante instantaneamente
      const entrada = response.data.dataEntrada?.[usuarioLogado]
        ? new Date(response.data.dataEntrada[usuarioLogado])
        : null;

      if (entrada) {
        const minutosDesdeEntrada = differenceInMinutes(new Date(), entrada);
        setTempoRestante(minutosDesdeEntrada < 60 ? 60 - minutosDesdeEntrada : 0);
      }


    } catch (error) {
      Alert.alert("Erro", error.response?.data || "Não foi possível entrar na viagem.");
    } finally {
      setIsLoading(false);
    }
  };


  const cancelarViagem = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem("token");

     await api.delete(`/api/viagens/${dadosViagem.id}/sair`, {
       headers: { Authorization: `Bearer ${token}` },
     });

      Alert.alert("Sucesso", "Você saiu da viagem!");
      setUsuarioNaViagem(false);
    } catch (error) {
      Alert.alert("Erro", error.response?.data || "Não foi possível sair da viagem.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.background}>
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>🚗 Detalhes da Viagem</Text>


            {/* Informações da Viagem */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📅 Data e Hora</Text>
              <Text style={styles.info}>
                <Ionicons name="time-outline" size={18} color="#1E4D92" />{" "}
                {dadosViagem.horario
                  ? format(new Date(dadosViagem.horario), "dd/MM/yyyy HH:mm", { locale: ptBR })
                  : "Horário não informado"}
              </Text>
              <Text style={styles.info}>
                <Ionicons name="location-outline" size={18} color="#1E4D92" />{" "}
                {dadosViagem.origem} ➡ {dadosViagem.destino}
              </Text>
            </View>

            {/* Passageiros */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👥 Passageiros e Pontos de Encontro</Text>
              <FlatList
                data={dadosViagem.passageiros}
                keyExtractor={(item) => item.email}
                renderItem={({ item }) => (
                  <View style={styles.passageiroContainer}>
                    {item.fotoUrl ? (
                      <Image source={{ uri: item.fotoUrl }} style={styles.fotoPassageiro} />
                    ) : (
                      <View style={styles.avatarFallback}>
                        <Text style={styles.avatarFallbackText}>{item.nome.charAt(0).toUpperCase()}</Text>
                      </View>
                    )}

                    <View style={{ flex: 1 }}>
                      <Text style={styles.nomePassageiro}>{item.nome}</Text>
                      <Text style={styles.pontoEncontroText}>
                        <Text style={styles.sectionTitle}>Ponto: </Text>
                        {item.pontoEncontro && item.pontoEncontro.trim() !== "" ? item.pontoEncontro : "Não informado"}
                      </Text>
                    </View>
                  </View>
                )}
              />

            </View>


             <Button
               mode="contained"
               onPress={() => navigation.navigate("Chat", { viagemId: viagem.id })}
               style={styles.button}
               icon={({ color, size }) => (
                 <Ionicons name="logo-whatsapp" size={size} color={color} />
               )}
             >
               Abrir Chat da Viagem
             </Button>



            {/* Contador de Tempo */}
            {usuarioNaViagem && tempoRestante !== null && (
              tempoRestante > 0 ? (
                <Text style={styles.tempoRestante}>
                  ⏳ Você pode cancelar esta viagem em até {tempoRestante} minutos.
                </Text>
              ) : (
                <Text style={styles.tempoExpirado}>❌ O prazo para cancelamento expirou.</Text>
              )
            )}
          </Card.Content>

          {/* Botões de ação */}
          <Card.Actions>
            {usuarioNaViagem && tempoRestante > 0 ? (
              <Button mode="contained" onPress={cancelarViagem}  style={[styles.button, { width: "100%", height: 60 }]}>
                Cancelar Viagem
              </Button>
            ) : !usuarioNaViagem && tipoUsuario !== "MOTORISTA" ? (
              <Button mode="contained" onPress={entrarNaViagem} style={[styles.button , { width: "100%", height: 60 }]}>
                Participar da Viagem
              </Button>
            ) : null}
          </Card.Actions>
        </Card>
      </ScrollView>

      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Informe seu ponto de encontro:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Posto BR, Centro"
              value={pontoEncontro}
              onChangeText={setPontoEncontro}
            />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Button
                mode="contained"
                style={[styles.button, { flex: 1 }]}
                onPress={confirmarParticipacao}
              >
                Confirmar
              </Button>
              <Button
                mode="outlined"
                style={[styles.button, { flex: 1, backgroundColor: "#ccc" }]}
                onPress={() => setModalVisible(false)}
              >
                Cancelar
              </Button>
            </View>
          </View>
        </View>
      </Modal>


    </View>
  );
}


const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    padding: 16,
  },
  container: {
    alignItems: "center",
    paddingBottom: 30,
  },
  card: {
    width: "100%",
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E4D92",
    textAlign: "center",
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E4D92",
    marginBottom: 8,
  },
  info: {
    fontSize: 16,
    color: "#444",
    marginBottom: 4,
    paddingLeft: 4,
  },
  tempoRestante: {
    fontSize: 15,
    color: "#FFA500",
    textAlign: "center",
    marginTop: 10,
  },
  tempoExpirado: {
    fontSize: 15,
    color: "#D9534F",
    textAlign: "center",
    marginTop: 10,
  },
  button: {
    backgroundColor: "#1E4D92",
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#FFF",
    padding: 24,
    borderRadius: 12,
    width: "85%",
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E4D92",
    marginBottom: 12,
    textAlign: "center",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#1E4D92",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  passageiroContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#F0F4FA",
    padding: 10,
    borderRadius: 8,
  },
  nomePassageiro: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E4D92",
  },
  pontoEncontroText: {
    fontSize: 14,
    color: "#555",
  },
  fotoPassageiro: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#1E4D92",
  },
  avatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1E4D92",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarFallbackText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
});
