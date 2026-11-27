import "server-only";

import { createHash } from "node:crypto";

type ConversionMeta = {
  evento: "CompleteRegistration" | "Lead";
  eventId: string;
  contenido: "esencial" | "restaurante_demo";
  ip: string | null;
  agente: string | null;
  fbclid?: string;
  fbclidVistoMs?: number;
  correo?: string;
  whatsapp?: string;
  puedeUsarDatosDeContacto: boolean;
  utmContent?: string;
  url: string;
};

const hash = (valor: string) => createHash("sha256").update(valor.trim().toLowerCase()).digest("hex");

// Meta es una medición secundaria: un problema de su API nunca debe impedir un alta o una solicitud.
export async function enviarConversionMeta(datos: ConversionMeta) {
  const pixel = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;
  if (!pixel || !token) return;

  const userData: Record<string, string> = {};
  if (datos.ip) userData.client_ip_address = datos.ip;
  if (datos.agente) userData.client_user_agent = datos.agente;
  if (datos.fbclid) userData.fbc = `fb.1.${datos.fbclidVistoMs ?? Date.now()}.${datos.fbclid}`;
  // Correo y WhatsApp solo complementan la coincidencia cuando la persona aceptó esta medición.
  if (datos.puedeUsarDatosDeContacto && datos.correo) userData.em = hash(datos.correo);
  if (datos.puedeUsarDatosDeContacto && datos.whatsapp) userData.ph = hash(datos.whatsapp.replace(/\D/g, ""));

  const cuerpo = {
    access_token: token,
    data: [{
      event_name: datos.evento,
      event_time: Math.floor(Date.now() / 1000),
      event_id: datos.eventId,
      action_source: "website",
      event_source_url: datos.url,
      user_data: userData,
      custom_data: {
        content_name: datos.contenido,
        ...(datos.evento === "CompleteRegistration" ? { status: "trial" } : {}),
        ...(datos.utmContent ? { utm_content: datos.utmContent } : {}),
      },
    }],
    ...(process.env.META_TEST_EVENT_CODE ? { test_event_code: process.env.META_TEST_EVENT_CODE } : {}),
  };

  try {
    await fetch(`https://graph.facebook.com/v26.0/${encodeURIComponent(pixel)}/events`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(cuerpo),
      signal: AbortSignal.timeout(2_000),
      cache: "no-store",
    });
  } catch {
    // El embudo propio ya se guardó; no exponemos ni reintentamos el fallo de un tercero.
  }
}
