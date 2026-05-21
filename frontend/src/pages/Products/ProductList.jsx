// src/pages/Products/ProductList.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  // Cargar productos al iniciar
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/products');
      console.log('Respuesta del backend:', response.data);
      setProducts(response.data.products || []);
    } catch (err) {
      console.error('Error al cargar:', err);
      if (err.code === 'ERR_NETWORK') {
        setError('❌ No se puede conectar al backend. Asegúrate de que esté corriendo en http://localhost:3000');
      } else {
        setError(err.response?.data?.message || 'Error al cargar productos');
      }
    } finally {
      setLoading(false);
    }
  };

  // Actualizar stock
  const updateStock = async (product, delta) => {
    const newStock = product.stock + delta;
    if (newStock < 0) return;

    setUpdatingId(product.id);
    
    try {
      const response = await api.patch(`/products/${product.sku}/stock`, { stock: newStock });
      
      // Actualizar la lista localmente
      setProducts(prev => prev.map(p => 
        p.id === product.id ? { ...p, stock: response.data.product?.stock || newStock } : p
      ));
    } catch (err) {
      console.error('Error al actualizar stock:', err);
      alert(err.response?.data?.message || 'Error al actualizar stock');
    } finally {
      setUpdatingId(null);
    }
  };

  // Eliminar producto
  const deleteProduct = async (product) => {
    if (!confirm(`¿Eliminar "${product.name}"?`)) return;
    
    try {
      await api.delete(`/products/${product.id}`);
      await loadProducts();
      alert('Producto eliminado');
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar');
    }
  };

  // Filtrar productos por búsqueda
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  const getStockBadge = (stock) => {
    if (stock > 0) {
      return <span style={styles.badgeAvailable}>● En existencia</span>;
    }
    return <span style={styles.badgeUnavailable}>○ Sin stock</span>;
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2>Cargando productos...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={{ color: '#dc2626' }}>Error</h2>
          <p>{error}</p>
          <button onClick={loadProducts} style={styles.btnPrimary}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Inventario</h1>
            <p style={styles.subtitle}>{products.length} productos registrados</p>
          </div>
          <button onClick={() => navigate('/products/new')} style={styles.btnPrimary}>
            + Nuevo producto
          </button>
        </div>

        {/* Búsqueda */}
        <div style={styles.searchBox}>
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          {search && (
            <button onClick={() => setSearch('')} style={styles.clearBtn}>
              ✕
            </button>
          )}
        </div>

        {/* Tabla */}
        {filteredProducts.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No se encontraron productos</p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Nombre</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id}>
                    <td><code>{product.sku}</code></td>
                    <td><strong>{product.name}</strong></td>
                    <td>{formatPrice(product.price)}</td>
                    <td>
                      <div style={styles.stockControls}>
                        <button
                          onClick={() => updateStock(product, -1)}
                          disabled={product.stock === 0 || updatingId === product.id}
                          style={styles.stockBtn}
                        >
                          -
                        </button>
                        <span>{product.stock}</span>
                        <button
                          onClick={() => updateStock(product, 1)}
                          disabled={updatingId === product.id}
                          style={styles.stockBtn}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>{getStockBadge(product.stock)}</td>
                    <td>
                      <div style={styles.actions}>
                        <button
                          onClick={() => navigate(`/products/edit/${product.id}`, { state: { product } })}
                          style={styles.editBtn}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteProduct(product)}
                          style={styles.deleteBtn}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f5f7fa',
    padding: '2rem',
  },
  card: {
    maxWidth: '1200px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.8rem',
    color: '#1e293b',
    marginBottom: '0.25rem',
  },
  subtitle: {
    color: '#64748b',
  },
  btnPrimary: {
    padding: '0.5rem 1rem',
    background: '#5b3cc4',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  searchBox: {
    position: 'relative',
    marginBottom: '1.5rem',
  },
  searchInput: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '0.9rem',
  },
  clearBtn: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  stockControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  stockBtn: {
    width: '28px',
    height: '28px',
    background: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  badgeAvailable: {
    color: '#16a34a',
    fontWeight: '500',
  },
  badgeUnavailable: {
    color: '#dc2626',
    fontWeight: '500',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
  },
  editBtn: {
    background: '#e0e7ff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    padding: '0.25rem 0.5rem',
  },
  deleteBtn: {
    background: '#fee2e2',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    padding: '0.25rem 0.5rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: '#64748b',
  },
};

export default ProductList;