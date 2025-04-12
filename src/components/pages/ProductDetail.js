import { useEffect, useState, useCallback, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { cartStorage } from '../../utils/cartStorage';
import { AppContext } from "../../AppContext"

export default function ProductDetails(){
    const params = useParams()
    const navigate = useNavigate()
    const { userCredentials } = useContext(AppContext)
    const [product, setProduct] = useState([])
    const [isAdding, setIsAdding] = useState(false);

    const getProductDetails = useCallback(async () => {
        try {
            let response = await fetch(process.env.REACT_APP_WEBAPI_URL + "/products/" + params.id);
            let data = await response.json();

            if(response.ok) {
                setProduct(data);
            } else {
                alert("Unable to get product details");
            }
        } catch {
            alert("Unable to connect to the server");
        }
    }, [params.id]); // Add params.id as dependency

    useEffect(() => {
        getProductDetails();
    }, [getProductDetails]); // Added dependency

    async function addToCart() {
        setIsAdding(true);
        
        try {
            cartStorage.addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                imageFilename: product.imageFilename,
                quantity: 1  // Always add quantity of 1
            });
            
            await new Promise(resolve => setTimeout(resolve, 250));
            
        } catch (error) {
            alert('Failed to add to cart');
        } finally {
            setIsAdding(false);
        }
    }

    // Add navigation function for admin
    const handleEditProduct = () => {
        navigate(`/admin/products/edit/${product.id}`);
    };

    return (
        <div className="container my-4">
            <div className="row">
                <div className="col-md-4 text-center">
                    <img src={process.env.REACT_APP_WEBAPI_URL + "/images/" + product.imageFilename}
                        className="img-fluid mb-3" alt="..." width="250" />
                </div>
                <div className="col-md-8">
                    <h3 className="mb-3">{product.name}</h3>
                    <h3 className="mb-3">{product.price}$</h3>
                    
                    {userCredentials?.user.role === "admin" ? (
                        <button 
                            type="button" 
                            className="btn btn-primary btn-sm"
                            onClick={handleEditProduct}
                        >
                            Edit Product <i className="bi bi-pencil"></i>
                        </button>
                    ) : (
                        <button 
                            className="btn btn-warning btn-sm" 
                            onClick={addToCart}
                            disabled={!product.stock}
                        >
                            {isAdding ? (
                                <span>
                                    <span className="spinner-border spinner-border-sm me-2" />
                                    Adding...
                                </span>
                            ) : product.stock ? (
                                <>
                                    <i className="bi bi-cart4 me-2"></i>
                                    Add to Cart
                                </>
                            ) : (
                                'Out of Stock'
                            )}
                        </button>
                    )}
                    
                    <hr />

                    <div className="row mb-3">
                        <div className="col-sm-3 fw-bold">
                            Brand
                        </div>
                        <div className="col-sm-9">
                            {product.brand}
                        </div>
                    </div>

                    <div className="row mb-3">
                        <div className="col-sm-3 fw-bold">
                            Category
                        </div>
                        <div className="col-sm-9">
                            {product.category}
                        </div>
                    </div>

                    <div className="fw-bold">Description</div>
                    <div style={{ whiteSpace: "pre-line" }}>
                        {product.description}
                    </div>
                </div>
            </div>
        </div>
    )
}