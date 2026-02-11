import 'dotenv/config';

export default {
  expo: {
    scheme: "zeniahub",
    name: "ZeniaHub",
    slug: "zeniahub",
    version: "1.0.24",
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

      "intentFilters": [
          // 1. Regular Deep Link (zeniahub://)
          {
            "action": "VIEW",
            "category": ["BROWSABLE", "DEFAULT"],
            "data": [
              { "scheme": "zeniahub" }
            ]
          },
          // 2. Universal App Link (https://zeniahub.com)
          {
            "action": "VIEW",
            "autoVerify": true, 
            "category": ["BROWSABLE", "DEFAULT"],
            "data": [
              { "scheme": "https", "host": "zeniahub.com", "pathPrefix": "/" }
            ]
          }
        ],
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
    },


    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },

    plugins: [
      "expo-router",
      "expo-sqlite",
      "@react-native-community/datetimepicker",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: { backgroundColor: "#000000" },
        },
      ],
      [
      "@sentry/react-native/expo",
        {
          "url": "https://sentry.io/",
          "project": "zeniahub",
          "organization": "zeniahub"
        }
      ]
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

    owner: process.env.EXPO_OWNER || "zeniahub",
  },
};
