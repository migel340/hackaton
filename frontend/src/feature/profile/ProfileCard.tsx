import type { ReactNode } from "react";

interface ProfileCardProps {
  title: string;
  icon: string;
  children: ReactNode;
}

const ProfileCard = ({ title, icon, children }: ProfileCardProps) => {
  return (
    <div className="card bg-base-200/50 backdrop-blur-sm shadow-lg border border-base-content/5 hover:shadow-xl transition-all duration-300">
      <div className="card-body">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-xl">{icon}</span>
          </div>
          <h2 className="card-title text-lg font-semibold">{title}</h2>
        </div>
        {children}
      </div>
    </div>
  );
};

export default ProfileCard;
