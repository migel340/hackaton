import { api } from "./api";
import type { SignalType, Category, Skill } from "@/feature/signals/signalSchema";

// Typy dla sygnałów
export interface SignalMetadata {
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
  id: string;
  type: SignalType;
  title: string;
  match_score: number; // 0.0 to 1.0 (1.0 = perfect match, center of radar)
  user_id: string;
  username?: string;
  metadata: SignalMetadata;
  created_at?: string;
}

export interface MatchedSignalsResponse {
  user_signal: Signal; // Sygnał zalogowanego użytkownika (środek radaru)
  matches: Signal[]; // Dopasowane sygnały innych użytkowników
}

// Mock data dla development - zostanie zastąpione prawdziwym API
function generateMockMatches(): MatchedSignalsResponse {
  const mockUserSignal: Signal = {
    id: "user-signal-1",
    type: "investor",
    title: "Twój sygnał inwestora",
    match_score: 1.0,
    user_id: "current-user",
    username: "Ty",
    metadata: {
      description: "Szukam innowacyjnych startupów w branży FinTech",
      budget_min: 50000,
      budget_max: 200000,
      categories: ["fintech", "saas"],
    },
  };

  const mockMatches: Signal[] = [
    {
      id: "match-1",
      type: "idea",
      title: "Platforma płatności P2P",
      match_score: 0.95,
      user_id: "user-1",
      username: "Jan Kowalski",
      metadata: {
        description: "Innowacyjne rozwiązanie do płatności między użytkownikami",
        funding_min: 100000,
        funding_max: 150000,
        categories: ["fintech"],
        needed_skills: ["backend", "mobile"],
      },
    },
    {
      id: "match-2",
      type: "freelancer",
      title: "Senior Backend Developer",
      match_score: 0.85,
      user_id: "user-2",
      username: "Anna Nowak",
      metadata: {
        description: "10+ lat doświadczenia w fintech",
        hourly_rate: 150,
        skills: ["python", "nodejs", "aws"],
        categories: ["fintech", "saas"],
      },
    },
    {
      id: "match-3",
      type: "idea",
      title: "AI Financial Advisor",
      match_score: 0.78,
      user_id: "user-3",
      username: "Piotr Wiśniewski",
      metadata: {
        description: "Chatbot AI do zarządzania finansami osobistymi",
        funding_min: 80000,
        funding_max: 120000,
        categories: ["fintech", "ai_ml"],
        needed_skills: ["data_science", "frontend"],
      },
    },
    {
      id: "match-4",
      type: "freelancer",
      title: "Full Stack Developer",
      match_score: 0.72,
      user_id: "user-4",
      username: "Maria Zielińska",
      metadata: {
        description: "React & Node.js specialist",
        hourly_rate: 120,
        skills: ["react", "typescript", "nodejs"],
        categories: ["saas", "ecommerce"],
      },
    },
    {
      id: "match-5",
      type: "investor",
      title: "Angel Investor - SaaS",
      match_score: 0.65,
      user_id: "user-5",
      username: "Tomasz Adamski",
      metadata: {
        description: "Inwestuję w early-stage SaaS startups",
        budget_min: 25000,
        budget_max: 100000,
        categories: ["saas"],
      },
    },
    {
      id: "match-6",
      type: "idea",
      title: "Crypto Payment Gateway",
      match_score: 0.58,
      user_id: "user-6",
      username: "Karol Dąbrowski",
      metadata: {
        description: "Bramka płatności kryptowalutowych dla e-commerce",
        funding_min: 200000,
        funding_max: 300000,
        categories: ["fintech", "blockchain"],
        needed_skills: ["backend", "devops"],
      },
    },
    {
      id: "match-7",
      type: "freelancer",
      title: "UI/UX Designer",
      match_score: 0.45,
      user_id: "user-7",
      username: "Ewa Kaczmarek",
      metadata: {
        description: "Specjalizacja w produktach finansowych",
        hourly_rate: 100,
        skills: ["ui_ux"],
        categories: ["fintech", "saas"],
      },
    },
    {
      id: "match-8",
      type: "idea",
      title: "EdTech Learning Platform",
      match_score: 0.35,
      user_id: "user-8",
      username: "Michał Szymański",
      metadata: {
        description: "Platforma do nauki programowania",
        funding_min: 60000,
        funding_max: 90000,
        categories: ["edtech"],
        needed_skills: ["frontend", "backend"],
      },
    },
    {
      id: "match-9",
      type: "investor",
      title: "VC Partner - HealthTech",
      match_score: 0.25,
      user_id: "user-9",
      username: "Agnieszka Lewandowska",
      metadata: {
        description: "Fokus na health tech i wellness",
        budget_min: 100000,
        budget_max: 500000,
        categories: ["healthtech"],
      },
    },
    {
      id: "match-10",
      type: "freelancer",
      title: "Mobile Developer",
      match_score: 0.18,
      user_id: "user-10",
      username: "Krzysztof Woźniak",
      metadata: {
        description: "React Native & Flutter",
        hourly_rate: 130,
        skills: ["mobile", "react"],
        categories: ["gaming", "social"],
      },
    },
  ];

  return {
    user_signal: mockUserSignal,
    matches: mockMatches,
  };
}

/**
 * Pobiera dopasowane sygnały dla zalogowanego użytkownika
 * Sygnał użytkownika jest w środku radaru, reszta rozmieszczona według match_score
 */
export async function getMatchedSignals(): Promise<MatchedSignalsResponse> {
  try {
    // TODO: Zamienić na prawdziwe API gdy endpoint będzie gotowy
    // return await api.get<MatchedSignalsResponse>("/signals/matches");
    
    // Tymczasowo używamy mock data
    await new Promise(resolve => setTimeout(resolve, 500)); // Symulacja opóźnienia sieci
    return generateMockMatches();
  } catch (error) {
    console.error("Error fetching matched signals:", error);
    throw error;
  }
}

/**
 * Pobiera sygnały zalogowanego użytkownika
 */
export async function getMySignals(): Promise<Signal[]> {
  try {
    const response = await api.get<{ signals: Signal[] }>("/signals/me");
    return response.signals;
  } catch (error) {
    console.error("Error fetching my signals:", error);
    throw error;
  }
}

/**
 * Tworzy nowy sygnał
 */
export async function createSignal(data: Omit<Signal, "id" | "match_score" | "user_id">): Promise<Signal> {
  try {
    return await api.post<Signal>("/signals", data);
  } catch (error) {
    console.error("Error creating signal:", error);
    throw error;
  }
}
