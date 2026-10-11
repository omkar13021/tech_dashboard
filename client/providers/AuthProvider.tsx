"use client";

import { useEffect, useState, useCallback } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { validateUser } from "@/store/slices/authSlice";
import { setAccessToken, getAccessToken } from "@/lib/axios";
import Cookies from "js-cookie";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  const initAuth = useCallback(async () => {
    // Skip if already initialized
    if (isInitialized) return;
    
    // Don't run auth initialization on auth pages
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/auth/")) {
      setIsInitialized(true);
      return;
    }
    
    const refreshToken = Cookies.get("refreshToken");
    const currentAccessToken = getAccessToken();

    // If we have a refresh token but no access token, refresh the session
    if (refreshToken && !currentAccessToken) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (response.ok) {
          const data = await response.json();
          
          // Set the new access token
          setAccessToken(data.accessToken);
          
          // Update refresh token cookie
          Cookies.set("refreshToken", data.refreshToken, {
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            expires: 7,
          });
          
          // Validate user to get full user data including role
          await store.dispatch(validateUser()).unwrap();
        } else {
          // Token refresh failed, clear tokens
          Cookies.remove("refreshToken");
          setAccessToken(null);
        }
      } catch (error) {
        console.error("Failed to restore session:", error);
        // Clear tokens on error
        Cookies.remove("refreshToken");
        setAccessToken(null);
      }
    } else if (refreshToken && currentAccessToken) {
      // If we have both tokens, validate the user
      try {
        await store.dispatch(validateUser()).unwrap();
      } catch (error) {
        console.error("Failed to validate user:", error);
      }
    }
    
    setIsInitialized(true);
  }, [isInitialized]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Show nothing until initialized to prevent flash
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
