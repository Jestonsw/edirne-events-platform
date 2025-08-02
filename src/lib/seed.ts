import { db } from './db'
import { categories, events } from './schema'

const seedCategories = [
  { name: 'all', displayName: 'Tümü', color: '#6B7280', icon: 'grid' },
  { name: 'concert', displayName: 'Konser/Festival', color: '#8B5CF6', icon: 'music' },
  { name: 'theater', displayName: 'Tiyatro', color: '#EF4444', icon: 'mask' },
  { name: 'festival', displayName: 'Festival', color: '#F59E0B', icon: 'party' },
  { name: 'exhibition', displayName: 'Sergi', color: '#10B981', icon: 'frame' },
  { name: 'workshop', displayName: 'Atölye', color: '#3B82F6', icon: 'tools' },
  { name: 'sports', displayName: 'Spor', color: '#059669', icon: 'trophy' },
  { name: 'conference', displayName: 'Konferans', color: '#7C3AED', icon: 'presentation' },
  { name: 'cinema', displayName: 'Sinema', color: '#DC2626', icon: 'film' },
  { name: 'kids', displayName: 'Çocuk', color: '#F97316', icon: 'baby' },
  { name: 'food', displayName: 'Yemek', color: '#EA580C', icon: 'utensils' },
  { name: 'art', displayName: 'Sanat', color: '#DB2777', icon: 'palette' },
]

const seedEvents = [
  {
    title: 'Edirne Kültür Festivali 2024',
    description: 'Edirne\'nin zengin kültürel mirasını kutlayan büyük festival. Müzik, dans, yemek ve sanat etkinlikleri bir arada.',
    startDate: new Date('2024-07-15'),
    endDate: new Date('2024-07-17'),
    startTime: '19:00',
    endTime: '23:00',
    location: 'Selimiye Camii Avlusu',
    address: 'Meydan Mahallesi, Mimar Sinan Caddesi, Edirne Merkez',
    organizerName: 'Edirne Belediyesi',
    organizerContact: 'kultur@edirne.bel.tr',
    categoryId: 4, // festival
    price: 'Ücretsiz',
    capacity: 5000,
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    tags: '["kültür", "festival", "müzik", "dans", "sanat"]',
    participantType: 'Tüm yaş grupları',
    isFeatured: true,
  },
  {
    title: 'Shakespeare: Hamlet',
    description: 'William Shakespeare\'in ünlü eseri Hamlet\'in modern yorumu. Edirne Belediye Tiyatrosu oyuncuları ile.',
    startDate: new Date('2024-07-20'),
    startTime: '20:00',
    endTime: '22:30',
    location: 'Edirne Belediye Tiyatrosu',
    address: 'Fatih Mahallesi, Tiyatro Sokak No:12, Edirne',
    organizerName: 'Edirne Belediye Tiyatrosu',
    organizerContact: 'tiyatro@edirne.bel.tr',
    categoryId: 3, // theater
    price: '50 TL',
    capacity: 200,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    tags: '["tiyatro", "shakespeare", "drama", "klasik"]',
    participantType: '16 yaş ve üzeri',
    isFeatured: true,
  },
  {
    title: 'Çocuklar İçin Müzik Atölyesi',
    description: '6-12 yaş arası çocuklar için eğlenceli müzik atölyesi. Çalgı tanıtımı ve mini konser.',
    startDate: new Date('2024-07-12'),
    startTime: '14:00',
    endTime: '16:00',
    location: 'Edirne Kültür Merkezi',
    address: 'Yıldırım Beyazıt Mahallesi, Kültür Caddesi No:45',
    organizerName: 'Kültür ve Turizm Müdürlüğü',
    organizerContact: 'kultur@edirne.gov.tr',
    categoryId: 10, // kids
    price: 'Ücretsiz',
    capacity: 30,
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    tags: '["çocuk", "müzik", "eğitim", "workshop"]',
    participantType: '6-12 yaş',
  },
  {
    title: 'Edirne Fotoğraf Sergisi',
    description: 'Yerel fotoğrafçıların gözünden Edirne\'nin tarihi güzellikleri ve doğal manzaraları.',
    startDate: new Date('2024-07-18'),
    endDate: new Date('2024-08-15'),
    startTime: '09:00',
    endTime: '17:00',
    location: 'Edirne Müze Kompleksi',
    address: 'Sarayiçi, Edirne Sarayı Kalıntıları yanı',
    organizerName: 'Edirne Fotoğraf Derneği',
    organizerContact: 'info@edirnefoto.org',
    categoryId: 5, // exhibition
    price: '15 TL',
    capacity: 100,
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
    tags: '["fotoğraf", "sergi", "sanat", "edirne"]',
    participantType: 'Tüm yaş grupları',
  },
  {
    title: 'Klasik Müzik Konseri',
    description: 'Edirne Devlet Opera ve Bale sanatçılarından klasik müzik ziyafeti. Bach, Mozart ve Chopin eserleri.',
    startDate: new Date('2024-07-25'),
    startTime: '20:30',
    endTime: '22:00',
    location: 'Eski Camii',
    address: 'Saraçlar Caddesi, Eski Camii, Merkez',
    organizerName: 'Devlet Opera ve Balesi',
    organizerContact: 'edirne@dob.gov.tr',
    categoryId: 2, // concert
    price: '75 TL',
    capacity: 150,
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    tags: '["klasik müzik", "konser", "opera", "bale"]',
    participantType: 'Tüm yaş grupları',
    isFeatured: true,
  },
  {
    title: 'Edirne Gastronomi Şenliği',
    description: 'Edirne\'nin geleneksel lezzetlerini keşfedin. Ciğer, lokum, peynir helvası ve daha fazlası.',
    startDate: new Date('2024-07-28'),
    endDate: new Date('2024-07-30'),
    startTime: '11:00',
    endTime: '22:00',
    location: 'Sarayiçi Rekreasyon Alanı',
    address: 'Sarayiçi Mevkii, Tunca Nehri kenarı',
    organizerName: 'Edirne Aşçılar Odası',
    organizerContact: 'info@edirneasciler.org',
    categoryId: 11, // food
    price: 'Giriş Ücretsiz',
    capacity: 2000,
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    tags: '["gastronomi", "yemek", "lezzet", "geleneksel"]',
    participantType: 'Tüm yaş grupları',
  },
  {
    title: 'Modern Dans Workshop\'u',
    description: 'Profesyonel dans eğitmenleri eşliğinde modern dans teknikleri öğrenin.',
    startDate: new Date('2024-07-22'),
    startTime: '15:00',
    endTime: '17:00',
    location: 'Gençlik Merkezi',
    address: 'Babademirtaş Mahallesi, Gençlik Caddesi No:28',
    organizerName: 'Edirne Dans Akademisi',
    organizerContact: 'info@edirnedans.com',
    categoryId: 6, // workshop
    price: '80 TL',
    capacity: 25,
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800',
    tags: '["dans", "workshop", "modern", "eğitim"]',
    participantType: '14 yaş ve üzeri',
  },
  {
    title: 'Edirne Maraton 2024',
    description: 'Tarihi Edirne sokaklarında koşu keyfi. 5K, 10K ve yarı maraton kategorileri.',
    startDate: new Date('2024-08-05'),
    startTime: '07:00',
    endTime: '12:00',
    location: 'Selimiye Camii önü (Start)',
    address: 'Meydan Mahallesi, Selimiye Camii önü',
    organizerName: 'Edirne Atletizm Kulübü',
    organizerContact: 'maraton@edirneatletizm.org',
    categoryId: 7, // sports
    price: '40 TL',
    capacity: 1000,
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    tags: '["maraton", "koşu", "spor", "yarışma"]',
    participantType: '16 yaş ve üzeri',
  }
]

export async function seedDatabase() {
  try {
    await db.delete(categories)
    await db.insert(categories).values(seedCategories)
    
    await db.delete(events)
    await db.insert(events).values(seedEvents)
    
  } catch (error) {
    throw error
  }
}