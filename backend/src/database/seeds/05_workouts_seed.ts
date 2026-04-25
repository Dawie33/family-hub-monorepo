import type { Knex } from "knex"

export async function seed(knex: Knex): Promise<void> {
  await knex('workouts').del();

  const workouts = [
    // ============================================================================
    // CROSSFIT WORKOUTS
    // ============================================================================
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'Cindy',
      slug: 'cindy',
      description: 'AMRAP 20 min: 5 Pull-Ups, 10 Push-Ups, 15 Air Squats',
      workout_type: 'amrap',
      blocks: JSON.stringify({
        stimulus: 'Endurance musculaire et cardio',
        sections: [
          {
            type: 'warmup',
            title: 'Échauffement',
            duration_min: 5,
            exercises: [
              { name: 'Jump Rope', duration: '3 min' },
              { name: 'Shoulder Circles', reps: '10' }
            ]
          },
          {
            type: 'amrap',
            title: 'AMRAP',
            format: 'AMRAP 20 min',
            duration_min: 20,
            goal: 'Maximum de rounds et reps',
            exercises: [
              { name: 'Pull-Up', reps: '5' },
              { name: 'Push-Up', reps: '10' },
              { name: 'Air Squat', reps: '15' }
            ]
          },
          {
            type: 'cooldown',
            title: 'Retour au calme',
            duration_min: 5,
            exercises: [
              { name: 'Walk', duration: '5 min' }
            ]
          }
        ]
      }),
      estimated_duration: 30,
      intensity: 'high',
      difficulty: 'intermediate',
      scaling_options: JSON.stringify(['banded pull-ups', 'knee push-ups']),
      equipment_required: JSON.stringify(['pull-up-bar']),
      focus_areas: JSON.stringify(['endurance', 'gymnastics']),
      metrics_tracked: JSON.stringify(['rounds', 'reps']),
      ai_generated: false,
      created_by_user_id: null,
      target_metrics: JSON.stringify({ scoring_type: 'rounds' }),
      isActive: true,
      isFeatured: true,
      isPublic: true,
      status: 'published',
      is_benchmark: true,
      coach_notes: 'Workout benchmark classique. Visez un rythme constant.',
      tags: JSON.stringify(['bodyweight', 'classic', 'benchmark']),
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'Fran',
      slug: 'fran',
      description: '21-15-9 Thrusters (95/65 lbs) et Pull-Ups',
      workout_type: 'for_time',
      blocks: JSON.stringify({
        stimulus: 'Sprint métabolique intense',
        sections: [
          {
            type: 'warmup',
            title: 'Échauffement',
            duration_min: 8,
            exercises: [
              { name: 'Rowing', duration: '5 min' },
              { name: 'Thruster Practice', reps: '10', details: 'Avec barre vide ou légère' }
            ]
          },
          {
            type: 'for_time',
            title: 'For Time (21-15-9)',
            format: 'For Time - Cap 15 min',
            duration_min: 15,
            goal: 'Terminer le plus rapidement possible',
            description: '21-15-9 reps de chaque exercice',
            exercises: [
              { name: 'Thruster', reps: '21-15-9', weight: '43kg/30kg', details: 'RX: 95lbs/65lbs' },
              { name: 'Pull-Up', reps: '21-15-9' }
            ]
          },
          {
            type: 'cooldown',
            title: 'Retour au calme',
            duration_min: 5,
            exercises: [
              { name: 'Stretch', duration: '5 min', details: 'Focus épaules et dos' }
            ]
          }
        ]
      }),
      estimated_duration: 25,
      intensity: 'very_high',
      difficulty: 'advanced',
      scaling_options: JSON.stringify(['lighter barbell', 'banded pull-ups', 'ring rows']),
      equipment_required: JSON.stringify(['barbell', 'plates', 'pull-up-bar']),
      focus_areas: JSON.stringify(['conditioning', 'strength-endurance']),
      metrics_tracked: JSON.stringify(['time']),
      ai_generated: false,
      created_by_user_id: null,
      target_metrics: JSON.stringify({ scoring_type: 'time' }),
      isActive: true,
      isFeatured: true,
      isPublic: true,
      status: 'published',
      is_benchmark: true,
      coach_notes: 'Un des benchmarks les plus iconiques. Gérez votre rythme dès le début.',
      tags: JSON.stringify(['barbell', 'benchmark', 'classic']),
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'Helen',
      slug: 'helen',
      description: '3 rounds: 400m Run, 21 KB Swings (53/35), 12 Pull-Ups',
      workout_type: 'for_time',
      blocks: JSON.stringify({
        stimulus: 'Endurance et puissance',
        sections: [
          {
            type: 'warmup',
            title: 'Échauffement',
            duration_min: 8,
            exercises: [
              { name: 'Light Jog', duration: '5 min' },
              { name: 'KB Swing Practice', reps: '10', details: 'Technique focus' }
            ]
          },
          {
            type: 'for_time',
            title: 'For Time (3 rounds)',
            format: 'For Time - Cap 20 min',
            duration_min: 20,
            rounds: 3,
            goal: 'Terminer les 3 rounds le plus rapidement possible',
            exercises: [
              { name: 'Run', distance: '400m' },
              { name: 'Kettlebell Swing', reps: '21', weight: '24kg/16kg', details: 'RX: 53lbs/35lbs' },
              { name: 'Pull-Up', reps: '12' }
            ]
          },
          {
            type: 'cooldown',
            title: 'Retour au calme',
            duration_min: 5,
            exercises: [
              { name: 'Walk', duration: '5 min' }
            ]
          }
        ]
      }),
      estimated_duration: 25,
      intensity: 'high',
      difficulty: 'intermediate',
      scaling_options: JSON.stringify(['lighter KB', 'banded pull-ups', 'reduce distance']),
      equipment_required: JSON.stringify(['kettlebell', 'pull-up-bar']),
      focus_areas: JSON.stringify(['endurance', 'running', 'power']),
      metrics_tracked: JSON.stringify(['time']),
      ai_generated: false,
      created_by_user_id: null,
      target_metrics: JSON.stringify({ scoring_type: 'time' }),
      isActive: true,
      isFeatured: true,
      isPublic: true,
      status: 'published',
      is_benchmark: true,
      coach_notes: 'Gardez un rythme soutenu sur la course, cassez les KB swings et pull-ups si nécessaire.',
      tags: JSON.stringify(['running', 'kettlebell', 'benchmark']),
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'DT',
      slug: 'dt',
      description: '5 rounds: 12 Deadlifts, 9 Hang Power Cleans, 6 Push Jerks (155/105)',
      workout_type: 'for_time',
      blocks: JSON.stringify({
        stimulus: 'Force et endurance avec barbell',
        sections: [
          {
            type: 'warmup',
            title: 'Échauffement',
            duration_min: 8,
            exercises: [
              { name: 'Rowing', duration: '5 min' },
              { name: 'Barbell Complex', reps: '5', details: 'Barre vide: deadlift + hang clean + jerk' }
            ]
          },
          {
            type: 'for_time',
            title: 'For Time (5 rounds)',
            format: 'For Time - Cap 20 min',
            duration_min: 20,
            rounds: 5,
            goal: 'Terminer les 5 rounds le plus rapidement possible',
            exercises: [
              { name: 'Deadlift', reps: '12', weight: '70kg/48kg', details: 'RX: 155lbs/105lbs' },
              { name: 'Hang Power Clean', reps: '9', weight: '70kg/48kg' },
              { name: 'Push Jerk', reps: '6', weight: '70kg/48kg' }
            ]
          },
          {
            type: 'cooldown',
            title: 'Retour au calme',
            duration_min: 5,
            exercises: [
              { name: 'Stretch', duration: '5 min', details: 'Focus épaules, dos et hanches' }
            ]
          }
        ]
      }),
      estimated_duration: 30,
      intensity: 'very_high',
      difficulty: 'advanced',
      scaling_options: JSON.stringify(['lighter barbell', 'reduce rounds']),
      equipment_required: JSON.stringify(['barbell', 'plates']),
      focus_areas: JSON.stringify(['strength-endurance', 'weightlifting']),
      metrics_tracked: JSON.stringify(['time']),
      ai_generated: false,
      created_by_user_id: null,
      target_metrics: JSON.stringify({ scoring_type: 'time' }),
      isActive: true,
      isFeatured: true,
      isPublic: true,
      status: 'published',
      is_benchmark: true,
      coach_notes: 'Workout très exigeant sur les épaules. Prenez le temps de bien respirer.',
      tags: JSON.stringify(['barbell', 'weightlifting', 'benchmark']),
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: knex.raw('gen_random_uuid()'),
      name: 'Strength & Metcon',
      slug: 'strength-metcon-1',
      description: 'Back Squat 5x5 + Short MetCon',
      workout_type: 'strength',
      blocks: JSON.stringify({
        stimulus: 'Force maximale puis conditioning court',
        sections: [
          {
            type: 'warmup',
            title: 'Échauffement',
            duration_min: 8,
            exercises: [
              { name: 'Bike Easy', duration: '5 min' },
              { name: 'Squat Mobility', duration: '3 min', details: 'Hip openers, ankle mobility' }
            ]
          },
          {
            type: 'strength',
            title: 'Strength - Back Squat',
            format: '5 sets x 5 reps @ 80% 1RM',
            duration_min: 25,
            goal: 'Développer la force maximale',
            rest_between_rounds: 180,
            exercises: [
              { name: 'Back Squat', sets: '5', reps: '5', intensity: '80% 1RM', details: 'Repos 3 min entre les séries' }
            ]
          },
          {
            type: 'amrap',
            title: 'MetCon - AMRAP 10',
            format: 'AMRAP 10 min',
            duration_min: 10,
            goal: 'Maximum de rounds',
            exercises: [
              { name: 'Burpee', reps: '10' },
              { name: 'Box Jump', reps: '10', details: '24"/20"' },
              { name: 'Kettlebell Swing', reps: '10', weight: '24kg/16kg' }
            ]
          },
          {
            type: 'cooldown',
            title: 'Retour au calme',
            duration_min: 5,
            exercises: [
              { name: 'Stretch', duration: '5 min', details: 'Full body stretch' }
            ]
          }
        ]
      }),
      estimated_duration: 50,
      intensity: 'high',
      difficulty: 'intermediate',
      scaling_options: JSON.stringify(['lighter squat', 'step-ups instead of box jumps']),
      equipment_required: JSON.stringify(['barbell', 'rack', 'box', 'kettlebell']),
      focus_areas: JSON.stringify(['strength', 'legs', 'conditioning']),
      metrics_tracked: JSON.stringify(['weight', 'rounds']),
      ai_generated: false,
      created_by_user_id: null,
      target_metrics: JSON.stringify({ scoring_type: 'weight_and_rounds' }),
      isActive: true,
      isFeatured: false,
      isPublic: true,
      status: 'published',
      is_benchmark: false,
      coach_notes: 'Focus sur la technique du squat. Le metcon doit rester rapide et intense.',
      tags: JSON.stringify(['strength', 'legs', 'mixed']),
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  await knex('workouts').insert(workouts);
}
