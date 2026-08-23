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

// Загрузка QR-кода как Image для отрисовки на Canvas
const loadQrImage = (bookingId: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Не удалось загрузить QR-код'));
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(bookingId)}`;
  });
};

// Генерация точной графической копии ваучера (Фото 1)
export const generateVoucherBlob = async (data: BookingData): Promise<Blob | null> => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const scale = 2; // Высокое разрешение (Retina)
    const w = 620;
    const h = 880;
    canvas.width = w * scale;
    canvas.height = h * scale;
    ctx.scale(scale, scale);

    // Фоновая карточка ваучера
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, 28);
    ctx.fill();

    // 1. Верхний темный блок
    ctx.fillStyle = '#07111e';
    ctx.beginPath();
    ctx.roundRect(0, 0, w, 100, [28, 28, 0, 0]);
    ctx.fill();

    // Круглый логотип "S"
    const grad = ctx.createLinearGradient(24, 24, 68, 68);
    grad.addColorStop(0, '#f5d77f');
    grad.addColorStop(1, '#d4af37');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(24, 24, 50, 50, 16);
    ctx.fill();

    ctx.fillStyle = '#07111e';
    ctx.font = '900 24px sans-serif';
    ctx.fillText('S', 40, 58);

    // Название компании
    ctx.fillStyle = '#f5d77f';
    ctx.font = '900 17px sans-serif';
    ctx.fillText('SHARM & ADAM TOURS', 86, 46);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 10px sans-serif';
    ctx.fillText('OFFICIAL EXCURSION VOUCHER', 86, 62);

    // Номер билета справа
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 10px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('НОМЕР БИЛЕТА', w - 24, 44);
    ctx.fillStyle = '#f5d77f';
    ctx.font = '900 18px monospace';
    ctx.fillText(`#${data.bookingId}`, w - 24, 66);
    ctx.textAlign = 'left';

    // 2. Плашка статуса (Ожидает паспорта)
    ctx.fillStyle = '#fffbeb';
    ctx.fillRect(0, 100, w, 44);
    ctx.strokeStyle = '#fef3c7';
    ctx.strokeRect(0, 100, w, 44);

    ctx.fillStyle = '#92400e';
    ctx.font = '700 12px sans-serif';
    ctx.fillText('📞 Ожидает подтверждения паспорта менеджером', 24, 127);

    // TTL бейдж
    ctx.strokeStyle = '#b45309';
    ctx.beginPath();
    ctx.roundRect(w - 90, 112, 66, 20, 6);
    ctx.stroke();
    ctx.font = '800 10px monospace';
    ctx.fillText('TTL: 24H', w - 80, 126);

    // 3. Название экскурсии
    ctx.fillStyle = '#94a3b8';
    ctx.font = '800 11px sans-serif';
    ctx.fillText('ЭКСКУРСИЯ', 24, 172);

    ctx.fillStyle = '#0f172a';
    ctx.font = '900 21px sans-serif';
    
    // Перенос длинного названия тура
    const words = data.tourTitle.split(' ');
    let line = '';
    let currentY = 200;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > w - 48 && n > 0) {
        ctx.fillText(line, 24, currentY);
        line = words[n] + ' ';
        currentY += 26;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 24, currentY);

    // 4. Сетка параметров
    const gridY = currentY + 30;
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
    ctx.fillText(data.hotel || 'Не указан', 24, gridY + 74);
    const childText = data.childrenCount > 0 ? `, ${data.childrenCount} дет.` : '';
    ctx.fillText(`${data.adults} взр.${childText}`, 280, gridY + 74);

    // 5. Блок данных туриста
    const clientBoxY = gridY + 102;
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(24, clientBoxY, w - 48, 68, 16);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '600 11px sans-serif';
    ctx.fillText('Главный турист:', 38, clientBoxY + 26);
    ctx.fillText('Телефон / Связь:', 38, clientBoxY + 52);

    ctx.fillStyle = '#0f172a';
    ctx.font = '800 12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(data.name, w - 38, clientBoxY + 26);
    const emailPart = data.email ? ` (${data.email})` : '';
    ctx.fillText(`${data.phone}${emailPart}`, w - 38, clientBoxY + 52);
    ctx.textAlign = 'left';

    // 6. Перфорированная линия
    const perfY = clientBoxY + 92;
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(24, perfY);
    ctx.lineTo(w - 24, perfY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Боковые вырезы перфорации
    ctx.fillStyle = '#07111e';
    ctx.beginPath();
    ctx.arc(0, perfY, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w, perfY, 12, 0, Math.PI * 2);
    ctx.fill();

    // 7. Нижний блок: Сумма + QR код
    const bottomY = perfY + 36;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '800 10px sans-serif';
    ctx.fillText('К ОПЛАТЕ ГИДУ ПРИ ПОСАДКЕ:', 24, bottomY);

    ctx.fillStyle = '#0f172a';
    ctx.font = '900 34px sans-serif';
    ctx.fillText(`$${data.totalPrice}`, 24, bottomY + 36);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '800 10px sans-serif';
    ctx.fillText('СПОСОБ ОПЛАТЫ:', 24, bottomY + 62);

    // Плашка "Наличными гиду в автобусе"
    ctx.fillStyle = '#fffbeb';
    ctx.beginPath();
    ctx.roundRect(24, bottomY + 70, 180, 26, 8);
    ctx.fill();
    ctx.strokeStyle = '#fde68a';
    ctx.stroke();
    ctx.fillStyle = '#92400e';
    ctx.font = '800 11px sans-serif';
    ctx.fillText('🟡 Наличными в автобусе', 34, bottomY + 87);

    // Отрисовка QR-кода
    const qrImg = await loadQrImage(data.bookingId);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#07111e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(w - 156, bottomY - 10, 132, 132, 16);
    ctx.fill();
    ctx.stroke();
    ctx.drawImage(qrImg, w - 146, bottomY, 112, 112);

    ctx.fillStyle = '#64748b';
    ctx.font = '800 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('СКАН ДЛЯ ГИДА', w - 90, bottomY + 116);
    ctx.textAlign = 'left';

    // 8. Нижняя рамка безопасности
    const secY = bottomY + 124;
    ctx.fillStyle = '#fffbeb';
    ctx.beginPath();
    ctx.roundRect(24, secY, w - 48, 52, 14);
    ctx.fill();
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#92400e';
    ctx.font = '600 10.5px sans-serif';
    ctx.fillText('🛡 Отправьте фото паспорта менеджеру в WhatsApp.', 36, secY + 22);
    ctx.fillText('Будьте у главного въезда в отель (Security Gate) за 10 минут до трансфера.', 36, secY + 38);

    // 9. Подвал
    ctx.fillStyle = '#64748b';
    ctx.font = '600 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SHARM & ADAM TOURS • Sharm El Sheikh • Поддержка в WhatsApp 24/7', w / 2, h - 18);

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

  const emailText = data.email 
    ? `\n📧 <b>Email:</b> <code>${data.email}</code>` 
    : '';

  const caption = `
🎟 <b>ПОСАДОЧНЫЙ ВАУЧЕР #${data.bookingId}</b>
🏛 <b>SHARM & ADAM TOURS EGYPT</b>
⚠️ <b>Статус:</b> ⏳ Ожидает подтверждения паспорта (TTL: 24h)

📍 <b>Экскурсия:</b> ${data.tourTitle}
📅 <b>Дата выезда:</b> ${data.date} (${data.time || '08:00'})
🏨 <b>Отель / Сбор:</b> ${data.hotel || 'Не указан'}
👥 <b>Гости:</b> ${data.adults} взр.${data.childrenCount > 0 ? `, ${data.childrenCount} дет.${childText}` : ''}

👤 <b>Главный турист:</b> ${data.name}
📞 <b>Телефон / WA:</b> <code>${data.phone}</code> (${data.contactMethod})${emailText}
💵 <b>К ОПЛАТЕ ГИДУ:</b> <b>$${data.totalPrice}</b> (Наличными в автобусе)
${optionsText}${notesText}
───
📲 <i>Графический ваучер сгенерирован и прикреплен выше. Свяжитесь с клиентом в WhatsApp для получения фото паспорта.</i>
  `.trim();

  try {
    // 1. Генерация PNG-изображения ваучера (Фото 1)
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

    // 2. Fallback на текстовое сообщение, если отрисовка фото не удалась
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