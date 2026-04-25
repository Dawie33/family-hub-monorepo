import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator'

export enum ExerciseCategory {
    STRENGTH = 'strength',
    CARDIO = 'cardio',
    GYMNASTICS = 'gymnastics',
    OLYMPIC_LIFTING = 'olympic_lifting',
    POWERLIFTING = 'powerlifting',
    ENDURANCE = 'endurance',
    MOBILITY = 'mobility'
}

export enum ExerciseDifficulty {
    BEGINNER = 'beginner',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced'
}

export enum MeasurementType {
    REPS = 'reps',
    TIME = 'time',
    DISTANCE = 'distance',
    WEIGHT = 'weight',
    CALORIES = 'calories'
}

export class CreateExerciseDto {
    @IsString()
    @IsNotEmpty()
    name!: string

    @IsString()
    @IsOptional()
    slug?: string

    @IsString()
    @IsOptional()
    description?: string

    @IsString()
    @IsOptional()
    instructions?: string

    @IsEnum(ExerciseCategory)
    @IsNotEmpty()
    category!: ExerciseCategory

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    muscle_groups?: string[]

    @IsEnum(ExerciseDifficulty)
    @IsNotEmpty()
    difficulty!: ExerciseDifficulty

    @IsArray()
    @IsOptional()
    scaling_options?: string[]

    @IsArray()
    @IsOptional()
    equipment_required?: string[]

    @IsBoolean()
    @IsOptional()
    bodyweight_only?: boolean

    @IsEnum(MeasurementType)
    @IsNotEmpty()
    measurement_type!: MeasurementType

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    contraindications?: string[]

    @IsString()
    @IsOptional()
    safety_notes?: string

    @IsUrl()
    @IsOptional()
    video_url?: string

    @IsUrl()
    @IsOptional()
    image_url?: string

    @IsBoolean()
    @IsOptional()
    isActive?: boolean
}

export class UpdateExerciseDto {
    @IsString()
    @IsOptional()
    name?: string

    @IsString()
    @IsOptional()
    slug?: string

    @IsString()
    @IsOptional()
    description?: string

    @IsString()
    @IsOptional()
    instructions?: string

    @IsEnum(ExerciseCategory)
    @IsOptional()
    category?: ExerciseCategory

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    muscle_groups?: string[]

    @IsEnum(ExerciseDifficulty)
    @IsOptional()
    difficulty?: ExerciseDifficulty

    @IsArray()
    @IsOptional()
    scaling_options?: string[]

    @IsArray()
    @IsOptional()
    equipment_required?: string[]

    @IsBoolean()
    @IsOptional()
    bodyweight_only?: boolean

    @IsEnum(MeasurementType)
    @IsOptional()
    measurement_type?: MeasurementType

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    contraindications?: string[]

    @IsString()
    @IsOptional()
    safety_notes?: string

    @IsUrl()
    @IsOptional()
    video_url?: string

    @IsUrl()
    @IsOptional()
    image_url?: string

    @IsBoolean()
    @IsOptional()
    isActive?: boolean
}

export class ExerciseQueryDto {
    @IsOptional()
    @IsString()
    limit?: string

    @IsOptional()
    @IsString()
    offset?: string

    @IsOptional()
    @IsString()
    search?: string

    @IsOptional()
    @IsEnum(ExerciseCategory)
    category?: ExerciseCategory

    @IsOptional()
    @IsEnum(ExerciseDifficulty)
    difficulty?: ExerciseDifficulty

    @IsOptional()
    @IsString()
    orderBy?: string

    @IsOptional()
    @IsString()
    orderDir?: 'asc' | 'desc'
}
