import React from 'react';
import { Users, Truck, BarChart3, Bell } from 'lucide-react';

const AdminDashboard = ({ user, setUser }) => {
  const transactions = [
    { id: '#T001', vendor: 'Rajesh Chat Corner', farmer: 'Ramesh Farm Fresh', amount: '₹320', status: 'Completed' },
    { id: '#T002', vendor: 'Sunita Dosa Stall', farmer: 'Krishnan Organics', amount: '₹200', status: 'Processing' },
    { id: '#T003', vendor: 'Kumar Vada Pav', farmer: 'Suresh Agro', amount: '₹280', status: 'Completed' }
  ];

  const getStatusColor = (status) => {
    return status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-800">VendHub Admin</h1>
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
              Welcome, {user.name}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Bell className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700" />
            <button
              onClick={() => setUser(null)}
              className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-800">1,247</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Farmers</p>
                <p className="text-2xl font-bold text-gray-800">89</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Vendors</p>
                <p className="text-2xl font-bold text-gray-800">312</p>
              </div>
              <Truck className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-800">₹2.4L</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Recent Transactions</h3>
              <button className="text-sm bg-purple-600 text-white px-3 py-1 rounded-full hover:bg-purple-700">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {transactions.map((transaction, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{transaction.id}</p>
                      <p className="text-sm text-gray-600">{transaction.vendor} → {transaction.farmer}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{transaction.amount}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Analytics */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Platform Analytics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Daily Active Users</span>
                <span className="font-semibold">423</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Orders Today</span>
                <span className="font-semibold">56</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Success Rate</span>
                <span className="font-semibold text-green-600">94.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Platform Commission</span>
                <span className="font-semibold">₹12,400</span>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">New Registrations (Week)</span>
                  <span className="font-semibold text-blue-600">+28</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Management */}
        <div className="mt-6 bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">User Management</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Role</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Joined</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Ramesh Kumar</td>
                  <td className="py-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Farmer</span>
                  </td>
                  <td className="py-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Active</span>
                  </td>
                  <td className="py-2">Jan 15, 2025</td>
                  <td className="py-2">
                    <button className="text-blue-600 hover:text-blue-700 text-sm">View</button>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Rajesh Singh</td>
                  <td className="py-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Vendor</span>
                  </td>
                  <td className="py-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Active</span>
                  </td>
                  <td className="py-2">Jan 12, 2025</td>
                  <td className="py-2">
                    <button className="text-blue-600 hover:text-blue-700 text-sm">View</button>
                  </td>
                </tr>
                <tr>
                  <td className="py-2">Sunita Devi</td>
                  <td className="py-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Vendor</span>
                  </td>
                  <td className="py-2">
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Pending</span>
                  </td>
                  <td className="py-2">Jan 10, 2025</td>
                  <td className="py-2">
                    <button className="text-blue-600 hover:text-blue-700 text-sm">Approve</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Admin Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
              Generate Reports
            </button>
            <button className="p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
              Manage Users
            </button>
            <button className="p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
              Platform Settings
            </button>
            <button className="p-4 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors">
              Support Tickets
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;