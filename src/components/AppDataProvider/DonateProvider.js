import { useEffect } from "react";
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { Platform } from "react-native";

export default function RevenueCatProvider({ children }) {
  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    const iosApiKey = 'test_kUiKMPkXXElDEIbxjyWphWVYDiz';
    const androidApiKey = 'test_kUiKMPkXXElDEIbxjyWphWVYDiz';

    if (Platform.OS === 'ios') {
        Purchases.configure({apiKey: iosApiKey});
    } else if (Platform.OS === 'android') {
        Purchases.configure({apiKey: androidApiKey});
    }
  }, []);

  return children;
}