import {SplashScreen, Stack, usePathname, useRouter} from "expo-router";
import {Provider, useDispatch, useSelector} from "react-redux";
import {RootState, store} from "@/store/store";
import React, {useEffect, useState} from "react";
import {Amplify} from "aws-amplify";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {fetchAuthSession} from "aws-amplify/auth";
import {setAuthState, setFirstLaunch} from "@/store/slices/authSlice";
import {Hub} from "aws-amplify/utils";
import {ActivityIndicator, View} from "react-native";
import "../global.css";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold
} from '@expo-google-fonts/inter';

SplashScreen.preventAutoHideAsync();

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.USER_POOL_ID || "",
      userPoolClientId: process.env.USER_POOL_CLIENT_ID || "",
      loginWith: { email: true, username: false, phone: false },
    },
  },
});

const checkFirstLaunch = async (): Promise<boolean> => {
  const hasLaunched = await AsyncStorage.getItem("hasLaunched");
  console.log("AsyncStorage - hasLaunched:", hasLaunched);
  if (hasLaunched === null) {
    await AsyncStorage.setItem("hasLaunched", "true");
    console.log("First launch detected. Setting flag.");
    return true;
  }
  return false;
};

export default function RootLayout() {
  return (
    <Provider store={store}>
      <RootLayoutInner/>
    </Provider>
  );
}

function RootLayoutInner() {
  const [checking, setChecking] = useState(true);
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  });

  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  // ⛔ Handle font loading error
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Handle first launch and authentication state
  // First launch
  useEffect(() => {
    if (!loaded) return;

    const initFirstLaunch = async () => {
      const isFirstLaunch = await checkFirstLaunch();
      // dispatch(setFirstLaunch(isFirstLaunch));
      dispatch(setFirstLaunch(false));
    };

    initFirstLaunch();
  }, [loaded]);

  // Authentication state
  useEffect(() => {
    if (!loaded) return;

    const checkAuth = async () => {
      try {
        const session = await fetchAuthSession({forceRefresh: true});
        const isSignedIn = !!session.tokens?.idToken;

        dispatch(
          setAuthState({
            user: session.userSub || null,
            isLoggedIn: isSignedIn,
          }),
        );
        console.log("Auth session:", session);
      } catch (err) {
        console.log("Auth check failed:", err);
      }
    };

    const unsubscribe = Hub.listen("auth", async ({payload}) => {
      if (payload.event === "signedIn") {
        const session = await fetchAuthSession();
        dispatch(
          setAuthState({
            user: session.tokens?.idToken?.payload?.sub || null,
            isLoggedIn: true,
          }),
        );
      }
      if (payload.event === "signedOut") {
        dispatch(setAuthState({user: null, isLoggedIn: false}));
      }
    });

    checkAuth().finally(() => {
      setChecking(false);
      SplashScreen.hideAsync();
    });
    return () => unsubscribe();
  }, [loaded]);


  if (!loaded || checking) {
    return (
      <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
        <ActivityIndicator size="large"/>
      </View>
    );
  }

  // @ts-ignore
  return (
    <Stack>
      <Stack.Protected guard={auth.isLoggedIn}>
        <Stack.Screen
          name="(app)"
          options={{headerShown: false, gestureEnabled: false}}
        />
      </Stack.Protected>
      <Stack.Protected guard={!auth.isLoggedIn}>
        <Stack.Screen
          name="(auth)"
          options={{headerShown: false, gestureEnabled: false}}
        />
      </Stack.Protected>
    </Stack>
  );
}
