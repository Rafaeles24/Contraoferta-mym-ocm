import type { SolicitudComercial } from "@/types/form";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

type RespuestaContraOferta = {
  result?: string;
  description?: string;
  message?: string | string[];
  statusCode?: number;
  [key: string]: unknown;
};

export async function crearContraOferta(data: SolicitudComercial) {
  if (!API_URL) {
    throw new Error("No se configuró la URL del backend");
  }

  const response = await fetch(
    `${API_URL.replace(/\/$/, "")}/system/api/contra-oferta/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  const texto = await response.text();

  let resultado: RespuestaContraOferta = {};

  if (texto) {
    try {
      resultado = JSON.parse(texto);
    } catch {
      throw new Error(
        `Respuesta no válida del backend (HTTP ${response.status}): ${texto}`
      );
    }
  }

  console.log("Respuesta del backend:", resultado);

  if (!response.ok) {
    const mensaje = resultado.message ?? resultado.description;

    throw new Error(
      Array.isArray(mensaje)
        ? mensaje.join(", ")
        : mensaje ?? `Error HTTP ${response.status}`
    );
  }

  if (resultado.result?.toLowerCase() === "error") {
    throw new Error(
      resultado.description ?? "OCM rechazó la contraoferta."
    );
  }

  return resultado;
}