# 🩺 SAD-TH — Frontend (Sistema de Archivo Digital - Talento Humano)

Interfaz web moderna, reactiva y de alto rendimiento desarrollada en **React 18** y **Vite** para la plataforma de Gestión Documental Electrónica (DMS/GED) del **Hospital General del Sur Dr. Pedro Iturbe**.

El cliente web ha sido diseñado bajo una estrategia de **cero consumo de recursos en el servidor** (Zero-Server-Load), ejecutando tareas complejas como la generación de PDFs clínicos, exportaciones a Excel y renderizado de gráficos estadísticos directamente en el navegador del usuario.

---

## 🚀 Características Principales

* **Dashboard Interactivo y Microinteracciones:** Interfaz oscura institucional (`#0f172a` / `#1e293b`) con transiciones suaves de escala (`scale-103`), elevación de sombra y estados de respuesta visual (*hover*) en todos los botones y tarjetas.
* **Conmutador de Tema Claro / Oscuro (☀️ / 🌙):** Sistema de temas conmutables implementado mediante **Variables CSS (`:root` / `.theme-light`)**, permitiendo adaptar el contraste de colores para entornos iluminados sin alterar la estructura JSX.
* **Generación de Reportes en el Cliente (Zero-Server-Load):**
  * **Ficha Individual PDF:** Motor de maquetación clínica en `jsPDF` con encabezados institucionales, tablas de datos del trabajador y semáforos de auditoría.
  * **Exportaciones Masivas:** Generación instantánea de reportes en PDF (`jsPDF-AutoTable`) y hojas de cálculo en Excel (`XLSX`).
  * **Impresión Nativa:** Plantilla HTML/CSS independiente para la ventana de impresión del navegador.
* **Visualización de Datos con Gráficos SVG Nativos:** Componente de gráficos circulares tipo *Donut* desarrollados con SVG puro (sin librerías pesadas), con animaciones de carga, tooltips dinámicos y leyendas interactivas.
* **Bóveda Digital e Ingesta Inteligente:** 
  * Búsqueda en tiempo real por Cédula o Nombre.
  * Selector de Modo de Análisis (Rápido / Completo).
  * Modal emergente (`showDocModal`) para la previsualización, subida mediante `FormData` y eliminación de archivos escaneados.
* **Trazabilidad de Préstamos Físicos:** Bitácora histórica con indicadores visuales por estado: Verde (Devuelto), Azul (Activo), Amarillo (Próximo a Vencer) y Rojo (Vencido).
* **Centro de Alertas Dinámico:** Visualización en tiempo real de préstamos expirados, alertas preventivas de 48 horas y expedientes elegibles para expurgo legal (retención de 5 años).
* **Panel de Permisos Granulares (ABAC/RBAC):** Modal administrativo para crear usuarios, modificar contraseñas/nombres y personalizar los permisos de cada usuario `GUEST` (pestañas visibles y estatus laborales autorizados).
* **Despliegue Multi-Red (Rutas Relativas):** Todas las peticiones HTTP utilizan rutas relativas (`/auth/login`, `/patients/`, etc.), lo que permite servir el frontend compilado (`dist`) monolíticamente desde FastAPI en cualquier dirección IP local sin conflictos de CORS.

---

<img width="1364" height="768" alt="image" src="https://github.com/user-attachments/assets/fd1192cf-1316-4bfa-be39-35213ec1c253" />

---

## 🛠️ Stack Tecnológico

| Componente | Tecnología |
| :--- | :--- |
| **Framework & Build Tool** | React 18+, Vite |
| **Lenguaje** | JavaScript (ES6+) |
| **Cliente HTTP** | Axios |
| **Iconografía** | Lucide-React |
| **Generación de PDF** | jsPDF, jsPDF-AutoTable |
| **Hojas de Cálculo** | SheetJS (XLSX) |
| **Estilos & Temas** | CSS-in-JS + CSS Variables (`:root`) |

---

## 📂 Estructura del Proyecto

```text
mi_frontend_medico/
├── src/
│   ├── App.jsx           # Componente principal, dashboard, routers y modales
│   ├── main.jsx          # Punto de entrada de React
│   └── index.css         # Reset de estilos base
├── public/               # Recursos estáticos e íconos
├── package.json          # Configuración de dependencias y scripts de Vite
└── vite.config.js        # Configuración del servidor de desarrollo
