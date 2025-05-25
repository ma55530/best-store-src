import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartStorage } from '../../utils/cartStorage';
import { AppContext } from '../../AppContext';
import { supabase } from '../../supabaseClient';

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
                // Fetch product from Supabase
                const { data: product, error } = await supabase
                    .from('Products')
                    .select('stock')
                    .eq('id', item.id)
                    .single();
                if (error || !product) {
                    throw new Error(`Failed to fetch product ${item.id}`);
                }
                const newStock = product.stock - item.quantity;
                if (newStock < 0) {
                    throw new Error(`Not enough stock for ${item.name}`);
                }
                // Update the stock in Supabase
                const { error: updateError } = await supabase
                    .from('Products')
                    .update({ stock: newStock })
                    .eq('id', item.id);
                if (updateError) {
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
            // Debug: log payload
            console.log({
                userId: userCredentials.user.id,
                items: cartItems,
                total: Number(total),
                status: 'pending',
                shippingDetails: orderDetails
            });
            // Insert order (without items)
            const { data: orderData, error: orderError } = await supabase
                .from('Orders')
                .insert([
                    {
                        user_id: userCredentials.user.id,
                        total: Number(total),
                        status: 'pending',
                        shipping_first_name: orderDetails.firstName,
                        shipping_last_name: orderDetails.lastName,
                        shipping_address: orderDetails.address,
                        shipping_phone: orderDetails.phone
                    }
                ])
                .select('id')
                .single();
            if (orderError && orderError.code === '23505') {
                throw new Error('You already have an active order. Please complete or cancel it before placing a new one.');
            }
            if (orderError || !orderData) {
                throw new Error(orderError?.message || 'Failed to place order');
            }
            // Insert each cart item into order_items (normalized, no name/imageFilename)
            const orderItems = cartItems.map(item => ({
                order_id: orderData.id, // snake_case for Supabase
                product_id: item.id,    // snake_case for Supabase
                price: item.price,
                quantity: item.quantity
            }));
            const { error: itemsError } = await supabase
                .from('Order_items') // match the table name used in Orders.js
                .insert(orderItems);
            if (itemsError) {
                throw new Error(itemsError.message || 'Failed to add order items');
            }
            // Only update stock if order and items were created successfully
            await updateProductStock(cartItems);
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