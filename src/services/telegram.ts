// Токен бота и ID чата менеджера
const TELEGRAM_BOT_TOKEN = '8553491781:AAEfADkl8ssgDZcqb7tW2T9ww7FCq7nNLVk';
const TELEGRAM_CHAT_ID = '1261138294';

export interface BookingData {
  bookingId: string;
  tourTitle: string;
  date: string;
  time: string;
  adults: number;
  adultAges: number[];
  childrenCount: number;
  childAges: number[];
  preferredLang: string;
  contactMethod: string;
  paymentMethod: string;
  name: string;
  phone: string;
  hotel: string;
  notes: string;
  selectedOptions: string[];
  totalPrice: number;
}

export const sendBookingToTelegram = async (data: BookingData): Promise<boolean> => {
  const optionsText = data.selectedOptions.length > 0 
    ? `\n🧩 <b>Доп. опции:</b> ${data.selectedOptions.join(', ')}` 
    : '';

  const childText = data.childrenCount > 0 
    ? `\n  • Дети (${data.childrenCount}): ${data.childAges.map(a => `${a} лет`).join(', ')}` 
    : '';

  const notesText = data.notes.trim() 
    ? `\n📝 <b>Примечание:</b> ${data.notes}` 
    : '';

  // Форматированное сообщение с HTML-тегами
  const message = `
🔥 <b>НОВАЯ ЗАЯВКА #${data.bookingId}</b>

📍 <b>Экскурсия:</b> ${data.tourTitle}
📅 <b>Дата:</b> ${data.date} (${data.time})
💳 <b>Оплата:</b> ${data.paymentMethod} (<b>$${data.totalPrice}</b>)

👥 <b>Состав гостей (${data.adults + data.childrenCount} чел):</b>
  • Взрослые (${data.adults}): ${data.adultAges.map(a => `${a} лет`).join(', ')}${childText}
🗣 <b>Язык общения:</b> ${data.preferredLang}

👤 <b>Имя:</b> ${data.name}
📞 <b>Контакт:</b> <code>${data.phone}</code> (Предпочтение: ${data.contactMethod})
🏨 <b>Отель:</b> ${data.hotel || 'Не указан'}${optionsText}${notesText}

───
🌐 <i>Заявка с сайта elinatoursegypt.com</i>
  `.trim();

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Ошибка отправки в Telegram:', error);
    return false;
  }
};