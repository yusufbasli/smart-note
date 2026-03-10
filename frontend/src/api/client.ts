import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Change to your machine's local IP when testing on a physical device
export const BASE_URL = "http://localhost:8000/api/v1";

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

// ── Attach JWT to every request ──────────────────────────────────────────────
client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
