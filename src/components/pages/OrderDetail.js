import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
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

export default function OrderDetail() {
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { userCredentials } = useContext(AppContext);
    const { id } = useParams();

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_WEBAPI_URL}/orders/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${userCredentials.accessToken}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Order not found');
                }
                
                const data = await response.json();
                setOrder(data);
            } catch (error) {
                alert(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrder();
    }, [id, userCredentials]);

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
                                        {order.items.map((item) => (
                                            <tr key={item.id}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <img 
                                                            src={`${process.env.REACT_APP_WEBAPI_URL}/images/${item.imageFilename}`}
                                                            alt={item.name}
                                                            style={{ width: '50px', marginRight: '10px' }}
                                                        />
                                                        {item.name}
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
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="mb-3">
                                <strong>Total:</strong>
                                <span className="ms-2">${order.total}</span>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Shipping Details</h5>
                            <p className="mb-1">{order.shippingDetails.firstName} {order.shippingDetails.lastName}</p>
                            <p className="mb-1">{order.shippingDetails.address}</p>
                            <p className="mb-1">{order.shippingDetails.phone}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}