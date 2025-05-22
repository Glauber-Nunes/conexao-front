import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { Text, TextInput, Button, RadioButton } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, setAuthToken } from "../services/api";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

export default function RegisterScreen() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState("PASSAGEIRO"); // Default PASSAGEIRO
  const [foto, setFoto] = useState(null);
  const navigation = useNavigation();

  /** 📸 ABRIR GALERIA PARA ESCOLHER IMAGEM **/
  const escolherImagem = async () => {
    let resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!resultado.canceled) {
      setFoto(resultado.assets[0].uri);
    }
  };

  /** 📤 ENVIAR DADOS DO FORMULÁRIO **/
  const handleRegister = async () => {
    try {
      const formData = new FormData();

      // Adiciona cada campo separadamente
      formData.append("nome", nome);
      formData.append("email", email);
      formData.append("telefone", telefone);
      formData.append("senha", senha);
      formData.append("tipo", tipoUsuario);

      // Envia a foto se foi selecionada
      if (foto) {
        const fotoExtensao = foto.split(".").pop();
        formData.append("foto", {
          uri: foto,
          type: `image/${fotoExtensao}`,
          name: `foto.${fotoExtensao}`,
        });
      }

      const response = await api.post("/api/auth/cadastrar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Resposta da API:", response.data);

      const token = response.data.token;
      const tipo = response.data.tipoUsuario;

      if (!token || !tipo) {
        alert("Erro ao cadastrar. Tente novamente!");
        return;
      }

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("tipoUsuario", tipo);
      await AsyncStorage.setItem("fotoUrl", response.data.fotoUrl); // Armazena a URL da foto

      setAuthToken(token);
      navigation.navigate("MainApp");
    } catch (error) {
      //console.error("Erro ao cadastrar:", error.response?.data || error.message);
      alert(error.response?.data || error.message);
    }
  };

  return (
    <View style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>Criar Conta</Text>

    {/* Upload de Foto */}
    <TouchableOpacity onPress={escolherImagem} style={styles.fotoContainer}>
      {foto ? (
        <Image source={{ uri: foto }} style={styles.fotoPreview} />
      ) : (
        <View style={styles.botaoFoto}>
          <Ionicons name="camera-outline" size={50} color="#1E4D92" />
          <Text style={styles.textoBotaoFoto}>Adicionar Foto</Text>
        </View>
      )}
    </TouchableOpacity>




        {/* Inputs de Cadastro */}
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={22} color="#1E4D92" style={styles.icon} />
          <TextInput label="Nome" value={nome} onChangeText={setNome} style={styles.input} />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={22} color="#1E4D92" style={styles.icon} />
          <TextInput label="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" style={styles.input} />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={22} color="#1E4D92" style={styles.icon} />
          <TextInput label="Telefone" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" style={styles.input} />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={22} color="#1E4D92" style={styles.icon} />
          <TextInput label="Senha" value={senha} onChangeText={setSenha} secureTextEntry style={styles.input} />
        </View>

        {/* Escolha do tipo de usuário */}
        <Text style={styles.label}>Tipo de Usuário</Text>
        <RadioButton.Group onValueChange={setTipoUsuario} value={tipoUsuario}>
          <View style={styles.radioContainer}>
            <TouchableOpacity
              style={[styles.radioButton, tipoUsuario === "PASSAGEIRO" ? styles.radioButtonSelected : null]}
              onPress={() => setTipoUsuario("PASSAGEIRO")}
            >
              <Ionicons name="person-outline" size={20} color={tipoUsuario === "PASSAGEIRO" ? "#FFF" : "#1E4D92"} />
              <Text style={[styles.radioText, tipoUsuario === "PASSAGEIRO" ? styles.radioTextSelected : null]}>Passageiro</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.radioButton, tipoUsuario === "MOTORISTA" ? styles.radioButtonSelected : null]}
              onPress={() => setTipoUsuario("MOTORISTA")}
            >
              <Ionicons name="car-outline" size={20} color={tipoUsuario === "MOTORISTA" ? "#FFF" : "#1E4D92"} />
              <Text style={[styles.radioText, tipoUsuario === "MOTORISTA" ? styles.radioTextSelected : null]}>Motorista</Text>
            </TouchableOpacity>
          </View>
        </RadioButton.Group>

        {/* Botão de Cadastro */}
        <TouchableOpacity onPress={handleRegister} style={styles.button}>
          <Text style={styles.buttonText}>Cadastrar</Text>
        </TouchableOpacity>

        {/* Link para Login */}
        <Button mode="text" onPress={() => navigation.navigate("Login")} labelStyle={styles.loginLink}>
          Já tem uma conta? Faça login
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F9FC", // Azul clarinho moderno
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
    elevation: 5, // Sombra para Android
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
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E4D92",
    marginVertical: 10,
  },
  radioContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#1E4D92",
  },
  radioButtonSelected: {
    backgroundColor: "#1E4D92",
  },
  radioText: {
    marginLeft: 8,
    color: "#1E4D92",
  },
  radioTextSelected: {
    color: "#FFF",
  },
  button: {
    backgroundColor: "#1E4D92",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginLink: {
    color: "#1E4D92",
    fontSize: 16,
    marginTop: 15,
  },

    fotoContainer: { alignItems: "center", marginBottom: 15 },
    botaoFoto: {
      alignItems: "center",
      justifyContent: "center",
      width: 120,
      height: 120,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "#1E4D92",
      backgroundColor: "#E6ECF2",
      padding: 10,
    },

    textoBotaoFoto: {
      marginTop: 6,
      fontSize: 13,
      color: "#1E4D92",
      fontWeight: "bold",
    },

    fotoPreview: {
      width: 120,
      height: 120,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: "#1E4D92",
    },



});
