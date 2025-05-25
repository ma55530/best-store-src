import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
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

export default function OrderDetail() {
    const [order, setOrder] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { id } = useParams();

    useEffect(() => {
        const fetchOrderAndItems = async () => {
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
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrderAndItems();
    }, [id]);

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
                <Link to="/orders" className="btn btn-primary">Back to Orders</Link>
            </div>
        );
    }

    return (
        <div className="container my-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Order #{order.id}</h2>
                <Link to="/orders" className="btn btn-outline-primary">Back to Orders</Link>
            </div>

            <div className="row">
                <div className="col-md-8">
                    <div className="card mb-4">
                        <div className="card-body">
                            <h5 className="card-title">Order Items</h5>
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
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Shipping Details</h5>
                            <p className="mb-1">{order.shipping_first_name} {order.shipping_last_name}</p>
                            <p className="mb-1">{order.shipping_address}</p>
                            <p className="mb-1">{order.shipping_phone}</p>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card mb-4">
                        <div className="card-body">
                            <h5 className="card-title">Order Summary</h5>
                            <div className="mb-3">
                                <strong>Status:</strong>
                                <span className={`ms-2 badge bg-${getStatusStyles(order.status).color}`}>
                                    {getStatusStyles(order.status).text}
                                </span>
                            </div>
                            <div className="mb-3">
                                <strong>Date:</strong>
                                <span className="ms-2">
                                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}
                                </span>
                            </div>
                            <div className="mb-3">
                                <strong>Total:</strong>
                                <span className="ms-2">${order.total}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}