import { createBrowserRouter } from "react-router";
import LoginPage from "@/pages/auth/login/LoginPage";
import MainLayout from "@layouts/MainLayout";
import { action as loginAction } from "@/pages/auth/login/action";
import AddSignalPage from "@/pages/signals/add/AddSignalPage";
import RadarPage from "@/pages/radar/RadarPage";
import { addSignalAction } from "@pages/signals/add/action";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
    action: loginAction,
  },
  {
    id: "root",
    element: <MainLayout />,
    children: [
      {
        path: "/signals/add",
        element: <AddSignalPage />,
        action: addSignalAction
      },
      {
        path: "/",
        element: <RadarPage />,
      },
    ],
  },
]);
