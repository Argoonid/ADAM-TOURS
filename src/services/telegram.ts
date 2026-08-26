import QRCode from 'qrcode';

const TELEGRAM_BOT_TOKEN = '8553491781:AAEfADkl8ssgDZcqb7tW2T9ww7FCq7nNLVk';
const TELEGRAM_CHAT_ID = '-1004414245980';

export interface BookingData {
  bookingId: string;
  tourTitle: string;
  date: string;
  time?: string;
  adults: number;
  adultAges: number[];
  childrenCount: number;
  childAges: number[];
  preferredLang: string;
  contactMethod: string;
  paymentMethod: string;
  name: string;
  phone: string;
  email?: string;
  hotel: string;
  notes?: string;
  selectedOptions?: string[];
  totalPrice: number;
}

export const generateVoucherBlob = async (data: BookingData): Promise<Blob | null> => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const scale = 2;
    const w = 620;
    const h = 880;
    canvas.width = w * scale;
    canvas.height = h * scale;
    ctx.scale(scale, scale);

    // 1. Фон
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, 24);
    ctx.fill();

    // 2. Шапка
    ctx.fillStyle = '#07111e';
    ctx.beginPath();
    ctx.roundRect(0, 0, w, 100, [24, 24, 0, 0]);
    ctx.fill();

    const grad = ctx.createLinearGradient(24, 24, 68, 68);
    grad.addColorStop(0, '#f5d77f');
    grad.addColorStop(1, '#d4af37');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(24, 24, 52, 52, 14);
    ctx.fill();

    ctx.fillStyle = '#07111e';
    ctx.font = '900 26px sans-serif';
    ctx.fillText('S', 40, 60);

    ctx.fillStyle = '#f5d77f';
    ctx.font = '900 17px sans-serif';
    ctx.fillText('SHARM & ADAM TOURS', 88, 46);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 10px sans-serif';
    ctx.fillText('OFFICIAL EXCURSION VOUCHER', 88, 64);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 10px sans-serif';
    ctx.fillText('НОМЕР БИЛЕТА', w - 24, 44);
    ctx.fillStyle = '#f5d77f';
    ctx.font = '900 18px monospace';
    ctx.fillText(`#${data.bookingId}`, w - 24, 66);
    ctx.textAlign = 'left';

    // 3. Статус
    ctx.fillStyle = '#fffbeb';
    ctx.fillRect(0, 100, w, 44);
    ctx.fillStyle = '#92400e';
    ctx.font = '700 12px sans-serif';
    ctx.fillText('⏳ Бронь подтверждается менеджером в Telegram', 24, 127);

    // 4. Тур
    ctx.fillStyle = '#94a3b8';
    ctx.font = '800 11px sans-serif';
    ctx.fillText('ЭКСКУРСИЯ', 24, 172);

    ctx.fillStyle = '#0f172a';
    ctx.font = '900 20px sans-serif';

    const words = data.tourTitle.split(' ');
    let line = '';
    let currentY = 198;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > w - 48 && n > 0) {
        ctx.fillText(line, 24, currentY);
        line = words[n] + ' ';
        currentY += 24;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 24, currentY);

    // 5. Параметры
    const gridY = currentY + 28;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 11px sans-serif';
    ctx.fillText('📅 Дата выезда', 24, gridY);
    ctx.fillText('⏰ Время трансфера', 280, gridY);

    ctx.fillStyle = '#0f172a';
    ctx.font = '900 14px sans-serif';
    ctx.fillText(data.date, 24, gridY + 20);
    ctx.fillText(data.time || '08:00', 280, gridY + 20);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 11px sans-serif';
    ctx.fillText('🏨 Отель / Сбор', 24, gridY + 54);
    ctx.fillText('👥 Гости', 280, gridY + 54);

    ctx.fillStyle = '#0f172a';
    ctx.font = '700 13px sans-serif';
    ctx.fillText(data.hotel || 'Уточняется в заказе', 24, gridY + 74);
    const childText = data.childrenCount > 0 ? `, ${data.childrenCount} дет.` : '';
    ctx.fillText(`${data.adults} взр.${childText}`, 280, gridY + 74);

    // 6. Контакты туриста
    const clientBoxY = gridY + 102;
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(24, clientBoxY, w - 48, 64, 14);
    ctx.fill();

    ctx.fillStyle = '#64748b';
    ctx.font = '600 11px sans-serif';
    ctx.fillText('Главный турист:', 38, clientBoxY + 26);
    ctx.fillText('Телефон / Связь:', 38, clientBoxY + 48);

    ctx.fillStyle = '#0f172a';
    ctx.font = '800 12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(data.name, w - 38, clientBoxY + 26);
    ctx.fillText(`${data.phone} (${data.contactMethod})`, w - 38, clientBoxY + 48);
    ctx.textAlign = 'left';

    // 7. Перфорация
    const perfY = clientBoxY + 88;
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(24, perfY);
    ctx.lineTo(w - 24, perfY);
    ctx.stroke();
    ctx.setLineDash([]);

    // 8. Итог
    const bottomY = perfY + 34;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '800 10px sans-serif';
    ctx.fillText('К ОПЛАТЕ ГИДУ ПРИ ПОСАДКЕ:', 24, bottomY);

    ctx.fillStyle = '#0f172a';
    ctx.font = '900 34px sans-serif';
    ctx.fillText(`$${data.totalPrice}`, 24, bottomY + 36);

    ctx.fillStyle = '#fffbeb';
    ctx.beginPath();
    ctx.roundRect(24, bottomY + 54, 200, 26, 8);
    ctx.fill();
    ctx.fillStyle = '#92400e';
    ctx.font = '800 11px sans-serif';
    ctx.fillText('🟡 Наличными в автобусе', 34, bottomY + 71);

    // 9. QR-код
    const qrPayload = JSON.stringify({
      ticket: data.bookingId,
      name: data.name,
      tour: data.tourTitle,
      date: data.date,
      hotel: data.hotel || 'N/A',
      guests: `${data.adults}A + ${data.childrenCount}C`,
      price: data.totalPrice,
    });

    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      margin: 1,
      width: 240,
      color: {
        dark: '#07111e',
        light: '#ffffff',
      },
    });

    const qrImg = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = qrDataUrl;
    });

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#07111e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(w - 156, bottomY - 10, 132, 136, 16);
    ctx.fill();
    ctx.stroke();

    ctx.drawImage(qrImg, w - 146, bottomY, 112, 112);

    ctx.fillStyle = '#64748b';
    ctx.font = '800 8.5px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('СКАН ДЛЯ ГИДА', w - 90, bottomY + 120);
    ctx.textAlign = 'left';

    // 10. Подвал
    ctx.fillStyle = '#64748b';
    ctx.font = '600 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SHARM & ADAM TOURS • Sharm El Sheikh • Telegram Support', w / 2, h - 20);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  } catch (err) {
    console.error('Ошибка создания графического ваучера:', err);
    return null;
  }
};

export const sendBookingToTelegram = async (data: BookingData): Promise<boolean> => {
  const optionsText = data.selectedOptions && data.selectedOptions.length > 0 
    ? `\n🧩 <b>Опции:</b> ${data.selectedOptions.join(', ')}` 
    : '';

  const childText = data.childrenCount > 0 
    ? ` (${data.childAges.map(a => `${a} л`).join(', ')})` 
    : '';

  const notesText = data.notes && data.notes.trim() 
    ? `\n📝 <b>Примечание:</b> ${data.notes.trim()}` 
    : '';

  const caption = `
🎟 <b>ПОСАДОЧНЫЙ ВАУЧЕР #${data.bookingId}</b>
🏛 <b>SHARM & ADAM TOURS EGYPT</b>
⚠️ <b>Статус:</b> ⏳ Ожидает подтверждения (TTL: 24h)

📍 <b>Экскурсия:</b> ${data.tourTitle}
📅 <b>Дата выезда:</b> ${data.date} (${data.time || '08:00'})
🏨 <b>Отель / Сбор:</b> ${data.hotel || 'Не указан'}
👥 <b>Гости:</b> ${data.adults} взр.${data.childrenCount > 0 ? `, ${data.childrenCount} дет.${childText}` : ''}

👤 <b>Главный турист:</b> ${data.name}
📞 <b>Телефон / Контакт:</b> <code>${data.phone}</code> (${data.contactMethod})
💵 <b>К ОПЛАТЕ ГИДУ:</b> <b>$${data.totalPrice}</b> (Наличными в автобусе)
${optionsText}${notesText}
───
📲 <i>Графический билет с QR-кодом прикреплен выше.</i>
  `.trim();

  try {
    const voucherBlob = await generateVoucherBlob(data);

    if (voucherBlob) {
      const formData = new FormData();
      formData.append('chat_id', TELEGRAM_CHAT_ID);
      formData.append('photo', voucherBlob, `voucher-${data.bookingId}.png`);
      formData.append('caption', caption);
      formData.append('parse_mode', 'HTML');

      const photoRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        body: formData,
      });

      if (photoRes.ok) return true;
    }

    const textRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: caption,
        parse_mode: 'HTML',
      }),
    });

    return textRes.ok;
  } catch (error) {
    console.error('Ошибка отправки в Telegram:', error);
    return false;
  }
};