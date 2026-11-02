import { Controller, Post } from '@nestjs/common';
import { OcmApiService } from './ocm-api.service';

@Controller('ocm-api')
export class OcmApiController {
  constructor(private readonly ocmApiService: OcmApiService) {}

  @Post('auth')
  auth() {
    return this.ocmApiService.getToken();
  }
}
