import React, { useState } from 'react';
import { 
  X, Globe, Loader2, Plus, Trash2, Upload, Star, 
  Clock, CalendarDays, Users 
} from 'lucide-react';
import { type Tour } from '../../data/tours';
import { tourService } from '../../services/tourService';
import { supabase } from '../../services/supabase';

async function translateText(text: string, targetLang: 'en' | 'it'): Promise<string> {
  if (!text || !text.trim()) return '';
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ru|${targetLang}`);
    const data = await res.json();
    return data.responseData?.translatedText || text;
  } catch {
    return text;
  }
}

interface TourEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTour: Tour | null;
  onSaveSuccess: (updatedTour: Tour, isEdit: boolean) => void;
}

const WEEK_DAYS = [
  { id: 1, label: 'Пн' },
  { id: 2, label: 'Вт' },
  { id: 3, label: 'Ср' },
  { id: 4, label: 'Чт' },
  { id: 5, label: 'Пт' },
  { id: 6, label: 'Сб' },
  { id: 0, label: 'Вс' },
];

const PRESET_TIMES = [
  { time: '04:30', label: '🌅 Рассвет' },
  { time: '08:00', label: '☀️ Утро' },
  { time: '13:00', label: '🏖 День' },
  { time: '15:30', label: '🌄 Закат' },
  { time: '20:00', label: '🌙 Вечер' },
];

export const TourEditorModal: React.FC<TourEditorModalProps> = ({
  isOpen,
  onClose,
  editingTour,
  onSaveSuccess,
}) => {
  if (!isOpen) return null;

  const [isTranslating, setIsTranslating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string | null>(null);
  const [customTimeInput, setCustomTimeInput] = useState('');

  const [formData, setFormData] = useState({
    id: editingTour ? editingTour.id : `tour-${Date.now()}`,
    titleRu: editingTour ? (typeof editingTour.title === 'string' ? editingTour.title : editingTour.title.ru) : '',
    titleEn: editingTour ? (typeof editingTour.title === 'string' ? editingTour.title : editingTour.title.en || '') : '',
    titleIt: editingTour ? (typeof editingTour.title === 'string' ? editingTour.title : editingTour.title.it || '') : '',
    category: editingTour ? editingTour.category : ('sea' as const),
    priceAdult: editingTour ? editingTour.priceAdult : 30,
    priceChild: editingTour ? editingTour.priceChild : 15,
    maxCapacity: editingTour ? (editingTour.maxCapacity || editingTour.availableSeats || 20) : 20,
    daysOfWeek: editingTour?.daysOfWeek && editingTour.daysOfWeek.length > 0 
      ? editingTour.daysOfWeek 
      : [0, 1, 2, 3, 4, 5, 6],
    timeSlots: editingTour?.timeSlots && editingTour.timeSlots.length > 0 
      ? editingTour.timeSlots 
      : ['08:00'],
    overviewRu: editingTour ? (typeof editingTour.overview === 'string' ? editingTour.overview : editingTour.overview?.ru || '') : '',
    overviewEn: editingTour ? (typeof editingTour.overview === 'string' ? editingTour.overview : editingTour.overview?.en || '') : '',
    overviewIt: editingTour ? (typeof editingTour.overview === 'string' ? editingTour.overview : editingTour.overview?.it || '') : '',
    images: editingTour ? (editingTour.images || []) : [],
    options: editingTour ? (editingTour.options || []).map(opt => ({
      nameRu: typeof opt.name === 'string' ? opt.name : opt.name.ru,
      nameEn: typeof opt.name === 'string' ? opt.name : opt.name.en || '',
      nameIt: typeof opt.name === 'string' ? opt.name : opt.name.it || '',
      price: opt.price
    })) : []
  });

  const toggleDay = (dayId: number) => {
    setFormData(prev => {
      const exists = prev.daysOfWeek.includes(dayId);
      const updated = exists 
        ? prev.daysOfWeek.filter(d => d !== dayId)
        : [...prev.daysOfWeek, dayId].sort();
      return { ...prev, daysOfWeek: updated };
    });
  };

  const toggleAllDays = () => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.length === 7 ? [1, 3, 5] : [0, 1, 2, 3, 4, 5, 6]
    }));
  };

  const addTimeSlot = (time: string) => {
    if (!time || formData.timeSlots.includes(time)) return;
    setFormData(prev => ({
      ...prev,
      timeSlots: [...prev.timeSlots, time].sort()
    }));
    setCustomTimeInput('');
  };

  const removeTimeSlot = (time: string) => {
    if (formData.timeSlots.length <= 1) {
      alert('У экскурсии должен быть хотя бы один рейс выезда!');
      return;
    }
    setFormData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.filter(t => t !== time)
    }));
  };

  const processFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;

    if (formData.images.length + files.length > 10) {
      alert('Максимально можно загрузить до 10 фотографий!');
      return;
    }

    setIsUploading(true);
    setUploadErrorMsg(null);
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const cleanName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('tour-images')
        .upload(cleanName, file, { cacheControl: '3600', upsert: false });

      if (error) {
        console.error('Ошибка Supabase Storage:', error);
        setUploadErrorMsg(`Ошибка загрузки: ${error.message}`);
        continue;
      }

      if (data?.path) {
        const { data: publicData } = supabase.storage
          .from('tour-images')
          .getPublicUrl(data.path);
        if (publicData?.publicUrl) uploadedUrls.push(publicData.publicUrl);
      }
    }

    if (uploadedUrls.length > 0) {
      setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
    }
    setIsUploading(false);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragActive(false);
    if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files);
  };

  const handleAutoTranslateAll = async () => {
    if (!formData.titleRu) {
      alert('Сначала введите название на русском языке!');
      return;
    }
    setIsTranslating(true);
    const [tEn, tIt, oEn, oIt] = await Promise.all([
      translateText(formData.titleRu, 'en'),
      translateText(formData.titleRu, 'it'),
      translateText(formData.overviewRu, 'en'),
      translateText(formData.overviewRu, 'it')
    ]);

    const translatedOptions = await Promise.all(
      formData.options.map(async (opt) => ({
        ...opt,
        nameEn: opt.nameEn || await translateText(opt.nameRu, 'en'),
        nameIt: opt.nameIt || await translateText(opt.nameRu, 'it')
      }))
    );

    setFormData(prev => ({
      ...prev,
      titleEn: tEn,
      titleIt: tIt,
      overviewEn: oEn,
      overviewIt: oIt,
      options: translatedOptions
    }));
    setIsTranslating(false);
  };

  const handleSaveTourSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleRu) {
      alert('Введите название тура!');
      return;
    }
    if (formData.daysOfWeek.length === 0) {
      alert('Выберите хотя бы один день проведения экскурсии!');
      return;
    }
    if (formData.timeSlots.length === 0) {
      alert('Добавьте хотя бы одно время выезда!');
      return;
    }
    if (formData.images.length === 0) {
      alert('Загрузите хотя бы одну фотографию для экскурсии!');
      return;
    }

    const scheduleLabel = formData.daysOfWeek.length === 7 
      ? 'Ежедневно' 
      : formData.daysOfWeek.map(d => WEEK_DAYS.find(w => w.id === d)?.label).join(', ');

    const fullTour: Tour = {
      id: formData.id || `tour-${Date.now()}`,
      slug: formData.id || `tour-${Date.now()}`,
      title: {
        ru: formData.titleRu,
        en: formData.titleEn || formData.titleRu,
        it: formData.titleIt || formData.titleRu
      },
      category: formData.category,
      categoryLabel: {
        ru: formData.category === 'sea' ? 'Морские прогулки' : formData.category === 'safari' ? 'Сафари & Квадроциклы' : formData.category === 'historical' ? 'Исторические туры' : 'Шоу & Развлечения',
        en: formData.category,
        it: formData.category
      },
      location: { ru: 'Шарм-эль-Шейх', en: 'Sharm El Sheikh', it: 'Sharm el-Sheikh' },
      duration: { ru: '6 часов', en: '6 hours', it: '6 ore' },
      priceAdult: Number(formData.priceAdult),
      priceChild: Number(formData.priceChild),
      childAgeInfo: { ru: 'Дети до 5 лет бесплатно', en: 'Under 5 free', it: 'Sotto 5 gratis' },
      schedule: { ru: scheduleLabel, en: scheduleLabel, it: scheduleLabel },
      departureTime: { ru: formData.timeSlots[0], en: formData.timeSlots[0], it: formData.timeSlots[0] },
      daysOfWeek: formData.daysOfWeek,
      timeSlots: formData.timeSlots,
      maxCapacity: Number(formData.maxCapacity),
      availableSeats: Number(formData.maxCapacity),
      overview: {
        ru: formData.overviewRu,
        en: formData.overviewEn || formData.overviewRu,
        it: formData.overviewIt || formData.overviewRu
      },
      included: [{ ru: 'Трансфер из отеля', en: 'Hotel transfer', it: 'Trasferimento' }],
      whatToBring: [{ ru: 'Питьевая вода', en: 'Water', it: 'Acqua' }],
      featured: false,
      images: formData.images,
      options: formData.options.map(o => ({
        name: { ru: o.nameRu, en: o.nameEn || o.nameRu, it: o.nameIt || o.nameRu },
        price: Number(o.price)
      }))
    };

    const success = await tourService.saveTour(fullTour);
    if (success) {
      onSaveSuccess(fullTour, Boolean(editingTour));
    } else {
      alert('Ошибка сохранения в базу Supabase!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto font-sans">
      <div className="bg-[#0d223a] w-full max-w-3xl rounded-3xl border border-white/10 p-5 sm:p-7 space-y-6 my-auto max-h-[92vh] overflow-y-auto text-white shadow-2xl">
        
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#f5d77f] font-bold block">
              Параметры экскурсии
            </span>
            <h3 className="text-xl font-black text-white">
              {editingTour ? 'Редактировать экскурсию' : 'Добавить новую экскурсию'}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSaveTourSubmit} className="space-y-5">
          
          {/* Автоперевод */}
          <div className="flex items-center justify-between bg-[#07111e] p-3.5 rounded-2xl border border-white/10">
            <div className="text-xs text-slate-300">
              💡 <b>Умный перевод:</b> заполните русские поля и нажмите кнопку для EN и IT версий
            </div>
            <button
              type="button"
              onClick={handleAutoTranslateAll}
              disabled={isTranslating}
              className="bg-[#d4af37] hover:bg-[#e5c158] text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isTranslating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
              <span>{isTranslating ? 'Перевод...' : 'Автоперевод'}</span>
            </button>
          </div>

          {/* Названия */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#f5d77f]">Название экскурсии (RU / EN / IT)</label>
            <input
              type="text"
              required
              placeholder="Название (RU) *"
              value={formData.titleRu}
              onChange={(e) => setFormData({ ...formData, titleRu: e.target.value })}
              className="w-full bg-[#07111e] border border-white/10 rounded-xl p-3 text-xs font-bold text-white focus:border-[#d4af37] outline-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Title (EN)"
                value={formData.titleEn}
                onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                className="w-full bg-[#07111e] border border-white/10 rounded-xl p-2.5 text-xs text-slate-300 focus:border-[#d4af37] outline-none"
              />
              <input
                type="text"
                placeholder="Titolo (IT)"
                value={formData.titleIt}
                onChange={(e) => setFormData({ ...formData, titleIt: e.target.value })}
                className="w-full bg-[#07111e] border border-white/10 rounded-xl p-2.5 text-xs text-slate-300 focus:border-[#d4af37] outline-none"
              />
            </div>
          </div>

          {/* КОНФИГУРАТОР РАСПИСАНИЯ И РЕЙСОВ */}
          <div className="bg-[#07111e] p-4 sm:p-5 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-extrabold text-[#f5d77f] flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-[#d4af37]" /> Дни проведения и рейсы выезда
              </span>
              <span className="text-[10px] text-slate-400">Слот-контроль мест</span>
            </div>

            {/* Дни недели */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-300">
                  Активные дни недели проведения:
                </label>
                <button
                  type="button"
                  onClick={toggleAllDays}
                  className="text-[11px] font-bold text-amber-400 hover:underline cursor-pointer"
                >
                  {formData.daysOfWeek.length === 7 ? 'Сбросить' : 'Выбрать все дни (Ежедневно)'}
                </button>
              </div>

              <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                {WEEK_DAYS.map((day) => {
                  const isActive = formData.daysOfWeek.includes(day.id);
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => toggleDay(day.id)}
                      className={`h-9 w-10 sm:w-12 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                        isActive
                          ? 'bg-[#d4af37] text-slate-950 font-black shadow-md shadow-amber-500/10 scale-105'
                          : 'bg-[#0d223a] text-slate-400 hover:text-white border border-white/10'
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Рейсы выезда */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <label className="text-xs font-bold text-slate-300 block">
                Время выездов (рейсы в течение дня):
              </label>

              <div className="flex gap-2 flex-wrap items-center">
                {formData.timeSlots.map((slot) => (
                  <div
                    key={slot}
                    className="bg-[#0d223a] border border-[#d4af37]/60 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-sm"
                  >
                    <Clock className="w-3.5 h-3.5 text-[#f5d77f]" />
                    <span className="text-xs font-mono font-bold text-white">{slot}</span>
                    <button
                      type="button"
                      onClick={() => removeTimeSlot(slot)}
                      className="text-slate-400 hover:text-rose-400 p-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 mr-1">Быстрый выбор:</span>
                {PRESET_TIMES.map((preset) => (
                  <button
                    key={preset.time}
                    type="button"
                    onClick={() => addTimeSlot(preset.time)}
                    className="bg-white/5 hover:bg-[#d4af37]/20 hover:text-amber-300 text-slate-300 border border-white/10 text-[10px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {preset.label} ({preset.time})
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="time"
                  value={customTimeInput}
                  onChange={(e) => setCustomTimeInput(e.target.value)}
                  className="bg-[#0d223a] border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-[#d4af37]"
                />
                <button
                  type="button"
                  onClick={() => addTimeSlot(customTimeInput)}
                  className="bg-white/10 hover:bg-[#d4af37] hover:text-slate-950 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Добавить рейс
                </button>
              </div>
            </div>

            {/* Лимит мест на рейс */}
            <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-200 block flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-cyan-400" /> Лимит мест на 1 выезд (автобус / яхта)
                </span>
                <span className="text-[10px] text-slate-400">
                  При достижении лимита рейс автоматически блокируется для новых броней
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={200}
                  required
                  value={formData.maxCapacity}
                  onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
                  className="w-24 bg-[#0d223a] border border-white/20 focus:border-[#d4af37] rounded-xl p-2 text-center text-xs font-mono font-black text-white outline-none"
                />
                <span className="text-xs text-slate-400">мест</span>
              </div>
            </div>
          </div>

          {/* Категория и цены */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#f5d77f] mb-1">Категория</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full bg-[#07111e] border border-white/10 rounded-xl p-2.5 text-xs font-bold text-white focus:border-[#d4af37] outline-none"
              >
                <option value="sea">Морские (sea)</option>
                <option value="safari">Сафари (safari)</option>
                <option value="historical">Исторические (historical)</option>
                <option value="show">Шоу (show)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#f5d77f] mb-1">Цена Взр. ($)</label>
              <input
                type="number"
                required
                value={formData.priceAdult}
                onChange={(e) => setFormData({ ...formData, priceAdult: Number(e.target.value) })}
                className="w-full bg-[#07111e] border border-white/10 rounded-xl p-2.5 text-xs font-bold text-white focus:border-[#d4af37] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#f5d77f] mb-1">Цена Дет. ($)</label>
              <input
                type="number"
                required
                value={formData.priceChild}
                onChange={(e) => setFormData({ ...formData, priceChild: Number(e.target.value) })}
                className="w-full bg-[#07111e] border border-white/10 rounded-xl p-2.5 text-xs font-bold text-white focus:border-[#d4af37] outline-none"
              />
            </div>
          </div>

          {/* Мультизагрузка фоток */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-[#f5d77f]">
                Фотографии экскурсии ({formData.images.length}/10) — ⭐️ Первое фото главное
              </label>
              <span className="text-[10px] text-slate-400">PNG, JPG, WebP</span>
            </div>

            <div
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all cursor-pointer ${
                isDragActive 
                  ? 'border-[#d4af37] bg-[#d4af37]/10 scale-[1.01]' 
                  : 'border-white/20 hover:border-[#d4af37] bg-[#07111e]'
              }`}
            >
              <input 
                id="tour-photo-input"
                type="file" 
                multiple 
                accept="image/*" 
                onChange={(e) => e.target.files && processFiles(e.target.files)} 
                className="hidden" 
              />

              {isUploading ? (
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold py-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Загружаем фото в облако Supabase...</span>
                </div>
              ) : (
                <label htmlFor="tour-photo-input" className="cursor-pointer flex flex-col items-center">
                  <Upload className={`w-8 h-8 mb-2 transition-colors ${isDragActive ? 'text-[#d4af37]' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold text-slate-200 text-center">
                    {isDragActive ? 'Отпустите файлы для загрузки' : 'Перетащите сюда фото или нажмите для выбора'}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1">Можно выделить сразу до 10 файлов</span>
                </label>
              )}
            </div>

            {uploadErrorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                {uploadErrorMsg}
              </div>
            )}

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                {formData.images.map((url, idx) => (
                  <div 
                    key={idx} 
                    className={`relative rounded-2xl overflow-hidden border-2 group aspect-square bg-slate-900 shadow-md ${
                      idx === 0 ? 'border-[#d4af37]' : 'border-white/10'
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    
                    {idx === 0 && (
                      <span className="absolute top-2 left-2 bg-[#d4af37] text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-md shadow">
                        Главное
                      </span>
                    )}

                    <div className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const imgs = [...formData.images];
                            const [selectedImg] = imgs.splice(idx, 1);
                            imgs.unshift(selectedImg);
                            setFormData(prev => ({ ...prev, images: imgs }));
                          }}
                          className="p-2 bg-amber-500 text-slate-950 rounded-xl hover:bg-amber-400 cursor-pointer transition-transform active:scale-90"
                          title="Сделать главным"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                        className="p-2 bg-rose-500 text-white rounded-xl hover:bg-rose-400 cursor-pointer transition-transform active:scale-90"
                        title="Удалить фото"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Описание */}
          <div>
            <label className="block text-xs font-bold text-[#f5d77f] mb-1">Описание экскурсии (RU)</label>
            <textarea
              rows={3}
              value={formData.overviewRu}
              onChange={(e) => setFormData({ ...formData, overviewRu: e.target.value })}
              className="w-full bg-[#07111e] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-[#d4af37] outline-none"
            />
          </div>

          {/* Опции */}
          <div className="space-y-2 border-t border-white/10 pt-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-[#f5d77f]">Дополнительные платные опции</label>
              <button
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  options: [...formData.options, { nameRu: 'Новая опция', nameEn: '', nameIt: '', price: 10 }]
                })}
                className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Добавить опцию
              </button>
            </div>
            {formData.options.map((opt, idx) => (
              <div key={idx} className="flex gap-2 items-center bg-[#07111e] p-2 rounded-xl border border-white/10">
                <input
                  type="text"
                  placeholder="Название (RU)"
                  value={opt.nameRu}
                  onChange={(e) => {
                    const updated = [...formData.options];
                    updated[idx].nameRu = e.target.value;
                    setFormData({ ...formData, options: updated });
                  }}
                  className="flex-1 bg-[#0d223a] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#d4af37] outline-none"
                />
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-400">$</span>
                  <input
                    type="number"
                    placeholder="Цена"
                    value={opt.price}
                    onChange={(e) => {
                      const updated = [...formData.options];
                      updated[idx].price = Number(e.target.value);
                      setFormData({ ...formData, options: updated });
                    }}
                    className="w-16 bg-[#0d223a] border border-white/10 rounded-lg px-2 py-1.5 text-xs font-bold text-white focus:border-[#d4af37] outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    options: formData.options.filter((_, i) => i !== idx)
                  })}
                  className="p-1.5 text-slate-400 hover:text-rose-400 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-[#e5c158] via-[#d4af37] to-[#aa7c11] text-slate-950 font-black text-sm uppercase rounded-2xl cursor-pointer shadow-lg active:scale-95"
          >
            Сохранить экскурсию в базу Supabase
          </button>
        </form>

      </div>
    </div>
  );
};