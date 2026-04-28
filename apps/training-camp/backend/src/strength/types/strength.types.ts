export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'arms' | 'forearms' | 'legs' | 'glutes' | 'core'

export type SessionGoal = 'strength' | 'hypertrophy' | 'endurance' | 'power'

export type BlockType = 'push' | 'pull' | 'hinge' | 'squat' | 'carry' | 'rotation' | 'isolation'

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'chest', 'back', 'shoulders', 'arms', 'forearms', 'legs', 'glutes', 'core',
]

export const SESSION_GOALS: SessionGoal[] = ['strength', 'hypertrophy', 'endurance', 'power']
