import React from "react";
import {View, Text, TouchableOpacity} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {useRouter} from "expo-router";

export default function HomeScreen() {
    const router = useRouter();

    const handleNavigation = () => {
        // Example navigation
        router.push("/details");
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 px-8 py-8">
                <Text className="text-2xl font-bold mb-4">Welcome Home</Text>
                <TouchableOpacity
                    className="bg-sky-500 p-4 rounded-xl"
                    onPress={handleNavigation}
                >
                    <Text className="text-white text-center font-bold">Go to Details</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
