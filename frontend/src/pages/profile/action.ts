import { updateCurrentUser, type UserUpdateData } from "@/api/users";
import type { ActionFunctionArgs } from "react-router";

export interface ProfileActionData {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
}

export async function profileAction({
  request,
}: ActionFunctionArgs): Promise<ProfileActionData> {
  const formData = await request.formData();

  const updateData: UserUpdateData = {};

  const username = formData.get("username");
  if (username && typeof username === "string" && username.trim()) {
    updateData.username = username.trim();
  }

  const email = formData.get("email");
  if (email && typeof email === "string" && email.trim()) {
    updateData.email = email.trim();
  }

  const firstName = formData.get("first_name");
  if (firstName && typeof firstName === "string") {
    updateData.first_name = firstName.trim();
  }

  const lastName = formData.get("last_name");
  if (lastName && typeof lastName === "string") {
    updateData.last_name = lastName.trim();
  }

  const bio = formData.get("bio");
  if (bio && typeof bio === "string") {
    updateData.bio = bio.trim();
  }

  const avatarUrl = formData.get("avatar_url");
  if (avatarUrl && typeof avatarUrl === "string") {
    updateData.avatar_url = avatarUrl.trim();
  }

  const location = formData.get("location");
  if (location && typeof location === "string") {
    updateData.location = location.trim();
  }

  const linkedinUrl = formData.get("linkedin_url");
  if (linkedinUrl && typeof linkedinUrl === "string") {
    updateData.linkedin_url = linkedinUrl.trim();
  }

  const githubUrl = formData.get("github_url");
  if (githubUrl && typeof githubUrl === "string") {
    updateData.github_url = githubUrl.trim();
  }

  const website = formData.get("website");
  if (website && typeof website === "string") {
    updateData.website = website.trim();
  }

  const skillsRaw = formData.get("skills");
  if (skillsRaw && typeof skillsRaw === "string" && skillsRaw.trim()) {
    updateData.skills = skillsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const experienceYears = formData.get("experience_years");
  if (
    experienceYears &&
    typeof experienceYears === "string" &&
    experienceYears.trim()
  ) {
    const parsed = parseInt(experienceYears, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      updateData.experience_years = parsed;
    }
  }

  try {
    await updateCurrentUser(updateData);
    return { ok: true, message: "Profil został zaktualizowany!" };
  } catch (error: unknown) {
    console.error("Failed to update profile:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Wystąpił błąd podczas aktualizacji profilu";

    return {
      ok: false,
      message: errorMessage,
    };
  }
}
