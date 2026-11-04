
import { BadRequestException } from '@nestjs/common';
import { DateTime } from 'luxon';
import { LlamarDentroDe } from 'src/contra-oferta/dto/create-contra-oferta.dto';

const ZONA_ESPANA = 'Europe/Madrid';

export function calcularDataNextCall(
  llamarDentroDe: LlamarDentroDe,
): string {
  const minutos: Record<LlamarDentroDe, number> = {
    [LlamarDentroDe.TREINTA_MINUTOS]: 30,
  };

  const cantidad = minutos[llamarDentroDe];

  if (cantidad === undefined) {
    throw new BadRequestException(
      'El valor de llamar_dentro_de no es válido',
    );
  }

  const fecha = DateTime.now()
    .setZone(ZONA_ESPANA)
    .plus({ minutes: cantidad })
    .toISO();

  if (!fecha) {
    throw new BadRequestException(
      'No se pudo calcular la fecha de llamada',
    );
  }

  return fecha;
}
