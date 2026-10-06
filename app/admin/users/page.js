"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/AuthContext";

const INITIAL_USERS = [
  {
    id: "USR-001",
    name: "System Administrator",
    email: "admin@brightspark.co.ke",
    phone: "0700000000",
    role: "admin",
    branch: "All Branches",
    status: "active",
    createdAt: "2026-09-01",
  },
  {
    id: "USR-002",
    name: "John Employee",
    email: "john@brightspark.co.ke",
    phone: "0712345678",
    role: "employee",
    branch: "Roysambu",
    status: "active",
    createdAt: "2026-09-05",
  },
  {
    id: "USR-003",
    name: "Jane Employee",
    email: "jane@brightspark.co.ke",
    phone: "0723456789",
    role: "employee",
    branch: "Rangau",
    status: "active",
    createdAt: "2026-09-08",
  },
];

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  role: "employee",
  branch: "Roysambu",
  password: "",
};

export default function UsersPage() {
  const router = useRouter();

  const { user, loading, isAuthenticated } = useAuth();

  const [users, setUsers] = useState(INITIAL_USERS);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);

  const [showPassword, setShowPassword] = useState(false);

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

  if (loading || !isAuthenticated || user?.role !== "admin") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#02337D]" />

          <p className="mt-4 text-sm text-gray-500">
            Loading users...
          </p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter((item) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      item.name.toLowerCase().includes(searchText) ||
      item.email.toLowerCase().includes(searchText) ||
      item.phone.toLowerCase().includes(searchText) ||
      item.id.toLowerCase().includes(searchText);

    const matchesRole =
      roleFilter === "all" || item.role === roleFilter;

    const matchesBranch =
      branchFilter === "all" ||
      item.branch === branchFilter ||
      (branchFilter === "all-branches" &&
        item.branch === "All Branches");

    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;

    return (
      matchesSearch &&
      matchesRole &&
      matchesBranch &&
      matchesStatus
    );
  });

  const openAddModal = () => {
    setEditingUser(null);

    setFormData({
      ...EMPTY_FORM,
    });

    setShowPassword(false);
    setError("");
    setSuccess("");

    setShowModal(true);
  };

  const openEditModal = (selectedUser) => {
    setEditingUser(selectedUser);

    setFormData({
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

    setShowPassword(false);
    setError("");
    setSuccess("");

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData(EMPTY_FORM);
    setShowPassword(false);
    setError("");
    setSuccess("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleRoleChange = (event) => {
    const role = event.target.value;

    setFormData((previous) => ({
      ...previous,
      role,
      branch: role === "admin" ? "All Branches" : "Roysambu",
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Please enter the user's full name.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter the user's email address.");
      return;
    }

    if (!formData.phone.trim()) {
      setError("Please enter the user's phone number.");
      return;
    }

    if (!editingUser && !formData.password.trim()) {
      setError("Please enter a temporary password.");
      return;
    }

    if (!editingUser && formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (editingUser) {
      setUsers((previousUsers) =>
        previousUsers.map((item) =>
          item.id === editingUser.id
            ? {
                ...item,
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                role: formData.role,
                branch:
                  formData.role === "admin"
                    ? "All Branches"
                    : formData.branch,
              }
            : item
        )
      );

      setSuccess("User details updated successfully.");

      setTimeout(() => {
        closeModal();
      }, 900);

      return;
    }

    const newUser = {
      id: `USR-${String(users.length + 1).padStart(3, "0")}`,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      role: formData.role,
      branch:
        formData.role === "admin"
          ? "All Branches"
          : formData.branch,
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setUsers((previousUsers) => [newUser, ...previousUsers]);

    setSuccess(
      `${formData.role === "admin" ? "Administrator" : "Employee"} created successfully.`
    );

    setTimeout(() => {
      closeModal();
    }, 900);
  };

  const toggleUserStatus = (selectedUser) => {
    if (selectedUser.id === user?.id) {
      setError("You cannot deactivate your own account.");
      return;
    }

    const newStatus =
      selectedUser.status === "active"
        ? "inactive"
        : "active";

    setUsers((previousUsers) =>
      previousUsers.map((item) =>
        item.id === selectedUser.id
          ? {
              ...item,
              status: newStatus,
            }
          : item
      )
    );

    setSuccess(
      `${selectedUser.name} has been ${
        newStatus === "active"
          ? "activated"
          : "deactivated"
      }.`
    );

    setTimeout(() => {
      setSuccess("");
    }, 2500);
  };

  const activeUsers = users.filter(
    (item) => item.status === "active"
  ).length;

  const employeeCount = users.filter(
    (item) => item.role === "employee"
  ).length;

  const adminCount = users.filter(
    (item) => item.role === "admin"
  ).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* ============================================================
            HEADER
        ============================================================ */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#FE7401]">
              User Management
            </p>

            <h1 className="mt-1 text-3xl font-bold text-[#02337D]">
              Users
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage administrators and employees across BrightSpark
              branches.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#02337D] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#01295f]"
          >
            <span className="text-lg">+</span>
            Add User
          </button>
        </div>

        {/* ============================================================
            SUCCESS / ERROR MESSAGES
        ============================================================ */}
        {success && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {success}
          </div>
        )}

        {error && !showModal && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* ============================================================
            SUMMARY CARDS
        ============================================================ */}
        <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Users"
            value={users.length}
            icon="👥"
          />

          <SummaryCard
            title="Active Users"
            value={activeUsers}
            icon="✅"
          />

          <SummaryCard
            title="Administrators"
            value={adminCount}
            icon="🛡️"
          />

          <SummaryCard
            title="Employees"
            value={employeeCount}
            icon="👨‍💼"
          />
        </div>

        {/* ============================================================
            FILTERS
        ============================================================ */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="lg:col-span-1">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Search
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Name, email, phone..."
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#02337D] focus:ring-2 focus:ring-[#02337D]/10"
                />

                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  🔍
                </span>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Role
              </label>

              <select
                value={roleFilter}
                onChange={(event) =>
                  setRoleFilter(event.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#02337D] focus:ring-2 focus:ring-[#02337D]/10"
              >
                <option value="all">All Roles</option>
                <option value="admin">Administrators</option>
                <option value="employee">Employees</option>
              </select>
            </div>

            {/* Branch */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Branch
              </label>

              <select
                value={branchFilter}
                onChange={(event) =>
                  setBranchFilter(event.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#02337D] focus:ring-2 focus:ring-[#02337D]/10"
              >
                <option value="all">All Branches</option>
                <option value="Roysambu">Roysambu</option>
                <option value="Rangau">Rangau</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#02337D] focus:ring-2 focus:ring-[#02337D]/10"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* ============================================================
            USERS TABLE
        ============================================================ */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-[#02337D]">
                System Users
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {filteredUsers.length} user
                {filteredUsers.length !== 1 ? "s" : ""} displayed
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setRoleFilter("all");
                setBranchFilter("all");
                setStatusFilter("all");
              }}
              className="text-sm font-semibold text-[#FE7401] hover:underline"
            >
              Clear filters
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-4">User</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Branch</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Created</th>
                  <th className="px-5 py-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-5 py-12 text-center"
                    >
                      <div className="text-3xl">👥</div>

                      <p className="mt-3 font-semibold text-gray-700">
                        No users found
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Try changing your search or filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50/70"
                    >
                      {/* User */}
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {item.name}
                            {item.id === user?.id && (
                              <span className="ml-2 rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-[#02337D]">
                                YOU
                              </span>
                            )}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {item.email}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {item.phone}
                          </p>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4">
                        <RoleBadge role={item.role} />
                      </td>

                      {/* Branch */}
                      <td className="px-5 py-4">
                        <BranchBadge branch={item.branch} />
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <StatusBadge status={item.status} />
                      </td>

                      {/* Created */}
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {item.createdAt}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(item)
                            }
                            className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-[#02337D] transition hover:bg-blue-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              toggleUserStatus(item)
                            }
                            disabled={item.id === user?.id}
                            className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                              item.id === user?.id
                                ? "cursor-not-allowed bg-gray-100 text-gray-400"
                                : item.status === "active"
                                ? "border border-red-200 text-red-600 hover:bg-red-50"
                                : "border border-green-200 text-green-600 hover:bg-green-50"
                            }`}
                          >
                            {item.status === "active"
                              ? "Deactivate"
                              : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================================================================
          ADD / EDIT USER MODAL
      ================================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#FE7401]">
                  {editingUser ? "Edit User" : "User Management"}
                </p>

                <h2 className="mt-1 text-xl font-bold text-[#02337D]">
                  {editingUser
                    ? "Edit User Details"
                    : "Add New User"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="max-h-[calc(90vh-145px)] overflow-y-auto">
              <form
                onSubmit={handleSubmit}
                className="space-y-5 p-6"
              >
                {/* Error */}
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#02337D] focus:ring-2 focus:ring-[#02337D]/10"
                    required
                  />
                </div>

                {/* Email + Phone */}
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Email Address
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="user@brightspark.co.ke"
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#02337D] focus:ring-2 focus:ring-[#02337D]/10"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="07XXXXXXXX"
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#02337D] focus:ring-2 focus:ring-[#02337D]/10"
                      required
                    />
                  </div>
                </div>

                {/* Role + Branch */}
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Role
                    </label>

                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleRoleChange}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#02337D] focus:ring-2 focus:ring-[#02337D]/10"
                    >
                      <option value="employee">
                        Employee
                      </option>

                      <option value="admin">
                        Administrator
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Branch
                    </label>

                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      disabled={formData.role === "admin"}
                      className={`w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#02337D] focus:ring-2 focus:ring-[#02337D]/10 ${
                        formData.role === "admin"
                          ? "cursor-not-allowed bg-gray-100 text-gray-500"
                          : "bg-white"
                      }`}
                    >
                      {formData.role === "admin" ? (
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

                    {formData.role === "admin" && (
                      <p className="mt-2 text-xs text-gray-500">
                        Administrators can manage both branches.
                      </p>
                    )}
                  </div>
                </div>

                {/* ======================================================
                    PASSWORD
                ====================================================== */}
                {!editingUser && (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Temporary Password
                    </label>

                    <div className="relative">
                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter temporary password"
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-sm outline-none transition focus:border-[#02337D] focus:ring-2 focus:ring-[#02337D]/10"
                        required
                      />

                      {/* SVG EYE BUTTON */}
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (previous) => !previous
                          )
                        }
                        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-[#02337D]"
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        title={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? (
                          /* ==================================================
                             EYE WITH SLASH - PASSWORD VISIBLE
                          ================================================== */
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-5 w-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3.98 8.223A10.477 10.477 0 0 0 2.25 12c1.5 4.5 5.61 7.75 9.75 7.75 1.51 0 2.95-.36 4.22-1"
                            />

                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6.228 6.228A10.45 10.45 0 0 1 12 4.25c4.14 0 8.25 3.25 9.75 7.75a10.49 10.49 0 0 1-2.32 3.76"
                            />

                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 3l18 18"
                            />

                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M10.58 10.58a2 2 0 0 0 2.83 2.83"
                            />
                          </svg>
                        ) : (
                          /* ==================================================
                             NORMAL EYE - PASSWORD HIDDEN
                          ================================================== */
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-5 w-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 12s3.75-7.75 9.75-7.75S21.75 12 21.75 12 18 19.75 12 19.75 2.25 12 2.25 12Z"
                            />

                            <circle
                              cx="12"
                              cy="12"
                              r="3"
                            />
                          </svg>
                        )}
                      </button>
                    </div>

                    <p className="mt-2 text-xs text-gray-500">
                      The employee can use this password to log in.
                    </p>
                  </div>
                )}

                {/* Editing password note */}
                {editingUser && (
                  <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                    <p className="text-sm font-medium text-[#02337D]">
                      Password
                    </p>

                    <p className="mt-1 text-xs text-gray-600">
                      Password changes will be handled separately.
                      Editing this user's details will not change their
                      current password.
                    </p>
                  </div>
                )}

                {/* Modal Footer */}
                <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-xl bg-[#02337D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#01295f]"
                  >
                    {editingUser
                      ? "Save Changes"
                      : "Create User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   SUMMARY CARD
========================================================================== */

function SummaryCard({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-[#02337D]">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   ROLE BADGE
========================================================================== */

function RoleBadge({ role }) {
  const isAdmin = role === "admin";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        isAdmin
          ? "bg-purple-50 text-purple-700"
          : "bg-blue-50 text-[#02337D]"
      }`}
    >
      {isAdmin ? "Administrator" : "Employee"}
    </span>
  );
}

/* ==========================================================================
   BRANCH BADGE
========================================================================== */

function BranchBadge({ branch }) {
  const isRoysambu = branch === "Roysambu";

  const isAllBranches = branch === "All Branches";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        isAllBranches
          ? "bg-purple-50 text-purple-700"
          : isRoysambu
          ? "bg-blue-50 text-[#02337D]"
          : "bg-orange-50 text-[#FE7401]"
      }`}
    >
      {branch}
    </span>
  );
}

/* ==========================================================================
   STATUS BADGE
========================================================================== */

function StatusBadge({ status }) {
  const isActive = status === "active";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        isActive
          ? "bg-green-50 text-green-700"
          : "bg-gray-100 text-gray-500"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}