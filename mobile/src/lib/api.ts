// mobile/src/lib/api.ts
import { Platform } from "react-native";

const DEV_PORT = 3000;
const DEV_HOST = "192.168.1.126";

export const API_BASE =
  __DEV__
    ? Platform.select({
        ios: `http://localhost:${DEV_PORT}`,
        android: `http://${DEV_HOST}:${DEV_PORT}`,
        default: `http://${DEV_HOST}:${DEV_PORT}`
      })!
    : "https://api.example.com";

console.log("📡 API_BASE =", API_BASE);

export const Api = {
  health: `${API_BASE}/health`,
  photos: `${API_BASE}/photos`,
  profile: `${API_BASE}/profile`,
};


// Helpers simples
export async function postJSON<T>(url: string, body: any): Promise<T> {
  console.log("➡️ POST", url, body);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    console.log("⬅️ POST response", res.status);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    console.log("⬅️ POST data", data);
    return data;
  } catch (err) {
    console.error("❌ POST error", url, err);
    throw err;
  }
}

export async function getJSON<T>(url: string): Promise<T> {
  console.log("➡️ GET", url);
  try {
    const res = await fetch(url);
    console.log("⬅️ GET response", res.status);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    console.log("⬅️ GET data", data);
    return data;
  } catch (err) {
    console.error("❌ GET error", url, err);
    throw err;
  }
}
