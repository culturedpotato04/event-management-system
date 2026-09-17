import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { register } from '../../services/authService';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { fetchUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(formData);
      await fetchUser(); // Reload context state
      navigate('/events');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Database may be unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-130px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <div>
            <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">Create an account</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Already have an account? <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">Log in</Link>
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">{error}</div>}
            
            <div className="space-y-4">
              <Input
                label="Full Name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
              />
              <Input
                label="Email address"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
              />
              <Input
                label="Password"
                name="password"
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
              />
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="user">Regular User (Book Tickets)</option>
                  <option value="organizer">Organizer (Host Events)</option>
                </select>
              </div>
            </div>

            <Button type="submit" className="w-full" isLoading={loading}>
              Sign up
            </Button>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default Register;
