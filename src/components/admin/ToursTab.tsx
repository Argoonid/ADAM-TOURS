import React from 'react';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import { getLocalizedText, type Tour } from '../../data/tours';

interface ToursTabProps {
  tours: Tour[];
  currentLang: string;
  onOpenCreate: () => void;
  onOpenEdit: (tour: Tour) => void;
  onDeleteTour: (tourId: string) => void;
}

export const ToursTab: React.FC<ToursTabProps> = ({
  tours,
  currentLang,
  onOpenCreate,
  onOpenEdit,
  onDeleteTour,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-white text-lg">Каталог экскурсий ({tours.length})</h3>
        <button
          type="button"
          onClick={onOpenCreate}
          className="bg-gradient-to-r from-[#e5c158] via-[#d4af37] to-[#aa7c11] text-slate-950 font-black px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Добавить экскурсию
        </button>
      </div>

      <div className="bg-[#0d223a] rounded-3xl border border-white/10 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#07111e] text-slate-400 font-extrabold border-b border-white/10 uppercase font-mono">
            <tr>
              <th className="p-4">Фото</th>
              <th className="p-4">Название</th>
              <th className="p-4">Категория</th>
              <th className="p-4">Взр. / Дет. ($)</th>
              <th className="p-4">Мест</th>
              <th className="p-4 text-center">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-medium">
            {tours.map((tItem) => (
              <tr key={tItem.id} className="hover:bg-white/5">
                <td className="p-4">
                  <img src={tItem.images[0]} alt="" className="w-12 h-12 rounded-xl object-cover" />
                </td>
                <td className="p-4 font-bold text-white max-w-xs">
                  {getLocalizedText(tItem.title, currentLang)}
                </td>
                <td className="p-4 uppercase font-mono text-[10px] text-[#f5d77f] font-bold">
                  {tItem.category}
                </td>
                <td className="p-4 font-bold text-white">
                  ${tItem.priceAdult} / ${tItem.priceChild}
                </td>
                <td className="p-4 font-bold text-white">
                  {tItem.availableSeats} мест
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenEdit(tItem)}
                      className="p-2 bg-[#07111e] hover:bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
                      title="Редактировать"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteTour(tItem.id)}
                      className="p-2 bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 rounded-xl cursor-pointer"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};