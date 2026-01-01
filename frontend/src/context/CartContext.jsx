import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({
    items: [],
    total: 0,
    loyaltyDiscount: 0,
    loyaltyPointsUsed: 0,
    finalTotal: 0
  });
  const [loading, setLoading] = useState(false);
  const [userLoyalty, setUserLoyalty] = useState({
    points: 0,
    tier: 'bronze',
    totalSpent: 0
  });

  // Calculate item count
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
    fetchLoyaltyPoints();
  }, []);

  // Fetch cart from server
  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cart');
      setCart(response.data.cart || {
        items: [],
        total: 0,
        loyaltyDiscount: 0,
        loyaltyPointsUsed: 0,
        finalTotal: 0
      });
    } catch (error) {
      console.error('Error fetching cart:', error);
      // Set empty cart if user is not authenticated
      if (error.response?.status === 401) {
        setCart({
          items: [],
          total: 0,
          loyaltyDiscount: 0,
          loyaltyPointsUsed: 0,
          finalTotal: 0
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's loyalty points
  const fetchLoyaltyPoints = async () => {
    try {
      const response = await api.get('/loyalty/points');
      setUserLoyalty(response.data);
    } catch (error) {
      console.error('Error fetching loyalty points:', error);
    }
  };

  // Add item to cart
  const addToCart = useCallback(async (productId, quantity = 1) => {
    try {
      setLoading(true);
      const response = await api.post('/cart/add', { productId, quantity });
      setCart(response.data.cart);
      toast.success('Product added to cart successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add to cart';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update item quantity
  const updateCartItem = useCallback(async (productId, quantity) => {
    try {
      setLoading(true);
      const response = await api.put('/cart/update', { productId, quantity });
      setCart(response.data.cart);
      toast.success('Cart updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update cart';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove item from cart
  const removeCartItem = useCallback(async (productId) => {
    try {
      setLoading(true);
      const response = await api.delete(`/cart/remove/${productId}`);
      setCart(response.data.cart);
      toast.success('Item removed from cart');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove item';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear cart
  const clearCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.delete('/cart/clear');
      setCart(response.data.cart);
      toast.success('Cart cleared');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clear cart';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply loyalty discount
  const applyLoyaltyDiscount = useCallback(async (pointsToUse) => {
    try {
      setLoading(true);
      const response = await api.post('/cart/apply-loyalty', { pointsToUse });
      setCart(response.data.cart);
      setUserLoyalty(prev => ({
        ...prev,
        points: response.data.userPointsRemaining
      }));
      toast.success('Loyalty discount applied successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to apply discount';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove loyalty discount
  const removeLoyaltyDiscount = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.post('/cart/apply-loyalty', { pointsToUse: 0 });
      setCart(response.data.cart);
      // Restore points
      const previousPointsUsed = cart.loyaltyPointsUsed || 0;
      setUserLoyalty(prev => ({
        ...prev,
        points: prev.points + previousPointsUsed
      }));
      toast.success('Loyalty discount removed');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove discount';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [cart.loyaltyPointsUsed]);

  // Checkout
  const checkout = useCallback(async (shippingAddress, paymentMethod) => {
    try {
      setLoading(true);
      const response = await api.post('/checkout', { 
        shippingAddress, 
        paymentMethod 
      });
      
      // Clear cart after successful checkout
      setCart({
        items: [],
        total: 0,
        loyaltyDiscount: 0,
        loyaltyPointsUsed: 0,
        finalTotal: 0
      });
      
      // Refresh loyalty points
      await fetchLoyaltyPoints();
      
      toast.success('Order placed successfully!');
      return { success: true, order: response.data.order };
    } catch (error) {
      const message = error.response?.data?.message || 'Checkout failed';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get orders
  const getOrders = useCallback(async () => {
    try {
      const response = await api.get('/orders');
      return { success: true, orders: response.data.orders };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch orders';
      return { success: false, message };
    }
  }, []);

  // Get order by ID
  const getOrderById = useCallback(async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return { success: true, order: response.data.order };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch order';
      return { success: false, message };
    }
  }, []);

  const value = {
    cart,
    loading,
    itemCount,
    userLoyalty,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    applyLoyaltyDiscount,
    removeLoyaltyDiscount,
    checkout,
    getOrders,
    getOrderById,
    fetchCart,
    fetchLoyaltyPoints
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
