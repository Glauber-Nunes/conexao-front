import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  Image,
  Modal,
  TouchableOpacity,
  TextInput,
} from "react-native";
import {
  Text,
  Card,
  Button,
  ActivityIndicator,
  FAB,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../services/api";

export default function HomeScreen() {
  const navigation = useNavigation();
  const [viagens, setViagens] = useState([]);
  const [viagensFiltradas, setViagensFiltradas] = useState([]);
  const [tipoUsuario, setTipoUsuario] = useState("");
  const [loading, setLoading] = useState(true);
  const [userInitial, setUserInitial] = useState("");
  const [userPhoto, setUserPhoto] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [searchText, setSearchText] = useState("");

  const carregarFotoUsuario = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const idUsuario = await AsyncStorage.getItem("idUsuario");

      if (!token || !idUsuario) {
        navigation.navigate("Login");
        return;
      }

      const response = await api.get(`/api/usuario/${idUsuario}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fotoUrlCompleta = response.data.fotoUrl;
      setUserPhoto(fotoUrlCompleta);
      await AsyncStorage.setItem("fotoUrl", fotoUrlCompleta);
    } catch (error) {
      console.log("Erro ao carregar foto do usuário");
    }
  };

  const carregarViagens = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const tipo = await AsyncStorage.getItem("tipoUsuario");
      const nomeUsuario = await AsyncStorage.getItem("nomeUsuario");

      if (!token || !tipo) {
        navigation.navigate("Login");
        return;
      }

      setTipoUsuario(tipo);
      if (nomeUsuario) setUserInitial(nomeUsuario.charAt(0).toUpperCase());

      const response = await api.get("/api/viagens/disponiveis", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const disponiveis = response.data.filter((v) => v.status === "DISPONIVEL");
      setViagens(disponiveis);
      setViagensFiltradas(disponiveis);
    } catch (error) {
      console.error("Erro ao buscar viagens:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtrarViagens = (texto) => {
    setSearchText(texto);
    const filtradas = viagens.filter((v) =>
      `${v.origem} ${v.destino}`.toLowerCase().includes(texto.toLowerCase())
    );
    setViagensFiltradas(filtradas);
  };

  const confirmarEncerramentoViagem = (id) => {
    Alert.alert("Encerrar Viagem", "Tem certeza?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Encerrar",
        onPress: () => encerrarViagem(id),
        style: "destructive",
      },
    ]);
  };

  const encerrarViagem = async (id) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await api.patch(`/viagens/${id}/encerrar`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert("Sucesso", "Viagem encerrada.");
      carregarViagens();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível encerrar a viagem.");
    }
  };

  useEffect(() => {
    carregarFotoUsuario();
    carregarViagens();
  }, []);

  return (
    <View style={styles.background}>
      <View style={styles.topBar}>
        <View style={styles.logoArea}>
          <Ionicons name="car-outline" size={28} color="#FFF" />
          <Text style={styles.logoText}>Conexão</Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            setSelectedPhoto(userPhoto);
            setModalVisible(true);
          }}
        >
          {userPhoto ? (
            <Image source={{ uri: userPhoto }} style={styles.userPhoto} />
          ) : (
            <View style={styles.userIcon}>
              <Text style={styles.userInitial}>{userInitial}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por origem ou destino"
        value={searchText}
        onChangeText={filtrarViagens}
      />

      <Text style={styles.title}>🚗 Viagens Disponíveis</Text>

      {loading ? (
        <ActivityIndicator animating={true} size="large" color="#1E4D92" style={styles.loading} />
      ) : viagensFiltradas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhuma viagem encontrada.</Text>
        </View>
      ) : (
        <FlatList
          data={viagensFiltradas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  {item.motoristaFotoUrl ? (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedPhoto(item.motoristaFotoUrl);
                        setModalVisible(true);
                      }}
                    >
                      <Image source={{ uri: item.motoristaFotoUrl }} style={styles.userPhoto} />
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.userIcon}>
                      <Text style={styles.userInitial}>{item.motoristaNome?.charAt(0)}</Text>
                    </View>
                  )}
                  <Text style={styles.motoristaNome}>{item.motoristaNome}</Text>
                </View>

                <Text style={styles.info}><Ionicons name="time-outline" size={18} /> Horário: {format(new Date(item.horario), "dd/MM/yyyy HH:mm", { locale: ptBR })}</Text>
                <Text style={styles.info}><Ionicons name="location-outline" size={18} /> Rota: {item.origem} ➡ {item.destino}</Text>
                <Text style={styles.info}><Ionicons name="wallet-outline" size={18} /> Preço: R$ {item.preco.toFixed(2)}</Text>
                <Text style={styles.info}><Ionicons name="people-outline" size={18} /> Vagas: {item.qtdVagas}</Text>
              </Card.Content>
              <Card.Actions style={styles.buttonContainer}>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate("DetalhesViagem", { viagem: item })}
                  style={styles.button}
                  labelStyle={styles.buttonText}
                >
                  Ver Viagem
                </Button>
                {tipoUsuario === "MOTORISTA" && (
                  <Button
                    mode="contained"
                    onPress={() => confirmarEncerramentoViagem(item.id)}
                    style={[styles.button, styles.buttonEncerrar]}
                    labelStyle={styles.buttonText}
                  >
                    Encerrar
                  </Button>
                )}
              </Card.Actions>
            </Card>
          )}
        />
      )}

      {tipoUsuario === "MOTORISTA" && (
        <FAB
          icon="plus"
          style={styles.fab}
          color="#FFF"
          onPress={() => navigation.navigate("CriarViagem")}
        />
      )}

      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalBackground}
            onPress={() => {
              setModalVisible(false);
              setSelectedPhoto(null);
            }}
          >
            {selectedPhoto && (
              <Image source={{ uri: selectedPhoto }} style={styles.modalImage} />
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "#F7F9FC", paddingHorizontal: 16 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1E4D92",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  logoArea: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoText: { color: "#FFF", fontSize: 20, fontWeight: "bold" },
  searchInput: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  userPhoto: { width: 42, height: 42, borderRadius: 21, borderWidth: 2, borderColor: "#FFF" },
  userIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center" },
  userInitial: { color: "#1E4D92", fontSize: 18, fontWeight: "bold" },
  title: { fontSize: 22, fontWeight: "bold", color: "#1E4D92", textAlign: "center", marginVertical: 10 },
  card: { backgroundColor: "#FFF", borderRadius: 14, padding: 16, marginBottom: 15, elevation: 2 },
  motoristaNome: { fontSize: 16, fontWeight: "bold", marginLeft: 10, color: "#1E4D92" },
  info: { fontSize: 15, color: "#333", marginBottom: 6 },
  button: { backgroundColor: "#1E4D92", borderRadius: 8, paddingVertical: 8, marginBottom: 5 },
  buttonEncerrar: { backgroundColor: "#D9534F" },
  buttonText: { color: "#FFF", fontSize: 14 },
  buttonContainer: { flexDirection: "column", gap: 10, marginTop: 10 },
  fab: { position: "absolute", bottom: 24, right: 24, backgroundColor: "#1E4D92" },
  loading: { marginTop: 40 },
  emptyContainer: { marginTop: 50, alignItems: "center" },
  emptyText: { fontSize: 16, color: "#999" },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.7)" },
  modalImage: { width: 320, height: 320, borderRadius: 12, borderWidth: 2, borderColor: "#FFF" },
});