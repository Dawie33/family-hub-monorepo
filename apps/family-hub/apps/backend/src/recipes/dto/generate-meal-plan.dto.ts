import { IsArray, IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class GenerateMealPlanDto {
  @IsNumber()
  @Min(1)
  numberOfMeals: number

  @IsNumber()
  @Min(1)
  numberOfPeople: number

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
