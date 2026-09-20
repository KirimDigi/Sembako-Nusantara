import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useAdmin } from '../context/AdminContext';

export const CartPage: React.FC = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    subtotal,
    subtotalTax,
    isFreeShipping,
    remainingForFreeShipping,
    freeShippingThreshold
  } = useCart();

  const { t, language } = useLanguage();
  const { applyVoucher } = useAdmin();

  const [voucherInput, setVoucherInput] = useState<string>('');
  const [appliedVoucherCode, setAppliedVoucherCode] = useState<string>('');
  const [discountVal, setDiscountVal] = useState<number>(0);
  const [voucherResult, setVoucherResult] = useState<{ valid: boolean; message: string } | null>(null);

  const handleApplyVoucher = () => {
    if (!voucherInput) return;
    const res = applyVoucher(voucherInput, subtotalTax);
    setVoucherResult({ valid: res.valid, message: res.message });
    if (res.valid) {
      setDiscountVal(res.discount);
      setAppliedVoucherCode(voucherInput.toUpperCase());
    } else {
      setDiscountVal(0);
      setAppliedVoucherCode('');
    }
  };

  const shippingFee = isFreeShipping ? 0 : 850;
  const finalTotal = Math.max(0, subtotalTax - discountVal + shippingFee);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">
            {t('shopping_cart')}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            ({cart.length} {t('items_count')})
          </p>
        </div>
        <Link
          to="/"
          className="text-xs font-bold text-[#c41230] hover:underline flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>{t('continue_shopping')}</span>
        </Link>
      </div>

      {cart.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EBE5DF] p-12 text-center shadow-sm space-y-4">
          <span className="material-symbols-outlined text-6xl text-stone-300">
            remove_shopping_cart
          </span>
          <h2 className="text-xl font-bold text-stone-800">
            {t('cart_empty_title')}
          </h2>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {t('cart_empty_desc')}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#c41230] hover:bg-[#9a0021] text-white font-bold px-8 py-3 rounded-full text-sm shadow-md transition-all"
          >
            <span>{t('shop_now')}</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Free Shipping Progress Indicator */}
            <div className="bg-[#FDF8F0] p-4 rounded-xl border border-[#EBE5DF]">
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="flex items-center gap-1 text-stone-800">
                  <span className="material-symbols-outlined text-sm text-[#c41230]">local_shipping</span>
                  <span>{t('free_shipping_target')}</span>
                </span>
                <span className={isFreeShipping ? 'text-[#15803D]' : 'text-[#c41230]'}>
                  {isFreeShipping
                    ? t('free_shipping_achieved')
                    : `${t('free_shipping_remaining')} ¥${remainingForFreeShipping.toLocaleString()}`}
                </span>
              </div>
              <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#c41230] h-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (subtotalTax / freeShippingThreshold) * 100)}%`
                  }}
                />
              </div>
            </div>

            {/* Item Rows */}
            <div className="bg-white rounded-2xl border border-[#EBE5DF] overflow-hidden shadow-sm divide-y divide-stone-100">
              {cart.map((item) => {
                const getProductName = () => {
                  if (language === 'JP') return item.product.nameJp;
                  if (language === 'EN') return item.product.nameEn;
                  return item.product.name;
                };

                const getProductUnit = () => {
                  if (language === 'JP') return item.product.unitJp;
                  if (language === 'EN') return item.product.unitEn;
                  return item.product.unit;
                };

                return (
                  <div
                    key={item.product.id}
                    className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    {/* Product Info */}
                    <div className="flex items-center gap-4">
                      <img
                        src={item.product.image}
                        alt={getProductName()}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-stone-100 border border-stone-200 shrink-0"
                      />
                      <div>
                        <span className="text-[10px] font-bold text-[#c41230] uppercase">
                          {item.product.brand}
                        </span>
                        <h3 className="font-bold text-sm text-stone-900 line-clamp-1">
                          {getProductName()}
                        </h3>
                        <p className="text-xs text-stone-400">{getProductUnit()}</p>
                        <div className="font-bold text-sm text-stone-900 mt-1">
                          ¥{item.product.price.toLocaleString()}{' '}
                          <span className="text-[11px] text-stone-500 font-normal">
                            ({t('tax_included')} ¥{item.product.priceTax.toLocaleString()})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quantity Stepper & Subtotal */}
                    <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                      <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-3 py-1.5 text-xs font-bold text-stone-900 min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-base text-[#c41230]">
                          ¥{(item.product.priceTax * item.quantity).toLocaleString()}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-[11px] text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          {t('remove')}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary (4 cols) */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-[#EBE5DF] p-6 shadow-sm space-y-4 sticky top-28">
              <h2 className="font-bold text-base text-stone-900 border-b border-stone-100 pb-3">
                {t('total_cart')}
              </h2>

              {/* Voucher Code Input */}
              <div className="pt-2 border-t border-stone-100">
                <label className="text-[11px] font-bold text-stone-700 block mb-1.5">
                  Punya Kode Voucher / Kupon?
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={voucherInput}
                    onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                    placeholder="Contoh: INDONESIA500"
                    className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold uppercase focus:outline-none focus:ring-1 focus:ring-[#c41230]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyVoucher}
                    className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Pakai
                  </button>
                </div>
                {voucherResult && (
                  <div
                    className={`mt-1.5 text-[11px] font-medium ${
                      voucherResult.valid ? 'text-emerald-700 font-bold' : 'text-red-500'
                    }`}
                  >
                    {voucherResult.message}
                  </div>
                )}
              </div>

              <div className="space-y-2 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>{t('subtotal_label')}:</span>
                  <span>¥{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('tax_label')}:</span>
                  <span>¥{(subtotalTax - subtotal).toLocaleString()}</span>
                </div>
                {discountVal > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Diskon Voucher ({appliedVoucherCode}):</span>
                    <span>-¥{discountVal.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{t('shipping_fee_label')}:</span>
                  <span>
                    {isFreeShipping ? (
                      <span className="text-[#15803D] font-bold">{t('free_badge')}</span>
                    ) : (
                      `¥${shippingFee.toLocaleString()}`
                    )}
                  </span>
                </div>
              </div>

              {/* Loyalty points banner */}
              <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-center justify-between">
                <span>🎁 Poin Loyalitas yang didapat:</span>
                <span className="font-bold font-mono">+{Math.floor(finalTotal / 100)} Poin</span>
              </div>

              <div className="border-t border-stone-200 pt-3 flex justify-between items-baseline">
                <span className="font-bold text-sm text-stone-900">{t('grand_total_label')}:</span>
                <div className="text-right">
                  <div className="font-bold text-2xl text-[#c41230]">
                    ¥{finalTotal.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-stone-400">{t('tax_included')}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#c41230] hover:bg-[#9a0021] text-white font-bold py-3.5 px-6 rounded-xl shadow-md active:scale-95 transition-all text-sm"
              >
                <span>{t('proceed_checkout')}</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
