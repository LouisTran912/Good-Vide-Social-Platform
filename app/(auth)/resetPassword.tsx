// app/(auth)/resetPassword.tsx
import React, { useMemo, useState } from "react";
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
import { useLocalSearchParams, useRouter } from "expo-router";
import { confirmResetPassword } from "@aws-amplify/auth";

export default function ResetPasswordScreen() {
    const router = useRouter();

    // read params passed from Verification screen
    const { email: emailParam, code: codeParam } = useLocalSearchParams<{
        email?: string;
        code?: string;
    }>();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    // prefill code with param (still editable)
    const [code, setCode] = useState<string>(codeParam ?? "");
    const [submitting, setSubmitting] = useState(false);

    const email = useMemo(() => (emailParam ?? "").toString(), [emailParam]);
    const passwordOk = newPassword.length >= 8;

    const onReset = async () => {
        const trimmedCode = code.trim();

        if (!email) {
            alert("Missing email for password reset. Please restart the recovery flow.");
            return;
        }
        if (!trimmedCode) {
            alert("Please enter the verification code from your email.");
            return;
        }
        if (!passwordOk) {
            alert("Password must be at least 8 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        try {
            setSubmitting(true);
            console.log("[ResetPassword] confirming reset for:", email);

            await confirmResetPassword({
                username: email,
                newPassword,
                confirmationCode: trimmedCode,
            });

            alert("Your password has been reset. Please sign in.");
            router.replace("/signIn");
        } catch (err: any) {
            const name = err?.name || "UnknownError";
            const message = err?.message || String(err);
            console.error("[ResetPassword] error:", { name, message, err });

            let friendly = "Could not reset password. Please try again.";
            if (name === "CodeMismatchException" || name === "CodeMismatch") {
                friendly = "The code is incorrect. Please try again.";
            } else if (name === "ExpiredCodeException" || name === "ExpiredCode") {
                friendly = "This code has expired. Request a new one and try again.";
            } else if (name === "InvalidPasswordException" || name === "InvalidPassword") {
                friendly = "Password doesn’t meet requirements. Try a stronger one.";
            } else if (name === "UserNotFoundException" || name === "UserNotFound") {
                friendly = "No account found for this email.";
            }
            alert(friendly);
        } finally {
            setSubmitting(false);
        }
    };

    return (
      <SafeAreaView className="flex-1 bg-white w-full h-full">
          <KeyboardAvoidingView
            className="flex-1 w-full h-full"
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                  <View className="flex-1 px-8 py-8 gap-8">
                      {/* Title */}
                      <View className="gap-4">
                          <Text className="text-primary text-2xl font-bold">
                              Reset password
                          </Text>
                          <Text className="text-black text-base font-normal">
                              Please enter your new password
                          </Text>
                          {!!email && (
                            <Text className="text-black/60 text-sm">
                                for <Text className="font-medium text-black">{email}</Text>
                            </Text>
                          )}
                      </View>

                      {/* Verification code */}
                      <View className="gap-2">
                          <Text className="text-black text-base font-medium">
                              Verification code
                          </Text>
                          <View className="h-12 px-4 bg-neutral-100 rounded-2xl justify-center">
                              <TextInput
                                value={code}
                                onChangeText={setCode}
                                placeholder="Enter the code from your email"
                                keyboardType="number-pad"
                                autoCapitalize="none"
                                className="text-black text-base"
                              />
                          </View>
                      </View>

                      {/* New password */}
                      <View className="gap-2">
                          <Text className="text-black text-base font-medium">New password</Text>
                          <View className="h-12 px-4 bg-neutral-100 rounded-2xl justify-center">
                              <TextInput
                                value={newPassword}
                                onChangeText={setNewPassword}
                                placeholder="******"
                                secureTextEntry
                                autoCapitalize="none"
                                className="text-black text-base"
                              />
                          </View>
                          {newPassword.length > 0 && !passwordOk && (
                            <Text className="text-xs text-gray-500">
                                Use at least 8 characters.
                            </Text>
                          )}
                      </View>

                      {/* Confirm password */}
                      <View className="gap-2">
                          <Text className="text-black text-base font-medium">
                              Confirm new password
                          </Text>
                          <View className="h-12 px-4 bg-neutral-100 rounded-2xl justify-center">
                              <TextInput
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="******"
                                secureTextEntry
                                autoCapitalize="none"
                                className="text-black text-base"
                              />
                          </View>
                          {confirmPassword.length > 0 && confirmPassword !== newPassword && (
                            <Text className="text-xs text-red-600">Passwords do not match</Text>
                          )}
                      </View>

                      {/* Reset button */}
                      <TouchableOpacity
                        className={`h-12 rounded-[32px] items-center justify-center ${
                          submitting ? "bg-primary/60" : "bg-primary"
                        }`}
                        onPress={onReset}
                        disabled={
                          submitting ||
                          !email ||
                          !code.trim() ||
                          !passwordOk ||
                          newPassword !== confirmPassword
                        }
                      >
                          <Text className="text-xl font-medium text-white">
                              {submitting ? "Resetting…" : "Reset"}
                          </Text>
                      </TouchableOpacity>
                  </View>
              </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
      </SafeAreaView>
    );
}
