
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  signalSchema,
  type SignalFormData,
  type SignalType,
  signalTypes,
  signalTypeLabels,
  categories,
  categoryLabels,
  skills,
  skillLabels,
  type Category,
  type Skill,
} from "./signalSchema";
import RangeSlider from "@components/RangeSlider";
import BadgeSelect from "@components/Category";

interface SignalFormProps {
  onSubmit: (data: SignalFormData) => void;
  isLoading?: boolean;
}

const SignalForm = ({ onSubmit, isLoading = false }: SignalFormProps) => {
  const [signalType, setSignalType] = useState<SignalType>("investor");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<SignalFormData>({
    resolver: zodResolver(signalSchema),
    defaultValues: {
      type: "investor",
      title: "",
      description: "",
      categories: [],
      budget_min: 0,
      budget_max: 0,
    } as SignalFormData,
  });

  const handleTypeChange = (type: SignalType) => {
    setSignalType(type);
    
    if (type === "investor") {
      reset({
        type: "investor",
        title: "",
        description: "",
        categories: [],
        budget_min: 0,
        budget_max: 0,
      });
    } else if (type === "freelancer") {
      reset({
        type: "freelancer",
        title: "",
        description: "",
        categories: [],
        skills: [],
        hourly_rate: undefined,
      });
    } else {
      reset({
        type: "idea",
        title: "",
        description: "",
        categories: [],
        funding_min: 0,
        funding_max: 0,
        needed_skills: [],
      });
    }
  };

  const handleFormSubmit = (data: SignalFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold text-lg">Rodzaj sygnału</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {signalTypes.map((type) => (
            <button
              key={type}
              type="button"
              className={`btn ${signalType === type ? "btn-primary" : "btn-outline"}`}
              onClick={() => handleTypeChange(type)}
            >
              {signalTypeLabels[type]}
            </button>
          ))}
        </div>
        <input type="hidden" {...register("type")} value={signalType} />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Tytuł</span>
        </label>
        <input
          type="text"
          {...register("title")}
          className={`input input-bordered w-full ${errors.title ? "input-error" : ""}`}
          placeholder={
            signalType === "investor"
              ? "np. Inwestycja w FinTech"
              : signalType === "freelancer"
              ? "np. Senior React Developer"
              : "np. Innowacyjna platforma EdTech"
          }
        />
        {errors.title && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.title.message}</span>
          </label>
        )}
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">
            {signalType === "investor"
              ? "Opis inwestycji"
              : signalType === "freelancer"
              ? "Opis umiejętności"
              : "Opis startupu"}
          </span>
        </label>
        <textarea
          {...register("description")}
          className={`textarea textarea-bordered w-full h-32 ${
            errors.description ? "textarea-error" : ""
          }`}
          placeholder={
            signalType === "investor"
              ? "Opisz, w jakie projekty chcesz inwestować..."
              : signalType === "freelancer"
              ? "Opisz swoje doświadczenie i umiejętności..."
              : "Opisz swój pomysł na startup..."
          }
        />
        {errors.description && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.description.message}</span>
          </label>
        )}
      </div>

      {signalType === "investor" && (
        <div className="space-y-4">
          <Controller
            name={"budget_min" as keyof SignalFormData}
            control={control}
            render={({ field: minField }) => (
              <Controller
                name={"budget_max" as keyof SignalFormData}
                control={control}
                render={({ field: maxField }) => (
                  <RangeSlider
                    label="Budżet inwestycji"
                    minValue={Number(minField.value) || 0}
                    maxValue={Number(maxField.value) || 100000}
                    min={0}
                    max={5000000}
                    step={10000}
                    onChange={(min, max) => {
                      minField.onChange(min);
                      maxField.onChange(max);
                    }}
                    error={(errors as any).budget_max?.message || (errors as any).budget_min?.message}
                  />
                )}
              />
            )}
          />
        </div>
      )}

      {signalType === "freelancer" && (
        <div className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Stawka godzinowa (PLN) - opcjonalnie</span>
            </label>
            <Controller
              name={"hourly_rate" as keyof SignalFormData}
              control={control}
              render={({ field }) => (
                <input
                  type="number"
                  className="input input-bordered w-full"
                  placeholder="150"
                  min="0"
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    field.onChange(val === "" ? undefined : Number(val));
                  }}
                  onWheel={(e) => e.currentTarget.blur()}
                />
              )}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Umiejętności</span>
            </label>
            <Controller
              name={"skills" as keyof SignalFormData}
              control={control}
              render={({ field }) => (
                <BadgeSelect<Skill>
                  options={skills}
                  labels={skillLabels}
                  value={(field.value as unknown as Skill[]) || []}
                  onChange={field.onChange}
                />
              )}
            />
            {(errors as any).skills && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {(errors as any).skills.message}
                </span>
              </label>
            )}
          </div>
        </div>
      )}

      {signalType === "idea" && (
        <div className="space-y-4">
          <Controller
            name={"funding_min" as keyof SignalFormData}
            control={control}
            render={({ field: minField }) => (
              <Controller
                name={"funding_max" as keyof SignalFormData}
                control={control}
                render={({ field: maxField }) => (
                  <RangeSlider
                    label="Potrzebne finansowanie"
                    minValue={Number(minField.value) || 0}
                    maxValue={Number(maxField.value) || 500000}
                    min={0}
                    max={10000000}
                    step={50000}
                    onChange={(min, max) => {
                      minField.onChange(min);
                      maxField.onChange(max);
                    }}
                    error={(errors as any).funding_max?.message || (errors as any).funding_min?.message}
                  />
                )}
              />
            )}
          />

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Poszukiwani specjaliści</span>
            </label>
            <Controller
              name={"needed_skills" as keyof SignalFormData}
              control={control}
              render={({ field }) => (
                <BadgeSelect<Skill>
                  options={skills}
                  labels={skillLabels}
                  value={(field.value as unknown as Skill[]) || []}
                  onChange={field.onChange}
                />
              )}
            />
            {(errors as any).needed_skills && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {(errors as any).needed_skills.message}
                </span>
              </label>
            )}
          </div>
        </div>
      )}

      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Kategorie</span>
        </label>
        <Controller
          name="categories"
          control={control}
          render={({ field }) => (
            <BadgeSelect<Category>
              options={categories}
              labels={categoryLabels}
              value={(field.value as Category[]) || []}
              onChange={field.onChange}
              variant="accent"
            />
          )}
        />
        {errors.categories && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.categories.message}</span>
          </label>
        )}
      </div>

      <div className="form-control mt-8">
        <button
          type="submit"
          className={`btn btn-primary btn-lg w-full ${isLoading ? "loading" : ""}`}
          disabled={isLoading}
        >
          {isLoading ? "Tworzenie..." : "Utwórz sygnał"}
        </button>
      </div>
    </form>
  );
};

export default SignalForm;