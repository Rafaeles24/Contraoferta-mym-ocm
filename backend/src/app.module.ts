import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContraOfertaModule } from './contra-oferta/contra-oferta.module';
import { ConfigModule } from '@nestjs/config';
import { OcmApiModule } from './ocm-api/ocm-api.module';

@Module({
  imports: [ContraOfertaModule,
    ConfigModule.forRoot({
      isGlobal: true
    }),
    OcmApiModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
