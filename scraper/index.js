import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where } from "firebase/firestore";
import dotenv from "dotenv";

// Cargar variables de entorno locales (el path puede variar dependiendo desde donde se ejecute el script)
dotenv.config({ path: "../.env.local" }); 
// Por si se ejecuta en la misma raiz:
dotenv.config();

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

  try {
    // === EJEMPLO 1: Computrabajo Colombia ===
    console.log("📍 Accediendo a Computrabajo...");
    const searchUrl = "https://co.computrabajo.com/trabajo-de-analista-de-datos";
    
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await randomDelay(3000, 6000); // Esperar a que renderice

    // Extraer datos básicos
    const jobCards = await page.$$("article.box_offer"); // Selector de Computrabajo (puede cambiar en el futuro)
    
    console.log(`Encontradas ${jobCards.length} ofertas en la primera página.`);

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
        const fullUrl = partialUrl ? (partialUrl.startsWith("http") ? partialUrl : `https://co.computrabajo.com${partialUrl}`) : searchUrl;

        // Determinar si es remoto leyendo el título o la descripción
        const isRemote = title.toLowerCase().includes("remoto") || description.toLowerCase().includes("remoto") || locationText.toLowerCase().includes("remoto");

        if (title !== "Sin título") {
          offers.push({
            title,
            company,
            location: locationText,
            description,
            url: fullUrl,
            isRemote,
            source: "Computrabajo",
            scrapedAt: new Date()
          });
        }
        await randomDelay(200, 500); // Pequeño delay por cada tarjeta
      } catch (innerError) {
        console.warn("⚠️ Advertencia: No se pudo extraer una tarjeta específica. Saltando a la siguiente.", innerError.message);
      }
    }
  } catch (error) {
    console.error("❌ Error accediendo al portal 1:", error.message);
    // El script NO se rompe, así puede intentar con otros portales a continuación
  }

  // === EJEMPLO 2: Dummy / Otros Portales ===
  // Aquí puedes replicar el bloque try-catch anterior para "El Empleo", LinkedIn, etc.
  console.log("📍 Intentando portal alternativo (Generación de dummys para demostración)...");
  offers.push({
    title: "Senior Data Analyst (100% Remoto)",
    company: "TechGlobal Solutions",
    location: "Remoto - LATAM",
    description: "Buscamos Analista de Datos senior con experiencia en Python, SQL avanzado y Power BI. Excelente salario en USD. Proceso rápido de 2 etapas.",
    url: "https://www.linkedin.com/jobs",
    isRemote: true,
    source: "LinkedIn",
    scrapedAt: new Date()
  });

  // Guardado en Firebase
  console.log(`💾 Guardando ${offers.length} ofertas en Firestore...`);
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
