# Storefront Restaurant — Astro Architecture

Plantilla de storefront para restaurantes y comercios gastronómicos, construida con **Astro**, **TypeScript** y **Vanilla CSS/Tailwind**, diseñada con arquitectura desacoplada para ser reutilizable y fácilmente portable a nuevos proyectos.

---

## 📁 Arquitectura del Proyecto

El proyecto está estrictamente dividido en dos capas: **Motor (`src/storefront/`)** y **Datos (`src/data/api/`)**.

```text
src/
├── data/api/                     # Capa de datos desacoplada (JSON / Fixtures)
│   ├── menu.json                 # Secciones, categorías y productos con rangos de precio
│   ├── settings.json             # Perfil, WhatsApp, horarios, métodos de pago y Google Maps
│   ├── decorations.json          # Decoraciones visuales, parallax, rieles y fondos
│   ├── promotions.json           # Promociones con precios con descuento
│   ├── combos.json               # Combos y paquetes especiales
│   └── flyers.json               # Modal de anuncios/flyers con tiempo configurable
│
├── storefront/                   # Motor modular (copiable a cualquier otro proyecto)
│   ├── commerce/                 # Carrito reactivo, checkout y triggers de compra
│   ├── icons/                    # Componentes SVG autocontenidos (sin librerías pesadas)
│   ├── layout/                   # Layout, Header, Footer y contenedor de escala
│   ├── menu/                     # MenuBlock, cards (TemplateCard, Promo, Combo), títulos
│   │   └── blocks/               # DecorationRenderer, MenuBlock genérico
│   ├── scripts/animations/       # Controladores de parallax cinemático y maki-rail
│   ├── services/                 # Servicios desacoplados y `loadStorefront()` unificado
│   ├── styles/                   # Design system y tokens globales
│   ├── types/                    # Tipado TypeScript estricto
│   ├── ui/                       # Modales (FlyerModal, ReviewModal, ClosedModal, Slider)
│   └── utils/                    # Helpers DOM, formato de precios y almacenamiento
│
└── pages/
    └── index.astro               # Ensamblador de página ultra limpio y declarativo
```

---

## 🚀 Cómo portar este motor a otro proyecto

1. Copiá la carpeta [`src/storefront/`](file:///Users/alejandro/Desktop/trabajo/mrnikkei69/src/storefront) en tu nuevo proyecto Astro.
2. Definí tus datos en [`src/data/api/`](file:///Users/alejandro/Desktop/trabajo/mrnikkei69/src/data/api/) (`menu.json`, `settings.json`, `decorations.json`, etc.).
3. En tu `index.astro`, consumí todo en una sola línea mediante el loader unificado:

```astro
---
import { loadStorefront } from '../storefront/services/index.js';
import Layout from '../storefront/layout/Layout.astro';
import MenuPage from '../storefront/layout/menu-page.astro';
import MenuBlock from '../storefront/menu/blocks/menu-block.astro';
import FlyerModal from '../storefront/ui/flyer-modal.astro';
import ReviewModal from '../storefront/ui/review-modal.astro';

const {
  blocks,
  combos,
  promotions,
  decorations,
  restaurant,
  settings,
  businessHours,
  googleMapsUrl,
  flyers,
} = await loadStorefront();
---

<Layout seo={settings?.seo ?? null}>
  <MenuPage
    restaurant={restaurant}
    settings={settings}
    businessHours={businessHours}
    background={decorations.background}
    headerBg={decorations.header_background}
    footerBg={decorations.footer_background}
  >
    <!-- Tus bloques de menú -->
    <MenuBlock
      categories={blocks[0]?.categories}
      decorations={decorations.blocks?.['block-1']}
    />
  </MenuPage>

  <FlyerModal flyers={flyers} />
  <ReviewModal googleMapsUrl={googleMapsUrl} restaurantName={restaurant?.name} />
</Layout>
```

---

## 🎨 Sistema de Decoraciones Declarativas

En [`src/data/api/decorations.json`](file:///Users/alejandro/Desktop/trabajo/mrnikkei69/src/data/api/decorations.json) podés definir decoraciones sin tocar HTML:

- **Imágenes simples o parallax**: `type: "image"`, `animation: "parallax"`, `containerClass`, `class`.
- **Rieles automáticos**: `type: "rail"`, `items: ["url1", "url2", ...]` (calcula repeticiones automáticamente en base a la altura).
- **Grupos de imágenes**: `type: "group"`, `images: [{ src, class }, ...]`.
- **Fondos globales**: `background`, `header_background`, `footer_background`.

El componente [`DecorationRenderer`](file:///Users/alejandro/Desktop/trabajo/mrnikkei69/src/storefront/menu/blocks/decoration-renderer.astro) se encarga de proyectar cada ítem en el slot correspondiente (`left`, `right`, `extra`).

---

## ⚡ Modales y Componentes de Conversión

- **[`FlyerModal`](file:///Users/alejandro/Desktop/trabajo/mrnikkei69/src/storefront/ui/flyer-modal.astro)**: Modal de anuncios/promociones con temporizador configurable (`delay_seconds: 20` en `flyers.json`), carrusel y persistencia de sesión (`sessionStorage`).
- **[`ReviewModal`](file:///Users/alejandro/Desktop/trabajo/mrnikkei69/src/storefront/ui/review-modal.astro)**: Invitación a calificar con 5 estrellas en Google Maps. Se activa automáticamente a los 2 minutos (o manualmente desde el botón del footer con `data-open-review-modal`) y recuerda la interacción en `localStorage`.

---

## 🛠️ Comandos de Desarrollo

```bash
# Iniciar servidor de desarrollo en background
astro dev --background

# Verificar estado y logs del dev server
astro dev status
astro dev logs
astro dev stop

# Compilar para producción
pnpm build
```
