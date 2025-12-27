# Madrid Jobs

Aplicación de gestión financiera y control de trabajos para freelancers, diseñada para facilitar el seguimiento de ingresos, días trabajados y generación de recibos.

## Características Principales

*   **📊 Tablero de Control**: Vista rápida de ingresos pendientes, pagados y desglose por ubicación (Casa vs Empresa).
*   **📝 Registro de Trabajos**: Agrega entradas individualmente o por lotes (rangos de fechas) para mayor rapidez.
*   **🧾 Generador de Recibos**: Crea tickets de caja en formato PNG listos para descargar, con opciones de filtrado por mes o rango personalizado.
*   **💾 Persistencia**: Todos los datos se guardan localmente en el navegador.

## Instalación

### Prerrequisitos
*   Node.js instalado.

### Pasos

1.  **Instalar dependencias**
    ```bash
    npm install
    ```

2.  **Ejecutar la aplicación**
    ```bash
    npm run dev
    ```

## Guía de Uso Rápida

1.  **Agregar Trabajos**: Usa el botón "Registrar" (+) para añadir días. Puedes seleccionar "Por Lotes" para añadir múltiples días consecutivos.
2.  **Gestionar Pagos**: En la lista principal, haz clic en el estado "Pendiente" para marcarlo como "Pagado" (y viceversa).
3.  **Recibos**: Haz clic en el botón de recibo (móvil) o "Recibo" (escritorio) para generar un comprobante visual.
