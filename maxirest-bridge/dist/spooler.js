"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaxiRestSpooler = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_1 = require("./logger");
class MaxiRestSpooler {
    spoolerPath;
    constructor(spoolerPath) {
        this.spoolerPath = spoolerPath;
        this.ensureDirectory();
    }
    ensureDirectory() {
        try {
            if (!fs_1.default.existsSync(this.spoolerPath)) {
                fs_1.default.mkdirSync(this.spoolerPath, { recursive: true });
                logger_1.logger.info(`Carpeta de spooler creada: ${this.spoolerPath}`);
            }
        }
        catch (err) {
            logger_1.logger.warn(`No se pudo crear directamente la ruta ${this.spoolerPath}. Asegúrate de que exista en Windows.`);
        }
    }
    /**
     * 1. ACCIÓN ABRIR Y CARGAR ADICIÓN
     * Se ejecuta cuando el mozo presiona "Aceptar Pedido" con su nombre asignado.
     */
    writeOpenTable(order) {
        try {
            this.ensureDirectory();
            const filename = `COM_${order.orderId.slice(0, 8)}_OPEN.TXT`;
            const filepath = path_1.default.join(this.spoolerPath, filename);
            const lines = [
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
                lines.push(`ITEM:${itemCode}|CANT:${item.cantidad}|DESC:${cleanName}|PRECIO:${item.precio_unitario}|OBS:${cleanObs}`);
            }
            lines.push(`ITEMS_END`);
            lines.push(`TOTAL:${order.total}`);
            lines.push(`ESTADO:PENDIENTE`);
            lines.push(``); // End newline
            fs_1.default.writeFileSync(filepath, lines.join('\r\n'), 'latin1');
            logger_1.logger.spooler(`[ABRIR MESA] Generado: ${filename} (Mesa ${order.tableNumber}, Mozo: ${order.waiterName || 'General'})`);
            return { success: true, filepath };
        }
        catch (err) {
            logger_1.logger.error(`Error al escribir comanda de apertura: ${err.message}`, err);
            return { success: false, error: err.message };
        }
    }
    /**
     * 2. ACCIÓN MARCHAR COMANDA
     * Se ejecuta cuando cocina o mozo presiona "Comenzar a preparar".
     */
    writeMarchar(orderId, tableNumber, sector = 'COCINA_BARRA') {
        try {
            this.ensureDirectory();
            const filename = `COM_${orderId.slice(0, 8)}_MARCHAR.TXT`;
            const filepath = path_1.default.join(this.spoolerPath, filename);
            const lines = [
                `ACCION:MARCHAR`,
                `MESA:${tableNumber}`,
                `COMANDA:${orderId}`,
                `SECTOR:${sector}`,
                `IMPRIMIR:SI`,
                `FECHA:${new Date().toISOString()}`,
                ``,
            ];
            fs_1.default.writeFileSync(filepath, lines.join('\r\n'), 'latin1');
            logger_1.logger.spooler(`[MARCHAR] Generado: ${filename} (Mesa ${tableNumber} -> ${sector} IMPRIMIR: SI)`);
            return { success: true, filepath };
        }
        catch (err) {
            logger_1.logger.error(`Error al escribir marcha de comanda: ${err.message}`, err);
            return { success: false, error: err.message };
        }
    }
    /**
     * 3. ACCIÓN COBRAR / ASENTAR PAGO
     * Se ejecuta cuando se marca el pedido como pagado.
     */
    writePaid(orderId, tableNumber, amount, method = 'MERCADO_PAGO') {
        try {
            this.ensureDirectory();
            const filename = `COM_${orderId.slice(0, 8)}_PAID.TXT`;
            const filepath = path_1.default.join(this.spoolerPath, filename);
            const lines = [
                `ACCION:COBRAR_CERRAR`,
                `MESA:${tableNumber}`,
                `COMANDA:${orderId}`,
                `FORMA_PAGO:${method.toUpperCase()}`,
                `MONTO:${amount}`,
                `FECHA:${new Date().toISOString()}`,
                ``,
            ];
            fs_1.default.writeFileSync(filepath, lines.join('\r\n'), 'latin1');
            logger_1.logger.spooler(`[PAGO ASENTADO] Generado: ${filename} (Mesa ${tableNumber}, Monto: $${amount})`);
            return { success: true, filepath };
        }
        catch (err) {
            logger_1.logger.error(`Error al escribir comprobante de pago: ${err.message}`, err);
            return { success: false, error: err.message };
        }
    }
}
exports.MaxiRestSpooler = MaxiRestSpooler;
