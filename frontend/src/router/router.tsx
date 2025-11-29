import { createBrowserRouter } from "react-router-dom";
import LoginPage from "@/pages/auth/login/LoginPage";
import App from "@/App";

import { action as loginAction } from "@/pages/auth/login/action";

export const router = createBrowserRouter([
  {
    id: "root",
    path: "/",
    element: <App />,
  },
  {
    path: "/login",
    element: <LoginPage />,
    action: loginAction,
  },
]);
