import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuthStore } from '../store/authStore';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import { FaCreditCard, FaLock, FaCheckCircle, FaShoppingBag } from 'react-icons/fa';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, checkout, getOrders, userLoyalty, fetchLoyaltyPoints } = useCart();
  const { isAuthenticated, user } = useAuthStore();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(null);
  
  // Form states
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: ''
  });

  // Redirect if not authenticated or cart is empty
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (cart.items.length === 0 && !orderComplete) {
      navigate('/cart');
    }
  }, [isAuthenticated, cart.items.length, navigate, orderComplete]);

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.zipCode) {
      toast.error('Please fill in all required fields');
      return;
    }
    setStep(2);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (paymentMethod === 'credit_card') {
      if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv) {
        toast.error('Please fill in all card details');
        return;
      }
    }
    setStep(3);
  };

  const handleFinalCheckout = async () => {
    setLoading(true);
    const result = await checkout(shippingAddress, paymentMethod);
    
    if (result.success) {
      setOrderComplete(result.order);
      setStep(4);
      await fetchLoyaltyPoints();
    }
    setLoading(false);
  };

  // Calculate totals
  const subtotal = cart.total;
  const loyaltyDiscount = cart.loyaltyDiscount || 0;
  const tax = (subtotal - loyaltyDiscount) * 0.08;
  const finalTotal = subtotal - loyaltyDiscount + tax;

  // Render step indicator
  const renderStepIndicator = () => (
    <div className="flex justify-center mb-8">
      <div className="flex items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
          step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
        }`}>
          1
        </div>
        <div className={`w-20 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-700'}`} />
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
          step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
        }`}>
          2
        </div>
        <div className={`w-20 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-700'}`} />
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
          step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
        }`}>
          3
        </div>
      </div>
    </div>
  );

  // Render order complete
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-green-900/30 border border-green-500/50 rounded-2xl p-8">
              <FaCheckCircle className="text-6xl text-green-400 mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
              <p className="text-gray-400 mb-6">
                Thank you for your purchase. Your order #{orderComplete._id.slice(-8).toUpperCase()} has been placed successfully.
              </p>
              
              <div className="bg-gray-800 rounded-lg p-6 text-left mb-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <FaShoppingBag className="mr-2" /> Order Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Order ID:</span>
                    <span>{orderComplete._id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Paid:</span>
                    <span className="text-green-400 font-semibold">${orderComplete.finalTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Points Earned:</span>
                    <span className="text-yellow-400">{orderComplete.loyaltyPointsEarned} points</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payment Status:</span>
                    <span className="text-green-400 capitalize">{orderComplete.paymentStatus}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-400 mb-6">
                A confirmation email has been sent to {user?.email}
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate('/products')}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => navigate('/orders')}
                  className="bg-gray-600 hover:bg-gray-500 px-6 py-3 rounded-lg font-semibold"
                >
                  View Orders
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>
        
        {renderStepIndicator()}

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form Area */}
            <div className="lg:col-span-2">
              
              {/* Step 1: Shipping Address */}
              {step === 1 && (
                <div className="bg-gray-800 rounded-xl p-6">
                  <h2 className="text-xl font-semibold mb-6 flex items-center">
                    <span className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">1</span>
                    Shipping Address
                  </h2>
                  
                  <form onSubmit={handleAddressSubmit}>
                    <div className="mb-4">
                      <label className="block text-gray-400 mb-2">Street Address *</label>
                      <input
                        type="text"
                        value={shippingAddress.street}
                        onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="123 Main Street"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-gray-400 mb-2">City *</label>
                        <input
                          type="text"
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="New York"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-2">State</label>
                        <input
                          type="text"
                          value={shippingAddress.state}
                          onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="NY"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-gray-400 mb-2">ZIP Code *</label>
                        <input
                          type="text"
                          value={shippingAddress.zipCode}
                          onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="10001"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-2">Country</label>
                        <input
                          type="text"
                          value={shippingAddress.country}
                          onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="USA"
                        />
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold text-lg transition-all"
                    >
                      Continue to Payment
                    </button>
                  </form>
                </div>
              )}

              {/* Step 2: Payment Method */}
              {step === 2 && (
                <div className="bg-gray-800 rounded-xl p-6">
                  <h2 className="text-xl font-semibold mb-6 flex items-center">
                    <span className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">2</span>
                    Payment Method
                  </h2>
                  
                  <form onSubmit={handlePaymentSubmit}>
                    {/* Payment Method Selection */}
                    <div className="mb-6">
                      <label className="block text-gray-400 mb-3">Select Payment Method</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('credit_card')}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            paymentMethod === 'credit_card' 
                              ? 'border-blue-500 bg-blue-900/30' 
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          <FaCreditCard className="text-2xl mb-2 mx-auto" />
                          <p className="font-semibold">Credit Card</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('paypal')}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            paymentMethod === 'paypal' 
                              ? 'border-blue-500 bg-blue-900/30' 
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          <span className="text-2xl font-bold text-blue-600 mb-2 block">Pay</span>
                          <p className="font-semibold">PayPal</p>
                        </button>
                      </div>
                    </div>

                    {/* Credit Card Form */}
                    {paymentMethod === 'credit_card' && (
                      <div className="bg-gray-700 rounded-lg p-4 mb-6">
                        <div className="mb-4">
                          <label className="block text-gray-400 mb-2">Card Number</label>
                          <input
                            type="text"
                            value={cardDetails.cardNumber}
                            onChange={(e) => setCardDetails({...cardDetails, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16)})}
                            className="w-full bg-gray-600 border border-gray-500 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="1234 5678 9012 3456"
                            maxLength={16}
                          />
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-gray-400 mb-2">Card Holder Name</label>
                          <input
                            type="text"
                            value={cardDetails.cardHolder}
                            onChange={(e) => setCardDetails({...cardDetails, cardHolder: e.target.value})}
                            className="w-full bg-gray-600 border border-gray-500 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="John Doe"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-400 mb-2">Expiry Date</label>
                            <input
                              type="text"
                              value={cardDetails.expiryDate}
                              onChange={(e) => setCardDetails({...cardDetails, expiryDate: e.target.value})}
                              className="w-full bg-gray-600 border border-gray-500 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="MM/YY"
                              maxLength={5}
                            />
                          </div>
                          <div>
                            <label className="block text-gray-400 mb-2">CVV</label>
                            <input
                              type="text"
                              value={cardDetails.cvv}
                              onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value.replace(/\D/g, '').slice(0, 3)})}
                              className="w-full bg-gray-600 border border-gray-500 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="123"
                              maxLength={3}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-4 rounded-xl font-semibold text-lg transition-all"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold text-lg transition-all"
                      >
                        Review Order
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Step 3: Order Review */}
              {step === 3 && (
                <div className="bg-gray-800 rounded-xl p-6">
                  <h2 className="text-xl font-semibold mb-6 flex items-center">
                    <span className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">3</span>
                    Review Your Order
                  </h2>
                  
                  {/* Shipping Address Summary */}
                  <div className="bg-gray-700 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold mb-2">Shipping Address</h3>
                    <p className="text-gray-400 text-sm">
                      {shippingAddress.street}<br />
                      {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}<br />
                      {shippingAddress.country}
                    </p>
                  </div>
                  
                  {/* Payment Method Summary */}
                  <div className="bg-gray-700 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold mb-2">Payment Method</h3>
                    <p className="text-gray-400 text-sm capitalize">
                      {paymentMethod.replace('_', ' ')}
                    </p>
                  </div>
                  
                  {/* Order Items */}
                  <div className="bg-gray-700 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold mb-4">Order Items</h3>
                    <div className="space-y-3">
                      {cart.items.map((item) => (
                        <div key={item.product._id} className="flex justify-between items-center">
                          <div className="flex items-center">
                            <img
                              src={`http://127.0.0.1:5000${item.product.images[0]}`}
                              alt={item.product.name}
                              className="w-12 h-12 object-cover rounded-lg mr-3"
                            />
                            <div>
                              <p className="font-medium">{item.product.name}</p>
                              <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="font-semibold">${item.subtotal.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-4 rounded-xl font-semibold text-lg transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleFinalCheckout}
                      disabled={loading}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <FaLock className="mr-2" />
                          Place Order - ${finalTotal.toFixed(2)}
                        </>
                      )}
                    </button>
                  </div>
                  
                  <p className="text-center text-gray-400 text-sm mt-4">
                    <FaLock className="inline mr-1" />
                    Your payment information is secure and encrypted
                  </p>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-xl p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
                
                {/* Items List */}
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item.product._id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center">
                        <span className="bg-gray-600 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">
                          {item.quantity}
                        </span>
                        <span className="truncate max-w-[150px]">{item.product.name}</span>
                      </div>
                      <span className="font-semibold">${item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-700 pt-4 space-y-3">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  {loyaltyDiscount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Loyalty Discount</span>
                      <span>-${loyaltyDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-gray-400">
                    <span>Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-400">
                    <span>Shipping</span>
                    <span className="text-green-400">Free</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <div className="flex justify-between text-xl font-semibold">
                    <span>Total</span>
                    <span className={loyaltyDiscount > 0 ? 'text-green-400' : 'text-white'}>
                      ${finalTotal.toFixed(2)}
                    </span>
                  </div>
                  
                  {cart.loyaltyPointsUsed > 0 && (
                    <p className="text-xs text-green-400 mt-1">
                      You saved ${loyaltyDiscount.toFixed(2)} with loyalty points!
                    </p>
                  )}
                  
                  <p className="text-xs text-yellow-400 mt-2">
                    You'll earn {Math.floor(finalTotal)} points with this order
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-black/50 text-center p-4 mt-12">
          <p>© 2025 Resonance. All Rights Reserved</p>
        </footer>
      </div>
    </div>
  );
};

export default Checkout;
