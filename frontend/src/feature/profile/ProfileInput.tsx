interface ProfileInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: "text" | "email" | "url" | "number";
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  icon?: string;
  hint?: string;
}

const ProfileInput = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  minLength,
  maxLength,
  min,
  max,
  icon,
  hint,
}: ProfileInputProps) => {
  return (
    <div className="form-control w-full">
      <div className="mb-1">
        <span className="text-sm font-medium flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {label}
          {required && <span className="text-error">*</span>}
        </span>
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="input input-bordered w-full bg-base-100/50 focus:bg-base-100 transition-colors focus:border-primary"
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        min={min}
        max={max}
      />
      {hint && (
        <div className="mt-1">
          <span className="text-xs text-base-content/50">{hint}</span>
        </div>
      )}
    </div>
  );
};

export default ProfileInput;
