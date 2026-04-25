import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { Knex } from 'knex'
import { InjectModel } from 'nest-knexjs'
import { CreateProgramDto } from './dto/create-program.dto'
import { ScheduleWeekDto, SwapSessionDto, UpdateEnrollmentDto } from './dto/update-enrollment.dto'
import type { ProgramPhase, ProgramSession } from './schemas/program.schema'

@Injectable()
export class TrainingProgramsService {
  constructor(@InjectModel() private readonly knex: Knex) {}

  /**
   * Crée un programme IA et inscrit l'utilisateur
   */
  async createAndEnroll(userId: string, data: CreateProgramDto) {
    return this.knex.transaction(async (trx) => {
      // Vérifier qu'il n'y a pas déjà un programme actif (index partiel DB comme filet de sécurité)
      const activeEnrollment = await trx('user_program_enrollments')
        .where({ user_id: userId })
        .whereIn('status', ['enrolled', 'active'])
        .first()

      if (activeEnrollment) {
        throw new ConflictException('Un programme est déjà actif. Abandonnez-le avant d\'en créer un nouveau.')
      }

      const slug = `prog-${userId.slice(0, 8)}-${Date.now()}`
      const totalSessions = data.duration_weeks * data.sessions_per_week

      const [program] = await trx('training_programs')
        .insert({
          name: data.name,
          slug,
          description: data.description,
          objectives: data.objectives || null,
          target_level: data.target_level,
          duration_weeks: data.duration_weeks,
          sessions_per_week: data.sessions_per_week,
          estimated_session_duration: 60,
          program_type: data.program_type,
          intensity_profile: 'variable',
          volume_profile: 'progressive',
          weekly_structure: JSON.stringify(data.weekly_structure),
          progression_scheme: data.progression_notes ? JSON.stringify({ notes: data.progression_notes }) : null,
          program_status: 'active',
          is_customizable: true,
          is_premium: false,
          is_featured: false,
          enrollment_count: 0,
        })
        .returning('*')

      const [enrollment] = await trx('user_program_enrollments')
        .insert({
          user_id: userId,
          program_id: program.id,
          enrolled_at: new Date(),
          status: 'enrolled',
          current_week: 1,
          completed_sessions: 0,
          total_sessions: totalSessions,
          completion_percentage: 0,
          customizations_applied: JSON.stringify([]),
          schedule_adjustments: JSON.stringify([]),
        })
        .returning('*')

      return { program, enrollment }
    })
  }

  /**
   * Récupère l'enrollment actif de l'utilisateur avec les détails du programme
   */
  async getActiveEnrollment(userId: string) {
    const enrollment = await this.knex('user_program_enrollments as upe')
      .join('training_programs as tp', 'upe.program_id', 'tp.id')
      .where('upe.user_id', userId)
      .whereIn('upe.status', ['enrolled', 'active'])
      .select(
        'upe.id',
        'upe.user_id',
        'upe.program_id',
        'upe.status',
        'upe.current_week',
        'upe.completed_sessions',
        'upe.total_sessions',
        'upe.completion_percentage',
        'upe.enrolled_at',
        'upe.started_at',
        'upe.customizations_applied',
        'upe.schedule_adjustments',
        'tp.name as program_name',
        'tp.description as program_description',
        'tp.objectives as program_objectives',
        'tp.duration_weeks',
        'tp.sessions_per_week',
        'tp.program_type',
        'tp.target_level',
        'tp.weekly_structure',
        'tp.progression_scheme',
      )
      .orderBy('upe.enrolled_at', 'desc')
      .first()

    return enrollment || null
  }

  /**
   * Récupère les sessions d'une semaine donnée en appliquant les customisations
   */
  async getWeekSessions(enrollmentId: string, userId: string, weekNum: number) {
    const enrollment = await this.knex('user_program_enrollments as upe')
      .join('training_programs as tp', 'upe.program_id', 'tp.id')
      .where('upe.id', enrollmentId)
      .where('upe.user_id', userId)
      .select('upe.*', 'tp.weekly_structure', 'tp.duration_weeks', 'tp.sessions_per_week')
      .first()

    if (!enrollment) {
      throw new NotFoundException('Enrollment non trouvé')
    }

    if (weekNum < 1 || weekNum > enrollment.duration_weeks) {
      throw new BadRequestException(`Numéro de semaine invalide (1-${enrollment.duration_weeks})`)
    }

    const structure =
      typeof enrollment.weekly_structure === 'string'
        ? JSON.parse(enrollment.weekly_structure)
        : enrollment.weekly_structure

    const phase: ProgramPhase | undefined = structure.phases.find((p: ProgramPhase) => p.weeks.includes(weekNum))

    if (!phase) {
      throw new NotFoundException(`Aucune session trouvée pour la semaine ${weekNum}`)
    }

    const customizations: Array<{
      week: number
      session_in_week: number
      type: string
      replacement: Record<string, unknown>
    }> = Array.isArray(enrollment.customizations_applied)
      ? enrollment.customizations_applied
      : JSON.parse(enrollment.customizations_applied || '[]')

    const sessions = phase.sessions.map((session: ProgramSession) => {
      const swap = customizations.find(
        (c) => c.week === weekNum && c.session_in_week === session.session_in_week,
      )
      if (!swap) return session

      if (swap.type === 'workout') {
        return { ...session, _swapped: true, _swap_workout_id: swap.replacement.workout_id }
      }
      if (swap.type === 'exercise' && swap.replacement.movement_name) {
        // Remplacer l'exercice dans strength_work
        const updatedStrengthWork = session.strength_work
          ? {
              movements: session.strength_work.movements.map((m) =>
                m.name === swap.replacement.movement_name
                  ? { ...m, ...(swap.replacement.exercise as object) }
                  : m,
              ),
            }
          : session.strength_work

        return { ...session, strength_work: updatedStrengthWork, _has_exercise_swap: true }
      }

      return { ...session, ...swap.replacement, _swapped: true }
    })

    return { phase: { ...phase, sessions: undefined }, sessions, weekNum }
  }

  /**
   * Planifie les sessions d'une semaine dans user_workout_schedule
   * en respectant les jours box et les jours déjà occupés
   */
  async scheduleWeek(enrollmentId: string, userId: string, dto: ScheduleWeekDto) {
    const { sessions } = await this.getWeekSessions(enrollmentId, userId, dto.week_num)

    // Construire les 7 dates de la semaine à partir de start_date
    const allDates: string[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(dto.start_date)
      d.setDate(d.getDate() + i)
      allDates.push(d.toISOString().split('T')[0])
    }

    // Exclure les jours box et les jours déjà occupés
    const occupiedDates = await this.knex('user_workout_schedule')
      .where('user_id', userId)
      .whereIn('scheduled_date', allDates)
      .pluck('scheduled_date')

    const usedDates = new Set([...dto.box_dates, ...occupiedDates])
    const availableDates = allDates.filter((d) => !usedDates.has(d))

    if (availableDates.length < sessions.length) {
      throw new BadRequestException(
        `Pas assez de jours disponibles (${availableDates.length} disponibles, ${sessions.length} séances à planifier)`,
      )
    }

    const scheduled: Array<{ date: string; session_title: string; schedule_id: string }> = []

    for (let i = 0; i < sessions.length; i++) {
      const session = sessions[i]
      const date = availableDates[i]

      const [entry] = await this.knex('user_workout_schedule')
        .insert({
          user_id: userId,
          workout_id: null,
          personalized_workout_id: null,
          scheduled_date: date,
          session_type: 'program_session',
          program_enrollment_id: enrollmentId,
          session_data: JSON.stringify(session),
          status: 'scheduled',
        })
        .returning('*')

      scheduled.push({ date, session_title: session.title, schedule_id: entry.id })
    }

    return { scheduled, box_dates_skipped: dto.box_dates, week_num: dto.week_num }
  }

  /**
   * Swap d'une session (workout entier ou exercice individuel)
   */
  async swapSession(
    enrollmentId: string,
    userId: string,
    weekNum: number,
    sessionInWeek: number,
    data: SwapSessionDto,
  ) {
    const enrollment = await this.knex('user_program_enrollments')
      .where({ id: enrollmentId, user_id: userId })
      .first()

    if (!enrollment) {
      throw new NotFoundException('Enrollment non trouvé')
    }

    const customizations: unknown[] = Array.isArray(enrollment.customizations_applied)
      ? enrollment.customizations_applied
      : JSON.parse(enrollment.customizations_applied || '[]')

    // Supprimer un éventuel swap existant pour cette session
    const filtered = (
      customizations as Array<{ week: number; session_in_week: number }>
    ).filter((c) => !(c.week === weekNum && c.session_in_week === sessionInWeek))

    let newSwap: Record<string, unknown>

    if (data.swap_type === 'workout') {
      if (!data.workout_id) throw new BadRequestException('workout_id requis pour swap_type workout')
      const workout = await this.knex('workouts').where({ id: data.workout_id }).first()
      if (!workout) throw new NotFoundException('Workout non trouvé')
      newSwap = {
        week: weekNum,
        session_in_week: sessionInWeek,
        type: 'workout',
        replacement: { workout_id: data.workout_id, workout_name: workout.name },
      }
    } else if (data.swap_type === 'exercise') {
      if (!data.movement_name || !data.replacement_exercise) {
        throw new BadRequestException('movement_name et replacement_exercise requis pour swap_type exercise')
      }
      newSwap = {
        week: weekNum,
        session_in_week: sessionInWeek,
        type: 'exercise',
        replacement: { movement_name: data.movement_name, exercise: data.replacement_exercise },
      }
    } else {
      // ai_regenerate : stocker les instructions
      newSwap = {
        week: weekNum,
        session_in_week: sessionInWeek,
        type: 'ai_regenerate',
        replacement: { instructions: data.instructions, needs_regeneration: true },
      }
    }

    ;(filtered as unknown[]).push(newSwap)

    await this.knex('user_program_enrollments').where({ id: enrollmentId }).update({
      customizations_applied: JSON.stringify(filtered),
      updated_at: new Date(),
    })

    // Si la semaine est déjà planifiée, mettre à jour le session_data du row correspondant
    const scheduledEntry = await this.knex('user_workout_schedule')
      .where({ user_id: userId, program_enrollment_id: enrollmentId })
      .whereRaw(`session_data->>'session_in_week' = ?`, [String(sessionInWeek)])
      .first()

    if (scheduledEntry) {
      const currentData = typeof scheduledEntry.session_data === 'string'
        ? JSON.parse(scheduledEntry.session_data)
        : scheduledEntry.session_data || {}

      let updatedData = { ...currentData }

      if (data.swap_type === 'exercise' && data.movement_name && data.replacement_exercise) {
        if (updatedData.strength_work?.movements) {
          updatedData.strength_work.movements = updatedData.strength_work.movements.map(
            (m: { name: string }) =>
              m.name === data.movement_name ? { ...m, ...data.replacement_exercise } : m,
          )
        }
        updatedData._has_exercise_swap = true
      } else if (data.swap_type === 'workout') {
        updatedData = { ...updatedData, _swapped: true, _swap_workout_id: data.workout_id }
      }

      await this.knex('user_workout_schedule').where({ id: scheduledEntry.id }).update({
        session_data: JSON.stringify(updatedData),
        updated_at: new Date(),
      })
    }

    return { success: true, swap_applied: newSwap }
  }

  /**
   * Met à jour le statut de l'enrollment (start, pause, abandon, avancer semaine)
   */
  async updateEnrollment(enrollmentId: string, userId: string, data: UpdateEnrollmentDto) {
    const enrollment = await this.knex('user_program_enrollments')
      .where({ id: enrollmentId, user_id: userId })
      .first()

    if (!enrollment) {
      throw new NotFoundException('Enrollment non trouvé')
    }

    const updates: Record<string, unknown> = { updated_at: new Date() }

    if (data.status) {
      updates.status = data.status
      if (data.status === 'active' && !enrollment.started_at) {
        updates.started_at = new Date()
      }
      if (data.status === 'completed') {
        updates.completed_at = new Date()
        updates.completion_percentage = 100
      }
      if (data.status === 'paused') {
        updates.last_pause_at = new Date()
      }
    }

    if (data.current_week) {
      updates.current_week = data.current_week
    }

    const [updated] = await this.knex('user_program_enrollments')
      .where({ id: enrollmentId })
      .update(updates)
      .returning('*')

    return updated
  }

  /**
   * Incrémente la semaine courante si toutes les sessions de la semaine sont complètes
   */
  async checkAndAdvanceWeek(enrollmentId: string, userId: string) {
    const enrollment = await this.knex('user_program_enrollments')
      .where({ id: enrollmentId, user_id: userId })
      .first()

    if (!enrollment || !['enrolled', 'active'].includes(enrollment.status)) {
      return null
    }

    // Compter les sessions programme de la semaine courante
    const weekScheduled = await this.knex('user_workout_schedule')
      .where({ user_id: userId, program_enrollment_id: enrollmentId })
      .whereRaw(`session_data->>'session_in_week' IS NOT NULL`)
      .count('* as total')

    const weekCompleted = await this.knex('user_workout_schedule')
      .where({ user_id: userId, program_enrollment_id: enrollmentId, status: 'completed' })
      .count('* as total')

    const total = Number((weekScheduled[0] as { total: string }).total)
    const completed = Number((weekCompleted[0] as { total: string }).total)

    if (total > 0 && completed >= total) {
      const nextWeek = enrollment.current_week + 1
      if (nextWeek > enrollment.total_sessions / enrollment.sessions_per_week) {
        return { auto_advanced: false, all_done: true }
      }
      return { auto_advanced: true, week_completed: enrollment.current_week, next_week: nextWeek }
    }

    return { auto_advanced: false, completed, total }
  }
}
