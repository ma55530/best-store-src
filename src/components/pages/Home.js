import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from '../../supabaseClient';



export default function Home() {
    
    const [products, setProducts] = useState([])

    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const pageSize = 8

    const [filterParams, setFilterParams] = useState({brand: "", category: "", q: ""}) // Add search query parameter

    const [sortColumn, setSortColumn] = useState({column: "id", orderBy:"desc"})

    const [searchQuery, setSearchQuery] = useState(""); // Add to existing state declarations

    // Add debounced search function
    const debouncedSearch = useCallback((query) => {
        setFilterParams(prev => ({...prev, q: query}));
    }, [setFilterParams]); // Add dependency
    
    function getProducts(){
        // Supabase query for products with filters, pagination, and sorting
        let query = supabase
            .from('Products')
            .select('*', { count: 'exact' })
            .range((currentPage - 1) * pageSize, currentPage * pageSize - 1)
            .order(sortColumn.column, { ascending: sortColumn.orderBy === 'asc' });

        if (filterParams.brand) {
            query = query.eq('brand', filterParams.brand);
        }
        if (filterParams.category) {
            query = query.eq('category', filterParams.category);
        }
        if (filterParams.q) {
            query = query.ilike('name', `%${filterParams.q}%`);
        }

        query.then(({ data, count, error }) => {
            if (error) {
                alert('Unable to get the data');
                return;
            }
            setProducts(data || []);
            setTotalPages(Math.ceil((count || 0) / pageSize));
        });
    }

    useEffect(getProducts, [currentPage, filterParams, sortColumn])

    let paginationButtons = []
    for(let i = 1; i <=totalPages; i++){
        paginationButtons.push(
            <li className={i === currentPage ? "page-item active": "page-item"} key={i}>
                <a className="page-link" href={"?page=" + i} onClick={event => {
                    event.preventDefault()
                    setCurrentPage(i)
                }}>{i}</a>
            </li>
        )
    }

    function handleBrandFilter(event){
        let brand = event.target.value
        setFilterParams({...filterParams, brand: brand})
        setCurrentPage(1)
    }

    function handleCategoryFilter(event){
        let category = event.target.value
        setFilterParams({...filterParams, category: category})
        setCurrentPage(1)
    }

    function handleSort(event){
        let val = event.target.value
        if(val === "0") setSortColumn({column:"id", orderBy: "desc"})
        else if(val === "1") setSortColumn({column:"price", orderBy: "asc"})
        else if(val === "2") setSortColumn({column:"price", orderBy: "desc"})    
    }

    // Modify handleSearch function
    function handleSearch(event) {
        const query = event.target.value;
        setSearchQuery(query);
        debouncedSearch(query);
        setCurrentPage(1);
    }

    return (
        <>
            <div style={{ backgroundColor: "#09618d", minHeight: "200px" }}>
                <div className="container text-white py-5">
                    <div className="row align-items-center g-2">
                        <div className="col-md-6">
                            <h1 className="mb-5 display-2">
                                <strong>Best store</strong>
                            </h1>
                            <p>A Demo Webshop project created by Matija Akrap</p>
                        </div>
                        <div className="col-md-6 text-center">
                            <img 
                                src={process.env.PUBLIC_URL + "/images/hero.png" }
                                className="img-fluid" 
                                alt="hero"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-light">
                <div className="container py-5">
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
                                    onChange={handleSearch}
                                />
                                {searchQuery && (
                                    <button 
                                        className="btn btn-outline-secondary" 
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery("");
                                            setFilterParams({...filterParams, q: ""});
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <i className="bi bi-x"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="row mb-5 g-2">
                        <div className="col-md-6">
                            <h4>Products</h4>
                        </div>
                        <div className="col-md-2">
                            <select className="form-select" style={{cursor:"pointer"}} onChange={handleBrandFilter}>
                                <option value="">All Brands</option>
                                <option value="Samsung">Samsung</option>
                                <option value="Apple">Apple</option>
                                <option value="Nokia">Nokia</option>
                                <option value="HP">HP</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <select className="form-select" style={{cursor:"pointer"}} onChange={handleCategoryFilter}>
                                <option value="">All Categories</option>
                                <option value="Phones">Phones</option>
                                <option value="Computers">Computers</option>
                                <option value="Accessories">Accessories</option>
                                <option value="Printers">Printers</option>
                                <option value="Cameras">Cameras</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <select className="form-select" style={{cursor:"pointer"}} onChange={handleSort}>
                                <option value="0">Order By Newest</option>
                                <option value="1">Price: Low to High</option>
                                <option value="2">Price: High to Low</option>
                            </select>
                        </div>
                    </div>

                    <div className="row mb-5 g-3">
                        {
                            products.map((product, index) => {
                                return(
                                    <div className="col-md-3 col-sm-6" key={index}>
                                    <ProductItem product={product}/>
                                    </div>
                                )
                            })
                        }
                    </div>

                    <ul className="pagination">{paginationButtons}</ul>

                </div>
            </div>
        </>
    )
}

// Add debounce utility function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function ProductItem({product}){
    return(
        <div className="rounded border shadow p-4 text-center h-100">
            <img src={`${process.env.REACT_APP_SUPABASE_IMAGE_URL}/${product.imageFilename}`}
                className="img-fluid" alt="..." 
                style={{height:"220px", objectFit:"contain"}}/>
            <hr />
            <h4 className="py-2">{product.name}</h4>
            <p>
                Brand: {product.brand}, Category: {product.category} <br />
                {product.description ? product.description.substr(0, 48) + "..." : null}
            </p>
            <h4 className="mb-2">{product.price}$</h4>
            <Link className="btn btn-primary btn-sm m-2" to={"/products/" + product.id} role="button">Details</Link>
        </div>
    );
}