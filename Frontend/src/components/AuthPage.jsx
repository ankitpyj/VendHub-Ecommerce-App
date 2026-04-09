import React, { useState } from 'react';
import {
  Users, Truck, Shield, User, Mail, Lock, Home, MapPin, Building, Globe,
  Phone, Image, CheckCircle, DollarSign, Star, Crop, Ruler, Clock, Calendar,
  Banknote, CreditCard, Key, Bell, Wifi, Smartphone, Monitor, Info, Percent,
  Briefcase, Utensils, Award, TrendingUp, Heart, Settings, MessageSquare,
  Clipboard, Zap, Package, Map, Hash, CalendarDays, Clock3, Clock9,
  ClipboardCheck, BadgeCheck, Scale, BarChart,
} from 'lucide-react';

const AuthPage = ({ setUser }) => {
  // State for basic user info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profileImage, setProfileImage] = useState(''); // Assuming URL for simplicity

  // State for farmer-specific fields
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [farmAddressStreet, setFarmAddressStreet] = useState('');
  const [farmAddressCity, setFarmAddressCity] = useState('');
  const [farmAddressState, setFarmAddressState] = useState('');
  const [farmAddressPincode, setFarmAddressPincode] = useState('');
  const [farmAddressLatitude, setFarmAddressLatitude] = useState('');
  const [farmAddressLongitude, setFarmAddressLongitude] = useState('');
  const [farmSize, setFarmSize] = useState('');
  const [cropsGrown, setCropsGrown] = useState(''); // Comma-separated string
  const [farmingType, setFarmingType] = useState('');

  // State for farmer bank details
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfscCode, setBankIfscCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountHolderName, setBankAccountHolderName] = useState('');

  // State for vendor-specific fields
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [businessAddressStreet, setBusinessAddressStreet] = useState('');
  const [businessAddressCity, setBusinessAddressCity] = useState('');
  const [businessAddressState, setBusinessAddressState] = useState('');
  const [businessAddressPincode, setBusinessAddressPincode] = useState('');
  const [businessAddressLatitude, setBusinessAddressLatitude] = useState('');
  const [businessAddressLongitude, setBusinessAddressLongitude] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [fssaiLicense, setFssaiLicense] = useState('');
  const [businessHoursOpening, setBusinessHoursOpening] = useState('');
  const [businessHoursClosing, setBusinessHoursClosing] = useState('');
  const [businessHoursDaysOpen, setBusinessHoursDaysOpen] = useState(''); // Comma-separated string

  // State for admin-specific fields
  const [adminLevel, setAdminLevel] = useState('');
  const [permissions, setPermissions] = useState(''); // Comma-separated string

  // Internal state for auth mode and selected role
  const [authMode, setAuthMode] = useState('login');
  const [selectedRole, setSelectedRole] = useState('');

  // State for messages and loading
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const backendUrl = 'http://localhost:5000'; // Your Node.js backend URL

  const clearFormStates = () => {
    setName(''); setEmail(''); setPassword(''); setPhoneNumber(''); setProfileImage('');
    setFarmName(''); setFarmLocation(''); setFarmAddressStreet(''); setFarmAddressCity('');
    setFarmAddressState(''); setFarmAddressPincode(''); setFarmAddressLatitude(''); setFarmAddressLongitude('');
    setFarmSize(''); setCropsGrown(''); setFarmingType('');
    setBankAccountNumber(''); setBankIfscCode(''); setBankName(''); setBankAccountHolderName('');
    setBusinessName(''); setBusinessType(''); setBusinessAddressStreet(''); setBusinessAddressCity('');
    setBusinessAddressState(''); setBusinessAddressPincode(''); setBusinessAddressLatitude(''); setBusinessAddressLongitude('');
    setGstNumber(''); setFssaiLicense(''); setBusinessHoursOpening(''); setBusinessHoursClosing(''); setBusinessHoursDaysOpen('');
    setAdminLevel(''); setPermissions('');
    setMessage({ text: '', type: '' });
  };

  const handleAuth = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      let response;
      let requestBody = { email, password };

      if (authMode === 'signup') {
        requestBody = {
          ...requestBody,
          name,
          role: selectedRole,
          phoneNumber,
          profileImage: profileImage || null, // Allow null if empty
        };

        // Add role-specific fields
        if (selectedRole === 'farmer') {
          requestBody = {
            ...requestBody,
            farmName,
            farmLocation,
            farmAddress: {
              street: farmAddressStreet,
              city: farmAddressCity,
              state: farmAddressState,
              pincode: farmAddressPincode,
              coordinates: {
                latitude: farmAddressLatitude ? parseFloat(farmAddressLatitude) : undefined,
                longitude: farmAddressLongitude ? parseFloat(farmAddressLongitude) : undefined,
              }
            },
            farmSize: farmSize ? parseFloat(farmSize) : undefined,
            cropsGrown: cropsGrown.split(',').map(crop => crop.trim()).filter(crop => crop),
            farmingType,
            bankDetails: {
              accountNumber: bankAccountNumber,
              ifscCode: bankIfscCode,
              bankName: bankName,
              accountHolderName: bankAccountHolderName,
            }
          };
        } else if (selectedRole === 'vendor') {
          requestBody = {
            ...requestBody,
            companyName: businessName, // <--- Change: Map frontend 'businessName' state to backend 'companyName' key
            businessType, // Keep as is, assuming backend expects 'businessType'
            address: { // <--- Change: Map frontend 'businessAddress' object to backend 'address' key
              street: businessAddressStreet,
              city: businessAddressCity,
              state: businessAddressState,
              pincode: businessAddressPincode,
              coordinates: {
                latitude: businessAddressLatitude ? parseFloat(businessAddressLatitude) : undefined,
                longitude: businessAddressLongitude ? parseFloat(businessAddressLongitude) : undefined,
              }
            },
            gstNumber,
            fssaiLicense,
            businessHours: {
              opening: businessHoursOpening,
              closing: businessHoursClosing,
              daysOpen: businessHoursDaysOpen.split(',').map(day => day.trim()).filter(day => day),
            }
          };
  
        } else if (selectedRole === 'admin') {
          requestBody = {
            ...requestBody,
            adminLevel,
            permissions: permissions.split(',').map(p => p.trim()).filter(p => p),
          };
        }

        response = await fetch(`${backendUrl}/api/auth/register`, { // Adjusted endpoint
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });
      } else { // authMode === 'login'
        response = await fetch(`${backendUrl}/api/auth/login`, { // Adjusted endpoint
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });
      }

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: data.msg || (authMode === 'signup' ? 'Registration successful!' : 'Login successful!'), type: 'success' });
        localStorage.setItem('jwtToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (setUser) {
          setUser(data.user);
        }
        clearFormStates(); // Clear form fields on success
      } else {
        setMessage({ text: data.msg || 'An error occurred.', type: 'error' });
      }
    } catch (error) {
      console.error('Auth error:', error);
      setMessage({ text: 'Network error. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 font-inter">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">VendHub</h2>
            <p className="text-gray-600 mt-2">Choose your access type</p>
          </div>

          {!selectedRole ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center mb-6">Select Your Role</h3>

              <button
                onClick={() => setSelectedRole('farmer')}
                className="w-full p-4 border-2 border-green-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all duration-200 flex items-center space-x-4"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-800">Farmer</h4>
                  <p className="text-sm text-gray-600">Supply raw materials to vendors</p>
                </div>
              </button>

              <button
                onClick={() => setSelectedRole('vendor')}
                className="w-full p-4 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 flex items-center space-x-4"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Truck className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-800">Vendor</h4>
                  <p className="text-sm text-gray-600">Find and order raw materials</p>
                </div>
              </button>

              <button
                onClick={() => setSelectedRole('admin')}
                className="w-full p-4 border-2 border-purple-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 flex items-center space-x-4"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-800">Admin</h4>
                  <p className="text-sm text-gray-600">Manage platform operations</p>
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold capitalize">
                  {selectedRole} {authMode === 'login' ? 'Login' : 'Sign Up'}
                </h3>
                <button
                  onClick={() => {
                    setSelectedRole('');
                    clearFormStates();
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Change Role
                </button>
              </div>

              <div className="space-y-4">
                {authMode === 'signup' && (
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Common fields for signup (excluding admin) */}
                {authMode === 'signup' && selectedRole !== 'admin' && (
                  <>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Phone Number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div className="relative">
                      <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Profile Image URL (Optional)"
                        value={profileImage}
                        onChange={(e) => setProfileImage(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </>
                )}

                {/* Conditional fields for Farmer */}
                {authMode === 'signup' && selectedRole === 'farmer' && (
                  <>
                    <hr className="my-4 border-gray-200" />
                    <h4 className="font-semibold text-gray-700">Farmer Details</h4>
                    <div className="relative">
                      <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Farm Name"
                        value={farmName}
                        onChange={(e) => setFarmName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Farm Location (e.g., Village, District)"
                        value={farmLocation}
                        onChange={(e) => setFarmLocation(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <Map className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input type="text" placeholder="Street" value={farmAddressStreet} onChange={(e) => setFarmAddressStreet(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
                      </div>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input type="text" placeholder="City" value={farmAddressCity} onChange={(e) => setFarmAddressCity(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
                      </div>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input type="text" placeholder="State" value={farmAddressState} onChange={(e) => setFarmAddressState(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
                      </div>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input type="text" placeholder="Pincode" value={farmAddressPincode} onChange={(e) => setFarmAddressPincode(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
                      </div>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input type="number" step="any" placeholder="Latitude (Optional)" value={farmAddressLatitude} onChange={(e) => setFarmAddressLatitude(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
                      </div>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input type="number" step="any" placeholder="Longitude (Optional)" value={farmAddressLongitude} onChange={(e) => setFarmAddressLongitude(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
                      </div>
                    </div>
                    <div className="relative">
                      <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        step="any"
                        placeholder="Farm Size (in acres)"
                        value={farmSize}
                        onChange={(e) => setFarmSize(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div className="relative">
                      <Crop className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Crops Grown (comma-separated)"
                        value={cropsGrown}
                        onChange={(e) => setCropsGrown(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div className="relative">
                      <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        value={farmingType}
                        onChange={(e) => setFarmingType(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      >
                        <option value="">Select Farming Type</option>
                        <option value="organic">Organic</option>
                        <option value="conventional">Conventional</option>
                        <option value="mixed">Mixed</option>
                      </select>
                    </div>

                    <hr className="my-4 border-gray-200" />
                    <h4 className="font-semibold text-gray-700">Bank Details (Farmer)</h4>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input type="text" placeholder="Account Number" value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
                    </div>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input type="text" placeholder="IFSC Code" value={bankIfscCode} onChange={(e) => setBankIfscCode(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
                    </div>
                    <div className="relative">
                      <Banknote className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input type="text" placeholder="Bank Name" value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
                    </div>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input type="text" placeholder="Account Holder Name" value={bankAccountHolderName} onChange={(e) => setBankAccountHolderName(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
                    </div>
                  </>
                )}

                {/* Conditional fields for Vendor */}
                {authMode === 'signup' && selectedRole === 'vendor' && (
                  <>
                    <hr className="my-4 border-gray-200" />
                    <h4 className="font-semibold text-gray-700">Vendor Details</h4>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Business Name"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      >
                        <option value="">Select Business Type</option>
                        <option value="street_food">Street Food</option>
                        <option value="restaurant">Restaurant</option>
                        <option value="cafe">Cafe</option>
                        <option value="catering">Catering</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <Map className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input type="text" placeholder="Street" value={businessAddressStreet} onChange={(e) => setBusinessAddressStreet(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
                      </div>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input type="text" placeholder="City" value={businessAddressCity} onChange={(e) => setBusinessAddressCity(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
                      </div>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input type="text" placeholder="State" value={businessAddressState} onChange={(e) => setBusinessAddressState(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
                      </div>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input type="text" placeholder="Pincode" value={businessAddressPincode} onChange={(e) => setBusinessAddressPincode(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
                      </div>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input type="number" step="any" placeholder="Latitude (Optional)" value={businessAddressLatitude} onChange={(e) => setBusinessAddressLatitude(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
                      </div>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input type="number" step="any" placeholder="Longitude (Optional)" value={businessAddressLongitude} onChange={(e) => setBusinessAddressLongitude(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
                      </div>
                    </div>
                    <div className="relative">
                      <ClipboardCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input type="text" placeholder="GST Number (Optional)" value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
                    </div>
                    <div className="relative">
                      <BadgeCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input type="text" placeholder="FSSAI License (Optional)" value={fssaiLicense} onChange={(e) => setFssaiLicense(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
                    </div>

                    <hr className="my-4 border-gray-200" />
                    <h4 className="font-semibold text-gray-700">Business Hours</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <Clock3 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input type="time" placeholder="Opening Time" value={businessHoursOpening} onChange={(e) => setBusinessHoursOpening(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
                      </div>
                      <div className="relative">
                        <Clock9 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input type="time" placeholder="Closing Time" value={businessHoursClosing} onChange={(e) => setBusinessHoursClosing(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
                      </div>
                    </div>
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input type="text" placeholder="Days Open (comma-separated, e.g., monday,tuesday)" value={businessHoursDaysOpen} onChange={(e) => setBusinessHoursDaysOpen(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none" />
                    </div>
                  </>
                )}

                {/* Conditional fields for Admin */}
                {authMode === 'signup' && selectedRole === 'admin' && (
                  <>
                    <hr className="my-4 border-gray-200" />
                    <h4 className="font-semibold text-gray-700">Admin Details</h4>
                    <div className="relative">
                      <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        value={adminLevel}
                        onChange={(e) => setAdminLevel(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      >
                        <option value="">Select Admin Level</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderator</option>
                      </select>
                    </div>
                    <div className="relative">
                      <Settings className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Permissions (comma-separated, e.g., user_management,analytics_access)"
                        value={permissions}
                        onChange={(e) => setPermissions(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </>
                )}

                <button
                  onClick={handleAuth}
                  disabled={loading}
                  className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (authMode === 'login' ? 'Logging in...' : 'Registering...') : (authMode === 'login' ? 'Login' : 'Create Account')}
                </button>

                <div className="text-center">
                  <button
                    onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                    className="text-orange-600 hover:text-orange-700 text-sm"
                  >
                    {authMode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Login"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Message Display */}
          {message.text && (
            <div className={`mt-6 p-3 rounded-lg text-center ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
