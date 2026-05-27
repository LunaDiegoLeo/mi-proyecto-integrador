import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ShopPage = () => {

  const navigate = useNavigate();

  const [products, setProducts] =
    useState([]);

  const [cart, setCart] =
    useState([]);

  useEffect(() => {

    const user =
      localStorage.getItem('user');

    if (!user) {
      navigate('/');
    }

    fetchProducts();

  }, []);

  const fetchProducts = async () => {

    try {

      const response =
        await api.get('/products');

      setProducts(response.data.data);

    } catch (error) {

      console.log(error);

    }

  };

  const addToCart = (product) => {

    if (product.stock <= 0) {
      return;
    }

    const exists = cart.find(
      item => item.sku === product.sku
    );

    if (exists) {

      if (
        exists.quantity >= product.stock
      ) {
        return alert(
          'No hay más stock'
        );
      }

      setCart(
        cart.map(item =>
          item.sku === product.sku
            ? {
              ...item,
              quantity:
                item.quantity + 1
            }
            : item
        )
      );

    } else {

      setCart([
        ...cart,
        {
          ...product,
          quantity: 1
        }
      ]);

    }

  };

  const increaseQuantity = (item) => {

    if (item.quantity >= item.stock) {
      return;
    }

    setCart(
      cart.map(p =>
        p.sku === item.sku
          ? {
            ...p,
            quantity: p.quantity + 1
          }
          : p
      )
    );

  };

  const decreaseQuantity = (item) => {

    if (item.quantity === 1) {

      setCart(
        cart.filter(
          p => p.sku !== item.sku
        )
      );

      return;
    }

    setCart(
      cart.map(p =>
        p.sku === item.sku
          ? {
            ...p,
            quantity: p.quantity - 1
          }
          : p
      )
    );

  };

  const total = cart.reduce(
    (acc, item) =>
      acc + item.price * item.quantity,
    0
  );

  const checkout = async () => {

    try {

      for (const item of cart) {

        await api.patch(
          `/products/${item.sku}/stock`,
          {
            stock:
              item.stock - item.quantity
          }
        );

      }

      alert('Compra realizada');

      setCart([]);

      fetchProducts();

    } catch (error) {

      console.log(error);

    }

  };

  return (

    <div style={styles.container}>

      {/* PRODUCTOS */}
      <div style={styles.productsSection}>

        {/* HEADER */}
        <div style={styles.header}>

          <div>

            <h1 style={styles.title}>
              Tienda
            </h1>

            <p style={styles.subtitle}>
              Explora productos increíbles
            </p>

          </div>

          <button
            onClick={() => {

              localStorage.removeItem('user');
              localStorage.removeItem('token');

              navigate('/');

            }}
            style={styles.logoutBtn}
          >
            Cerrar sesión
          </button>

        </div>

        {/* GRID DE PRODUCTOS */}
        <div style={styles.grid}>

          {products.map(product => {

            const cartItem =
              cart.find(
                p => p.sku === product.sku
              );

            const remaining =
              product.stock -
              (cartItem?.quantity || 0);

            return (

              <div
                key={product.sku}
                style={styles.card}
              >

                <img
                  src={
                    product.imageUrl ||
                    'https://via.placeholder.com/300'
                  }
                  alt={product.name}
                  style={styles.image}
                />

                <div style={styles.cardBody}>

                  <h2 style={styles.productName}>
                    {product.name}
                  </h2>

                  <p style={styles.description}>
                    {product.description}
                  </p>

                  <h3 style={styles.price}>
                    $
                    {Number(product.price)
                      .toFixed(2)}
                  </h3>

                  <p style={styles.stock}>
                    Quedan: {remaining}
                  </p>

                  <button
                    disabled={remaining <= 0}
                    onClick={() =>
                      addToCart(product)
                    }
                    style={
                      remaining <= 0
                        ? styles.disabledButton
                        : styles.button
                    }
                  >

                    {
                      remaining <= 0
                        ? 'Sin stock'
                        : 'Agregar al carrito'
                    }

                  </button>

                </div>

              </div>

            );

          })}

        </div>

      </div>

      {/* CARRITO */}
      <div style={styles.cart}>

        <h2 style={styles.cartTitle}>
          Carrito
        </h2>

        {
          cart.length === 0
            ? (
              <div style={styles.emptyCart}>
                Tu carrito está vacío
              </div>
            )
            : (
              cart.map(item => (

                <div
                  key={item.sku}
                  style={styles.cartItem}
                >

                  <img
                    src={
                      item.imageUrl ||
                      'https://via.placeholder.com/300'
                    }
                    alt={item.name}
                    style={styles.cartImage}
                  />

                  <div style={styles.cartInfo}>

                    <div style={styles.cartName}>
                      {item.name}
                    </div>

                    <div style={styles.cartPrice}>
                      $
                      {(
                        item.price *
                        item.quantity
                      ).toFixed(2)}
                    </div>

                    <div
                      style={
                        styles.quantityControls
                      }
                    >

                      <button
                        style={styles.quantityBtn}
                        onClick={() =>
                          decreaseQuantity(item)
                        }
                      >
                        −
                      </button>

                      <span style={styles.quantityText}>
                        {item.quantity}
                      </span>

                      <button
                        style={styles.quantityBtn}
                        onClick={() =>
                          increaseQuantity(item)
                        }
                      >
                        +
                      </button>

                    </div>

                  </div>

                </div>

              ))
            )
        }

        {/* TOTAL */}
        <div style={styles.totalContainer}>

          <div style={styles.totalLabel}>

            <span>
              Total
            </span>

            <span>
              ${total.toFixed(2)}
            </span>

          </div>

          <button
            onClick={checkout}
            disabled={cart.length === 0}
            style={styles.checkout}
          >
            Finalizar compra
          </button>

        </div>

      </div>

    </div>

  );

};

const styles = {

  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
    padding: '2rem',
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: '2rem',
  },

  productsSection: {
    width: '100%',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },

  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '0.3rem',
  },

  subtitle: {
    color: '#64748b',
    fontSize: '0.95rem',
  },

  logoutBtn: {
    border: 'none',
    background: '#ef4444',
    color: 'white',
    padding: '0.8rem 1.4rem',
    borderRadius: '14px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: '.2s',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fill,minmax(280px,1fr))',
    gap: '1.5rem',
  },

  card: {
    background: 'white',
    borderRadius: '24px',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
    boxShadow:
      '0 4px 20px rgba(0,0,0,.05)',
    transition: '.25s',
    display: 'flex',
    flexDirection: 'column',
  },

  image: {
    width: '100%',
    height: '240px',
    objectFit: 'cover',
    background: '#f1f5f9',
  },

  cardBody: {
    padding: '1.2rem',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },

  productName: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '0.4rem',
  },

  description: {
    fontSize: '0.88rem',
    color: '#64748b',
    lineHeight: '1.4',
    marginBottom: '1rem',
    flex: 1,
  },

  price: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#5b3cc4',
    marginBottom: '0.5rem',
  },

  stock: {
    fontSize: '0.85rem',
    color: '#64748b',
    marginBottom: '1rem',
  },

  button: {
    width: '100%',
    border: 'none',
    background:
      'linear-gradient(135deg,#5b3cc4,#7c5cff)',
    color: 'white',
    padding: '0.95rem',
    borderRadius: '16px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '0.95rem',
    transition: '.25s',
  },

  disabledButton: {
    width: '100%',
    border: 'none',
    background: '#cbd5e1',
    color: '#475569',
    padding: '0.95rem',
    borderRadius: '16px',
    fontWeight: '700',
  },

  cart: {
    background: 'white',
    borderRadius: '28px',
    border: '1px solid #e2e8f0',
    padding: '1.5rem',
    height: 'fit-content',
    position: 'sticky',
    top: '20px',
    boxShadow:
      '0 10px 30px rgba(0,0,0,.06)',
  },

  cartTitle: {
    fontSize: '1.4rem',
    fontWeight: '700',
    marginBottom: '1.5rem',
    color: '#0f172a',
  },

  emptyCart: {
    color: '#94a3b8',
    textAlign: 'center',
    padding: '2rem 0',
  },

  cartItem: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    alignItems: 'center',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '1rem',
  },

  cartImage: {
    width: '75px',
    height: '75px',
    borderRadius: '18px',
    objectFit: 'cover',
    background: '#f1f5f9',
  },

  cartInfo: {
    flex: 1,
  },

  cartName: {
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '0.3rem',
  },

  cartPrice: {
    color: '#5b3cc4',
    fontWeight: '700',
    fontSize: '0.95rem',
  },

  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    marginTop: '0.7rem',
  },

  quantityBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '10px',
    border: 'none',
    background: '#f1f5f9',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '1rem',
    color: '#334155',
    transition: '.2s',
  },

  quantityText: {
    fontWeight: '700',
    minWidth: '20px',
    textAlign: 'center',
  },

  totalContainer: {
    marginTop: '2rem',
    borderTop: '1px solid #e2e8f0',
    paddingTop: '1.5rem',
  },

  totalLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '1rem',
  },

  checkout: {
    width: '100%',
    border: 'none',
    background:
      'linear-gradient(135deg,#111827,#000)',
    color: 'white',
    padding: '1rem',
    borderRadius: '18px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '1rem',
    transition: '.25s',
  },

};

const styleSheet = document.createElement('style');

styleSheet.textContent = `

button:hover{
  transform: translateY(-2px);
}

img{
  display:block;
}

`;

document.head.appendChild(styleSheet);
export default ShopPage;