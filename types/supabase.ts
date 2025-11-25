export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          bio: string | null
          avatar_url: string | null
          favorite_team: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          favorite_team?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          favorite_team?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
          image_url: string | null
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
          image_url?: string | null
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
          image_url?: string | null
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          post_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string
          created_at?: string
        }
      }
      shop_products: {
        Row: {
          id: string
          product_name: string
          price: number | null
          currency: string | null
          image_url: string | null
          product_link: string
          category: string | null
          featured: boolean | null
          is_available: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          product_name: string
          price?: number | null
          currency?: string | null
          image_url?: string | null
          product_link: string
          category?: string | null
          featured?: boolean | null
          is_available?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          product_name?: string
          price?: number | null
          currency?: string | null
          image_url?: string | null
          product_link?: string
          category?: string | null
          featured?: boolean | null
          is_available?: boolean
          sort_order?: number
          created_at?: string
        }
      }
      screenings: {
        Row: {
          id: string
          title: string
          date: string
          time: string
          location: string
          image_url: string | null
          description: string | null
          price: number | null
          currency: string | null
          ticket_link: string | null
          is_active: boolean
          created_at: string
          round_number: number
          grand_prix_name: string
          timing: string
        }
        Insert: {
          id?: string
          title: string
          date: string
          time: string
          location: string
          image_url?: string | null
          description?: string | null
          price?: number | null
          currency?: string | null
          ticket_link?: string | null
          is_active?: boolean
          created_at?: string
          round_number: number
          grand_prix_name: string
          timing: string
        }
        Update: {
          id?: string
          title?: string
          date?: string
          time?: string
          location?: string
          image_url?: string | null
          description?: string | null
          price?: number | null
          currency?: string | null
          ticket_link?: string | null
          is_active?: boolean
          created_at?: string
          round_number?: number
          grand_prix_name?: string
          timing?: string
        }
      }
      races: {
        Row: {
          id: string
          name: string
          circuit_name: string
          round_number: number
          country: string
          date: string
          is_sprint: boolean
          fp1_time: string | null
          fp2_time: string | null
          fp3_time: string | null
          qualifying_time: string | null
          sprint_qualifying_time: string | null
          sprint_race_time: string | null
          race_time: string | null
          circuit_image_url: string | null
          circuit_length_km: number | null
          turns: number | null
          lap_record_time: string | null
          lap_record_driver: string | null
          last_winner: string | null
          status: 'upcoming' | 'completed' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          circuit_name: string
          round_number: number
          country: string
          date: string
          is_sprint?: boolean
          fp1_time?: string | null
          fp2_time?: string | null
          fp3_time?: string | null
          qualifying_time?: string | null
          sprint_qualifying_time?: string | null
          sprint_race_time?: string | null
          race_time?: string | null
          circuit_image_url?: string | null
          circuit_length_km?: number | null
          turns?: number | null
          lap_record_time?: string | null
          lap_record_driver?: string | null
          last_winner?: string | null
          status?: 'upcoming' | 'completed' | 'cancelled'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          circuit_name?: string
          round_number?: number
          country?: string
          date?: string
          is_sprint?: boolean
          fp1_time?: string | null
          fp2_time?: string | null
          fp3_time?: string | null
          qualifying_time?: string | null
          sprint_qualifying_time?: string | null
          sprint_race_time?: string | null
          race_time?: string | null
          circuit_image_url?: string | null
          circuit_length_km?: number | null
          turns?: number | null
          lap_record_time?: string | null
          lap_record_driver?: string | null
          last_winner?: string | null
          status?: 'upcoming' | 'completed' | 'cancelled'
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}