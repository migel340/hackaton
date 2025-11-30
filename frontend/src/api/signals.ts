import { api } from "./api";
import type { SignalType, Category, Skill } from "@/feature/signals/signalSchema";

// Typy dla sygnałów - nowa struktura z API
export interface SignalDetails {
  // Common fields
  name?: string;
  title?: string;
  description?: string;
  categories?: Category[];
  
  // Investor specific
  type?: string; // np. "Angel Investor"
  ticket_size?: string;
  investment_stage?: string[]; // etapy inwestycji (array)
  focus_areas?: string[];
  criteria?: string[];
  value_add?: string[];
  budget_min?: number;
  budget_max?: number;
  
  // Freelancer specific
  hourly_rate?: number;
  skills?: Skill[];
  experience?: string;
  availability?: string;
  
  // Idea specific (nowa struktura z API)
  stage?: string; // np. "MVP gotowe" - etap projektu
  looking_for?: string[]; // kogo szukamy (array)
  funding_needed?: string; // np. "500k PLN"
  market_size?: string;
  traction?: string;
  
  // Idea specific (stara struktura)
  funding_min?: number;
  funding_max?: number;
  needed_skills?: Skill[];
  problem?: string;
  solution?: string;
  market?: string;
}

// Helper do wyciągania tytułu z details
export function getSignalTitle(details: SignalDetails | null | undefined): string {
  if (!details) return "Brak szczegółów";
  
  // Jeśli ma name lub title, użyj go
  if (details.name) return details.name;
  if (details.title) return details.title;
  
  // Dla inwestora - użyj typu
  if (details.type) return details.type;
  
  // Dla freelancera - użyj pierwszego skilla lub "Freelancer"
  if (details.skills && details.skills.length > 0) {
    return `Freelancer: ${details.skills.slice(0, 2).join(", ")}`;
  }
  
  // Dla idei - użyj problemu lub "Pomysł"
  if (details.problem) return details.problem.slice(0, 50) + (details.problem.length > 50 ? "..." : "");
  
  // Fallback
  return "Sygnał";
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
export interface MatchItem {
  signal_id: number;
  accurate: number;
  details: SignalDetails | null;
  signal_category_id?: number;
  username?: string;
  user_id?: number;
}

export interface MatchApiResponse {
  source_signal_id: number;
  matches: MatchItem[];
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
