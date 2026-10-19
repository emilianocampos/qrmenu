# MaxiRest Bridge - MambaQR 🚀

Agente de escritorio en segundo plano para conectar **MambaQR (Carta Digital)** con el sistema **MaxiRest** en la computadora del restaurante.

---

## Funcionalidades Principales

1. **Apertura de Mesa y Carga en Adición Automática (`accepted`)**:
   - Cuando el mozo acepta el pedido desde el celular/tablet y elige su nombre, el puente genera instantáneamente el archivo `COM_{ID}_OPEN.TXT` en la carpeta del Spooler de MaxiRest.
   - MaxiRest abre la mesa en el salón y precarga todos los ítems con sus observaciones (ej. *"Sin cebolla"*, *"Extra queso"*).

2. **Marcha e Impresión de Comanda (`preparing`)**:
   - Cuando cocina o el mozo presiona *"Comenzar a preparar"*, el puente emite `COM_{ID}_MARCHAR.TXT`.
   - MaxiRest dispara la marcha y se imprimen los tickets físicos en las comanderas térmicas de cocina y barra.

3. **Cobro y Cierre de Mesa (`paid`)**:
   - Al marcarse el pedido como pagado (en efectivo con el mozo o vía Mercado Pago), se asienta el cobro en MaxiRest y se acredita automáticamente el sello de fidelidad al cliente.

4. **Sincronización Dinámica de la Carta (Smart Merge)**:
   - Conecta a la base de datos MySQL local de MaxiRest (`mxrua` y `mxart`) o lee un archivo dump `.sql`.
   - Actualiza automáticamente los precios de la carta y el estado de disponibilidad de los productos.
   - **PRESERVA INTACTAS LAS FOTOS Y DESCRIPCIONES** que se hayan cargado en la web para que la carta digital mantenga su atractivo visual.
   - Se puede ejecutar en cualquier momento presionando la tecla **`[S]`** en la consola del puente.

---

## Configuración (`config.json`)

Edita el archivo `config.json` antes de iniciar:

```json
{
  "supabaseUrl": "https://vyzgnapikhpbeqcwxzsb.supabase.co",
  "supabaseServiceKey": "TU_SERVICE_ROLE_KEY",
  "businessId": "ID_DE_TU_RESTAURANTE",
  "businessSlug": "slug-de-tu-restaurante",
  "maxirest": {
    "spoolerPath": "C:\\MaxiRest\\ComandasIn",
    "archivePath": "C:\\MaxiRest\\ComandasProcesadas",
    "autoSyncMenuOnStart": true,
    "autoSyncIntervalHours": 4,
    "db": {
      "host": "localhost",
      "port": 3306,
      "user": "root",
      "password": "",
      "database": "maxirest"
    },
    "sqlDumpFallbackPath": ""
  }
}
```

---

## Cómo Ejecutar en la PC del Restaurante

### Opción A: Doble Clic (Recomendado)
Haz doble clic sobre el archivo **`iniciar-puente.bat`**.
Se abrirá una ventana de consola que instalará las dependencias necesarias y comenzará a sincronizar en tiempo real.

### Opción B: Desde la Terminal
```bash
cd maxirest-bridge
npm install
npm run dev
```

---

## Comandos en Consola

- **`[S]`**: Forzar sincronización inmediata de precios y artículos desde MaxiRest hacia la carta digital.
- **`[T]`**: Enviar una comanda de prueba para verificar que MaxiRest consuma los archivos correctamente.
- **`[C]`**: Limpiar la pantalla de la consola.
- **`[Q]`**: Detener el programa de forma segura.
