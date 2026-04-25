import { Injectable } from '@nestjs/common'
import { Knex } from 'knex'
import { InjectModel } from 'nest-knexjs'

@Injectable()
export class OneRepMaxesService {
  constructor(@InjectModel() private readonly knex: Knex) {}

  async findAllByUser(userId: string) {
    return this.knex('one_rep_maxes').where({ user_id: userId }).orderBy('lift')
  }

  async upsert(userId: string, lift: string, value: number, source: 'real' | 'estimated') {
    const [row] = await this.knex('one_rep_maxes')
      .insert({ user_id: userId, lift, value, source, measured_at: this.knex.fn.now() })
      .onConflict(['user_id', 'lift'])
      .merge(['value', 'source', 'measured_at'])
      .returning('*')

    await this.knex('one_rep_max_history').insert({
      user_id: userId,
      lift,
      value,
      source,
      measured_at: this.knex.fn.now(),
    })

    return row
  }

  async findHistoryByUser(userId: string) {
    const rows = await this.knex('one_rep_max_history')
      .where({ user_id: userId })
      .orderBy('measured_at', 'asc')
      .select('lift', 'value', 'source', 'measured_at')

    // Grouper par lift : { back_squat: [{ value, measured_at }, ...], ... }
    const grouped: Record<string, { value: number; source: string; measured_at: string }[]> = {}
    for (const row of rows) {
      if (!grouped[row.lift]) grouped[row.lift] = []
      grouped[row.lift].push({ value: Number(row.value), source: row.source, measured_at: row.measured_at })
    }
    return grouped
  }
}
