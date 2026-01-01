import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuthStore } from '../store/authStore';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import { FaTrash, FaPlus, FaMinus, FaShoppingCart, FaTag } from 'react-icons/fa';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, loading, updateCartItem, removeCartItem, clearCart, applyLoyaltyDiscount, removeLoyaltyDiscount, userLoyalty } = useCart();
  const { isAuthenticated } = useAuthStore();
  const [loyaltyPointsToUse, setLoyaltyPointsToUse] = useState(0);
  const [showLoyaltyForm, setShowLoyaltyForm] = useState(false);

  // Calculate loyalty discount info
  const maxPointsToUse = Math.min(userLoyalty.points, cart.total * 100); // Can't use more points than cart total
  const discountAmount = loyaltyPointsToUse / 100; // 100 points = $1

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateCartItem(productId, newQuantity);
  };

  const handleRemoveItem = async (productId) => {
    if (window.confirm('Are you sure you want to remove this item?')) {
      await removeCartItem(productId);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear all items from cart?')) {
      await clearCart();
    }
  };

  const handleApplyLoyalty = async () => {
    if (loyaltyPointsToUse <= 0) {
      toast.error('Please enter valid points');
      return;
    }
    await applyLoyaltyDiscount(loyaltyPointsToUse);
    setShowLoyaltyForm(false);
    setLoyaltyPointsToUse(0);
  };

  const handleRemoveLoyalty = async () => {
    await removeLoyaltyDiscount();
    setShowLoyaltyForm(false);
    setLoyaltyPointsToUse(0);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to checkout');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (loading && cart.items.length === 0) {
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
        <h1 className="text-3xl font-bold mb-8 flex items-center">
          <FaShoppingCart className="mr-3" /> Shopping Cart
        </h1>

        {cart.items.length === 0 ? (
          <div className="text-center py-16">
            <FaShoppingCart className="text-6xl text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-400 mb-6">Your cart is empty</p>
            <Link 
              to="/products" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold inline-block"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Cart Items ({cart.items.length})</h2>
                  <button
                    onClick={handleClearCart}
                    className="text-red-400 hover:text-red-300 text-sm flex items-center"
                  >
                    <FaTrash className="mr-1" /> Clear Cart
                  </button>
                </div>

                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div key={item.product._id} className="flex items-center bg-gray-700 rounded-lg p-4">
                      {/* Product Image */}
                      <img
                        src={`http://127.0.0.1:5000${item.product.images[0]}`}
                        alt={item.product.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />

                      {/* Product Info */}
                      <div className="ml-4 flex-1">
                        <h3 className="font-semibold text-lg">{item.product.name}</h3>
                        <p className="text-gray-400 text-sm">{item.product.brand || 'No brand'}</p>
                        <p className="text-blue-400 font-semibold mt-1">
                          ${item.product.price.toFixed(2)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center mt-3">
                          <button
                            onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                            className="bg-gray-600 hover:bg-gray-500 p-2 rounded-l-lg"
                            disabled={item.quantity <= 1}
                          >
                            <FaMinus className="text-xs" />
                          </button>
                          <span className="bg-gray-600 px-4 py-2 text-center min-w-[60px]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                            className="bg-gray-600 hover:bg-gray-500 p-2 rounded-r-lg"
                            disabled={item.product.stock <= item.quantity}
                          >
                            <FaPlus className="text-xs" />
                          </button>
                        </div>
                      </div>

                      {/* Item Total & Remove */}
                      <div className="text-right ml-4">
                        <p className="text-xl font-semibold text-white">
                          ${item.subtotal.toFixed(2)}
                        </p>
                        <button
                          onClick={() => handleRemoveItem(item.product._id)}
                          className="text-red-400 hover:text-red-300 text-sm flex items-center justify-end mt-2"
                        >
                          <FaTrash className="mr-1" /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Loyalty Discount Section */}
              <div className="bg-gray-800 rounded-xl p-6 mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold flex items-center">
                    <FaTag className="mr-2" /> Loyalty Discount
                  </h2>
                  {cart.loyaltyPointsUsed > 0 && (
                    <button
                      onClick={handleRemoveLoyalty}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove Discount
                    </button>
                  )}
                </div>

                {cart.loyaltyPointsUsed > 0 ? (
                  <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4">
                    <p className="text-green-400">
                      <span className="font-semibold">{cart.loyaltyPointsUsed} points</span> applied for 
                      <span className="font-semibold"> ${cart.loyaltyDiscount.toFixed(2)}</span> discount
                    </p>
                  </div>
                ) : (
                  <div>
                    {showLoyaltyForm ? (
                      <div className="bg-gray-700 rounded-lg p-4">
                        <p className="text-sm text-gray-400 mb-3">
                          You have <span className="text-yellow-400 font-semibold">{userLoyalty.points} points</span> 
                          ({userLoyalty.tier} tier)
                        </p>
                        <div className="flex gap-3">
                          <input
                            type="number"
                            value={loyaltyPointsToUse}
                            onChange={(e) => setLoyaltyPointsToUse(Math.min(Number(e.target.value), maxPointsToUse))}
                            max={maxPointsToUse}
                            min={0}
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg flex-1"
                            placeholder="Enter points"
                          />
                          <button
                            onClick={handleApplyLoyalty}
                            disabled={loyaltyPointsToUse <= 0 || loyaltyPointsToUse > maxPointsToUse}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-semibold"
                          >
                            Apply
                          </button>
                          <button
                            onClick={() => setShowLoyaltyForm(false)}
                            className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                        {maxPointsToUse > 0 && (
                          <p className="text-xs text-gray-400 mt-2">
                            Max points you can use: {maxPointsToUse} (${(maxPointsToUse / 100).toFixed(2)} discount)
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <p className="text-gray-400">
                          You have <span className="text-yellow-400 font-semibold">{userLoyalty.points} points</span> available
                          ({userLoyalty.tier} tier)
                        </p>
                        <button
                          onClick={() => setShowLoyaltyForm(true)}
                          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold text-sm"
                        >
                          Apply Points
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Loyalty Tier Info */}
                <div className="mt-4 p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                  <p className="text-sm text-purple-300">
                    💡 Earn 1 point for every $1 spent! Current tier: <span className="font-semibold uppercase">{userLoyalty.tier}</span>
                  </p>
                  <div className="mt-2 text-xs text-gray-400">
                    <p>Bronze: $0+ | Silver: $1,000+ | Gold: $5,000+ | Platinum: $10,000+</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-xl p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal ({itemCount} items)</span>
                    <span>${cart.total.toFixed(2)}</span>
                  </div>
                  
                  {cart.loyaltyDiscount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Loyalty Discount</span>
                      <span>-${cart.loyaltyDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-gray-400">
                    <span>Estimated Tax</span>
                    <span>${(cart.total * 0.08).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-400">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-4 mb-6">
                  <div className="flex justify-between text-xl font-semibold">
                    <span>Total</span>
                    <span className={cart.loyaltyDiscount > 0 ? 'text-green-400' : 'text-white'}>
                      ${(cart.total - cart.loyaltyDiscount + cart.total * 0.08).toFixed(2)}
                    </span>
                  </div>
                  {cart.loyaltyDiscount > 0 && (
                    <p className="text-xs text-green-400 mt-1">
                      You saved ${cart.loyaltyDiscount.toFixed(2)} with loyalty points!
                    </p>
                  )}
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? 'Processing...' : 'Proceed to Checkout'}
                </button>

                <Link
                  to="/products"
                  className="block text-center text-gray-400 hover:text-white mt-4 text-sm"
                >
                  Continue Shopping
                </Link>
              </div>
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

export default Cart;
