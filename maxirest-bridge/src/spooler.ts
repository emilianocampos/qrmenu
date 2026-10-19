import fs from 'fs';
import path from 'path';
import { logger } from './logger';

export interface SpoolerItem {
  id_articulo?: string | number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  observaciones?: string;
}

export interface OpenTableOrder {
  orderId: string;
  tableNumber: string | number;
  waiterName?: string;
  waiterCode?: string | number;
  items: SpoolerItem[];
  total: number;
  customerName?: string;
  comments?: string;
}

export class MaxiRestSpooler {
  private spoolerPath: string;

  constructor(spoolerPath: string) {
    this.spoolerPath = spoolerPath;
    this.ensureDirectory();
  }

  private ensureDirectory() {
    try {
      if (!fs.existsSync(this.spoolerPath)) {
        fs.mkdirSync(this.spoolerPath, { recursive: true });
        logger.info(`Carpeta de spooler creada: ${this.spoolerPath}`);
      }
    } catch (err) {
      logger.warn(`No se pudo crear directamente la ruta ${this.spoolerPath}. Asegúrate de que exista en Windows.`);
    }
  }

  /**
   * 1. ACCIÓN ABRIR Y CARGAR ADICIÓN
   * Se ejecuta cuando el mozo presiona "Aceptar Pedido" con su nombre asignado.
   */
  public writeOpenTable(order: OpenTableOrder): { success: boolean; filepath?: string; error?: string } {
    try {
      this.ensureDirectory();

      const filename = `COM_${order.orderId.slice(0, 8)}_OPEN.TXT`;
      const filepath = path.join(this.spoolerPath, filename);

      const lines: string[] = [
        `ACCION:ABRIR_CARGAR`,
        `MESA:${order.tableNumber}`,
        `MOZO_NOMBRE:${order.waiterName || 'General'}`,
        `MOZO_CODIGO:${order.waiterCode || '1'}`,
        `COMANDA_ID:${order.orderId}`,
        `FECHA:${new Date().toISOString()}`,
        `ITEMS_START`,
      ];

      for (const item of order.items) {
        const itemCode = item.id_articulo || '0';
        const cleanName = item.nombre.replace(/[|\n\r]/g, ' ');
        const cleanObs = (item.observaciones || '').replace(/[|\n\r]/g, ' - ');
        lines.push(
          `ITEM:${itemCode}|CANT:${item.cantidad}|DESC:${cleanName}|PRECIO:${item.precio_unitario}|OBS:${cleanObs}`
        );
      }

      lines.push(`ITEMS_END`);
      lines.push(`TOTAL:${order.total}`);
      lines.push(`ESTADO:PENDIENTE`);
      lines.push(``); // End newline

      fs.writeFileSync(filepath, lines.join('\r\n'), 'latin1');
      logger.spooler(`[ABRIR MESA] Generado: ${filename} (Mesa ${order.tableNumber}, Mozo: ${order.waiterName || 'General'})`);
      return { success: true, filepath };
    } catch (err: any) {
      logger.error(`Error al escribir comanda de apertura: ${err.message}`, err);
      return { success: false, error: err.message };
    }
  }

  /**
   * 2. ACCIÓN MARCHAR COMANDA
   * Se ejecuta cuando cocina o mozo presiona "Comenzar a preparar".
   */
  public writeMarchar(orderId: string, tableNumber: string | number, sector: string = 'COCINA_BARRA'): { success: boolean; filepath?: string; error?: string } {
    try {
      this.ensureDirectory();

      const filename = `COM_${orderId.slice(0, 8)}_MARCHAR.TXT`;
      const filepath = path.join(this.spoolerPath, filename);

      const lines: string[] = [
        `ACCION:MARCHAR`,
        `MESA:${tableNumber}`,
        `COMANDA:${orderId}`,
        `SECTOR:${sector}`,
        `IMPRIMIR:SI`,
        `FECHA:${new Date().toISOString()}`,
        ``,
      ];

      fs.writeFileSync(filepath, lines.join('\r\n'), 'latin1');
      logger.spooler(`[MARCHAR] Generado: ${filename} (Mesa ${tableNumber} -> ${sector} IMPRIMIR: SI)`);
      return { success: true, filepath };
    } catch (err: any) {
      logger.error(`Error al escribir marcha de comanda: ${err.message}`, err);
      return { success: false, error: err.message };
    }
  }

  /**
   * 3. ACCIÓN COBRAR / ASENTAR PAGO
   * Se ejecuta cuando se marca el pedido como pagado.
   */
  public writePaid(orderId: string, tableNumber: string | number, amount: number, method: string = 'MERCADO_PAGO'): { success: boolean; filepath?: string; error?: string } {
    try {
      this.ensureDirectory();

      const filename = `COM_${orderId.slice(0, 8)}_PAID.TXT`;
      const filepath = path.join(this.spoolerPath, filename);

      const lines: string[] = [
        `ACCION:COBRAR_CERRAR`,
        `MESA:${tableNumber}`,
        `COMANDA:${orderId}`,
        `FORMA_PAGO:${method.toUpperCase()}`,
        `MONTO:${amount}`,
        `FECHA:${new Date().toISOString()}`,
        ``,
      ];

      fs.writeFileSync(filepath, lines.join('\r\n'), 'latin1');
      logger.spooler(`[PAGO ASENTADO] Generado: ${filename} (Mesa ${tableNumber}, Monto: $${amount})`);
      return { success: true, filepath };
    } catch (err: any) {
      logger.error(`Error al escribir comprobante de pago: ${err.message}`, err);
      return { success: false, error: err.message };
    }
  }
}
