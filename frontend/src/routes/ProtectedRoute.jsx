import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
