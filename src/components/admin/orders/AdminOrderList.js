import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../../AppContext';
import { supabase } from '../../../supabaseClient';

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

export default function AdminOrderList() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sortField, setSortField] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState('desc');
    const { userCredentials } = useContext(AppContext);
    const [orderItemsMap, setOrderItemsMap] = useState({});

    useEffect(() => {
        fetchOrdersAndItems();
    }, [userCredentials]);

    const fetchOrdersAndItems = async () => {
        try {
            // Fetch all orders from Supabase
            const { data: ordersData, error: ordersError } = await supabase
                .from('Orders')
                .select('*');
            if (ordersError) throw ordersError;
            setOrders(ordersData || []);
            // Fetch all order items for these orders
            const orderIds = (ordersData || []).map(o => o.id);
            if (orderIds.length > 0) {
                const { data: itemsData, error: itemsError } = await supabase
                    .from('Order_items')
                    .select('order_id, quantity')
                    .in('order_id', orderIds);
                if (!itemsError && itemsData) {
                    // Map order_id to total items
                    const map = {};
                    itemsData.forEach(item => {
                        map[item.order_id] = (map[item.order_id] || 0) + item.quantity;
                    });
                    setOrderItemsMap(map);
                }
            }
        } catch (error) {
            alert('Failed to fetch orders');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const { error } = await supabase
                .from('Orders')
                .update({ status: newStatus })
                .eq('id', orderId);
            if (error) throw new Error('Failed to update order status');
            fetchOrdersAndItems();
        } catch (error) {
            alert(error.message);
        }
    };

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
                case 'user':
                    comparison = a.user_id - b.user_id;
                    break;
                default:
                    comparison = 0;
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    };

    return (
        <div className="container my-4">
            <h2 className="text-center mb-4">Order Management</h2>
            {isLoading ? (
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center">
                    <p>No orders found</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('id')}>
                                    Order ID {sortField === 'id' && 
                                    <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>}
                                </th>
                                <th onClick={() => handleSort('user')}>
                                    User ID {sortField === 'user' && 
                                    <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>}
                                </th>
                                <th onClick={() => handleSort('createdAt')}>
                                    Date {sortField === 'createdAt' && 
                                    <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>}
                                </th>
                                <th onClick={() => handleSort('total')}>
                                    Total {sortField === 'total' && 
                                    <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>}
                                </th>
                                <th onClick={() => handleSort('status')}>
                                    Status {sortField === 'status' && 
                                    <i className={`bi bi-arrow-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>}
                                </th>
                                <th>Items</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getSortedOrders().map(order => (
                                <tr key={order.id}>
                                    <td>#{order.id}</td>
                                    <td>{order.user_id}</td>
                                    <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}</td>
                                    <td>${order.total}</td>
                                    <td>
                                        <div className={`d-flex align-items-center`}>
                                            <select 
                                                className={`form-select form-select-sm me-2 text-${getStatusStyles(order.status).color}`}
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            >
                                                <option value="pending" className="text-warning">Pending</option>
                                                <option value="processing" className="text-info">Processing</option>
                                                <option value="shipped" className="text-primary">Shipped</option>
                                                <option value="delivered" className="text-success">Delivered</option>
                                                <option value="cancelled" className="text-danger">Cancelled</option>
                                            </select>
                                            <span className={`badge bg-${getStatusStyles(order.status).color}`}>
                                                {getStatusStyles(order.status).text}
                                            </span>
                                        </div>
                                    </td>
                                    <td>{orderItemsMap[order.id] || 0}</td>
                                    <td>
                                        <Link 
                                            to={`/admin/orders/${order.id}`} 
                                            className="btn btn-sm btn-outline-primary"
                                        >
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