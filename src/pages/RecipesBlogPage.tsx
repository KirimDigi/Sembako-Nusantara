import React from 'react';
import { RECIPES_DATA } from '../data/recipes';

export const RecipesBlogPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="text-center space-y-2 mb-10">
        <span className="px-3 py-1 bg-[#FFDAD9] text-[#9a0021] text-xs font-bold rounded-full uppercase tracking-wider">
          Komunitas Diaspora Indonesia di Jepang
        </span>
        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900">
          Resep Masakan Nusantara & Kreasi Dapur di Jepang 🍲
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-xl mx-auto">
          Inspirasi menu harian lezat khas tanah air menggunakan bahan bumbu autentik yang mudah dibeli di Sembako Nusantara.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {RECIPES_DATA.map((recipe) => (
          <div
            key={recipe.id}
            className="bg-white rounded-2xl border border-[#EBE5DF] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="relative aspect-video overflow-hidden bg-stone-100">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-xs text-white text-xs px-3 py-1 rounded-full font-bold">
                  ⏱️ {recipe.cookingTime} • 🍽️ {recipe.servings}
                </span>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                    <span>Oleh: {recipe.author}</span>
                    <span>{recipe.date}</span>
                  </div>
                  <h2 className="text-lg font-bold text-stone-900 group-hover:text-[#c41230] transition-colors leading-snug">
                    {recipe.title}
                  </h2>
                  <p className="text-xs text-stone-500 mt-1 italic">{recipe.titleJp}</p>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {recipe.description}
                </p>

                {/* Ingredients snippet */}
                <div className="bg-[#FDF8F0] p-4 rounded-xl border border-[#EBE5DF]">
                  <h3 className="text-xs font-bold text-stone-800 mb-2">Bahan Utama:</h3>
                  <ul className="text-xs text-stone-600 space-y-1">
                    {recipe.ingredients.map((ing, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="text-[#c41230]">•</span>
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0 border-t border-stone-100 flex items-center justify-between mt-4">
              <span className="text-xs font-bold text-[#15803D] bg-[#DCFCE7] px-2.5 py-1 rounded-md">
                Tingkat: {recipe.difficulty}
              </span>
              <button
                type="button"
                onClick={() => alert(`Resep lengkap "${recipe.title}" telah dimuat!`)}
                className="text-xs font-bold text-[#c41230] hover:underline flex items-center gap-1"
              >
                <span>Baca Selengkapnya</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
