// src/routes/AppRouter.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProductForm from '../pages/ProductForm';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>Product List - Coming Soon</div>} />
        <Route path="/products/new" element={<ProductForm />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;