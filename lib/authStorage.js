const ACCESS_TOKEN_KEY = "brightspark_access_token";
const REFRESH_TOKEN_KEY = "brightspark_refresh_token";
const USER_KEY = "brightspark_user";

export function saveAuthData({
  accessToken,
  refreshToken,
  user,
}) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    ACCESS_TOKEN_KEY,
    accessToken
  );

  localStorage.setItem(
    REFRESH_TOKEN_KEY,
    refreshToken
  );

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(user)
  );
}

export function getAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(
    ACCESS_TOKEN_KEY
  );
}

export function getRefreshToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(
    REFRESH_TOKEN_KEY
  );
}

export function getStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const user = localStorage.getItem(
    USER_KEY
  );

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

export function clearAuthData() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(
    ACCESS_TOKEN_KEY
  );

  localStorage.removeItem(
    REFRESH_TOKEN_KEY
  );

  localStorage.removeItem(
    USER_KEY
  );
}