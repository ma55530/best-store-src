import { useContext } from "react"
import { Link } from "react-router-dom"
import { AppContext } from "../AppContext"


export function Navbar(){

  const {userCredentials,setUserCredentials} = useContext(AppContext)

  return(
        <nav className="navbar navbar-expand-lg bg-white border-bottom box-shadow">
  <div className="container">
    <Link className="navbar-brand" to="/">
        <img src={process.env.PUBLIC_URL + "/icon.png"} alt="..." width="30" className="me-2"/>Best Store</Link>
    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span className="navbar-toggler-icon"></span>
    </button>
    <div className="collapse navbar-collapse" id="navbarSupportedContent">
      <ul className="navbar-nav me-auto mb-2 mb-lg-0">
        <li className="nav-item">
          <Link className="nav-link text-dark" aria-current="page" to="/">Home</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link text-dark" to="/contact">Contact</Link>
        </li>
      </ul>
      <ul className="navbar-nav">
      { 
        userCredentials && userCredentials.user.role === "admin" &&
        <li className="nav-item dropdown">
          <a className="nav-link dropdown-toggle text-dark" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            Admin
          </a>
          <ul className="dropdown-menu" style={{ width: "auto" }}>
            <li><Link className="dropdown-item" to="/admin/products">Products</Link></li>
            <li><Link className="dropdown-item" to="/admin/users">Users</Link></li>
            <li><Link className="dropdown-item" to="/profile">Profile</Link></li>
            <li><hr className="dropdown-divider"></hr></li>
            <li><Link className="dropdown-item" to="/" onClick={() => setUserCredentials(null)}>Logout</Link></li>
          </ul>
        </li>
        }

        { 
        userCredentials && userCredentials.user.role !== "admin" &&
        <li className="nav-item dropdown">
          <a className="nav-link dropdown-toggle text-dark" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            Client
          </a>
          <ul className="dropdown-menu" style={{ width: "auto" }}>
            <li><Link className="dropdown-item" to="/profile">Profile</Link></li>
            <li><hr className="dropdown-divider"></hr></li>
            <li><Link className="dropdown-item" to="/" onClick={() => setUserCredentials(null)}>Logout</Link></li>
          </ul>
        </li>
        }  

        
        { !userCredentials &&
          <ul className="navbar-nav">
          <li className="nav-item">
            <Link className="btn btn-outline-primary me-2" role="button" to="/auth/register">Register</Link>
          </li>
          <li className="nav-item">
            <Link className="btn btn-primary" role="button" to="/auth/login">Login</Link>
          </li>
        </ul>}
      </ul>    
    </div>
  </div>
</nav>
    )
}

export function Footer(){
    return(
        <div className="text-center p-4 border-top">
            <img src={process.env.PUBLIC_URL + "/icon.png"} alt="..." width="30" className="me-2" />
            Best Store
        </div>
    )
}