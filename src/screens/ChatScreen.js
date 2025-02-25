import React, { useState } from "react";
import { View, TextInput, Button, FlatList, Text, StyleSheet } from "react-native";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

export default function ChatScreen() {
  const [mensagem, setMensagem] = useState("");
  const [mensagens, setMensagens] = useState([]);

  const enviarMensagem = () => {
    // Enviar mensagem pelo WebSocket
  };

  return (
    <View style={styles.container}>
      <FlatList data={mensagens} renderItem={({ item }) => <Text>{item}</Text>} />
      <TextInput value={mensagem} onChangeText={setMensagem} style={styles.input} />
      <Button title="Enviar" onPress={enviarMensagem} />
    </View>
  );
}
