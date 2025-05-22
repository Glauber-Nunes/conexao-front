import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Text, TextInput, RadioButton } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { api } from "../services/api";
import { Ionicons } from "@expo/vector-icons";

export default function CriarViagemScreen({ navigation }) {
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [horario, setHorario] = useState(null);
  const [preco, setPreco] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("PIX");
  const [detalhes, setDetalhes] = useState("");
  const [carro, setCarro] = useState("");
  const [qtdVagas, setQtdVagas] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleCreateTrip = async () => {
    if (!origem || !destino || !preco || !carro || !qtdVagas || !horario) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios!");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const motoristaEmail = await AsyncStorage.getItem("email");

      console.log("🔹 Token recuperado:", token);
      console.log("🔹 Motorista Email:", motoristaEmail);

      if (!token || !motoristaEmail) {
        Alert.alert("Erro", "Você precisa estar logado para cadastrar uma viagem.");
        return;
      }

      const viagemData = {
        origem,
        destino,
        horario: horario.toISOString(),
        preco: parseFloat(preco),
        formaPagamento,
        detalhes,
        carro,
        qtdVagas: parseInt(qtdVagas, 10),
        motoristaEmail,
        status: "DISPONIVEL",
        observacaoDinheiro: formaPagamento === "Dinheiro" ? "Em Especie está trocado" : null,
      };

      console.log("📦 Dados da viagem a serem enviados:", viagemData);

      const response = await api.post("/api/viagens/cadastrar", viagemData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ Resposta da API:", response.data);

      Alert.alert("Sucesso", "Viagem cadastrada com sucesso!");
      navigation.navigate("MainApp");
    } catch (error) {
      console.error("❌ Erro ao cadastrar viagem:", error.response?.data || error.message);
      Alert.alert("Erro", `Falha ao cadastrar viagem: ${error.response?.data || "Erro desconhecido"}`);
    }
  };


  return (
    <View style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>Criar Nova Viagem</Text>

        {/* Origem */}
        <View style={styles.inputContainer}>
          <Ionicons name="location-outline" size={22} color="#1E4D92" style={styles.icon} />
          <TextInput
            label="Origem"
            value={origem}
            onChangeText={setOrigem}
            style={styles.input}
            mode="flat"
            theme={{ colors: { primary: "#1E4D92", background: "transparent" } }}
          />
        </View>

        {/* Destino */}
        <View style={styles.inputContainer}>
          <Ionicons name="flag-outline" size={22} color="#1E4D92" style={styles.icon} />
          <TextInput
            label="Destino"
            value={destino}
            onChangeText={setDestino}
            style={styles.input}
            mode="flat"
            theme={{ colors: { primary: "#1E4D92", background: "transparent" } }}
          />
        </View>

        {/* Data e Hora */}
        <TouchableOpacity style={styles.dateTimePickerContainer} onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar-outline" size={22} color="#1E4D92" style={styles.icon} />
          <Text style={styles.dateTimeText}>
            {horario ? horario.toLocaleString() : "Inserir Data/Hora"}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={horario || new Date()}
            mode="datetime"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setHorario(selectedDate);
            }}
          />
        )}

        {/* Preço */}
        <View style={styles.inputContainer}>
          <Ionicons name="cash-outline" size={22} color="#1E4D92" style={styles.icon} />
          <TextInput
            label="Preço"
            value={preco}
            onChangeText={setPreco}
            style={styles.input}
            mode="flat"
            keyboardType="numeric"
            theme={{ colors: { primary: "#1E4D92", background: "transparent" } }}
          />
        </View>

        {/* Forma de Pagamento */}
        <Text style={styles.label}>Forma de Pagamento</Text>
        <RadioButton.Group onValueChange={setFormaPagamento} value={formaPagamento}>
          <View style={styles.radioContainer}>
            <TouchableOpacity
              style={[styles.radioButton, formaPagamento === "PIX" && styles.radioButtonSelected]}
              onPress={() => setFormaPagamento("PIX")}
            >
              <Ionicons name="qr-code-outline" size={20} color={formaPagamento === "PIX" ? "#FFF" : "#1E4D92"} />
              <Text style={[styles.radioText, formaPagamento === "PIX" && styles.radioTextSelected]}>
                PIX
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.radioButton, formaPagamento === "Dinheiro" && styles.radioButtonSelected]}
              onPress={() => setFormaPagamento("Dinheiro")}
            >
              <Ionicons name="cash-outline" size={20} color={formaPagamento === "Dinheiro" ? "#FFF" : "#1E4D92"} />
              <Text style={[styles.radioText, formaPagamento === "Dinheiro" && styles.radioTextSelected]}>
                Dinheiro
              </Text>
            </TouchableOpacity>
          </View>
        </RadioButton.Group>

        {/* Carro */}
        <View style={styles.inputContainer}>
          <Ionicons name="car-outline" size={22} color="#1E4D92" style={styles.icon} />
          <TextInput
            label="Carro"
            value={carro}
            onChangeText={setCarro}
            style={styles.input}
            mode="flat"
            theme={{ colors: { primary: "#1E4D92", background: "transparent" } }}
          />
        </View>

        {/* Vagas Disponíveis */}
        <View style={styles.inputContainer}>
          <Ionicons name="people-outline" size={22} color="#1E4D92" style={styles.icon} />
          <TextInput
            label="Vagas Disponíveis"
            value={qtdVagas}
            onChangeText={setQtdVagas}
            style={styles.input}
            mode="flat"
            keyboardType="numeric"
            theme={{ colors: { primary: "#1E4D92", background: "transparent" } }}
          />
        </View>

        {/* Botão de Cadastrar */}
        <TouchableOpacity onPress={handleCreateTrip} style={styles.button}>
          <Text style={styles.buttonText}>Cadastrar Viagem</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F9FC",
  },
  container: {
    width: "90%",
    backgroundColor: "#FFF",
    padding: 24,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1E4D92",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6ECF2",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1E4D92",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "transparent",
  },
  dateTimePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1E4D92",
    marginBottom: 20,
  },
  dateTimeText: {
    marginLeft: 10,
    color: "#1E4D92",
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    color: "#1E4D92",
    marginBottom: 8,
  },
  radioContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#1E4D92",
    borderRadius: 10,
    marginRight: 10,
  },
  radioButtonSelected: {
    backgroundColor: "#1E4D92",
  },
  radioText: {
    marginLeft: 5,
    color: "#1E4D92",
    fontSize: 16,
  },
  radioTextSelected: {
    color: "#FFF",
  },
  button: {
    backgroundColor: "#1E4D92",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
