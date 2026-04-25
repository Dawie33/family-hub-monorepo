export class HealthResponseDTO {
  status: string;
}

export class InfoResponseDTO {
  name: string;
  version: string;
  description?: string;
  uptime: number;
  timestamp: string;
}
