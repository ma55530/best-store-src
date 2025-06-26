import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Footer, Navbar } from './components/layout';
import Home from './components/pages/Home';
import {Routes, Route, HashRouter } from 'react-router-dom';
import Contact from './components/pages/Contact';
import NotFound from './components/pages/NotFound';
import ProductList from './components/admin/products/ProductList';
import CreateProduct from './components/admin/products/CreateProduct';
import EditProduct from './components/admin/products/EditProduct';
import ProductDetails from './components/pages/ProductDetail';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import { AppContext } from './AppContext';
import { AdminRoute, AuthenticatedUserRoute, ClientOnlyRoute, NonAdminRoute } from './components/authorization';
import UserProfile from './components/pages/UserProfile';
import UserList from './components/admin/users/UserList';
import UserDetails from './components/admin/users/UserDetails';
import Cart from './components/pages/Cart';
import Checkout from './components/pages/Checkout';
import Orders from './components/pages/Orders'; // This will be your UserOrders component
import OrderDetail from './components/pages/OrderDetail';
import AdminOrderList from './components/admin/orders/AdminOrderList';
import AdminOrderDetail from './components/admin/orders/AdminOrderDetail';
import InventoryList from './components/admin/inventory/InventoryList';
import InventoryDetail from './components/admin/inventory/InventoryDetail';
import Chatbot from './components/chatbot/Chatbot';

function App(){

  function getStoredCredentials(){
    let data = localStorage.getItem("credentials")

    if(data){
      let json = JSON.parse(data)
      return json
    }
    return null
  }

  const [userCredentials, setUserCredentials] = useState(getStoredCredentials())

  useEffect(() =>{
    let str = JSON.stringify(userCredentials)

    localStorage.setItem("credentials", str)
  }, [userCredentials])

  return(
    <AppContext.Provider value={{userCredentials, setUserCredentials}}>
      <HashRouter>
      <Navbar/>
      <Chatbot />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />}/>
        <Route path="/products/:id" element={<ProductDetails/>}/>
        <Route path="/profile" element={<AuthenticatedUserRoute><UserProfile/></AuthenticatedUserRoute>}/>

        <Route path="/auth/register" element={<Register/>}/>
        <Route path="/auth/login" element={<Login/>}/>

        <Route path="/cart/" element={<NonAdminRoute><Cart/></NonAdminRoute>}/>
        <Route path="/checkout/" element={<ClientOnlyRoute><Checkout/></ClientOnlyRoute>}/>
        <Route path="/orders" element={<ClientOnlyRoute><Orders/></ClientOnlyRoute>}/>
        <Route path="/orders/:id" element={<ClientOnlyRoute><OrderDetail/></ClientOnlyRoute>}/>

        <Route path="/admin/products" element={<AdminRoute><ProductList/></AdminRoute>}/>
        <Route path="/admin/products/create" element={<AdminRoute><CreateProduct/></AdminRoute>}/>
        <Route path="/admin/products/edit/:id" element={<AdminRoute><EditProduct/></AdminRoute>}/>

        <Route path="/admin/users" element={<AdminRoute><UserList/></AdminRoute>}/>
        <Route path="/admin/users/details/:id" element={<AdminRoute><UserDetails/></AdminRoute>}/>

        <Route path="/admin/orders" element={<AdminRoute><AdminOrderList/></AdminRoute>}/>
        <Route path="/admin/orders/:id" element={<AdminRoute><AdminOrderDetail/></AdminRoute>}/>
        <Route path="/admin/inventory" element={<AdminRoute><InventoryList/></AdminRoute>}/>
        <Route path="/admin/inventory/:id" element={<AdminRoute><InventoryDetail/></AdminRoute>}/>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer/>
      </HashRouter>
    </AppContext.Provider>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

