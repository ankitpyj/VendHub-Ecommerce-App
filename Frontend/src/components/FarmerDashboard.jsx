import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, BarChart3, PlusCircle, DollarSign, Scale, Tag, Image, FileText, X, AlertCircle, CheckCircle } from 'lucide-react';

// Enhanced AddProductForm Component
const AddProductForm = ({ onClose, onProductAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    stock: '',
    unit: '',
    price: '',
    description: '',
    category: '',
    imageUrl: ''
  });

  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const backendUrl = 'http://localhost:5000';

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.stock || parseFloat(formData.stock) < 0) newErrors.stock = 'Stock must be a positive number';
    if (!formData.unit) newErrors.unit = 'Unit selection is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Price must be greater than 0';
    
    // Optional URL validation
    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage({ text: 'Please fix the errors below', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    const token = localStorage.getItem('jwtToken');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token || !user || user.role !== 'farmer') {
      setMessage({ text: 'You must be logged in as a farmer to add products.', type: 'error' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/products/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          stock: parseFloat(formData.stock),
          unit: formData.unit,
          price: parseFloat(formData.price),
          description: formData.description.trim(),
          category: formData.category.trim() || 'Uncategorized',
          imageUrl: formData.imageUrl.trim() || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: data.msg || 'Product added successfully!', type: 'success' });
        // Clear form
        setFormData({
          name: '', stock: '', unit: '', price: '',
          description: '', category: '', imageUrl: ''
        });
        if (onProductAdded) {
          onProductAdded(data.product);
        }
        // Close modal after short delay to show success message
        setTimeout(() => onClose && onClose(), 1500);
      } else {
        setMessage({ text: data.msg || 'Failed to add product.', type: 'error' });
      }
    } catch (error) {
      console.error('Error adding product:', error);
      setMessage({ text: 'Network error. Could not connect to backend.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const popularCategories = [
    'Vegetables', 'Fruits', 'Grains', 'Pulses', 'Dairy', 'Spices', 'Herbs', 'Organic'
  ];

  return (
    <div className="p-8 bg-white rounded-2xl shadow-2xl max-w-2xl mx-auto my-8 font-inter relative">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="text-center mb-8">
        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800">Add New Product</h2>
        <p className="text-gray-600 mt-2">Fill in the details to list your product</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Name */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="e.g., Fresh Organic Onions"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all ${
                errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              required
            />
          </div>
          {errors.name && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Stock and Unit */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Quantity <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                step="any"
                min="0"
                placeholder="100"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all ${
                  errors.stock ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                required
              />
            </div>
            {errors.stock && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.stock}
              </p>
            )}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={formData.unit}
                onChange={(e) => handleInputChange('unit', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all appearance-none ${
                  errors.unit ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Select Unit</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="gram">Gram (g)</option>
                <option value="liter">Liter (L)</option>
                <option value="ml">Milliliter (ml)</option>
                <option value="piece">Piece</option>
                <option value="dozen">Dozen</option>
                <option value="bundle">Bundle</option>
                <option value="other">Other</option>
              </select>
            </div>
            {errors.unit && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.unit}
              </p>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price per Unit (₹) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="25.00"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all ${
                errors.price ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              required
            />
          </div>
          {errors.price && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.price}
            </p>
          )}
        </div>

        {/* Category */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="e.g., Vegetables, Fruits, Organic"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              list="categories"
            />
            <datalist id="categories">
              {popularCategories.map(cat => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {popularCategories.slice(0, 4).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => handleInputChange('category', cat)}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-green-100 hover:text-green-700 transition-colors"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <textarea
              placeholder="Describe your product quality, origin, organic certification, etc."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows="4"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-y"
            ></textarea>
          </div>
        </div>

        {/* Image URL */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Image URL
          </label>
          <div className="relative">
            <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="url"
              placeholder="https://example.com/product-image.jpg"
              value={formData.imageUrl}
              onChange={(e) => handleInputChange('imageUrl', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all ${
                errors.imageUrl ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.imageUrl && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.imageUrl}
            </p>
          )}
          {formData.imageUrl && !errors.imageUrl && (
            <div className="mt-2">
              <img 
                src={formData.imageUrl} 
                alt="Preview" 
                className="w-20 h-20 object-cover rounded-lg border"
                onError={(e) => {
                  e.target.style.display = 'none';
                  setErrors(prev => ({ ...prev, imageUrl: 'Invalid image URL' }));
                }}
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Adding Product...
              </>
            ) : (
              <>
                <PlusCircle className="w-5 h-5 mr-2" />
                Add Product
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Success/Error Message */}
      {message.text && (
        <div className={`mt-6 p-4 rounded-lg text-center flex items-center justify-center ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-2" />
          )}
          {message.text}
        </div>
      )}
    </div>
  );
};

// Enhanced FarmerDashboard Component
const FarmerDashboard = ({ user, setUser }) => {
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showRequirementsBrowser, setShowRequirementsBrowser] = useState(false);
  const [products, setProducts] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingRequirements, setLoadingRequirements] = useState(false);
  const [errorProducts, setErrorProducts] = useState('');
  const [errorRequirements, setErrorRequirements] = useState('');

  const backendUrl = 'http://localhost:5000';

  // Mock data for recent orders
  const recentOrders = [
    { id: 1, vendor: 'Rajesh Chat Corner', item: 'Onions - 10kg', amount: '₹320', status: 'Delivered' },
    { id: 2, vendor: 'Sunita Dosa Stall', item: 'Tomatoes - 5kg', amount: '₹150', status: 'Processing' },
    { id: 3, vendor: 'Kumar Vada Pav', item: 'Potatoes - 15kg', amount: '₹280', status: 'Pending' }
  ];

  const fetchProducts = async () => {
    setLoadingProducts(true);
    setErrorProducts('');
    const token = localStorage.getItem('jwtToken');

    if (!token || !user || user.role !== 'farmer') {
      setErrorProducts('Not authorized to fetch products. Please log in as a farmer.');
      setLoadingProducts(false);
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/products/my-products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (response.ok) {
        setProducts(data.products);
      } else {
        setErrorProducts(data.msg || 'Failed to fetch products.');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setErrorProducts('Network error. Could not fetch products.');
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch vendor requirements
  const fetchRequirements = async () => {
    setLoadingRequirements(true);
    setErrorRequirements('');
    const token = localStorage.getItem('jwtToken');

    if (!token) {
      setErrorRequirements('Please log in to view requirements.');
      setLoadingRequirements(false);
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/requirements/browse`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (response.ok) {
        setRequirements(data.requirements || []);
      } else {
        setErrorRequirements(data.msg || 'Failed to fetch requirements.');
      }
    } catch (error) {
      console.error('Error fetching requirements:', error);
      setErrorRequirements('Network error. Could not fetch requirements.');
    } finally {
      setLoadingRequirements(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'farmer') {
      fetchProducts();
    } else {
      setProducts([]);
      setLoadingProducts(false);
    }
  }, [user]);

  const handleProductAdded = (newProduct) => {
    setProducts(prevProducts => [newProduct, ...prevProducts]);
    setShowAddProductModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const activeProductsCount = products.length;
  const totalRevenue = products.reduce((sum, product) => sum + (product.price * product.totalSold || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 font-inter">
      {/* Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-green-600 to-green-700 w-10 h-10 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">VendHub Farmer</h1>
              <p className="text-sm text-gray-600">Manage your agricultural products</p>
            </div>
            <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
              Welcome, {user?.name || 'Farmer'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="p-6">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Active Products</p>
                <p className="text-3xl font-bold text-gray-800">{activeProductsCount}</p>
                <p className="text-xs text-green-600 mt-1">Ready for sale</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <Package className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Orders Today</p>
                <p className="text-3xl font-bold text-gray-800">8</p>
                <p className="text-xs text-blue-600 mt-1">+3 from yesterday</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <ShoppingCart className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-800">₹{totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-purple-600 mt-1">This month</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-6 text-gray-800">Recent Orders</h3>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-semibold text-gray-800">{order.vendor}</p>
                    <p className="text-sm text-gray-600">{order.item}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-green-600 text-lg">{order.amount}</span>
                    <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 text-center text-green-600 hover:text-green-700 font-semibold py-2 hover:bg-green-50 rounded-lg transition-colors">
              View All Orders →
            </button>
          </div>

          {/* Product Inventory */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Product Inventory</h3>
              <button
                onClick={() => setShowAddProductModal(true)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl text-sm font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg"
              >
                <PlusCircle className="w-4 h-4 mr-2" /> Add Product
              </button>
            </div>
            
            {loadingProducts ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading products...</p>
              </div>
            ) : errorProducts ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
                <p className="text-red-500">{errorProducts}</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No products found</p>
                <p className="text-gray-400 text-sm">Click "Add Product" to get started!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {products.map((item) => (
                  <div key={item._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                      ) : (
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-green-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-600">Stock: {item.stock} {item.unit}</p>
                        {item.category && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {item.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-green-600 text-lg">₹{item.price}/{item.unit}</span>
                      <br />
                      <button className="text-xs text-gray-500 hover:text-green-600 font-medium">
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Vendor Requirements Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Vendor Requirements</h3>
            <button 
              onClick={() => {
                setShowRequirementsBrowser(true);
                fetchRequirements();
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All Requirements
            </button>
          </div>
          
          {/* Show recent requirements preview */}
          <div className="space-y-3">
            {requirements.slice(0, 3).map((req, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{req.productName}</h4>
                    <p className="text-sm text-gray-600">Quantity: {req.quantity} {req.unit}</p>
                    {req.maxPrice && (
                      <p className="text-sm text-green-600">Max Price: ₹{req.maxPrice}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Posted by: {req.postedBy?.companyName || req.postedBy?.name}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      req.urgency === 'high' ? 'bg-red-100 text-red-800' :
                      req.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {req.urgency} priority
                    </span>
                    <button className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100">
                      Respond
                    </button>
                  </div>
                </div>
                {req.description && (
                  <p className="text-sm text-gray-600 mt-2">{req.description}</p>
                )}
              </div>
            ))}
            {requirements.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No requirements available</p>
                <button 
                  onClick={fetchRequirements}
                  className="text-blue-600 hover:text-blue-700 mt-2"
                >
                  Refresh
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => setShowAddProductModal(true)}
              className="p-4 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors flex flex-col items-center space-y-2 group"
            >
              <Package className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Add Product</span>
            </button>
            <button 
              onClick={() => {
                setShowRequirementsBrowser(true);
                fetchRequirements();
              }}
              className="p-4 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors flex flex-col items-center space-y-2 group"
            >
              <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Browse Requirements</span>
            </button>
            <button className="p-4 bg-orange-50 text-orange-700 rounded-xl hover:bg-orange-100 transition-colors flex flex-col items-center space-y-2 group">
              <BarChart3 className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">View Analytics</span>
            </button>
            <button className="p-4 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors flex flex-col items-center space-y-2 group">
              <DollarSign className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Payment History</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-h-screen overflow-y-auto">
            <AddProductForm
              onClose={() => setShowAddProductModal(false)}
              onProductAdded={handleProductAdded}
            />
          </div>
        </div>
      )}

      {/* Requirements Browser Modal */}
      {showRequirementsBrowser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Vendor Requirements</h2>
                <button 
                  onClick={() => setShowRequirementsBrowser(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <p className="text-gray-600 mt-2">Find opportunities to sell your products</p>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {loadingRequirements ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading requirements...</p>
                </div>
              ) : errorRequirements ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
                  <p className="text-red-500 text-lg">{errorRequirements}</p>
                </div>
              ) : requirements.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No requirements found</p>
                  <button 
                    onClick={fetchRequirements}
                    className="text-blue-600 hover:text-blue-700 mt-2"
                  >
                    Refresh
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {requirements.map((req) => (
                    <div key={req._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800">{req.productName}</h3>
                          <p className="text-gray-600">Quantity needed: {req.quantity} {req.unit}</p>
                          {req.maxPrice && (
                            <p className="text-green-600 font-medium">Budget: Up to ₹{req.maxPrice}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                            req.urgency === 'high' ? 'bg-red-100 text-red-800' :
                            req.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {req.urgency} priority
                          </span>
                          <span className={`text-xs px-3 py-1 rounded-full ${
                            req.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                      </div>
                      
                      {req.description && (
                        <p className="text-gray-600 mb-4">{req.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          <p><strong>Posted by:</strong> {req.postedBy?.companyName || req.postedBy?.name}</p>
                          <p><strong>Posted:</strong> {new Date(req.createdAt).toLocaleDateString()}</p>
                          {req.deadline && (
                            <p><strong>Deadline:</strong> {new Date(req.deadline).toLocaleDateString()}</p>
                          )}
                          {req.responses && req.responses.length > 0 && (
                            <p><strong>Responses:</strong> {req.responses.length}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                            Contact Vendor
                          </button>
                          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                            Submit Proposal
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;