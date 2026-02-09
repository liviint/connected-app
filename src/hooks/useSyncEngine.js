import { useEffect, useRef } from "react";
import NetInfo from "@react-native-community/netinfo";
import { AppState } from "react-native";

export function useSyncEngine({
  enabled,
  name,
  bootstrap,
  debounceMs = 5000,
}) {
  const syncing = useRef(false);
  const lastSyncTime = useRef(0);
  const appState = useRef(AppState.currentState);

  const safeBootstrap = async (reason) => {
    if (!enabled || syncing.current) return;

    const now = Date.now();
    if (now - lastSyncTime.current < debounceMs) return;

    syncing.current = true;
    lastSyncTime.current = now;

    try {
      console.log(`🔄 [${name}] Sync started (${reason})`);
      await bootstrap();
      console.log(`✅ [${name}] Sync completed`);
    } catch (e) {
      console.error(`❌ [${name}] Sync error`, e);
    } finally {
      syncing.current = false;
    }
  };

  useEffect(() => {
    let unsubscribeNetInfo;

    const init = async () => {
      const state = await NetInfo.fetch();
      if (state.isConnected && state.isInternetReachable) {
        safeBootstrap("initial");
      }

      unsubscribeNetInfo = NetInfo.addEventListener((state) => {
        if (state.isConnected && state.isInternetReachable) {
          safeBootstrap("network_reconnect");
        }
      });
    };

    init();

    const handleAppStateChange = (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        safeBootstrap("app_foreground");
      }
      appState.current = nextAppState;
    };

    const appStateListener = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      if (unsubscribeNetInfo) unsubscribeNetInfo();
      appStateListener.remove();
    };
  }, [enabled]);
}
