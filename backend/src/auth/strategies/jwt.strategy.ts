import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Request } from 'express'
import { AuthService } from '../auth.service'

interface JwtPayload {
  sub: string
  email: string
  iat?: number
  exp?: number
}

/**
 * JwtStrategy extrait le token depuis le cookie httpOnly 'access_token'.
 * Fallback sur le header Authorization Bearer pour la compatibilité.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request?.cookies?.access_token ?? null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    })
  }

  async validate(payload: JwtPayload) {
    const user = await this.authService.validateUser(payload.sub)
    if (!user) {
      throw new UnauthorizedException()
    }
    return user
  }
}
