// Reminder Service Worker
// Bu service worker, hatırlatıcıları kontrol eder ve zamanı geldiğinde bildirim gönderir

const CACHE_NAME = 'esports-matches-reminder-cache-v1';

// Service Worker kurulumu
self.addEventListener('install', (event) => {
  console.log('Reminder Service Worker installing...');
  self.skipWaiting(); // Hemen aktif hale getir
});

// Service Worker aktifleştirilmesi
self.addEventListener('activate', (event) => {
  console.log('Reminder Service Worker activating...');
  
  // Eski önbellekleri temizle
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Tüm istemcilerde hemen kontrol almak için
  event.waitUntil(self.clients.claim());
});

// Hatırlatıcı kontrolü için periyodik senkronizasyon
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-reminders') {
    event.waitUntil(checkReminders());
  }
});

// Mesaj alındığında (örn. yeni hatırlatıcı eklendiğinde)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_REMINDERS') {
    checkReminders();
  }
});

// Bildirime tıklandığında
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;
  const matchId = notification.data?.matchId;
  
  notification.close();
  
  // Kullanıcıyı ilgili maç sayfasına yönlendir
  if (matchId) {
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clientList) => {
        // Açık bir pencere varsa, onu kullan
        for (const client of clientList) {
          if (client.url.includes('/matches/') && 'focus' in client) {
            return client.focus();
          }
        }
        // Yoksa yeni bir pencere aç
        if (self.clients.openWindow) {
          return self.clients.openWindow(`/matches/${matchId}`);
        }
      })
    );
  }
});

// Hatırlatıcıları kontrol et
async function checkReminders() {
  try {
    // LocalStorage'a doğrudan erişemediğimiz için istemciden veri almamız gerekiyor
    const clients = await self.clients.matchAll();
    
    if (clients.length === 0) {
      console.log('No active clients to check reminders');
      return;
    }
    
    // İlk istemciden hatırlatıcıları iste
    const client = clients[0];
    const messageChannel = new MessageChannel();
    
    // Yanıt için promise oluştur
    const reminderDataPromise = new Promise((resolve) => {
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };
    });
    
    // İstemciye mesaj gönder
    client.postMessage({ type: 'GET_REMINDERS' }, [messageChannel.port2]);
    
    // Yanıtı bekle
    const reminderData = await reminderDataPromise;
    
    if (!reminderData || !reminderData.reminders || !Array.isArray(reminderData.reminders)) {
      console.log('No valid reminder data received');
      return;
    }
    
    const reminders = reminderData.reminders;
    const now = new Date();
    
    // Zamanı gelen hatırlatıcıları kontrol et
    reminders.forEach((reminder) => {
      if (!reminder.matchDate || !reminder.reminderTime) return;
      
      const matchDate = new Date(reminder.matchDate);
      const reminderDate = new Date(matchDate.getTime() - reminder.reminderTime * 60000);
      
      // Şu an hatırlatma zamanı geldiyse ve daha önce bildirim gönderilmediyse
      if (now >= reminderDate && now < matchDate && !reminder.notified) {
        // Bildirim gönder
        self.registration.showNotification('Maç Hatırlatıcısı', {
          body: reminder.message || 'Maç başlamak üzere!',
          icon: '/logo.png',
          badge: '/badge.png',
          data: {
            matchId: reminder.id.replace('match_', ''),
            url: '/'
          },
          actions: [
            {
              action: 'view',
              title: 'Maçı Görüntüle'
            }
          ],
          vibrate: [200, 100, 200],
          requireInteraction: true
        });
        
        // Hatırlatıcıyı bildirildi olarak işaretle
        reminder.notified = true;
        
        // İstemciye güncellenmiş hatırlatıcıları gönder
        client.postMessage({
          type: 'UPDATE_REMINDERS',
          reminders: reminders
        });
      }
    });
    
  } catch (error) {
    console.error('Error checking reminders:', error);
  }
}

// Arka planda periyodik olarak hatırlatıcıları kontrol et (15 dakikada bir)
setInterval(() => {
  checkReminders();
}, 15 * 60 * 1000);

// İlk çalıştırmada da kontrol et
checkReminders(); 