import { Outlet } from "react-router";
import MainMenu from "@/components/MainMenu";

const MainLayout = () => {
    return (
        <div className="drawer lg:drawer-open">
            <input id="main-drawer" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content flex flex-col">
                <div className="navbar bg-base-300 lg:hidden">
                    <div className="flex-none">
                        <label htmlFor="main-drawer" className="btn btn-square btn-ghost">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                className="inline-block h-6 w-6 stroke-current"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h16M4 18h16"
                                ></path>
                            </svg>
                        </label>
                    </div>
                    <div className="flex-1">
                        <span className="text-xl font-bold">App Menu</span>
                    </div>
                </div>
                <main className="flex-1 p-6 bg-base-100">
                    <Outlet />
                </main>
            </div>
            <div className="drawer-side">
                <label htmlFor="main-drawer" className="drawer-overlay"></label>
                <MainMenu />
            </div>
        </div>
    );
};

export default MainLayout;