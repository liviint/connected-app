import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (route) => pathname === route;

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => router.push("/")} style={styles.logoContainer}>
        <Text style={styles.logoText}>ZeniaHub</Text>
      </TouchableOpacity>

      {/* Large screen (for web maybe) */}
      <View style={styles.navLarge}>
        <NavLink label="Home" path="/" isActive={isActive("/")} onPress={() => router.push("/")} />
        <NavLink label="Discussions" path="/(tabs)/discussions" isActive={isActive("/(tabs)/discussions")} onPress={() => router.push("/(tabs)/discussions")} />
        <NavLink label="Blog" path="/(tabs)/blog" isActive={isActive("/(tabs)/blog")} onPress={() => router.push("/(tabs)/blog")} />
        <NavLink label="Feedback" path="/(tabs)/feedback" isActive={isActive("/(tabs)/feedback")} onPress={() => router.push("/(tabs)/feedback")} />
        <NavLink label="Profile" path="/(tabs)/profile" isActive={isActive("/(tabs)/profile")} onPress={() => router.push("/(tabs)/profile")} />
      </View>

      {/* Mobile menu toggle */}
      <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)} style={styles.menuButton}>
        <Text style={styles.menuText}>{menuOpen ? "✖" : "☰"}</Text>
      </TouchableOpacity>

      {/* Mobile menu */}
      {menuOpen && (
        <View style={styles.overlay}>
          <View style={styles.navSmall}>
            <NavLink label="Home" path="/" isActive={isActive("/")} onPress={() => { setMenuOpen(false); router.push("/"); }} />
            <NavLink label="Discussions" path="/(tabs)/discussions" isActive={isActive("/(tabs)/discussions")} onPress={() => { setMenuOpen(false); router.push("/(tabs)/discussions"); }} />
            <NavLink label="Blog" path="/(tabs)/blog" isActive={isActive("/(tabs)/blog")} onPress={() => { setMenuOpen(false); router.push("/(tabs)/blog"); }} />
            <NavLink label="Feedback" path="/(tabs)/feedback" isActive={isActive("/(tabs)/feedback")} onPress={() => { setMenuOpen(false); router.push("/(tabs)/feedback"); }} />
            <NavLink label="Profile" path="/(tabs)/profile" isActive={isActive("/(tabs)/profile")} onPress={() => { setMenuOpen(false); router.push("/(tabs)/profile"); }} />
          </View>
        </View>
      )}
    </View>
  );
}

const NavLink = ({ label, onPress, isActive }) => (
  <TouchableOpacity onPress={onPress}>
    <Text style={[styles.navLink, isActive && styles.activeNav]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#2E8B8B",
    height: 80,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 999, // 👈 make header itself top-level
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoText: {
    color: "#FAF9F7",
    fontSize: 22,
    fontWeight: "700",
  },
  navLarge: {
    flexDirection: "row",
    gap: 16,
    display: "none",
  },
  navLink: {
    color: "#FAF9F7",
    fontSize: 16,
  },
  activeNav: {
    borderBottomWidth: 2,
    borderBottomColor: "#FF6B6B",
    paddingBottom: 2,
  },
  menuButton: {
    padding: 8,
  },
  menuText: {
    color: "#FAF9F7",
    fontSize: 24,
    fontWeight: "bold",
  },
  overlay: {
    position: "absolute",
    top: 80,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 998,
  },
  navSmall: {
    position: "absolute",
    top: 80,
    left: 0,
    right: 0,
    backgroundColor: "#2E8B8B",
    paddingVertical: 20,
    alignItems: "center",
    gap: 16,
    zIndex: 999,
    elevation: 10,
  },
});
