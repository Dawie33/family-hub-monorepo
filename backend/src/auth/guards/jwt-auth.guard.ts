import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
/**
 * Controller l'accès aux routes protégées par JWT
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') { }
