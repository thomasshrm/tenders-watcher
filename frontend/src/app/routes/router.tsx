import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { paths } from "@/app/routes/paths";
import { GuestRoute } from "@/features/auth/guest-route";

const IndexPage = lazy(() => import("@/app/routes/index.page"));
const LoginPage = lazy(() => import("@/app/routes/login.page"));

export const router = createBrowserRouter([
    {
        path: paths.home,
        element: (
            <AppLayout />
        ),
        children: [
            { index: true, element: <IndexPage /> },
            
            {
                element: <GuestRoute />,
                children: [{ path: paths.login, element: <LoginPage /> }],
            },
        ],
    }
]);