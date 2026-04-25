import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { Knex } from 'knex'
import { InjectModel } from 'nest-knexjs'
import { AuthResponseDto, LoginDto, SignupDto } from './dto/auth.dto'
import { UpdateProfileDto } from './dto/update-profile.dto'

@Injectable()
export class AuthService {
  constructor(
    @InjectModel() private readonly knex: Knex,
    private jwtService: JwtService
  ) { }

  /**
   * Inscrire un nouvel utilisateur.
   * @param {SignupDto} signupDto - les données de l'utilisateur.
   * @returns {Promise<AuthResponseDto>} - le token JWT et les données de l'utilisateur.
   * @throws {ConflictException} - si l'utilisateur existe deja.
   */
  async signup(signupDto: SignupDto): Promise<AuthResponseDto> {
    const { email, password, firstName, lastName } = signupDto

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.knex('users').where({ email }).first()
    if (existingUser) {
      throw new ConflictException('Email already exists')
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)

    // Créer l'utilisateur
    const [user] = await this.knex('users')
      .insert({
        email,
        password: hashedPassword,
        firstName,
        lastName,
      })
      .returning(['id', 'email', 'firstName', 'lastName'])

    // Générer le token JWT
    const payload = { sub: user.id, email: user.email }
    const access_token = this.jwtService.sign(payload)

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    }
  }

  /**
   * Authentifier un utilisateur.
   * @param {LoginDto} loginDto - les données de connexion de l'utilisateur.
   * @returns {Promise<AuthResponseDto>} - le token JWT et les données de l'utilisateur.
   * @throws {UnauthorizedException} - si les données de connexion sont invalides.
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto

    // Trouver l'utilisateur
    const user = await this.knex('users')
      .where({ email })
      .first()

    if (!user) {
      throw new UnauthorizedException('Les données de connexion sont invalides')
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Les données de connexion sont invalides')
    }

    // Mettre à jour lastLoginAt
    await this.knex('users')
      .where({ id: user.id })
      .update({ lastLoginAt: this.knex.fn.now() })

    // Générer le token JWT
    const payload = { sub: user.id, email: user.email }
    const access_token = this.jwtService.sign(payload)

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    }
  }

  /**
   * Validation de l'utilisateur en fonction de son identifiant.
   * Si l'utilisateur n'est pas trouvé ou n'est pas actif on leve une exception.
   * @param {string} userId - Identifiant de l'utilisateur.
   * @returns {Promise<User>} - utilisateur si existant.
   */
  async validateUser(userId: string) {
    const user = await this.knex('users')
      .where({ id: userId })
      .first(['id', 'email', 'firstName', 'lastName', 'role', 'isActive'])

    if (!user || !user.isActive) {
      return null
    }

    return user
  }

  /**
   * Mettre à jour le profil d'un utilisateur
   * @param {string} userId - Identifiant de l'utilisateur
   * @param {UpdateProfileDto} updateProfileDto - Données du profil à mettre à jour
   * @returns {Promise<User>} - Utilisateur mis à jour
   */
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const trx = await this.knex.transaction()

    try {
      // Colonnes JSON/JSONB (objets et arrays) qui nécessitent une conversion
      const jsonColumns = [
        'global_goals',
        'injuries',
        'physical_limitations',
        'equipment_available',
        'training_preferences',
        'schedule_preferences'
      ]

      // Extraire equipment_available pour traitement séparé
      const { equipment_available, ...restData } = updateProfileDto

      // Filtrer les valeurs undefined et convertir les colonnes JSON
      const dataToUpdate = Object.entries(restData).reduce<Record<string, string | number | boolean>>((acc, [key, value]) => {
        if (value !== undefined) {
          // Convertir les colonnes JSON (objets et arrays) en string pour PostgreSQL
          if (jsonColumns.includes(key)) {
            acc[key] = JSON.stringify(value)
          } else {
            acc[key] = value as string | number | boolean
          }
        }
        return acc
      }, {})

      if (equipment_available !== undefined) {
        dataToUpdate.equipment_available = JSON.stringify(equipment_available)
      }

      // Mettre à jour la table users
      let user: UpdateProfileDto
      if (Object.keys(dataToUpdate).length > 0) {
        const [updatedUser] = await trx('users')
          .where({ id: userId })
          .update(dataToUpdate)
          .returning(['id', 'email', 'firstName', 'lastName', 'dateOfBirth', 'gender', 'sport_level', 'height', 'weight'])
        user = updatedUser
      } else {
        user = await trx('users')
          .where({ id: userId })
          .first(['id', 'email', 'firstName', 'lastName', 'dateOfBirth', 'gender', 'sport_level', 'height', 'weight'])
      }

      // Gérer les équipements (user_equipments)
      if (equipment_available && equipment_available.length > 0) {
        // Supprimer les anciennes associations
        await trx('user_equipments').where({ user_id: userId }).delete()

        // Récupérer les IDs des équipements à partir des slugs
        const equipments = await trx('equipments')
          .whereIn('slug', equipment_available)
          .select('id', 'slug')

        // Insérer les nouvelles associations
        const equipmentInserts = equipments.map(equip => ({
          user_id: userId,
          equipment_id: equip.id,
          available: true,
          meta: {}
        }))

        if (equipmentInserts.length > 0) {
          await trx('user_equipments').insert(equipmentInserts)
        }
      }

      await trx.commit()
      return user
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  /**
   * Récupérer le profil complet d'un utilisateur
   * @param {string} userId - Identifiant de l'utilisateur
   * @returns {Promise<User>} - Profil complet de l'utilisateur
   */
  async getFullProfile(userId: string) {
    const user = await this.knex('users')
      .where({ id: userId })
      .first()

    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    // Ne pas retourner le mot de passe
    delete user.password

    return user
  }
}
