import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Button, Text, Avatar, Appbar } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client";
import { api } from "../services/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";

export default function ChatScreen({ route, navigation }) {
  const { viagemId } = route.params;
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [socket, setSocket] = useState(null);
  const [usuarioLogado, setUsuarioLogado] = useState("");

  useEffect(() => {
    const carregarUsuario = async () => {
      const email = await AsyncStorage.getItem("email");
      setUsuarioLogado(email);
    };

    carregarUsuario();

    // Conectar ao WebSocket
    const newSocket = io("http://192.168.3.4:8080/conexao/ws-chat");
    setSocket(newSocket);

    newSocket.on(`/api/chat/${viagemId}`, (mensagem) => {
      setMensagens((prevMensagens) => [...prevMensagens, mensagem]);
    });

    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    const carregarMensagens = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const response = await api.get(`/api/chat/${viagemId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMensagens(response.data);
      } catch (error) {
        console.error("Erro ao buscar mensagens:", error.response?.data || error.message);
      }
    };

    carregarMensagens();
  }, [viagemId]);

  const enviarMensagem = async () => {
    if (novaMensagem.trim() === "") return;

    try {
      const token = await AsyncStorage.getItem("token");

      const novaMensagemObj = {
        usuario: { email: usuarioLogado, nome: "Você" },
        mensagem: novaMensagem,
        timestamp: new Date().toISOString(),
      };

      setMensagens((prevMensagens) => [...prevMensagens, novaMensagemObj]);

      await api.post(
        "/api/chat/enviar",
        {
          viagem: { id: viagemId },
          mensagem: novaMensagem,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNovaMensagem("");
    } catch (error) {
      console.error("Erro ao salvar mensagem:", error.response?.data || error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* 🔹 Barra de navegação com botão de voltar */}
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Chat da Viagem" />
      </Appbar.Header>

      <FlatList
        data={mensagens}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => {
          const mensagemDoUsuario = item.usuario.email === usuarioLogado;
          return (
            <View
              style={[
                styles.mensagemContainer,
                mensagemDoUsuario ? styles.mensagemEnviada : styles.mensagemRecebida,
              ]}
            >
              {/* Ícone do usuário apenas para mensagens recebidas */}
              {!mensagemDoUsuario && (
                <Avatar.Icon size={40} icon="account-circle" style={styles.avatar} />
              )}

              <View style={styles.mensagemTextoContainer}>
                {/* Nome do usuário apenas para mensagens recebidas */}
                {!mensagemDoUsuario && (
                  <Text style={styles.nomeUsuario}>{item.usuario.nome}</Text>
                )}

                {/* 📢 Verifica se é um áudio ou texto */}
                <Text style={styles.textoMensagem}>{item.mensagem}</Text>

                {/* Data */}
                <Text style={styles.dataMensagem}>
                  {format(new Date(item.timestamp), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </Text>
              </View>
            </View>
          );
        }}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Digite sua mensagem..."
          value={novaMensagem}
          onChangeText={setNovaMensagem}
        />
        <Button mode="contained" onPress={enviarMensagem} style={styles.botaoEnviar}>
          Enviar
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9FC" },

  header: {
    backgroundColor: "#1E4D92",
    height: 30,
  },

  mensagemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    maxWidth: "80%",
    padding: 10,
    borderRadius: 12,
  },
  mensagemEnviada: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
    borderBottomRightRadius: 0,
  },
  mensagemRecebida: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF",
    borderBottomLeftRadius: 0,
  },

  avatar: {
    marginRight: 10,
    backgroundColor: "#1E4D92",
  },

  mensagemTextoContainer: {
    maxWidth: "85%",
  },

  nomeUsuario: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#1E4D92",
  },
  textoMensagem: {
    fontSize: 16,
    color: "#333",
    marginTop: 2,
  },
  dataMensagem: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
    alignSelf: "flex-end",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#FFF",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#1E4D92",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#FFF",
    marginRight: 10,
  },
  botaoEnviar: {
    backgroundColor: "#1E4D92",
  },
});
