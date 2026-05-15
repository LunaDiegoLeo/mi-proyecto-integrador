// frontend/src/pages/Products/ProductList.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data.products);
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError('No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const getAvailabilityBadge = (stock) => {
    if (stock > 0) {
      return (
        <div style={styles.badgeAvailable}>
          <span style={styles.badgeDotGreen}></span>
          Disponible
        </div>
      );
    }
    return (
      <div style={styles.badgeUnavailable}>
        <span style={styles.badgeDotRed}></span>
        Agotado
      </div>
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
    }).format(price);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingCard}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <div style={styles.errorIcon}>⚠️</div>
          <p style={styles.errorText}>{error}</p>
          <button onClick={fetchProducts} style={styles.retryBtn}>
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.heroSection}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>✨ Catálogo de Productos</h1>
          <p style={styles.heroSubtitle}>Gestiona tu inventario de forma fácil y rápida</p>
        </div>
        <button onClick={() => navigate('/products/new')} style={styles.heroBtn}>
          <span style={styles.btnIcon}>+</span>
          Nuevo Producto
        </button>
      </div>

      <div style={styles.statsBar}>
        <div style={styles.statItem}>
          <span style={styles.statNumber}>{products.length}</span>
          <span style={styles.statLabel}>Total Productos</span>
        </div>
        <div style={styles.statDivider}></div>
        <div style={styles.statItem}>
          <span style={styles.statNumber}>
            {products.filter(p => p.stock > 0).length}
          </span>
          <span style={styles.statLabel}>Disponibles</span>
        </div>
        <div style={styles.statDivider}></div>
        <div style={styles.statItem}>
          <span style={styles.statNumber}>
            {products.filter(p => p.stock === 0).length}
          </span>
          <span style={styles.statLabel}>Agotados</span>
        </div>
      </div>

      {products.length === 0 ? (
        <div style={styles.emptyCard}>
          <div style={styles.emptyIcon}>📦</div>
          <h3 style={styles.emptyTitle}>No hay productos aún</h3>
          <p style={styles.emptyText}>Comienza registrando tu primer producto</p>
          <button onClick={() => navigate('/products/new')} style={styles.emptyBtn}>
            + Registrar producto
          </button>
        </div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>SKU</th>
                <th style={styles.th}>Producto</th>
                <th style={styles.th}>Descripción</th>
                <th style={styles.th}>Precio</th>
                <th style={styles.th}>Stock</th>
                <th style={styles.th}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product.id} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                  <td style={styles.td}>
                    <code style={styles.skuCode}>{product.sku}</code>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.productName}>{product.name}</div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.productDesc}>
                      {product.description || '—'}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.productPrice}>{formatPrice(product.price)}</div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.stockBadge}>
                      <span style={styles.stockNumber}>{product.stock}</span>
                      <span style={styles.stockUnit}>unidades</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    {getAvailabilityBadge(product.stock)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '2rem',
  },
  heroSection: {
    maxWidth: '1200px',
    margin: '0 auto 2rem auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    padding: '2rem',
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '20px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    backdropFilter: 'blur(10px)',
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    fontSize: '2.5rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '0.5rem',
  },
  heroSubtitle: {
    color: '#666',
    fontSize: '1rem',
  },
  heroBtn: {
    padding: '12px 28px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 15px rgba(102,126,234,0.4)',
  },
  btnIcon: {
    fontSize: '20px',
    fontWeight: 'bold',
  },
  statsBar: {
    maxWidth: '1200px',
    margin: '0 auto 2rem auto',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    background: 'white',
    borderRadius: '15px',
    padding: '1.5rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  },
  statItem: {
    textAlign: 'center',
    flex: 1,
  },
  statNumber: {
    display: 'block',
    fontSize: '2rem',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  statLabel: {
    fontSize: '0.85rem',
    color: '#666',
    marginTop: '0.25rem',
    display: 'block',
  },
  statDivider: {
    width: '1px',
    height: '40px',
    background: '#e0e0e0',
  },
  tableWrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  th: {
    padding: '1rem',
    textAlign: 'left',
    color: 'white',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  tableRow: {
    borderBottom: '1px solid #f0f0f0',
    transition: 'background 0.2s',
  },
  tableRowAlt: {
    background: '#fafafa',
    borderBottom: '1px solid #f0f0f0',
    transition: 'background 0.2s',
  },
  td: {
    padding: '1rem',
    fontSize: '0.9rem',
  },
  skuCode: {
    background: '#f5f5f5',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontFamily: 'monospace',
    color: '#667eea',
  },
  productName: {
    fontWeight: '600',
    color: '#333',
  },
  productDesc: {
    color: '#888',
    fontSize: '0.85rem',
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  productPrice: {
    fontWeight: 'bold',
    color: '#667eea',
    fontSize: '1rem',
  },
  stockBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  stockNumber: {
    fontWeight: 'bold',
    fontSize: '1rem',
    color: '#333',
  },
  stockUnit: {
    fontSize: '0.75rem',
    color: '#888',
  },
  badgeAvailable: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 12px',
    background: '#d4edda',
    color: '#155724',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '500',
    width: 'fit-content',
  },
  badgeUnavailable: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 12px',
    background: '#f8d7da',
    color: '#721c24',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '500',
    width: 'fit-content',
  },
  badgeDotGreen: {
    width: '8px',
    height: '8px',
    background: '#28a745',
    borderRadius: '50%',
    display: 'inline-block',
  },
  badgeDotRed: {
    width: '8px',
    height: '8px',
    background: '#dc3545',
    borderRadius: '50%',
    display: 'inline-block',
  },
  loadingCard: {
    maxWidth: '400px',
    margin: '100px auto',
    background: 'white',
    borderRadius: '20px',
    padding: '3rem',
    textAlign: 'center',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 1rem',
  },
  loadingText: {
    color: '#666',
  },
  errorCard: {
    maxWidth: '400px',
    margin: '100px auto',
    background: 'white',
    borderRadius: '20px',
    padding: '3rem',
    textAlign: 'center',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
  },
  errorIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  errorText: {
    color: '#dc2626',
    marginBottom: '1.5rem',
  },
  retryBtn: {
    padding: '10px 20px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  emptyCard: {
    maxWidth: '500px',
    margin: '50px auto',
    background: 'white',
    borderRadius: '20px',
    padding: '3rem',
    textAlign: 'center',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  emptyTitle: {
    fontSize: '1.5rem',
    color: '#333',
    marginBottom: '0.5rem',
  },
  emptyText: {
    color: '#666',
    marginBottom: '1.5rem',
  },
  emptyBtn: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
};

// Agregar animación
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102,126,234,0.4);
  }
`;
document.head.appendChild(styleSheet);

export default ProductList;