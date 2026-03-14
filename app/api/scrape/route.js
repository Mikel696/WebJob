import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";

// Evitar que Next.js almacene en caché esta ruta
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    // Definimos la ruta absoluta al script del scraper
    const scraperPath = path.resolve(process.cwd(), "scraper", "index.js");

    console.log("Iniciando ejecución manual del scraper en:", scraperPath);

    // Envolver la ejecución en una Promesa para esperar el resultado
    const runScraper = () => {
      return new Promise((resolve, reject) => {
        // Ejecutamos el archivo index.js usando Node
        exec(`node "${scraperPath}"`, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error de ejecución: ${error.message}`);
            return reject(error);
          }
          if (stderr) {
            console.warn(`Advertencias del scraper: ${stderr}`);
          }
          console.log(`Salida del scraper:\n${stdout}`);
          resolve(stdout);
        });
      });
    };

    // Ejecutamos y esperamos
    const output = await runScraper();

    return NextResponse.json({
      success: true,
      message: "Scraping finalizado exitosamente.",
      details: output
    }, { status: 200 });

  } catch (error) {
    console.error("Error en API Route /api/scrape:", error);
    return NextResponse.json({
      success: false,
      message: "Hubo un error al ejecutar el scraper.",
      error: error.message
    }, { status: 500 });
  }
}
