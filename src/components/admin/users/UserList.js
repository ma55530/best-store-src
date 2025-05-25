import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../../../AppContext";

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
        const searchParam = searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : "";
        const url = `${process.env.REACT_APP_WEBAPI_URL}/users?_page=${page}&_limit=${pageSize}${searchParam}`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + userCredentials.accessToken
                }
            });

            if (response.status === 401) {
                setUserCredentials(null);
                navigate("/");
                return;
            }

            const totalCount = response.headers.get("X-Total-Count");
            const pages = Math.ceil(totalCount / pageSize);
            setTotalPages(pages);

            const data = await response.json();
            if (response.ok) {
                setUsers(data);
                setCurrentPage(page);
            } else {
                alert("Unable to fetch users: " + JSON.stringify(data));
            }
        } catch (error) {
            alert("Failed to connect to the server.");
        }
    }

    const handleRoleEdit = (userId, currentRole) => {
        setEditingUserId(userId);
        setNewRole(currentRole);
    };

    const saveRoleChange = async (userId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_WEBAPI_URL}/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userCredentials.accessToken}`
                },
                body: JSON.stringify({ role: newRole })
            });

            if (response.ok) {
                fetchUsers(currentPage);
                setEditingUserId(null);
                setNewRole("");
            } else {
                const data = await response.json();
                alert("Failed to update role: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            alert("Error updating role");
        }
    };

    const initiateDelete = (userId) => {
        setDeletingUserId(userId);
        setDeletePassword("");
        setDeleteError("");
    };

    const handleDelete = async (userId) => {
        try {
            // First verify admin password using the correct endpoint
            const verifyResponse = await fetch(`${process.env.REACT_APP_WEBAPI_URL}/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: userCredentials.user.email,
                    password: deletePassword
                })
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok || !verifyData.accessToken) {
                setDeleteError("Incorrect admin password");
                return;
            }

            // Proceed with deletion
            const deleteResponse = await fetch(`${process.env.REACT_APP_WEBAPI_URL}/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${userCredentials.accessToken}`
                }
            });

            if (deleteResponse.ok) {
                setDeletingUserId(null);
                setDeletePassword("");
                setDeleteError("");
                fetchUsers(currentPage);
            } else {
                const errorData = await deleteResponse.json();
                setDeleteError(errorData.message || "Failed to delete user");
            }
        } catch (error) {
            console.error('Delete error:', error);
            setDeleteError("Error processing request");
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
                        <th>ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Role</th>
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
                <div className="modal fade show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Deletion</h5>
                                <button className="btn-close" onClick={() => setDeletingUserId(null)}></button>
                            </div>
                            <div className="modal-body">
                                <p>Enter admin password to confirm deletion:</p>
                                <input
                                    type="password"
                                    className="form-control mb-2"
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                />
                                {deleteError && <div className="text-danger">{deleteError}</div>}
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setDeletingUserId(null)}>
                                    Cancel
                                </button>
                                <button className="btn btn-danger" onClick={() => handleDelete(deletingUserId)}>
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
