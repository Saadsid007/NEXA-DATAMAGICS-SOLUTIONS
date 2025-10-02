import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import Link from 'next/link';
import { FiDownload, FiSearch, FiMoreVertical, FiX } from 'react-icons/fi';

const ActionMenu = ({ user, onExport }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-gray-200">
                <FiMoreVertical />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            onExport(user);
                            setIsOpen(false);
                        }}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        Export Data
                    </a>
                </div>
            )}
        </div>
    );
};

export default function AssignedUsersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'authenticated' && session.user.role === 'manager') {
            const fetchUsers = async () => {
                setLoading(true);
                try {
                    const res = await fetch('/api/manager/assigned-users');
                    if (!res.ok) throw new Error('Failed to fetch users.');
                    const data = await res.json();
                    setUsers(data);
                    setFilteredUsers(data);
                } catch (error) {
                    toast.error(error.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchUsers();
        }
    }, [status, session]);

    useEffect(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        const filteredData = users.filter(user =>
            (user.name?.toLowerCase().includes(lowercasedFilter)) ||
            (user.employeeCode?.toLowerCase().includes(lowercasedFilter)) ||
            (user.email?.toLowerCase().includes(lowercasedFilter))
        );
        setFilteredUsers(filteredData);
    }, [searchTerm, users]);

    const handleExport = (data, fileName) => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
        toast.success('Data exported successfully!');
    };

    if (status === 'loading' || loading) {
        return <div className="text-center p-10">Loading assigned users...</div>;
    }

    return (
        <>
            <Toaster position="top-center" />
            <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <h1 className="text-3xl font-bold text-gray-800">Assigned Users</h1>
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="relative w-full sm:w-64">
                                <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, code..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <button
                                onClick={() => handleExport(filteredUsers, 'assigned_users_data')}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
                            >
                                <FiDownload /> Download Data
                            </button>
                        </div>
                    </div>

                    <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Username</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee Code</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredUsers.length > 0 ? (
                                        
                                        filteredUsers.map(user => (
                                            <tr key={user._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Link href={`/manager/user/${user.employeeCode}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                                                        {user.name}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.employeeCode}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <ActionMenu user={user} onExport={() => handleExport([user], `${user.name}_data`)} />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-10 text-gray-500">
                                                {searchTerm ? 'No users found for your search.' : 'No users are assigned to you.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="mt-4 text-right text-sm text-gray-600">
                        Total Users: <b>{filteredUsers.length}</b>
                    </div>
                </div>
            </div>
        </>
    );
}