import { Injectable, Logger, Inject } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { CurrentWeather } from './weather.interface'
import { WEATHER_DESCRIPTIONS } from './weather.constants'

const CACHE_KEY = 'weather:current'
const CACHE_TTL_MS = 30 * 60 * 1000

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name)
  private readonly API_URL =
    'https://api.open-meteo.com/v1/forecast?latitude=44.6533&longitude=-0.6167&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=Europe/Paris'

  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  async getCurrentWeather(): Promise<CurrentWeather> {
    const cached = await this.cache.get<CurrentWeather>(CACHE_KEY)
    if (cached) {
      this.logger.debug('Returning cached weather data (Redis)')
      return cached
    }

    try {
      const response = await fetch(this.API_URL)
      if (!response.ok) {
        this.logger.error(`Open-Meteo API error: ${response.status}`)
        throw new Error(`Open-Meteo API error: ${response.status}`)
      }

      const data = await response.json()
      const current = data.current

      const weather: CurrentWeather = {
        temperature: Math.round(current.temperature_2m),
        apparentTemperature: Math.round(current.apparent_temperature),
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        weatherCode: current.weather_code,
        description: WEATHER_DESCRIPTIONS[current.weather_code] || 'Inconnu',
      }

      await this.cache.set(CACHE_KEY, weather, CACHE_TTL_MS)
      this.logger.log(`Weather fetched: ${weather.temperature}°C, ${weather.description}`)
      return weather
    } catch (error) {
      const stale = await this.cache.get<CurrentWeather>(CACHE_KEY)
      if (stale) {
        this.logger.warn('API failed, returning stale cache')
        return stale
      }
      this.logger.error('Failed to fetch weather:', error)
      throw error
    }
  }
}
