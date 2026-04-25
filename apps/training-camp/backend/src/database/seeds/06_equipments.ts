 // Seed minimal (optionnel)
import type { Knex } from "knex"

export async function seed(knex: Knex): Promise<void> {
  await knex('equipments').del();
  await knex('equipments').insert([
    { slug: 'barbell', label: 'Barre olympique', image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=100&h=100&fit=crop', meta: {} },
    { slug: 'bumper-plates', label: 'Disques bumper', image_url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=100&h=100&fit=crop', meta: {} },
    { slug: 'dumbbell', label: 'Haltères', image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=100&h=100&fit=crop', meta: {} },
    { slug: 'kettlebell', label: 'Kettlebell', image_url: 'https://images.unsplash.com/photo-1606889464198-fcb18894cf50?w=100&h=100&fit=crop', meta: {} },
    { slug: 'rings', label: 'Anneaux', image_url: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=100&h=100&fit=crop', meta: {} },
    { slug: 'pull-up-bar', label: 'Barre de traction', image_url: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=100&h=100&fit=crop', meta: {} },
    { slug: 'rower', label: 'Rameur', image_url: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=100&h=100&fit=crop', meta: {} },
    { slug: 'assault-bike', label: 'AirBike', image_url: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=100&h=100&fit=crop', meta: {} },
    { slug: 'bike-erg', label: 'BikeErg', image_url: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=100&h=100&fit=crop', meta: {} },
    { slug: 'ski-erg', label: 'SkiErg', image_url: 'https://images.unsplash.com/photo-1483721310020-03333e577078?w=100&h=100&fit=crop', meta: {} },
    { slug: 'jump-rope', label: 'Corde à sauter', image_url: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=100&h=100&fit=crop', meta: {} },
  ])

}
