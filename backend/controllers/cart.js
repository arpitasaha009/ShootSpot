import Cart from '../models/cart.js';
import Product from '../models/Product.js';
import User from '../models/user.js';
import Order from '../models/Order.js';

// Get user's cart
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.userId })
      .populate('items.product', 'name price images stock');

    if (!cart) {
      // Create new cart if doesn't exist
      cart = new Cart({ user: req.user.userId, items: [], total: 0 });
      await cart.save();
    }

    res.status(200).json({ cart });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server error fetching cart' });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check stock availability
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      cart = new Cart({ user: req.user.userId, items: [], total: 0 });
    }

    // Check if item already in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity if already exists
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (product.stock < newQuantity) {
        return res.status(400).json({ 
          message: `Only ${product.stock} items available in stock` 
        });
      }
      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].subtotal = newQuantity * product.price;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        subtotal: quantity * product.price
      });
    }

    // Recalculate total
    cart.total = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
    cart.updatedAt = Date.now();

    await cart.save();

    // Populate product details for response
    await cart.populate('items.product', 'name price images stock');

    res.status(200).json({ 
      message: 'Item added to cart successfully',
      cart 
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Server error adding to cart' });
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    // Check stock availability
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ 
        message: `Only ${product.stock} items available in stock` 
      });
    }

    // Update item
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].subtotal = quantity * product.price;

    // Recalculate total
    cart.total = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
    cart.updatedAt = Date.now();

    await cart.save();
    await cart.populate('items.product', 'name price images stock');

    res.status(200).json({ 
      message: 'Cart updated successfully',
      cart 
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Server error updating cart' });
  }
};

// Remove item from cart
export const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    // Remove item
    cart.items.splice(itemIndex, 1);

    // Recalculate total
    cart.total = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
    cart.updatedAt = Date.now();

    await cart.save();
    await cart.populate('items.product', 'name price images stock');

    res.status(200).json({ 
      message: 'Item removed from cart successfully',
      cart 
    });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ message: 'Server error removing cart item' });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    cart.total = 0;
    cart.loyaltyDiscount = 0;
    cart.loyaltyPointsUsed = 0;
    cart.finalTotal = 0;
    cart.updatedAt = Date.now();

    await cart.save();

    res.status(200).json({ 
      message: 'Cart cleared successfully',
      cart 
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Server error clearing cart' });
  }
};

// Apply loyalty discount
export const applyLoyaltyDiscount = async (req, res) => {
  try {
    const { pointsToUse } = req.body;

    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    if (cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate points
    if (pointsToUse > user.loyaltyPoints) {
      return res.status(400).json({ 
        message: `Insufficient loyalty points. You have ${user.loyaltyPoints} points.` 
      });
    }

    // Calculate discount (100 points = $1)
    const discountAmount = pointsToUse / 100;

    if (discountAmount > cart.total) {
      return res.status(400).json({ 
        message: 'Discount cannot exceed cart total' 
      });
    }

    // Apply discount
    cart.loyaltyPointsUsed = pointsToUse;
    cart.loyaltyDiscount = discountAmount;
    cart.finalTotal = cart.total - discountAmount;
    cart.updatedAt = Date.now();

    await cart.save();
    await cart.populate('items.product', 'name price images stock');

    res.status(200).json({ 
      message: 'Loyalty discount applied successfully',
      cart,
      userPointsRemaining: user.loyaltyPoints - pointsToUse
    });
  } catch (error) {
    console.error('Error applying loyalty discount:', error);
    res.status(500).json({ message: 'Server error applying loyalty discount' });
  }
};

// Secure checkout
export const checkout = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    const cart = await Cart.findOne({ user: req.user.userId })
      .populate('items.product', 'name price images stock');
      
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    if (cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate stock for all items
    for (const item of cart.items) {
      const product = item.product;
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Only ${product.stock} available.` 
        });
      }
    }

    // Calculate final total
    const subtotal = cart.total;
    const discount = cart.loyaltyDiscount || 0;
    const finalTotal = subtotal - discount;

    // Create order
    const order = new Order({
      user: req.user.userId,
      items: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
        subtotal: item.subtotal
      })),
      subtotal,
      loyaltyDiscount: discount,
      loyaltyPointsUsed: cart.loyaltyPointsUsed || 0,
      finalTotal,
      shippingAddress,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'processing'
    });

    await order.save();

    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Update user loyalty points
    const user = await User.findById(req.user.userId);
    if (user) {
      // Earn points: 1 point per dollar spent
      const pointsEarned = Math.floor(finalTotal);
      user.addLoyaltyPoints(finalTotal);
      await user.save();
      order.loyaltyPointsEarned = pointsEarned;
      await order.save();
    }

    // Clear cart
    cart.items = [];
    cart.total = 0;
    cart.loyaltyDiscount = 0;
    cart.loyaltyPointsUsed = 0;
    cart.finalTotal = 0;
    cart.updatedAt = Date.now();
    await cart.save();

    // Populate order details for response
    await order.populate('items.product', 'name price images');
    await order.populate('user', 'name email');

    res.status(201).json({ 
      message: 'Order placed successfully',
      order 
    });
  } catch (error) {
    console.error('Error during checkout:', error);
    res.status(500).json({ message: 'Server error during checkout' });
  }
};

// Get user's orders
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId })
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ 
      _id: orderId, 
      user: req.user.userId 
    })
      .populate('items.product', 'name price images')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error fetching order' });
  }
};

export default {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  applyLoyaltyDiscount,
  checkout,
  getOrders,
  getOrderById
};
