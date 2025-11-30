export const RadarLoadingState = () => {
  return (
    <div className="fixed inset-0 lg:left-64 flex flex-col items-center justify-center bg-base-100">
      <span className="loading loading-spinner loading-lg text-primary" />
      <p className="mt-4 text-base-content/70">Skanowanie radaru...</p>
    </div>
  );
};
