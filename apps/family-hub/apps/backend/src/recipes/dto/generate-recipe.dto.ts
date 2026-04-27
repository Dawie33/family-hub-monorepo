import { IsArray, IsOptional, IsString } from 'class-validator'

export class GenerateRecipeDto {
  @IsArray()
  @IsString({ each: true })
  ingredients: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  filters?: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cuisineTypes?: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  platTypes?: string[]

  @IsOptional()
  @IsString()
  difficulty?: string

  @IsOptional()
  @IsString()
  maxDuration?: string
}
