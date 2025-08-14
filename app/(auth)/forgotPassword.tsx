// app/(auth)/forgotPassword.tsx
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { resetPassword } from "@aws-amplify/auth";

import CoffeCup from "@/assets/illustrations/CoffeCup.svg";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isValidEmail = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase()),
    [email]
  );

  const onSubmit = async () => {
    const username = email.trim().toLowerCase();
    if (!isValidEmail) return;

    try {
      setSubmitting(true);
      const res = await resetPassword({ username }); // sends the code
      // res.nextStep.resetPasswordStep === "CONFIRM_RESET_PASSWORD_WITH_CODE"
      router.replace({
        pathname: "/verification",
        params: { type: "recovery", email: username },
      });
    } catch (err) {
      console.error(err);
      alert("Could not send reset code. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View className="flex-1 px-8 py-8 gap-8">
            {/* Illustration */}
            <View className="flex-1 justify-center items-center">
              <CoffeCup width="100%" height="60%" preserveAspectRatio="xMidYMax meet" />
            </View>

            {/* Title + description */}
            <View className="gap-2">
              <Text className="text-primary text-2xl font-bold">Forgot password</Text>
              <Text className="text-black text-base">Please enter your email</Text>
            </View>

            {/* Email field */}
            <View className="gap-2">
              <Text className="text-black text-base font-medium">Email</Text>
              <View className="h-12 px-4 bg-zinc-100 rounded-2xl justify-center">
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="text-black text-base"
                />
              </View>
              {!isValidEmail && email.length > 0 && (
                <Text className="text-red-600 text-xs">Enter a valid email</Text>
              )}
            </View>

            {/* Submit */}
            <TouchableOpacity
              onPress={onSubmit}
              disabled={!isValidEmail || submitting}
              className={`w-full h-12 rounded-[32px] items-center justify-center ${
                submitting ? "bg-primary/60" : isValidEmail ? "bg-primary" : "bg-zinc-300"
              }`}
            >
              <Text className="text-xl font-medium text-white">
                {submitting ? "Sending…" : "Submit"}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
