import React, { useState, useEffect } from "react";
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
import CoffeCup from "@/assets/illustrations/CoffeCup.svg";
import {useDispatch} from "react-redux";
import { setAuthState } from "@/store/slices/authSlice";
import {confirmSignUp, resendSignUpCode, resetPassword} from "@aws-amplify/auth"; // Adjust import based on your store structure

export default function VerificationScreen() {
    const { type, email } = useLocalSearchParams<{ type?: string, email?: string }>(); // "signup" or "recovery"
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [resending, setResending] = useState(false);
    const dispatch = useDispatch();

    const [code, setCode] = useState(["", "", "", "", "", ""]); // 6-digit code input
    const [timer, setTimer] = useState(30); // countdown seconds

    const titleText =
      type === "signup" ? "Verify your email" : "Verify password reset";
    const descText =
      type === "signup"
        ? "Enter the sign up code sent to your email"
        : "Enter the recovery code sent to your email";

    const onSubmit = async () => {
        const codeStr = code.join("").trim(); // e.g., "1234" or "123456"
        if (!codeStr || codeStr.length < 4) {
            alert("Please enter the verification code.");
            return;
        }
        if (!email) {
            console.error("[Verify] Missing email in params");
            alert("Something went wrong. Please go back and try again.");
            return;
        }

        try {
            setSubmitting(true);
            if (type === "signup") {
                console.log("[Verify] Confirming sign up for:", email, "code:", codeStr);
                await confirmSignUp({ username: String(email), confirmationCode: codeStr });

                // Success — you can send them to sign-in (recommended),
                // or auto sign them in if you enabled autoSignIn in your pool.
                alert("Email verified. Please sign in.");
                router.replace("/signIn");
                // If you really want to set logged-in state immediately (not typical here):
                // dispatch(setAuthState({ user: String(email), isLoggedIn: true }));
                return;
            }

            // Password recovery flow:
            // We don't confirm here, because confirmResetPassword requires the *new password*.
            // Pass the code + email to the reset screen so you can finish there.
            console.log("[Verify] Code verified for recovery (defer confirm to reset screen).");
            router.replace({
                pathname: "/resetPassword",
                params: { email: String(email), code: codeStr },
            });
        } catch (err: any) {
            const name = err?.name || "UnknownError";
            const message = err?.message || String(err);
            console.error("[Verify] error:", { name, message, err });

            let friendly = "Verification failed. Please check the code and try again.";
            if (name === "CodeMismatchException" || name === "CodeMismatch") {
                friendly = "The code is incorrect. Please try again.";
            } else if (name === "ExpiredCodeException" || name === "ExpiredCode") {
                friendly = "This code has expired. Please resend a new code.";
            } else if (name === "LimitExceededException" || name === "TooManyRequestsException") {
                friendly = "Too many attempts. Please wait a moment and try again.";
            }
            alert(friendly);
        } finally {
            setSubmitting(false);
        }
    };


    const onResend = async () => {
        if (timer > 0 || resending) return; // cooldown or already sending
        if (!email) {
            alert("Missing email. Please go back and enter your email again.");
            return;
        }

        try {
            setResending(true);
            console.log("[Verify] Resend requested for:", email, "type:", type);

            if (type === "signup") {
                await resendSignUpCode({ username: String(email) });
            } else {
                // recovery flow uses resetPassword to trigger a new code
                await resetPassword({ username: String(email) });
            }

            alert("A new verification code has been sent.");
            setTimer(30); // restart countdown only on success
        } catch (err: any) {
            const name = err?.name || "UnknownError";
            const message = err?.message || String(err);
            console.error("[Verify] resend error:", { name, message, err });

            let friendly = "Could not resend the code. Please try again.";
            if (name === "TooManyRequestsException" || name === "LimitExceededException") {
                friendly = "Too many requests. Please wait a moment and try again.";
            } else if (name === "UserNotFoundException" || name === "UserNotFound") {
                friendly = "No account found for this email.";
            }
            alert(friendly);
        } finally {
            setResending(false);
        }
    };

    const updateCode = (text: string, index: number) => {
        const newCode = [...code];
        newCode[index] = text.replace(/[^0-9]/g, "").slice(0, 1);
        setCode(newCode);
    };

    // Countdown effect
    useEffect(() => {
        if (timer <= 0) return;
        const interval = setInterval(() => setTimer((t) => t - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    return (
      <SafeAreaView className="flex-1 bg-white w-full h-full">
          <KeyboardAvoidingView
            className="flex-1 w-full h-full"
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                  <View className="flex-1 px-8 py-8 gap-8">
                      {/* Illustration */}
                      <View className="flex-1 justify-center items-center">
                          <CoffeCup
                            width="100%"
                            height="60%"
                            preserveAspectRatio="xMidYMax meet"
                          />
                      </View>

                      {/* Texts */}
                      <View className="gap-4">
                          <Text className="text-primary text-2xl font-bold">{titleText}</Text>
                          <Text className="text-black text-base font-normal">{descText}</Text>
                          <View className="flex-row items-center gap-1">
                              <Text className="text-black text-base font-bold">Didn’t receive?</Text>
                              <TouchableOpacity onPress={onResend} disabled={timer > 0}>
                                  <Text
                                    className={`text-base font-normal ${
                                      timer > 0 ? "text-black" : "text-red"
                                    }`}
                                  >
                                      Send again
                                  </Text>
                              </TouchableOpacity>
                          </View>
                      </View>

                      {/* Resend timer */}
                      {timer > 0 && (
                        <Text className="text-black text-base font-medium">
                            Resend in {timer}
                        </Text>
                      )}

                      {/* Code Inputs */}
                      <View className="flex-row justify-between px-4 items-center">
                          {code.map((digit, i) => (
                            <View className="w-12 h-12 justify-center items-center text-lg bg-white rounded-2xl border border-black"><TextInput
                              key={i}
                              value={digit}
                              onChangeText={(t) => updateCode(t, i)}
                              keyboardType="numeric"
                              maxLength={1}
                              className="text-center w-full h-full"
                            />
                            </View>
                          ))}
                      </View>

                      {/* Submit */}
                      <TouchableOpacity
                        className="w-full h-12 bg-indigo-400 rounded-[32px] items-center justify-center"
                        onPress={onSubmit}
                        disabled={submitting}
                      >
                          <Text className="text-white text-xl font-medium">
                              {submitting ? "Verifying…" : "Submit"}
                          </Text>
                      </TouchableOpacity>
                  </View>
              </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
      </SafeAreaView>
    );
}
