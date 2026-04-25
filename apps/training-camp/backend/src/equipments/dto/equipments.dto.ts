import { IsNotEmpty, IsObject, IsOptional, IsString, IsUUID } from 'class-validator'

export class CreateEquipmentDto {
    @IsString()
    @IsNotEmpty()
    label!: string

    @IsString()
    @IsOptional()
    slug?: string

    @IsString()
    @IsOptional()
    description?: string

    @IsObject()
    @IsOptional()
    meta?: Record<string, string>

    @IsString()
    @IsOptional()
    image_url?: string
}

export class UpdateEquipmentDto {
    @IsString()
    @IsOptional()
    label?: string

    @IsString()
    @IsOptional()
    slug?: string

    @IsString()
    @IsOptional()
    description?: string

    @IsObject()
    @IsOptional()
    meta?: Record<string, string>

    @IsString()
    @IsOptional()
    image_url?: string
}


export class UserEquipmentDto {
    @IsUUID()
    @IsNotEmpty()
    user_id!: string

    @IsUUID()
    @IsNotEmpty()
    equipment_id!: string

    @IsOptional()
    @IsObject()
    meta?: Record<string, string>
}

export class EquipmentQueryDto {
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
    @IsString()
    orderBy?: string

    @IsOptional()
    @IsString()
    orderDir?: 'asc' | 'desc'
}