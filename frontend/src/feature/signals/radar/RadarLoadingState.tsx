export const RadarLoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <span className="loading loading-spinner loading-lg text-primary" />
      <p className="mt-4 text-base-content/70">Skanowanie radaru...</p>
    </div>
  );
};
