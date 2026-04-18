export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      characters: {
        Row: {
          id: string
          user_id: string
          name: string
          race: string
          class: string
          level: number
          background: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          race: string
          class: string
          level?: number
          background: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          race?: string
          class?: string
          level?: number
          background?: string
          created_at?: string
        }
        Relationships: []
      }
      character_stats: {
        Row: {
          id: string
          character_id: string
          strength: number
          dexterity: number
          constitution: number
          intelligence: number
          wisdom: number
          charisma: number
        }
        Insert: {
          id?: string
          character_id: string
          strength: number
          dexterity: number
          constitution: number
          intelligence: number
          wisdom: number
          charisma: number
        }
        Update: {
          id?: string
          character_id?: string
          strength?: number
          dexterity?: number
          constitution?: number
          intelligence?: number
          wisdom?: number
          charisma?: number
        }
        Relationships: []
      }
      character_hp: {
        Row: {
          id: string
          character_id: string
          max_hp: number
          current_hp: number
          temp_hp: number
        }
        Insert: {
          id?: string
          character_id: string
          max_hp: number
          current_hp: number
          temp_hp?: number
        }
        Update: {
          id?: string
          character_id?: string
          max_hp?: number
          current_hp?: number
          temp_hp?: number
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Character = Database['public']['Tables']['characters']['Row']
export type CharacterStats = Database['public']['Tables']['character_stats']['Row']
export type CharacterHP = Database['public']['Tables']['character_hp']['Row']

export type CharacterWithDetails = Character & {
  character_stats?: CharacterStats
  character_hp?: CharacterHP
}
