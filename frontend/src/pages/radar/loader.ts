import { redirect } from "react-router";
import { getUserSignals } from "@/api/signals";

export const RadarLoader = async () => {
  const signals = await getUserSignals();
  
  if (signals && signals.length > 0) {
    return { signals };
  }

  return redirect('/signals/add');
};

