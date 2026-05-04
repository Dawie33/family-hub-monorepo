import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE scheduled_activities
    DROP CONSTRAINT scheduled_activities_activity_type_check,
    ADD CONSTRAINT scheduled_activities_activity_type_check
      CHECK (activity_type IN ('hyrox', 'running', 'athx', 'strength'))
  `)
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE scheduled_activities
    DROP CONSTRAINT scheduled_activities_activity_type_check,
    ADD CONSTRAINT scheduled_activities_activity_type_check
      CHECK (activity_type IN ('hyrox', 'running', 'athx'))
  `)
}
