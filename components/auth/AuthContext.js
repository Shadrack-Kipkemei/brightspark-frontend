"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getCurrentUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
} from "@/services/authService";

import {
  saveAuthData,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  clearAuthData,
} from "@/lib/authStorage";

const AuthContext = createContext(null);


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Restore authentication when the application starts.
   */
  useEffect(() => {
    restoreAuthentication();
  }, []);

  /**
   * Restore the user's authentication session.
   */
  const restoreAuthentication = async () => {
    try {
      const savedToken = getAccessToken();
      const savedUser = getStoredUser();

      // No saved token means the user is not logged in.
      if (!savedToken) {
        setLoading(false);
        return;
      }

      setToken(savedToken);
      setUser(savedUser);

      try {
        // Verify the access token with the Flask backend.
        const response = await getCurrentUser(savedToken);

        if (response?.user) {
          setUser(response.user);

          // Update the stored user information.
          const refreshToken = getRefreshToken();

          if (refreshToken) {
            saveAuthData({
              accessToken: savedToken,
              refreshToken,
              user: response.user,
            });
          }
        }
      } catch (error) {
        console.warn(
          "Access token verification failed:",
          error.message
        );

        // Try to refresh the access token.
        const savedRefreshToken = getRefreshToken();

        if (savedRefreshToken) {
          try {
            const refreshResponse =
              await refreshAccessToken(savedRefreshToken);

            if (refreshResponse?.access_token) {
              const refreshedUser =
                getStoredUser();

              setToken(
                refreshResponse.access_token
              );

              setUser(refreshedUser);

              saveAuthData({
                accessToken:
                  refreshResponse.access_token,
                refreshToken:
                  savedRefreshToken,
                user: refreshedUser,
              });
            } else {
              clearAuthentication();
            }
          } catch (refreshError) {
            console.warn(
              "Refresh token failed:",
              refreshError.message
            );

            clearAuthentication();
          }
        } else {
          clearAuthentication();
        }
      }
    } catch (error) {
      console.error(
        "Unable to restore authentication:",
        error
      );

      clearAuthentication();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login using the Flask backend.
   */
  const login = async (email, password) => {
    const response = await loginUser(
      email,
      password
    );

    saveAuthData({
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      user: response.user,
    });

    setToken(response.access_token);
    setUser(response.user);

    return response;
  };

  /**
   * Clear the current authentication session.
   */
  const clearAuthentication = () => {
    clearAuthData();

    setToken(null);
    setUser(null);
  };

  /**
   * Logout from the Flask backend and clear local authentication data.
   */
  const logout = async () => {
    const currentToken = getAccessToken();

    try {
      if (currentToken) {
        await logoutUser(currentToken);
      }
    } catch (error) {
      console.warn(
        "Backend logout request failed:",
        error.message
      );
    } finally {
      clearAuthentication();
    }
  };

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider"
    );
  }

  return context;
}