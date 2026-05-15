// src/pages/ProductForm/index.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ProductForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    price: '',
    stock: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        sku: formData.sku.trim(),
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
      };

      await api.post('/products', payload);

      alert('✓ Producto registrado exitosamente');

      navigate('/');
    } catch (error) {
      console.error('Error:', error);

      if (error.response) {
        if (error.response.status === 409) {
          alert('✗ Error: El SKU ya existe');
        } else if (error.response.status === 400) {
          const messages =
            error.response.data.errors ||
            error.response.data.message;

          if (Array.isArray(messages)) {
            alert(messages.join('\n'));
          } else {
            alert(messages || 'Datos inválidos');
          }
        } else {
          alert(
            error.response.data.message ||
            'No se pudo registrar el producto'
          );
        }
      } else {
        alert('Error de conexión con el backend');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              Registrar Producto
            </h1>

            <p style={styles.subtitle}>
              Agrega un nuevo producto al inventario
            </p>
          </div>

          <button
            onClick={() => navigate('/')}
            style={styles.backButton}
          >
            ← Volver
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>
              SKU *
            </label>

            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              placeholder="Ej: PROD-001"
              style={{
                ...styles.input,
                ...(errors.sku && styles.inputError),
              }}
            />

            {errors.sku && (
              <span style={styles.errorText}>
                {errors.sku}
              </span>
            )}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              Nombre *
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nombre del producto"
              style={{
                ...styles.input,
                ...(errors.name && styles.inputError),
              }}
            />

            {errors.name && (
              <span style={styles.errorText}>
                {errors.name}
              </span>
            )}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              Descripción
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Descripción opcional"
              style={styles.textarea}
            />
          </div>

          <div style={styles.row}>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>
                Precio *
              </label>

              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                style={{
                  ...styles.input,
                  ...(errors.price && styles.inputError),
                }}
              />

              {errors.price && (
                <span style={styles.errorText}>
                  {errors.price}
                </span>
              )}
            </div>

            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>
                Stock *
              </label>

              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                step="1"
                min="0"
                style={{
                  ...styles.input,
                  ...(errors.stock && styles.inputError),
                }}
              />

              {errors.stock && (
                <span style={styles.errorText}>
                  {errors.stock}
                </span>
              )}
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
              style={{
                ...styles.submitButton,
                ...(isSubmitting && styles.disabledButton),
              }}
            >
              {isSubmitting
                ? 'Registrando...'
                : 'Registrar Producto'}
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
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    width: '100%',
    maxWidth: '900px',
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    padding: '2rem',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
    marginBottom: '2rem',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid #e2e8f0',
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
  },

  backButton: {
    padding: '0.625rem 1rem',
    backgroundColor: '#f8fafc',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
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
    flexWrap: 'wrap',
  },

  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#334155',
  },

  input: {
    padding: '0.875rem 1rem',
    border: '1px solid #cbd5e1',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    color: '#1e293b',
    outline: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: 'white',
  },

  textarea: {
    padding: '0.875rem 1rem',
    border: '1px solid #cbd5e1',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    color: '#1e293b',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    backgroundColor: 'white',
  },

  inputError: {
    borderColor: '#ef4444',
  },

  errorText: {
    fontSize: '0.75rem',
    color: '#dc2626',
  },

  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '1rem',
  },

  cancelButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  submitButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#5b3cc4',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },

  disabledButton: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
};

const styleSheet = document.createElement('style');

styleSheet.textContent = `
  button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
  }

  button:active {
    transform: translateY(0);
  }

  input:focus,
  textarea:focus {
    border-color: #5b3cc4;
    box-shadow: 0 0 0 3px rgba(91, 60, 196, 0.1);
  }
`;

document.head.appendChild(styleSheet);

export default ProductForm;