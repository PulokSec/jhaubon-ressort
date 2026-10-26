"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { Quote, Charges } from "./pricing";

export type QuoteResponse = { quote: Quote; freeUnits: number; charges: Charges };

export function useQuote(space: string, checkIn: string, checkOut: string) {
  return useQuery({
    queryKey: ["quote", space, checkIn, checkOut],
    enabled: !!space && !!checkIn && !!checkOut && checkOut > checkIn,
    placeholderData: keepPreviousData,
    retry: false,
    queryFn: async (): Promise<QuoteResponse> => {
      const res = await fetch(`/api/quote?${new URLSearchParams({ space, checkIn, checkOut })}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "quote_failed");
      return data;
    },
  });
}
