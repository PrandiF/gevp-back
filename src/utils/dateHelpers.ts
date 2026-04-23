export function buildDateTime(
  start: string | Date,
  end: string | Date,
): { startDateTime: string; endDateTime: string; googleDay: string } {
  const startDate = start instanceof Date ? start : new Date(start);
  const endDate = end instanceof Date ? end : new Date(end);

  // Map para recurrencia de Google Calendar
  const diasSemana: Record<number, string> = {
    0: "SU",
    1: "MO",
    2: "TU",
    3: "WE",
    4: "TH",
    5: "FR",
    6: "SA",
  };

  const dayNumber = startDate.getDay(); // 0=domingo ... 6=sábado
  const googleDay = diasSemana[dayNumber];

  if (!googleDay) {
    throw new Error(`Día inválido para Google Calendar: ${dayNumber}`);
  }

  // Formatear start y end como ISO string con offset -03:00
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}:00-03:00`;
  };

  const startDateTime = formatDate(startDate);
  const endDateTime = formatDate(endDate);

  return { startDateTime, endDateTime, googleDay };
}
