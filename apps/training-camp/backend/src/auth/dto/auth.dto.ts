import { IsEmail, IsString, MinLength } from 'class-validator'

/**
 * DTOs pour l'authentification
 */
export class SignupDto {
  @IsEmail()
  email: string

  @IsString()
  @MinLength(6)
  password: string

  @IsString()
  firstName: string

  @IsString()
  lastName: string
}

export class LoginDto {
  @IsEmail()
  email: string

  @IsString()
  @MinLength(6)
  password: string
}

export class AuthResponseDto {
  access_token: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
  }
}
