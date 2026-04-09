import React from 'react';
import { Users, Truck, Shield, ArrowRight } from 'lucide-react';

const WelcomePage = ({ setCurrentPage }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 flex items-center justify-center">
      <div className="text-center text-white space-y-8 px-6">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold tracking-tight">VendHub</h1>
          <p className="text-xl opacity-90 max-w-md mx-auto">
            Connecting Street Food Vendors with Trusted Raw Material Suppliers
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="flex justify-center space-x-8 text-sm">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Farmers</span>
            </div>
            <div className="flex items-center space-x-2">
              <Truck className="w-5 h-5" />
              <span>Vendors</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Trusted Platform</span>
            </div>
          </div>
          
          <button
            onClick={() => setCurrentPage('auth')}
            className="bg-white text-orange-600 px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg transition-all duration-300 flex items-center space-x-2 mx-auto"
            style={{ 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <span>Continue to Platform</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;