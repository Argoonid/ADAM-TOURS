import { supabase } from './supabase';
import { TOURS_DATA } from '../data/tours';
import type { Tour } from '../data/tours';

function parseGuests(guestsStr?: string): number {
  if (!guestsStr) return 1;
  const adultMatch = guestsStr.match(/(\d+)\s*взр/);
  const childMatch = guestsStr.match(/(\d+)\s*дет/);
  const adults = adultMatch ? parseInt(adultMatch[1], 10) : 1;
  const kids = childMatch ? parseInt(childMatch[1], 10) : 0;
  return adults + kids;
}

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

  daysOfWeek: row.days_of_week && Array.isArray(row.days_of_week) ? row.days_of_week : [0, 1, 2, 3, 4, 5, 6],
  timeSlots: row.time_slots && Array.isArray(row.time_slots) ? row.time_slots : ['08:00'],
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
  async getTours(): Promise<Tour[]> {
    try {
      const localCustomTours: Tour[] = JSON.parse(localStorage.getItem('elina_custom_tours') || '[]');

      if (navigator.onLine) {
        const { data, error } = await supabase
          .from('tours')
          .select('*')
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map(mapRowToTour);
        }

        if (data && data.length === 0) {
          const rowsToInsert = TOURS_DATA.map(mapTourToRow);
          await supabase.from('tours').insert(rowsToInsert);
          return TOURS_DATA;
        }
      }

      if (localCustomTours.length > 0) {
        return localCustomTours;
      }

      return TOURS_DATA;
    } catch (err) {
      console.warn('Fallback к статичным турам:', err);
      return TOURS_DATA;
    }
  },

  async saveTour(tour: Tour): Promise<boolean> {
    try {
      const localCustomTours: Tour[] = JSON.parse(localStorage.getItem('elina_custom_tours') || '[]');
      const existingIdx = localCustomTours.findIndex(t => t.id === tour.id);

      if (existingIdx >= 0) {
        localCustomTours[existingIdx] = tour;
      } else {
        localCustomTours.unshift(tour);
      }

      localStorage.setItem('elina_custom_tours', JSON.stringify(localCustomTours));
      window.dispatchEvent(new CustomEvent('elina_tours_updated'));

      if (navigator.onLine) {
        const row = mapTourToRow(tour);
        const { error } = await supabase.from('tours').upsert(row);
        if (error) console.warn('Supabase tour upsert error:', error);
      }

      return true;
    } catch (err) {
      console.error('Ошибка сохранения тура:', err);
      return false;
    }
  },

  async deleteTour(tourId: string): Promise<boolean> {
    try {
      const localCustomTours: Tour[] = JSON.parse(localStorage.getItem('elina_custom_tours') || '[]');
      const filtered = localCustomTours.filter(t => t.id !== tourId);
      localStorage.setItem('elina_custom_tours', JSON.stringify(filtered));
      window.dispatchEvent(new CustomEvent('elina_tours_updated'));

      if (navigator.onLine) {
        await supabase.from('tours').delete().eq('id', tourId);
      }
      return true;
    } catch (err) {
      console.error('Ошибка удаления тура:', err);
      return false;
    }
  },

  async updateSeats(tourId: string, seats: number): Promise<boolean> {
    try {
      if (navigator.onLine) {
        await supabase
          .from('tours')
          .update({ available_seats: seats })
          .eq('id', tourId);
      }
      return true;
    } catch (err) {
      console.error('Ошибка обновления мест:', err);
      return false;
    }
  },

  // Изолированный подсчет мест под конкретный рейс и дату
  async getSeatsForSlot(
    tourId: string,
    dateStr: string,
    timeSlot: string,
    maxCapacity: number
  ): Promise<number> {
    try {
      let totalBooked = 0;
      const excludedStatuses = ['cancelled', 'cancelled_by_client', 'unconfirmed_failed', 'no_show'];

      // 1. Проверяем Supabase при наличии сети
      if (navigator.onLine) {
        try {
          const { data, error } = await supabase
            .from('orders')
            .select('guests, status, departure_time, notes')
            .eq('tour_id', tourId)
            .eq('tour_date', dateStr);

          if (!error && data) {
            data.forEach((order: any) => {
              if (excludedStatuses.includes(order.status)) return;

              // Проверяем соответствие времени выезда
              const ordTime = order.departure_time || order.notes?.match(/(\d{2}:\d{2})/)?.[1];
              if (!ordTime || ordTime === timeSlot) {
                totalBooked += parseGuests(order.guests);
              }
            });

            return Math.max(0, maxCapacity - totalBooked);
          }
        } catch (e) {
          console.warn('Supabase slot check fallback to localStorage:', e);
        }
      }

      // 2. Локальный резерв (LocalStorage)
      const localOrders = JSON.parse(localStorage.getItem('elina_orders_data') || '[]');
      localOrders.forEach((order: any) => {
        if (order.tourId === tourId || order.tour_id === tourId || order.id?.startsWith('SA-')) {
          if (excludedStatuses.includes(order.status)) return;

          const dateMatches = order.tour_date === dateStr || order.date?.includes(dateStr);
          const timeMatches = !order.departureTime || order.departureTime === timeSlot;

          if (dateMatches && timeMatches) {
            totalBooked += parseGuests(order.guests);
          }
        }
      });

      return Math.max(0, maxCapacity - totalBooked);
    } catch (err) {
      console.error('Ошибка подсчета мест слота:', err);
      return maxCapacity;
    }
  }
};