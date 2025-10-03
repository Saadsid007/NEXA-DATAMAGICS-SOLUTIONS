import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { FiSearch, FiFilter, FiMoreVertical, FiDownload, FiTrash2, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import * as XLSX from "xlsx";

// Pagination Component
const Pagination = ({ usersPerPage, totalUsers, paginate, currentPage }) => {
  const pageNumbers = [];
  const totalPages = Math.ceil(totalUsers / usersPerPage);

  if (totalPages <= 1) return null;

  // Logic to show limited page numbers (e.g., 1 ... 4 5 6 ... 10)
  const maxPagesToShow = 5;
  let startPage, endPage;
  if (totalPages <= maxPagesToShow) {
    startPage = 1;
    endPage = totalPages;
  } else {
    const maxPagesBeforeCurrent = Math.floor(maxPagesToShow / 2);
    const maxPagesAfterCurrent = Math.ceil(maxPagesToShow / 2) - 1;
    if (currentPage <= maxPagesBeforeCurrent) {
      startPage = 1;
      endPage = maxPagesToShow;
    } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
      startPage = totalPages - maxPagesToShow + 1;
      endPage = totalPages;
    } else {
      startPage = currentPage - maxPagesBeforeCurrent;
      endPage = currentPage + maxPagesAfterCurrent;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav>
      <ul className="inline-flex items-center -space-x-px text-sm">
        <li>
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiChevronLeft />
          </button>
        </li>
        {startPage > 1 && (
          <>
            <li>
              <button onClick={() => paginate(1)} className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700">1</button>
            </li>
            {startPage > 2 && <li><span className="px-3 py-2 border border-gray-300 bg-white">...</span></li>}
          </>
        )}
        {pageNumbers.map(number => (
          <li key={number}>
            <button
              onClick={() => paginate(number)}
              className={`px-3 py-2 leading-tight border border-gray-300 ${
                currentPage === number
                  ? 'text-indigo-600 bg-indigo-50 font-semibold'
                  : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              {number}
            </button>
          </li>
        ))}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <li><span className="px-3 py-2 border border-gray-300 bg-white">...</span></li>}
            <li>
              <button onClick={() => paginate(totalPages)} className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700">{totalPages}</button>
            </li>
          </>
        )}
        <li>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiChevronRight />
          </button>
        </li>
      </ul>
    </nav>
  );
};

const UsersPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null); // To control which menu is open
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(15); // Users per page

  // Fetch users and handle auth
  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/getUsers");
        if (!res.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await res.json();
        setUsers(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [session, status, router]);

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return users;
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(s) ||
        user.email?.toLowerCase().includes(s) ||
        user.employeeCode?.toLowerCase().includes(s)
    );
  }, [searchTerm, users]);

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = useMemo(() => {
    return filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  }, [filteredUsers, indexOfFirstUser, indexOfLastUser]);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle clicking outside the menu to close it
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (openMenuId && !event.target.closest(".action-menu-container")) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [openMenuId]);

  // Calculate role counts
  const roleCounts = useMemo(() => {
    return users.reduce((acc, user) => {
      if (user.role) {
        acc[user.role] = (acc[user.role] || 0) + 1;
      }
      return acc;
    }, { admin: 0, manager: 0, user: 0 });
  }, [users]);

  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      const res = await fetch("/api/users/updateRole", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!res.ok) throw new Error("Failed to update role");

      // Update user in local state
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      setOpenMenuId(null); // Close menu
    } catch (err) {
      console.error(err);
      alert("Error updating user role.");
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete the user "${userName}"? This action cannot be undone.`)) {
      try {
        const res = await fetch("/api/deleteUser", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to delete user");
        }

        // Remove user from local state to update UI
        setUsers(users.filter(u => u._id !== userId));
        alert("User deleted successfully.");
      } catch (err) {
        console.error(err);
        alert(`Error: ${err.message}`);
      }
    }
  };

  const handleExportUser = (user) => {
    const userData = {
        Name: user.name,
        Email: user.email,
        Phone: user.phone,
        EmployeeCode: user.employeeCode,
        Designation: user.designation,
        DateOfJoining: user.dateOfJoining,
        ShiftTiming: user.shiftTiming,
        WorkLocation: user.workLocation,
        CurrentCity: user.currentCity,
        SystemServiceTag: user.systemServiceTag,
        ManagerAssign: user.managerAssign,
        EmploymentType: user.employmentType,
        HoldingAssets: user.holdingAssets,
        Process: user.process,
        // Add any other fields you want to export
    };
    const worksheet = XLSX.utils.json_to_sheet([userData]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "UserData");
    XLSX.writeFile(workbook, `${user.name}_data.xlsx`);
    setOpenMenuId(null); // Close menu
  };

  const handleExportAllUsers = () => {
    const allUsersData = users.map(user => ({
        Name: user.name,
        Email: user.email,
        Phone: user.phone,
        EmployeeCode: user.employeeCode,
        Designation: user.designation,
        DateOfJoining: user.dateOfJoining,
        ShiftTiming: user.shiftTiming,
        WorkLocation: user.workLocation,
        CurrentCity: user.currentCity,
        SystemServiceTag: user.systemServiceTag,
        ManagerAssign: user.managerAssign,
        EmploymentType: user.employmentType,
        HoldingAssets: user.holdingAssets,
        Process: user.process,
    }));
    const worksheet = XLSX.utils.json_to_sheet(allUsersData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AllUsersData");
    XLSX.writeFile(workbook, "all_users_data.xlsx");
  };

  if (status === "loading" || loading) {
    return (
        <div className="flex justify-center items-center h-screen">
          <p className="text-lg">Loading users...</p>
        </div>
    );
  }

  if (!session || session.user.role !== "admin") {
    return (
        <div className="p-8">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p>You must be an admin to view this page.</p>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50 text-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="sm:flex sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your team members and their account permissions here.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-4 flex items-center gap-3">
              <button className="h-9 px-3 rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 inline-flex items-center gap-2">
                <FiFilter className="h-4 w-4" />
                Filters
              </button>
              <button
                onClick={handleExportAllUsers}
                className="h-9 px-3 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 inline-flex items-center gap-2"
              >
                <FiDownload className="h-4 w-4" />
                Export All Users
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6">
            <div className="relative w-full max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or code..."
                className="w-full h-10 pl-10 pr-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {error && <p className="mt-4 text-red-500">Error: {error}</p>}

          {/* Users Table */}
          <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100">
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="p-3 font-medium">Username</th>
                    <th className="p-3 font-medium">EmployeeCode</th>
                    <th className="p-3 font-medium">Designation</th>
                    <th className="p-3 font-medium">Date of Joining</th>
                    <th className="p-3 font-medium">Email address</th>
                    <th className="p-3 w-20 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {currentUsers.map((user) => (
                    <tr key={user._id || user.employeeCode} className="text-sm hover:bg-gray-50">
                      <td className="p-3 font-medium">
                        <Link
                          href={
                            user._id === session.user.id
                              ? `/admin/profile`
                              : `/admin/user/${user.employeeCode}`
                          }
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          {user.name}
                        </Link>
                      </td>
                      <td className="p-3 text-gray-700">{user.employeeCode}</td>
                      <td className="p-3 text-gray-700">{user.designation}</td>
                      <td className="p-3 text-gray-700">{user.dateOfJoining}</td>
                      <td className="p-3 text-gray-700">{user.email}</td>
                      <td className="p-3 relative action-menu-container">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === user._id ? null : user._id)}
                          className="p-2 rounded-full hover:bg-gray-100"
                        >
                          <FiMoreVertical size={16} />
                        </button>
                        {openMenuId === user._id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                            <button
                              onClick={() => handleRoleChange(user._id, user.role)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              {user.role === 'admin' ? 'Make User' : 'Make Admin'}
                            </button>
                            <button
                              onClick={() => handleExportUser(user)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Export Data
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user._id, user.name)}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                              Delete User
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {currentUsers.length === 0 && !loading && (
              <div className="text-center py-12 bg-white">
                <p className="text-gray-500">No users found.</p>
              </div>
            )}
            {/* Footer / Pagination */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-100 border-t border-gray-200 flex-wrap gap-4">
              <div className="flex gap-x-6 gap-y-2 text-sm text-gray-600 flex-wrap">
                <div>
                  Total Users: <span className="font-semibold text-gray-900">{users.length}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-500"></span>
                  Admins: <span className="font-semibold text-gray-900">{roleCounts.admin || 0}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                  Managers: <span className="font-semibold text-gray-900">{roleCounts.manager || 0}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  Users: <span className="font-semibold text-gray-900">{roleCounts.user || 0}</span>
                </div>
              </div>
              <Pagination
                usersPerPage={usersPerPage}
                totalUsers={filteredUsers.length}
                paginate={paginate}
                currentPage={currentPage}
              />
            </div>
          </div>
        </div>
      </div>
  );
};

export default UsersPage;