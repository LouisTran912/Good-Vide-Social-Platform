// src/types/ItemType.ts

import { NutritionInfo, Review } from "@/types/OtherType";

/** Minimal data for listing/recommendation cards */
export type Item = {
  id: string;
  storeID: string; // ID of the store this item belongs to
  type: "food & drink" | "cloth" | "other"; // Type of item
  name: string;
  imageUrl: string;
  price: number;
  shortDesc: string;
  badge?: "Popular" | "New" | string; // optional badge like "Popular", "New"
  rating?: number; // Average rating, optional
};

/** Full detail payload for an item screen */
export type ItemDetail = Item & {
  longDesc: string;
  gallery: string[];
  nutrition?: NutritionInfo;
  reviews?: Review[];
};
