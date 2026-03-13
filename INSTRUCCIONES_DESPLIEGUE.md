# Instrucciones de Despliegue y Configuración

Sigue estos pasos para configurar la infraestructura gratuita de tu aplicación "Data Analyst Job Board SPA".

## 1. Configuración de Firebase

1. Ve a la [Consola de Firebase](https://console.firebase.google.com/).
2. Haz clic en **Añadir proyecto**. Nómbralo (ej. `analista-datos-jobs`).
3. (Opcional) Desactiva Google Analytics si no lo necesitas.
4. Una vez creado el proyecto, ve al menú lateral izquierdo:
   - **Autenticación (Authentication):** Haz clic en "Comenzar" y habilita el proveedor **Correo electrónico/contraseña**.
   - **Base de datos (Firestore Database):** Haz clic en "Crear base de datos", selecciona una ubicación cercana (ej. `us-central`) y comienza en **Modo de prueba** (esto permite leer/escribir libremente al inicio. Luego cambiaremos las reglas de seguridad).
5. Ve a la **Configuración del proyecto** (ícono de engranaje ⚙️) > **General**.
6. Desplázate hacia abajo y haz clic en el ícono web `</>` para registrar una aplicación. Nómbrala como gustes y regístrala.
7. Al final, Firebase te mostrará un objeto `firebaseConfig`. Copia esos valores y pégalos en el archivo `.env.local` (localmente) o en las Variables de Entorno de Vercel (en producción).

## 2. Variables de Entorno (.env.local)

Copia el contenido siguiente en tu archivo `.env.local` ubicado en la raíz del proyecto y reemplaza los valores de `NEXT_PUBLIC_FIREBASE_*` con los de tu configuración:

```env
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyTuAPIKeyRealAqui"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="tu-proyecto.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="tu-proyecto"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="tu-proyecto.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="1234567890"
NEXT_PUBLIC_FIREBASE_APP_ID="1:1234567890:web:abcdef123456"
```

## 3. Despliegue en Vercel (Frontend)

Vercel es ideal (y gratuito) para desplegar aplicaciones creadas con Next.js:

1. Crea una cuenta en [Vercel](https://vercel.com/) vinculando tu cuenta de GitHub.
2. Desde el Dashboard de Vercel, haz clic en **Add New...** > **Project**.
3. Importa el repositorio de GitHub donde se encuentra tu proyecto.
4. **IMPORTANTE:** En la sección "Environment Variables", debes añadir todas las variables de tu `.env.local` (`NEXT_PUBLIC_FIREBASE_API_KEY`, etc.).
5. Haz clic en **Deploy**. ¡Tu frontend de la SPA estará público y funcionando en unos minutos!

## 4. Ejecución del Scraper (Puppeteer)

Dado que Puppeteer consume muchos recursos (memoria/CPU), la plataforma gratuita de Vercel o Netlify (que usan funciones serverless pequeñas) no lo soporta de manera confiable. Tienes dos opciones gratuitas:
- **Ejecución Local Programada (Recomendada inicial):** Corre el scraper en tu PC configurando una Tarea Programada de Windows (Task Scheduler) que ejecute `node scraper/index.js` cada 1-2 horas.
- **GitHub Actions:** Configura un workflow de GitHub Actions que corra el script periódicamente en sus servidores gratuitos, inyectando las credenciales de Firebase como Secretos de GitHub.
