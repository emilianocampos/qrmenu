/**
 * MaxiRest Integration & Scaling Client
 * 
 * Diseñado con el patrón Adapter para escalar de forma transparente:
 * 1. MODO 'spooler': Emite payloads y archivos de comanda para el agente local .exe.
 * 2. MODO 'api_rest': Conexión HTTP directa contra la API oficial de MaxiRest (Cloud o Local Gateway).
 */

export interface MaxiRestOrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  pluCode?: string; // Código de artículo en MaxiRest (mxart.id_pos)
  observations?: string;
}

export interface OpenTablePayload {
  tableNumber: string | number;
  waiterId: string | number;
  waiterName?: string;
  orderId: string;
  items: MaxiRestOrderItem[];
  total: number;
}

export interface MarcharPayload {
  tableNumber: string | number;
  orderId: string;
  sector?: string; // 'cocina' | 'barra'
}

export interface CloseTablePayload {
  tableNumber: string | number;
  orderId: string;
  paymentMethod: 'mercadopago' | 'cash' | 'card' | string;
  amount: number;
  authCode?: string;
}

export interface MaxiRestConfig {
  mode: 'spooler' | 'api_rest' | 'local_gateway';
  apiUrl?: string;       // Ej: https://api.maxirest.com/v1 o http://192.168.1.50:8080
  apiKey?: string;       // Token de autenticación de la API
  branchId?: string;     // ID de sucursal en MaxiRest
  terminalId?: string;   // Número de caja o terminal
  spoolerPath?: string;  // Ruta local para el .exe (C:\MaxiRest\ComandasIn)
}

export class MaxiRestAdapter {
  private config: MaxiRestConfig;

  constructor(config?: Partial<MaxiRestConfig>) {
    this.config = {
      mode: (config?.mode || 'spooler'),
      apiUrl: config?.apiUrl || process.env.MAXIREST_API_URL,
      apiKey: config?.apiKey || process.env.MAXIREST_API_KEY,
      branchId: config?.branchId || process.env.MAXIREST_BRANCH_ID || '1',
      terminalId: config?.terminalId || process.env.MAXIREST_TERMINAL_ID || '1',
      spoolerPath: config?.spoolerPath || 'C:\\MaxiRest\\ComandasIn',
    };
  }

  /**
   * 1. ABRIR MESA Y PRECARGAR COMANDA
   * Se ejecuta cuando el mozo presiona "Aceptar Pedido" con el mozo asignado.
   */
  async openTable(payload: OpenTablePayload) {
    if (this.config.mode === 'api_rest' || this.config.mode === 'local_gateway') {
      return this.httpCall('/tables/open', 'POST', {
        sucursal: this.config.branchId,
        terminal: this.config.terminalId,
        mesa: payload.tableNumber,
        mozo_id: payload.waiterId,
        mozo_nombre: payload.waiterName,
        comanda_id: payload.orderId,
        items: payload.items.map(item => ({
          id_articulo: item.pluCode || item.productId,
          descripcion: item.name,
          cantidad: item.quantity,
          precio_unitario: item.unitPrice,
          observaciones: item.observations || '',
        })),
        total: payload.total,
        estado: 'PENDIENTE',
      });
    }

    // Modo Spooler / Archivo local para el .exe
    return {
      success: true,
      protocol: 'spooler',
      spoolerFileContent: this.buildSpoolerOpenContent(payload),
      suggestedFilename: `COM_${payload.orderId.slice(0, 8)}_OPEN.TXT`,
    };
  }

  /**
   * 2. MARCHAR COMANDA A COCINA / BARRA
   * Se ejecuta cuando el mozo presiona "Comenzar a preparar".
   */
  async marcharComanda(payload: MarcharPayload) {
    if (this.config.mode === 'api_rest' || this.config.mode === 'local_gateway') {
      return this.httpCall(`/tables/${payload.tableNumber}/marchar`, 'POST', {
        comanda_id: payload.orderId,
        sector: payload.sector || 'COCINA_BARRA',
        imprimir: true,
      });
    }

    return {
      success: true,
      protocol: 'spooler',
      spoolerFileContent: `ACCION:MARCHAR\nMESA:${payload.tableNumber}\nCOMANDA:${payload.orderId}\nIMPRIMIR:SI\n`,
      suggestedFilename: `COM_${payload.orderId.slice(0, 8)}_MARCHAR.TXT`,
    };
  }

  /**
   * 3. CERRAR MESA CON MEDIO DE PAGO
   * Se ejecuta cuando se confirma el cobro con Mercado Pago o en caja.
   */
  async closeTable(payload: CloseTablePayload) {
    if (this.config.mode === 'api_rest' || this.config.mode === 'local_gateway') {
      return this.httpCall(`/tables/${payload.tableNumber}/close`, 'POST', {
        comanda_id: payload.orderId,
        forma_pago: payload.paymentMethod === 'mercadopago' ? 'MERCADO_PAGO' : payload.paymentMethod,
        monto: payload.amount,
        auth_code: payload.authCode,
        emitir_ticket: true,
      });
    }

    return {
      success: true,
      protocol: 'spooler',
      spoolerFileContent: `ACCION:COBRAR_CERRAR\nMESA:${payload.tableNumber}\nFORMA_PAGO:${payload.paymentMethod}\nMONTO:${payload.amount}\n`,
      suggestedFilename: `COM_${payload.orderId.slice(0, 8)}_CLOSE.TXT`,
    };
  }

  /**
   * Genera el archivo plano estructurado de comanda para el Spooler de MaxiRest
   */
  private buildSpoolerOpenContent(p: OpenTablePayload): string {
    const lines: string[] = [
      `ACCION:ABRIR_CARGAR`,
      `MESA:${p.tableNumber}`,
      `MOZO_CODIGO:${p.waiterId}`,
      `MOZO_NOMBRE:${p.waiterName || ''}`,
      `COMANDA_ID:${p.orderId}`,
      `FECHA:${new Date().toISOString()}`,
      `ITEMS_START`,
    ];

    for (const item of p.items) {
      lines.push(
        `ITEM:${item.pluCode || item.productId}|CANT:${item.quantity}|DESC:${item.name}|PRECIO:${item.unitPrice}|OBS:${item.observations || ''}`
      );
    }

    lines.push(`ITEMS_END`);
    lines.push(`TOTAL:${p.total}`);
    lines.push(`ESTADO:PENDIENTE`);

    return lines.join('\n');
  }

  /**
   * Helper para llamadas HTTP REST
   */
  private async httpCall(endpoint: string, method: string, data: any) {
    if (!this.config.apiUrl) {
      return { error: 'Falta configurar MAXIREST_API_URL' };
    }

    try {
      const res = await fetch(`${this.config.apiUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey || ''}`,
          'X-Terminal-Id': this.config.terminalId || '1',
        },
        body: JSON.stringify(data),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        return { error: json?.message || `Error MaxiRest API: ${res.statusText}` };
      }

      return { success: true, data: json };
    } catch (err: any) {
      return { error: err.message || 'Error al conectar con la API de MaxiRest' };
    }
  }
}

// Instancia singleton por defecto
export const maxirest = new MaxiRestAdapter();
