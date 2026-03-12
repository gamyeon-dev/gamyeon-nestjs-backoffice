import {
  Injectable,
  Logger,
  OnModuleInit,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Consul from 'consul';

@Injectable()
export class ConsulService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(ConsulService.name);
  private client: Consul.Consul;
  private serviceId: string;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const consulHost = this.config.get<string>('CONSUL_HOST', 'localhost');
    const consulPort = parseInt(this.config.get<string>('CONSUL_PORT', '8500'), 10);
    const serviceName = this.config.get<string>(
      'CONSUL_SERVICE_NAME',
      'GAMYEON_BACKOFFICE_SERVER',
    );
    const servicePort = parseInt(this.config.get<string>('PORT', '3000'), 10);
    const serviceAddress = this.config.get<string>(
      'CONSUL_SERVICE_ADDRESS',
      'localhost',
    );

    this.serviceId = `${serviceName}:${Math.random().toString(36).slice(2, 10)}`;

    this.client = new Consul({ host: consulHost, port: consulPort, promisify: true });

    try {
      await (this.client.agent.service as any).register({
        id: this.serviceId,
        name: serviceName,
        address: serviceAddress,
        port: servicePort,
        check: {
          http: `http://${serviceAddress}:${servicePort}/health`,
          interval: '10s',
          deregistercriticalserviceafter: '30s',
        },
      });
      this.logger.log(
        `Consul 서비스 등록 완료 — id: ${this.serviceId}, address: ${serviceAddress}:${servicePort}`,
      );
    } catch (err) {
      this.logger.error(
        `Consul 서비스 등록 실패 (서버는 정상 기동) — ${err.message}`,
      );
    }
  }

  async onApplicationShutdown() {
    if (!this.client || !this.serviceId) return;
    try {
      await (this.client.agent.service as any).deregister(this.serviceId);
      this.logger.log(`Consul 서비스 해제 완료 — id: ${this.serviceId}`);
    } catch (err) {
      this.logger.error(`Consul 서비스 해제 실패 — ${err.message}`);
    }
  }
}
