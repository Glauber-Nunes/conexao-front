import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { api } from "../services/api";
import { Ionicons } from "@expo/vector-icons";
import { jwtDecode } from "jwt-decode";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigation = useNavigation();

 const handleLogin = async () => {
   try {
     const response = await api.post("/api/auth/login", { email, senha });
     const { token, tipoUsuario } = response.data;

     if (!token || !tipoUsuario) {
       throw new Error("Erro ao receber os dados do login.");
     }

     console.log("🔹 Token recebido:", token);

     // 🔹 Decodificar token JWT
     let nomeUsuario = "Usuário";
     let emailUsuario = email;
     let idUsuario = null;
     let fotoUsuario = null;

     try {
       const decodedToken = jwtDecode(token);
       console.log("🔹 Token decodificado:", decodedToken);

       if (decodedToken.nome) nomeUsuario = decodedToken.nome;
       if (decodedToken.sub) emailUsuario = decodedToken.sub; // Normalmente o email vem no 'sub'
       if (decodedToken.id) idUsuario = decodedToken.id; // Captura o ID do usuário
       if (decodedToken.fotoUrl) fotoUsuario = decodedToken.fotoUrl; // Captura a URL da foto
     } catch (decodeError) {
       console.error("❌ Erro ao decodificar token:", decodeError.message);
     }

     console.log("🔹 Nome extraído do token:", nomeUsuario);
     console.log("🔹 Email extraído do token:", emailUsuario);
     console.log("🔹 ID extraído do token:", idUsuario);
     console.log("🔹 Foto extraída do token:", fotoUsuario);

     // 🔹 Salvar no AsyncStorage
     await AsyncStorage.setItem("token", token);
     await AsyncStorage.setItem("tipoUsuario", tipoUsuario);
     await AsyncStorage.setItem("nomeUsuario", nomeUsuario);
     await AsyncStorage.setItem("email", emailUsuario);
     if (idUsuario) await AsyncStorage.setItem("idUsuario", idUsuario.toString());
     if (fotoUsuario) await AsyncStorage.setItem("fotoUrl", fotoUsuario);

     // 🔹 Verificar se foi salvo corretamente
     const fotoSalva = await AsyncStorage.getItem("fotoUrl");
     console.log("✅ Foto salva no AsyncStorage:", fotoSalva);

     navigation.reset({
       index: 0,
       routes: [{ name: "MainApp" }],
     });
   } catch (error) {
     alert("Falha no login. Verifique suas credenciais.");
   }
 };


  return (
    <View style={styles.background}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* Logotipo */}
        <View style={styles.logoContainer}>
          <Ionicons name="car-outline" size={48} color="#1E4D92" />
          <Text style={styles.logoText}>Conexão</Text>
        </View>

        <Text style={styles.title}>Acesse sua conta</Text>

        {/* Inputs */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={22} color="#1E4D92" style={styles.icon} />
          <TextInput
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            mode="flat"
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            theme={{ colors: { primary: "#1E4D92", background: "transparent" } }}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={22} color="#1E4D92" style={styles.icon} />
          <TextInput
            label="Senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            style={styles.input}
            mode="flat"
            textContentType="password"
            theme={{ colors: { primary: "#1E4D92", background: "transparent" } }}
          />
        </View>

        {/* Botão "Esqueci minha senha" */}
        <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
          <Text style={styles.forgotPassword}>Esqueci minha senha</Text>
        </TouchableOpacity>

        {/* Botão de Login */}
        <TouchableOpacity onPress={handleLogin} style={styles.button}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        {/* Link para cadastro */}
        <Button
          mode="text"
          onPress={() => navigation.navigate("Register")}
          labelStyle={styles.registerLink}
        >
          Criar uma conta
        </Button>
      </KeyboardAvoidingView>
    </View>
  );
}


const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F9FC", // Azul claro moderno
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
    elevation: 5, // Efeito de sombra no Android
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E4D92",
    marginLeft: 10,
  },
  title: {
    fontSize: 22,
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
  forgotPassword: {
    alignSelf: "flex-end",
    color: "#1E4D92",
    fontSize: 14,
    marginBottom: 10,
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
  registerLink: {
    color: "#1E4D92",
    fontSize: 16,
    marginTop: 15,
  },
});
