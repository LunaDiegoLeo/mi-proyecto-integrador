// src/pages/Products/ProductList.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingStock, setUpdatingStock] = useState({});
  const [deletingProduct, setDeletingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products && products.length > 0) {
      filterProducts();
    } else {
      setFilteredProducts([]);
    }
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/products');
      console.log('Productos cargados:', response.data);
      setProducts(response.data.products || []);
      setFilteredProducts(response.data.products || []);
    } catch (err) {
      console.error('Error detallado:', err);
      if (err.code === 'ERR_NETWORK') {
        setError('No se puede conectar al servidor. Verifica que el backend esté corriendo en http://localhost:3000');
      } else {
        setError(err.response?.data?.message || 'No se pudieron cargar los productos');
      }
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = products.filter(product => 
      product && (
        (product.name && product.name.toLowerCase().includes(term)) ||
        (product.sku && product.sku.toLowerCase().includes(term))
      )
    );
    setFilteredProducts(filtered);
  };

  const updateStock = useCallback(async (product, delta) => {
    if (!product || product.stock === undefined) return;
    
    const newStock = product.stock + delta;
    if (newStock < 0) return;
    
    setUpdatingStock(prev => ({ ...prev, [product.id]: true }));
    
    try {
      const response = await api.patch(`/products/${product.sku}/stock`, { 
        stock: newStock 
      });
      
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p && p.id === product.id 
            ? { ...p, stock: response.data.product?.stock || newStock }
            : p
        )
      );
    } catch (err) {
      console.error('Error al actualizar stock:', err);
      alert(err.response?.data?.message || 'No se pudo actualizar el stock');
      await fetchProducts();
    } finally {
      setUpdatingStock(prev => ({ ...prev, [product.id]: false }));
    }
  }, []);

  const handleDelete = useCallback(async (product) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de eliminar el producto "${product.name}"?\n\nEsta acción no se puede deshacer.`
    );
    
    if (!confirmDelete) return;
    
    setDeletingProduct(product.id);
    
    try {
      await api.delete(`/products/${product.id}`);
      await fetchProducts();
      alert('Producto eliminado exitosamente');
    } catch (err) {
      console.error('Error al eliminar:', err);
      alert(err.response?.data?.message || 'No se pudo eliminar el producto');
    } finally {
      setDeletingProduct(null);
    }
  }, []);

  const handleEdit = useCallback((product) => {
    navigate(`/products/edit/${product.id}`, { state: { product } });
  }, [navigate]);

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
    if (!price && price !== 0) return '$0.00';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
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

  const totalProducts = products?.length || 0;
  const totalAvailable = products?.filter(p => p && p.stock > 0).length || 0;
  const totalOutOfStock = products?.filter(p => p && p.stock === 0).length || 0;
  const totalUnits = products?.reduce((sum, p) => sum + (p?.stock || 0), 0) || 0;

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
          <div style={styles.statValue}>{totalProducts}</div>
          <div style={styles.statLabel}>Total productos</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{totalAvailable}</div>
          <div style={styles.statLabel}>En existencia</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{totalOutOfStock}</div>
          <div style={styles.statLabel}>Sin stock</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{totalUnits}</div>
          <div style={styles.statLabel}>Unidades totales</div>
        </div>
      </div>

      <div style={styles.searchSection}>
        <div style={styles.searchContainer}>
          <div style={styles.searchIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="10" cy="10" r="7"></circle>
              <line x1="21" y1="21" x2="15" y2="15"></line>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={styles.searchInput}
          />
          {searchTerm && (
            <button onClick={clearSearch} style={styles.clearBtn}>
              ×
            </button>
          )}
        </div>
        <div style={styles.searchInfo}>
          {searchTerm && (
            <span style={styles.searchResultText}>
              {filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {!filteredProducts || filteredProducts.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📋</div>
          <h3 style={styles.emptyTitle}>
            {searchTerm ? 'No se encontraron productos' : 'Catálogo vacío'}
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
          {searchTerm && (
            <button onClick={clearSearch} style={styles.emptyBtn}>
              Limpiar búsqueda
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
              {filteredProducts.map((product, index) => (
                <tr key={product?.id || index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                  <td style={styles.td}>
                    <code style={styles.sku}>{product?.sku || '-'}</code>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.productName}>{product?.name || '-'}</div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.description}>
                      {product?.description || '-'}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.price}>{formatPrice(product?.price)}</div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.stockControl}>
                      <button
                        onClick={() => updateStock(product, -1)}
                        disabled={product?.stock === 0 || updatingStock[product?.id]}
                        style={{
                          ...styles.stockBtn,
                          ...((product?.stock === 0 || updatingStock[product?.id]) ? styles.stockBtnDisabled : {})
                        }}
                      >
                        −
                      </button>
                      <div style={styles.stockDisplay}>
                        <span style={styles.stockNumber}>{product?.stock || 0}</span>
                        <span style={styles.stockUnit}>uds.</span>
                        {updatingStock[product?.id] && (
                          <div style={styles.stockSpinner}></div>
                        )}
                      </div>
                      <button
                        onClick={() => updateStock(product, 1)}
                        disabled={updatingStock[product?.id]}
                        style={{
                          ...styles.stockBtn,
                          ...(updatingStock[product?.id] ? styles.stockBtnDisabled : {})
                        }}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td style={styles.td}>
                    {getAvailabilityBadge(product?.stock || 0)}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button
                        onClick={() => handleEdit(product)}
                        style={styles.editBtn}
                        title="Editar producto"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        disabled={deletingProduct === product?.id}
                        style={{
                          ...styles.deleteBtn,
                          ...(deletingProduct === product?.id ? styles.deleteBtnDisabled : {})
                        }}
                        title="Eliminar producto"
                      >
                        {deletingProduct === product?.id ? '...' : '🗑️'}
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
  
  searchSection: {
    maxWidth: '1280px',
    margin: '0 auto 1.5rem auto',
  },
  
  searchContainer: {
    position: 'relative',
    marginBottom: '0.5rem',
  },
  
  searchIcon: {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  
  searchInput: {
    width: '100%',
    padding: '0.75rem 2.5rem 0.75rem 2.5rem',
    fontSize: '0.875rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    backgroundColor: 'white',
    color: '#1e293b',
    transition: 'all 0.2s ease',
    outline: 'none',
  },
  
  clearBtn: {
    position: 'absolute',
    right: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    fontSize: '1.25rem',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '0.25rem',
    transition: 'color 0.2s ease',
  },
  
  searchInfo: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  
  searchResultText: {
    fontSize: '0.75rem',
    color: '#64748b',
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
  
  stockControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  
  stockBtn: {
    width: '1.75rem',
    height: '1.75rem',
    backgroundColor: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    color: '#5b3cc4',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  
  stockBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    backgroundColor: '#f8fafc',
    color: '#94a3b8',
  },
  
  stockDisplay: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.25rem',
    minWidth: '3.5rem',
    justifyContent: 'center',
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
  
  stockSpinner: {
    width: '0.875rem',
    height: '0.875rem',
    border: '2px solid #e2e8f0',
    borderTopColor: '#5b3cc4',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
    marginLeft: '0.25rem',
  },
  
  actions: {
    display: 'flex',
    gap: '0.5rem',
  },
  
  editBtn: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#e0e7ff',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
  },
  
  deleteBtn: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#fee2e2',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
  },
  
  deleteBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
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

// Agregar animaciones
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  
  button:active:not(:disabled) {
    transform: translateY(0);
  }
  
  input:focus {
    border-color: #5b3cc4;
    box-shadow: 0 0 0 3px rgba(91, 60, 196, 0.1);
  }
  
  .${styles.editBtn}:hover:not(:disabled) {
    background-color: #c7d2fe;
  }
  
  .${styles.deleteBtn}:hover:not(:disabled) {
    background-color: #fecaca;
  }
`;
document.head.appendChild(styleSheet);

export default ProductList;