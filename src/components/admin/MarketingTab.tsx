import React, { useState } from 'react';

interface MarketingTabProps {
  promoText: string;
  onUpdatePromoText: (text: string) => void;
}

export const MarketingTab: React.FC<MarketingTabProps> = ({
  promoText,
  onUpdatePromoText,
}) => {
  const [localPromo, setLocalPromo] = useState(promoText);

  return (
    <div className="bg-[#0d223a] p-6 rounded-3xl border border-white/10 space-y-4 max-w-2xl">
      <h3 className="font-extrabold text-white text-lg">Текст верхней плашки акций</h3>
      <input
        type="text"
        value={localPromo}
        onChange={(e) => setLocalPromo(e.target.value)}
        className="w-full bg-[#07111e] border border-white/10 rounded-2xl px-4 py-3 text-xs font-bold text-white focus:border-[#d4af37] outline-none"
      />
      <button
        type="button"
        onClick={() => {
          onUpdatePromoText(localPromo);
          alert('Баннер успешно обновлен!');
        }}
        className="bg-gradient-to-r from-[#e5c158] via-[#d4af37] to-[#aa7c11] text-slate-950 font-black px-6 py-3 rounded-2xl text-xs cursor-pointer"
      >
        Сохранить баннер
      </button>
    </div>
  );
};