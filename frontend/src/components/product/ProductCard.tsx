import React from 'react';
import { ShoppingBag, Star, Zap } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
  onNavigate: (page: string, params?: any) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate }) => {
  const { addItem } = useCart();

  const handleCardClick = () => {
    onNavigate('product', { slug: product.slug });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, 1);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white rounded-3xl border border-stone-200/90 hover:border-brand-300 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer relative"
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.discount_percentage > 0 && (
          <span className="bg-brand-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-sm">
            {Math.round(product.discount_percentage)}% OFF
          </span>
        )}
        {product.is_best_seller === 1 && (
          <span className="bg-stone-900 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> Bestseller
          </span>
        )}
      </div>

      {/* Protein Tag */}
      {product.protein && (
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
            <Zap className="w-3 h-3 text-emerald-600 fill-emerald-600" /> {product.protein}
          </span>
        </div>
      )}

      {/* Product Image Container */}
      <div className="relative w-full h-52 bg-stone-100 overflow-hidden">
        <img
          src={product.primary_image || (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&auto=format&fit=crop&q=80'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-stone-600 font-medium mb-1.5">
            <span>{product.category_name || 'Smart Snack'}</span>
            <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md font-semibold">{product.weight}</span>
          </div>

          <h3 className="font-bold text-stone-900 text-base leading-snug group-hover:text-brand-600 transition-colors line-clamp-2">
            {product.name}
          </h3>

          <p className="text-xs text-stone-600 line-clamp-2 mt-2 leading-relaxed">
            {product.short_description}
          </p>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-black text-xl text-stone-900">₹{product.selling_price}</span>
              {product.mrp > product.selling_price && (
                <span className="text-xs text-stone-600 line-through">₹{product.mrp}</span>
              )}
            </div>
            <p className="text-[10px] text-emerald-800 font-semibold">Incl. all taxes</p>
          </div>

          <button
            onClick={handleAddToCart}
            className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition-colors shadow-sm active:scale-95"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
