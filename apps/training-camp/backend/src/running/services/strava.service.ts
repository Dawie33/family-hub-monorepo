import { Injectable } from '@nestjs/common'
import { Knex } from 'knex'
import { InjectModel } from 'nest-knexjs'

interface StravaTokenResponse {
  access_token: string
  refresh_token: string
  athlete: { id: number }
}

interface StravaActivity {
  id: number
  name: string
  type: string
  sport_type: string
  start_date_local: string
  distance: number           // mètres
  moving_time: number        // secondes
  total_elevation_gain: number
  average_heartrate?: number
  max_heartrate?: number
  calories?: number
  average_speed: number      // m/s
}

@Injectable()
export class StravaService {
  constructor(@InjectModel() private readonly knex: Knex) {}

  getAuthUrl(userId: string): string {
    const params = new URLSearchParams({
      client_id: process.env.STRAVA_CLIENT_ID!,
      redirect_uri: process.env.STRAVA_REDIRECT_URI!,
      response_type: 'code',
      scope: 'activity:read_all',
      state: userId,
    })
    return `https://www.strava.com/oauth/authorize?${params.toString()}`
  }

  async handleCallback(code: string, userId: string): Promise<void> {
    const res = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      }),
    })

    if (!res.ok) throw new Error(`Strava token exchange failed: ${res.statusText}`)

    const data: StravaTokenResponse = await res.json()

    await this.knex('users').where({ id: userId }).update({
      strava_refresh_token: data.refresh_token,
      strava_athlete_id: data.athlete.id,
    })
  }

  async isConnected(userId: string): Promise<boolean> {
    const user = await this.knex('users').where({ id: userId }).first()
    return !!user?.strava_refresh_token
  }

  async disconnect(userId: string): Promise<void> {
    await this.knex('users').where({ id: userId }).update({
      strava_refresh_token: null,
      strava_athlete_id: null,
    })
  }

  private async getAccessToken(userId: string): Promise<string> {
    const user = await this.knex('users')
      .select('strava_refresh_token')
      .where({ id: userId })
      .first()

    if (!user?.strava_refresh_token) throw new Error('Strava non connecté')

    const res = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        refresh_token: user.strava_refresh_token,
        grant_type: 'refresh_token',
      }),
    })

    if (!res.ok) throw new Error(`Strava token refresh failed: ${res.statusText}`)

    const data: StravaTokenResponse = await res.json()

    // Mettre à jour le refresh token si Strava en retourne un nouveau
    if (data.refresh_token !== user.strava_refresh_token) {
      await this.knex('users').where({ id: userId }).update({ strava_refresh_token: data.refresh_token })
    }

    return data.access_token
  }

  /**
   * Synchronise les activités running récentes depuis Strava
   * Retourne le nombre de nouvelles sessions importées
   */
  async syncActivities(userId: string, limit = 30): Promise<{ imported: number; skipped: number }> {
    const accessToken = await this.getAccessToken(userId)

    // Récupérer les activités Strava (filtrées côté Strava sur 90 jours)
    const after = Math.floor(Date.now() / 1000) - 90 * 24 * 3600
    const res = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?per_page=${limit}&after=${after}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )

    if (!res.ok) throw new Error(`Strava activities fetch failed: ${res.statusText}`)

    const activities: StravaActivity[] = await res.json()

    // Garder uniquement les activités running
    const runs = activities.filter((a) =>
      ['Run', 'TrailRun', 'VirtualRun'].includes(a.sport_type ?? a.type),
    )

    let imported = 0
    let skipped = 0

    for (const run of runs) {
      // Vérifier si déjà importé
      const existing = await this.knex('running_sessions')
        .where('strava_activity_id', String(run.id))
        .first()

      if (existing) {
        skipped++
        continue
      }

      const distanceKm = run.distance / 1000
      const avgPaceSecondsPerKm = distanceKm > 0
        ? Math.round(run.moving_time / distanceKm)
        : null

      await this.knex('running_sessions').insert({
        user_id: userId,
        session_date: run.start_date_local.slice(0, 10),
        run_type: this.inferRunType(run),
        source: 'strava',
        distance_km: distanceKm > 0 ? distanceKm.toFixed(2) : null,
        duration_seconds: run.moving_time || null,
        avg_pace_seconds_per_km: avgPaceSecondsPerKm,
        avg_heart_rate: run.average_heartrate || null,
        max_heart_rate: run.max_heartrate || null,
        elevation_gain_m: run.total_elevation_gain || null,
        calories: run.calories || null,
        strava_activity_id: String(run.id),
        notes: run.name || null,
      })

      imported++
    }

    return { imported, skipped }
  }

  /**
   * Déduit le type de sortie en fonction de la durée et du dénivelé
   */
  private inferRunType(run: StravaActivity): string {
    const durationMin = run.moving_time / 60
    const distanceKm = run.distance / 1000

    if (durationMin <= 30 && distanceKm < 5) return 'recovery'
    if (durationMin >= 60 || distanceKm >= 12) return 'long_run'
    return 'easy'
  }
}
