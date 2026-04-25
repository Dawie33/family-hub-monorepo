import { IsOptional, IsString, IsUUID } from 'class-validator'

export class CreateWorkoutSessionDto {
    @IsOptional()
    @IsUUID()
    workout_id?: string

    @IsOptional()
    @IsUUID()
    personalized_workout_id?: string

    @IsOptional()
    @IsString()
    started_at?: string
}

export class UpdateWorkoutSessionDto {
    @IsOptional()
    @IsString()
    completed_at?: string

    @IsOptional()
    @IsString()
    notes?: string

    @IsOptional()
    results?: Record<string, unknown>
}

export class WorkoutSession {
    id: string
    workout_id?: string
    personalized_workout_id?: string
    user_id: string
    started_at: string
    completed_at?: string
    notes?: string
    results?: Record<string, unknown>
    created_at: string
    updated_at: string
}
