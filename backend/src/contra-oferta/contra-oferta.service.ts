import { Injectable, Logger } from '@nestjs/common';
import { CreateContraOfertaDto } from './dto/create-contra-oferta.dto';
import { OcmApiService } from 'src/ocm-api/ocm-api.service';
import { calcularDataNextCall } from 'src/utils/contra-oferta.utils';

@Injectable()
export class ContraOfertaService {

  private readonly logger = new Logger(ContraOfertaService.name);
  
  constructor (
    private readonly ocmApiService: OcmApiService
  ) {}

  async createContraOferta(dto: CreateContraOfertaDto) {

    await this.ocmApiService.getToken();

    const datenextcall = calcularDataNextCall(dto.llamar_dentro_de);

    const payload = {
      phone1: dto.movil_contacto,
      phone2: process.env.PHONE_2,
      phone3: process.env.PHONE_3,
      phone4: process.env.PHONE_4,
      phone5: process.env.PHONE_5,
      skilldata: process.env.SKILL_DATA,
      idload: process.env.ID_LOAD,
      datenextcall,
      extendata: {
        ...dto,
        solicitado_para: 'Deyvi Jhossue Juárez Silva'
      }
    };

    /*console.log('Payload:', payload); */

    this.logger.log(`Creando contraoferta para ${dto.nombre_cliente}`);

    const response = await this.ocmApiService.post('OCMAPI/V2/AddReg', payload);

    return response;
  }
}
