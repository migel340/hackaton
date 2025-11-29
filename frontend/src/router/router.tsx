import { createBrowserRouter, redirect } from "react-router";
import LoginPage from "@/pages/auth/login/LoginPage";
import RegisterPage from "@/pages/auth/register/RegisterPage";
import MainLayout from "@layouts/MainLayout";
import { action as loginAction } from "@/pages/auth/login/action";
import { isAuthenticated } from "@/api/auth";
import AddSignalPage from "@/pages/signals/add/AddSignalPage";
import RadarPage from "@/pages/radar/RadarPage";

function redirectIfAuthenticated() {
  if (isAuthenticated()) {
    return redirect("/");
  }
  return null;
}

function requireAuth() {
  if (!isAuthenticated()) {
    return redirect("/login");
  }
  return null;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
    action: loginAction,
    loader: redirectIfAuthenticated,
  },
  {
    path: "/register",
    element: <RegisterPage />,
    loader: redirectIfAuthenticated,
  },
  {
    id: "root",
    element: <MainLayout />,
    loader: requireAuth,
    children: [
      {
        path: "/signals/add",
        element: <AddSignalPage />,
      },
      {
        path: "/",
        element: <RadarPage />,
      },
    ],
  },
]);
