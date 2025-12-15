import 'dotenv/config';

export default {
  expo: {
    scheme: "zeniahub",
    name: "ZeniaHub",
    slug: "zeniahub",
    version: "1.0.4",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.zeniahub.app",
      associatedDomains: ["applinks:zeniahub.com"],
    },

    android: {
      package: "com.zeniahub.app",

      adaptiveIcon: {
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundColor: "#E6F4FE",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },

      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,

      enableProguardInReleaseBuilds: true,

      intentFilters: [
        {
          action: "VIEW",
          data: [
            {
              scheme: "https",
              host: "zeniahub.com",
              pathPrefix: "/verify",
            },
            {
              scheme: "zeniahub",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],

      googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
    },


    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },

    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: { backgroundColor: "#000000" },
        },
      ],
    ],

    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },

    extra: {
      router: {},
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "https://api.zeniahub.com/api",
      eas: {
        projectId: process.env.EXPO_PROJECT_ID || "09a5d041-42bc-48f7-b77a-e92ed86feb89",
      },
    },

    owner: process.env.EXPO_OWNER || "kevinmosigisi1",
  },
};
