export interface ProfileFormData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio: string;
  avatar_url: string;
  location: string;
  linkedin_url: string;
  github_url: string;
  website: string;
  skills: string;
  experience_years: string;
}

export interface ProfileUser {
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
