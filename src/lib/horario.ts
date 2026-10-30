// Horario de atención por día. Si el negocio lo llena, su menú no deja mandar pedidos cuando está cerrado.
// Las horas son de la Ciudad de México (Durango y casi todo el país usan la misma).

export const DIAS = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"] as const;
export type Dia = (typeof DIAS)[number];
export type Turno = { abre: string; cierra: string };
export type Horario = Partial<Record<Dia, Turno | null>>;

export const NOMBRE_DIA: Record<Dia, string> = { dom: "Dom", lun: "Lun", mar: "Mar", mie: "Mié", jue: "Jue", vie: "Vie", sab: "Sáb" };
const NOMBRE_LARGO: Record<Dia, string> = { dom: "el domingo", lun: "el lunes", mar: "el martes", mie: "el miércoles", jue: "el jueves", vie: "el viernes", sab: "el sábado" };
// Para mostrar la semana empezando en lunes
export const SEMANA: Dia[] = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"];

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;
const minutos = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3));
const bonita = (h: string) => h.replace(/^0(\d)/, "$1");

// Limpia lo que llega del formulario o de la base: solo días conocidos y horas HH:MM.
export function limpiarHorario(x: unknown): Horario | null {
  if (!x || typeof x !== "object") return null;
  const h: Horario = {};
  let alguno = false;
  for (const d of DIAS) {
    const t = (x as Record<string, unknown>)[d] as Turno | null | undefined;
    if (t && HORA.test(String(t.abre)) && HORA.test(String(t.cierra)) && t.abre !== t.cierra) {
      h[d] = { abre: t.abre, cierra: t.cierra };
      alguno = true;
    } else h[d] = null;
  }
  return alguno ? h : null;
}

// Día de la semana (0 = domingo) y minuto del día en la Ciudad de México
function ahoraMexico(ahora: Date) {
  const partes = new Intl.DateTimeFormat("en-US", { timeZone: "America/Mexico_City", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
    .formatToParts(ahora);
  const v = (t: string) => partes.find((p) => p.type === t)?.value ?? "";
  const dia = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(v("weekday"));
  return { dia, minuto: Number(v("hour")) * 60 + Number(v("minute")) };
}

export type EstadoHorario = { abierto: boolean; texto: string };

export function estadoHorario(h: Horario | null, ahora = new Date()): EstadoHorario | null {
  if (!h) return null;
  const { dia, minuto } = ahoraMexico(ahora);
  const hoy = h[DIAS[dia]];
  const ayer = h[DIAS[(dia + 6) % 7]];

  // Turno de ayer que pasa de la medianoche (ej. 18:00 a 02:00)
  if (ayer && minutos(ayer.cierra) <= minutos(ayer.abre) && minuto < minutos(ayer.cierra))
    return { abierto: true, texto: `Abierto hasta las ${bonita(ayer.cierra)}` };
  if (hoy) {
    const a = minutos(hoy.abre), c = minutos(hoy.cierra);
    const dentro = c > a ? minuto >= a && minuto < c : minuto >= a;
    if (dentro) return { abierto: true, texto: `Abierto hasta las ${bonita(hoy.cierra)}` };
    if (minuto < a) return { abierto: false, texto: `Cerrado ahora · abre hoy a las ${bonita(hoy.abre)}` };
  }
  for (let i = 1; i <= 7; i++) {
    const d = DIAS[(dia + i) % 7];
    const t = h[d];
    if (t) return { abierto: false, texto: `Cerrado ahora · abre ${i === 1 ? "mañana" : NOMBRE_LARGO[d]} a las ${bonita(t.abre)}` };
  }
  return { abierto: false, texto: "Cerrado por ahora" };
}

// "Lun a Sáb 8:00 a 17:00 · Dom cerrado": junta los días seguidos con el mismo horario
export function textoHorario(h: Horario | null): string {
  if (!h) return "";
  const grupos: { dias: Dia[]; t: Turno | null }[] = [];
  for (const d of SEMANA) {
    const t = h[d] ?? null;
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && JSON.stringify(ultimo.t) === JSON.stringify(t)) ultimo.dias.push(d);
    else grupos.push({ dias: [d], t });
  }
  return grupos
    .map(({ dias, t }) => {
      const nombre = dias.length === 1 ? NOMBRE_DIA[dias[0]] : `${NOMBRE_DIA[dias[0]]} a ${NOMBRE_DIA[dias[dias.length - 1]]}`;
      return t ? `${nombre} ${bonita(t.abre)} a ${bonita(t.cierra)}` : `${nombre} cerrado`;
    })
    .join(" · ");
}
