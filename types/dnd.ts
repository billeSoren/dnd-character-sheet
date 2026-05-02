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
          skill_proficiencies: string[] | null
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
          skill_proficiencies?: string[] | null
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
          skill_proficiencies?: string[] | null
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
      dnd_classes: {
        Row: {
          id: string
          name: string
          source: string
          hit_die: number
          primary_ability: string[]
          saving_throws: string[]
          armor_proficiencies: string[]
          weapon_proficiencies: string[]
          skill_choices: string[]
          num_skill_choices: number
          description: string | null
        }
        Insert: Record<string, never>
        Update: Record<string, never>
        Relationships: []
      }
      races: {
        Row: {
          id: string
          name: string
          source: string
          ability_bonuses: Record<string, number> | null
          speed: number | null
          size: string | null
          traits: string[] | null
          languages: string[] | null
          description: string | null
        }
        Insert: Record<string, never>
        Update: Record<string, never>
        Relationships: []
      }
      backgrounds: {
        Row: {
          id: string
          name: string
          source: string
          description: string | null
          skill_proficiencies: string[]
          tool_proficiencies: string[]
          languages: string[]
          feature_name: string | null
          feature_description: string | null
        }
        Insert: Record<string, never>
        Update: Record<string, never>
        Relationships: []
      }
      magic_items: {
        Row: {
          id: string
          name: string
          type: string | null
          rarity: string | null
          requires_attunement: boolean | null
          description: string | null
          source: string | null
          is_official: boolean | null
          hidden: boolean | null
        }
        Insert: {
          id?: string
          name: string
          type?: string | null
          rarity?: string | null
          requires_attunement?: boolean | null
          description?: string | null
          source?: string | null
          is_official?: boolean | null
          hidden?: boolean | null
        }
        Update: {
          id?: string
          name?: string
          type?: string | null
          rarity?: string | null
          requires_attunement?: boolean | null
          description?: string | null
          source?: string | null
          is_official?: boolean | null
          hidden?: boolean | null
        }
        Relationships: []
      }
      character_items: {
        Row: {
          id: string
          character_id: string
          item_id: string
          equipped: boolean
          attuned: boolean
          added_at: string
          quantity: number
          notes: string | null
        }
        Insert: {
          id?: string
          character_id: string
          item_id: string
          equipped?: boolean
          attuned?: boolean
          added_at?: string
          quantity?: number
          notes?: string | null
        }
        Update: {
          id?: string
          character_id?: string
          item_id?: string
          equipped?: boolean
          attuned?: boolean
          added_at?: string
          quantity?: number
          notes?: string | null
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
