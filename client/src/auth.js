import { createToken, decodeToken, isTokenExpired } from "./jwt";

const USERS_KEY = "appUsers";
const TOKEN_KEY = "authToken";
const TOKEN_TTL_SECONDS = 24 * 60 * 60; // 1 day

export const ADMIN_USER = {
  username: "admin",
  password: "Admin@123#",
  role: "admin",
  allowedTags: "*",
};

export function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  window.dispatchEvent(new Event("users-updated"));
}

export function getAllUsers() {
  return [ADMIN_USER, ...loadUsers()];
}

export function findUser(username) {
  return getAllUsers().find((u) => u.username === username) || null;
}

export async function login(username, password) {
  const user = findUser(username);
  if (!user || user.password !== password) return null;

  const token = await createToken(
    { username: user.username, role: user.role, allowedTags: user.allowedTags },
    TOKEN_TTL_SECONDS
  );
  sessionStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event("auth-updated"));
  return decodeToken(token);
}

export function logout() {
  sessionStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event("auth-updated"));
}

export function getSession() {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  const payload = decodeToken(token);
  if (!payload || isTokenExpired(payload)) {
    sessionStorage.removeItem(TOKEN_KEY);
    return null;
  }
  return payload;
}

export function isTagAllowed(session, tagKey) {
  if (!session) return false;
  if (session.role === "admin" || session.allowedTags === "*") return true;
  return Array.isArray(session.allowedTags) && session.allowedTags.includes(tagKey);
}
