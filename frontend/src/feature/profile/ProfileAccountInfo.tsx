import type { ProfileUser } from "./types";

interface ProfileAccountInfoProps {
  user: ProfileUser;
}

const ProfileAccountInfo = ({ user }: ProfileAccountInfoProps) => {
  return (
    <div className="mt-8 p-4 bg-base-200/30 rounded-xl border border-base-content/5">
      <div className="flex flex-wrap items-center gap-4 text-sm text-base-content/50">
        <div className="flex items-center gap-2">
          <span className="text-base-content/30">🆔</span>
          <span>ID: {user.id}</span>
        </div>
        <div className="w-px h-4 bg-base-content/20 hidden sm:block" />
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              user.is_active ? "bg-success" : "bg-error"
            }`}
          />
          <span>{user.is_active ? "Konto aktywne" : "Konto nieaktywne"}</span>
        </div>
        <div className="w-px h-4 bg-base-content/20 hidden sm:block" />
        <div className="flex items-center gap-2">
          <span className="text-base-content/30">📅</span>
          <span>
            Utworzono:{" "}
            {user.created_at
              ? new Date(user.created_at).toLocaleDateString("pl-PL", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "—"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfileAccountInfo;
