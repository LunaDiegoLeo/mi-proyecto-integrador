import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] =
    useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await axios.post(
        'https://mi-proyecto-integrador.onrender.com/api/auth/login',
        form
      );

      localStorage.setItem(
        'token',
        response.data.token
      );

      localStorage.setItem(
        'user',
        JSON.stringify(response.data.user)
      );

      if (
        response.data.user.role === 'admin'
      ) {
        navigate('/products');
      } else {
        navigate('/shop');
      }

    } catch (error) {
      alert(
        error?.response?.data?.message ||
          'Credenciales incorrectas'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form
        className="auth-form"
        onSubmit={handleLogin}
      >
        <h1>Tienda TECNM</h1>

        <p>
          Inicia sesión para continuar
        </p>

        <input
          type="email"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
        />

        <button type="submit">
          {loading
            ? 'Ingresando...'
            : 'Iniciar sesión'}
        </button>

        <button
          type="button"
          className="secondary-btn"
          onClick={() =>
            navigate('/register')
          }
        >
          Crear cuenta
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
