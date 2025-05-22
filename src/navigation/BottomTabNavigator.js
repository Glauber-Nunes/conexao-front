import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Importação das telas
import HomeScreen from "../screens/HomeScreen";
import TripDetailsScreen from "../screens/TripDetailsScreen";
import ChatScreen from "../screens/ChatScreen";

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const [tipoUsuario, setTipoUsuario] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserType = async () => {
      try {
          const tipo = await AsyncStorage.getItem("tipoUsuario");
        console.log("Tipo de usuário recuperado:", tipo);
        setTipoUsuario(tipo); // 🔹 Atualiza o estado com o tipo de usuário
      } catch (error) {
        console.error("Erro ao recuperar tipo de usuário:", error);
      } finally {
        setLoading(false); // 🔹 Finaliza o carregamento
      }
    };

    fetchUserType();
  }, []);

  // 🔹 Enquanto os dados não carregam, evita exibir tabs incorretas
  if (loading) {
    return null; // Pode exibir um <ActivityIndicator /> se quiser
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        return {
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === "Home") {
              iconName = "home-outline";
            } else if (route.name === "DetalhesViagem") {
              iconName = "car-outline";
            } else if (route.name === "Chat") {
              iconName = "chatbubble-outline";
            }

            return iconName ? <Ionicons name={iconName} size={size} color={color} /> : null;
          },
          tabBarActiveTintColor: "#1E4D92",
          tabBarInactiveTintColor: "gray",
          tabBarStyle: {
            backgroundColor: "#fff",
            borderTopWidth: 1,
            borderTopColor: "#ddd",
            height: 60,
            paddingBottom: 5,
          },
        };
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="DetalhesViagem" component={TripDetailsScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
    </Tab.Navigator>
  );
}
