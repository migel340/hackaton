import type { ActionFunctionArgs } from "react-router";
import { createSignal } from "@api/signals";
import type { SignalType } from "@/feature/signals/signalSchema";

export type ActionData = {
  ok: boolean;
  message?: string;
  redirectTo?: string;
  errors?: Record<string, string>;
};

export async function addSignalAction({ request }: ActionFunctionArgs): Promise<ActionData> {
  const formData = await request.formData();
  
  // Pobierz dane z formularza
  const type = formData.get("type") as SignalType;
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoriesRaw = formData.get("categories");
  const skillsRaw = formData.get("skills");
  const neededSkillsRaw = formData.get("needed_skills");
  
  // Walidacja podstawowa
  const errors: Record<string, string> = {};
  
  if (!type || !["investor", "freelancer", "idea"].includes(type)) {
    errors.type = "Wybierz rodzaj sygnału";
  }
  
  if (!title || title.length < 3) {
    errors.title = "Tytuł musi mieć minimum 3 znaki";
  }
  
  if (!description || description.length < 10) {
    errors.description = "Opis musi mieć minimum 10 znaków";
  }
  
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  
  // Przygotuj details w zależności od typu
  const details: Record<string, unknown> = {
    title,
    description,
  };
  
  // Parsuj categories
  if (categoriesRaw) {
    try {
      details.categories = JSON.parse(String(categoriesRaw));
    } catch {
      details.categories = [];
    }
  }
  
  // Pola specyficzne dla typu
  if (type === "investor") {
    details.budget_min = Number(formData.get("budget_min")) || 0;
    details.budget_max = Number(formData.get("budget_max")) || 0;
  } else if (type === "freelancer") {
    details.hourly_rate = Number(formData.get("hourly_rate")) || undefined;
    if (skillsRaw) {
      try {
        details.skills = JSON.parse(String(skillsRaw));
      } catch {
        details.skills = [];
      }
    }
  } else if (type === "idea") {
    details.funding_min = Number(formData.get("funding_min")) || 0;
    details.funding_max = Number(formData.get("funding_max")) || 0;
    if (neededSkillsRaw) {
      try {
        details.needed_skills = JSON.parse(String(neededSkillsRaw));
      } catch {
        details.needed_skills = [];
      }
    }
  }
  
  try {
    console.log("Creating signal with type:", type, "details:", details);
    const result = await createSignal(type, details);
    console.log("Signal created:", result);
    
    // Save new signal ID to localStorage so it becomes the main activity
    localStorage.setItem("selectedUserSignalId", String(result.id));
    
    return { ok: true, redirectTo: "/", message: "Sygnał został utworzony!" };
  } catch (error: unknown) {
    console.error("Error creating signal:", error);
    const message = error instanceof Error ? error.message : "Wystąpił błąd podczas tworzenia sygnału";
    return { ok: false, message };
  }
}
