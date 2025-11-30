import { getCurrentUser, type User } from "@/api/users";
import { redirect } from "react-router";

export interface ProfileLoaderData {
  user: User;
}

export async function profileLoader(): Promise<ProfileLoaderData | Response> {
  const token = localStorage.getItem("auth_token");

  if (!token) {
    return redirect("/login");
  }

  try {
    const user = await getCurrentUser();
    return { user };
  } catch (error) {
    console.error("Failed to load user profile:", error);
    return redirect("/login");
  }
}
