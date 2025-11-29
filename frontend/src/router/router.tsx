import { createBrowserRouter, redirect } from "react-router";
import LoginPage from "@/pages/auth/login/LoginPage";
import RegisterPage from "@/pages/auth/register/RegisterPage";
import MainLayout from "@layouts/MainLayout";
import { action as loginAction } from "@/pages/auth/login/action";
import { isAuthenticated } from "@/api/auth";
import AddSignalPage from "@/pages/signals/add/AddSignalPage";

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
        path: "/",
        element: (
          <div>
            <h1 className="text-3xl font-bold mb-4">Home Page</h1>
            <p>Welcome to the application!</p>
          </div>
        ),
      },
      {
        path: "/signals",
        element: (
          <div>
            <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
            <p>Dashboard content goes here.</p>
          </div>
        ),
      },
      {
        path: "/signals/add",
        element: <AddSignalPage />,
      },
      {
        path: "/settings",
        element: (
          <div>
            <h1 className="text-3xl font-bold mb-4">Settings</h1>
            <p>Settings content goes here.</p>
          </div>
        ),
      },
      {
        path: "/profile",
        element: (
          <div>
            <h1 className="text-3xl font-bold mb-4">Profile</h1>
            <p>Profile content goes here.</p>
          </div>
        ),
      },
    ],
  },
]);
