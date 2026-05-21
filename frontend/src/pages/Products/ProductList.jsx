// src/pages/Products/ProductList.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingStock, setUpdatingStock] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Si hay búsqueda, agregar query param
      const url = searchTerm ? `/products?search=${searchTerm}` : '/products';
      const response = await api.get(url);
      setProducts(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError('No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  // Buscar cuando cambia el searchTerm
  useEffect(() => {
    if (!loading) {
      fetchProducts();
    }
  }, [searchTerm]);

  const updateStock = async (product, delta) => {
    const newStock = product.stock + delta;
    if (newStock < 0) return;

    setUpdatingStock(prev => ({ ...prev, [product.sku]: true }));

    try {
      const response = await api.patch(`/products/${product.sku}/stock`, { stock: newStock });
      
      // Actualizar localmente
      setProducts(prev => prev.map(p => 
        p.sku === product.sku 
          ? { ...p, stock: response.data.data?.stock ?? newStock }
          : p
      ));
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'Error al actualizar stock');
    } finally {
      setUpdatingStock(prev => ({ ...prev, [product.sku]: false }));
    }
  };

  const handleDelete = async (product) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar el producto "${product.name}" (SKU: ${product.sku})?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await api.delete(`/products/${product.sku}`);
      alert('Producto eliminado exitosamente');
      fetchProducts();
    } catch (error) {
      console.error('Error al eliminar:', error);
      if (error.response && error.response.status === 404) {
        alert('Producto no encontrado');
      } else {
        alert('Error al eliminar el producto');
      }
    }
  };

  const handleEdit = (sku) => {
    navigate(`/products/edit/${sku}`);
  };

  const getAvailabilityBadge = (stock) => {
    if (stock > 0) {
      return (
        <div style={styles.badgeAvailable}>
          <span style={styles.badgeDotAvailable}></span>
          En existencia
        </div>
      );
    }
    return (
      <div style={styles.badgeUnavailable}>
        <span style={styles.badgeDotUnavailable}></span>
        Sin stock
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
          <p style={styles.loadingText}>Cargando catálogo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <div style={styles.errorIcon}>!</div>
          <p style={styles.errorText}>{error}</p>
          <button onClick={fetchProducts} style={styles.retryBtn}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Gestión de Inventario</h1>
          <p style={styles.subtitle}>Catálogo de productos y control de existencias</p>
        </div>
        <button onClick={() => navigate('/products/new')} style={styles.primaryBtn}>
          <span style={styles.btnIcon}>+</span>
          Nuevo producto
        </button>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{products.length}</div>
          <div style={styles.statLabel}>Total productos</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{products.filter(p => p.stock > 0).length}</div>
          <div style={styles.statLabel}>En existencia</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{products.filter(p => p.stock === 0).length}</div>
          <div style={styles.statLabel}>Sin stock</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>
            {products.reduce((sum, p) => sum + p.stock, 0)}
          </div>
          <div style={styles.statLabel}>Unidades totales</div>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Buscar por nombre o SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} style={styles.clearSearchBtn}>
            ✕
          </button>
        )}
      </div>

      {products.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📋</div>
          <h3 style={styles.emptyTitle}>
            {searchTerm ? 'No se encontraron resultados' : 'Catálogo vacío'}
          </h3>
          <p style={styles.emptyText}>
            {searchTerm 
              ? `No hay productos que coincidan con "${searchTerm}"`
              : 'No hay productos registrados en el sistema'}
          </p>
          {!searchTerm && (
            <button onClick={() => navigate('/products/new')} style={styles.emptyBtn}>
              Registrar primer producto
            </button>
          )}
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>SKU</th>
                <th style={styles.th}>Producto</th>
                <th style={styles.th}>Descripción</th>
                <th style={styles.th}>Precio</th>
                <th style={styles.th}>Stock</th>
                <th style={styles.th}>Estado</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product.sku} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                  <td style={styles.td}>
                    <code style={styles.sku}>{product.sku}</code>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.productName}>{product.name}</div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.description}>
                      {product.description || '-'}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.price}>{formatPrice(product.price)}</div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.stockControl}>
                      <button
                        onClick={() => updateStock(product, -1)}
                        disabled={product.stock === 0 || updatingStock[product.sku]}
                        style={styles.stockBtn}
                      >
                        −
                      </button>
                      <span style={styles.stockNumber}>{product.stock}</span>
                      <span style={styles.stockUnit}>uds.</span>
                      <button
                        onClick={() => updateStock(product, 1)}
                        disabled={updatingStock[product.sku]}
                        style={styles.stockBtn}
                      >
                        +
                      </button>
                      {updatingStock[product.sku] && (
                        <span style={styles.stockSpinner}></span>
                      )}
                    </div>
                  </td>
                  <td style={styles.td}>
                    {getAvailabilityBadge(product.stock)}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button
                        onClick={() => handleEdit(product.sku)}
                        style={styles.editBtn}
                        title="Editar producto"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        style={styles.deleteBtn}
                        title="Eliminar producto"
                      >
                        Eliminar
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
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
    padding: '2rem',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  header: {
    maxWidth: '1280px',
    margin: '0 auto 2rem auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: '1.5rem',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid #e2e8f0',
  },

  headerContent: {
    flex: 1,
  },

  title: {
    fontSize: '1.875rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '0.5rem',
    letterSpacing: '-0.025em',
  },

  subtitle: {
    fontSize: '0.875rem',
    color: '#64748b',
    fontWeight: '400',
  },

  primaryBtn: {
    padding: '0.625rem 1.5rem',
    backgroundColor: '#5b3cc4',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },

  btnIcon: {
    fontSize: '1.125rem',
    fontWeight: '600',
  },

  statsGrid: {
    maxWidth: '1280px',
    margin: '0 auto 2rem auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1rem',
  },

  statCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '0.75rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    transition: 'box-shadow 0.2s ease',
  },

  statValue: {
    fontSize: '2rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '0.5rem',
    letterSpacing: '-0.025em',
  },

  statLabel: {
    fontSize: '0.75rem',
    fontWeight: '500',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },

  // Estilos de búsqueda
  searchContainer: {
    maxWidth: '1280px',
    margin: '0 auto 1.5rem auto',
    position: 'relative',
  },

  searchInput: {
    width: '100%',
    padding: '0.75rem 2.5rem 0.75rem 1rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    backgroundColor: 'white',
    outline: 'none',
    transition: 'all 0.2s ease',
  },

  clearSearchBtn: {
    position: 'absolute',
    right: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    fontSize: '1rem',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '0.25rem',
  },

  stockControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },

  stockBtn: {
    width: '28px',
    height: '28px',
    backgroundColor: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#5b3cc4',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },

  stockSpinner: {
    width: '14px',
    height: '14px',
    border: '2px solid #e2e8f0',
    borderTopColor: '#5b3cc4',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
    display: 'inline-block',
  },

  tableContainer: {
    maxWidth: '1280px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    border: '1px solid #e2e8f0',
    overflow: 'auto',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '1000px',
  },

  tableHeader: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },

  th: {
    padding: '1rem 1rem',
    textAlign: 'left',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },

  tableRow: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.2s ease',
  },

  tableRowAlt: {
    backgroundColor: '#fefefe',
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.2s ease',
  },

  td: {
    padding: '1rem 1rem',
    fontSize: '0.875rem',
    color: '#334155',
  },

  sku: {
    fontFamily: "'SF Mono', 'Monaco', 'Cascadia Code', monospace",
    fontSize: '0.75rem',
    backgroundColor: '#f1f5f9',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.375rem',
    color: '#475569',
  },

  productName: {
    fontWeight: '500',
    color: '#1e293b',
  },

  description: {
    fontSize: '0.8125rem',
    color: '#64748b',
    maxWidth: '250px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  price: {
    fontWeight: '600',
    color: '#5b3cc4',
  },

  stockNumber: {
    fontWeight: '600',
    color: '#1e293b',
    fontSize: '0.875rem',
  },

  stockUnit: {
    fontSize: '0.75rem',
    color: '#94a3b8',
  },

  badgeAvailable: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.25rem 0.75rem',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '2rem',
    fontSize: '0.75rem',
    fontWeight: '500',
    color: '#166534',
    width: 'fit-content',
  },

  badgeUnavailable: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.25rem 0.75rem',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '2rem',
    fontSize: '0.75rem',
    fontWeight: '500',
    color: '#991b1b',
    width: 'fit-content',
  },

  badgeDotAvailable: {
    width: '0.5rem',
    height: '0.5rem',
    backgroundColor: '#22c55e',
    borderRadius: '50%',
    display: 'inline-block',
  },

  badgeDotUnavailable: {
    width: '0.5rem',
    height: '0.5rem',
    backgroundColor: '#ef4444',
    borderRadius: '50%',
    display: 'inline-block',
  },

  actions: {
    display: 'flex',
    gap: '0.5rem',
  },

  editBtn: {
    padding: '0.375rem 0.875rem',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  deleteBtn: {
    padding: '0.375rem 0.875rem',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '0.375rem',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  loadingCard: {
    maxWidth: '28rem',
    margin: '8rem auto',
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    padding: '3rem',
    textAlign: 'center',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },

  spinner: {
    width: '2.5rem',
    height: '2.5rem',
    border: '3px solid #e2e8f0',
    borderTopColor: '#5b3cc4',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    margin: '0 auto 1rem',
  },

  loadingText: {
    color: '#64748b',
    fontSize: '0.875rem',
  },

  errorCard: {
    maxWidth: '28rem',
    margin: '8rem auto',
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    padding: '3rem',
    textAlign: 'center',
    border: '1px solid #fecaca',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },

  errorIcon: {
    width: '3rem',
    height: '3rem',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: '0 auto 1rem',
  },

  errorText: {
    color: '#991b1b',
    marginBottom: '1.5rem',
    fontSize: '0.875rem',
  },

  retryBtn: {
    padding: '0.5rem 1.5rem',
    backgroundColor: '#5b3cc4',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },

  emptyState: {
    maxWidth: '32rem',
    margin: '4rem auto',
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    padding: '3rem',
    textAlign: 'center',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },

  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
    opacity: 0.5,
  },

  emptyTitle: {
    fontSize: '1.25rem',
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: '0.5rem',
  },

  emptyText: {
    color: '#64748b',
    fontSize: '0.875rem',
    marginBottom: '1.5rem',
  },

  emptyBtn: {
    padding: '0.625rem 1.5rem',
    backgroundColor: '#5b3cc4',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  input:focus {
    border-color: #5b3cc4;
    box-shadow: 0 0 0 3px rgba(91, 60, 196, 0.1);
  }
  
  ${styles.editBtn}:hover {
    background-color: #e2e8f0;
    transform: translateY(-1px);
  }
  
  ${styles.deleteBtn}:hover {
    background-color: #fecaca;
    transform: translateY(-1px);
  }
  
  ${styles.primaryBtn}:hover {
    background-color: #4a2db8;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  
  ${styles.stockBtn}:hover:not(:disabled) {
    background-color: #e2e8f0;
    transform: scale(1.05);
  }
  
  ${styles.stockBtn}:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  ${styles.statCard}:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  
  ${styles.tableRow}:hover, ${styles.tableRowAlt}:hover {
    background-color: #faf9fe;
  }
  
  button:active {
    transform: translateY(0);
  }
`;
document.head.appendChild(styleSheet);

export default ProductList;