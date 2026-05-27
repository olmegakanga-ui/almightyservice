import { EventData, GuestData } from '@/types/invitation'

export const mockEvent: EventData = {
  id: 'event-001',
  groomName: 'Jonathan',
  brideName: 'Christelle',
  eventDate: '2026-08-22T19:00:00',
  venueName: 'Salle des Fêtes Le Prestige',
  venueAddress: 'Avenue du Commerce 14, Kinshasa, RDC',
  venueLat: -4.3276,
  venueLng: 15.3136,
  backgroundImageUrl: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1920&q=80',
  invitationText: 'ont l\'immense joie et l\'honneur de vous convier aux festivités de leur mariage religieux',
  programItems: [
    { time: '13h00', description: 'Bénédiction nuptiale — Église Centrale' },
    { time: '16h00', description: 'Cocktail de bienvenue — Jardin du Prestige' },
    { time: '19h00', description: 'Soirée dansante & Dîner de gala' },
  ],
  rsvpDeadline: '2026-08-10T23:59:59',
  drinkOptions: [
    {
      categoryName: 'Boissons importées',
      drinks: ['Moët & Chandon', 'Hennessy VS', 'Johnnie Walker Black'],
    },
    {
      categoryName: 'Sans alcool',
      drinks: ['Eau minérale Evian', 'Jus de fruit frais', 'Coca-Cola premium'],
    },
  ],
  themeColor: '#C9A96E',
}

export const mockGuest: GuestData = {
  id: 'guest-001',
  fullName: 'Benjamin Awuya',
  tableId: 'table-001',
  tableName: 'Actif Matériel',
  side: 'HOMME',
  invitationToken: 'demo-token-001',
  rsvpStatus: 'pending',
  selectedDrinks: [],
  guestbookMessage: null,
  giftChoice: null,
}