# Shopping Cart Implementation Plan

## Overview
Implement complete shopping cart functionality with item updates, loyalty discounts, and secure checkout.

## Implementation Order

### Phase 1: Backend Implementation
1. [ ] Create cart controller (backend/controllers/cart.js)
   - [ ] getCart - Retrieve user's cart
   - [ ] addToCart - Add items with quantity
   - [ ] updateCartItem - Update item quantities
   - [ ] removeCartItem - Remove specific items
   - [ ] clearCart - Clear all items
   - [ ] applyLoyaltyDiscount - Apply loyalty points discount
   - [ ] checkout - Process secure checkout

2. [ ] Update cart model (backend/models/cart.js)
   - [ ] Add loyalty discount fields
   - [ ] Add loyaltyPointsUsed field
   - [ ] Add finalTotal field

3. [ ] Update User model with loyalty points
   - [ ] Add loyaltyPoints field
   - [ ] Add loyaltyTier field

### Phase 2: Frontend Implementation
4. [ ] Create auth store (frontend/src/store/authStore.js)
   - [ ] User authentication state
   - [ ] Login/logout functionality
   - [ ] Token management

5. [ ] Create CartContext (frontend/src/context/CartContext.jsx)
   - [ ] Cart state management
   - [ ] Add/remove/update items
   - [ ] Apply loyalty discounts
   - [ ] Cart persistence

6. [ ] Create Cart page (frontend/src/pages/Cart.jsx)
   - [ ] Display cart items
   - [ ] Update quantities
   - [ ] Apply loyalty discount
   - [ ] Show order summary

7. [ ] Create Checkout page (frontend/src/pages/Checkout.jsx)
   - [ ] Secure checkout form
   - [ ] Payment information
   - [ ] Order review
   - [ ] Loyalty points application

8. [ ] Update App.jsx with routes
   - [ ] Add cart route
   - [ ] Add checkout route

### Phase 3: Integration & Testing
9. [ ] Update Navbar to show cart icon with item count
10. [ ] Update ProductDetail to add to cart functionality
11. [ ] Update ProductList to add to cart functionality
12. [ ] Test all cart operations
13. [ ] Test loyalty discount application
14. [ ] Test secure checkout flow

## Dependencies to Install
- Frontend: None (using existing react-icons, axios, etc.)
- Backend: None (using existing mongoose dependencies)

## Files to Create
1. backend/controllers/cart.js
2. frontend/src/store/authStore.js
3. frontend/src/context/CartContext.jsx
4. frontend/src/pages/Cart.jsx
5. frontend/src/pages/Checkout.jsx

## Files to Modify
1. backend/models/cart.js (add loyalty fields)
2. backend/models/User.js (add loyalty points)
3. backend/routes/route.js (ensure cart routes)
4. frontend/src/App.jsx (add cart routes)
5. frontend/src/components/Navbar.jsx (update cart icon)
6. frontend/src/pages/ProductDetail.jsx (ensure cart integration)
7. frontend/src/pages/ProductList.jsx (ensure cart integration)

## Success Criteria
- Users can add items to cart
- Users can update item quantities
- Users can apply loyalty discounts during checkout
- Secure checkout process with order confirmation
- Cart persists across sessions
- Loyalty points are tracked and applied correctly
