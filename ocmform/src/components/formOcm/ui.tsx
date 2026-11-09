"use client";

import { useState, type FormEvent } from "react";

import {
  FileText,
  Info,
  Users,
  UserRound,
  Phone,
  RadioTower,
  Megaphone,
  Wallet,
  Smartphone,
  MapPin,
  AlertTriangle,
  Tag,
  MessageSquareText,
  Send,
  Clock3,
} from "lucide-react";

import styles from "./ui.module.css";

import { SolicitudComercial } from "@/types/form";
import { crearContraOferta } from "@/services/contraOferta.service";

const formularioVacio: SolicitudComercial = {
  solicitado_por: "",
  prioridad: "",
  estado_comercial: "",
  nombre_cliente: "",
  movil_contacto: "",
  nombre_coordinador_supervisor: "",
  nombre_asesor: "",
  operador_cliente: "",
  campania: "",
  paga: "",
  direccion: "",
  cantidad_moviles: 0,

  // Tiempo fijo para todas las solicitudes
  llamar_dentro_de: "30_MINUTOS",

  contraoferta: "",
};

export default function SolicitudComercialUI() {
  const [form, setForm] = useState<SolicitudComercial>(() => ({
    ...formularioVacio,
  }));

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const actualizar = <K extends keyof SolicitudComercial>(
    campo: K,
    valor: SolicitudComercial[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));

    setError("");
  };

  const enviar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Evita que se envíe varias veces el mismo formulario
    if (enviando) return;

    setError("");
    setMensaje("");

    if (!/^\d{9}$/.test(form.movil_contacto)) {
      setError("El móvil debe contener 9 dígitos.");
      return;
    }

    if (
      !Number.isFinite(Number(form.paga)) ||
      form.paga.trim() === "" ||
      Number(form.paga) < 0
    ) {
      setError("Ingresa un importe válido.");
      return;
    }

    if (
      !Number.isInteger(form.cantidad_moviles) ||
      form.cantidad_moviles < 1
    ) {
      setError("La cantidad de móviles debe ser mayor a cero.");
      return;
    }

    setEnviando(true);

    try {
      console.log(
        "JSON enviado desde Next.js:",
        JSON.stringify(form, null, 2)
      );

      const resultado = await crearContraOferta(form);

      console.log("Respuesta de OCM:", resultado);

      setMensaje("Contraoferta enviada a OCM correctamente.");

      setForm({
        ...formularioVacio,
      });
    } catch (error) {
      console.error(
        `error al enviar contraoferta: ${
          error instanceof Error
            ? error.message
            : "No se pudo enviar la contraoferta"
        }`
      );

      setError(
        error instanceof Error
          ? error.message
          : "No se pudo enviar la contraoferta"
      );
    } finally {
      setEnviando(false);
    }
  };

  const campo = (
    label: string,
    name: keyof SolicitudComercial,
    icon: React.ReactNode,
    options?: string[]
  ) => {
    const valor = String(form[name]);

    return (
      <div className={styles.field}>
        <label htmlFor={name}>
          {label} <span className={styles.required}>*</span>
        </label>

        <div className={styles.inputWrap}>
          <span className={styles.inputIcon}>{icon}</span>

          {options ? (
            <select
              id={name}
              name={name}
              value={valor}
              onChange={(e) =>
                actualizar(name, e.target.value as never)
              }
              required
            >
              <option value="" disabled>
                Seleccionar...
              </option>

              {options.map((option) => (
                <option key={option} value={option}>
                  {option.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={name}
              name={name}
              value={valor}
              onChange={(e) => {
                if (name === "cantidad_moviles") {
                  actualizar(name, Number(e.target.value));
                } else {
                  actualizar(name, e.target.value as never);
                }
              }}
              type={
                name === "cantidad_moviles" || name === "paga"
                  ? "number"
                  : name === "movil_contacto"
                    ? "tel"
                    : "text"
              }
              min={name === "cantidad_moviles" ? 1 : undefined}
              step={name === "paga" ? "0.01" : undefined}
              inputMode={
                name === "movil_contacto"
                  ? "numeric"
                  : undefined
              }
              maxLength={
                name === "movil_contacto"
                  ? 9
                  : undefined
              }
              required
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <main className={styles.page}>
      <form
        className={styles.formCard}
        onSubmit={enviar}
      >
        {/* ENCABEZADO */}
        <header className={styles.header}>
          <div className={styles.headerIcon}>
            <FileText size={32} />
          </div>

          <div className={styles.headerText}>
            <h1>Solicitud a OCM</h1>

            <p>
              Complete la información de la solicitud y
              datos del cliente
            </p>
          </div>
        </header>

        {/* INFORMACIÓN GENERAL */}
        <section
          className={`${styles.section} ${styles.blue}`}
        >
          <div className={styles.sectionHeader}>
            <Info size={20} />
            <h2>Información general</h2>
          </div>

          <div className={styles.sectionBody}>
            {/* EQUIPO ASIGNADO AHORA APARECE PRIMERO */}
            <div className={styles.gridTwo}>
              {campo(
                "Coordinador / Supervisor",
                "nombre_coordinador_supervisor",
                <Users size={19} />
              )}

              {campo(
                "Asesor",
                "nombre_asesor",
                <UserRound size={19} />
              )}
            </div>

            <div className={styles.gridThree}>
              {campo(
                "Solicitado por",
                "solicitado_por",
                <UserRound size={19} />
              )}

              {campo(
                "Prioridad",
                "prioridad",
                <AlertTriangle size={19} />,
                [
                  "BAJA",
                  "MEDIA",
                  "ALTA",
                  "URGENTE",
                ]
              )}

              {campo(
                "Estado comercial",
                "estado_comercial",
                <Tag size={19} />,
                [
                  "PENDIENTE DE CONTRAOFERTA",
                  "VENTA",
                  "NO LOCALIZADO",
                  "SEGUIMIENTO KO",
                ]
              )}
            </div>

            {/* TIEMPO PARA LLAMAR */}
            <div className={styles.reminderRow}>
              <div className={styles.reminderLabel}>
                <Clock3 size={18} />
                <span>Tiempo para llamar</span>
              </div>
                        
              <select
                id="llamar_dentro_de"
                name="llamar_dentro_de"
                value={form.llamar_dentro_de}
                onChange={(e) =>
                  actualizar("llamar_dentro_de", e.target.value)
                }
                required
              >
                <option value="30_MINUTOS">30 minutos</option>
                <option value="1_HORA">1 hora</option>
                <option value="2_HORAS">2 horas</option>
              </select>
            </div>
          </div>
        </section>

        {/* DATOS DEL CLIENTE */}
        <section
          className={`${styles.section} ${styles.blue}`}
        >
          <div className={styles.sectionHeader}>
            <Users size={20} />
            <h2>Datos del cliente</h2>
          </div>

          <div className={styles.sectionBody}>
            <div className={styles.gridTwo}>
              {campo(
                "Nombre del cliente",
                "nombre_cliente",
                <UserRound size={19} />
              )}

              {campo(
                "Móvil de contacto",
                "movil_contacto",
                <Phone size={19} />
              )}

              {campo(
                "Operador actual del cliente",
                "operador_cliente",
                <RadioTower size={19} />,
                [
                  "MOVISTAR",
                  "CLARO",
                  "ENTEL",
                  "BITEL",
                  "VODAFONE",
                  "ORANGE",
                  "YOIGO",
                  "OTRO",
                ]
              )}

              {campo(
                "Campaña de interés",
                "campania",
                <Megaphone size={19} />,
                ["YOIGO", "VODAFONE"]
              )}

              {campo(
                "Paga (€/mes)",
                "paga",
                <Wallet size={19} />
              )}

              {campo(
                "Cantidad de móviles",
                "cantidad_moviles",
                <Smartphone size={19} />
              )}
            </div>

            <div className={styles.fullWidth}>
              {campo(
                "Dirección",
                "direccion",
                <MapPin size={19} />
              )}
            </div>
          </div>
        </section>

        {/* CONTRAOFERTA */}
        <section
          className={`${styles.section} ${styles.purple}`}
        >
          <div className={styles.sectionHeader}>
            <MessageSquareText size={20} />

            <h2>Contraoferta / Observaciones</h2>
          </div>

          <div className={styles.sectionBody}>
            <div className={styles.field}>
              <label htmlFor="contraoferta">
                Contraoferta{" "}
                <span className={styles.required}>
                  *
                </span>
              </label>

              <textarea
                id="contraoferta"
                name="contraoferta"
                rows={3}
                value={form.contraoferta}
                onChange={(e) =>
                  actualizar(
                    "contraoferta",
                    e.target.value
                  )
                }
                required
              />
            </div>
          </div>
        </section>

        {error && (
          <p
            className={styles.error}
            role="alert"
          >
            {error}
          </p>
        )}

        {mensaje && (
          <div
            className={styles.success}
            role="status"
          >
            {mensaje}
          </div>
        )}

        {/* ACCIONES */}
        <footer className={styles.footer}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={enviando}
          >
            <Send size={19} />

            {enviando
              ? "Enviando..."
              : "Enviar"}
          </button>
        </footer>
      </form>
    </main>
  );
}