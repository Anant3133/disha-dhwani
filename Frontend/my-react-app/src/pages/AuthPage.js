import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, registerUser } from '../api/authApi';
import { jwtDecode } from 'jwt-decode';

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    contact_number: '', // Added contact_number field
    role: 'mentee', // default role
  });
  const [error, setError] = useState(null); // State to hold error messages

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Handles form submission for both login and registration.
   */
  
const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
        if (isLogin) {
            // --- Login Logic ---
            const credentials = { email: formData.email, password: formData.password };
            const response = await login(credentials);
            
            // FIX: Access .token directly from the response object
            const token = response.token;

            if (!token) {
                throw new Error("Login failed: No token received.");
            }

            // ADDED: Console logs for debugging
            console.log("Login Success - Raw Token:", token);
            const decodedPayload = jwtDecode(token);
            console.log("Login Success - Decoded Payload:", decodedPayload);

            localStorage.setItem('authToken', token);
            localStorage.setItem('userId', decodedPayload.id);
            localStorage.setItem('userRole', decodedPayload.role);

            switch (decodedPayload.role) {
                case 'mentee':
                    navigate('/menteedashboard');
                    break;
                case 'mentor':
                    navigate('/mentordashboard');
                    break;
                case 'admin':
                    navigate('/adminhome');
                    break;
                default:
                    navigate('/');
                    break;
            }
        } else {
            // --- Registration Logic ---
            const response = await registerUser(formData);

            // FIX: Access .token directly from the response object
            const token = response.token;

            if (!token) {
                throw new Error("Registration failed: No token received from backend.");
            }

            // ADDED: Console logs for debugging
            console.log("Registration Success - Raw Token:", token);
            const decodedPayload = jwtDecode(token);
            console.log("Registration Success - Decoded Payload:", decodedPayload);

            localStorage.setItem('authToken', token);
            localStorage.setItem('userId', decodedPayload.id);
            localStorage.setItem('userRole', decodedPayload.role);

            switch (decodedPayload.role) {
                case 'mentee':
                    navigate('/menteedashboard');
                    break;
                case 'mentor':
                    navigate('/mentordashboard');
                    break;
                case 'admin':
                    navigate('/adminhome');
                    break;
                default:
                    navigate('/');
                    break;
            }
        }
    } catch (err) {
        setError(err.message || 'An unexpected error occurred.');
    }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isLogin ? 'Login to your account' : 'Create an account'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {/* Added Contact Number Input */}
              <input
                type="tel"
                name="contact_number"
                placeholder="Contact Number"
                value={formData.contact_number}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="mentee">Mentee</option>
                <option value="mentor">Mentor</option>
                <option value="admin">Admin</option>
              </select>
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {/* Display error message if it exists */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          {isLogin ? 'New here?' : 'Already have an account?'}{' '}
          <button
            onClick={() => {
                setIsLogin(!isLogin);
                setError(null); 
            }}
            className="text-blue-600 hover:underline"
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}
