"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";

const INITIAL_USERS = [
  {
    id: "USR-001",
    name: "System Administrator",
    email: "admin@brightspark.co.ke",
    phone: "0712345678",
    role: "admin",
    branch: "All Branches",
    status: "Active",
    createdAt: "2026-09-01",
  },
  {
    id: "USR-002",
    name: "John Employee",
    email: "john@brightspark.co.ke",
    phone: "0723456789",
    role: "employee",
    branch: "Roysambu",
    status: "Active",
    createdAt: "2026-09-15",
  },
  {
    id: "USR-003",
    name: "Jane Employee",
    email: "jane@brightspark.co.ke",
    phone: "0734567890",
    role: "employee",
    branch: "Rangau",
    status: "Active",
    createdAt: "2026-09-18",
  },
];

export default function AdminUsersPage() {
  const router = useRouter();

  const { user, loading, isAuthenticated } = useAuth();

  const [users, setUsers] = useState(INITIAL_USERS);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "employee",
    branch: "Roysambu",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace("/login");
        return;
      }

      if (user?.role !== "admin") {
        router.replace("/employee");
      }
    }
  }, [loading, isAuthenticated, user, router]);

  const filteredUsers = useMemo(() => {
    return users.filter((item) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        item.name.toLowerCase().includes(searchText) ||
        item.email.toLowerCase().includes(searchText) ||
        item.phone.includes(searchText) ||
        item.id.toLowerCase().includes(searchText);

      const matchesRole =
        roleFilter === "All" ||
        item.role === roleFilter;

      const matchesBranch =
        branchFilter === "All" ||
        item.branch === branchFilter;

      const matchesStatus =
        statusFilter === "All" ||
        item.status === statusFilter;

      return (
        matchesSearch &&
        matchesRole &&
        matchesBranch &&
        matchesStatus
      );
    });
  }, [
    users,
    search,
    roleFilter,
    branchFilter,
    statusFilter,
  ]);

  const adminCount = users.filter(
    (item) => item.role === "admin"
  ).length;

  const employeeCount = users.filter(
    (item) => item.role === "employee"
  ).length;

  const activeCount = users.filter(
    (item) => item.status === "Active"
  ).length;

  const openAddModal = () => {
    setEditingUser(null);

    setForm({
      name: "",
      email: "",
      phone: "",
      role: "employee",
      branch: "Roysambu",
      password: "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const openEditModal = (selectedUser) => {
    setEditingUser(selectedUser);

    setForm({
      name: selectedUser.name,
      email: selectedUser.email,
      phone: selectedUser.phone,
      role: selectedUser.role,
      branch:
        selectedUser.branch === "All Branches"
          ? "All Branches"
          : selectedUser.branch,
      password: "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleRoleChange = (event) => {
    const role = event.target.value;

    setForm((previous) => ({
      ...previous,
      role,
      branch:
        role === "admin"
          ? "All Branches"
          : previous.branch === "All Branches"
            ? "Roysambu"
            : previous.branch,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Please enter the user's full name.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter the user's email.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Please enter the user's phone number.");
      return;
    }

    if (!editingUser && !form.password) {
      setError("Please enter a temporary password.");
      return;
    }

    if (!editingUser && form.password.length < 6) {
      setError(
        "The temporary password must contain at least 6 characters."
      );
      return;
    }

    if (
      form.role === "employee" &&
      form.branch === "All Branches"
    ) {
      setError(
        "An employee must be assigned to a specific branch."
      );
      return;
    }

    if (editingUser) {
      setUsers((previous) =>
        previous.map((item) =>
          item.id === editingUser.id
            ? {
                ...item,
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                role: form.role,
                branch:
                  form.role === "admin"
                    ? "All Branches"
                    : form.branch,
              }
            : item
        )
      );

      setSuccess("User updated successfully.");

      setTimeout(() => {
        closeModal();
      }, 700);

      return;
    }

    const emailExists = users.some(
      (item) =>
        item.email.toLowerCase() ===
        form.email.trim().toLowerCase()
    );

    if (emailExists) {
      setError("A user with this email already exists.");
      return;
    }

    const newUser = {
      id: `USR-${String(users.length + 1).padStart(3, "0")}`,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      role: form.role,
      branch:
        form.role === "admin"
          ? "All Branches"
          : form.branch,
      status: "Active",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setUsers((previous) => [newUser, ...previous]);

    setSuccess("User created successfully.");

    setForm({
      name: "",
      email: "",
      phone: "",
      role: "employee",
      branch: "Roysambu",
      password: "",
    });

    setTimeout(() => {
      closeModal();
    }, 700);
  };

  const toggleStatus = (selectedUser) => {
    if (selectedUser.id === user?.id) {
      alert("You cannot deactivate your own account.");
      return;
    }

    const newStatus =
      selectedUser.status === "Active"
        ? "Inactive"
        : "Active";

    const confirmed = window.confirm(
      `${newStatus === "Inactive" ? "Deactivate" : "Activate"} ${
        selectedUser.name
      }?`
    );

    if (!confirmed) {
      return;
    }

    setUsers((previous) =>
      previous.map((item) =>
        item.id === selectedUser.id
          ? {
              ...item,
              status: newStatus,
            }
          : item
      )
    );
  };

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("All");
    setBranchFilter("All");
    setStatusFilter("All");
  };

  if (
    loading ||
    !isAuthenticated ||
    user?.role !== "admin"
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-[#02337D] text-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <button
            onClick={() => router.push("/admin")}
            className="mb-3 text-sm text-blue-100 hover:text-white"
          >
            ← Back to Dashboard
          </button>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                User Management
              </h1>

              <p className="mt-1 text-sm text-blue-100">
                Manage BrightSpark administrators and employees.
              </p>
            </div>

            <button
              onClick={openAddModal}
              className="rounded-lg bg-[#FE7401] px-5 py-3 font-semibold text-white hover:bg-orange-600"
            >
              + Add User
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Summary */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <SummaryCard
            title="Total Users"
            value={users.length}
          />

          <SummaryCard
            title="Administrators"
            value={adminCount}
          />

          <SummaryCard
            title="Employees"
            value={employeeCount}
          />

          <SummaryCard
            title="Active Users"
            value={activeCount}
          />
        </div>

        {/* Filters */}
        <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Search & Filters
              </h2>

              <p className="text-sm text-slate-500">
                Find users by name, role, branch or status.
              </p>
            </div>

            <button
              onClick={clearFilters}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Clear Filters
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase text-slate-500">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search users..."
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#FE7401]"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase text-slate-500">
                Role
              </label>

              <select
                value={roleFilter}
                onChange={(event) =>
                  setRoleFilter(event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#FE7401]"
              >
                <option value="All">All Roles</option>
                <option value="admin">Admin</option>
                <option value="employee">
                  Employee
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase text-slate-500">
                Branch
              </label>

              <select
                value={branchFilter}
                onChange={(event) =>
                  setBranchFilter(event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#FE7401]"
              >
                <option value="All">All Branches</option>
                <option value="Roysambu">
                  Roysambu
                </option>
                <option value="Rangau">
                  Rangau
                </option>
                <option value="All Branches">
                  All Branches
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase text-slate-500">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#FE7401]"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">
                  Inactive
                </option>
              </select>
            </div>
          </div>
        </section>

        {/* Users Table */}
        <section className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-bold text-slate-900">
              System Users
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredUsers.length} user
              {filteredUsers.length !== 1 ? "s" : ""} found.
            </p>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-slate-500">
                No users match your filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      User
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Contact
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Role
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Branch
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Created
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {item.name}
                          </p>

                          <p className="text-xs text-slate-500">
                            {item.id}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-700">
                          {item.email}
                        </p>

                        <p className="text-xs text-slate-500">
                          {item.phone}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.role === "admin"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-orange-50 text-orange-700"
                          }`}
                        >
                          {item.role === "admin"
                            ? "Admin"
                            : "Employee"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {item.branch}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.status === "Active"
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {item.createdAt}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              openEditModal(item)
                            }
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              toggleStatus(item)
                            }
                            className={`rounded-lg px-3 py-2 text-sm font-medium ${
                              item.status === "Active"
                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                : "bg-green-50 text-green-600 hover:bg-green-100"
                            }`}
                          >
                            {item.status === "Active"
                              ? "Deactivate"
                              : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-[#02337D]">
                  {editingUser
                    ? "Edit User"
                    : "Add New User"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingUser
                    ? "Update the user's account details."
                    : "Create an administrator or employee account."}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="text-2xl text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="max-h-[calc(90vh-150px)] overflow-y-auto px-6 py-6">
              {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {success}
                </div>
              )}

              <form
                id="user-form"
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#FE7401]"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="user@brightspark.co.ke"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#FE7401]"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="07XXXXXXXX"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#FE7401]"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Role
                  </label>

                  <select
                    name="role"
                    value={form.role}
                    onChange={handleRoleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-[#FE7401]"
                  >
                    <option value="employee">
                      Employee
                    </option>

                    <option value="admin">
                      Administrator
                    </option>
                  </select>
                </div>

                {/* Branch */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Branch
                  </label>

                  <select
                    name="branch"
                    value={form.branch}
                    onChange={handleChange}
                    disabled={form.role === "admin"}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none disabled:bg-slate-100 disabled:text-slate-500 focus:border-[#FE7401]"
                  >
                    {form.role === "admin" ? (
                      <option value="All Branches">
                        All Branches
                      </option>
                    ) : (
                      <>
                        <option value="Roysambu">
                          Roysambu
                        </option>

                        <option value="Rangau">
                          Rangau
                        </option>
                      </>
                    )}
                  </select>

                  {form.role === "admin" && (
                    <p className="mt-2 text-xs text-slate-500">
                      Administrators can manage both branches.
                    </p>
                  )}
                </div>

                {/* Password */}
                {!editingUser && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Temporary Password
                    </label>

                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Minimum 6 characters"
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-[#FE7401]"
                    />

                    <p className="mt-2 text-xs text-slate-500">
                      The user should change this password after
                      signing in.
                    </p>
                  </div>
                )}
              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex shrink-0 justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-slate-300 px-5 py-3 font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="user-form"
                className="rounded-lg bg-[#FE7401] px-5 py-3 font-semibold text-white hover:bg-orange-600"
              >
                {editingUser
                  ? "Save Changes"
                  : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-[#02337D]">
        {value}
      </p>
    </div>
  );
}