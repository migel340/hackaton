import React, { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState({ email: false, password: false });

  function validateEmail(email) {
    const el = document.createElement("input");
    el.type = "email";
    el.value = email;
    return el.checkValidity();
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const emailValid = validateEmail(email);
    const pwdValid = password.length >= 6;

    setErrors({ email: !emailValid, password: !pwdValid });
    if (!emailValid || !pwdValid) return;

    alert(`Zalogowano jako: ${email}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-base-200">
      <div className="card w-full max-w-sm shadow-xl bg-base-100">
        <form className="card-body gap-4" onSubmit={handleSubmit}>
          <h2 className="card-title text-2xl justify-center mb-2">Logowanie</h2>

          {/* EMAIL */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              placeholder="email@example.com"
              className={`input input-bordered ${
                errors.email ? "input-error" : ""
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <label className="label">
                <span className="label-text-alt text-error">
                  Niepoprawny adres email.
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
                type={showPwd ? "text" : "password"}
                placeholder="••••••"
                className={`input input-bordered w-full pr-12 ${
                  errors.password ? "input-error" : ""
                }`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-ghost btn-xs absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowPwd(!showPwd)}
              >
                {showPwd ? "Ukryj" : "Pokaż"}
              </button>
            </div>
            {errors.password && (
              <label className="label">
                <span className="label-text-alt text-error">
                  Min. 6 znaków.
                </span>
              </label>
            )}
          </div>

          {/* SUBMIT */}
          <button className="btn btn-primary w-full">Zaloguj się</button>

          <div className="divider">lub</div>

          <p className="text-center text-sm">
            Nie masz konta? <a className="link link-primary">Zarejestruj się</a>
          </p>
        </form>
      </div>
    </div>
  );
}
