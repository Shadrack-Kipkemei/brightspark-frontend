import apiRequest from "../lib/apiClient";

export async function loginUser(
  email,
  password
) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: {
      email,
      password,
    },
  });
}

export async function getCurrentUser(
  token
) {
  return apiRequest("/auth/me", {
    token,
  });
}

export async function refreshAccessToken(
  refreshToken
) {
  return apiRequest("/auth/refresh", {
    method: "POST",
    token: refreshToken,
  });
}

export async function logoutUser(
  token
) {
  return apiRequest("/auth/logout", {
    method: "POST",
    token,
  });
}