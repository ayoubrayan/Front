import Dashboard from "./components/Dashboard";
import Products from "./components/Products";
import Movements from "./components/Movements";
import Users from "./components/Users";
import Login from "./components/Login";

import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { GlobalStyles } from "@mui/material";
import { useContext } from "react";

import { AuthProvider, AuthContext } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Layout from "./components/Layout";

function AnimatedRoutes() {
    const location = useLocation();
    const { loading } = useContext(AuthContext);

    if (loading) return null;

    return (
        <>
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>

                    <Route path="/login" element={<Login />} />

                    <Route
                        element={
                            <ProtectedRoute>
                                <Layout />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/movements" element={<Movements />} />
                        <Route path="/users" element={<Users />} />
                    </Route>
                </Routes>
            </AnimatePresence>
        </>
    );
}

function App() {
    return (
        <AuthProvider>
            <GlobalStyles
                styles={{
                    body: {
                        scrollbarColor: "#f1f5f9 transparent",
                    },
                    "body::-webkit-scrollbar-track": {
                        background: "transparent",
                    },
                    "body::-webkit-scrollbar-thumb": {
                        backgroundColor: "#f1f5f9",
                        borderRadius: "8px",
                    },
                }}
            />
            <Router>
                <AnimatedRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;