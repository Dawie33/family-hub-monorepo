import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex('users').del();
  await knex('users').insert([
    {
      id: knex.raw('gen_random_uuid()'),
      email: 'john.doe@example.com',
      password: 'hashed_password_1',
      firstName: 'John',
      lastName: 'Doe',
      isActive: true,
      emailVerified: true
    },
    {
      id: knex.raw('gen_random_uuid()'),
      email: 'jane.smith@example.com',
      password: 'hashed_password_2',
      firstName: 'Jane',
      lastName: 'Smith',
      isActive: true,
      emailVerified: false
    }
  ]);
}