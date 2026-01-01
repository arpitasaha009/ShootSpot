import create from 'zustand';

const useReviewStore = create((set, get) => ({
  reviews: {}, // { itemId: [{id, rating, text, photo, user, date, verified, replies: [], helpful: 0}, ...] }
  addReview: (itemId, review) => set((state) => ({
    reviews: {
      ...state.reviews,
      [itemId]: [...(state.reviews[itemId] || []), { ...review, id: Date.now(), replies: [], helpful: 0 }],
    },
  })),
  editReview: (itemId, reviewId, updated) => set((state) => ({
    reviews: {
      ...state.reviews,
      [itemId]: state.reviews[itemId].map(r => r.id === reviewId ? { ...r, ...updated } : r),
    },
  })),
  deleteReview: (itemId, reviewId) => set((state) => ({
    reviews: {
      ...state.reviews,
      [itemId]: state.reviews[itemId].filter(r => r.id !== reviewId),
    },
  })),
  addReply: (itemId, reviewId, reply) => set((state) => ({
    reviews: {
      ...state.reviews,
      [itemId]: state.reviews[itemId].map(r => r.id === reviewId ? { ...r, replies: [...r.replies, reply] } : r),
    },
  })),
  reportReview: (itemId, reviewId) => { /* Demo alert */ alert('Reported (demo)'); },
  getReviews: (itemId, sort = 'recent') => {
    const revs = get().reviews[itemId] || [];
    if (sort === 'highest') return [...revs].sort((a, b) => b.rating - a.rating);
    if (sort === 'helpful') return [...revs].sort((a, b) => b.helpful - a.helpful);
    return [...revs].sort((a, b) => new Date(b.date) - new Date(a.date)); // recent default
  },
  getAverageRating: (itemId) => {
    const revs = get().reviews[itemId] || [];
    return revs.length ? (revs.reduce((sum, r) => sum + r.rating, 0) / revs.length).toFixed(1) : 0;
  },
  getReviewCount: (itemId) => (get().reviews[itemId] || []).length,
}));

export default useReviewStore;