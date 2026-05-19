// src/pages/ProductForm/index.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const ProductForm = () => {
  const navigate = useNavigate();
  const { sku } = useParams();
  const isEditMode = !!sku;
  
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    price: '',
    stock: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditMode);

  useEffect(() => {
    if (isEditMode) {
      fetchProduct();
    }
  }, [isEditMode, sku]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/sku/${sku}`);
      const product = response.data.product;
      setFormData({
        sku: product.sku,
        name: product.name,
        description: product.description || '',
        price: product.price,
        stock: product.stock,
      });
    } catch (error) {
      console.error('Error al cargar producto:', error);
      alert('No se pudo cargar el producto para editar');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU es obligatorio';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Nombre es obligatorio';
    }

    const price = parseFloat(formData.price);
    if (!formData.price) {
      newErrors.price = 'Precio es obligatorio';
    } else if (isNaN(price) || price <= 0) {
      newErrors.price = 'Precio debe ser mayor a 0';
    }

    const stock = parseInt(formData.stock);
    if (!formData.stock && formData.stock !== 0) {
      newErrors.stock = 'Stock es obligatorio';
    } else if (isNaN(stock) || stock < 0) {
      newErrors.stock = 'Stock debe ser mayor o igual a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const payload = {
        sku: formData.sku.trim(),
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
      };
      
      if (isEditMode) {
        await api.put(`/products/${formData.sku}`, payload);
        alert('Producto actualizado exitosamente');
      } else {
        await api.post('/products', payload);
        alert('Producto registrado exitosamente');
      }
      
      navigate('/');
    } catch (error) {
      console.error('Error:', error);
      if (error.response) {
        if (error.response.status === 409) {
          alert('El SKU ya existe en el sistema');
        } else if (error.response.status === 400) {
          const messages = error.response.data.errors || error.response.data.message;
          if (Array.isArray(messages)) {
            alert(`Error de validación:\n${messages.join('\n')}`);
          } else {
            alert(`Error: ${messages || 'Datos inválidos'}`);
          }
        } else if (error.response.status === 404) {
          alert('Producto no encontrado');
        } else {
          alert(`Error: ${error.response.data.message || 'No se pudo completar la operación'}`);
        }
      } else if (error.request) {
        alert('Error de conexión: No se puede conectar al servidor');
      } else {
        alert(`Error: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingCard}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Cargando producto...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <button onClick={() => navigate('/')} style={styles.backButton}>
          ← Volver al listado
        </button>
        
        <h1 style={styles.title}>
          {isEditMode ? 'Editar Producto' : 'Registrar Nuevo Producto'}
        </h1>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>SKU *</label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              disabled={isEditMode}
              style={{
                ...styles.input,
                ...(errors.sku && styles.inputError),
                ...(isEditMode && styles.inputDisabled)
              }}
              placeholder="Ej: PROD-001"
            />
            {errors.sku && <span style={styles.errorText}>{errors.sku}</span>}
            {isEditMode && (
              <span style={styles.hintText}>El SKU no puede modificarse</span>
            )}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Nombre *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={{ ...styles.input, ...(errors.name && styles.inputError) }}
              placeholder="Nombre del producto"
            />
            {errors.name && <span style={styles.errorText}>{errors.name}</span>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Descripción</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              style={styles.textarea}
              placeholder="Descripción opcional"
              rows="3"
            />
          </div>

          <div style={styles.row}>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Precio *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                style={{ ...styles.input, ...(errors.price && styles.inputError) }}
                placeholder="0.00"
                step="0.01"
                min="0.01"
              />
              {errors.price && <span style={styles.errorText}>{errors.price}</span>}
            </div>

            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Stock *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                style={{ ...styles.input, ...(errors.stock && styles.inputError) }}
                placeholder="0"
                step="1"
                min="0"
              />
              {errors.stock && <span style={styles.errorText}>{errors.stock}</span>}
            </div>
          </div>

          <div style={styles.actions}>
            <button
              type="button"
              onClick={() => navigate('/')}
              style={styles.cancelButton}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ ...styles.submitButton, ...(isSubmitting && styles.disabledButton) }}
            >
              {isSubmitting 
                ? (isEditMode ? 'Actualizando...' : 'Registrando...') 
                : (isEditMode ? 'Actualizar Producto' : 'Registrar Producto')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
    padding: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  card: {
    background: 'white',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
    padding: '2rem',
    maxWidth: '800px',
    width: '100%',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: '1.5rem',
    left: '1.5rem',
    background: 'none',
    border: 'none',
    color: '#5b3cc4',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.375rem',
    transition: 'background 0.2s',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '2rem',
    marginTop: '0.5rem',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  row: {
    display: 'flex',
    gap: '1rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#475569',
  },
  input: {
    padding: '0.625rem 0.75rem',
    border: '1px solid #cbd5e1',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    outline: 'none',
    fontFamily: 'inherit',
  },
  textarea: {
    padding: '0.625rem 0.75rem',
    border: '1px solid #cbd5e1',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    resize: 'vertical',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  inputDisabled: {
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    cursor: 'not-allowed',
  },
  inputError: {
    borderColor: '#dc2626',
  },
  errorText: {
    fontSize: '0.75rem',
    color: '#dc2626',
  },
  hintText: {
    fontSize: '0.75rem',
    color: '#94a3b8',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  cancelButton: {
    flex: 1,
    padding: '0.625rem',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  submitButton: {
    flex: 1,
    padding: '0.625rem',
    backgroundColor: '#5b3cc4',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
    cursor: 'not-allowed',
  },
  loadingCard: {
    background: 'white',
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
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  input:focus, textarea:focus {
    border-color: #5b3cc4;
    box-shadow: 0 0 0 3px rgba(91, 60, 196, 0.1);
  }
  
  button:hover {
    transform: translateY(-1px);
  }
  
  button:active {
    transform: translateY(0);
  }
  
  .cancelButton:hover {
    background-color: #e2e8f0;
  }
  
  .submitButton:hover {
    background-color: #4a2db8;
  }
`;
document.head.appendChild(styleSheet);

export default ProductForm;