import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where } from "firebase/firestore";
import dotenv from "dotenv";

import path from "path";
import { fileURLToPath } from "url";

// Configurar rutas absolutas para módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env.local');

// Cargar variables de entorno desde el archivo .env.local en la raíz
dotenv.config({ path: envPath });

// Configuración Firebase (usando las mismas vars del cliente Next.js)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Usar el plugin stealth para evitar detecciones de bots básicos
puppeteer.use(StealthPlugin());

/**
 * Genera un delay aleatorio para simular comportamiento humano
 */
const randomDelay = (min = 2000, max = 5000) => 
  new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1) + min)));

/**
 * Script principal de Scraping
 */
async function scrapeDataAnalystJobs() {
  console.log("🚀 Iniciando scraper de empleos para Analista de Datos...");
  
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled'
    ],
  });

  const page = await browser.newPage();
  
  // Establecer un User Agent rotativo/aleatorio (aquí usamos uno moderno estándar)
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
  await page.setViewport({ width: 1366, height: 768 });

  const offers = [];

  /**
   * Helper function to scrape a specific URL and category
   */
  async function scrapeComputrabajoCategory(url, category, extraSearchTerms = []) {
    console.log(`📍 Accediendo a Computrabajo para categoría: ${category}...`);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await randomDelay(3000, 6000); // Esperar a que renderice

      const jobCards = await page.$$("article.box_offer");
      console.log(`Encontradas ${jobCards.length} ofertas para ${category}.`);

      for (const card of jobCards) {
        try {
          const titleEl = await card.$('h1 a, h2 a');
          const companyEl = await card.$('p.fs16');
          const locationEl = await card.$('p.fs13');
          const descEl = await card.$('p.fc_base');
          const urlEl = await card.$('h1 a, h2 a');

          const title = titleEl ? await page.evaluate(el => el.textContent.trim(), titleEl) : "Sin título";
          const company = companyEl ? await page.evaluate(el => el.textContent.trim(), companyEl) : "Empresa Confidencial";
          const locationText = locationEl ? await page.evaluate(el => el.textContent.trim(), locationEl) : "Colombia";
          const description = descEl ? await page.evaluate(el => el.textContent.trim(), descEl) : "";
          const partialUrl = urlEl ? await page.evaluate(el => el.getAttribute('href'), urlEl) : "";
          const fullUrl = partialUrl ? (partialUrl.startsWith("http") ? partialUrl : `https://co.computrabajo.com${partialUrl}`) : url;

          const isRemote = title.toLowerCase().includes("remoto") || description.toLowerCase().includes("remoto") || locationText.toLowerCase().includes("remoto");

          // Si es de ingreso inmediato, forzamos que sea remoto para que encaje mejor si las keywords lo sugieren (Computrabajo agrupa remoto)
          const isValidRemoteImmediate = category === 'remote_immediate' ? isRemote : true;

          if (title !== "Sin título" && isValidRemoteImmediate) {
            offers.push({
              title,
              company,
              location: locationText,
              description,
              url: fullUrl,
              isRemote,
              category, // 'data_analyst' o 'remote_immediate'
              source: "Computrabajo",
              scrapedAt: new Date()
            });
          }
          await randomDelay(200, 500);
        } catch (innerError) {
          console.warn("⚠️ Advertencia: No se pudo extraer una tarjeta específica.", innerError.message);
        }
      }
    } catch (error) {
       console.error(`❌ Error accediendo a categoría ${category}:`, error.message);
    }
  }

  // 1. Scraping para Analistas de Datos
  await scrapeComputrabajoCategory(
    "https://co.computrabajo.com/trabajo-de-analista-de-datos", 
    "data_analyst"
  );

  // 2. Scraping para Ingreso Inmediato Remoto (Asistente virtual, Soporte, Data Entry)
  // Nota: Computrabajo tiene filtros 'modalidad=1' para remoto, buscamos términos generales
  await scrapeComputrabajoCategory(
    "https://co.computrabajo.com/trabajo-de-remoto-ingreso-inmediato", 
    "remote_immediate"
  );
  await scrapeComputrabajoCategory(
    "https://co.computrabajo.com/trabajo-de-digitador-remoto", 
    "remote_immediate"
  );

  // === EJEMPLO 2: Dummy / Otros Portales ===
  // Aquí puedes replicar el bloque try-catch anterior para "El Empleo", LinkedIn, etc.
  const offersRef = collection(db, "offers");

  let savedCount = 0;
  for (const offer of offers) {
    try {
      // Opcional: Validar que no exista ya por URL para no duplicar
      const q = query(offersRef, where("url", "==", offer.url));
      const existing = await getDocs(q);

      if (existing.empty) {
        await addDoc(offersRef, offer);
        savedCount++;
      }
    } catch (dbError) {
      console.error("❌ Error guardando una oferta en DB:", dbError.message);
    }
  }

  console.log(`✅ Scraper finalizado exitosamente. ${savedCount} nuevas ofertas guardadas.`);
  await browser.close();
  process.exit(0);
}

// Iniciar script
scrapeDataAnalystJobs();
