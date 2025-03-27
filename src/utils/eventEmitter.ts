// Basit bir event emitter oluşturuyoruz
type EventCallback = (...args: any[]) => void;

class EventEmitter {
  private events: Record<string, EventCallback[]> = {};

  // Event dinleyici eklee
  on(event: string, callback: EventCallback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    
    // Cleanup fonksiyonu döndür
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    };
  }

  // Event tetikle
  emit(event: string, ...args: any[]) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(...args));
    }
  }
}

// Singleton olarak export et
export const eventEmitter = new EventEmitter(); 