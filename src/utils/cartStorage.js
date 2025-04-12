export const cartStorage = {
    // Cart methods
    getCart: () => {
        const cart = window.sessionStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    },

    setCart: (cart) => {
        window.sessionStorage.setItem('cart', JSON.stringify(cart));
    },

    addToCart: (product) => {
        const cart = cartStorage.getCart();
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        
        cartStorage.setCart(cart);
    },

    updateQuantity: (productId, quantity) => {
        const cart = cartStorage.getCart();
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity = quantity;
            cartStorage.setCart(cart);
        }
    },

    removeFromCart: (productId) => {
        const cart = cartStorage.getCart();
        const updatedCart = cart.filter(item => item.id !== productId);
        cartStorage.setCart(updatedCart);
    },

    clearCart: () => {
        window.sessionStorage.removeItem('cart');
    },

    // Products methods
    getProducts: () => {
        const products = window.sessionStorage.getItem('products');
        return products ? JSON.parse(products) : [];
    },

    setProducts: (products) => {
        window.sessionStorage.setItem('products', JSON.stringify(products));
    },

    clearProducts: () => {
        window.sessionStorage.removeItem('products');
    }
};