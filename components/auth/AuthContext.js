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

  /*
   * Clear all authentication information
   * from both React state and localStorage.
   */
  const clearAuthentication = () => {
    clearAuthData();
    setToken(null);
    setUser(null);
  };

  /*
   * Restore the user's authentication when
   * the application is opened/refreshed.
   */
  const restoreAuthentication = async () => {
    const savedAccessToken = getAccessToken();
    const savedRefreshToken = getRefreshToken();
    const savedUser = getStoredUser();

    /*
     * No access token means the user is not logged in.
     */
    if (!savedAccessToken) {
      setLoading(false);
      return;
    }

    /*
     * Immediately restore the saved values while
     * we verify the access token with the backend.
     */
    setToken(savedAccessToken);
    setUser(savedUser);

    /*
     * First try the existing access token.
     */
    try {
      const response = await getCurrentUser(savedAccessToken);

      if (response?.user) {
        setUser(response.user);

        /*
         * Keep localStorage synchronized with the
         * latest user information from the backend.
         */
        if (savedRefreshToken) {
          saveAuthData({
            accessToken: savedAccessToken,
            refreshToken: savedRefreshToken,
            user: response.user,
          });
        }

        setLoading(false);
        return;
      }
    } catch (error) {
      console.warn(
        "Access token verification failed:",
        error.message
      );
    }

    /*
     * If the access token has expired, use the
     * refresh token to obtain a new access token.
     */
    if (!savedRefreshToken) {
      clearAuthentication();
      setLoading(false);
      return;
    }

    try {
      const refreshResponse =
        await refreshAccessToken(savedRefreshToken);

      /*
       * The backend returns:
       *
       * {
       *   access_token: "..."
       * }
       */
      const newAccessToken =
        refreshResponse?.access_token;

      if (!newAccessToken) {
        throw new Error(
          "Refresh response did not contain an access token."
        );
      }

      /*
       * Verify the new access token and retrieve
       * the current user.
       */
      const userResponse =
        await getCurrentUser(newAccessToken);

      if (!userResponse?.user) {
        throw new Error(
          "Unable to retrieve the authenticated user."
        );
      }

      saveAuthData({
        accessToken: newAccessToken,
        refreshToken: savedRefreshToken,
        user: userResponse.user,
      });

      setToken(newAccessToken);
      setUser(userResponse.user);
    } catch (error) {
      console.warn(
        "Refresh token failed:",
        error.message
      );

      clearAuthentication();
    } finally {
      setLoading(false);
    }
  };

  /*
   * Restore authentication when the provider loads.
   */
  useEffect(() => {
    restoreAuthentication();
  }, []);

  /*
   * Login user.
   */
  const login = async (email, password) => {
    const response = await loginUser(
      email,
      password
    );

    /*
     * IMPORTANT:
     *
     * The backend returns tokens inside:
     *
     * response.tokens.access_token
     * response.tokens.refresh_token
     */
    const accessToken =
      response?.tokens?.access_token;

    const refreshToken =
      response?.tokens?.refresh_token;

    const authenticatedUser =
      response?.user;

    if (!accessToken) {
      throw new Error(
        "Login succeeded but no access token was returned."
      );
    }

    if (!refreshToken) {
      throw new Error(
        "Login succeeded but no refresh token was returned."
      );
    }

    if (!authenticatedUser) {
      throw new Error(
        "Login succeeded but no user information was returned."
      );
    }

    /*
     * Save the correct tokens and user information.
     */
    saveAuthData({
      accessToken,
      refreshToken,
      user: authenticatedUser,
    });

    /*
     * Update React state immediately.
     */
    setToken(accessToken);
    setUser(authenticatedUser);

    return {
      ...response,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  };

  /*
   * Logout user.
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

  const isAuthenticated =
    Boolean(token && user);

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