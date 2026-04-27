import { IsString } from 'class-validator'

export class SubstituteDto {
  @IsString()
  ingredient: string

  @IsString()
  recipeTitle: string
}
