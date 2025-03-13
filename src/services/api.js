import axios from "axios";

const API_URL = "http://192.168.3.4:8080/conexao/api"; // Substitua pelo IP correto do backend

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// 🔹 Função para definir o token JWT no cabeçalho das requisições
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};
