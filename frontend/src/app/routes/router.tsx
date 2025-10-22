import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { paths } from "@/app/routes/paths";

const IndexPage = lazy(() => import("@/app/routes/index.page"));

export const router = createBrowserRouter([
    {
        path: paths.home,
        element: <AppLayout />,
        children: [
            { index: true, element: <IndexPage /> },
        ],
    },
]);