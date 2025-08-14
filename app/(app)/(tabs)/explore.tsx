import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Store } from "@/types/StoreType";
import { Item } from "@/types/ItemType";
import { useRouter } from "expo-router";

const SellTab = () => {
  const [storesList, setStoresList] = useState<Store[]>([]);
  const [listingsList, setListingsList] = useState<Item[]>([]);
  const router = useRouter();

  const fetchStoresList = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/v1/stores");
      if (!response.ok) throw new Error("Failed to fetch stores");
      setStoresList(await response.json());
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  const fetchListingsList = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/v1/items");
      if (!response.ok) throw new Error("Failed to fetch listings");
      setListingsList(await response.json());
    } catch (error) {
      console.error("Error fetching listings:", error);
    }
  };

  useEffect(() => {
    fetchStoresList();
    fetchListingsList();
  }, []);

  return (
    <View className="flex-1 bg-white px-4 pt-6 space-y-8">

    </View>
  );
};

export default SellTab;
