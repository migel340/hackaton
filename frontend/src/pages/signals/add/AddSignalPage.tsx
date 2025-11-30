import SignalForm from "@/feature/signals/SignalForm";
import type { SignalFormData } from "@/feature/signals/signalSchema";
import { useFetcher, useNavigate } from "react-router-dom";
import type { ActionData } from "./action";
import { useEffect } from "react";

const AddSignalPage = () => {
  const fetcher = useFetcher<ActionData>();
  const navigate = useNavigate();

  const isLoading = fetcher.state === "submitting";
  const actionData = fetcher.data;

  // Przekierowanie po sukcesie
  useEffect(() => {
    if (actionData?.ok && actionData.redirectTo) {
      const timer = setTimeout(() => {
        navigate(actionData.redirectTo!);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [actionData, navigate]);

  const handleSubmit = (data: SignalFormData) => {
    const { type, ...details } = data;

    const formData = new FormData();
    formData.append("type", type);
    formData.append("title", details.title);
    formData.append("description", details.description);

    if (details.categories && details.categories.length > 0) {
      formData.append("categories", JSON.stringify(details.categories));
    }

    if (type === "investor") {
      if (details.budget_min) formData.append("budget_min", String(details.budget_min));
      if (details.budget_max) formData.append("budget_max", String(details.budget_max));
    } else if (type === "freelancer") {
      if (details.hourly_rate) formData.append("hourly_rate", String(details.hourly_rate));
      if (details.skills && details.skills.length > 0) {
        formData.append("skills", JSON.stringify(details.skills));
      }
    } else if (type === "idea") {
      if (details.funding_min) formData.append("funding_min", String(details.funding_min));
      if (details.funding_max) formData.append("funding_max", String(details.funding_max));
      if (details.needed_skills && details.needed_skills.length > 0) {
        formData.append("needed_skills", JSON.stringify(details.needed_skills));
      }
    }

    fetcher.submit(formData, { method: "post" });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Utwórz nowy sygnał</h1>
        <p className="text-base-content/70">
          Wybierz rodzaj sygnału i wypełnij formularz, aby dodać swój sygnał na radar.
        </p>
      </div>

      {actionData && !actionData.ok && actionData.message && (
        <div className="alert alert-error mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{actionData.message}</span>
        </div>
      )}

      {actionData?.ok && (
        <div className="alert alert-success mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Sygnał został pomyślnie utworzony! Przekierowuję...</span>
        </div>
      )}

      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <SignalForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default AddSignalPage;