import api from './api';
export const addProductToCart = async (data) => {
    const token = localStorage.getItem('token');
    const response = await api.post('/cart', data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};
export const getCart = async () => {
    const token = localStorage.getItem('token');
    const response = await api.get('/cart', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};