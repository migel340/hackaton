import SignalForm from "@/feature/signals/SignalForm";
import type { SignalFormData } from "@/feature/signals/signalSchema";
import { useState } from "react";

const AddSignalPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (data: SignalFormData) => {
    setIsLoading(true);
    try {
      console.log("Signal data:", data);
      
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error creating signal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Utwórz nowy sygnał</h1>
        <p className="text-base-content/70">
          Wybierz rodzaj sygnału i wypełnij formularz, aby dodać swój sygnał na radar.
        </p>
      </div>

      {success && (
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
          <span>Sygnał został pomyślnie utworzony!</span>
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