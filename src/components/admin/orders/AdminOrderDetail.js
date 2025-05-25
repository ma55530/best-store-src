import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../../../AppContext';
import { supabase } from '../../../supabaseClient';

const getStatusColor = (status) => {
    switch (status) {
        case 'pending':
            return 'text-warning';
        case 'processing':
            return 'text-info';
        case 'shipped':
            return 'text-primary';
        case 'delivered':
            return 'text-success';
        case 'cancelled':
            return 'text-danger';
        default:
            return '';
    }
};

export default function AdminOrderDetail() {
    const [order, setOrder] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { userCredentials } = useContext(AppContext);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const fetchOrderDetails = async () => {
        try {
            // Fetch order
            const { data: orderData, error: orderError } = await supabase
                .from('Orders')
                .select('*')
                .eq('id', id)
                .single();
            if (orderError || !orderData) throw new Error('Order not found');
            setOrder(orderData);
            // Fetch order items and join with products
            const { data: itemsData, error: itemsError } = await supabase
                .from('Order_items')
                .select('*, product:product_id (name, imageFilename)')
                .eq('order_id', id);
            if (itemsError) throw new Error('Failed to fetch order items');
            setOrderItems(itemsData || []);
        } catch (error) {
            alert(error.message);
            navigate('/admin/orders');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('Orders')
                .update({ status: newStatus })
                .eq('id', id);
            if (error) throw new Error('Failed to update order status');
            fetchOrderDetails();
        } catch (error) {
            alert(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="text-center my-4">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }
    if (!order) {
        return (
            <div className="container my-4 text-center">
                <h2>Order not found</h2>
                <Link to="/admin/orders" className="btn btn-primary">Back to Orders</Link>
            </div>
        );
    }
    return (
        <div className="container my-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Order #{order.id}</h2>
                <Link to="/admin/orders" className="btn btn-outline-primary">Back to Orders</Link>
            </div>
            <div className="row">
                <div className="col-md-8">
                    <div className="card mb-4">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Order Items</h5>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Price</th>
                                            <th>Quantity</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orderItems.map((item) => (
                                            <tr key={item.id}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <img
                                                            src={`${process.env.REACT_APP_SUPABASE_IMAGE_URL}/${item.product?.imageFilename}`}
                                                            alt={item.product?.name}
                                                            style={{ width: '50px', marginRight: '10px' }}
                                                        />
                                                        {item.product?.name}
                                                    </div>
                                                </td>
                                                <td>${item.price}</td>
                                                <td>{item.quantity}</td>
                                                <td>${(item.price * item.quantity).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan="3" className="text-end fw-bold">Total:</td>
                                            <td className="fw-bold">${order.total}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div className="card mb-4">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Order Status</h5>
                        </div>
                        <div className="card-body">
                            <select
                                className={`form-select mb-3 ${getStatusColor(order.status)}`}
                                value={order.status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                disabled={isSaving}
                            >
                                <option value="pending" className="text-warning">Pending</option>
                                <option value="processing" className="text-info">Processing</option>
                                <option value="shipped" className="text-primary">Shipped</option>
                                <option value="delivered" className="text-success">Delivered</option>
                                <option value="cancelled" className="text-danger">Cancelled</option>
                            </select>
                            <div className="mb-3">
                                <span className={`badge bg-${order.status === 'pending' ? 'warning' :
                                    order.status === 'processing' ? 'info' :
                                    order.status === 'shipped' ? 'primary' :
                                    order.status === 'delivered' ? 'success' : 'danger'}`}
                                >
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                            </div>
                            {isSaving && (
                                <div className="text-center">
                                    <div className="spinner-border spinner-border-sm" role="status">
                                        <span className="visually-hidden">Saving...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Order Information</h5>
                        </div>
                        <div className="card-body">
                            <p><strong>Order Date:</strong><br/>
                                {order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
                            </p>
                            <p><strong>User ID:</strong><br/>
                                {order.user_id}
                            </p>
                        </div>
                    </div>
                    <div className="card mb-4">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Shipping Details</h5>
                        </div>
                        <div className="card-body">
                            <p className="mb-1"><strong>Name:</strong><br/>
                                {order.shipping_first_name} {order.shipping_last_name}
                            </p>
                            <p className="mb-1"><strong>Address:</strong><br/>
                                {order.shipping_address}
                            </p>
                            <p className="mb-1"><strong>Phone:</strong><br/>
                                {order.shipping_phone}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}