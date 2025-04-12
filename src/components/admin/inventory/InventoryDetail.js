import { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../../../AppContext';

export default function InventoryDetail() {
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { userCredentials } = useContext(AppContext);
    const { id } = useParams();
    const navigate = useNavigate();

    const fetchProductDetails = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_WEBAPI_URL}/products/${id}`, {
                headers: {
                    'Authorization': `Bearer ${userCredentials.accessToken}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Product not found');
            }
            
            const data = await response.json();
            setProduct(data);
        } catch (error) {
            alert(error.message);
            navigate('/admin/inventory');
        } finally {
            setIsLoading(false);
        }
    }, [id, userCredentials, navigate]);

    useEffect(() => {
        fetchProductDetails();
    }, [fetchProductDetails]);

    const handleStockUpdate = async (newStock) => {
        if (newStock < 0) return;
        
        setIsSaving(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_WEBAPI_URL}/products/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userCredentials.accessToken}`
                },
                body: JSON.stringify({ stock: newStock })
            });

            if (!response.ok) {
                throw new Error('Failed to update stock');
            }

            setProduct(prev => ({ ...prev, stock: newStock }));
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

    if (!product) {
        return (
            <div className="container my-4 text-center">
                <h2>Product not found</h2>
                <Link to="/admin/inventory" className="btn btn-primary">Back to Inventory</Link>
            </div>
        );
    }

    return (
        <div className="container my-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Inventory Details</h2>
                <Link to="/admin/inventory" className="btn btn-outline-primary">Back to Inventory</Link>
            </div>

            <div className="row">
                <div className="col-md-4">
                    <div className="card mb-4">
                        <img 
                            src={`${process.env.REACT_APP_WEBAPI_URL}/images/${product.imageFilename}`}
                            className="card-img-top"
                            alt={product.name}
                        />
                        <div className="card-body">
                            <h5 className="card-title">{product.name}</h5>
                            <p className="card-text">Price: ${product.price}</p>
                        </div>
                    </div>
                </div>

                <div className="col-md-8">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title mb-4">Stock Management</h5>
                            
                            <div className="mb-4">
                                <label className="form-label">Current Stock</label>
                                <div className="input-group">
                                    <button 
                                        className="btn btn-outline-secondary"
                                        onClick={() => handleStockUpdate(product.stock - 1)}
                                        disabled={product.stock <= 0 || isSaving}
                                    >
                                        <i className="bi bi-dash"></i>
                                    </button>
                                    <input 
                                        type="number" 
                                        className="form-control text-center"
                                        value={product.stock || 0}
                                        onChange={(e) => handleStockUpdate(parseInt(e.target.value) || 0)}
                                        disabled={isSaving}
                                    />
                                    <button 
                                        className="btn btn-outline-secondary"
                                        onClick={() => handleStockUpdate(product.stock + 1)}
                                        disabled={isSaving}
                                    >
                                        <i className="bi bi-plus"></i>
                                    </button>
                                </div>
                            </div>

                            <div className="alert alert-info">
                                <i className="bi bi-info-circle me-2"></i>
                                {product.stock <= 10 ? (
                                    <strong>Low stock alert! Consider restocking soon.</strong>
                                ) : (
                                    'Stock levels are healthy.'
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}