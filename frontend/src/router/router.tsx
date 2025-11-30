import { createBrowserRouter } from "react-router";
import LoginPage from "@/pages/auth/login/LoginPage";
import MainLayout from "@layouts/MainLayout";
import { action as loginAction } from "@/pages/auth/login/action";
import AddSignalPage from "@/pages/signals/add/AddSignalPage";
import RadarPage from "@/pages/radar/RadarPage";
import ProfilePage from "@/pages/profile/ProfilePage";
import { addSignalAction } from "@pages/signals/add/action";
import { RadarLoader } from "@pages/radar/loader";
import { profileLoader } from "@pages/profile/loader";
import { profileAction } from "@pages/profile/action";

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
        action: addSignalAction,
      },
      {
        path: "/",
        element: <RadarPage />,
        loader: RadarLoader,
      },
      {
        path: "/profile",
        element: <ProfilePage />,
        loader: profileLoader,
        action: profileAction,
      },
    ],
  },
]);
