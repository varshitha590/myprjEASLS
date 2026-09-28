import {jwtDecode} from "jwt-decode";

const TOKEN_KEY = "els_token";

export function login(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getUser() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  return jwtDecode(token);
}

export function isAuthenticated() {
  return !!localStorage.getItem(TOKEN_KEY);
}
