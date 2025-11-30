import { useState } from "react";
import type { ProfileFormData, ProfileUser } from "./types";
import ProfileCard from "./ProfileCard";
import ProfileInput from "./ProfileInput";
import ProfileTextarea from "./ProfileTextarea";
import { useLanguage } from "@/i18n";

interface ProfileFormProps {
  user: ProfileUser;
  onSubmit: (formData: FormData) => void;
  isSubmitting: boolean;
}

const ProfileForm = ({ user, onSubmit, isSubmitting }: ProfileFormProps) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<ProfileFormData>({
    username: user.username || "",
    email: user.email || "",
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    bio: user.bio || "",
    avatar_url: user.avatar_url || "",
    location: user.location || "",
    linkedin_url: user.linkedin_url || "",
    github_url: user.github_url || "",
    website: user.website || "",
    skills: user.skills?.join(", ") || "",
    experience_years: user.experience_years?.toString() || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (value) {
        form.append(key, value);
      }
    });

    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info Card */}
      <ProfileCard title={t.basicInfo} icon="📋">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProfileInput
            label={t.username}
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            minLength={3}
            maxLength={50}
            icon="👤"
          />
          <ProfileInput
            label={t.email}
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            icon="✉️"
          />
          <ProfileInput
            label={t.firstName}
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            maxLength={50}
          />
          <ProfileInput
            label={t.lastName}
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            maxLength={50}
          />
        </div>
        <div className="mt-4">
          <ProfileTextarea
            label={t.aboutMe}
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            maxLength={500}
            placeholder={t.aboutMePlaceholder}
          />
        </div>
      </ProfileCard>

      {/* Location & Experience Card */}
      <ProfileCard title={t.locationAndExperience} icon="🌍">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProfileInput
            label={t.location}
            name="location"
            value={formData.location}
            onChange={handleChange}
            maxLength={100}
            placeholder={t.locationPlaceholder}
            icon="📍"
          />
          <ProfileInput
            label={t.experienceYears}
            name="experience_years"
            type="number"
            value={formData.experience_years}
            onChange={handleChange}
            min={0}
            max={50}
            icon="⏱️"
          />
        </div>
        <div className="mt-4">
          <ProfileInput
            label={t.skills}
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder={t.skillsPlaceholder}
            icon="🛠️"
          />
        </div>
      </ProfileCard>

      {/* Social Links Card */}
      <ProfileCard title={t.socialLinks} icon="🔗">
        <div className="space-y-4">
          <ProfileInput
            label="URL awatara"
            name="avatar_url"
            type="url"
            value={formData.avatar_url}
            onChange={handleChange}
            placeholder="https://example.com/avatar.jpg"
            icon="🖼️"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProfileInput
              label="LinkedIn"
              name="linkedin_url"
              type="url"
              value={formData.linkedin_url}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/username"
              icon="💼"
            />
            <ProfileInput
              label="GitHub"
              name="github_url"
              type="url"
              value={formData.github_url}
              onChange={handleChange}
              placeholder="https://github.com/username"
              icon="🐙"
            />
          </div>
          <ProfileInput
            label={t.website}
            name="website"
            type="url"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://mojastrona.pl"
            icon="🌐"
          />
        </div>
      </ProfileCard>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="btn btn-primary btn-lg gap-2 shadow-lg hover:shadow-primary/25 transition-all"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              {t.saving}
            </>
          ) : (
            <>
              <span>💾</span>
              {t.saveChanges}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;
