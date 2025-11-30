interface ProfileHeaderProps {
  title: string;
  description: string;
}

const ProfileHeader = ({ title, description }: ProfileHeaderProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center">
          <span className="text-2xl">👤</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
            {title}
          </h1>
        </div>
      </div>
      <p className="text-base-content/60 ml-15">{description}</p>
    </div>
  );
};

export default ProfileHeader;
