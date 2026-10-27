import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-4 animate-pulse flex flex-col justify-between h-[410px]">
      <div>
        <div className="w-full h-48 bg-stone-200 rounded-xl mb-4"></div>
        <div className="h-4 bg-stone-200 rounded w-1/3 mb-2"></div>
        <div className="h-5 bg-stone-200 rounded w-4/5 mb-3"></div>
        <div className="h-3 bg-stone-200 rounded w-full mb-2"></div>
        <div className="h-3 bg-stone-200 rounded w-2/3"></div>
      </div>
      <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
        <div className="h-6 bg-stone-200 rounded w-1/4"></div>
        <div className="h-10 bg-stone-200 rounded-xl w-1/3"></div>
      </div>
    </div>
  );
};

export const ProductDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="w-full h-[450px] bg-stone-200 rounded-3xl"></div>
          <div className="flex gap-4">
            <div className="w-20 h-20 bg-stone-200 rounded-xl"></div>
            <div className="w-20 h-20 bg-stone-200 rounded-xl"></div>
            <div className="w-20 h-20 bg-stone-200 rounded-xl"></div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="h-4 bg-stone-200 rounded w-1/4"></div>
          <div className="h-10 bg-stone-200 rounded w-3/4"></div>
          <div className="h-8 bg-stone-200 rounded w-1/3"></div>
          <div className="h-20 bg-stone-200 rounded-2xl w-full"></div>
          <div className="h-12 bg-stone-200 rounded-2xl w-1/2"></div>
        </div>
      </div>
    </div>
  );
};
