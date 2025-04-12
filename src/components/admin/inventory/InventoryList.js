import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../../AppContext';

export default function InventoryList() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { userCredentials } = useContext(AppContext);

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_WEBAPI_URL}/products`, {
                headers: {
                    'Authorization': `Bearer ${userCredentials.accessToken}`
                }
            });
            const data = await response.json();
            setProducts(data);
            setIsLoading(false);
        } catch (error) {
            alert('Failed to fetch inventory');
            setIsLoading(false);
        }
    };

    const updateStock = async (productId, quantity) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_WEBAPI_URL}/products/${productId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userCredentials.accessToken}`
                },
                body: JSON.stringify({ stock: quantity })
            });

            if (response.ok) {
                fetchInventory();
            } else {
                throw new Error('Failed to update stock');
            }
        } catch (error) {
            alert(error.message);
        }
    };

    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container my-4">
            <h2 className="text-center mb-4">Inventory Management</h2>

            {/* Search Bar */}
            <div className="row mb-4">
                <div className="col-md-6 mx-auto">
                    <div className="input-group">
                        <span className="input-group-text">
                            <i className="bi bi-search"></i>
                        </span>
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Search products..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button 
                                className="btn btn-outline-secondary" 
                                type="button"
                                onClick={() => setSearchQuery('')}
                            >
                                <i className="bi bi-x"></i>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Current Stock</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <tr key={product.id}>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <img 
                                                src={`${process.env.REACT_APP_WEBAPI_URL}/images/${product.imageFilename}`}
                                                alt={product.name}
                                                style={{ width: '50px', marginRight: '10px' }}
                                            />
                                            {product.name}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="input-group" style={{ width: '150px' }}>
                                            <button 
                                                className="btn btn-outline-secondary"
                                                onClick={() => updateStock(product.id, (product.stock || 0) - 1)}
                                                disabled={!product.stock}
                                            >
                                                -
                                            </button>
                                            <input 
                                                type="number" 
                                                className="form-control text-center"
                                                value={product.stock || 0}
                                                onChange={(e) => updateStock(product.id, parseInt(e.target.value) || 0)}
                                            />
                                            <button 
                                                className="btn btn-outline-secondary"
                                                onClick={() => updateStock(product.id, (product.stock || 0) + 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </td>
                                    <td>
                                        <Link 
                                            to={`/admin/inventory/${product.id}`}
                                            className="btn btn-sm btn-outline-primary"
                                        >
                                            Details
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