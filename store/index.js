import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

import userReducer from "./features/userSlice";
import websocketReducer from "./features/websocketSlice";

const userPersistConfig = {
  key: "user",
  storage: AsyncStorage,
  whitelist: ["userDetails"], 
};

const rootReducer = combineReducers({
  user: persistReducer(userPersistConfig, userReducer),
  websocket: websocketReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }),
});

export const persistor = persistStore(store);
