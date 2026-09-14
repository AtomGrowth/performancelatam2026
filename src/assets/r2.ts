// URLs públicas de imágenes servidas desde Cloudflare R2. Se sirven aparte del bundle
// para no inflar landing.js con data-URLs (parseo lento en mobile = pantalla blanca).
const R2 = 'https://pub-c8d801a0ff204d758910633021fa302b.r2.dev';

export const contourTexture = `${R2}/contour.jpg`;

// Bucket de medios del estudio (el mismo que sirve el video del hero).
const MEDIA = 'https://pub-09dc8675a13e4b6d9ff1f7e15d49ade2.r2.dev';

export const deliveryImage = `${MEDIA}/woman-in-beret-using-smartphone-on-city-street-2026-03-09-07-09-00-utc.webp`;
export const companyImage = `${MEDIA}/young-man-explaining-business-plan-to-colleagues-2026-03-08-23-49-37-utc.jpg`;
