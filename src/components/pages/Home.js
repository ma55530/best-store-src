import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Home() {
    
    const [products, setProducts] = useState([])

    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const pageSize = 8

    const [filterParams, setFilterParams] = useState({brand: "", category: ""})

    const [sortColumn, setSortColumn] = useState({column: "id", orderBy:"desc"})

    function getProducts(){
        let url = process.env.REACT_APP_WEBAPI_URL + "/products?_page=" + currentPage + "&_limit=" + pageSize

        if(filterParams.brand){
            url += "&brand=" + filterParams.brand
        }

        if(filterParams.category){
            url += "&category=" + filterParams.category
        }

        url += "&_sort=" + sortColumn.column + "&_order=" + sortColumn.orderBy
        console.log("url="+url)

        fetch(url).then(response => {
            if(response.ok){
                let totalCount = response.headers.get('X-Total-Count')
                let pages = Math.ceil(totalCount / pageSize)
                setTotalPages(pages)
                return response.json()
            }

            throw new Error() 
        }).then(data =>{
            setProducts(data)
        }).catch(error => {
            alert("Unable to get the data")
        })
    }

    useEffect(getProducts, [currentPage, filterParams, sortColumn])

    let paginationButtons = []
    for(let i = 1; i <=totalPages; i++){
        paginationButtons.push(
            <li className={i === currentPage ? "page-item active": "page-item"} key={i}>
                <a class="page-link" href={"?page=" + i} onClick={event => {
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
    return (
        <>
            <div style={{ backgroundColor: "#09618d", minHeight: "200px" }}>
                <div className="container text-white py-5">
                    <div className="row align-items-center g-2">
                        <div className="col-md-6">
                            <h1 className="mb-5 display-2">
                                <strong>Best store</strong>
                            </h1>
                            <p>A demo webshop project created by Matija Akrap</p>
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

function ProductItem({product}){
    return(
        <div className="rounded border shadow p-4 text-center h-100">
            <img src={process.env.REACT_APP_WEBAPI_URL + "/images/"+ product.imageFilename}
                className="img-fluid" alt="..." 
                style={{height:"220px", objectFit:"contain"}}/>
            <hr />
            <h4 className="py-2">{product.name}</h4>
            <p>
                Brand: {product.brand}, Category: {product.category} <br />
                {product.description.substr(0, 48) + "..."}
            </p>
            <h4 className="mb-2">{product.price}$</h4>
            <Link className="btn btn-primary btn-sm m-2" to={"/products/" + product.id} role="button">Details</Link>
        </div>  
    )
}