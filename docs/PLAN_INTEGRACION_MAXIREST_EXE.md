# Plan de Implementación: Flujo Completo MaxiRest + Carta QR + Mercado Pago

Este documento detalla el flujo operativo completo entre la **Carta Digital QR**, el agente de escritorio (**`maxirest-bridge.exe`**) y **MaxiRest** (basado en la pantalla oficial de comandas de MaxiRest), junto con la integración y funcionamiento de **Mercado Pago**.

---

## 1. Diagrama del Ciclo de Vida del Pedido

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 FASE 1: TOMA DEL PEDIDO                                 │
│  Cliente escanea QR de la Mesa (ej: Mesa 1 - Barra) y arma su pedido.                  │
│  Llega al panel web (/orders) en estado: PENDIENTE.                                     │
└────────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                          FASE 2: ASIGNACIÓN Y CARGA EN MAXIREST                         │
│  1. El encargado/mozo hace click en "Aceptar Pedido".                                   │
│  2. Se abre el selector modal y elige el Mozo (ej: Lucas).                              │
│  3. La app actualiza el pedido a: ACEPTADO con la etiqueta [Mozo: Lucas].               │
│  4. El .exe en la PC del local recibe el evento en tiempo real:                         │
│     ➔ ABRE LA MESA en MaxiRest con el Mozo vinculado.                                   │
│     ➔ PRECARGA LOS PRODUCTOS (Cant, Detalle, P.Unit, Total) en la grilla.              │
│     ➔ Queda en estado "PENDIENTE" (aún no marcha a cocina).                             │
└────────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                     FASE 3: MARCHA DE COMANDA (COCINA / BARRA)                          │
│  1. En la app web, el mozo/cocina presiona: "Comenzar a preparar".                      │
│  2. La app actualiza el estado a: PREPARANDO.                                           │
│  3. El .exe recibe el evento y ejecuta la acción:                                       │
│     ➔ DISPARA LA COMANDA / MARCHAR en MaxiRest (ícono campana 'MARCHAR').              │
│     ➔ Se imprimen los tickets físicos en la comandera térmica de cocina o barra.       │
└────────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                    FASE 4: ENTREGA Y HABILITACIÓN DE PAGO                               │
│  1. El personal marca el pedido como "Listo" y luego "Entregado al cliente".           │
│  2. Estado en la app: ENTREGADO (delivered).                                            │
│  3. Se HABILITA el botón de pago con Mercado Pago para el cliente o desde el salón.    │
└────────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                          FASE 5: PAGO CON MERCADO PAGO                                  │
│  1. El cliente toca "Pagar Mesa con Mercado Pago" desde su celular.                     │
│  2. Se abre el Checkout de Mercado Pago (Dinero en cuenta, Débito, Crédito).           │
│  3. Al confirmarse el pago:                                                             │
│     ➔ La orden pasa a estado PAGADO (paid) en la app.                                   │
│     ➔ El .exe notifica a MaxiRest para registrar el cobro o emitir Factura/Ticket.     │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Correspondencia con la Pantalla de MaxiRest

En la interfaz de carga de comandas de MaxiRest (captura del sistema):

| Elemento en MaxiRest | Origen desde nuestra App | Acción que ejecuta el `.exe` |
| :--- | :--- | :--- |
| **Cabecera (Mesa / Barra / Mozo)** | QR de la Mesa + Mozo seleccionado en el modal | Abre la mesa en el salón/mostrador y le asigna el código de mozo correspondiente. |
| **Grilla de Ítems (Cant, Detalle, P.Unit, Total)** | `order.order_items` de la comanda | Inserta cada línea de producto con su cantidad, precio unitario y observaciones/adicionales. |
| **Botón 'Pendiente' (Reloj de arena)** | Estado `accepted` en la app web | La comanda queda asentada en la mesa pero no se envía a las impresoras de producción aún. |
| **Botón 'Marchar' (Campana con plato)** | Al tocar **"Comenzar a preparar"** (`preparing`) | El `.exe` ejecuta el comando de marchar comanda. MaxiRest envía la impresión física a cocina y barra. |
| **Botón 'Factura B / Cobro'** | Al pagar con **Mercado Pago** (`paid`) | Registra el comprobante de cobro electrónico o pre-cierra la mesa. |

---

## 3. ¿Cómo Funciona el Cobro con Mercado Pago en este Flujo?

Tu aplicación ya cuenta con el campo **Access Token de Mercado Pago** en `/configuracion`. El flujo opera de la siguiente manera:

### Opción A: Pago Online desde el Celular del Cliente (Checkout Pro)
1. Cuando el pedido está en estado **Entregado** (`delivered`), la pantalla de seguimiento del cliente en la carta digital muestra el botón destacado:
   **💳 Pagar $X.XXX con Mercado Pago**
2. Al tocarlo:
   - Se crea una *Preferencia de Pago* en la API de Mercado Pago con el monto exacto del pedido, el nombre del restaurante y el número de mesa.
   - El cliente es redirigido a la pasarela de Mercado Pago (puede pagar con saldo en cuenta MP, débito, tarjeta de crédito o transferencia).
3. **Confirmación Inmediata (Webhook):**
   - Mercado Pago notifica al servidor de nuestra app: `payment.status === 'approved'`.
   - La app cambia automáticamente el pedido a **Pagado** (`paid`).
   - El cliente ve su comprobante digital en el celular.
   - En el panel del restaurante, la tarjeta cambia a verde: `Pedido Pagado Correctamente`.

### Opción B: Cobro Presencial en la Mesa (Point o QR Físico)
1. Si el cliente prefiere pagarle al mozo con Mercado Pago Point (posnet físico) o escaneando el cartelito QR de Mercado Pago del local:
2. El mozo cobra con su lector habitual.
3. En el panel `/orders`, el mozo presiona **"Marcar como Pagado"**, registrando que la mesa quedó saldada.

---

## 4. Estructura de Eventos que escucha el `.exe` (Supabase Realtime)

El agente local se suscribe a los cambios de la tabla `orders` del negocio. Maneja los dos eventos clave:

### Evento 1: Apertura y Carga de Productos (`status === 'accepted'`)
```json
{
  "event": "UPDATE",
  "new": {
    "id": "order-123",
    "status": "accepted",
    "customer_identifier": "Mesa 1 - Barra",
    "comments": "[Mozo: Lucas] Sin sal en las papas",
    "total": 1180.64
  }
}
```
**Acción del `.exe`:**
1. Lee `Mesa 1 - Barra` y `Mozo: Lucas`.
2. Busca los ítems asociados a `order-123` (Rabas x1, Coca Cola x1, Carpaccio x3).
3. Abre la mesa en MaxiRest y precarga los productos en la grilla.

---

### Evento 2: Marchar Comanda a Cocina (`status === 'preparing'`)
```json
{
  "event": "UPDATE",
  "new": {
    "id": "order-123",
    "status": "preparing"
  }
}
```
**Acción del `.exe`:**
1. Identifica que la orden de la `Mesa 1 - Barra` comenzó preparación.
2. Emite la instrucción de **Marchar** en MaxiRest.
3. Se dispara la impresión en las comanderas térmicas de despacho (cocina/barra).

---

### Evento 3: Pago Acreditado (`status === 'paid'`)
```json
{
  "event": "UPDATE",
  "new": {
    "id": "order-123",
    "status": "paid",
    "payment_method": "mercadopago"
  }
}
```
**Acción del `.exe`:**
1. Asienta en MaxiRest el pago recibido con medio "Mercado Pago / Cobro Digital".
2. Libera la mesa o emite ticket de control de mesa.

---

## 5. Implementación del Archivo Spooler / Comandera en el `.exe`

Para el Método Spooler (el más seguro, compatible con MaxiRest), el `.exe` escribe archivos estructurados en la carpeta de entrada de MaxiRest (ej: `C:\MaxiRest\ComandasIn\`):

### Archivo de Carga (Al Aceptar): `COM_00123_LOAD.TXT`
```txt
ACCION:ABRIR_CARGAR
MESA:1
SECTOR:BARRA
MOZO:01
ITEM:101|CANT:1.00|DESC:Rabas|PRECIO:134.82
ITEM:102|CANT:1.00|DESC:Coca Cola 350|PRECIO:111.00
ITEM:103|CANT:1.00|DESC:Fanta 350|PRECIO:100.00
ITEM:104|CANT:1.00|DESC:Sprite 350|PRECIO:100.00
ITEM:105|CANT:3.00|DESC:Carpaccio DE Lomo|PRECIO:200.00
ESTADO:PENDIENTE
```

### Archivo de Marcha (Al Comenzar a Preparar): `COM_00123_MARCHAR.TXT`
```txt
ACCION:MARCHAR
MESA:1
SECTOR:BARRA
DESTINO:COCINA_BARRA
IMPRIMIR:SI
```

MaxiRest consume el archivo en microsegundos, actualiza la pantalla del salón y elimina el archivo procesado automáticamente.

---

## 6. Próximos Pasos para la Puesta en Marcha

1. **Prueba de Mesa en MaxiRest:** Utilizar una mesa de prueba (ej: *Mesa 99* o *Mostrador 1*).
2. **Revisar Códigos PLU / Nombres de Productos:** Verificar si MaxiRest requiere el código numérico de producto (PLU) o si empareja por nombre de producto.
3. **Compilación del `.exe`:** Empaquetar el script del puente con el archivo `config.json` e instalarlo en la PC del restaurante.
