import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function EmployeeLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={["employee"]}>
      {children}
    </ProtectedRoute>
  );
}