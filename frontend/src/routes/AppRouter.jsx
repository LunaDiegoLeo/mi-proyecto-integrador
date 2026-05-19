// src/routes/AppRouter.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProductList from '../pages/Products/ProductList';
import ProductForm from '../pages/ProductForm';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/products/new" element={<ProductForm />} />
        <Route path="/products/edit/:sku" element={<ProductForm />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;