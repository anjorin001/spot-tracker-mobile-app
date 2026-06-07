// src/hooks/useSpots.ts
import { useCallback, useEffect, useState } from "react";
import * as storage from "@/lib/storage";
import { Spot } from "@/types/spot";


export function useSpots() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setSpots(await storage.getSpots());
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return {
    spots,
    loading,
    refresh,
    remove: async (id: string) => { await storage.deleteSpot(id); refresh(); },
  };
}