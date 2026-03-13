/**
 * Función para limpiar texto: elimina acentos, caracteres especiales y pasa a minúsculas
 */
function cleanText(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
    .replace(/[^\w\s#+]/gi, " ") // Mantener alfanuméricos, espacios, '#' (C#) y '+' (C++)
    .replace(/\s+/g, " "); // Espacios extra a un solo espacio
}

/**
 * Calcula el % de coincidencia entre las skills del usuario y la descripción de la oferta
 * @param {string[]} userSkills - Array de habilidades del usuario (ej: ["Python", "SQL", "Power BI"])
 * @param {string} offerDescription - Texto completo de la oferta de trabajo
 * @returns {number} Porcentaje de coincidencia (0 - 100)
 */
export function calculateMatchPercentage(userSkills, offerDescription) {
  if (!userSkills || userSkills.length === 0 || !offerDescription) return 0;

  const textCleaned = cleanText(offerDescription);
  let matches = 0;

  userSkills.forEach((skill) => {
    const skillCleaned = cleanText(skill).trim();
    if (!skillCleaned) return;

    // Crear expresión regular para buscar la palabra exacta (con bordes de palabra)
    // Escapar caracteres especiales como '+' para C++
    const escapedSkill = skillCleaned.replace(/[+]/g, "\\$&");
    const regex = new RegExp(`\\b${escapedSkill}\\b`, "i");

    if (regex.test(textCleaned)) {
      matches++;
    }
  });

  const percentage = (matches / userSkills.length) * 100;
  return Math.round(percentage);
}
