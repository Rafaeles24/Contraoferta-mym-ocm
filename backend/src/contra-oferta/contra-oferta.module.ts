import { Module } from '@nestjs/common';
import { ContraOfertaService } from './contra-oferta.service';
import { ContraOfertaController } from './contra-oferta.controller';
import { OcmApiModule } from 'src/ocm-api/ocm-api.module';

@Module({
  imports: [OcmApiModule],
  controllers: [ContraOfertaController],
  providers: [ContraOfertaService],
})
export class ContraOfertaModule {}
