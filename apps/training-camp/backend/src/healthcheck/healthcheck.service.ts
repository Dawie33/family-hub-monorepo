import { Injectable, Logger } from '@nestjs/common'
import * as fs from 'fs'
import * as path from 'path'
import { InfoResponseDTO } from './dto/healthcheck.dto'

@Injectable()
export class HealthcheckService {
  readProjectDetails(): InfoResponseDTO {
    // Lecture du package.json pour récupérer les infos
    const pkgPath = path.resolve(__dirname, '../../package.json');
    let pkg = { name: '', version: '', description: '' };
    try {
      pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    } catch (e) {
     Logger.error(`Failed to read package.json: ${e.message}`);
    }
    return {
      name: pkg.name || 'training-camp-backend',
      version: pkg.version || 'unknown',
      description: pkg.description || '',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}