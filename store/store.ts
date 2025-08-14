import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import loadingReducer from "./slices/loadingSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    loading: loadingReducer,
    // add more slices here
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
