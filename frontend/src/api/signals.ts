import { api } from "./api";
import type { SignalType, Category, Skill } from "@/feature/signals/signalSchema";

// Typy dla sygnałów - nowa struktura z API
export interface SignalDetails {
  title: string;
  description?: string;
  // Investor specific
  budget_min?: number;
  budget_max?: number;
  categories?: Category[];
  // Freelancer specific
  hourly_rate?: number;
  skills?: Skill[];
  // Idea specific
  funding_min?: number;
  funding_max?: number;
  needed_skills?: Skill[];
}

export interface Signal {
  id: number;
  user_id: number;
  signal_category_id: number; // 1 = freelancer, 2 = idea, 3 = investor
  details: SignalDetails;
  created_at: string;
  is_active: boolean;
  // Opcjonalne pola dla dopasowań
  match_score?: number; // 0.0 to 1.0 (1.0 = perfect match)
  username?: string;
}

// Helper do konwersji signal_category_id na typ
export const categoryIdToType: Record<number, SignalType> = {
  1: "freelancer",
  2: "idea",
  3: "investor",
};

export const getSignalType = (signal: Signal): SignalType => {
  return categoryIdToType[signal.signal_category_id] || "idea";
};

export interface MatchedSignalsResponse {
  user_signal: Signal; // Sygnał zalogowanego użytkownika (środek radaru)
  matches: MatchApiResponse; // Odpowiedź z API matchowania
}

// Odpowiedź z API dla matchowania
export interface MatchApiResponse {
  source_signal_id: number;
  matches: Array<{
    signal_id: number;
    accurate: number;
    details: SignalDetails | null;
  }>;
}

/**
 * Pobiera wszystkie sygnały (aktywności) zalogowanego użytkownika
 */
export async function getUserSignals(): Promise<Signal[]> {
  try {
    const response = await api.get<{ signals: Signal[] }>("/signals/me");
    return response.signals;
  } catch (error) {
    console.error("Error fetching user signals:", error);
    throw error;
  }
}

/**
 * Pobiera dopasowane sygnały dla wybranego sygnału użytkownika
 */
export async function getMatchedSignals(userSignalId: number): Promise<MatchApiResponse> {
  try {
    const response = await api.get<MatchApiResponse>(`/signals/match/${userSignalId}`);
    return response;
  } catch (error) {
    console.error("Error fetching matched signals:", error);
    throw error;
  }
}

/**
 * Pobiera sygnały zalogowanego użytkownika (alias dla getUserSignals)
 */
export async function getMySignals(): Promise<Signal[]> {
  return getUserSignals();
}

// Mapowanie typu sygnału na signal_category_id
const signalTypeToCategory: Record<SignalType, number> = {
  freelancer: 1,
  idea: 2,
  investor: 3,
};

export interface CreateSignalRequest {
  signal_category_id: number;
  details: Record<string, unknown>;
}

export interface CreateSignalResponse {
  id: number;
  user_id: number;
  signal_category_id: number;
  details: Record<string, unknown> | null;
  created_at: string;
  is_active: boolean;
}

/**
 * Tworzy nowy sygnał
 * @param type - typ sygnału: 'freelancer' | 'idea' | 'investor'
 * @param details - szczegóły sygnału (dowolny JSON)
 */
export async function createSignal(
  type: SignalType,
  details: Record<string, unknown>
): Promise<CreateSignalResponse> {
  const payload: CreateSignalRequest = {
    signal_category_id: signalTypeToCategory[type],
    details,
  };

  console.log("createSignal - calling api.post with payload:", payload);
  const result = await api.post<CreateSignalResponse>("/signals/", payload);
  console.log("createSignal - result:", result);
  return result;
}
