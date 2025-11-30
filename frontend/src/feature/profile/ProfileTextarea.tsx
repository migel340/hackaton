interface ProfileTextareaProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
  showCounter?: boolean;
}

const ProfileTextarea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  maxLength,
  rows = 4,
  showCounter = true,
}: ProfileTextareaProps) => {
  return (
    <div className="form-control w-full">
      <div className="mb-1">
        <span className="text-sm font-medium">{label}</span>
      </div>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        className="textarea textarea-bordered w-full bg-base-100/50 focus:bg-base-100 transition-colors focus:border-primary resize-none"
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
      />
      {showCounter && maxLength && (
        <div className="mt-1">
          <span className="text-xs text-base-content/50">
            {value.length}/{maxLength} znaków
          </span>
        </div>
      )}
    </div>
  );
};

export default ProfileTextarea;
