import { useFetcher, useLoaderData } from "react-router-dom";
import type { ProfileLoaderData } from "./loader";
import type { ProfileActionData } from "./action";
import {
  ProfileForm,
  ProfileHeader,
  ProfileAlert,
  ProfileAccountInfo,
} from "@/feature/profile";

const ProfilePage = () => {
  const { user } = useLoaderData() as ProfileLoaderData;
  const fetcher = useFetcher<ProfileActionData>();

  const isSubmitting = fetcher.state === "submitting";
  const actionData = fetcher.data;

  const handleSubmit = (formData: FormData) => {
    fetcher.submit(formData, { method: "put" });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-base-100 via-base-100 to-base-200">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <ProfileHeader
          title="Profil użytkownika"
          description="Edytuj swoje dane profilowe i informacje kontaktowe."
        />

        {/* Alerts */}
        {actionData?.ok && (
          <ProfileAlert
            type="success"
            message={actionData.message || "Zapisano!"}
          />
        )}
        {actionData && !actionData.ok && actionData.message && (
          <ProfileAlert type="error" message={actionData.message} />
        )}

        {/* Form */}
        <ProfileForm
          user={user}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />

        {/* Account Info */}
        <ProfileAccountInfo user={user} />
      </div>
    </div>
  );
};

export default ProfilePage;
