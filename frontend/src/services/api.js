import { supabase } from "../lib/supabase";

const BASE_URL = "http://localhost:5000";

export async function apiRequest(path, options = {}) {
  let {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("User not logged in");
  }

  const now = Math.floor(Date.now() / 1000);

  if (session.expires_at < now) {
    console.log("🔄 Token expired, refreshing...");

    const { data } = await supabase.auth.refreshSession();

    if (!data?.session) {
      throw new Error("Session refresh failed");
    }

    session = data.session;
  }

  const token = session.access_token;

  console.log("TOKEN:", token);

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("API ERROR:", text);
    throw new Error(text || "API request failed");
  }

  return res.json();
}