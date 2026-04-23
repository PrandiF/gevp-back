export const buildCancelEmail = (
  event: any,
  tipo: "SERIE COMPLETA" | "INSTANCIA",
) => {
  const rawTitle = event.summary || "Entrenamiento";

  // 🔥 Parsear: "Fútbol - Primera (Cancha 1)"
  let deporte = "";
  let categoria = "";
  let gimnasio = "";
  let tipoDeActividad = "";

  try {
    const [depCat, gymPart] = rawTitle.split("(");
    const [dep, cat] = depCat.split("-");
    tipoDeActividad = event.tipoActividad || "Entrenamiento";
    deporte = dep?.trim() || "";
    categoria = cat?.trim() || "";
    gimnasio = gymPart?.replace(")", "").trim() || "";
  } catch {
    deporte = rawTitle;
  }

  let fechaHtml = "";
  let horarioHtml = "";

  if (tipo === "INSTANCIA") {
    const start = new Date(event.start?.dateTime || event.start?.date);
    const end = new Date(event.end?.dateTime || event.end?.date);

    const fecha = start.toLocaleDateString("es-AR");
    const horario = `${start.toLocaleTimeString("es-AR")} - ${end.toLocaleTimeString("es-AR")}`;

    fechaHtml = `<p><strong>Fecha:</strong> ${fecha}</p>`;
    horarioHtml = `<p><strong>Horario:</strong> ${horario}</p>`;
  }

  return `
    <div style="font-family: Arial, sans-serif;">
      <h2>❌ Entrenamiento cancelado</h2>

      <p><strong>Tipo:</strong> ${tipo === "SERIE COMPLETA" ? "Entrenamiento completo" : "Entrenamiento individual"}</p>

      <p><strong>Tipo de actividad:</strong> ${tipoDeActividad}</p>
      <p><strong>Deporte:</strong> ${deporte}</p>
      <p><strong>Categoría:</strong> ${categoria}</p>
      <p><strong>Gimnasio:</strong> ${gimnasio}</p>

      ${
        tipo === "SERIE COMPLETA"
          ? `<p><strong>Se cancelaron todos los entrenamientos de este día.</strong></p>`
          : `<p><strong>Se canceló solo este entrenamiento.</strong></p>`
      }

      ${fechaHtml}
      ${horarioHtml}

      <hr />

      <p style="color:#777;font-size:12px">
        Notificación automática del sistema GEVP
      </p>
    </div>
  `;
};
