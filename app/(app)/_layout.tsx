// app/_layout.tsx
import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }} // Hide the header for the tabs layout
      />
      <Stack.Screen
        name="(item)"
        options={{ headerShown: false }} // Hide the header for the item layout
      />
      <Stack.Screen
        name="(store)"
        options={{ headerShown: false }} // Hide the header for the store layout
      />
      <Stack.Screen
        name="upload"
        options={{ headerShown: false }} // Hide the header for the store layout
      />
    </Stack>
  ); // Will render (tabs), (item), or (store) layouts
}
