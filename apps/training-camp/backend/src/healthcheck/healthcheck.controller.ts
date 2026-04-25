import { Controller, Get, Ip, Logger } from '@nestjs/common'
import { HealthResponseDTO, InfoResponseDTO } from './dto/healthcheck.dto'
import { HealthcheckService } from './healthcheck.service'

@Controller()
export class HealthcheckController {
  private readonly logger = new Logger(HealthcheckController.name);

  constructor(private readonly healthcheckService: HealthcheckService) {}

  @Get('/health')
  async health(@Ip() request_ip: string): Promise<HealthResponseDTO> {
    this.logger.debug(`GET /health - received from client: ${request_ip}`);
    return { status: 'OK' };
  }

  @Get('/info')
  async getInfo(@Ip() request_ip: string): Promise<InfoResponseDTO> {
    this.logger.debug(`GET /info - received from client: {${request_ip}}`);
    return this.healthcheckService.readProjectDetails();
  }
}