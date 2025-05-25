import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../../AppContext';
import { supabase } from '../../../supabaseClient';

export default function InventoryList() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState(true); // true = ascending
    const { userCredentials } = useContext(AppContext);

    useEffect(() => {
        fetchInventory();
    }, [sortField, sortDirection]);

    const fetchInventory = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('Products')
                .select('*')
                .order(sortField, { ascending: sortDirection });
            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            alert('Failed to fetch inventory');
        } finally {
            setIsLoading(false);
        }
    };

    const updateStock = async (productId, quantity) => {
        try {
            const { error } = await supabase
                .from('Products')
                .update({ stock: quantity })
                .eq('id', productId);
            if (error) throw error;
            // Update the product in-place in the products array
            setProducts(prevProducts => prevProducts.map(p =>
                p.id === productId ? { ...p, stock: quantity } : p
            ));
        } catch (error) {
            alert(error.message);
        }
    };

    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sorting arrow helper
    function SortArrow({ column }) {
        if (sortField !== column) return null;
        return sortDirection ? <span> ▲</span> : <span> ▼</span>;
    }

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
                                <th>
                                    <span style={{ cursor: 'pointer' }} onClick={e => {
                                        e.preventDefault();
                                        if (sortField === 'id') setSortDirection(d => !d);
                                        else { setSortField('id'); setSortDirection(true); }
                                    }}>
                                        ID<SortArrow column="id" />
                                    </span>
                                </th>
                                <th>
                                    <span style={{ cursor: 'pointer' }} onClick={e => {
                                        e.preventDefault();
                                        if (sortField === 'name') setSortDirection(d => !d);
                                        else { setSortField('name'); setSortDirection(true); }
                                    }}>
                                        Product<SortArrow column="name" />
                                    </span>
                                </th>
                                <th>
                                    <span style={{ cursor: 'pointer' }} onClick={e => {
                                        e.preventDefault();
                                        if (sortField === 'stock') setSortDirection(d => !d);
                                        else { setSortField('stock'); setSortDirection(true); }
                                    }}>
                                        Current Stock<SortArrow column="stock" />
                                    </span>
                                </th>
                                <th>
                                    <span style={{ cursor: 'pointer' }} onClick={e => {
                                        e.preventDefault();
                                        if (sortField === 'price') setSortDirection(d => !d);
                                        else { setSortField('price'); setSortDirection(true); }
                                    }}>
                                        Price<SortArrow column="price" />
                                    </span>
                                </th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <tr key={product.id}>
                                    <td>{product.id}</td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <img 
                                                src={`${process.env.REACT_APP_SUPABASE_IMAGE_URL}/${product.imageFilename}`}
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
                                    <td>{product.price}</td>
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