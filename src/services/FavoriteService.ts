/**
 * Favori maçları yönetmek için servis
 * LocalStorage kullanarak favorileri kaydeder, günceller ve yönetir
 */
class FavoriteService {
  private static instance: FavoriteService;
  private storageKey: string = 'favorite_matches';
  private favorites: number[] = [];

  private constructor() {
    // Singleton pattern
    this.loadFavoritesFromStorage();
  }

  public static getInstance(): FavoriteService {
    if (!FavoriteService.instance) {
      FavoriteService.instance = new FavoriteService();
    }
    return FavoriteService.instance;
  }

  /**
   * LocalStorage'dan favorileri yükle
   */
  private loadFavoritesFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const savedFavorites = localStorage.getItem(this.storageKey);
        this.favorites = savedFavorites ? JSON.parse(savedFavorites) : [];
        console.log('Favoriler yüklendi:', this.favorites);
      } catch (error) {
        console.error('Favoriler yüklenirken hata:', error);
        this.favorites = [];
      }
    }
  }

  /**
   * Tüm favori maçları getirir
   * @returns Favori maç ID'lerinin dizisi
   */
  public getFavorites(): number[] {
    if (typeof window === 'undefined') return [];
    
    // Her istekte localStorage'dan güncel veriyi al
    const savedFavorites = localStorage.getItem(this.storageKey);
    
    try {
      // Eğer localStorage'dan gelen veri geçerliyse güncelle
      if (savedFavorites) {
        this.favorites = JSON.parse(savedFavorites);
      }
    } catch (error) {
      console.error('Favoriler parse edilirken hata:', error);
    }
    
    return [...this.favorites]; // Kopya dön
  }

  /**
   * Bir maçı favorilere ekler
   * @param matchId Eklenecek maç ID'si
   */
  public addFavorite(matchId: number): void {
    if (typeof window === 'undefined') return;
    
    // Önce güncel listeyi al
    this.loadFavoritesFromStorage();
    
    if (!this.favorites.includes(matchId)) {
      this.favorites.push(matchId);
      localStorage.setItem(this.storageKey, JSON.stringify(this.favorites));
      this.notifyFavoritesChange();
      console.log(`Maç eklendi: ${matchId}, Yeni liste:`, this.favorites);
    }
  }

  /**
   * Bir maçı favorilerden çıkarır
   * @param matchId Çıkarılacak maç ID'si
   */
  public removeFavorite(matchId: number): void {
    if (typeof window === 'undefined') return;
    
    // Önce güncel listeyi al
    this.loadFavoritesFromStorage();
    
    const updatedFavorites = this.favorites.filter(id => id !== matchId);
    
    if (this.favorites.length !== updatedFavorites.length) {
      this.favorites = updatedFavorites;
      localStorage.setItem(this.storageKey, JSON.stringify(this.favorites));
      this.notifyFavoritesChange();
      console.log(`Maç çıkarıldı: ${matchId}, Yeni liste:`, this.favorites);
    }
  }

  /**
   * Bir maçın favori olup olmadığını kontrol eder
   * @param matchId Kontrol edilecek maç ID'si
   * @returns Eğer maç favorilerdeyse true, değilse false
   */
  public isFavorite(matchId: number): boolean {
    // Güncel listeyi al
    this.loadFavoritesFromStorage();
    
    return this.favorites.includes(matchId);
  }

  /**
   * Favori listesinin değiştiğini dinleyicilere bildirir
   * Custom event kullanarak diğer bileşenlerin değişiklikleri takip etmesini sağlar
   */
  private notifyFavoritesChange(): void {
    if (typeof window === 'undefined') return;
    
    const event = new CustomEvent('favoritesChanged', {
      detail: { favorites: [...this.favorites] }
    });
    window.dispatchEvent(event);
  }

  /**
   * Tüm favorileri temizler
   */
  public clearAllFavorites(): void {
    if (typeof window === 'undefined') return;
    
    // Favoriler listesini boşalt
    this.favorites = [];
    // LocalStorage'dan favori verilerini sil
    localStorage.removeItem(this.storageKey);
    // Değişikliği bildir
    this.notifyFavoritesChange();
    console.log('Tüm favoriler temizlendi');
  }
}

export default FavoriteService; 