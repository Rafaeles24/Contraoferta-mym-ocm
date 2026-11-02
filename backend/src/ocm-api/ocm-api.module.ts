import { Module } from '@nestjs/common';
import { OcmApiService } from './ocm-api.service';
import { OcmApiController } from './ocm-api.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 0,
    })
  ],
  controllers: [OcmApiController],
  providers: [OcmApiService],
  exports: [OcmApiService],
})
export class OcmApiModule {}
