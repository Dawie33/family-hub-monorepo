import { IsIn, IsNumber, Min } from 'class-validator'

export class UpsertOneRepMaxDto {
  @IsNumber()
  @Min(0)
  value!: number

  @IsIn(['real', 'estimated'])
  source!: 'real' | 'estimated'
}
