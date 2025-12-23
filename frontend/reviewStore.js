import create from 'zustand';

const useReviewStore = create((set, get) => ({
  reviews: {}, // { itemId: [{rating, text, photo, user, date}, ...] }
  addReview: (itemId, review) => set((state) => ({
    reviews: {
      ...state.reviews,
      [itemId]: [...(state.reviews[itemId] || []), review],
    },
  })),
  getReviews: (itemId) => get().reviews[itemId] || [],
  getAverageRating: (itemId) => {
    const revs = get().reviews[itemId] || [];
    if (!revs.length) return 0;
    const avg = revs.reduce((sum, r) => sum + r.rating, 0) / revs.length;
    return avg.toFixed(1);
  },
  getReviewCount: (itemId) => (get().reviews[itemId] || []).length,
}));

export default useReviewStore;