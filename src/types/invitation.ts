export type RsvpStatus = 'pending' | 'confirmed' | 'declined'
export type GiftChoice = 'envelope' | 'present' | null

export interface EventData {
  id:                   string
  groomName:            string
  brideName:            string
  eventDate:            string
  venueName:            string
  venueAddress:         string
  venueLat:             number
  venueLng:             number
  backgroundImageUrl:   string
  invitationText:       string
  programItems:         ProgramItem[]
  rsvpDeadline:         string
  drinkOptions:         DrinkCategory[]
  themeColor:           string
  themeColorSecondary:  string
  musicUrl:             string | null
  musicVolume:          number
  giftOptions:          string[]
  sectionsOrder:        string[]
}

export interface ProgramItem {
  time:        string
  description: string
}

export interface DrinkCategory {
  categoryName: string
  drinks:       string[]
}

export interface GuestData {
  id:               string
  fullName:         string
  tableId:          string | null
  tableName:        string | null
  side:             'HOMME' | 'FEMME'
  invitationToken:  string
  rsvpStatus:       RsvpStatus
  selectedDrinks:   string[]
  guestbookMessage: string | null
  giftChoice:       GiftChoice
}