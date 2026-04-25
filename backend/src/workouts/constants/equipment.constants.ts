/**
 * Constantes pour les équipements disponibles
 * Utilisé par tous les générateurs de workouts
 */

/**
 * Liste complète des équipements disponibles
 */
export const EQUIPMENT = [
  // Bodyweight & basics
  'bodyweight', 'mat', 'band',

  // Free weights
  'barbell', 'plates', 'bumper-plates', 'rack', 'bench', 'dumbbell', 'kettlebell', 'trap-bar',

  // CrossFit/Functional
  'box', 'pull-up-bar', 'jump-rope', 'rower', 'assault-bike', 'bike-erg', 'ski-erg', 'sled', 'wall-ball',
  'rings', 'parallettes', 'ghd', 'medicine-ball', 'battle-ropes', 'slam-ball', 'sandbag',
  'abmat', 'tire', 'sledgehammer', 'farmer-walk-handles', 'yoke', 'atlas-stone',

  // Gym machines & cables
  'cable-machine', 'lat-pulldown', 'leg-press', 'leg-curl', 'leg-extension',
  'chest-press-machine', 'shoulder-press-machine', 'pec-deck', 'cable-crossover',
  'seated-row-machine', 'smith-machine', 'hack-squat', 'calf-raise-machine',
  'preacher-curl-bench', 'ez-bar', 'triceps-machine', 'biceps-machine',

  // Cardio machines
  'treadmill', 'stationary-bike', 'elliptical', 'stairmaster',

  // Accessories
  'foam-roller', 'lacrosse-ball', 'ab-wheel', 'suspension-trainer', 'plyo-box',

  // Mobility specific
  'yoga-block', 'strap', 'pvc-pipe', 'dowel', 'wall'
] as const

/**
 * Type pour un équipement
 */
export type Equipment = typeof EQUIPMENT[number]

/**
 * Presets d'équipement pour différents environnements
 */
export const EQUIPMENT_PRESETS = {
  minimal: ['bodyweight', 'mat'],
  home: ['bodyweight', 'mat', 'band', 'dumbbell', 'kettlebell', 'pull-up-bar', 'jump-rope'],
  crossfit: ['bodyweight', 'mat', 'band', 'barbell', 'bumper-plates', 'rack', 'bench', 'dumbbell', 'kettlebell',
    'box', 'pull-up-bar', 'jump-rope', 'rower', 'assault-bike', 'bike-erg', 'ski-erg', 'sled', 'wall-ball',
    'rings', 'parallettes', 'ghd', 'medicine-ball', 'battle-ropes', 'slam-ball', 'sandbag',
    'abmat', 'tire', 'sledgehammer', 'farmer-walk-handles'],
  gym: EQUIPMENT.filter(e => !['rings', 'parallettes', 'ghd', 'ski-erg', 'assault-bike', 'wall-ball'].includes(e)),
  full: [...EQUIPMENT],
} as const

/**
 * Type pour un preset d'équipement
 */
export type EquipmentPreset = keyof typeof EQUIPMENT_PRESETS
