import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Places from "./pages/Places";
import PlaceDetail from "./pages/PlaceDetail";
import Plan from "./pages/Plan";
import Checkout from "./pages/Checkout";
import Receipt from "./pages/Receipt";
import Dashboard from "./pages/Dashboard";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user } = useAuth();
  const location = useLocation();

  const hideNav = ["/login", "/register"].includes(location.pathname);

  return (
    <>
      {!hideNav && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to={user ? "/home" : "/login"} replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/places" element={<Places />} />
        <Route path="/places/:id" element={<PlaceDetail />} />
        <Route
          path="/plan"
          element={
            <ProtectedRoute>
              <Plan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/receipt/:id"
          element={
            <ProtectedRoute>
              <Receipt />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}