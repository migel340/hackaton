import { json, type ActionFunctionArgs } from "react-router-dom";
import { login } from "../../../api/auth";

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
    return json<ActionData>({ ok: false, fieldErrors }, { status: 400 });
  }

  try {
    const res = await login(email, password, { remember });

    if (res && (res.ok || res.token)) {
      const url = new URL(request.url);
      const redirectParam =
        redirectToRaw || url.searchParams.get("redirectTo") || "/dashboard";

      return json<ActionData>(
        { ok: true, redirectTo: redirectParam },
        { status: 200 }
      );
    }

    // Gdy backend zwróci błąd bez statusu ok
    const message = res?.message || "Logowanie nie powiodło się.";
    return json<ActionData>({ ok: false, message }, { status: 401 });
  } catch (e: any) {
    const message = e?.message || "Wystąpił błąd podczas logowania.";
    return json<ActionData>({ ok: false, message }, { status: 500 });
  }
}
