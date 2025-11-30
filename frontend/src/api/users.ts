import { api } from "./api";

export interface User {
  id: number;
  username: string;
  email: string | null;
  is_active: boolean;
  created_at: string | null;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  website: string | null;
  skills: string[] | null;
  experience_years: number | null;
}

export interface UserUpdateData {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
  website?: string;
  skills?: string[];
  experience_years?: number;
}

export async function getCurrentUser(): Promise<User> {
  return api.get<User>("/users/me");
}

export async function updateCurrentUser(data: UserUpdateData): Promise<User> {
  return api.put<User>("/users/me", data);
}

export async function getUserById(userId: number): Promise<User> {
  return api.get<User>(`/users/${userId}`);
}
