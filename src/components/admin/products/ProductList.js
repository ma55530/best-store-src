import { useContext, useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../../../AppContext";
import { supabase } from '../../../supabaseClient';

export default function ProductList() {
    const [products, setProducts] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 5;

    const [search, setSearch] = useState("");

    const navigate = useNavigate();
    const { userCredentials, setUserCredentials } = useContext(AppContext);

    const [sortColumn, setSortColumn] = useState({ column: "id", orderBy: "desc" });

    const getProducts = useCallback(async () => {
        try {
            let query = supabase
                .from('Products')
                .select('*', { count: 'exact' })
                .order(sortColumn.column === 'createdAt' ? 'created_at' : sortColumn.column, { ascending: sortColumn.orderBy === 'asc' })
                .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);
            if (search) {
                query = query.ilike('name', `%${search}%`);
            }
            const { data, count, error } = await query;
            if (error) throw error;
            setProducts(data || []);
            setTotalPages(Math.ceil((count || 0) / pageSize));
        } catch (error) {
            alert('Unable to get the data');
        }
    }, [currentPage, search, sortColumn]);

    useEffect(() => {
        getProducts();
    }, [getProducts]);

    async function deleteProduct(id) {
        try {
            const { error } = await supabase
                .from('Products')
                .delete()
                .eq('id', id);
            if (error) throw error;
            getProducts();
        } catch (error) {
            alert('Unable to delete the product');
        }
    }

    function handleSearch(event) {
        event.preventDefault();
        const text = event.target.search.value;
        setSearch(text);
        setCurrentPage(1);
    }

    function sortTable(column) {
        let orderBy = "asc";
        if (sortColumn.column === column && sortColumn.orderBy === "asc") {
            orderBy = "desc";
        }
        setSortColumn({ column, orderBy });
    }

    const paginationButtons = [];
    for (let i = 1; i <= totalPages; i++) {
        paginationButtons.push(
            <li className={`page-item ${i === currentPage ? "active" : ""}`} key={i}>
                <a
                    className="page-link"
                    href={"?page=" + i}
                    onClick={e => {
                        e.preventDefault();
                        setCurrentPage(i);
                    }}
                >
                    {i}
                </a>
            </li>
        );
    }

    return (
        <div className="container my-4">
            <h2 className="text-center mb-4">Products</h2>

            <div className="row mb-3">
                <div className="col">
                    <Link className="btn btn-primary me-1" to="/admin/products/create">Create Product</Link>
                    <button type="button" className="btn btn-outline-primary" onClick={getProducts}>Refresh</button>
                </div>
                <div className="col">
                    <form className="d-flex" onSubmit={handleSearch}>
                        <input className="form-control me-2" type="search" placeholder="Search" name="search" />
                        <button className="btn btn-outline-success" type="submit">Search</button>
                    </form>
                </div>
            </div>

            <table className="table">
                <thead>
                    <tr>
                        <th style={{ cursor: "pointer" }} onClick={() => sortTable("id")}>
                            ID <SortArrow column="id" sortColumn={sortColumn.column} orderBy={sortColumn.orderBy} />
                        </th>
                        <th style={{ cursor: "pointer" }} onClick={() => sortTable("name")}>
                            Name <SortArrow column="name" sortColumn={sortColumn.column} orderBy={sortColumn.orderBy} />
                        </th>
                        <th style={{ cursor: "pointer" }} onClick={() => sortTable("brand")}>
                            Brand <SortArrow column="brand" sortColumn={sortColumn.column} orderBy={sortColumn.orderBy} />
                        </th>
                        <th style={{ cursor: "pointer" }} onClick={() => sortTable("category")}>
                            Category <SortArrow column="category" sortColumn={sortColumn.column} orderBy={sortColumn.orderBy} />
                        </th>
                        <th style={{ cursor: "pointer" }} onClick={() => sortTable("price")}>
                            Price <SortArrow column="price" sortColumn={sortColumn.column} orderBy={sortColumn.orderBy} />
                        </th>
                        <th>Image</th>
                        <th style={{ cursor: "pointer" }} onClick={() => sortTable("createdAt")}>
                            Created At <SortArrow column="createdAt" sortColumn={sortColumn.column} orderBy={sortColumn.orderBy} />
                        </th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product.id}>
                            <td>{product.id}</td>
                            <td>{product.name}</td>
                            <td>{product.brand}</td>
                            <td>{product.category}</td>
                            <td>{product.price}€</td>
                            <td>
                                <img
                                    src={`${process.env.REACT_APP_SUPABASE_IMAGE_URL}/${product.imageFilename}`}
                                    width="100"
                                    alt={product.name || "Product"}
                                />
                            </td>
                            <td>{product.createdAt ? product.createdAt.slice(0, 10) : "N/A"}</td>
                            <td style={{ whiteSpace: "nowrap" }}>
                                <Link className="btn btn-primary btn-sm me-1" to={`/admin/products/edit/${product.id}`}>
                                    Edit
                                </Link>
                                <button className="btn btn-danger btn-sm" onClick={() => deleteProduct(product.id)}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <ul className="pagination">{paginationButtons}</ul>
        </div>
    );
}

function SortArrow({ column, sortColumn, orderBy }) {
    if (column !== sortColumn) return null;

    return (
        <i
            className={`bi ${orderBy === "asc" ? "bi-arrow-down" : "bi-arrow-up"}`}
            style={{ marginLeft: "5px" }}
        ></i>
    );
}
