import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {JsonArray, JsonObject} from "type-fest";

interface AuthState {
    user: string | null;
    isLoggedIn: boolean;
    isFirstLaunch: boolean;
}

const initialState: AuthState = {
    user: null,
    isLoggedIn: false,
    isFirstLaunch: true,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuthState: (state, action: PayloadAction<{ user: string | null; isLoggedIn: boolean }>) => {
            state.user = action.payload.user;
            state.isLoggedIn = action.payload.isLoggedIn;
        },
        setFirstLaunch: (state, action: PayloadAction<boolean>) => {
            state.isFirstLaunch = action.payload;
        },
    },
});

export const {setAuthState, setFirstLaunch} = authSlice.actions;

export default authSlice.reducer;
