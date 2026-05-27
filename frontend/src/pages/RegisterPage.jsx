import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        'http://localhost:3000/api/auth/register',
        form
      );

      alert(
        'Cuenta creada correctamente'
      );

      navigate('/');

    } catch (error) {
      alert(
        error?.response?.data?.message ||
          'Error al registrarse'
      );
    }
  };

  return (
    <div className="auth-container">
      <form
        className="auth-form"
        onSubmit={handleSubmit}
      >
        <h1>Crear Cuenta</h1>

        <input
          type="text"
          placeholder="Nombre"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
        />

        <input
          type="email"
          placeholder="Correo"
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
          Registrarse
        </button>

        <button
          type="button"
          className="secondary-btn"
          onClick={() => navigate('/')}
        >
          Volver al login
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;
