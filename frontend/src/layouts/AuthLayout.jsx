import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f9fafb",
      }}
    >
      <Outlet />
    </div>
  );
}
