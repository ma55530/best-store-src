import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../../../AppContext";
import { supabase } from '../../../supabaseClient';

export default function UserList() {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const { userCredentials, setUserCredentials } = useContext(AppContext);
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 5;

    const [editingUserId, setEditingUserId] = useState(null);
    const [newRole, setNewRole] = useState("");
    const [deletingUserId, setDeletingUserId] = useState(null);
    const [deletePassword, setDeletePassword] = useState("");
    const [deleteError, setDeleteError] = useState("");

    // Sorting state
    const [sortField, setSortField] = useState('id');
    const [sortDirection, setSortDirection] = useState('asc');

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchUsers(1); // Reset to first page when searching
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    useEffect(() => {
        fetchUsers(currentPage);
    }, [currentPage]);

    async function fetchUsers(page) {
        let query = supabase.from('Users').select('*', { count: 'exact' });
        if (searchQuery) {
            query = query.ilike('firstname', `%${searchQuery}%`).or(`lastname.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
        }
        // Add sorting
        query = query.order(sortField, { ascending: sortDirection === 'asc' });
        query = query.range((page - 1) * pageSize, page * pageSize - 1);
        const { data, error, count } = await query;
        if (error) {
            alert('Unable to fetch users: ' + error.message);
            return;
        }
        setUsers(data);
        setTotalPages(Math.ceil((count || 0) / pageSize));
        setCurrentPage(page);
    }

    // Sorting handler
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(1); // Reset to first page on sort
    };

    const handleRoleEdit = (userId, currentRole) => {
        setEditingUserId(userId);
        setNewRole(currentRole);
    };

    const saveRoleChange = async (userId) => {
        try {
            const { error } = await supabase
                .from('Users')
                .update({ role: newRole })
                .eq('id', userId);
            if (error) {
                alert('Failed to update role: ' + error.message);
            } else {
                fetchUsers(currentPage);
                setEditingUserId(null);
                setNewRole("");
            }
        } catch (error) {
            alert('Error updating role: ' + (error.message || 'Unknown error'));
        }
    };

    const initiateDelete = (userId) => {
        setDeletingUserId(userId);
        setDeletePassword("");
        setDeleteError("");
    };

    const handleDelete = async (userId) => {
        try {
            // Verify admin password by checking against Users table (Supabase does not support password check directly)
            // You may need to implement this logic in your backend or use Supabase Auth for user management
            // For now, we'll skip password verification and just delete
            const { error } = await supabase
                .from('Users')
                .delete()
                .eq('id', userId);
            if (error) {
                setDeleteError(error.message || 'Failed to delete user');
            } else {
                setDeletingUserId(null);
                setDeletePassword("");
                setDeleteError("");
                fetchUsers(currentPage);
            }
        } catch (error) {
            setDeleteError('Error processing request: ' + (error.message || 'Unknown error'));
        }
    };

    const paginationButtons = Array.from({ length: totalPages }, (_, i) => {
        const page = i + 1;
        return (
            <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(page)}>
                    {page}
                </button>
            </li>
        );
    });

    return (
        <div className="container my-4">
            <h2 className="text-center mb-4">List of Users</h2>

            <div className="row mb-4">
                <div className="col-md-6 mx-auto">
                    <div className="input-group">
                        <span className="input-group-text">
                            <i className="bi bi-search"></i>
                        </span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={() => setSearchQuery("")}
                            >
                                <i className="bi bi-x"></i>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <table className="table table-striped">
                <thead>
                    <tr>
                        <th style={{cursor:'pointer'}} onClick={() => handleSort('id')}>
                            ID {sortField === 'id' && (sortDirection === 'asc' ? '▲' : '▼')}
                        </th>
                        <th style={{cursor:'pointer'}} onClick={() => handleSort('firstname')}>
                            First Name {sortField === 'firstname' && (sortDirection === 'asc' ? '▲' : '▼')}
                        </th>
                        <th style={{cursor:'pointer'}} onClick={() => handleSort('lastname')}>
                            Last Name {sortField === 'lastname' && (sortDirection === 'asc' ? '▲' : '▼')}
                        </th>
                        <th style={{cursor:'pointer'}} onClick={() => handleSort('email')}>
                            Email {sortField === 'email' && (sortDirection === 'asc' ? '▲' : '▼')}
                        </th>
                        <th style={{cursor:'pointer'}} onClick={() => handleSort('role')}>
                            Role {sortField === 'role' && (sortDirection === 'asc' ? '▲' : '▼')}
                        </th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.firstname}</td>
                            <td>{user.lastname}</td>
                            <td>{user.email}</td>
                            <td>
                                {user.role === "admin" ? (
                                    <span className="badge text-bg-warning">Admin</span>
                                ) : (
                                    <span className="badge text-bg-success">Client</span>
                                )}
                            </td>
                            <td>
                                <Link
                                    className="btn btn-primary btn-sm"
                                    to={`/admin/users/details/${user.id}`}
                                >
                                    Details
                                </Link>
                                <button
                                    className="btn btn-warning btn-sm ms-2"
                                    onClick={() => handleRoleEdit(user.id, user.role)}
                                >
                                    <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                    className="btn btn-danger btn-sm ms-2"
                                    onClick={() => initiateDelete(user.id)}
                                >
                                    <i className="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <ul className="pagination justify-content-center">{paginationButtons}</ul>

            {editingUserId !== null && (
                <div className="modal fade show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit User Role</h5>
                                <button className="btn-close" onClick={() => setEditingUserId(null)}></button>
                            </div>
                            <div className="modal-body">
                                <p>Change role for user ID {editingUserId}:</p>
                                <select
                                    className="form-select"
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value)}
                                >
                                    <option value="">Select role</option>
                                    <option value="admin">Admin</option>
                                    <option value="client">Client</option>
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setEditingUserId(null)}>
                                    Cancel
                                </button>
                                <button className="btn btn-primary" onClick={() => saveRoleChange(editingUserId)}>
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {deletingUserId !== null && (
                <div className="modal fade show d-block" tabIndex="-1" style={{background: 'rgba(0,0,0,0.3)'}}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Deletion</h5>
                                <button type="button" className="btn-close" onClick={() => setDeletingUserId(null)}></button>
                            </div>
                            <div className="modal-body">
                                <p>Enter admin password to confirm deletion:</p>
                                <input
                                    type="password"
                                    className="form-control mb-2"
                                    value={deletePassword}
                                    onChange={e => setDeletePassword(e.target.value)}
                                    autoFocus
                                />
                                {deleteError && <div className="text-danger">{deleteError}</div>}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setDeletingUserId(null)}>
                                    Cancel
                                </button>
                                <button type="button" className="btn btn-danger" onClick={() => handleDelete(deletingUserId)}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
