// app/(auth)/signUp.tsx
import React, {useState} from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform, ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {useRouter} from "expo-router";
import {signUp} from "aws-amplify/auth";

// Define the type for Google prediction objects
type Prediction = {
  description: string;
  place_id: string;
};

export default function SignUpScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const options = ["Male", "Female", "Other"];
  const [address, setAddress] = useState("");
  const [dd, setDd] = useState("");
  const [mm, setMm] = useState("");
  const [yyyy, setYyyy] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<Prediction[]>([]);

  const fetchPlaces = async (input: string): Promise<Prediction[]> => {
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      input
    )}&types=address&language=en&key=${process.env.GOOGLE_PLACES_API_KEY}`;

    const res = await fetch(url);
    const json = await res.json();

    // Ensure we always return an array
    return Array.isArray(json.predictions) ? json.predictions : [];
  };

  const onChange = async (text: string) => {
    setQuery(text);
    if (text.length > 2) {
      const predictions = await fetchPlaces(text);
      setResults(predictions);
    } else {
      setResults([]);
    }
  };

  const router = useRouter();

  const zero2 = (n: string) => n.padStart(2, "0");

  const onSignUp = async () => {
    const nameTrim = (fullName ?? "").trim();
    const emailTrim = (email ?? "").trim().toLowerCase();
    const g = (gender ?? "").trim();
    const addr = (address ?? "").trim();
    const d = (dd ?? "").replace(/\D/g, "");
    const m = (mm ?? "").replace(/\D/g, "");
    const y = (yyyy ?? "").replace(/\D/g, "");

    // ✅ basic validation
    if (!nameTrim) return alert("Please enter your full name.");
    if (!emailTrim || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      return alert("Please enter a valid email.");
    }
    if (!g) return alert("Please select your gender.");
    if (!addr) return alert("Please enter your address.");
    if (y.length !== 4 || m.length < 1 || d.length < 1) {
      return alert("Please enter a valid date of birth (YYYY-MM-DD).");
    }
    const mmP = parseInt(m, 10);
    const ddP = parseInt(d, 10);
    const yyyyP = parseInt(y, 10);
    if (mmP < 1 || mmP > 12) return alert("Month must be 1–12.");
    const daysInMonth = new Date(yyyyP, mmP, 0).getDate();
    if (ddP < 1 || ddP > daysInMonth) return alert(`Day must be 1–${daysInMonth}.`);

    const birthdate = `${yyyyP}-${zero2(String(mmP))}-${zero2(String(ddP))}`;

    // ⚠️ Make sure you actually have a password field; Cognito requires one.
    if (!password) {
      return alert("Please enter a password to create your account.");
    }

    try {
      console.groupCollapsed("[Auth] signUp");
      console.log({ fullName: nameTrim, email: emailTrim, gender: g, address: addr, birthdate });
      console.groupEnd();

      const res = await signUp({
        username: emailTrim,           // use email as username
        password,                      // must come from your form
        options: {
          userAttributes: {
            email: emailTrim,
            name: nameTrim,
            gender: g,                 // standard Cognito attribute
            address: addr,             // standard Cognito attribute
            birthdate,                 // YYYY-MM-DD (ISO)
          },
          // autoSignIn: true,          // enable if you configured it in Cognito
        },
      });

      console.log("[Auth] signUp result:", res);

      // Most pools require email verification:
      alert("We’ve sent you a verification code. Please check your email.");
      router.replace({
        pathname: "/verification",
        params: { type: "signup", email: emailTrim },
      });
    } catch (err: any) {
      const name = err?.name || "UnknownError";
      const message = err?.message || String(err);
      console.error("[Auth] signUp error:", { name, message, err });

      let friendly = "Failed to sign up. Please try again.";
      if (name === "UsernameExistsException" || name === "UsernameExists") {
        friendly = "An account with this email already exists.";
      } else if (name === "InvalidPasswordException" || name === "InvalidPassword") {
        friendly = "Password doesn’t meet requirements. Try a stronger one.";
      } else if (name === "InvalidParameterException") {
        friendly = "Some information looks invalid. Please review your details.";
      }

      alert(friendly);
    }
  };

  const onSignIn = () => router.replace("/signIn");

  return (
    <SafeAreaView className="flex-1 bg-white w-full h-full">
      {/* Anchor whole form to bottom */}
      <KeyboardAvoidingView className="flex-1 w-full h-full" behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView className="flex-1">
            <View className="flex-1 w-full justify-end items-center px-8 py-8 gap-8">
              <View className="w-full gap-4">
                <View className={"flex-row items-center"}>
                  <Text className='text-2xl font-bold text-[#7797DB]'>Sign up </Text>
                  <Text className='text-2xl font-bold text-black'>to stay tuned!!</Text>
                </View>
              </View>
              <View className="w-full gap-2">
                <View className="w-full items-start">
                  <Text className="text-xl font-medium">Full name</Text>
                </View>
                <View className="w-full h-12 justify-center items-start bg-zinc-100 rounded-2xl px-4">
                  <TextInput className='w-full h-full' value={fullName} onChangeText={setFullName} placeholder="Your name"/>
                </View>
              </View>
              <View className="w-full gap-2">
                <View className="w-full items-start">
                  <Text className="text-xl font-medium">Email</Text>
                </View>
                <View className="w-full h-12 justify-center items-start bg-zinc-100 rounded-2xl px-4">
                  <TextInput className='w-full h-full' value={email} onChangeText={setEmail} placeholder="Your email"/>
                </View>
              </View>
              <View className="w-full gap-2">
                <View className="w-full items-start">
                  <Text className="text-xl font-medium">Address</Text>
                </View>

                {/* Address input */}
                <View className="w-full justify-center items-start bg-zinc-100 rounded-2xl px-4">
                  <TextInput
                    placeholder="Enter address"
                    value={query}
                    onChangeText={onChange}
                    className="h-12 w-full"
                  />
                </View>

                {/* Address suggestions */}
                {results.length > 0 && (
                  <View className="w-full bg-white rounded-2xl border border-gray-200 mt-1 max-h-40">
                    <FlatList
                      data={results}
                      keyboardShouldPersistTaps="handled"
                      keyExtractor={(item) => item.place_id}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          onPress={() => {
                            setQuery(item.description);
                            setAddress(item.description);
                            setResults([]);
                          }}
                          className="p-2"
                        >
                          <Text>{item.description}</Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                )}
              </View>

              <View className="w-full gap-2">
                <View className="w-full items-start">
                  <Text className="text-xl font-medium">Date of birth</Text>
                </View>
                <View className="flex-row w-full h-12 justify-between gap-2">
                  <View className="flex-1 justify-center items-center bg-zinc-100 rounded-2xl px-4">
                    <TextInput className='w-full h-full text-center' keyboardType="numeric" value={dd} onChangeText={(text) => setDd(text.replace(/[^0-9]/g, "").slice(0, 2))} placeholder="DD"/>
                  </View>
                  <View className="flex-1 justify-center items-center bg-zinc-100 rounded-2xl px-4">
                    <TextInput className='w-full h-full text-center' keyboardType="numeric" value={mm} onChangeText={(text) => setMm(text.replace(/[^0-9]/g, "").slice(0, 2))} placeholder="MM"/>
                  </View>
                  <View className="flex-1 justify-center items-center bg-zinc-100 rounded-2xl px-4">
                    <TextInput className='w-full h-full text-center' keyboardType="numeric" value={yyyy} onChangeText={(text) => setYyyy(text.replace(/[^0-9]/g, "").slice(0, 4))} placeholder="YYYY"/>
                  </View>
                </View>
              </View>

              <View className="w-full gap-2">
                <View className="w-full items-start">
                  <Text className="text-xl font-medium">Gender</Text>
                </View>
                <View className="flex-row w-full h-12 justify-between gap-2">
                  {options.map((option) => {
                    const selected = gender === option;
                    return (
                      <TouchableOpacity
                        key={option}
                        onPress={() => setGender(option)}
                        className={`flex-1 justify-center items-center rounded-2xl px-4 ${
                          selected ? "bg-indigo-400" : "bg-zinc-100"
                        }`}
                      >
                        <Text className={selected ? "text-white" : "text-black"}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View className="w-full gap-2">
                <Text className="text-black text-base font-medium">
                  New password
                </Text>
                <View className="h-12 px-4 bg-neutral-100 rounded-2xl justify-center">
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="******"
                    secureTextEntry
                    className="text-black text-base"
                  />
                </View>
              </View>

              {/* Confirm password */}
              <View className="w-full gap-2">
                <Text className="text-black text-base font-medium">
                  Confirm new password
                </Text>
                <View className="h-12 px-4 bg-neutral-100 rounded-2xl justify-center">
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="******"
                    secureTextEntry
                    className="text-black text-base"
                  />
                </View>
              </View>


              <View className='flex-row items-center justify-end w-full'>
                <Text className="text-medium font-bold text-black opacity-50">
                  Already have an account?{" "}
                </Text>
                <TouchableOpacity onPress={onSignIn}>
                  <Text className="text-medium font-bold text-red opacity-50">
                    Sign in
                  </Text>
                </TouchableOpacity>

              </View>
              <TouchableOpacity className="w-full h-12 items-center justify-center bg-primary rounded-[32px]"
                                onPress={onSignUp}>
                <Text className="text-xl font-medium text-white">Sign up</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

