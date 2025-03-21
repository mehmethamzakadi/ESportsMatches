// Reminder Service Worker
// Bu service worker, hatırlatıcıları kontrol eder ve zamanı geldiğinde bildirim gönderir

const CACHE_NAME = 'esports-matches-reminder-cache-v1';

// Service Worker kurulumu
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('reminders-cache').then((cache) => {
      return cache.addAll([
        '/'
      ]);
    })
  );
});

// Service Worker aktivasyonu
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => {
          return cacheName !== 'reminders-cache';
        }).map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// Hatırlatıcılar için veritabanı
let reminders = [];

// Yeni hatırlatıcılar eklemek veya var olanları güncellemek için
function addOrUpdateReminder(reminder) {
  const index = reminders.findIndex(r => r.id === reminder.id);
  
  if (index === -1) {
    // Yeni hatırlatıcı ekle
    reminders.push(reminder);
  } else {
    // Mevcut hatırlatıcıyı güncelle
    reminders[index] = reminder;
  }
}

// Hatırlatıcıyı silmek için
function removeReminder(reminderId) {
  reminders = reminders.filter(r => r.id !== reminderId);
}

// Zamanı gelmiş hatırlatıcıları kontrol et
function checkReminders() {
  const now = new Date().getTime();
  
  reminders.forEach(reminder => {
    if (!reminder.notificationSent && now >= reminder.triggerTime) {
      // Zamanı gelmiş, bildirim gönder
      sendNotification(reminder);
      
      // Durumu güncelle
      reminder.notificationSent = true;
      
      // E-posta göndermek için client'a mesaj gönder
      sendEmailIfNeeded(reminder);
    }
  });
}

// Bildirim gönder
function sendNotification(reminder) {
  self.registration.showNotification('Maç Hatırlatıcı', {
    body: reminder.message || 'Maç başlamak üzere!',
    icon: '/images/logo.png',
    data: { url: reminder.url || '/' }
  });
}

// Tüm istemcilere e-posta gönderilmesi gerektiğini bildir
async function sendEmailIfNeeded(reminder) {
  // E-posta hatırlatıcısı mı kontrol et
  if (!reminder.email) {
    return;
  }
  
  // Tüm aktif clientları al
  const clients = await self.clients.matchAll({ type: 'window' });
  
  if (clients.length === 0) {
    return;
  }
  
  // E-posta gönderme isteğini client'a gönder
  clients[0].postMessage({
    type: 'SEND_EMAIL_REMINDER',
    reminder: reminder
  });
}

// Periyodik hatırlatıcı kontrolü (15 dakikada bir)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'reminder-sync') {
    event.waitUntil(checkReminders());
  }
});

// Client'dan gelen mesajları dinle
self.addEventListener('message', (event) => {
  const message = event.data;
  
  if (!message || !message.type) {
    return;
  }
  
  switch(message.type) {
    case 'ADD_REMINDER':
      if (message.data) {
        addOrUpdateReminder(message.data);
      }
      break;
      
    case 'REMOVE_REMINDER':
      if (message.data && message.data.id) {
        removeReminder(message.data.id);
      }
      break;
      
    case 'CHECK_REMINDERS':
      checkReminders();
      break;
      
    case 'GET_REMINDERS':
      // Port üzerinden yanıt ver
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ reminders: reminders });
      }
      break;
  }
});

// Bildirime tıklanınca
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Service Worker 24 saatte bir çalıştırılacak
setInterval(checkReminders, 86400000); 