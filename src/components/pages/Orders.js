import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../AppContext';

const getStatusStyles = (status) => {
    switch (status) {
        case 'pending':
            return { color: 'warning', text: 'Pending' };
        case 'processing':
            return { color: 'info', text: 'Processing' };
        case 'shipped':
            return { color: 'primary', text: 'Shipped' };
        case 'delivered':
            return { color: 'success', text: 'Delivered' };
        case 'cancelled':
            return { color: 'danger', text: 'Cancelled' };
        default:
            return { color: 'secondary', text: status };
    }
};

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sortField, setSortField] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState('desc');
    const { userCredentials } = useContext(AppContext);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_WEBAPI_URL}/orders?userId=${userCredentials.user.id}`, {
                    headers: {
                        'Authorization': `Bearer ${userCredentials.accessToken}`
                    }
                });
                const data = await response.json();
                setOrders(data);
            } catch (error) {
                alert('Failed to fetch orders');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [userCredentials]);

    const handleSort = (field) => {
        if (field === sortField) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortedOrders = () => {
        return [...orders].sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case 'id':
                    comparison = a.id - b.id;
                    break;
                case 'createdAt':
                    comparison = new Date(a.createdAt) - new Date(b.createdAt);
                    break;
                case 'total':
                    comparison = a.total - b.total;
                    break;
                case 'status':
                    comparison = a.status.localeCompare(b.status);
                    break;
                default:
                    comparison = 0;
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    };

    return (
        <div className="container my-4">
            <h2 className="text-center mb-4">My Orders</h2>

            {isLoading ? (
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center">
                    <p>No orders found</p>
                    <Link to="/" className="btn btn-primary">Start Shopping</Link>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>
                                    <button 
                                        className="btn btn-link text-dark text-decoration-none"
                                        onClick={() => handleSort('id')}
                                    >
                                        Order ID
                                        {sortField === 'id' && (
                                            <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'} ms-1`}></i>
                                        )}
                                    </button>
                                </th>
                                <th>
                                    <button 
                                        className="btn btn-link text-dark text-decoration-none"
                                        onClick={() => handleSort('createdAt')}
                                    >
                                        Date
                                        {sortField === 'createdAt' && (
                                            <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'} ms-1`}></i>
                                        )}
                                    </button>
                                </th>
                                <th>
                                    <button 
                                        className="btn btn-link text-dark text-decoration-none"
                                        onClick={() => handleSort('total')}
                                    >
                                        Total
                                        {sortField === 'total' && (
                                            <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'} ms-1`}></i>
                                        )}
                                    </button>
                                </th>
                                <th>
                                    <button 
                                        className="btn btn-link text-dark text-decoration-none"
                                        onClick={() => handleSort('status')}
                                    >
                                        Status
                                        {sortField === 'status' && (
                                            <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'} ms-1`}></i>
                                        )}
                                    </button>
                                </th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getSortedOrders().map(order => (
                                <tr key={order.id}>
                                    <td>#{order.id}</td>
                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td>${order.total}</td>
                                    <td>
                                        <span className={`badge bg-${getStatusStyles(order.status).color}`}>
                                            {getStatusStyles(order.status).text}
                                        </span>
                                    </td>
                                    <td>
                                        <Link to={`/orders/${order.id}`} className="btn btn-sm btn-outline-primary">
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}