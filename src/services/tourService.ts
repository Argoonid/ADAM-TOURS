import { supabase } from './supabase';
import { TOURS_DATA } from '../data/tours';
import type { Tour } from '../data/tours';

const mapRowToTour = (row: any): Tour => ({
  id: row.id,
  slug: row.slug || row.id,
  title: row.title,
  category: row.category,
  categoryLabel: row.category_label,
  location: row.location,
  duration: row.duration,
  priceAdult: Number(row.price_adult),
  priceChild: Number(row.price_child),
  childAgeInfo: row.child_age_info,

  // Логика расписания и вместимости
  daysOfWeek: row.days_of_week || [0, 1, 2, 3, 4, 5, 6],
  timeSlots: row.time_slots || ['08:00'],
  maxCapacity: Number(row.max_capacity || row.available_seats || 20),

  schedule: row.schedule,
  departureTime: row.departure_time,
  overview: row.overview,
  included: row.included || [],
  excluded: row.excluded || [],
  whatToBring: row.what_to_bring || [],
  availableSeats: Number(row.available_seats || row.max_capacity || 20),
  featured: Boolean(row.featured),
  images: row.images || [],
  options: row.options || []
});

const mapTourToRow = (tour: Tour) => ({
  id: tour.id,
  slug: tour.slug || tour.id,
  title: tour.title,
  category: tour.category,
  category_label: tour.categoryLabel,
  location: tour.location,
  duration: tour.duration,
  price_adult: tour.priceAdult,
  price_child: tour.priceChild,
  child_age_info: tour.childAgeInfo,

  // Логика расписания и вместимости
  days_of_week: tour.daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
  time_slots: tour.timeSlots || ['08:00'],
  max_capacity: tour.maxCapacity || tour.availableSeats || 20,

  schedule: tour.schedule,
  departure_time: tour.departureTime,
  overview: tour.overview,
  included: tour.included,
  excluded: tour.excluded || [],
  what_to_bring: tour.whatToBring || [],
  available_seats: tour.availableSeats || tour.maxCapacity || 20,
  featured: tour.featured || false,
  images: tour.images || [],
  options: tour.options || []
});

export const tourService = {
  // Получение туров (с авто-заполнением базы при первом старте)
  async getTours(): Promise<Tour[]> {
    try {
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .order('created_at', { ascending: true });

      if (error || !data || data.length === 0) {
        const rowsToInsert = TOURS_DATA.map(mapTourToRow);
        await supabase.from('tours').insert(rowsToInsert);
        return TOURS_DATA;
      }

      return data.map(mapRowToTour);
    } catch (err) {
      console.warn('Ошибка загрузки туров из Supabase, используем локальные:', err);
      return TOURS_DATA;
    }
  },

  // Создание или обновление экскурсии
  async saveTour(tour: Tour): Promise<boolean> {
    try {
      const row = mapTourToRow(tour);
      const { error } = await supabase.from('tours').upsert(row);
      return !error;
    } catch (err) {
      console.error('Ошибка сохранения тура:', err);
      return false;
    }
  },

  // Удаление экскурсии
  async deleteTour(tourId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('tours').delete().eq('id', tourId);
      return !error;
    } catch (err) {
      console.error('Ошибка удаления тура:', err);
      return false;
    }
  },

  // Быстрое списание / добавление мест
  async updateSeats(tourId: string, seats: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tours')
        .update({ available_seats: seats })
        .eq('id', tourId);
      return !error;
    } catch (err) {
      console.error('Ошибка обновления мест:', err);
      return false;
    }
  },

  // Динамический расчет свободных мест на конкретную дату и рейс
  async getSeatsForSlot(
    tourId: string,
    dateStr: string,
    timeSlot: string,
    maxCapacity: number
  ): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('guests')
        .eq('tour_id', tourId)
        .eq('tour_date', dateStr)
        .neq('status', 'cancelled');

      if (error || !data) return maxCapacity;

      // Суммируем гостей из всех оформленных заказов на этот день
      const totalBooked = data.reduce((sum, order) => {
        const adultMatch = order.guests?.match(/(\d+)\s*взр/);
        const childMatch = order.guests?.match(/(\d+)\s*дет/);
        const adults = adultMatch ? parseInt(adultMatch[1], 10) : 1;
        const kids = childMatch ? parseInt(childMatch[1], 10) : 0;
        return sum + adults + kids;
      }, 0);

      return Math.max(0, maxCapacity - totalBooked);
    } catch (err) {
      console.error('Ошибка подсчета свободных мест:', err);
      return maxCapacity;
    }
  }
};