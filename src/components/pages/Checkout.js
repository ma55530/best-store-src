import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartStorage } from '../../utils/cartStorage';
import { AppContext } from '../../AppContext';

export default function Checkout() {
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const { userCredentials } = useContext(AppContext);
    const navigate = useNavigate();

    useEffect(() => {
        const items = cartStorage.getCart();
        setCartItems(items);
        calculateTotal(items);
    }, []);

    const calculateTotal = (items) => {
        const sum = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        setTotal(sum.toFixed(2));
    };

    const updateProductStock = async (items) => {
        try {
            for (const item of items) {
                // First get current product stock
                const productResponse = await fetch(`${process.env.REACT_APP_WEBAPI_URL}/products/${item.id}`, {
                    headers: {
                        'Authorization': `Bearer ${userCredentials.accessToken}`
                    }
                });
                
                if (!productResponse.ok) {
                    throw new Error(`Failed to fetch product ${item.id}`);
                }
                
                const product = await productResponse.json();
                const newStock = product.stock - item.quantity;
                
                if (newStock < 0) {
                    throw new Error(`Not enough stock for ${item.name}`);
                }

                // Update the stock
                const updateResponse = await fetch(`${process.env.REACT_APP_WEBAPI_URL}/products/${item.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userCredentials.accessToken}`
                    },
                    body: JSON.stringify({
                        stock: newStock
                    })
                });
                
                if (!updateResponse.ok) {
                    throw new Error(`Failed to update stock for ${item.name}`);
                }
            }
        } catch (error) {
            throw new Error(`Stock update failed: ${error.message}`);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsProcessing(true);

        try {
            const formData = new FormData(event.target);
            const orderDetails = Object.fromEntries(formData.entries());

            // First update the stock
            await updateProductStock(cartItems);
            
            // Then create the order
            const response = await fetch(`${process.env.REACT_APP_WEBAPI_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userCredentials.accessToken}`
                },
                body: JSON.stringify({
                    userId: userCredentials.user.id,
                    items: cartItems,
                    total: total,
                    status: 'pending',
                    shippingDetails: orderDetails,
                    createdAt: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error('Failed to place order');
            }

            // Clear cart and redirect only if both operations succeed
            cartStorage.clearCart();
            navigate('/orders');
        } catch (error) {
            alert('Error processing order: ' + error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="container my-4">
            <h2 className="text-center mb-4">Checkout</h2>
            
            <div className="row">
                <div className="col-md-8">
                    <div className="card mb-4">
                        <div className="card-body">
                            <h5 className="card-title mb-4">Shipping Details</h5>
                            <form onSubmit={handleSubmit}>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label">First Name *</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            name="firstName"
                                            defaultValue={userCredentials.user.firstname}
                                            required 
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Last Name *</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            name="lastName"
                                            defaultValue={userCredentials.user.lastname}
                                            required 
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Address *</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="address"
                                        defaultValue={userCredentials.user.address}
                                        required 
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Phone *</label>
                                    <input 
                                        type="tel" 
                                        className="form-control" 
                                        name="phone"
                                        defaultValue={userCredentials.user.phone}
                                        required 
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    className="btn btn-primary w-100"
                                    disabled={isProcessing || cartItems.length === 0}
                                >
                                    {isProcessing ? (
                                        <span>
                                            <span className="spinner-border spinner-border-sm me-2" />
                                            Processing Order...
                                        </span>
                                    ) : (
                                        `Place Order - $${total}`
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title mb-4">Order Summary</h5>
                            {cartItems.map((item) => (
                                <div key={item.id} className="d-flex justify-content-between mb-2">
                                    <span>{item.name} x {item.quantity}</span>
                                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                            <hr />
                            <div className="d-flex justify-content-between fw-bold">
                                <span>Total</span>
                                <span>${total}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}