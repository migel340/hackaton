interface RadarErrorStateProps {
  error?: string | null;
  onRetry: () => void;
}

export const RadarErrorState = ({ error, onRetry }: RadarErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="alert alert-error max-w-md">
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
        <span>{error || "Brak danych"}</span>
      </div>
      <button className="btn btn-primary mt-4" onClick={onRetry}>
        Spróbuj ponownie
      </button>
    </div>
  );
};
