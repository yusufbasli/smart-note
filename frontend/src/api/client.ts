import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

// Use env override when provided. Fallback keeps local Docker/manual setup working.
export const BASE_URL = envBaseUrl && envBaseUrl.length > 0
  ? envBaseUrl
  : "http://localhost:8000/api/v1";

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
