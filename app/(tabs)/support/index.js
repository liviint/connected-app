import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, Platform } from "react-native";
import {
  useIAP,
  requestPurchase,
} from "react-native-iap";

const itemSkus = ["support_50", "support-50", "support_200"];

const SupportPage = () => {
  const {
  connected,
  products,
  fetchProducts,
  finishTransaction,
  currentPurchase,
} = useIAP();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const initIAP = async () => {
    if (connected) {
      try {
        setLoading(true);

        await fetchProducts,({ skus: itemSkus });

      } catch (err) {
        console.warn("IAP Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  initIAP();
}, [connected]);
  useEffect(() => {
    if (currentPurchase) {
      finishTransaction({ purchase: currentPurchase, isConsumable: true })
        .then(() => Alert.alert("Thank you 💖", "Your support keeps ZeniaMoney running!"))
        .catch((err) => console.warn("Finish error", err));
    }
  }, [currentPurchase]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>❤️ Support ZeniaMoney</Text>
      <Text style={styles.subtitle}>Your support keeps the app free and growing 💖</Text>
      
      <View style={styles.divider} />

      {loading ? (
        <ActivityIndicator size="large" color="#FF6B6B" />
      ) : products.length > 0 ? (
        products.map((product) => (
          <TouchableOpacity
            key={product.productId}
            style={styles.button}
            onPress={() => requestPurchase({ sku: product.productId })}
          >
            <Text style={styles.buttonText}>
              {product.localizedPrice} - {product.title.split('(')[0].trim()}
            </Text>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.microcopy}>No support options found. Check your Play Store connection.</Text>
      )}

      <Text style={styles.microcopy}>Even Ksh 50 helps keep the app running 💖</Text>
    </View>
  );
};

export default SupportPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F7",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FF6B6B",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  divider: {
    height: 1,
    width: "80%",
    backgroundColor: "rgba(0,0,0,0.1)",
    marginVertical: 20,
  },
  button: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginVertical: 8,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#FAF9F7",
    fontSize: 16,
    fontWeight: "600",
  },
  microcopy: {
    marginTop: 20,
    color: "#333",
    textAlign: "center",
  },
});