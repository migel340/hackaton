import { cn } from "@/utils/cn";

const badgeVariants = {
  primary: "bg-primary text-primary-content border-primary",
  secondary: "bg-secondary text-secondary-content border-secondary",
  accent: "bg-accent text-accent-content border-accent",
  neutral: "bg-neutral text-neutral-content border-neutral",
  info: "bg-info text-info-content border-info",
  success: "bg-success text-success-content border-success",
  warning: "bg-warning text-warning-content border-warning",
  error: "bg-error text-error-content border-error",
} as const;

type BadgeVariant = keyof typeof badgeVariants;

interface BadgeSelectProps<T extends string> {
  options: readonly T[];
  labels: Record<T, string>;
  value: T[];
  onChange: (value: T[]) => void;
  variant?: BadgeVariant;
  className?: string;
}

const BadgeSelect = <T extends string>({
  options,
  labels,
  value,
  onChange,
  variant = "accent",
  className,
}: BadgeSelectProps<T>) => {
  const handleChange = (option: T, checked: boolean) => {
    if (checked) {
      onChange([...value, option]);
    } else {
      onChange(value.filter((v) => v !== option));
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => {
        const isSelected = value.includes(option);
        return (
          <label
            key={option}
            className={cn(
              "cursor-pointer select-none rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
              "hover:scale-105 hover:shadow-md active:scale-95",
              isSelected
                ? badgeVariants[variant]
                : "border-base-300 bg-base-100 text-base-content hover:border-base-content/30"
            )}
          >
            <input
              type="checkbox"
              className="hidden"
              checked={isSelected}
              onChange={(e) => handleChange(option, e.target.checked)}
            />
            {labels[option]}
          </label>
        );
      })}
    </div>
  );
};

export default BadgeSelect;