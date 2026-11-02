import { Body, Controller, Post } from '@nestjs/common';
import { ContraOfertaService } from './contra-oferta.service';
import { CreateContraOfertaDto } from './dto/create-contra-oferta.dto';

@Controller('contra-oferta')
export class ContraOfertaController {
  constructor(private readonly contraOfertaService: ContraOfertaService) {}

  @Post('create')
  createContraOferta(
    @Body() dto: CreateContraOfertaDto
  ) {
    return this.contraOfertaService.createContraOferta(dto);
  }
}
