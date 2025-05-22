import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";

// Importação das telas
import HomeScreen from "../screens/HomeScreen";
import CriarViagemScreen from "../screens/CriarViagemScreen";
import TripDetailsScreen from "../screens/TripDetailsScreen";
import ChatScreen from "../screens/ChatScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";

// Criando os navegadores
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 🚀 Navegação da TabBar (Navbar)
function BottomTabNavigator() {
  const navigation = useNavigation();

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token"); // Remove o token salvo
    await AsyncStorage.removeItem("tipoUsuario"); // Remove tipo de usuário
    navigation.replace("Login"); // Redireciona para login
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = "home-outline";
          } else if (route.name === "DetalhesViagem") {
            iconName = "car-outline";
          } else if (route.name === "Chat") {
            iconName = "chatbubble-outline";
          } else if (route.name === "Sair") {
            iconName = "log-out-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
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
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="DetalhesViagem" component={TripDetailsScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen
        name="Sair"
        component={() => null} // Não tem tela, apenas executa ação
        listeners={() => ({
          tabPress: (e) => {
            e.preventDefault(); // Impede navegação
            handleLogout(); // Chama função de logout
          },
        })}
      />
    </Tab.Navigator>
  );
}


// 🚀 Navegação principal que inclui Login e Tabs
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Criar Conta" }} />
        <Stack.Screen name="MainApp" component={BottomTabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="CriarViagem" component={CriarViagemScreen} options={{ title: "Criar Viagem" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
