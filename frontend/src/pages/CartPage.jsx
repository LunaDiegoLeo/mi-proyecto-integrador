import { useEffect, useState } from 'react';
import { getCart } from '../services/cartService';
function CartPage() {
    const [cart, setCart] = useState(null);
    useEffect(() => {
        loadCart();
    }, []);
    const loadCart = async () => {
        try {
            const data = await getCart();
            setCart(data);
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <div>
            <h1>Mi Carrito</h1>

            {cart?.Products?.map((product) => (
                <div key={product.id}>
                    <h3>{product.name}</h3>
                    <p>${product.price}</p>
                </div>
            ))}
        </div>
    );
}
export default CartPage;