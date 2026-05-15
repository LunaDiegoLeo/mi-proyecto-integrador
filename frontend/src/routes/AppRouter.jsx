// src/routes/AppRouter.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProductForm from '../pages/ProductForm';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            <div style={styles.placeholder}>
              <h1>Lista de Productos</h1>
              <p>Próximamente: Tabla de productos con disponibilidad</p>
              <a href="/products/new" style={styles.link}>→ Registrar nuevo producto</a>
            </div>
          } 
        />
        <Route path="/products/new" element={<ProductForm />} />
      </Routes>
    </BrowserRouter>
  );
};

const styles = {
  placeholder: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    textAlign: 'center',
  },
  link: {
    marginTop: '20px',
    color: 'white',
    fontSize: '18px',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
};

export default AppRouter;