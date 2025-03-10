import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import CriarViagemScreen from "../screens/CriarViagemScreen"; // Adicione isso

import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen"
import TripDetailsScreen from "../screens/TripDetailsScreen"

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CriarViagem" component={CriarViagemScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Criar Conta" }} />

        <Stack.Screen name="DetalhesViagem" component={TripDetailsScreen} options={{ title: "DetalhesViagem" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
