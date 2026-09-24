import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">

      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col">

        <AdminHeader />

        <main className="flex-1">
          {children}
        </main>

      </div>

    </div>
  );
}