import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ProductList from '../pages/Products/ProductList';
import ProductForm from '../pages/ProductForm';
import ShopPage from '../pages/ShopPage';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(
    localStorage.getItem('user') || '{}'
  );

  if (!token) {
    return <Navigate to="/" />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/shop" />;
  }

  return children;
};

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="/products"
          element={
            <PrivateRoute adminOnly>
              <ProductList />
            </PrivateRoute>
          }
        />

        <Route
          path="/products/create"
          element={
            <PrivateRoute adminOnly>
              <ProductForm />
            </PrivateRoute>
          }
        />

        <Route
          path="/products/edit/:sku"
          element={<ProductForm />}
        />

        <Route
          path="/shop"
          element={
            <PrivateRoute>
              <ShopPage />
            </PrivateRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
