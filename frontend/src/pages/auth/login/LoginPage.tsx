import React, { useEffect, useState } from "react";
import { Link, useFetcher, useNavigate } from "react-router-dom";

type ActionData = {
  ok?: boolean;
  message?: string;
  redirectTo?: string;
  fieldErrors?: {
    email?: string;
    password?: string;
  };
};

export default function LoginPage() {
  const navigate = useNavigate();
  const fetcher = useFetcher<ActionData>();
  const [showPwd, setShowPwd] = useState(false);

  const isSubmitting = fetcher.state === "submitting";

  useEffect(() => {
    if (!fetcher.data) return;
    if (fetcher.data.redirectTo) {
      navigate(fetcher.data.redirectTo);
    } else if (fetcher.data.ok) {
      navigate("/dashboard");
    }
  }, [fetcher.data, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-base-200">
      <div className="card w-full max-w-sm shadow-xl bg-base-100">
        <div className="card-body gap-4">
          <h2 className="card-title text-2xl justify-center mb-2">Logowanie</h2>

          {fetcher.data?.message && !fetcher.data.ok && (
            <div role="alert" className="alert alert-error">
              <span>{fetcher.data.message}</span>
            </div>
          )}

          <fetcher.Form method="post" className="flex flex-col gap-4">
            {/* EMAIL */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                name="email"
                type="email"
                placeholder="email@example.com"
                className={`input input-bordered ${
                  fetcher.data?.fieldErrors?.email ? "input-error" : ""
                }`}
                autoComplete="email"
                required
              />
              {(fetcher.data?.fieldErrors?.email || null) && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {fetcher.data?.fieldErrors?.email}
                  </span>
                </label>
              )}
            </div>

            {/* PASSWORD */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Hasło</span>
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••"
                  className={`input input-bordered w-full pr-12 ${
                    fetcher.data?.fieldErrors?.password ? "input-error" : ""
                  }`}
                  autoComplete="current-password"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-xs absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPwd((v) => !v)}
                >
                  {showPwd ? "Ukryj" : "Pokaż"}
                </button>
              </div>
              {(fetcher.data?.fieldErrors?.password || null) && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {fetcher.data?.fieldErrors?.password}
                  </span>
                </label>
              )}
            </div>

            {/* REMEMBER */}
            <label className="cursor-pointer flex items-center gap-2">
              <input
                name="remember"
                type="checkbox"
                className="checkbox checkbox-sm"
              />
              <span className="label-text">Zapamiętaj mnie</span>
            </label>

            {/* SUBMIT */}
            <button
              className={`btn btn-primary w-full ${
                isSubmitting ? "btn-disabled" : ""
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <span className="loading loading-spinner loading-sm mr-2" />
              )}
              {isSubmitting ? "Logowanie..." : "Zaloguj się"}
            </button>

            <div className="divider">lub</div>

            <p className="text-sm text-gray-600 text-center mt-2">
              Nie masz konta?{" "}
              <Link
                to="/register"
                className="text-indigo-600 hover:text-indigo-700"
              >
                Zarejestruj się
              </Link>
            </p>
          </fetcher.Form>
        </div>
      </div>
    </div>
  );
}
