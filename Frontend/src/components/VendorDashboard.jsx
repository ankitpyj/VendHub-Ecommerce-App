import React, { useState, useEffect } from 'react';
import { ShoppingCart, Users, BarChart3, Package, Search, Filter, Star, Phone, Mail, MapPin, Clock, Zap, AlertCircle, X, Moon, Sun, Heart, TrendingUp, Award, Shield, Calendar, User, MessageCircle } from 'lucide-react';

const VendorDashboard = ({ user, setUser }) => {
  const [products, setProducts] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingRequirements, setLoadingRequirements] = useState(false);
  const [showProductBrowser, setShowProductBrowser] = useState(false);
  const [showRequirementForm, setShowRequirementForm] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showTrackOrdersModal, setShowTrackOrdersModal] = useState(false);
  const [showMessagingModal, setShowMessagingModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [darkMode, setDarkMode] = useState(false);
  const [orderForm, setOrderForm] = useState({
    quantity: '',
    notes: '',
    urgency: 'medium'
  });

  // Form state for posting requirements
  const [requirementForm, setRequirementForm] = useState({
    productName: '',
    quantity: '',
    unit: 'kg',
    maxPrice: '',
    description: '',
    category: '',
    urgency: 'medium',
    deadline: ''
  });

  const backendUrl = 'http://localhost:5000';

  // Mock data for dashboard stats (these could be fetched from API)
  const recentOrders = [
    { item: 'Onions - 10kg', farmer: 'Ramesh Farm Fresh', status: 'Delivered', amount: '₹320' },
    { item: 'Tomatoes - 5kg', farmer: 'Krishnan Organics', status: 'In Transit', amount: '₹200' },
    { item: 'Green Chilies - 2kg', farmer: 'Suresh Agro', status: 'Processing', amount: '₹120' }
  ];

  const getStatusColor = (status) => {
    const baseClasses = darkMode ? {
      'Delivered': 'bg-green-900/50 text-green-300 border border-green-700/50',
      'In Transit': 'bg-yellow-900/50 text-yellow-300 border border-yellow-700/50',
      'Processing': 'bg-blue-900/50 text-blue-300 border border-blue-700/50',
      'default': 'bg-gray-800/50 text-gray-300 border border-gray-600/50'
    } : {
      'Delivered': 'bg-green-100 text-green-800 border border-green-200',
      'In Transit': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'Processing': 'bg-blue-100 text-blue-800 border border-blue-200',
      'default': 'bg-gray-100 text-gray-800 border border-gray-200'
    };
    
    return baseClasses[status] || baseClasses.default;
  };

  const getUrgencyColor = (urgency) => {
    const baseClasses = darkMode ? {
      'high': 'bg-red-900/50 text-red-300 border border-red-700/50',
      'medium': 'bg-yellow-900/50 text-yellow-300 border border-yellow-700/50',
      'low': 'bg-green-900/50 text-green-300 border border-green-700/50',
      'default': 'bg-gray-800/50 text-gray-300 border border-gray-600/50'
    } : {
      'high': 'bg-red-100 text-red-800 border border-red-200',
      'medium': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'low': 'bg-green-100 text-green-800 border border-green-200',
      'default': 'bg-gray-100 text-gray-800 border border-gray-200'
    };
    
    return baseClasses[urgency] || baseClasses.default;
  };

  // Fetch products from farmers
  const fetchProducts = async () => {
    setLoadingProducts(true);
    const token = localStorage.getItem('jwtToken');

    if (!token) {
      setMessage({ text: 'Please log in to browse products.', type: 'error' });
      setLoadingProducts(false);
      return;
    }

    try {
      const url = new URL(`${backendUrl}/api/products/browse`);
      if (searchTerm) url.searchParams.append('search', searchTerm);
      if (categoryFilter !== 'all') url.searchParams.append('category', categoryFilter);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (response.ok) {
        setProducts(data.products || []);
        setMessage({ text: '', type: '' });
      } else {
        setMessage({ text: data.msg || 'Failed to fetch products.', type: 'error' });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setMessage({ text: 'Network error. Could not fetch products.', type: 'error' });
    } finally {
      setLoadingProducts(false);
    }
  };

  // Post a requirement
  const postRequirement = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('jwtToken');

    if (!token) {
      setMessage({ text: 'Please log in to post requirements.', type: 'error' });
      return;
    }

    if (!requirementForm.productName || !requirementForm.quantity || !requirementForm.unit) {
      setMessage({ text: 'Please fill in all required fields.', type: 'error' });
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/requirements/post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requirementForm)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: 'Requirement posted successfully!', type: 'success' });
        setRequirementForm({
          productName: '',
          quantity: '',
          unit: 'kg',
          maxPrice: '',
          description: '',
          category: '',
          urgency: 'medium',
          deadline: ''
        });
        setShowRequirementForm(false);
        fetchMyRequirements();
      } else {
        setMessage({ text: data.msg || 'Failed to post requirement.', type: 'error' });
      }
    } catch (error) {
      console.error('Error posting requirement:', error);
      setMessage({ text: 'Network error. Could not post requirement.', type: 'error' });
    }
  };

  // Fetch vendor's requirements
  const fetchMyRequirements = async () => {
    setLoadingRequirements(true);
    const token = localStorage.getItem('jwtToken');

    if (!token) {
      setLoadingRequirements(false);
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/requirements/my-requirements`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (response.ok) {
        setRequirements(data.requirements || []);
      }
    } catch (error) {
      console.error('Error fetching requirements:', error);
    } finally {
      setLoadingRequirements(false);
    }
  };

  // Handle contact farmer
  const handleContactFarmer = (product) => {
    setSelectedProduct(product);
    setShowContactModal(true);
  };

  // Handle order product
  const handleOrderProduct = (product) => {
    setSelectedProduct(product);
    setOrderForm({
      quantity: '',
      notes: '',
      urgency: 'medium'
    });
    setShowOrderModal(true);
  };

  // Submit order
  const submitOrder = async (e) => {
    e.preventDefault();
    
    if (!orderForm.quantity || parseFloat(orderForm.quantity) <= 0) {
      setMessage({ text: 'Please enter a valid quantity.', type: 'error' });
      return;
    }

    if (parseFloat(orderForm.quantity) > selectedProduct.stock) {
      setMessage({ text: 'Quantity exceeds available stock.', type: 'error' });
      return;
    }

    const token = localStorage.getItem('jwtToken');
    if (!token) {
      setMessage({ text: 'Please log in to place orders.', type: 'error' });
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/orders/place`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: selectedProduct._id,
          quantity: parseFloat(orderForm.quantity),
          notes: orderForm.notes.trim(),
          urgency: orderForm.urgency
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          text: `Order placed successfully! Order total: ₹${(parseFloat(orderForm.quantity) * selectedProduct.price).toFixed(2)}`, 
          type: 'success' 
        });
        
        setShowOrderModal(false);
        setOrderForm({ quantity: '', notes: '', urgency: 'medium' });
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setMessage({ text: '', type: '' });
        }, 5000);
      } else {
        setMessage({ text: data.msg || 'Failed to place order.', type: 'error' });
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setMessage({ text: 'Network error. Could not place order.', type: 'error' });
    }
  };

  // Fetch vendor's orders
  const fetchOrders = async () => {
    setLoadingOrders(true);
    const token = localStorage.getItem('jwtToken');

    if (!token) {
      setMessage({ text: 'Please log in to view orders.', type: 'error' });
      setLoadingOrders(false);
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/orders/vendor-orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (response.ok) {
        setOrders(data.orders || []);
      } else {
        setMessage({ text: data.msg || 'Failed to fetch orders.', type: 'error' });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setMessage({ text: 'Network error. Could not fetch orders.', type: 'error' });
    } finally {
      setLoadingOrders(false);
    }
  };

  // Handle track orders
  const handleTrackOrders = () => {
    setShowTrackOrdersModal(true);
    fetchOrders();
  };

  // Handle messaging farmers
  const handleMessageFarmers = () => {
    setShowMessagingModal(true);
    if (products.length === 0) {
      fetchProducts(); // Load farmers/products if not already loaded
    }
  };

  // Select a farmer to chat with
  const selectFarmer = (farmer) => {
    setSelectedFarmer(farmer);
    // Generate more realistic demo messages
    const demoMessages = [
      {
        id: 1,
        sender: farmer.name || farmer.farmName || 'Farmer',
        message: `Hello! I have fresh ${farmer.productName || 'products'} available. What are you looking for?`,
        time: "10:30 AM",
        isOwn: false
      },
      {
        id: 2,
        sender: user?.name || 'You',
        message: `Hi! I'm interested in your ${farmer.productName || 'products'}. Can we discuss pricing and bulk orders?`,
        time: "10:32 AM",
        isOwn: true
      },
      {
        id: 3,
        sender: farmer.name || farmer.farmName || 'Farmer',
        message: `Sure! I can offer competitive rates for bulk orders. Current price is ₹${farmer.productPrice || '0'}/${farmer.productUnit || 'kg'}. How much quantity do you need?`,
        time: "10:35 AM",
        isOwn: false
      }
    ];
    
    setMessages(demoMessages);
  };

  // Send a new message with better UX
  const sendMessage = () => {
    if (!newMessage.trim() || !selectedFarmer) return;

    const message = {
      id: Date.now(), // Use timestamp for unique ID
      sender: user?.name || 'You',
      message: newMessage.trim(),
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      isOwn: true
    };

    setMessages(prevMessages => [...prevMessages, message]);
    setNewMessage('');

    // Generate more contextual and varied farmer responses
    const getContextualResponse = (userMessage, farmer) => {
      const msg = userMessage.toLowerCase();
      const productName = farmer.productName || 'product';
      const price = farmer.productPrice || '0';
      const unit = farmer.productUnit || 'kg';
      
      // Pricing related responses
      if (msg.includes('price') || msg.includes('cost') || msg.includes('rate')) {
        return [
          `For ${productName}, my current rate is ₹${price}/${unit}. For bulk orders above 50${unit}, I can offer 5% discount.`,
          `The price for ${productName} is ₹${price}/${unit}. If you're ordering regularly, we can discuss better rates.`,
          `Current pricing is ₹${price}/${unit} for ${productName}. What quantity are you looking for?`
        ];
      }
      
      // Quantity related responses
      if (msg.includes('quantity') || msg.includes('stock') || msg.includes('available')) {
        return [
          `I have good stock of fresh ${productName}. How much quantity do you need?`,
          `Currently I have around 200${unit} of ${productName} available. What's your requirement?`,
          `Fresh ${productName} is available. I can arrange up to 500${unit} if you need bulk quantity.`
        ];
      }
      
      // Quality related responses
      if (msg.includes('quality') || msg.includes('fresh') || msg.includes('organic')) {
        return [
          `All my ${productName} is freshly harvested and of premium quality. I maintain organic farming practices.`,
          `Quality is my priority! The ${productName} is chemical-free and freshly picked from my farm.`,
          `I ensure the best quality ${productName}. All products are carefully selected and packed fresh.`
        ];
      }
      
      // Delivery related responses
      if (msg.includes('delivery') || msg.includes('transport') || msg.includes('when')) {
        return [
          `I can arrange delivery within 2-3 days for ${productName}. Where do you need it delivered?`,
          `Delivery is available! For ${productName}, I usually deliver within 24-48 hours in nearby areas.`,
          `I have my own transport. Can deliver fresh ${productName} to your location quickly.`
        ];
      }
      
      // Order/purchase related responses
      if (msg.includes('order') || msg.includes('buy') || msg.includes('purchase')) {
        return [
          `Great! I can prepare your order for ${productName}. Please confirm the quantity and delivery address.`,
          `Perfect! Let me know the exact quantity of ${productName} you need and I'll arrange it.`,
          `Excellent! I can supply fresh ${productName} at ₹${price}/${unit}. When do you need it?`
        ];
      }
      
      // General/default responses
      return [
        `Thank you for your interest in my ${productName}! How can I help you with your order?`,
        `I'm glad you're considering my ${productName}. What specific information do you need?`,
        `Thanks for reaching out! I have fresh ${productName} ready. What would you like to know?`,
        `Hello! I'd be happy to supply ${productName} to you. What's your requirement?`,
        `Great to hear from you! My ${productName} is of excellent quality. How much do you need?`
      ];
    };

    // Simulate farmer reply with contextual responses
    setTimeout(() => {
      const possibleResponses = getContextualResponse(message.message, selectedFarmer);
      const randomResponse = possibleResponses[Math.floor(Math.random() * possibleResponses.length)];
      
      const reply = {
        id: Date.now() + 1,
        sender: selectedFarmer.name || selectedFarmer.farmName || 'Farmer',
        message: randomResponse,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        isOwn: false
      };
      setMessages(prev => [...prev, reply]);
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  };

  useEffect(() => {
    fetchMyRequirements();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div className={`min-h-screen transition-all duration-700 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Professional Header with Subtle Glow */}
      <header className={`backdrop-blur-xl border-b transition-all duration-500 sticky top-0 z-40 ${darkMode ? 'bg-gray-900/90 border-gray-800 shadow-lg shadow-gray-900/50' : 'bg-white/90 border-gray-200 shadow-lg shadow-gray-900/5'}`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Minimalist Logo */}
              <div className="relative group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${darkMode ? 'bg-gray-800 group-hover:bg-gray-700 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-400/30' : 'bg-gray-100 group-hover:bg-gray-200 shadow-lg shadow-gray-900/10 group-hover:shadow-gray-900/20'}`}>
                  <ShoppingCart className={`w-6 h-6 transition-colors duration-300 ${darkMode ? 'text-blue-400 group-hover:text-blue-300' : 'text-gray-700 group-hover:text-gray-900'}`} />
                </div>
              </div>
              
              <div>
                <h1 className={`text-2xl font-bold transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  VendHub
                </h1>
                <p className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Professional Marketplace
                </p>
              </div>
              
              {/* User Badge */}
              <div className={`px-4 py-2 rounded-lg transition-all duration-300 ${darkMode ? 'bg-gray-800 text-gray-300 shadow-lg shadow-gray-900/20' : 'bg-gray-100 text-gray-700 shadow-lg shadow-gray-900/5'}`}>
                <span className="font-medium">{user?.name || 'Vendor'}</span>
                <div className="w-2 h-2 bg-green-400 rounded-full inline-block ml-2"></div>
              </div>
            </div>
            
            {/* Header Controls */}
            <div className="flex items-center space-x-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-3 rounded-xl transition-all duration-300 ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400 shadow-lg shadow-gray-900/20 hover:shadow-yellow-400/20' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 shadow-lg shadow-gray-900/5 hover:shadow-gray-900/10'}`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${darkMode ? 'bg-red-900/20 hover:bg-red-900/30 text-red-400 border border-red-800/30 shadow-lg shadow-red-900/10' : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 shadow-lg shadow-gray-900/5'}`}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Professional Message Display */}
      {message.text && (
        <div className={`mx-6 mt-6 p-4 rounded-xl text-center flex items-center justify-center transition-all duration-500 ${
          message.type === 'success' 
            ? darkMode ? 'bg-green-900/20 text-green-400 border border-green-800/30 shadow-lg shadow-green-900/20' : 'bg-green-50 text-green-700 border border-green-200 shadow-lg shadow-green-900/5'
            : darkMode ? 'bg-red-900/20 text-red-400 border border-red-800/30 shadow-lg shadow-red-900/20' : 'bg-red-50 text-red-700 border border-red-200 shadow-lg shadow-gray-900/5'
        }`}>
          {message.type === 'success' ? (
            <Award className="w-5 h-5 mr-2" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-2" />
          )}
          {message.text}
        </div>
      )}

      <div className="p-6">
        {/* Professional Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Active Orders Card */}
          <div className={`group rounded-2xl transition-all duration-500 hover:scale-[1.02] ${darkMode ? 'bg-gray-800 border border-gray-700/50 shadow-xl shadow-gray-900/50 hover:shadow-blue-500/10' : 'bg-white border border-gray-200 shadow-xl shadow-gray-900/5 hover:shadow-gray-900/10'}`}>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Orders</p>
                  <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{recentOrders.length}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-500 text-sm font-medium">+12%</span>
                  </div>
                </div>
                <div className={`p-4 rounded-xl transition-all duration-300 ${darkMode ? 'bg-blue-500/10 group-hover:bg-blue-500/20' : 'bg-blue-50 group-hover:bg-blue-100'}`}>
                  <ShoppingCart className={`w-7 h-7 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Available Products Card */}
          <div className={`group rounded-2xl transition-all duration-500 hover:scale-[1.02] ${darkMode ? 'bg-gray-800 border border-gray-700/50 shadow-xl shadow-gray-900/50 hover:shadow-green-500/10' : 'bg-white border border-gray-200 shadow-xl shadow-gray-900/5 hover:shadow-gray-900/10'}`}>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Available Products</p>
                  <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{products.length}</p>
                  <div className="flex items-center mt-2">
                    <Package className="w-4 h-4 text-emerald-500 mr-1" />
                    <span className="text-emerald-500 text-sm font-medium">Fresh Stock</span>
                  </div>
                </div>
                <div className={`p-4 rounded-xl transition-all duration-300 ${darkMode ? 'bg-green-500/10 group-hover:bg-green-500/20' : 'bg-green-50 group-hover:bg-green-100'}`}>
                  <Package className={`w-7 h-7 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Requirements Card */}
          <div className={`group rounded-2xl transition-all duration-500 hover:scale-[1.02] ${darkMode ? 'bg-gray-800 border border-gray-700/50 shadow-xl shadow-gray-900/50 hover:shadow-purple-500/10' : 'bg-white border border-gray-200 shadow-xl shadow-gray-900/5 hover:shadow-gray-900/10'}`}>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>My Requirements</p>
                  <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{requirements.length}</p>
                  <div className="flex items-center mt-2">
                    <Star className="w-4 h-4 text-purple-500 mr-1" />
                    <span className="text-purple-500 text-sm font-medium">Active</span>
                  </div>
                </div>
                <div className={`p-4 rounded-xl transition-all duration-300 ${darkMode ? 'bg-purple-500/10 group-hover:bg-purple-500/20' : 'bg-purple-50 group-hover:bg-purple-100'}`}>
                  <BarChart3 className={`w-7 h-7 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced Available Products */}
          <div className={`group rounded-3xl transition-all duration-500 hover:scale-[1.02] ${darkMode ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50' : 'bg-white/70 backdrop-blur-lg border border-white/50'} shadow-xl hover:shadow-2xl`}>
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>Fresh Products</h3>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Premium quality from verified farmers</p>
                </div>
                <button 
                  onClick={() => {
                    setShowProductBrowser(true);
                    fetchProducts();
                  }}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 transform ${darkMode ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'} text-white shadow-lg hover:shadow-xl`}
                >
                  Browse All
                </button>
              </div>
              
              <div className="space-y-4">
                {products.slice(0, 3).map((product, i) => (
                  <div key={i} className={`group/item p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer ${darkMode ? 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/30' : 'bg-gray-50/50 hover:bg-white/80 border border-gray-200/50'} shadow-lg hover:shadow-xl`}>
                    <div className="flex items-center space-x-4">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded-xl shadow-md" />
                      ) : (
                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${darkMode ? 'bg-gradient-to-br from-green-600 to-emerald-600' : 'bg-gradient-to-br from-green-100 to-emerald-100'} shadow-md`}>
                          <Package className={`w-8 h-8 ${darkMode ? 'text-white' : 'text-green-600'}`} />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>{product.name}</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{product.owner?.farmName || product.owner?.name}</p>
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-500 font-medium">Verified Farmer</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'} mb-2`}>₹{product.price}/{product.unit}</p>
                        <button 
                          onClick={() => handleContactFarmer(product)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 ${darkMode ? 'bg-blue-900/50 text-blue-300 hover:bg-blue-800/50' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'} shadow-md hover:shadow-lg`}
                        >
                          Contact
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {products.length === 0 && (
                  <div className="text-center py-12">
                    <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <Package className={`w-10 h-10 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                    </div>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>No products available</p>
                    <button 
                      onClick={fetchProducts}
                      className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${darkMode ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'} text-white shadow-lg hover:shadow-xl`}
                    >
                      Refresh Products
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Recent Orders */}
          <div className={`group rounded-3xl transition-all duration-500 hover:scale-[1.02] ${darkMode ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-700/50' : 'bg-white/70 backdrop-blur-lg border border-white/50'} shadow-xl hover:shadow-2xl`}>
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>Recent Orders</h3>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Track your latest purchases</p>
                </div>
                <div className={`p-3 rounded-xl ${darkMode ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
                  <TrendingUp className={`w-6 h-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
              </div>
              
              <div className="space-y-4">
                {recentOrders.map((order, i) => (
                  <div key={i} className={`p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${darkMode ? 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/30' : 'bg-gray-50/50 hover:bg-white/80 border border-gray-200/50'} shadow-lg hover:shadow-xl`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-1`}>{order.item}</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>{order.farmer}</p>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-blue-500">Just now</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg mb-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{order.amount}</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)} shadow-md`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className={`w-full mt-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-[1.02] ${darkMode ? 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-gray-300' : 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700'} shadow-lg hover:shadow-xl`}>
                View All Orders
              </button>
            </div>
          </div>
        </div>

        {/* Requirements Section */}
        <div className="mt-6 bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Post Your Requirements</h3>
            <button 
              onClick={() => setShowRequirementForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Post New Requirement
            </button>
          </div>
          
          {/* Quick requirement form */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Product needed (e.g., Onions)"
              value={requirementForm.productName}
              onChange={(e) => setRequirementForm({...requirementForm, productName: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <input
              type="text"
              placeholder="Quantity (e.g., 50)"
              value={requirementForm.quantity}
              onChange={(e) => setRequirementForm({...requirementForm, quantity: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <select
              value={requirementForm.unit}
              onChange={(e) => setRequirementForm({...requirementForm, unit: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="kg">Kilogram (kg)</option>
              <option value="gram">Gram (g)</option>
              <option value="liter">Liter (L)</option>
              <option value="piece">Piece</option>
              <option value="dozen">Dozen</option>
              <option value="bundle">Bundle</option>
            </select>
            <button 
              onClick={postRequirement}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Quick Post
            </button>
          </div>

          {/* My Requirements */}
          {requirements.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold mb-3">My Recent Requirements</h4>
              <div className="space-y-2">
                {requirements.slice(0, 3).map((req, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{req.productName} - {req.quantity} {req.unit}</p>
                      <p className="text-sm text-gray-600">{req.responses?.length || 0} responses</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getUrgencyColor(req.urgency)}`}>
                        {req.urgency}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        req.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Professional Quick Actions */}
        <div className={`mt-8 rounded-2xl border transition-all duration-500 ${darkMode ? 'bg-gray-800 border-gray-700/50 shadow-xl shadow-gray-900/50' : 'bg-white border-gray-200 shadow-xl shadow-gray-900/5'}`}>
          <div className="p-6">
            <div className="flex items-center mb-6">
              <div className={`p-2 rounded-lg mr-3 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                <Zap className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </div>
              <div>
                <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Essential tools for marketplace management</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Browse Products */}
              <button 
                onClick={() => {
                  setShowProductBrowser(true);
                  fetchProducts();
                }}
                className={`group relative p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] ${darkMode ? 'bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600/30 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10' : 'bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10'}`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-500/10 group-hover:bg-blue-500/20' : 'bg-blue-50 group-hover:bg-blue-100'} transition-all duration-300`}>
                    <Package className={`w-6 h-6 ${darkMode ? 'text-blue-400 group-hover:text-blue-300' : 'text-blue-600 group-hover:text-blue-700'} transition-colors duration-300`} />
                  </div>
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900'} transition-colors duration-300`}>
                    Browse Products
                  </span>
                </div>
              </button>

              {/* Track Orders */}
              <button 
                onClick={handleTrackOrders}
                className={`group relative p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] ${darkMode ? 'bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600/30 hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/10' : 'bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-green-300 hover:shadow-lg hover:shadow-green-500/10'}`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-500/10 group-hover:bg-green-500/20' : 'bg-green-50 group-hover:bg-green-100'} transition-all duration-300`}>
                    <ShoppingCart className={`w-6 h-6 ${darkMode ? 'text-green-400 group-hover:text-green-300' : 'text-green-600 group-hover:text-green-700'} transition-colors duration-300`} />
                  </div>
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900'} transition-colors duration-300`}>
                    Track Orders
                  </span>
                </div>
              </button>

              {/* Message Farmers */}
              <button 
                onClick={handleMessageFarmers}
                className={`group relative p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] ${darkMode ? 'bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600/30 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/10' : 'bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-500/10'}`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-orange-500/10 group-hover:bg-orange-500/20' : 'bg-orange-50 group-hover:bg-orange-100'} transition-all duration-300`}>
                    <Mail className={`w-6 h-6 ${darkMode ? 'text-orange-400 group-hover:text-orange-300' : 'text-orange-600 group-hover:text-orange-700'} transition-colors duration-300`} />
                  </div>
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900'} transition-colors duration-300`}>
                    Messages
                  </span>
                </div>
              </button>

              {/* Post Requirement */}
              <button 
                onClick={() => setShowRequirementForm(true)}
                className={`group relative p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] ${darkMode ? 'bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600/30 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10' : 'bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/10'}`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-purple-500/10 group-hover:bg-purple-500/20' : 'bg-purple-50 group-hover:bg-purple-100'} transition-all duration-300`}>
                    <BarChart3 className={`w-6 h-6 ${darkMode ? 'text-purple-400 group-hover:text-purple-300' : 'text-purple-600 group-hover:text-purple-700'} transition-colors duration-300`} />
                  </div>
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900'} transition-colors duration-300`}>
                    Requirements
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Product Browser Modal */}
      {showProductBrowser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border transition-all duration-300 ${darkMode ? 'bg-gray-800 border-gray-700 shadow-2xl shadow-gray-900/50' : 'bg-white border-gray-200 shadow-2xl shadow-gray-900/10'}`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Browse Products</h2>
                <button 
                  onClick={() => setShowProductBrowser(false)}
                  className={`p-2 rounded-lg transition-all duration-200 ${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Search and Filter */}
              <div className="mt-4 flex gap-4">
                <div className="flex-1 relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'}`}
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className={`px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                >
                  <option value="all">All Categories</option>
                  <option value="vegetables">Vegetables</option>
                  <option value="fruits">Fruits</option>
                  <option value="grains">Grains</option>
                  <option value="organic">Organic</option>
                </select>
                <button 
                  onClick={fetchProducts}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20'}`}
                >
                  Search
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingProducts ? (
                <div className="text-center py-8">
                  <div className={`animate-spin rounded-full h-8 w-8 border-2 border-transparent mx-auto ${darkMode ? 'border-t-blue-400' : 'border-t-blue-600'}`}></div>
                  <p className={`mt-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading products...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8">
                  <Package className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                  <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No products found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <div key={product._id} className={`rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] border ${darkMode ? 'border-gray-700 bg-gray-700/30 hover:bg-gray-700/50 hover:shadow-lg hover:shadow-gray-900/50' : 'border-gray-200 bg-gray-50 hover:bg-white hover:shadow-lg hover:shadow-gray-900/10'}`}>
                      {product.imageUrl && (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-32 object-cover rounded-lg mb-3" />
                      )}
                      <h3 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{product.name}</h3>
                      <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{product.description}</p>
                      <div className="flex justify-between items-center mb-3">
                        <span className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>₹{product.price}/{product.unit}</span>
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Stock: {product.stock} {product.unit}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{product.owner?.farmName || product.owner?.name}</p>
                          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{product.owner?.farmLocation}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleContactFarmer(product)}
                            className={`text-xs px-3 py-2 rounded-lg font-medium transition-all duration-200 ${darkMode ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                          >
                            Contact
                          </button>
                          <button 
                            onClick={() => handleOrderProduct(product)}
                            className={`text-xs px-3 py-2 rounded-lg font-medium transition-all duration-200 ${darkMode ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                          >
                            Order
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

      {/* Professional Requirement Form Modal */}
      {showRequirementForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border transition-all duration-300 ${darkMode ? 'bg-gray-800 border-gray-700 shadow-2xl shadow-gray-900/50' : 'bg-white border-gray-200 shadow-2xl shadow-gray-900/10'}`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Post New Requirement</h2>
                <button 
                  onClick={() => setShowRequirementForm(false)}
                  className={`p-2 rounded-lg transition-all duration-200 ${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={postRequirement} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Product Name *</label>
                  <input
                    type="text"
                    required
                    value={requirementForm.productName}
                    onChange={(e) => setRequirementForm({...requirementForm, productName: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    placeholder="e.g., Fresh Onions"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category</label>
                  <input
                    type="text"
                    value={requirementForm.category}
                    onChange={(e) => setRequirementForm({...requirementForm, category: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    placeholder="e.g., Vegetables"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Quantity *</label>
                  <input
                    type="text"
                    required
                    value={requirementForm.quantity}
                    onChange={(e) => setRequirementForm({...requirementForm, quantity: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    placeholder="e.g., 50"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Unit *</label>
                  <select
                    required
                    value={requirementForm.unit}
                    onChange={(e) => setRequirementForm({...requirementForm, unit: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="gram">Gram (g)</option>
                    <option value="liter">Liter (L)</option>
                    <option value="piece">Piece</option>
                    <option value="dozen">Dozen</option>
                    <option value="bundle">Bundle</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Max Price (₹)</label>
                  <input
                    type="number"
                    value={requirementForm.maxPrice}
                    onChange={(e) => setRequirementForm({...requirementForm, maxPrice: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Urgency</label>
                  <select
                    value={requirementForm.urgency}
                    onChange={(e) => setRequirementForm({...requirementForm, urgency: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Deadline</label>
                  <input
                    type="date"
                    value={requirementForm.deadline}
                    onChange={(e) => setRequirementForm({...requirementForm, deadline: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
                <textarea
                  rows="4"
                  value={requirementForm.description}
                  onChange={(e) => setRequirementForm({...requirementForm, description: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 outline-none resize-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'}`}
                  placeholder="Any specific requirements or details..."
                ></textarea>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  className={`flex-1 py-3 rounded-xl font-medium transition-all duration-200 ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20'}`}
                >
                  Post Requirement
                </button>
                <button
                  type="button"
                  onClick={() => setShowRequirementForm(false)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Professional Contact Farmer Modal */}
      {showContactModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl max-w-md w-full border transition-all duration-300 ${darkMode ? 'bg-gray-800 border-gray-700 shadow-2xl shadow-gray-900/50' : 'bg-white border-gray-200 shadow-2xl shadow-gray-900/10'}`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Contact Farmer</h2>
                <button 
                  onClick={() => setShowContactModal(false)}
                  className={`p-2 rounded-lg transition-all duration-200 ${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                {selectedProduct.imageUrl && (
                  <img 
                    src={selectedProduct.imageUrl} 
                    alt={selectedProduct.name} 
                    className="w-20 h-20 object-cover rounded-xl mx-auto mb-4"
                  />
                )}
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedProduct.name}</h3>
                <p className={`font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>₹{selectedProduct.price}/{selectedProduct.unit}</p>
              </div>
              
              <div className="space-y-4 text-sm">
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <p className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Farmer Details:</p>
                  <div className="space-y-1">
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <strong>Name:</strong> {selectedProduct.owner?.name}
                    </p>
                    {selectedProduct.owner?.farmName && (
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <strong>Farm:</strong> {selectedProduct.owner.farmName}
                      </p>
                    )}
                    {selectedProduct.owner?.farmLocation && (
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <strong>Location:</strong> {selectedProduct.owner.farmLocation}
                      </p>
                    )}
                    {selectedProduct.owner?.email && (
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <strong>Email:</strong> {selectedProduct.owner.email}
                      </p>
                    )}
                    {selectedProduct.owner?.phone && (
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <strong>Phone:</strong> {selectedProduct.owner.phone}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <p className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Product Details:</p>
                  <div className="space-y-1">
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <strong>Available Stock:</strong> {selectedProduct.stock} {selectedProduct.unit}
                    </p>
                    {selectedProduct.category && (
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <strong>Category:</strong> {selectedProduct.category}
                      </p>
                    )}
                    {selectedProduct.description && (
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <strong>Description:</strong> {selectedProduct.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowContactModal(false)}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowContactModal(false);
                    handleOrderProduct(selectedProduct);
                  }}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${darkMode ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20' : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20'}`}
                >
                  Place Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Product Modal */}
      {showOrderModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Place Order</h2>
                <button 
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            
            <form onSubmit={submitOrder} className="p-6">
              <div className="text-center mb-4">
                {selectedProduct.imageUrl && (
                  <img 
                    src={selectedProduct.imageUrl} 
                    alt={selectedProduct.name} 
                    className="w-16 h-16 object-cover rounded-lg mx-auto mb-2"
                  />
                )}
                <h3 className="text-lg font-semibold text-gray-800">{selectedProduct.name}</h3>
                <p className="text-green-600 font-medium">₹{selectedProduct.price}/{selectedProduct.unit}</p>
                <p className="text-sm text-gray-500">Available: {selectedProduct.stock} {selectedProduct.unit}</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity ({selectedProduct.unit}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.1"
                    max={selectedProduct.stock}
                    required
                    value={orderForm.quantity}
                    onChange={(e) => setOrderForm({...orderForm, quantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder={`Enter quantity (max: ${selectedProduct.stock})`}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgency Level
                  </label>
                  <select
                    value={orderForm.urgency}
                    onChange={(e) => setOrderForm({...orderForm, urgency: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option value="low">Low - Flexible delivery</option>
                    <option value="medium">Medium - Standard delivery</option>
                    <option value="high">High - Urgent delivery</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    rows="3"
                    value={orderForm.notes}
                    onChange={(e) => setOrderForm({...orderForm, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="Any special requirements or notes..."
                  ></textarea>
                </div>
                
                {orderForm.quantity && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Total Cost:</strong> ₹{(parseFloat(orderForm.quantity || 0) * selectedProduct.price).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Place Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Track Orders Modal */}
      {showTrackOrdersModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className={`${
            darkMode 
              ? 'bg-gray-900/90 border-gray-700/50' 
              : 'bg-white/90 border-gray-200/50'
          } backdrop-blur-xl border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl transform transition-all duration-300 ease-out`}>
            <div className={`sticky top-0 ${
              darkMode 
                ? 'bg-gray-900/95 border-gray-700/50' 
                : 'bg-white/95 border-gray-200/50'
            } backdrop-blur-xl border-b p-6`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-xl ${
                    darkMode 
                      ? 'bg-blue-600/20 text-blue-400' 
                      : 'bg-blue-50 text-blue-600'
                  }`}>
                    <Package size={24} />
                  </div>
                  <h2 className={`text-2xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>Track Your Orders</h2>
                </div>
                <button 
                  onClick={() => setShowTrackOrdersModal(false)}
                  className={`p-2 rounded-xl ${
                    darkMode 
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700/50' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'
                  } transition-all duration-200`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className={`p-6 overflow-y-auto max-h-[70vh] ${
              darkMode ? 'bg-gray-900/50' : 'bg-gray-50/50'
            }`}>
              {loadingOrders ? (
                <div className="text-center py-12">
                  <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto ${
                    darkMode ? 'border-blue-400' : 'border-blue-600'
                  }`}></div>
                  <p className={`mt-4 text-lg ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16">
                  <div className={`p-4 rounded-full mx-auto mb-6 w-fit ${
                    darkMode ? 'bg-gray-700/50' : 'bg-gray-100'
                  }`}>
                    <ShoppingCart className={`w-16 h-16 mx-auto ${
                      darkMode ? 'text-gray-400' : 'text-gray-300'
                    }`} />
                  </div>
                  <p className={`text-xl font-semibold mb-2 ${
                    darkMode ? 'text-gray-200' : 'text-gray-600'
                  }`}>No orders found</p>
                  <p className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Start browsing products to place your first order!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order._id} className={`${
                      darkMode 
                        ? 'bg-gray-800/60 border-gray-700/50 hover:bg-gray-800/80' 
                        : 'bg-white/80 border-gray-200/50 hover:bg-white/90'
                    } backdrop-blur-sm border rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 group`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className={`p-2 rounded-lg ${
                              darkMode ? 'bg-green-600/20 text-green-400' : 'bg-green-50 text-green-600'
                            }`}>
                              <Package size={20} />
                            </div>
                            <h3 className={`font-bold text-lg ${
                              darkMode ? 'text-white' : 'text-gray-800'
                            }`}>
                              {order.product?.name || 'Product Name'}
                            </h3>
                          </div>
                          <div className="space-y-2">
                            <p className={`text-sm flex items-center space-x-2 ${
                              darkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              <User size={16} />
                              <span>Farmer: {order.product?.owner?.name || order.product?.owner?.farmName || 'Unknown'}</span>
                            </p>
                            <p className={`text-sm flex items-center space-x-2 ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              <Calendar size={16} />
                              <span>Order Date: {new Date(order.createdAt).toLocaleDateString()}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right ml-6">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            order.status === 'pending' 
                              ? darkMode 
                                ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30' 
                                : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                              : order.status === 'confirmed'
                              ? darkMode
                                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                              : order.status === 'shipped'
                              ? darkMode
                                ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                                : 'bg-purple-50 text-purple-700 border border-purple-200'
                              : order.status === 'delivered'
                              ? darkMode
                                ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                                : 'bg-green-50 text-green-700 border border-green-200'
                              : order.status === 'cancelled'
                              ? darkMode
                                ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                                : 'bg-red-50 text-red-700 border border-red-200'
                              : darkMode
                                ? 'bg-gray-600/20 text-gray-400 border border-gray-500/30'
                                : 'bg-gray-50 text-gray-700 border border-gray-200'
                          }`}>
                            {order.status || 'Pending'}
                          </div>
                        </div>
                      </div>
                      
                      <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 p-4 rounded-xl mt-4 ${
                        darkMode ? 'bg-gray-700/30' : 'bg-gray-50/50'
                      }`}>
                        <div className="text-center">
                          <p className={`text-sm font-medium mb-1 ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>Quantity</p>
                          <p className={`font-bold text-lg ${
                            darkMode ? 'text-white' : 'text-gray-800'
                          }`}>{order.quantity} {order.product?.unit || 'units'}</p>
                        </div>
                        <div className="text-center">
                          <p className={`text-sm font-medium mb-1 ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>Unit Price</p>
                          <p className={`font-bold text-lg ${
                            darkMode ? 'text-blue-400' : 'text-blue-600'
                          }`}>₹{order.product?.price || 0}</p>
                        </div>
                        <div className="text-center">
                          <p className={`text-sm font-medium mb-1 ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>Total Amount</p>
                          <p className={`font-bold text-lg ${
                            darkMode ? 'text-green-400' : 'text-green-600'
                          }`}>₹{order.totalAmount?.toFixed(2) || 0}</p>
                        </div>
                        <div className="text-center">
                          <p className={`text-sm font-medium mb-1 ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>Urgency</p>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            order.urgency === 'high' 
                              ? darkMode 
                                ? 'bg-red-600/20 text-red-400 border border-red-500/30' 
                                : 'bg-red-50 text-red-700 border border-red-200'
                              : order.urgency === 'medium' 
                              ? darkMode
                                ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30'
                                : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                              : darkMode
                                ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                                : 'bg-green-50 text-green-700 border border-green-200'
                          }`}>
                            {order.urgency || 'Medium'}
                          </span>
                        </div>
                      </div>
                      
                      {order.notes && (
                        <div className={`mt-4 p-4 rounded-xl ${
                          darkMode ? 'bg-gray-700/30 border border-gray-600/30' : 'bg-gray-50/70 border border-gray-200/50'
                        }`}>
                          <p className={`text-sm ${
                            darkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            <strong className={darkMode ? 'text-gray-200' : 'text-gray-700'}>Notes:</strong> {order.notes}
                          </p>
                        </div>
                      )}
                      
                      <div className="mt-6 flex gap-3">
                        <button 
                          onClick={() => handleContactFarmer(order.product)}
                          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                            darkMode 
                              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 hover:border-blue-400/50' 
                              : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 hover:border-blue-300'
                          }`}
                        >
                          <MessageCircle size={16} />
                          <span>Contact Farmer</span>
                        </button>
                        {order.status === 'pending' && (
                          <button className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                            darkMode 
                              ? 'bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30 hover:border-red-400/50' 
                              : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300'
                          }`}>
                            <X size={16} />
                            <span>Cancel Order</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Animated Messaging Modal */}
      {showMessagingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-6xl w-full h-[85vh] overflow-hidden flex shadow-2xl transform animate-scaleIn">
            
            {/* Farmers List - Enhanced Design */}
            <div className="w-1/3 border-r bg-gradient-to-b from-gray-50 to-gray-100">
              <div className="p-5 border-b bg-white shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">Farmers</h3>
                    <p className="text-sm text-gray-500">{products.length} available</p>
                  </div>
                  <button 
                    onClick={() => {
                      setShowMessagingModal(false);
                      setSelectedFarmer(null);
                      setMessages([]);
                    }}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-4 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-gray-300">
                {products.length === 0 ? (
                  <div className="text-center py-12 animate-fadeIn">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-10 h-10 text-blue-500" />
                    </div>
                    <h4 className="font-semibold text-gray-700 mb-2">No Farmers Available</h4>
                    <p className="text-gray-500 text-sm mb-4">Browse products to find farmers to chat with</p>
                    <button 
                      onClick={() => {
                        setShowMessagingModal(false);
                        setShowProductBrowser(true);
                        fetchProducts();
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Browse Products
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {products.map((product, index) => (
                      <div 
                        key={index}
                        onClick={() => selectFarmer({
                          ...product.owner,
                          productName: product.name,
                          productPrice: product.price,
                          productUnit: product.unit
                        })}
                        className={`p-4 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                          selectedFarmer && (
                            (selectedFarmer.name === product.owner?.name && selectedFarmer.productName === product.name) ||
                            (selectedFarmer.farmName === product.owner?.farmName && selectedFarmer.productName === product.name)
                          )
                            ? 'bg-blue-500 text-white shadow-lg scale-105' 
                            : 'bg-white hover:bg-blue-50 shadow-md hover:shadow-lg'
                        } border border-gray-100 hover:border-blue-200`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md ${
                            selectedFarmer && (
                              (selectedFarmer.name === product.owner?.name && selectedFarmer.productName === product.name) ||
                              (selectedFarmer.farmName === product.owner?.farmName && selectedFarmer.productName === product.name)
                            )
                              ? 'bg-white text-blue-500' 
                              : 'bg-gradient-to-br from-green-400 to-green-600'
                          }`}>
                            {(product.owner?.name || product.owner?.farmName || 'F')[0].toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className={`font-semibold text-sm ${
                              selectedFarmer && (
                                (selectedFarmer.name === product.owner?.name && selectedFarmer.productName === product.name) ||
                                (selectedFarmer.farmName === product.owner?.farmName && selectedFarmer.productName === product.name)
                              )
                                ? 'text-white' : 'text-gray-800'
                            }`}>
                              {product.owner?.farmName || product.owner?.name || 'Farmer'}
                            </p>
                            <p className={`text-xs ${
                              selectedFarmer && (
                                (selectedFarmer.name === product.owner?.name && selectedFarmer.productName === product.name) ||
                                (selectedFarmer.farmName === product.owner?.farmName && selectedFarmer.productName === product.name)
                              )
                                ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {product.name} • ₹{product.price}/{product.unit}
                            </p>
                            {product.owner?.farmLocation && (
                              <p className={`text-xs ${
                                selectedFarmer && (
                                  (selectedFarmer.name === product.owner?.name && selectedFarmer.productName === product.name) ||
                                  (selectedFarmer.farmName === product.owner?.farmName && selectedFarmer.productName === product.name)
                                )
                                  ? 'text-blue-100' : 'text-gray-400'
                              }`}>
                                📍 {product.owner.farmLocation}
                              </p>
                            )}
                          </div>
                          {selectedFarmer && (
                            (selectedFarmer.name === product.owner?.name && selectedFarmer.productName === product.name) ||
                            (selectedFarmer.farmName === product.owner?.farmName && selectedFarmer.productName === product.name)
                          ) && (
                            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Chat Area - Enhanced Design */}
            <div className="flex-1 flex flex-col bg-gray-50">
              {selectedFarmer ? (
                <>
                  {/* Chat Header - Enhanced */}
                  <div className="p-5 border-b bg-white shadow-sm">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {(selectedFarmer.name || selectedFarmer.farmName || 'F')[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-800 text-lg">
                          {selectedFarmer.farmName || selectedFarmer.name || 'Farmer'}
                        </p>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <p className="text-sm text-green-600 font-medium">Online</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-600">
                          {selectedFarmer.productName}
                        </p>
                        <p className="text-xs text-green-600 font-semibold">
                          ₹{selectedFarmer.productPrice}/{selectedFarmer.productUnit}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Messages - Enhanced with Animations */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-300">
                    {messages.map((msg, index) => (
                      <div 
                        key={msg.id}
                        className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'} animate-slideInUp`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className={`max-w-xs lg:max-w-md px-5 py-3 rounded-2xl shadow-md transition-all duration-300 hover:shadow-lg ${
                          msg.isOwn 
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
                            : 'bg-white text-gray-800 border border-gray-200'
                        }`}>
                          <p className="text-sm leading-relaxed">{msg.message}</p>
                          <p className={`text-xs mt-2 ${
                            msg.isOwn ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Message Input - Enhanced */}
                  <div className="p-5 border-t bg-white">
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 px-5 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-full hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center animate-fadeIn">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Mail className="w-12 h-12 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 mb-3">Select a Farmer to Chat</h3>
                    <p className="text-gray-500 text-sm max-w-sm">
                      Choose a farmer from the list to start discussing products, prices, and place orders
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes slideInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        
        .animate-slideInUp {
          animation: slideInUp 0.4s ease-out forwards;
          opacity: 0;
        }
        
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        
        .scrollbar-thumb-gray-300::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 3px;
        }
        
        .scrollbar-thumb-gray-300::-webkit-scrollbar-track {
          background: transparent;
        }
        
        /* Enhanced Modern Animations */
        @keyframes slideInDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
          40%, 43% { transform: translateY(-10px); }
          70% { transform: translateY(-5px); }
          90% { transform: translateY(-2px); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
        
        .animate-slideInDown {
          animation: slideInDown 0.5s ease-out;
        }
        
        .animate-pulse {
          animation: pulse 2s infinite;
        }
        
        .animate-bounce {
          animation: bounce 1s infinite;
        }
        
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          background-size: 200px 100%;
          animation: shimmer 1.5s infinite;
        }
        
        /* Glassmorphism Effect */
        .backdrop-blur-lg {
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
        
        /* Hover Effects */
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        /* Gradient Text */
        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        /* Card Hover Effects */
        .card-hover {
          transition: all 0.3s ease;
        }
        
        .card-hover:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        
        /* Button Ripple Effect */
        .btn-ripple {
          position: relative;
          overflow: hidden;
        }
        
        .btn-ripple::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }
        
        .btn-ripple:active::after {
          width: 300px;
          height: 300px;
        }
        
        /* Loading Skeleton */
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        
        /* Dark mode skeleton */
        .dark .skeleton {
          background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
          background-size: 200% 100%;
        }
      `}</style>
    </div>
  );
};

export default VendorDashboard;