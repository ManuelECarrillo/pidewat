// Horario de atención por día. Con él, el menú no deja mandar pedidos cuando el negocio está cerrado.
// dias[0] = domingo … dias[6] = sábado. null = cerrado ese día. Si cierra antes de abrir, cierra al día siguiente (ej. 18:00 a 02:00).
export type Turno = { abre: string; cierra: string };
export type Horario = { dias: (Turno | null)[] };

export const ZONA = "America/Mexico_City";
export const NOMBRES_DIA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const CORTO = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

const minutos = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3));
const bonita = (h: string) => `${Number(h.slice(0, 2))}:${h.slice(3)}`;

// Lo que llega del formulario: se acepta solo si tiene la forma correcta
export function leerHorario(v: unknown): Horario | null {
  try {
    const h = typeof v === "string" ? JSON.parse(v) : v;
    if (!h || !Array.isArray(h.dias) || h.dias.length !== 7) return null;
    const dias = h.dias.map((d: unknown) => {
      const t = d as Turno | null;
      return t && HORA.test(t.abre) && HORA.test(t.cierra) && t.abre !== t.cierra ? { abre: t.abre, cierra: t.cierra } : null;
    });
    return { dias };
  } catch {
    return null;
  }
}

// Día de la semana y minuto del día en la hora del centro de México
function ahoraMx(fecha: Date) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: ZONA, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(fecha).map((x) => [x.type, x.value]),
  );
  const dia = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday);
  return { dia, min: Number(p.hour) * 60 + Number(p.minute) };
}

export function abiertoAhora(h: Horario, fecha = new Date()) {
  const { dia, min } = ahoraMx(fecha);
  const hoy = h.dias[dia];
  if (hoy) {
    const a = minutos(hoy.abre), c = minutos(hoy.cierra);
    if (c > a ? min >= a && min < c : min >= a) return true;
  }
  const ayer = h.dias[(dia + 6) % 7];
  return Boolean(ayer && minutos(ayer.cierra) < minutos(ayer.abre) && min < minutos(ayer.cierra));
}

// "Abre hoy a las 8:00", "Abre mañana a las 9:00", "Abre el lunes a las 8:00"
export function proximaApertura(h: Horario, fecha = new Date()) {
  const { dia, min } = ahoraMx(fecha);
  for (let i = 0; i < 7; i++) {
    const t = h.dias[(dia + i) % 7];
    if (!t || (i === 0 && minutos(t.abre) <= min)) continue;
    const cuando = i === 0 ? "hoy" : i === 1 ? "mañana" : `el ${NOMBRES_DIA[(dia + i) % 7].toLowerCase()}`;
    return `Abre ${cuando} a las ${bonita(t.abre)}`;
  }
  return null;
}

// Texto corto para el menú: "Lun a Sáb 8:00 a 17:00 · Dom 9:00 a 15:00"
export function resumenHorario(h: Horario) {
  const orden = [1, 2, 3, 4, 5, 6, 0];
  const grupos: { desde: number; hasta: number; t: Turno }[] = [];
  for (const d of orden) {
    const t = h.dias[d];
    if (!t) continue;
    const g = grupos[grupos.length - 1];
    if (g && orden.indexOf(g.hasta) === orden.indexOf(d) - 1 && g.t.abre === t.abre && g.t.cierra === t.cierra) g.hasta = d;
    else grupos.push({ desde: d, hasta: d, t });
  }
  if (!grupos.length) return "Cerrado por ahora";
  return grupos
    .map((g) => {
      const dias = g.desde === g.hasta ? CORTO[g.desde]
        : orden.indexOf(g.hasta) - orden.indexOf(g.desde) === 1 ? `${CORTO[g.desde]} y ${CORTO[g.hasta]}` : `${CORTO[g.desde]} a ${CORTO[g.hasta]}`;
      return `${dias} ${bonita(g.t.abre)} a ${bonita(g.t.cierra)}`;
    })
    .join(" · ");
}
