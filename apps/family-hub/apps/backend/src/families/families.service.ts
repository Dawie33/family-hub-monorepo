import { Injectable, NotFoundException } from '@nestjs/common'
import { SupabaseService } from '../database/supabase.service'

@Injectable()
export class FamiliesService {
  constructor(private readonly supabase: SupabaseService) {}

  async create(name: string, userId?: string) {
    const { data: family, error: familyError } = await this.supabase.db
      .from('families')
      .insert({ name })
      .select()
      .single()

    if (familyError) throw new Error(familyError.message)

    if (userId) {
      await this.supabase.db
        .from('family_members')
        .insert({ family_id: family.id, user_id: userId, name, role: 'admin' })
    }

    return family
  }

  async findAll() {
    const { data, error } = await this.supabase.db
      .from('families')
      .select('id, name, created_at')
      .order('created_at', { ascending: true })
    if (error) throw new Error(error.message)
    return data
  }

  async addMember(familyId: string, userId: string, name: string, role = 'member') {
    const { data, error } = await this.supabase.db
      .from('family_members')
      .insert({ family_id: familyId, user_id: userId, name, role })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  }

  async getMembers(familyId: string) {
    const { data, error } = await this.supabase.db
      .from('family_members')
      .select('id, name, role, color, avatar_url')
      .eq('family_id', familyId)
    if (error) throw new Error(error.message)
    return data
  }
}
