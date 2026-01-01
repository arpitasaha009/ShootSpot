import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const StarRating = ({ rating, setRating, interactive = false }) => {
  const [hover, setHover] = useState(0);
  
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`text-2xl ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
          onClick={() => interactive && setRating(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
        >
          <span className={
            star <= (hover || rating) ? 'text-yellow-400' : 'text-gray-400'
          }>
            ★
          </span>
        </button>
      ))}
    </div>
  );
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userReviewed, setUserReviewed] = useState(false);

  useEffect(() => {
    fetchProduct();
    checkLoginStatus();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${id}`);
      setProduct(response.data.product);
      setError(null);
    } catch (err) {
      setError('Failed to fetch product details');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  };

  const handleAddToCart = async () => {
    try {
      await api.post('/cart/add', { productId: id, quantity: 1 });
      toast.success('Product added to cart successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!reviewComment.trim()) {
      toast.error('Please write a review comment');
      return;
    }
    
    try {
      setSubmittingReview(true);
      await api.post(`/products/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment
      });
      toast.success('Review submitted successfully!');
      setReviewComment('');
      setReviewRating(5);
      fetchProduct(); // Refresh to show new review
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to submit review';
      toast.error(errorMsg);
      
      if (errorMsg.includes('already reviewed')) {
        setUserReviewed(true);
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await api.delete(`/products/${id}/reviews/${reviewId}`);
      toast.success('Review deleted successfully!');
      fetchProduct();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete review');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-cover bg-center text-white" style={{ backgroundImage: "url('piano-background.jpg')" }}>
        <Navbar showLogin={true} showSignup={true} />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen bg-cover bg-center text-white" style={{ backgroundImage: "url('piano-background.jpg')" }}>
        <Navbar showLogin={true} showSignup={true} />
        <div className="flex-1 flex justify-center items-center">
          <div className="bg-red-500/20 border border-red-500 text-white p-6 rounded-lg max-w-md text-center">
            <p className="mb-4 text-xl">Product not found</p>
            <Link to="/products" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md inline-block">
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get specifications as array
  const specificationsArray = product.specifications 
    ? Object.entries(product.specifications).map(([key, value]) => ({ key, value }))
    : [];

  return (
    <div className="flex flex-col min-h-screen bg-cover bg-center text-white" style={{ backgroundImage: "url('piano-background.jpg')" }}>
      <Navbar showLogin={true} showSignup={true} />
      
      <div className="flex-1 p-8 pt-24">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/products')}
            className="text-gray-400 hover:text-white mb-6 flex items-center text-lg"
          >
            ← Back to Products
          </button>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="bg-black/60 rounded-2xl overflow-hidden border border-gray-700">
                <img
                  src={`http://127.0.0.1:5000${product.images[selectedImage]}`}
                  alt={product.name}
                  className="w-full h-[400px] object-cover"
                />
              </div>
              
              {/* Thumbnail Gallery */}
              {product.images.length > 1 && (
                <div className="flex space-x-3 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index 
                          ? 'border-blue-500 ring-2 ring-blue-500/50' 
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <img
                        src={`http://127.0.0.1:5000${image}`}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Product Info */}
            <div className="bg-black/60 rounded-2xl p-8 border border-gray-700">
              {/* Category Badge */}
              <div className="mb-4">
                <span className="bg-blue-900/50 text-blue-300 text-sm px-4 py-1 rounded-full capitalize">
                  {product.category}
                </span>
              </div>
              
              {/* Title & Brand */}
              <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
              <p className="text-xl text-gray-400 mb-4">by {product.brand}</p>
              
              {/* Rating Summary */}
              {product.reviews && product.reviews.length > 0 && (
                <div className="flex items-center mb-4">
                  <StarRating rating={Math.round(product.averageRating)} />
                  <span className="ml-3 text-lg">
                    <span className="font-semibold text-yellow-400">{product.averageRating.toFixed(1)}</span>
                    <span className="text-gray-400"> ({product.reviews.length} reviews)</span>
                  </span>
                </div>
              )}
              
              {/* Price */}
              <div className="text-4xl font-bold text-blue-400 mb-6">
                ${product.price.toFixed(2)}
              </div>
              
              {/* Stock Status */}
              <div className="mb-6">
                {product.stock > 0 ? (
                  <span className="text-green-400 flex items-center">
                    <span className="w-3 h-3 bg-green-400 rounded-full mr-2"></span>
                    In Stock ({product.stock} available)
                  </span>
                ) : (
                  <span className="text-red-400 flex items-center">
                    <span className="w-3 h-3 bg-red-400 rounded-full mr-2"></span>
                    Out of Stock
                  </span>
                )}
              </div>
              
              {/* Description */}
              <p className="text-gray-300 mb-8 leading-relaxed">
                {product.description}
              </p>
              
              {/* Add to Cart Button */}
              {product.stock > 0 && (
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Add to Cart
                </button>
              )}
              
              {/* Compatibility Info */}
              {product.compatibility && (
                <div className="mt-8 p-4 bg-purple-900/30 border border-purple-500/50 rounded-xl">
                  <h3 className="text-purple-400 font-semibold mb-2 flex items-center">
                    <span className="mr-2">🔧</span> Compatibility
                  </h3>
                  <p className="text-gray-300">{product.compatibility}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Detailed Specifications */}
          {specificationsArray.length > 0 && (
            <div className="bg-black/60 rounded-2xl p-8 border border-gray-700 mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <span className="mr-3">📋</span> Specifications
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {specificationsArray.map((spec, index) => (
                  <div key={index} className="flex justify-between py-3 border-b border-gray-700 last:border-0">
                    <span className="text-gray-400">{spec.key}</span>
                    <span className="text-white font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Reviews Section */}
          <div className="bg-black/60 rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <span className="mr-3">⭐</span> Customer Reviews
              {product.reviews && product.reviews.length > 0 && (
                <span className="ml-2 text-lg text-gray-400">
                  ({product.reviews.length})
                </span>
              )}
            </h2>
            
            {/* Review Form */}
            {isLoggedIn && !userReviewed && (
              <form onSubmit={handleSubmitReview} className="mb-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
                
                <div className="mb-4">
                  <label className="block text-gray-400 mb-2">Your Rating</label>
                  <StarRating rating={reviewRating} setRating={setReviewRating} interactive={true} />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-400 mb-2">Your Review</label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows="4"
                    placeholder="Share your experience with this product..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={submittingReview}
                  className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors ${
                    submittingReview ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
            
            {!isLoggedIn && (
              <div className="mb-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700 text-center">
                <p className="text-gray-400 mb-4">Please log in to write a review</p>
                <Link
                  to="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold inline-block"
                >
                  Log In
                </Link>
              </div>
            )}
            
            {/* Reviews List */}
            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-6">
                {product.reviews
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((review, index) => (
                    <div key={review._id || index} className="p-5 bg-gray-800/30 rounded-xl border border-gray-700">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center mb-1">
                            <span className="font-semibold text-white mr-3">{review.userName}</span>
                            <StarRating rating={review.rating} />
                          </div>
                          <p className="text-sm text-gray-500">
                            {format(new Date(review.createdAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                        {/* Delete button if user owns review */}
                        {isLoggedIn && review.userName === JSON.parse(localStorage.getItem('user') || '{}').name && (
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <p className="text-gray-300">{review.comment}</p>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <p className="text-xl mb-2">No reviews yet</p>
                <p className="text-sm">Be the first to review this product!</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-black/50 text-center p-4">
        <p>© 2025 Resonance. All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default ProductDetail;
