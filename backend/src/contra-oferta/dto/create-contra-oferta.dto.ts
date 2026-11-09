import { Transform } from "class-transformer";
import { IsEnum, IsInt, IsNotEmpty, IsNumberString, IsOptional, IsString, Min } from "class-validator";

export enum Prioridad {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  URGENTE = 'URGENTE'
}

export enum EstadoComercial {
  PENDIENTE_CONTRAOFERTA = 'PENDIENTE DE CONTRAOFERTA',
  VENTA = 'VENTA',
  NO_LOCALIZADO = 'NO LOCALIZADO',
  SEGUIMIENTO_KO = 'SEGUIMIENTO KO'
}

export enum LlamarDentroDe {
  DOS_MINUTOS = '2_MINUTOS',
  TREINTA_MINUTOS = '30_MINUTOS',
  UNA_HORA = '1_HORA',
  DOS_HORAS = '2_HORAS',
}


export class CreateContraOfertaDto {

  @IsString()
  @IsNotEmpty()
  solicitado_por!: string;

  @IsEnum(Prioridad)
  prioridad!: Prioridad;

  @IsEnum(EstadoComercial)
  estado_comercial!: EstadoComercial;

  @IsString()
  @IsNotEmpty()
  nombre_cliente!: string;

  @IsNumberString()
  @IsNotEmpty()
  @Transform(({ value }) => String(value).trim())
  movil_contacto!: string;

  @IsString()
  @IsNotEmpty()
  nombre_coordinador_supervisor!: string;

  @IsString()
  @IsNotEmpty()
  nombre_asesor!: string;

  @IsString()
  @IsNotEmpty()
  operador_cliente!: string;

  @IsString()
  @IsNotEmpty()
  campania!: string;

  @IsString()
  @IsOptional()
  paga?: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsInt()
  @Min(1)
  cantidad_moviles!: number;

  @IsEnum(LlamarDentroDe)
  llamar_dentro_de!: LlamarDentroDe;

  @IsString()
  @IsOptional()
  contraoferta?: string;
}