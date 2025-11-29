import { createBrowserRouter } from "react-router";
import LoginPage from "@/pages/auth/login/LoginPage";
import RegisterPage from "@/pages/auth/register/RegisterPage";
import MainLayout from "@layouts/MainLayout";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    id: "root",
    element: <MainLayout />,
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
        path: "/dashboard",
        element: (
          <div>
            <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
            <p>Dashboard content goes here.</p>
          </div>
        ),
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
