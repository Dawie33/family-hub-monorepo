import { Knex } from 'knex'

const SLUG_MAP: Record<string, string> = {
  bumper_plates: 'bumper-plates',
  pullup_bar: 'pull-up-bar',
  airbike: 'assault-bike',
  bike_erg: 'bike-erg',
  ski_erg: 'ski-erg',
  jump_rope: 'jump-rope',
}

export async function up(knex: Knex): Promise<void> {
  // 1. Update slugs in the equipments table
  for (const [oldSlug, newSlug] of Object.entries(SLUG_MAP)) {
    await knex('equipments').where({ slug: oldSlug }).update({ slug: newSlug })
  }

  // 2. Update slugs stored in users.equipment_available (JSON array of slug strings)
  const users = await knex('users').whereNotNull('equipment_available').select('id', 'equipment_available')

  for (const user of users) {
    const slugs: string[] = typeof user.equipment_available === 'string'
      ? JSON.parse(user.equipment_available)
      : user.equipment_available

    if (!Array.isArray(slugs) || slugs.length === 0) continue

    const updated = slugs.map(s => SLUG_MAP[s] ?? s)
    if (updated.join(',') === slugs.join(',')) continue

    await knex('users').where({ id: user.id }).update({
      equipment_available: JSON.stringify(updated),
    })
  }
}

export async function down(knex: Knex): Promise<void> {
  const REVERSE_MAP = Object.fromEntries(Object.entries(SLUG_MAP).map(([k, v]) => [v, k]))

  for (const [newSlug, oldSlug] of Object.entries(REVERSE_MAP)) {
    await knex('equipments').where({ slug: newSlug }).update({ slug: oldSlug })
  }

  const users = await knex('users').whereNotNull('equipment_available').select('id', 'equipment_available')

  for (const user of users) {
    const slugs: string[] = typeof user.equipment_available === 'string'
      ? JSON.parse(user.equipment_available)
      : user.equipment_available

    if (!Array.isArray(slugs) || slugs.length === 0) continue

    const restored = slugs.map(s => REVERSE_MAP[s] ?? s)
    if (restored.join(',') === slugs.join(',')) continue

    await knex('users').where({ id: user.id }).update({
      equipment_available: JSON.stringify(restored),
    })
  }
}
