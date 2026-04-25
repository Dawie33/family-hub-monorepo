import { Injectable } from '@nestjs/common'
import { google } from 'googleapis'
import { Knex } from 'knex'
import { InjectModel } from 'nest-knexjs'

@Injectable()
export class GoogleCalendarService {
  constructor(@InjectModel() private readonly knex: Knex) { }

  /**
  * Renvoie une nouvelle instance de client OAuth2 configurée avec les
  * identifiants Google OAuth2 de l'application.
  * @returns {google.auth.OAuth2} Une nouvelle instance de client OAuth2.
  */
  private getOAuth2Client() {
    return new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    )
  }

  /**
  * Renvoie une URL d'autorisation que l'utilisateur peut utiliser pour autoriser l'application 
  * à accéder à son agenda Google.
  * @param {string} userId L'identifiant de l'utilisateur.
  * @returns {string} L'URL d'autorisation.
  */
  getAuthUrl(userId: string): string {
    const oauth2Client = this.getOAuth2Client()
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['https://www.googleapis.com/auth/calendar'],
      state: userId,
    })
  }

  /**
  * Gère le rappel d'autorisation de Google OAuth2.
  * @param {string} code Le code d'autorisation.
  * @param {string} userId L'identifiant de l'utilisateur.
  * @returns {Promise<void>} Une promesse résolue lorsque le jeton d'actualisation Google de l'utilisateur est mis à jour.
  */
  async handleCallback(code: string, userId: string): Promise<void> {
    const oauth2Client = this.getOAuth2Client()
    const { tokens } = await oauth2Client.getToken(code)

    await this.knex('users')
      .where({ id: userId })
      .update({ google_refresh_token: tokens.refresh_token })
  }

  /**
  * Synchronise une séance d'entraînement avec Google Agenda.
  * @param userId L'identifiant de l'utilisateur.
  * @param workout La séance d'entraînement à synchroniser.
  * @returns L'identifiant de l'événement créé en cas de succès, null sinon.
  */
  async syncWorkout(
    userId: string,
    workout: {
      name: string
      scheduledDate: string
      duration?: number
      type?: string
    },
  ): Promise<string | null> {
    const user = await this.knex('users').where({ id: userId }).first()

    if (!user?.google_refresh_token) return null

    const oauth2Client = this.getOAuth2Client()
    oauth2Client.setCredentials({ refresh_token: user.google_refresh_token })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    const startDate = new Date(workout.scheduledDate)
    startDate.setHours(7, 0, 0, 0)
    const endDate = new Date(startDate)
    endDate.setMinutes(endDate.getMinutes() + (workout.duration ?? 60))

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: `🏋️ ${workout.name}`,
        description: workout.type ? `Type: ${workout.type.replace(/_/g, ' ')}` : undefined,
        start: { dateTime: startDate.toISOString() },
        end: { dateTime: endDate.toISOString() },
        colorId: '11',
      },
    })

    return response.data.id ?? null
  }

  /**
   * Vérifie si l'utilisateur est connecté à Google Calendar.
   * @param userId ID de l'utilisateur
   * @returns Promesse qui se résout en true si l'utilisateur est connecté, false sinon
   */
  async isConnected(userId: string): Promise<boolean> {
    const user = await this.knex('users').where({ id: userId }).first()
    return !!user?.google_refresh_token
  }

  /**
   * Révoque le token d'accès Google Calendar de l'utilisateur
   * et supprime la référence au token dans la base de données.
   * @param userId ID de l'utilisateur
   * @returns Promesse qui se résout en rien
   */
  async disconnect(userId: string): Promise<void> {
    const user = await this.knex('users').where({ id: userId }).first()

    if (user?.google_refresh_token) {
      try {
        const oauth2Client = this.getOAuth2Client()
        await oauth2Client.revokeToken(user.google_refresh_token)
      } catch {
        // Token déjà révoqué côté Google, on continue quand même
      }
    }

    await this.knex('users')
      .where({ id: userId })
      .update({ google_refresh_token: null })
  }
}
