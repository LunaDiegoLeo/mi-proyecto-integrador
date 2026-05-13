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
      
      await api.post('/products', payload);
      alert('✓ Producto registrado exitosamente');
      navigate('/');
    } catch (error) {
      console.error('Error:', error);
      if (error.response) {
        if (error.response.status === 409) {
          alert('✗ Error: El SKU ya existe en el sistema');
        } else if (error.response.status === 400) {
          const messages = error.response.data.errors || error.response.data.message;
          if (Array.isArray(messages)) {
            alert(`✗ Error de validación:\n${messages.join('\n')}`);
          } else {
            alert(`✗ Error: ${messages || 'Datos inválidos'}`);
          }
        } else {
          alert(`✗ Error: ${error.response.data.message || 'No se pudo registrar el producto'}`);
        }
      } else if (error.request) {
        alert('✗ Error de conexión: No se puede conectar al servidor backend en http://localhost:3000');
      } else {
        alert(`✗ Error: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <button onClick={() => navigate('/')} style={styles.backButton}>
          ← Volver al inicio
        </button>
        
        <h1 style={styles.title}>Registrar Nuevo Producto</h1>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>SKU *</label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              style={{ ...styles.input, ...(errors.sku && styles.inputError) }}
              placeholder="Ej: PROD-001"
            />
            {errors.sku && <span style={styles.errorText}>{errors.sku}</span>}
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
              {isSubmitting ? 'Registrando...' : 'Registrar Producto'}
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
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    padding: '2rem',
    maxWidth: '800px',
    width: '100%',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    background: 'none',
    border: 'none',
    color: '#667eea',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    padding: '5px 10px',
    borderRadius: '6px',
    transition: 'background 0.3s',
  },
  title: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '1.5rem',
    marginTop: '1rem',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
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
    fontSize: '14px',
    fontWeight: '500',
    color: '#555',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'border-color 0.3s',
    outline: 'none',
  },
  textarea: {
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    outline: 'none',
  },
  inputError: {
    borderColor: '#dc2626',
  },
  errorText: {
    fontSize: '12px',
    color: '#dc2626',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  submitButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
  },
};

export default ProductForm;