import { useState, useEffect, useContext, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../../AppContext';
import { cartStorage } from '../../utils/cartStorage';
import { sessionStorage } from '../../utils/sessionStorage';
import { supabase } from '../../supabaseClient';

const SUPABASE_IMAGE_URL = process.env.REACT_APP_SUPABASE_IMAGE_URL;

export default function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const { userCredentials } = useContext(AppContext);
    const navigate = useNavigate();
    const [stockValidation, setStockValidation] = useState({});

    useEffect(() => {
        const items = cartStorage.getCart();
        setCartItems(items);
        calculateTotal(items);
    }, []);

    const validateStock = useCallback(async () => {
        try {
            const validation = {};
            for (const item of cartItems) {
                // Fetch product from Supabase
                const { data: product, error } = await supabase
                    .from('Products')
                    .select('stock')
                    .eq('id', item.id)
                    .single();
                if (error || !product || !product.stock || product.stock < item.quantity) {
                    validation[item.id] = {
                        hasError: true,
                        message: product && product.stock ? `Only ${product.stock} available` : 'Out of stock'
                    };
                }
            }
            setStockValidation(validation);
            return Object.keys(validation).length === 0;
        } catch (error) {
            setStockValidation({
                error: { hasError: true, message: "Failed to validate stock" }
            });
            return false;
        }
    }, [cartItems]);

    useEffect(() => {
        validateStock();
    }, [validateStock]);

    const calculateTotal = (items) => {
        const sum = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        setTotal(sum.toFixed(2));
    };

    const updateQuantity = (id, newQuantity) => {
        if (newQuantity < 1) return;
        
        cartStorage.updateQuantity(id, newQuantity);
        const updatedCart = cartStorage.getCart();
        setCartItems(updatedCart);
        calculateTotal(updatedCart);
    };

    const removeItem = (id) => {
        cartStorage.removeFromCart(id);
        const updatedCart = cartStorage.getCart();
        setCartItems(updatedCart);
        calculateTotal(updatedCart);
    };

    const handleCheckout = async () => {
        const isStockValid = await validateStock();
        
        if (!isStockValid) {
            alert('Some items in your cart are out of stock or exceed available quantity');
            return;
        }

        if (!userCredentials) {
            sessionStorage.set('returnUrl', '/checkout');
            navigate('/auth/login');
            return;
        }
        navigate('/checkout');
    };

    const renderCheckoutButton = () => {
        if (userCredentials?.user.role === 'admin') {
            return (
                <button 
                    className="btn btn-secondary" // Changed from btn-primary to btn-secondary
                    style={{ width: 'auto' }}    // Removed w-100 class and added specific width
                    onClick={handleCheckout}
                    disabled={Object.keys(stockValidation).length > 0}
                >
                    Checkout
                </button>
            );
        }

        return (
            <button 
                className="btn btn-primary w-100"
                onClick={handleCheckout}
                disabled={Object.keys(stockValidation).length > 0}
            >
                {Object.keys(stockValidation).length > 0 ? 'Some Items Out of Stock' : 'Proceed to Checkout'}
            </button>
        );
    };

    return (
        <div className="container my-4">
            <h2 className="text-center mb-5">My Cart</h2>

            {cartItems.length === 0 ? (
                <div className="text-center">
                    <p>Your cart is empty</p>
                    <Link to="/" className="btn btn-primary">Continue Shopping</Link>
                </div>
            ) : (
                <>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Total</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <img
                                                    src={`${process.env.REACT_APP_SUPABASE_IMAGE_URL}/${item.imageFilename}`}
                                                    alt={item.name}
                                                    style={{ width: '50px', marginRight: '10px' }}
                                                />
                                                {item.name}
                                            </div>
                                        </td>
                                        <td>${item.price}</td>
                                        <td>
                                            <div className="input-group" style={{ width: '130px' }}>
                                                <button 
                                                    className="btn btn-outline-secondary btn-sm"
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                >-</button>
                                                <input 
                                                    type="number" 
                                                    className="form-control text-center"
                                                    value={item.quantity}
                                                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                                />
                                                <button 
                                                    className="btn btn-outline-secondary btn-sm"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                >+</button>
                                            </div>
                                        </td>
                                        <td>${(item.price * item.quantity).toFixed(2)}</td>
                                        <td>
                                            <button 
                                                className="btn btn-danger btn-sm"
                                                onClick={() => removeItem(item.id)}
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                            {stockValidation[item.id]?.hasError && (
                                                <div className="text-danger small">
                                                    {stockValidation[item.id].message}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="row justify-content-end">
                        <div className="col-md-4">
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title">Cart Total</h5>
                                    <p className="card-text">Total: ${total}</p>
                                    {renderCheckoutButton()}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}