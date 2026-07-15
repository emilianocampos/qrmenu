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
          name: string | null
          email: string | null
          created_at: string
        }
        Insert: {
          id: string
          name?: string | null
          email?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          created_at?: string
        }
      }
      businesses: {
        Row: {
          id: string
          owner_id: string
          name: string
          slug: string
          logo_url: string | null
          color_primary: string | null
          color_secondary: string | null
          typography: string | null
          theme: string | null
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          slug: string
          logo_url?: string | null
          color_primary?: string | null
          color_secondary?: string | null
          typography?: string | null
          theme?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          color_primary?: string | null
          color_secondary?: string | null
          typography?: string | null
          theme?: string | null
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          business_id: string
          name: string
          item_order: number | null
          is_visible: boolean | null
          icon: string | null
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          item_order?: number | null
          is_visible?: boolean | null
          icon?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          item_order?: number | null
          is_visible?: boolean | null
          icon?: string | null
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          business_id: string
          category_id: string | null
          name: string
          description: string | null
          price: number
          image_url: string | null
          is_available: boolean | null
          is_featured: boolean | null
          item_order: number | null
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          category_id?: string | null
          name: string
          description?: string | null
          price?: number
          image_url?: string | null
          is_available?: boolean | null
          is_featured?: boolean | null
          item_order?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          category_id?: string | null
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          is_available?: boolean | null
          is_featured?: boolean | null
          item_order?: number | null
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
