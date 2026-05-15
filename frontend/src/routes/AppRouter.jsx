// frontend/src/routes/AppRouter.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProductList from '../pages/Products/ProductList';
import ProductForm from '../pages/ProductForm/index';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/products/new" element={<ProductForm />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;