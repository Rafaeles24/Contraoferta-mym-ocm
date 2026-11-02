import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadGatewayException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthResponse } from './interface/auth.interface';

@Injectable()
export class OcmApiService {
  private readonly logger = new Logger(OcmApiService.name);

  private authResponse: AuthResponse | null = null;
  private expiresAt = 0;
  private loginPromise: Promise<AuthResponse> | null = null;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Obtiene la autenticación OCM.
   * Reutiliza el token mientras siga vigente.
   */
  async getToken(): Promise<AuthResponse> {
    if (
      this.authResponse?.data?.token &&
      Date.now() < this.expiresAt
    ) {
      return this.authResponse;
    }

    if (!this.loginPromise) {
      this.loginPromise = this.authenticate().finally(() => {
        this.loginPromise = null;
      });
    }

    return this.loginPromise;
  }

  /**
   * Login contra OCM.
   */
  private async authenticate(): Promise<AuthResponse> {
    const baseUrl = this.getBaseUrl();

    const username = this.configService.getOrThrow<string>(
      'OCM_API_USERNAME',
    );

    const password = this.configService.getOrThrow<string>(
      'OCM_API_PASSWORD',
    );

    try {
      this.logger.log('Iniciando autenticación con OCM API');

      const response = await this.httpService.axiosRef.post<AuthResponse>(
        `${baseUrl}/OCMAPI/Authorization`,
        {
          user: username,
          password,
        },
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );

      const body = response.data;

      this.logger.debug(`HTTP Status: ${response.status}`);
      this.logger.debug(`Resultado OCM: ${body?.result}`);

      if (
        !body ||
        body.result !== 'ok' ||
        !body.data?.token
      ) {
        const description =
          body?.description ??
          'OCM rechazó la solicitud de autenticación';

        this.logger.error(
          `Autenticación OCM rechazada: ${description}`,
        );

        throw new UnauthorizedException(description);
      }

      this.authResponse = body;

      // 9 minutos 30 segundos
      this.expiresAt = Date.now() + 570000;

      this.logger.log(
        `Autenticación OCM correcta: ${body.data.name}`,
      );

      return body;
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      const message =
        error instanceof Error
          ? error.message
          : String(error);

      this.logger.error(
        `Error al autenticar con OCM API: ${message}`,
      );

      throw new UnauthorizedException(
        'No se pudo autenticar con el servidor OCM',
      );
    }
  }

  /**
   * Envía información a OCM utilizando el token.
   *
   * Si el token falla por autorización:
   * - lo invalida
   * - obtiene uno nuevo
   * - reintenta UNA vez
   */
  async post<TResponse = unknown>(
    endpoint: string,
    payload: unknown,
  ): Promise<TResponse> {
    try {
      return await this.executePost<TResponse>(
        endpoint,
        payload,
      );
    } catch (error: any) {
      const status = error?.response?.status;

      /**
       * Token vencido o rechazado.
       */
      if (status === 401 || status === 403) {
        this.logger.warn(
          'OCM rechazó el token. Se obtendrá uno nuevo.',
        );

        this.invalidateToken();

        return this.executePost<TResponse>(
          endpoint,
          payload,
        );
      }

      throw error;
    }
  }

  private async executePost<TResponse>(
    endpoint: string,
    payload: unknown,
  ): Promise<TResponse> {
    const baseUrl = this.getBaseUrl();

    const auth = await this.getToken();

    const token = auth.data?.token;

    if (!token) {
      throw new UnauthorizedException('La respuesta de OCM no contiene un token');
    }

    const cleanEndpoint = endpoint.startsWith('/')
      ? endpoint
      : `/${endpoint}`;

    const url = `${baseUrl}${cleanEndpoint}`;

    try {
      this.logger.log(
        `Enviando solicitud POST a OCM: ${cleanEndpoint}`,
      );

      const response =
        await this.httpService.axiosRef.post<TResponse>(
          url,
          payload,
          {
            timeout: 15000,

            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',

              /**
               * Si OCM utiliza Bearer:
               */
              Authorization: `Bearer ${token}`,
            },
          },
        );

      this.logger.debug(
        `OCM ${cleanEndpoint} HTTP ${response.status}`,
      );

      return response.data;
    } catch (error: any) {
      const status = error?.response?.status;

      const responseData = error?.response?.data;

      this.logger.error(
        `Error OCM ${cleanEndpoint}: HTTP ${
          status ?? 'SIN STATUS'
        } - ${JSON.stringify(responseData ?? error?.message)}`,
      );

      if (status === 401 || status === 403) {
        throw error;
      }

      throw new BadGatewayException({
        message: 'OCM rechazó la solicitud',
        status,
        response: responseData ?? null,
      });
    }
  }

  private getBaseUrl(): string {
    return this.configService
      .getOrThrow<string>('OCM_API_URL')
      .replace(/\/$/, '');
  }

  invalidateToken(): void {
    this.authResponse = null;
    this.expiresAt = 0;

    this.logger.log('Token OCM invalidado');
  }
}