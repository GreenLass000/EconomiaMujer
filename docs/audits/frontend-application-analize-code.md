# Auditoría del frontend — Economía Mujer

**Fecha:** 2026-07-30

## Alcance revisado

- **Ámbito:** aplicación frontend completa (dashboard de economía, gestión de personas, movimientos e informes), ya que no se indicó una pantalla concreta.
- **Frontend revisado:** `react_app/src/`, configuración de arranque y HTML público.
- **Contexto operativo declarado:** aplicación privada, accesible exclusivamente desde una intranet; los datos son privados y no se expone el servicio a Internet.
- **Contratos contrastados:** rutas Flask que consume el cliente (`flask_app/routes/`). Esto no constituye una auditoría integral del backend, pero permite verificar los límites de confianza expuestos al frontend.
- **Clasificación:** React 18.2 con Create React App, Material UI 5 y Axios; no usa Web Components ni enrutado cliente.

## Entradas y metodología

- Se revisaron rutas de datos, estado, diálogos, formularios, estilos, configuración de build y llamadas HTTP.
- Se usó el grafo existente en `graphify-out/`: sitúa el dashboard, gestión de personas y formularios como comunidades separadas conectadas por los endpoints de `Person` y `Record`. Las relaciones inferidas se contrastaron con el código fuente.
- Se aplicaron criterios de accesibilidad/UX de Web Interface Guidelines, y criterios de React sobre efectos, peticiones y renderizado.
- Verificación ejecutada: `npm run build` en `react_app` (correcta; bundle principal comprimido de 223.48 kB).
- Limitaciones: no hay pruebas frontend en el repositorio, ni se ejecutó la aplicación contra una base de datos real. No se auditaron infraestructura, credenciales de despliegue ni generación interna del PDF.

## Resumen ejecutivo

La base de componentes es pequeña y entendible, los flujos destructivos muestran confirmación y el build de producción compila. El servicio no se expone a Internet, lo que reduce de forma importante la superficie de ataque externa. Sin embargo, al manejar datos económicos y personales privados, no hay autenticación ni autorización efectiva en las rutas que el frontend invoca. Cualquier equipo o proceso que alcance la API dentro de la intranet puede consultar, editar, eliminar o dar de baja recursos por ID.

En el cliente, la configuración de red está fragmentada entre el proxy de desarrollo y una IP privada HTTP fija. Esto rompe despliegues, dificulta la seguridad de transporte y puede hacer que distintas pantallas hablen con orígenes distintos. La vista de personas también genera una petición adicional por cada persona para calcular sus saldos, por lo que la carga escala linealmente con la lista.

**Prioridad:** proteger la API y centralizar su configuración; después, eliminar el patrón N+1 y hacer explícitos los estados de carga/error.

## Hallazgos por severidad

### Crítica

No se han confirmado vulnerabilidades críticas dentro del alcance revisado.

### Alta

#### H-1 — La API expone operaciones y datos sensibles sin autenticación ni autorización

- **Tipo:** problema confirmado.
- **Impacto:** en el perímetro de la intranet, cualquier equipo o proceso que alcance el servicio puede enumerar personas, consultar movimientos de cualquier `person_id`, descargar informes, crear movimientos y modificar o borrar registros por ID. CORS no autentica ni autoriza solicitudes. No se considera un vector de Internet en el modelo operativo declarado.
- **Evidencia:** el frontend llama directamente a mutaciones por ID en `react_app/src/components/Interactivelist/hooks/usePersons.js:83`, `:100`, `:117` y `:136`; las rutas correspondientes no verifican sesión, identidad ni rol en `flask_app/routes/person.py:92-198`, `flask_app/routes/record.py:21-155` y `flask_app/routes/report.py:9-65`.
- **Recomendación:** introducir autenticación de servidor (sesión segura o tokens), autorización por rol y por recurso en cada endpoint, y auditoría de mutaciones. No aceptar que ocultar controles en React sea una frontera de seguridad.

#### H-2 — Endpoints HTTP con IP privada fija y configuración de red inconsistente

- **Tipo:** problema confirmado; el riesgo de interceptación depende de la red de despliegue.
- **Impacto:** el cliente incorpora `http://192.168.1.118:5000` en el bundle y mezcla esas llamadas con rutas relativas que dependen del proxy CRA. En producción servida con `serve`, ese proxy no existe. En la intranet declarada, HTTP no implica exposición pública; aun así, no cifra datos privados frente a un equipo comprometido, escucha de red o segmentación deficiente.
- **Evidencia:** IP fija en `react_app/src/components/NewIncomeSpent/hooks/useFormLists.js:15-17`, `handlers/formHandlers.js:24`, `NewPerson/index.jsx:21`, `DetailTable/index.jsx:41,59`, `Interactivelist/hooks/usePersons.js:83,100,117,136` y `GenerateReportModal/hooks/useGenerateReport.js:12,27`; rutas relativas en `DetailTable/index.jsx:25`, `AppBar/index.jsx:48` y `usePersons.js:29,39,63`. El proxy solo está definido para desarrollo en `react_app/package.json`.
- **Recomendación:** crear un único cliente HTTP con `REACT_APP_API_BASE_URL`, usar rutas relativas detrás de un reverse proxy HTTPS en producción, y eliminar IPs/orígenes de la red local del código fuente. Configurar CORS por entorno como defensa complementaria.

#### H-3 — Carga N+1 de saldos por persona

- **Tipo:** problema confirmado.
- **Impacto:** abrir/actualizar la lista hace una petición a `/persons/active` y luego una a `/record/person/:id` por cada persona. Con 100 personas son 101 solicitudes y cálculos en el navegador, con latencia, carga de base de datos y riesgo de respuestas parcialmente actualizadas.
- **Evidencia:** `react_app/src/components/Interactivelist/hooks/usePersons.js:37-53` usa `Promise.all(response.data.map(...fetchPersonBalance...))`; `fetchPersonBalance` hace el GET en `:27-35`.
- **Recomendación:** añadir un endpoint agregado que devuelva personas y saldo del año seleccionado en una sola consulta SQL agrupada. Mientras tanto, cachear/deduplicar peticiones y mostrar carga por fila o global.

### Media

#### M-1 — Estados de carga, error y reintento insuficientes en datos principales

- **Tipo:** problema confirmado.
- **Impacto:** tablas vacías pueden significar “no hay datos”, “la petición aún carga” o “la API falló”; los errores solo van a consola. El usuario puede tomar decisiones sobre una vista incompleta.
- **Evidencia:** `DetailTable/index.jsx:22-31` captura el error sin estado visible; `usePersons.js:37-56` hace lo mismo. Los componentes presentan directamente el mismo vacío en `TableBodyContent.jsx:20-25` y `PersonTable.jsx:19-24`.
- **Recomendación:** modelar `idle/loading/success/error`, usar `Alert` con acción “Reintentar”, y no reutilizar el estado vacío como error. Deshabilitar acciones dependientes de datos mientras se resuelve la carga.

#### M-2 — Al fallar el alta de persona el diálogo se cierra y se refresca como si hubiese éxito

- **Tipo:** problema confirmado.
- **Impacto:** un fallo de red o validación borra el formulario, cierra el diálogo y oculta el error; el usuario cree que la operación se completó o pierde lo escrito.
- **Evidencia:** `NewPerson/index.jsx:21-29` llama a `onFinish` y reinicia el estado dentro de `finally`; `AppBar/index.jsx:106-113` hace que `onFinish` refresque y cierre el diálogo. No hay feedback de error en ese flujo.
- **Recomendación:** mover `onFinish` y el reset al camino exitoso, conservar el formulario ante error y mostrar un error accesible con acción de reintento.

#### M-3 — Acciones de icono sin nombre accesible

- **Tipo:** problema confirmado.
- **Impacto:** lectores de pantalla anuncian botones sin propósito claro en editar, borrar y ver detalles.
- **Evidencia:** `DetailTable/components/TableBodyContent.jsx:36-41`, `Interactivelist/components/PersonTable.jsx:33-35` y `PersonDetailDialog.jsx:63-64` usan `IconButton` sin `aria-label`; los iconos tampoco se marcan decorativos.
- **Recomendación:** añadir etiquetas específicas, por ejemplo `aria-label="Editar movimiento ${row.concept}"`, y `aria-hidden="true"` en los iconos cuando el botón ya esté etiquetado.

#### M-4 — Layout no adaptado a pantallas estrechas y tablas extensas

- **Tipo:** problema confirmado.
- **Impacto:** el dashboard fuerza dos columnas a cualquier ancho y las tablas no tienen un contenedor de desplazamiento horizontal explícito. En móvil, columnas y botones del diálogo de detalle pueden desbordar o quedar demasiado comprimidos.
- **Evidencia:** `react_app/src/App.css:1-4` fija `repeat(2, 1fr)` sin media query; `PersonDetailDialog.jsx:14-27` agrupa acciones en fila; los `TableContainer` no definen estrategia responsive.
- **Recomendación:** una columna bajo un breakpoint apropiado, `TableContainer` con `overflowX: 'auto'`, y acciones de diálogo apilables o de menú. Probar al menos a 320 px y 768 px.

#### M-5 — Las peticiones de efectos no se cancelan ni protegen de respuestas obsoletas

- **Tipo:** riesgo probable, sustentado por la estructura actual.
- **Impacto:** al cambiar rápido de año o cerrar un diálogo, una petición anterior puede terminar después y sobrescribir datos de la selección actual; React Strict Mode también ejecuta el ciclo de efecto adicionalmente en desarrollo.
- **Evidencia:** efectos sin `AbortController`/cancelación en `DetailTable/index.jsx:22-32`, `Interactivelist/index.jsx:31-34`, `NewIncomeSpent/hooks/useFormLists.js:11-31` y `GenerateReportModal/hooks/useGenerateReport.js:11-15`. `handleRowClick` abre el modal tras esperar la respuesta en `usePersons.js:59-69`.
- **Recomendación:** usar `AbortController` o cancelación Axios, comprobar que la respuesta corresponde a la selección vigente y centralizar el fetching/caché en una capa de consulta.

### Baja

#### L-1 — Selección global y año local duplicados

- **Tipo:** oportunidad de mejora.
- **Impacto:** hay dos fuentes de verdad temporales para el año; complica razonar sobre handlers y futuras ampliaciones.
- **Evidencia:** `App.js:11-30` conserva `selectedYear` global; `usePersons.js:9,165` mantiene y expone otro, que `Interactivelist/index.jsx:31-34` sincroniza mediante efecto.
- **Recomendación:** pasar el año como argumento a handlers/fetches o elevarlo a un único contexto/proveedor; eliminar la sincronización derivada.

#### L-2 — Formularios no comunican validación de forma accesible y permiten incoherencias de rango

- **Tipo:** problema confirmado.
- **Impacto:** el formulario de movimiento usa `alert` para error general y el informe no impide que la fecha final sea anterior a la inicial. Varios campos de edición no llevan `name`, `required`, límites ni mensajes junto al campo.
- **Evidencia:** `formHandlers.js:16-18,29-31`; `GenerateReportModal/components/DateRangeFields.jsx:6-22`; `EditRecordDialog.jsx:11-31`; `EditDialog.jsx:8-32`.
- **Recomendación:** validación declarativa por campo, `helperText`/`error` de MUI, límites `min/max`, foco en el primer error y validación de nuevo en servidor.

#### L-3 — La URL no representa el año activo y el contenido base carece de estructura de navegación

- **Tipo:** oportunidad de mejora.
- **Impacto:** una vista histórica no se puede compartir ni restaurar al recargar; teclado/lector no obtiene un salto rápido al contenido ni un encabezado de primer nivel.
- **Evidencia:** el año vive solo en `App.js:13`; `App.js:19-32` no incluye `main`, `h1` ni enlace de salto. Los títulos visuales son `div` en `CustomTextBox/index.jsx:4-23`.
- **Recomendación:** sincronizar `year` en query string, añadir `<a href="#main-content">Saltar al contenido</a>`, `<main id="main-content">` y jerarquía `h1/h2`.

#### L-4 — Higiene de release y pruebas insuficientes

- **Tipo:** problema confirmado.
- **Impacto:** CRA 5 es una base de tooling antigua y no hay tests localizados para los flujos de ingresos, borrado, historial ni errores; regresiones de contratos API pasarán al usuario final.
- **Evidencia:** `react_app/package.json:6-33` usa `react-scripts` 5.0.1; no hay archivos de test bajo `react_app`; el HTML conserva texto/metadata genéricos en `public/index.html:8-10`.
- **Recomendación:** añadir tests de componente e integración con MSW, bloquear el contrato de endpoints y planificar migración desde CRA a una herramienta mantenida. Corregir título, descripción y manifest antes de publicar.

## Revisión UI, UX y accesibilidad

### Aspectos saludables

- La interfaz utiliza controles semánticos de MUI y las acciones destructivas principales se confirman antes de enviar la mutación (`DeleteDialog`, `ConfirmDialog`).
- Hay estados vacíos en ambas tablas y formato monetario con `Intl.NumberFormat('es-ES')` en `TableBodyContent.jsx:6` y `usePersons.js:22-23`.
- Los formularios principales tienen etiquetas visibles; no se detectaron usos de `dangerouslySetInnerHTML`, plantillas HTML sin escapar ni navegación mediante `div` clicable.

### Mejoras necesarias

- Añadir los nombres accesibles de los iconos (M-3) y anuncios vivos para los snackbars; `Alert` se beneficia de `role="status"`/`aria-live="polite"` cuando el resultado no sea crítico.
- No se debe aplicar `user-select: none` globalmente (`react_app/src/index.css:1-3`): impide copiar importes, fechas y textos útiles, y empeora accesibilidad. Reservarlo para controles de arrastre si existieran.
- Usar colores semánticos del tema, icono/texto o contraste adicional para saldo positivo/negativo; el significado no debe depender solo de verde/rojo (`TableBodyContent.jsx:15,32`, `PersonTable.jsx:29`). Aplicar números tabulares a las columnas monetarias.
- Establecer estados de foco visibles y revisar tamaños táctiles, especialmente dentro de tablas. No se han encontrado reglas CSS que anulen el foco, pero tampoco reglas de foco propias.
- Sustituir mensajes como “No hay datos en la tabla” por textos que distingan ausencia, carga y error, con siguiente acción concreta.

## Buenas prácticas específicas de React

- **Renderizado y estado:** el patrón de `refreshKey` en `App.js:11-30` fuerza recargas de dos subárboles y no ofrece consistencia de caché. Preferir invalidación de consultas identificadas por `year` tras una mutación exitosa.
- **Efectos y asincronía:** los efectos de carga requieren cancelación (M-5); los hooks hoy devuelven objetos amplios de setters y handlers (`usePersons.js:146-181`), lo que expone detalles de implementación a la pantalla.
- **Datos:** Axios y `fetch` se mezclan, junto con bases URL distintas. Un `apiClient` único debe normalizar errores, abortos, credenciales y serialización.
- **Rendimiento:** H-3 es la prioridad. Las tablas no se virtualizan; no es un defecto inmediato sin un volumen conocido, pero se debe incorporar virtualización o `content-visibility` si los movimientos/personas superan aproximadamente 50 filas.
- **Bundle/hidratación:** no hay SSR ni riesgo de hidratación. El build es correcto, aunque el bundle principal merece seguimiento después de agregar nuevas dependencias.
- **Almacenamiento cliente:** no se detectaron lecturas/escrituras a `localStorage` ni `sessionStorage`, por lo que no hay datos sensibles persistidos en el navegador actualmente.

## Arquitectura y mantenibilidad

- La división de los formularios de nuevo movimiento en controles, hooks y utilidades es positiva. Sin embargo, `createFormHandlers` se recrea en cada render y recibe todo el estado/listas; encapsular la mutación y estado de envío en un hook de formulario simplificaría la interfaz.
- `usePersons` concentra fetch, cálculo, selección, cuatro diálogos, mutaciones, snackbars y formato. Es un “hook controlador” difícil de probar; separar `usePersonQueries`, `usePersonMutations` y estado del diálogo reduciría acoplamiento.
- Existen implementaciones casi duplicadas de edición y confirmación (`DetailTable` frente a `Interactivelist`), y tres snackbar separados. Un componente de confirmación y un sistema de notificación comunes evitarían divergencias.
- Los estilos globales y en línea (`CustomTextBox`) limitan la coherencia del tema. Mover tokens de espaciado, color y tipografía a `theme.js` y `sx`/componentes de MUI facilitaría un diseño más consistente.

## Revisión de seguridad

- **Autenticación/autorización:** H-1 es el riesgo principal. No se detectó ningún token, sesión, control de rol ni comprobación de propiedad.
- **Límites de confianza:** el cliente manda `person_id`, importes y `isconcertado`; el servidor debe verificar permisos y reglas de negocio independientemente de la validación React. La ruta de actualización acepta los valores sin validación de tipo, rango o longitud en `flask_app/routes/record.py:114-130`.
- **Datos privados:** `GET /persons/active` expone fechas de alta/baja además del nombre a cualquier cliente permitido (`flask_app/routes/person.py:30-48`). Limitar campos al mínimo necesario.
- **XSS/URLs/archivos:** no se hallaron superficies de HTML crudo, Markdown, carga de archivos, embeds ni redirecciones controladas por usuario. El nombre de descarga del PDF procede de datos de persona; el backend debería normalizarlo igualmente.
- **Transporte:** H-2 deja datos en HTTP si se usa la configuración actual. La intranet reduce el riesgo frente a Internet, pero TLS sigue siendo recomendable para datos privados cuando sea viable; CORS no es un control de acceso.

## Mejoras transversales

1. Crear una capa API tipada/configurable con base URL por entorno, interceptores de auth, errores normalizados y cancelación.
2. Adoptar un gestor de datos de servidor (por ejemplo, TanStack Query) para caché por año, invalidación tras mutaciones, estados y deduplicación.
3. Definir un modelo de permisos en Flask antes de rediseñar controles del cliente; la UI debe consumir las capacidades que el servidor exponga.
4. Consolidar diálogos de edición/confirmación, notificaciones y componentes de tabla en primitivas compartidas con etiquetas accesibles.

## Plan de acción priorizado

1. **Inmediato:** exigir autenticación y autorización en API; servir frontend/API bajo HTTPS y retirar IPs HTTP fijas del bundle.
2. **Corto plazo:** añadir endpoint de saldos agregados; centralizar el cliente HTTP; mostrar carga, error y reintento; corregir el flujo de fallo al crear persona.
3. **Estructural:** dividir `usePersons`, eliminar el estado duplicado de año y adoptar una caché de consultas/mutaciones; añadir pruebas con API simulada.
4. **Pulido:** responsive para móvil, etiquetas de iconos, `aria-live`, selección de texto, URL del año, encabezados semánticos y metadatos de producto.

## Preguntas abiertas y supuestos

- Se confirma que las personas y movimientos son datos privados y que el servicio se limita a una intranet, sin exposición a Internet. H-1 se evalúa por el riesgo interno, de equipos comprometidos y de accesos no autorizados dentro de la red, no por exposición pública.
- No se pudo confirmar el volumen máximo de personas/movimientos; H-3 está confirmado por el patrón de red, mientras que la severidad de su impacto crecerá con ese volumen y latencia.
- No se confirmó si existe un proxy HTTPS de producción externo. La configuración actual del repositorio, por sí sola, no lo garantiza.
- Las conclusiones de seguridad de backend se limitan a las rutas revisadas para validar el frontend; se requiere una auditoría específica de backend, base de datos e infraestructura para cobertura completa.
