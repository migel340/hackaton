import { login } from "../../../api/auth";
import type { ActionFunctionArgs } from "react-router";

type ActionData = {
  ok?: boolean;
  message?: string;
  redirectTo?: string;
  fieldErrors?: {
    email?: string;
    password?: string;
  };
};

function validateEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email);
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const remember = formData.get("remember") === "on";
  const redirectToRaw = String(formData.get("redirectTo") ?? "");

  const fieldErrors: ActionData["fieldErrors"] = {};
  if (!email) fieldErrors.email = "Email jest wymagany.";
  else if (!validateEmail(email)) fieldErrors.email = "Nieprawidłowy email.";

  if (!password) fieldErrors.password = "Hasło jest wymagane.";
  else if (password.length < 6) fieldErrors.password = "Min. 6 znaków.";

  if (fieldErrors.email || fieldErrors.password) {
    return { ok: false, fieldErrors } satisfies ActionData;
  }

  try {
    const res = await login(email, password, { remember });

<<<<<<< HEAD
    console.log("Login response:", res);

    if (res &&  res.access_token) {
=======
    if (res && (res.ok || res.token)) {
>>>>>>> 9f5e3f277cd0c8070cecf85ac21996cb6a512e45
      const url = new URL(request.url);
      const redirectParam =
        redirectToRaw || url.searchParams.get("redirectTo") || "/dashboard";

      return { ok: true, redirectTo: redirectParam } satisfies ActionData;
    }

    const message = res?.message || "Logowanie nie powiodło się.";
    return { ok: false, message } satisfies ActionData;
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : "Wystąpił błąd podczas logowania.";
    return { ok: false, message } satisfies ActionData;
  }
}
