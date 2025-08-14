import React, {useState} from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback, TouchableOpacity,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {useRouter} from "expo-router";
import {setAuthState} from "@/store/slices/authSlice";
import {useDispatch} from "react-redux";
import CoffeCup from "@/assets/illustrations/CoffeCup.svg";
import {fetchAuthSession, signIn} from "aws-amplify/auth"

const PlaceholderIllustration = () => (
  <View className="w-64 h-60 rounded-2xl bg-zinc-100"/>
);

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();

  const onSignIn = async () => {
    const emailTrimmed = email;
    const pwd = password;

    if (!emailTrimmed || !pwd) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      // 1) Attempt sign in

      const res = await signIn({ username: emailTrimmed, password: pwd,
                                              options: { authFlowType: "USER_PASSWORD_AUTH" } });
      console.log("[Auth] signIn:", res);

      // 2) If already signed in, fetch session and store
      if (res.isSignedIn) {
        const session = await fetchAuthSession();
        console.log("[Auth] session:", session);
        dispatch(
          setAuthState({
            user: (session as any)?.userSub ?? emailTrimmed,
            isLoggedIn: true,
          })
        );
        return;
      }

      // 3) Basic next steps only (type-safe)
      const step = res.nextStep?.signInStep;
      console.log("[Auth] next step:", step, res.nextStep);

      switch (step) {
        case "DONE":
          // already signed in, no further action needed
          console.log("[Auth] Already signed in.");
          return;
        case "CONFIRM_SIGN_UP":
          // user must verify email
          alert("Please verify your email to continue.");
          router.replace({ pathname: "/verification", params: { type: "signup" } });
          return;

        case "RESET_PASSWORD":
          // user must reset password before signing in
          alert("You need to reset your password.");
          router.replace("/resetPassword");
          return;

        default:
          console.warn("[Auth] Unhandled basic next step:", step);
          alert("Additional verification is required to complete sign in. Please contact support via contact@louistran.ca.");
          return;
      }
    } catch (err: any) {
      const name = err?.name || "UnknownError";
      const message = err?.message || String(err);
      console.error("[Auth] sign in error:", { name, message, err });

      // basic, friendly mapping
      let friendly = "Failed to sign in. Please try again.";
      if (name === "UserNotFoundException" || name === "UserNotFound") {
        friendly = "No account found for this email.";
      } else if (name === "NotAuthorizedException" || name === "NotAuthorized") {
        friendly = "Incorrect email or password.";
      } else if (name === "UserNotConfirmedException" || name === "UserNotConfirmed") {
        friendly = "Your account isn’t confirmed yet. Check your email for the code.";
      }

      alert(friendly);
    }
  };

  const onSignUp = () => {
    router.replace("/signUp");
  };

  const onForgot = () => {
    router.replace("/forgotPassword");
  };

  return (
    <SafeAreaView className="flex-1 bg-white w-full h-full">
      {/* Anchor whole form to bottom */}
      <KeyboardAvoidingView className="flex-1 w-full h-full" behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>

          <View className="flex-1">
            <View className="flex-1 px-8">
              <CoffeCup
                width="100%"
                height="60%"                   // tweak (50–70%) to taste
                preserveAspectRatio="xMidYMax meet" // bottom-align inside its box
              />
            </View>
            <View className="flex-1 w-full justify-end items-center px-8 py-8 gap-8">
              <View className="w-full gap-4">
                <View className={"flex-row items-center"}>
                  <Text className='text-2xl font-bold text-primary'>Sign in </Text>
                  <Text className='text-2xl font-bold text-black'>to heal your mind!!</Text>
                </View>
                <View>
                  <Text className='text-xl text-black'>Don't have an account yet?</Text>
                  <TouchableOpacity onPress={onSignUp}>
                    <Text className='text-xl text-[#FF0000]'>Sign up here</Text>
                  </TouchableOpacity>

                </View>
              </View>
              <View className="w-full gap-2">
                <View className="w-full items-start">
                  <Text className="text-xl font-medium">Email address</Text>
                </View>
                <View className="w-full h-12 justify-center items-start bg-zinc-100 rounded-2xl px-4">
                  <TextInput value={email} onChangeText={setEmail} placeholder="Your email address"/>
                </View>
              </View><View className="w-full gap-2">
              <View className="w-full items-start">
                <Text className="text-xl font-medium">Password</Text>
              </View>
              <View className="w-full h-12 justify-center items-start bg-zinc-100 rounded-2xl px-4">
                <TextInput value={password} onChangeText={setPassword} placeholder="********"/>
              </View>
            </View>
              <TouchableOpacity className="w-full items-end justify-center bg-blue" onPress={onForgot}>
                <Text className="text-medium font-bold text-black opacity-50">
                  Forgot password
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="w-full h-12 items-center justify-center bg-primary rounded-[32px]"
                                onPress={onSignIn} disabled={!email || !password}>
                <Text className="text-xl font-medium text-white">Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
