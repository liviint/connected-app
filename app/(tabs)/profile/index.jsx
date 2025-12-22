import { useCallback, useState} from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useRouter , useFocusEffect, useLocalSearchParams} from "expo-router";
import { clearUserDetails } from "@/store/features/userSlice";
import { api } from "../../../api";
import * as Sentry from "@sentry/react-native";
import ProtectedAccessPage from "../../../src/components/common/ProtectedAccessPage";
import { useThemeStyles } from "../../../src/hooks/useThemeStyles";
import { Card, BodyText } from "../../../src/components/ThemeProvider/components";

const ProfileView = () => {
  const {globalStyles} = useThemeStyles()
  const router = useRouter();
  const {refresh} = useLocalSearchParams()
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.user?.userDetails);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    dispatch(clearUserDetails());
    router.push("/");
  };

  const getUserData = async () => {
    setLoading(true)
    api.get("accounts/profile/")
    .then(res => {
        Sentry.captureMessage("hello test user successfu;")
        setUserData(res.data);
    }).catch(err =>  {
      Sentry.captureMessage("hello test user eror successfu")
      console.error(err);
    })
    .finally(() =>  setLoading(false))
  };

  useFocusEffect(
    useCallback(() => {
      if (user) {
        getUserData();
      }
      else setUserData(null)
    }, [user, refresh])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  if (!userData) return <ProtectedAccessPage />

  return (
    <ScrollView contentContainerStyle={{...globalStyles.container,...styles.container}}>
      <Card style={styles.card}>
        {userData.profilePic ? (
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: userData.profilePic }}
              style={styles.avatar}
            />
          </View>
        ) : null}

        <BodyText style={styles.username}>Username: {userData.username}</BodyText>
        <Text style={styles.email}>{userData.email}</Text>
        {userData.bio ? <BodyText style={styles.bio}>{userData.bio}</BodyText> : null}

        <View style={styles.btnGroup}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              Sentry.captureException(new Error('Test sentry'))
              router.push("/profile/edit")
            }}
          >
            <Text style={styles.btnText}>Update Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.btnText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </ScrollView>
  );
};

export default ProfileView;


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAF9F7",
  },
  card: {
    borderRadius: 20,
    padding: 25,
    width: "100%",
    maxWidth: 500,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  avatarWrapper: {
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#FF6B6B",
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FF6B6B",
    marginBottom: 5,
  },
  bio: {
    fontSize: 15,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 22,
  },
  btnGroup: {
    flexDirection: "column",
    gap: 10,
    marginTop: 20,
    width: "100%",
  },
  button: {
    backgroundColor: "#2E8B8B",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: "#FF6B6B",
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
