// src/types/StoreType.ts

import { Review } from "@/types/OtherType";

/** Basic store info for listings */
export type Store = {
  id: string;
  name: string;
  imageUrl: string;
  rating?: number;
  type: "restaurant" | "grocery" | "retail" | string;
  badge?: "Popular" | "New" | string;
};

/** Full detail of a store */
export type StoreDetail = Store & {
  description: string;
  address: string;
  banner?: string;
  gallery?: string[];
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  hours?: {
    open: string; // e.g. "09:00"
    close: string; // e.g. "21:00"
  };
  reviews?: Review[];
};
