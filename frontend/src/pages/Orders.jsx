import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import { FaBox, FaClock, FaCheckCircle, FaShippingFast, FaEye } from 'react-icons/fa';
import { format } from 'date-fns';

const Orders = () => {
  const navigate = useNavigate();
  const { getOrders } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const result = await getOrders();
    if (result.success) {
      setOrders(result.orders);
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaClock className="text-yellow-400" />;
      case 'processing':
        return <FaBox className="text-blue-400" />;
      case 'shipped':
        return <FaShippingFast className="text-purple-400" />;
      case 'delivered':
        return <FaCheckCircle className="text-green-400" />;
      case 'cancelled':
        return <FaBox className="text-red-400" />;
      default:
        return <FaBox className="text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-900/50 text-yellow-300 border-yellow-500/50';
      case 'processing':
        return 'bg-blue-900/50 text-blue-300 border-blue-500/50';
      case 'shipped':
        return 'bg-purple-900/50 text-purple-300 border-purple-500/50';
      case 'delivered':
        return 'bg-green-900/50 text-green-300 border-green-500/50';
      case 'cancelled':
        return 'bg-red-900/50 text-red-300 border-red-500/50';
      default:
        return 'bg-gray-900/50 text-gray-300 border-gray-500/50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <FaBox className="text-6xl text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-400 mb-6">You haven't placed any orders yet</p>
            <Link 
              to="/products" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold inline-block"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Orders List */}
            <div className="lg:col-span-2 space-y-4">
              {orders.map((order) => (
                <div 
                  key={order._id} 
                  className={`bg-gray-800 rounded-xl p-6 cursor-pointer transition-all hover:ring-2 hover:ring-blue-500/50 ${
                    selectedOrder?._id === order._id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-400">Order #{order._id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(order.orderStatus)}
                      <span className="font-semibold">${order.finalTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <span className="mr-2">{order.items.length} items</span>
                      <FaEye />
                    </div>
                  </div>
                  
                  {order.trackingNumber && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <p className="text-xs text-gray-400">
                        Tracking: <span className="text-blue-400">{order.trackingNumber}</span>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Order Details */}
            <div className="lg:col-span-1">
              {selectedOrder ? (
                <div className="bg-gray-800 rounded-xl p-6 sticky top-24">
                  <h2 className="text-xl font-semibold mb-6">Order Details</h2>
                  
                  {/* Order Info */}
                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Order ID:</span>
                      <span>{selectedOrder._id.slice(-8).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Date:</span>
                      <span>{format(new Date(selectedOrder.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Status:</span>
                      <span className={`capitalize ${selectedOrder.orderStatus === 'delivered' ? 'text-green-400' : 'text-blue-400'}`}>
                        {selectedOrder.orderStatus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Payment:</span>
                      <span className={`capitalize ${selectedOrder.paymentStatus === 'completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">Items</h3>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex items-center bg-gray-700 rounded-lg p-2">
                          <img
                            src={`http://127.0.0.1:5000${item.product?.images?.[0] || ''}`}
                            alt={item.product?.name || 'Product'}
                            className="w-12 h-12 object-cover rounded-lg mr-3"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm truncate">{item.product?.name || 'Product'}</p>
                            <p className="text-xs text-gray-400">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                          </div>
                          <span className="font-semibold">${item.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="border-t border-gray-700 pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Subtotal</span>
                      <span>${selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    {selectedOrder.loyaltyDiscount > 0 && (
                      <div className="flex justify-between text-green-400">
                        <span>Loyalty Discount</span>
                        <span>-${selectedOrder.loyaltyDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-semibold pt-2 border-t border-gray-700">
                      <span>Total</span>
                      <span className="text-green-400">${selectedOrder.finalTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Loyalty Points Earned */}
                  {selectedOrder.loyaltyPointsEarned > 0 && (
                    <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                      <p className="text-yellow-400 text-sm">
                        💰 You earned <span className="font-semibold">{selectedOrder.loyaltyPointsEarned} points</span> with this order!
                      </p>
                    </div>
                  )}

                  {/* Shipping Address */}
                  {selectedOrder.shippingAddress && (
                    <div className="mt-4 p-3 bg-gray-700 rounded-lg">
                      <h4 className="font-semibold mb-2 text-sm">Shipping Address</h4>
                      <p className="text-gray-400 text-sm">
                        {selectedOrder.shippingAddress.street}<br />
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}<br />
                        {selectedOrder.shippingAddress.country}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-800 rounded-xl p-6 sticky top-24 text-center">
                  <p className="text-gray-400">Select an order to view details</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="bg-black/50 text-center p-4 mt-12">
          <p>© 2025 Resonance. All Rights Reserved</p>
        </footer>
      </div>
    </div>
  );
};

export default Orders;
