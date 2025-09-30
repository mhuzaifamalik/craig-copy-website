import { createContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

export const CartContext = createContext(null)

export const CartProvider = (props) => {
    const [cartProducts, setCartProducts] = useState([])

    useEffect(() => {
        const cartCookie = Cookies.get('cart-products') ? JSON.parse(Cookies.get('cart-products')) : []
        setCartProducts(cartCookie)
    }, [])

    const addToCart = ({ id, quantity = 1, items, type }) => {
        try {
            let tempCart = Cookies.get('cart-products') ? JSON.parse(Cookies.get('cart-products')) : [];
            if (type == 'letter') {
                tempCart.push({
                    id,
                    identifier: Date.now(),
                    quantity, items, type
                })
            } else {
                const alreadyInCart = tempCart.find(item => item.id === id);

                if (alreadyInCart) {
                    tempCart = tempCart.map(item =>
                        item.id === id ? { ...item, quantity } : item // Preserve existing properties
                    );
                } else {
                    tempCart.push({ id, quantity });
                }
            }
            setCartProducts(tempCart);
            Cookies.set('cart-products', JSON.stringify(tempCart));
            return true;
        } catch (error) {
            console.error("Error adding item to cart:", error);
            return false;
        }
    };

    const editCartItem = ({ id, quantity }) => {
        try {
            let tempCart = Cookies.get('cart-products') ? JSON.parse(Cookies.get('cart-products')) : [];

            // Map and assign the updated cart
            const updatedCart = tempCart.map((item) => {
                if (item.id !== id) return item;
                return { ...item, quantity };
            });

            // Update state and cookie
            setCartProducts(updatedCart);
            Cookies.set('cart-products', JSON.stringify(updatedCart));

            return true;
        } catch (error) {
            return error;
        }
    };

    const removeCartItem = ({ id }) => {
        try {
            let tempCart = Cookies.get('cart-products') ? JSON.parse(Cookies.get('cart-products')) : [];
            // Corrected filter function
            tempCart = tempCart.filter((item) => item.id.toString() !== id.toString());

            // Update state and cookies with the new cart
            setCartProducts(tempCart);
            Cookies.set('cart-products', JSON.stringify(tempCart));

            return true;
        } catch (error) {
            console.error("Error removing item from cart:", error);
            return false;
        }
    };

    const emptyCartItem = () => {
        setCartProducts([]);
        Cookies.remove('cart-products');
    };


    const fetchCartItems = async () => {
        return new Promise(async (resolve, reject) => {
            try {
                let tempCart = Cookies.get('cart-products') ? JSON.parse(Cookies.get('cart-products')) : []
                if (!tempCart || tempCart.length === 0) {
                    return resolve([]);
                }
                console.log('tempCart', tempCart)
                if (tempCart?.length === 0) return resolve([]);
                const itemIds = tempCart?.map((item) => {
                    if (item.type !== 'letter') return item.id
                })
                console.log('itemIds', itemIds)
                const response = await fetch('/api/product/fetch', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ filter: { _id: itemIds } })
                })
                const result = await response.json()
                const { success, products, error } = result
                if (!success) return reject(error)
                const tempProducts = products.map(item => {
                    const id = item._id
                    const { quantity } = tempCart.find(cart => cart.id == id)
                    return { ...item, quantity }
                })
                let creationIds = [];
                const creationCart = tempCart?.filter((item) => item.type === 'letter')
                for (let i = 0; i < creationCart.length; i++) {
                    const { id } = creationCart[i]
                    if (id) {
                        creationIds = [...creationIds, ...id]
                    }
                }
                creationIds = [...new Set(creationIds)]
                const creationResponse = await fetch('/api/letter/fetchbyids', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ids: creationIds
                    })
                })
                const { data } = await creationResponse.json()

                const tempCreation = creationCart.map((item, ind) => {
                    var obj = item.id.map(id => ({ ...data.find(obj => obj._id === id) }))
                    obj = obj.map((tempObj, ind) => {
                        const imageIndex = item.items[ind]
                        return {
                            ...tempObj,
                            image: tempObj.images[imageIndex],
                            imageIndex,
                        }
                    })
                    return {
                        id: item.id,
                        identifier: item.identifier,
                        type: 'creation',
                        obj,
                        quantity: item.quantity,
                        price: obj.length * 10,
                    }
                })

                if (success) resolve([...tempProducts, ...tempCreation])
                else reject(error)
            } catch (error) {
                reject(error)
            }
        })
    }

    const editCreationItem = ({ identifier, quantity, items }) => {
        try {
            let tempCart = Cookies.get('cart-products') ? JSON.parse(Cookies.get('cart-products')) : [];
            debugger
            const updatedCart = tempCart.map((item) => {
                debugger
                if (item.identifier !== identifier) return item;
                return { ...item, quantity, items };
            });

            setCartProducts(updatedCart);
            Cookies.set('cart-products', JSON.stringify(updatedCart));

            return true;
        } catch (error) {
            return error;
        }
    };

    return (
        <CartContext.Provider value={{ cartProducts, addToCart, editCartItem, removeCartItem, fetchCartItems, emptyCartItem, editCreationItem }} >
            {props.children}
        </CartContext.Provider>
    )
}