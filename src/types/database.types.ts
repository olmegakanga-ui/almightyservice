export interface ProgramItem {
  time: string
  description: string
}

export interface DrinkCategory {
  categoryName: string
  drinks: string[]
}

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string
          slug: string
          groom_name: string
          bride_name: string
          event_date: string
          venue_name: string
          venue_address: string
          venue_lat: number
          venue_lng: number
          background_image_url: string
          invitation_text: string
          program_json: ProgramItem[]
          rsvp_deadline: string
          drink_options_json: DrinkCategory[]
          theme_color_primary: string
          theme_color_secondary: string
          whatsapp_transfer_allowed: boolean
          status: 'draft' | 'active' | 'completed' | 'archived'
          created_at: string
          updated_at: string
        }
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
      }
      guests: {
        Row: {
          id: string
          event_id: string
          table_id: string | null
          full_name: string
          phone: string
          is_couple: boolean
          side: 'HOMME' | 'FEMME'
          label: string
          invitation_token: string
          checked_in: boolean
          checked_in_at: string | null
          checked_in_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
      }
      guest_tables: {
        Row: {
          id: string
          event_id: string
          name: string
          capacity: number
          category: 'VIP' | 'FAMILLE' | 'AMIS' | 'AUTRES'
          side: 'HOMME' | 'FEMME'
          position_x: number
          position_y: number
          created_at: string
        }
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
      }
      rsvp_responses: {
        Row: {
          id: string
          guest_id: string
          event_id: string
          status: 'pending' | 'confirmed' | 'declined'
          responded_at: string | null
        }
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
      }
      drink_selections: {
        Row: {
          id: string
          guest_id: string
          event_id: string
          drink_name: string
          drink_category: string
          selected_at: string
        }
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
      }
      guestbook_entries: {
        Row: {
          id: string
          guest_id: string
          event_id: string
          message: string
          created_at: string
        }
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
      }
      gift_choices: {
        Row: {
          id: string
          guest_id: string
          event_id: string
          gift_type: 'envelope' | 'present'
          selected_at: string
        }
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
      }
      checkin_logs: {
        Row: {
          id: string
          guest_id: string
          event_id: string
          action: 'checkin' | 'undo_checkin'
          performed_by: string | null
          performed_at: string
          notes: string | null
        }
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
      }
    }
    Functions: {
      checkin_guest: {
        Args: {
          p_guest_id: string
          p_checked_at: string
          p_checked_by: string
        }
        Returns: void
      }
    }
  }
}