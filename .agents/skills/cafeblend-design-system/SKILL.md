---
name: cafeblend-design-system
description: >-
  Guía completa del Design System CafeBlend con soporte para Modo Claro (Warm Cream)
  y Modo Oscuro (Dark Espresso). Incluye tokens de color, neumorfismo cálido,
  tipografía Google Fonts, elevaciones, espaciados y componentes interactivos.
---

# CafeBlend Design System (Light & Dark Mode)

## Overview

**CafeBlend** es un design system acogedor y de temática cafetera, diseñado con una estética táctil inspirada en el **neumorfismo suave** y tonalidades café cálidas. Evoca la atmósfera reconfortante de una cafetería de especialidad artesanal, combinando superficies con relieve suave, bordes redondeados y transiciones fluidas.

El sistema cuenta con soporte bidireccional de temas:
1. **Modo Claro (Warm Cream & Roasted Coffee):** Fondo crema cálido (`#FDF6EC`) con acentos en tonos café caramelo y sombras suaves.
2. **Modo Oscuro (Dark Espresso & Golden Crema):** Fondo espresso profundo (`#1A120B`) con superficies moca (`#261A13`), reflejos dorados y sombras neumórficas invertidas de alto contraste visual.

---

## 1. Tokens de Color (Palette & Themes)

### 1.1 Paleta Comparativa (Light vs. Dark)

| Token Semántico | Modo Claro (Warm Cream) | Modo Oscuro (Dark Espresso) | Uso Principal |
| :--- | :--- | :--- | :--- |
| `--color-bg` | `#FDF6EC` (Warm Cream) | `#1A120B` (Dark Espresso) | Fondo principal de la página |
| `--color-surface` | `#FFFFFF` (Pure White) | `#261A13` (Roasted Mocha) | Tarjetas, modales, paneles |
| `--color-surface-inset` | `#F0E6D6` (Cream Inset) | `#1F150F` (Deep Espresso) | Campos de formulario y hendiduras |
| `--color-surface-hover` | `#FAF0E1` (Latte Foam) | `#32231A` (Mocha Lift) | Estados hover de tarjetas y filas |
| `--color-primary` | `#8B5E3C` (Rich Caramel) | `#D4A373` (Golden Crema) | CTAs principales, acentos, títulos |
| `--color-primary-hover` | `#6B4226` (Deep Roast) | `#E6BA95` (Warm Foam) | Hover de botones primarios |
| `--color-secondary` | `#C4956A` (Cinnamon Accent) | `#E6BA95` (Toasted Hazelnut) | Tags, badges y acentos secundarios |
| `--color-text-primary` | `#3E2723` (Dark Coffee Bean) | `#FDF6EC` (Warm Cream Milk) | Títulos, encabezados y textos clave |
| `--color-text-secondary`| `#6D4C41` (Medium Roast) | `#D5C9B8` (Soft Parchment) | Párrafos, descripciones y subtítulos |
| `--color-text-muted` | `#9E8A78` (Light Cinnamon) | `#A89886` (Subtle Crema) | Metadatos, placeholders, labels |
| `--color-border` | `#E8DDD0` (Soft Crema Line) | `#38281E` (Dark Roast Line) | Divisores, bordes sutiles |
| `--color-success` | `#059669` (Fresh Mint) | `#34D399` (Vibrant Mint) | Disponibilidad, pedidos listos |
| `--color-warning` | `#D97706` (Amber Honey) | `#FBBF24` (Warm Honey) | Poco stock, tiempos de espera |
| `--color-error` | `#EF4444` (Berry Red) | `#F87171` (Coral Berry) | Agotado, errores de validación |
| `--color-info` | `#6366F1` (Lavender Roast) | `#818CF8` (Soft Lavender) | Productos nuevos, promociones |

---

## 2. Variables CSS (Design Tokens)

```css
:root {
  /* ================= LIGHT MODE ================= */
  --color-bg: #FDF6EC;
  --color-surface: #FFFFFF;
  --color-surface-inset: #F0E6D6;
  --color-surface-hover: #FAF0E1;
  --color-primary: #8B5E3C;
  --color-primary-hover: #6B4226;
  --color-secondary: #C4956A;
  --color-text-primary: #3E2723;
  --color-text-secondary: #6D4C41;
  --color-text-muted: #9E8A78;
  --color-border: #E8DDD0;

  /* Estados semánticos */
  --color-success: #059669;
  --color-warning: #D97706;
  --color-error: #EF4444;
  --color-info: #6366F1;

  /* Sombras Neumórficas (Modo Claro) */
  --shadow-raised: 6px 6px 12px #D5C9B8, -6px -6px 12px #FFFFFF;
  --shadow-raised-hover: 8px 8px 16px #CBC0AE, -8px -8px 16px #FFFFFF;
  --shadow-inset: inset 4px 4px 8px #D5C9B8, inset -4px -4px 8px #FFFFFF;
  --shadow-sm: 0 2px 4px rgba(62, 39, 35, 0.06);
  --shadow-md: 0 4px 12px rgba(62, 39, 35, 0.08);
  --shadow-lg: 0 8px 24px rgba(62, 39, 35, 0.12);
  --shadow-focus: 0 0 0 3px rgba(139, 94, 60, 0.25);
}

[data-theme="dark"],
.dark {
  /* ================= DARK MODE (ESPRESSO) ================= */
  --color-bg: #1A120B;
  --color-surface: #261A13;
  --color-surface-inset: #1F150F;
  --color-surface-hover: #32231A;
  --color-primary: #D4A373;
  --color-primary-hover: #E6BA95;
  --color-secondary: #E6BA95;
  --color-text-primary: #FDF6EC;
  --color-text-secondary: #D5C9B8;
  --color-text-muted: #A89886;
  --color-border: #38281E;

  /* Estados semánticos adaptados */
  --color-success: #34D399;
  --color-warning: #FBBF24;
  --color-error: #F87171;
  --color-info: #818CF8;

  /* Sombras Neumórficas (Modo Oscuro: Sombra Profunda + Luz Suave) */
  --shadow-raised: 6px 6px 14px #0F0A06, -6px -6px 14px #2E2018;
  --shadow-raised-hover: 8px 8px 18px #0A0704, -8px -8px 18px #35251C;
  --shadow-inset: inset 4px 4px 8px #0F0A06, inset -4px -4px 8px #2E2018;
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.65);
  --shadow-focus: 0 0 0 3px rgba(212, 163, 115, 0.35);
}
```

---

## 3. Tipografía (Google Fonts)

* **Headline Font:** `'DM Serif Display', Georgia, serif`
* **Body Font:** `'Work Sans', system-ui, sans-serif`
* **Mono Font:** `'IBM Plex Mono', monospace`

### Escala Tipográfica

| Nivel | Tamaño | Line Height | Peso | Uso Habitual |
| :--- | :--- | :--- | :--- | :--- |
| **h1** | 34px | 42px | 400 (Regular) | Título principal, hero, nombre de cafetería |
| **h2** | 26px | 34px | 400 (Regular) | Títulos de sección |
| **h3** | 20px | 28px | 400 (Regular) | Categorías del menú, tarjetas principales |
| **h4** | 16px | 24px | 500 (Medium) | Nombre de producto, títulos secundarios |
| **body** | 14px | 22px | 400 (Regular) | Descripciones, texto general |
| **small** | 12px | 18px | 400 (Regular) | Precios, metadatos, badges, helper text |
| **mono** | 13px | 20px | 400 (Regular) | Códigos, identificadores, tickets |

```html
<!-- Importación sugerida de fuentes -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=IBM+Plex+Mono:wght@400;500&family=Work+Sans:wght@400;500;600&display=swap" rel="stylesheet">
```

---

## 4. Espaciado y Border Radius

### Espaciado (Base unit: 8px)
* **xs:** 4px — Micro-espacios y gaps compactos
* **sm:** 8px — Separación en línea, iconos y etiquetas
* **md:** 16px — Padding de componentes (botones, inputs)
* **lg:** 24px — Padding de tarjetas y contenedores
* **xl:** 32px — Gaps entre secciones
* **2xl:** 48px — Separación vertical de bloques
* **3xl:** 64px — Márgenes de layout de página

### Border Radius
* **none:** 0px
* **sm:** 6px — Tags, checkboxes, badges pequeños
* **md:** 12px — Botones, tarjetas, inputs (curvatura estándar táctil)
* **lg:** 16px — Modales, diálogos, paneles flotantes
* **full:** 9999px — Chips, pills, avatares, toggles

---

## 5. Especificación de Componentes

### 5.1 Botones (Buttons)
* **Primary:**
  * Modo Claro: Relleno `#8B5E3C`, texto `#FFFFFF`. Hover: `#6B4226` + `var(--shadow-raised)`.
  * Modo Oscuro: Relleno `#D4A373`, texto `#1A120B`. Hover: `#E6BA95` + `var(--shadow-raised)`.
* **Secondary:**
  * Modo Claro: Relleno `#FAF0E1`, texto `#8B5E3C`. Hover: `var(--shadow-raised)` intensificado.
  * Modo Oscuro: Relleno `#32231A`, texto `#D4A373`. Hover: `var(--shadow-raised)` intensificado.
* **Ghost:**
  * Relleno transparente, texto con color `--color-text-secondary`. Hover: fondo `--color-surface-hover`.
* **Destructive:**
  * Relleno `var(--color-error)`, texto `#FFFFFF`. Hover: oscurecido un 10%.
* **Comportamiento Neumórfico:** En estado normal tienen elevación suave; al presionar (`:active`), se aplanan (`transform: translateY(1px); box-shadow: none;`).

### 5.2 Tarjetas (Cards)
* Fondo `var(--color-surface)`, radio de 12px (`border-radius: var(--radius-md)`), padding de 24px (`var(--space-lg)`).
* Sombra predeterminada: `box-shadow: var(--shadow-raised)`.
* Para imágenes superiores: radio de esquina `12px 12px 0 0`.
* En modo oscuro, las tarjetas se destacan sutilmente sobre el fondo espresso gracias al reflejo superior en `#2E2018`.

### 5.3 Campos de Entrada (Inputs)
* **Default:** Sin borde externo, fondo `var(--color-surface-inset)`, sombra neumórfica inset `var(--shadow-inset)`. Radio de 12px, altura de 42px, padding horizontal de 14px.
* **Hover:** Fondo ligeramente más oscuro/claro según el tema con sombra inset mantenida.
* **Focus:** Sombra combinada inset + anillo de foco (`box-shadow: var(--shadow-inset), var(--shadow-focus)`).
* **Error:** Borde visible de 1.5px `var(--color-error)` con fondo suave de error y sin sombra neumórfica.
* **Disabled:** Opacidad 0.45, cursor `not-allowed`.

### 5.4 Chips y Etiquetas (Chips / Badges)
* **Filter Chips:** Forma pill (`border-radius: 9999px`), fondo `--color-surface-hover`, texto `--color-primary`, mini-sombra neumórfica `raised`.
* **Status Badges:**
  * *Available:* Fondo con tinte verde suave, texto `var(--color-success)`.
  * *Limited / Wait:* Fondo con tinte ámbar suave, texto `var(--color-warning)`.
  * *Sold Out:* Fondo con tinte rojo suave, texto `var(--color-error)`.
  * *Seasonal:* Fondo con tinte violeta suave, texto `var(--color-info)`.

### 5.5 Listas y Filas (Lists)
* Altura de fila mínima de 52px, padding vertical 12px, horizontal 16px.
* Divisor de 1px con `var(--color-border)`.
* **Hover:** Fondo `var(--color-surface-hover)`.
* **Selected:** Fondo `var(--color-surface-inset)` con borde izquierdo acentuado de 3px en `var(--color-primary)`.

### 5.6 Controles de Selección (Checkboxes & Radios)
* Tamaño de 18px.
* **Unchecked:** Fondo `var(--color-surface-inset)` con mini sombra inset.
* **Checked:** Fondo `var(--color-primary)` con checkmark blanco y mini sombra raised.

---

## 6. Reglas de Implementación (Do's & Don'ts)

1. **Do:** Aplicar sombras neumórficas `var(--shadow-raised)` e `inset` únicamente sobre superficies con fondo temático (`--color-bg`); no funcionan sobre blanco puro `#FFFFFF` ni sobre negro puro `#000000`.
2. **Do:** Mantener la coherencia de la paleta café cálida; evitar introducir azules fríos o grises metalizados corporativos.
3. **Don't:** Amontonar elementos neumórficos sin margen; requieren espaciado (`md` o `lg`) para que el efecto tridimensional respire.
4. **Do:** Usar `'DM Serif Display'` con moderación y exclusivamente para encabezados (`h1`, `h2`); nunca para textos de párrafo ni botones.
5. **Don't:** Aplicar sombra `raised` a elementos menores de 24px (iconos pequeños o tags diminutos) porque se torna confusa y saturada.
6. **Do:** Asegurar que las imágenes y fotografías cuenten con un balance de blancos cálido que armonice con la gama moca/crema.
7. **Do:** Utilizar la clase `.dark` o el atributo `data-theme="dark"` en la etiqueta `<html>` para la conmutación instantánea entre temas.
