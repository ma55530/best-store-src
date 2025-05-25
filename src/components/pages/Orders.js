import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../AppContext';
import { supabase } from '../../supabaseClient';

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
    const [orderItemsMap, setOrderItemsMap] = useState({});

    useEffect(() => {
        const fetchOrdersAndItems = async () => {
            try {
                // Fetch orders for the current user from Supabase
                const { data: ordersData, error: ordersError } = await supabase
                    .from('Orders')
                    .select('*')
                    .eq('user_id', userCredentials.user.id);
                if (ordersError) throw ordersError;
                setOrders(ordersData || []);
                // Fetch all order items for these orders
                const orderIds = (ordersData || []).map(o => o.id);
                if (orderIds.length > 0) {
                    const { data: itemsData, error: itemsError } = await supabase
                        .from('Order_items') // use all lowercase, as Supabase converts table names to lowercase by default
                        .select('order_id, quantity')
                        .in('order_id', orderIds);
                    if (itemsError) {
                        alert('Failed to fetch order items: ' + itemsError.message);
                        setOrderItemsMap({});
                    } else if (itemsData) {
                        // Map order_id to total items
                        const map = {};
                        itemsData.forEach(item => {
                            map[item.order_id] = (map[item.order_id] || 0) + item.quantity;
                        });
                        setOrderItemsMap(map);
                    }
                } else {
                    setOrderItemsMap({});
                }
            } catch (error) {
                // Only show alert if there is a real error, not just empty orders
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrdersAndItems();
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
                    <p>No orders yet, start shopping!</p>
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
                                <th>Items</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getSortedOrders().map(order => (
                                <tr key={order.id}>
                                    <td>#{order.id}</td>
                                    <td>{order.created_at ? new Date(order.created_at).toLocaleString() : ''}</td>
                                    <td>${order.total}</td>
                                    <td>
                                        <span className={`badge bg-${getStatusStyles(order.status).color}`}>
                                            {getStatusStyles(order.status).text}
                                        </span>
                                    </td>
                                    <td>{orderItemsMap[order.id] !== undefined ? orderItemsMap[order.id] : '-'}</td>
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