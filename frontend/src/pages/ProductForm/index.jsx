import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const ProductForm = () => {

  const navigate = useNavigate();

  const { sku } = useParams();

  const isEditMode = !!sku;

  const [form, setForm] = useState({
    sku:'',
    name:'',
    description:'',
    price:'',
    stock:'',
    imageUrl:''
  });

  const [errors, setErrors] = useState({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [loading, setLoading] =
    useState(isEditMode);

  useEffect(() => {

    if(isEditMode){
      fetchProduct();
    }

  }, [sku]);

  const fetchProduct = async () => {

    try {

      const response =
        await api.get(`/products/${sku}`);

      const product =
        response.data.data;

      setForm({
        sku:product.sku,
        name:product.name,
        description:
          product.description || '',
        price:product.price,
        stock:product.stock,
        imageUrl:
          product.imageUrl || ''
      });

    } catch(error){

      console.log(error);

      alert(
        'No se pudo cargar el producto'
      );

      navigate('/products');

    } finally {

      setLoading(false);

    }

  };

  const validateForm = () => {

    const newErrors = {};

    if(
      !isEditMode &&
      !form.sku.trim()
    ){
      newErrors.sku =
        'SKU obligatorio';
    }

    if(!form.name.trim()){
      newErrors.name =
        'Nombre obligatorio';
    }

    if(
      !form.price ||
      parseFloat(form.price) <= 0
    ){
      newErrors.price =
        'Precio inválido';
    }

    if(
      !isEditMode &&
      (
        form.stock === '' ||
        parseInt(form.stock) < 0
      )
    ){
      newErrors.stock =
        'Stock inválido';
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );

  };

  const handleChange = (e) => {

    const { name, value } = e.target;

    setForm({
      ...form,
      [name]:value
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if(!validateForm()){
      return;
    }

    setIsSubmitting(true);

    try {

      if(isEditMode){

        await api.put(
          `/products/${form.sku}`,
          {
            name:form.name,
            description:
              form.description,
            price:
              parseFloat(form.price),
            imageUrl:
              form.imageUrl
          }
        );

        alert(
          'Producto actualizado'
        );

      } else {

        await api.post(
          '/products',
          {
            sku:form.sku,
            name:form.name,
            description:
              form.description,
            price:
              parseFloat(form.price),
            stock:
              parseInt(form.stock),
            imageUrl:
              form.imageUrl
          }
        );

        alert(
          'Producto creado'
        );

      }

      navigate('/products');

    } catch(error){

      console.log(error);

      alert(
        error.response?.data?.message ||
        'Error'
      );

    } finally {

      setIsSubmitting(false);

    }

  };

  if(loading){

    return (
      <div style={styles.loading}>
        Cargando...
      </div>
    );

  }

  return (

    <div style={styles.container}>

      <div style={styles.card}>

        <button
          onClick={() =>
            navigate('/products')
          }
          style={styles.backButton}
        >
          ← Volver
        </button>

        <h1 style={styles.title}>
          {
            isEditMode
              ? 'Editar Producto'
              : 'Nuevo Producto'
          }
        </h1>

        <form
          onSubmit={handleSubmit}
          style={styles.form}
        >

          <input
            type="text"
            name="sku"
            placeholder="SKU"
            value={form.sku}
            onChange={handleChange}
            disabled={isEditMode}
            style={styles.input}
          />

          <input
            type="text"
            name="name"
            placeholder="Nombre"
            value={form.name}
            onChange={handleChange}
            style={styles.input}
          />

          <textarea
            name="description"
            placeholder="Descripción"
            value={form.description}
            onChange={handleChange}
            style={styles.textarea}
          />

          <input
            type="text"
            name="imageUrl"
            placeholder="URL imagen"
            value={form.imageUrl}
            onChange={handleChange}
            style={styles.input}
          />

          {
            form.imageUrl &&
            (
              <img
                src={form.imageUrl}
                style={styles.preview}
              />
            )
          }

          <input
            type="number"
            name="price"
            placeholder="Precio"
            value={form.price}
            onChange={handleChange}
            style={styles.input}
          />

          {
            !isEditMode &&
            (
              <input
                type="number"
                name="stock"
                placeholder="Stock"
                value={form.stock}
                onChange={handleChange}
                style={styles.input}
              />
            )
          }

          <button
            type="submit"
            disabled={isSubmitting}
            style={styles.submit}
          >

            {
              isSubmitting
                ? 'Guardando...'
                : (
                  isEditMode
                    ? 'Actualizar'
                    : 'Crear Producto'
                )
            }

          </button>

        </form>

      </div>

    </div>

  );

};

const styles = {

  container:{
    minHeight:'100vh',
    display:'flex',
    justifyContent:'center',
    alignItems:'center',
    background:'#f3f4f6',
    padding:'20px'
  },

  card:{
    width:'100%',
    maxWidth:'500px',
    background:'white',
    padding:'30px',
    borderRadius:'20px',
    boxShadow:
      '0 8px 30px rgba(0,0,0,.08)'
  },

  title:{
    marginBottom:'20px'
  },

  form:{
    display:'flex',
    flexDirection:'column',
    gap:'15px'
  },

  input:{
    padding:'14px',
    borderRadius:'12px',
    border:'1px solid #ddd',
    fontSize:'1rem'
  },

  textarea:{
    padding:'14px',
    borderRadius:'12px',
    border:'1px solid #ddd',
    minHeight:'100px'
  },

  submit:{
    padding:'15px',
    border:'none',
    borderRadius:'12px',
    background:'#5b3cc4',
    color:'white',
    fontWeight:'bold',
    cursor:'pointer'
  },

  backButton:{
    marginBottom:'20px',
    border:'none',
    background:'transparent',
    cursor:'pointer'
  },

  preview:{
    width:'100%',
    height:'250px',
    objectFit:'cover',
    borderRadius:'15px'
  },

  loading:{
    padding:'50px',
    textAlign:'center'
  }

};

export default ProductForm;