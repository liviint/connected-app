import React, { useEffect } from "react";
import Purchases from "react-native-purchases";

export default function RevenueCatProvider({ children }) {
  useEffect(() => {
    // Use your RevenueCat API key (Google Play / App Store)
    Purchases.configure({
      apiKey:  "test_kUiKMPkXXElDEIbxjyWphWVYDiz",
    });
  }, []);

  return children;
}