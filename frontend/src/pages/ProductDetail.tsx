import React, { useEffect, useState } from 'react';
import { Star, Zap, ShoppingBag, Truck, ShieldCheck, Check, Plus, Minus, ArrowRight, AlertCircle, Heart } from 'lucide-react';
import { api } from '../services/api';
import { Product, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import { ProductDetailSkeleton } from '../components/common/Skeleton';
import { ProductCard } from '../components/product/ProductCard';

interface ProductDetailProps {
  slug: string;
  onNavigate: (page: string, params?: any) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ slug, onNavigate }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Pincode Checker
  const [pincodeInput, setPincodeInput] = useState<string>('110001');
  const [pincodeResult, setPincodeResult] = useState<any>(null);
  const [pincodeLoading, setPincodeLoading] = useState<boolean>(false);

  // Review submission
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const { addItem } = useCart();
  const { showToast } = useNotification();

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const res = await api.getProduct(slug);
        if (res.success && res.data) {
          setProduct(res.data);
          setSelectedImage(res.data.primary_image || res.data.images?.[0] || '');
        } else {
          showToast('Product not found', 'error');
          onNavigate('shop');
        }
      } catch (e) {
        console.error('Failed to load product:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleCheckPincode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincodeInput.trim()) return;
    setPincodeLoading(true);
    try {
      const res = await api.checkPincode(pincodeInput.trim());
      if (res.success) {
        setPincodeResult(res.data);
      }
    } catch {
      setPincodeResult({ serviceable: false, message: 'Could not verify PIN code.' });
    } finally {
      setPincodeLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addItem(product, quantity);
    onNavigate('checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !reviewName.trim() || !reviewComment.trim()) return;
    setReviewSubmitting(true);
    try {
      const res = await api.submitReview({
        product_id: product.id,
        customer_name: reviewName.trim(),
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      if (res.success) {
        showToast('Review submitted! It will appear after moderation.', 'success');
        setReviewName('');
        setReviewComment('');
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to submit review', 'error');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (isLoading || !product) {
    return <ProductDetailSkeleton />;
  }

  const images = product.images?.length > 0 ? product.images : [product.primary_image];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Product Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left: Images Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="w-full aspect-square rounded-3xl bg-stone-100 overflow-hidden border border-stone-200/80 shadow-md">
            <img
              src={selectedImage || 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&auto=format&fit=crop&q=80'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === img ? 'border-brand-500 scale-95 shadow-md' : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info, Price & Actions */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Header Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-stone-100 text-stone-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {product.category_name}
            </span>
            {product.protein && (
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" /> {product.protein}
              </span>
            )}
            {product.weight && (
              <span className="bg-brand-50 text-brand-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                {product.weight}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 leading-tight">
            {product.name}
          </h1>

          <p className="text-sm text-stone-600 leading-relaxed">
            {product.short_description}
          </p>

          {/* Pricing Box */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-stone-900">₹{product.selling_price}</span>
                {product.mrp > product.selling_price && (
                  <span className="text-base text-stone-400 line-through">₹{product.mrp}</span>
                )}
                {product.discount_percentage > 0 && (
                  <span className="bg-brand-600 text-white text-xs font-extrabold px-2 py-0.5 rounded-md">
                    {Math.round(product.discount_percentage)}% OFF
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-0.5">Price inclusive of all taxes (5% GST)</p>
            </div>

            <div className="text-right text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              In Stock & Ready to Ship
            </div>
          </div>

          {/* Quantity Selector & Add to Cart */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="flex items-center justify-between border border-stone-300 rounded-2xl px-4 py-3 bg-white w-full sm:w-36">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1 text-stone-600 hover:text-stone-900"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-extrabold text-base text-stone-900">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-1 text-stone-600 hover:text-stone-900"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="flex-1 py-4 bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <ShoppingBag className="w-4 h-4 text-brand-400" />
              <span>Add to Snack Box</span>
            </button>

            <button
              onClick={handleBuyNow}
              className="flex-1 py-4 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <span>Buy Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Delhi NCR Pincode Delivery Checker */}
          <div className="p-5 bg-white rounded-2xl border border-stone-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-800 uppercase tracking-wide">
              <Truck className="w-4 h-4 text-brand-600" />
              <span>Check Delhi NCR Delivery Speed</span>
            </div>

            <form onSubmit={handleCheckPincode} className="flex gap-2">
              <input
                type="text"
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value)}
                placeholder="Enter 6-digit PIN code (e.g. 110001, 122002)"
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 font-mono"
                maxLength={6}
              />
              <button
                type="submit"
                disabled={pincodeLoading}
                className="px-4 py-2 bg-stone-900 text-white font-bold text-xs rounded-xl hover:bg-stone-800 disabled:opacity-50"
              >
                {pincodeLoading ? 'Checking...' : 'Check'}
              </button>
            </form>

            {pincodeResult && (
              <div className={`p-3 rounded-xl text-xs font-medium ${pincodeResult.serviceable ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-800'}`}>
                {pincodeResult.serviceable ? (
                  <div className="space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" /> {pincodeResult.zone} Serviceable!
                    </p>
                    <p className="text-[11px] text-emerald-700">Estimated Delivery: <strong>{pincodeResult.estimated_delivery}</strong> ({pincodeResult.estimated_days})</p>
                  </div>
                ) : (
                  <p>{pincodeResult.message}</p>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Nutrition Facts & Ingredients */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-stone-200">
        
        {/* Nutrition Table */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 space-y-4">
          <h3 className="font-extrabold text-lg text-stone-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-brand-600" /> Nutrition Information
          </h3>
          <p className="text-xs text-stone-500">
            Per Serving Size: <strong>{product.nutrition?.serving_size || '30g'}</strong>
          </p>

          <div className="divide-y divide-stone-100 text-xs text-stone-700">
            <div className="py-2.5 flex justify-between font-bold text-stone-900">
              <span>Total Energy (Calories)</span>
              <span>{product.nutrition?.total_calories || 120} kcal</span>
            </div>
            <div className="py-2.5 flex justify-between font-black text-emerald-800 bg-emerald-50/50 px-2 rounded-md">
              <span>Protein</span>
              <span>{product.nutrition?.protein_grams || 8} g</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span>Total Carbohydrates</span>
              <span>{product.nutrition?.carbohydrates || 18} g</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span>Dietary Fiber</span>
              <span>{product.nutrition?.dietary_fiber || 4} g</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span>Added Sugars</span>
              <span className="font-bold text-emerald-700">0.0 g (Zero Added Refined Sugar)</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span>Total Fat</span>
              <span>{product.nutrition?.total_fat || 3} g</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span>Sodium</span>
              <span>{product.nutrition?.sodium || 120} mg</span>
            </div>
          </div>
        </div>

        {/* Ingredients & Allergens */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 space-y-6">
          <div className="space-y-2">
            <h3 className="font-extrabold text-lg text-stone-900">Clean Ingredients</h3>
            <p className="text-sm text-stone-600 leading-relaxed font-mono bg-stone-50 p-4 rounded-2xl border border-stone-200/80">
              {product.ingredients || '100% slow-roasted Indian grains, lentils, cold-pressed oils and whole spices.'}
            </p>
          </div>

          {product.allergens && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-700" /> Allergen Advisory
              </div>
              <p>{product.allergens}</p>
            </div>
          )}

          <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100 text-xs text-brand-900">
            <h4 className="font-bold">The OfficeFuel Promise</h4>
            <p className="text-stone-600 mt-1">
              Never deep-fried. No palm oil. No artificial flavor enhancers. Portion-friendly Indian snacking.
            </p>
          </div>
        </div>

      </div>

      {/* Customer Reviews & Moderation Form */}
      <div className="bg-stone-50 p-8 rounded-3xl border border-stone-200 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black text-stone-900">Customer Feedback & Reviews</h3>
            <p className="text-xs text-stone-500 mt-1">Verified reviews from Delhi NCR professionals</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Reviews List */}
          <div className="lg:col-span-7 space-y-4">
            {!product.reviews || product.reviews.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center text-stone-500 text-sm">
                No reviews yet for this product. Be the first to share your experience!
              </div>
            ) : (
              product.reviews.map((rev) => (
                <div key={rev.id} className="bg-white p-5 rounded-2xl border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-stone-900">{rev.customer_name}</span>
                      {rev.is_verified_purchase === 1 && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Verified Buyer
                        </span>
                      )}
                    </div>
                    <div className="flex text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">{rev.comment}</p>
                </div>
              ))
            )}
          </div>

          {/* Write a Review Form */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
            <h4 className="font-bold text-sm text-stone-900">Leave a Verified Review</h4>
            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  placeholder="e.g. Ankit Gupta"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Rating</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
                  <option value={3}>⭐⭐⭐ (3 - Good)</option>
                  <option value={2}>⭐⭐ (2 - Fair)</option>
                  <option value={1}>⭐ (1 - Poor)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Your Feedback</label>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share how this snack fuels your workday..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
                />
              </div>

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="w-full py-2.5 bg-stone-900 text-white font-bold text-xs rounded-xl hover:bg-stone-800 disabled:opacity-50"
              >
                {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>

        </div>
      </div>

    </div>
  );
};
