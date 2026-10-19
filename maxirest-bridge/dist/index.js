"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const ws_1 = __importDefault(require("ws"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const readline_1 = __importDefault(require("readline"));
const chalk_1 = __importDefault(require("chalk"));
const spooler_1 = require("./spooler");
const menuSync_1 = require("./menuSync");
const listener_1 = require("./listener");
const logger_1 = require("./logger");
// Cargar config.json
const configPath = path_1.default.join(__dirname, '..', 'config.json');
if (!fs_1.default.existsSync(configPath)) {
    console.error(chalk_1.default.red(`No se encontró el archivo config.json en ${configPath}`));
    process.exit(1);
}
const config = JSON.parse(fs_1.default.readFileSync(configPath, 'utf-8'));
// Inicializar cliente Supabase con soporte WebSocket para Node.js
const supabase = (0, supabase_js_1.createClient)(config.supabaseUrl, config.supabaseServiceKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    },
    realtime: {
        transport: ws_1.default,
    },
});
// Inicializar servicios
const spooler = new spooler_1.MaxiRestSpooler(config.maxirest.spoolerPath);
const menuSync = new menuSync_1.MenuSynchronizer(supabase, config.businessId, {
    syncMode: config.maxirest.syncMode || 'spooler_files',
    menuExportPath: config.maxirest.menuExportPath,
    spoolerPath: config.maxirest.spoolerPath,
    db: config.maxirest.db,
});
const listener = new listener_1.OrderListener(supabase, config.businessId, spooler);
function printBanner() {
    console.clear();
    console.log(chalk_1.default.cyan.bold(`
  ╔═══════════════════════════════════════════════════════════════════╗
  ║                 MAMBA QR ➔ MAXIREST PUENTE LOCAL                  ║
  ║         Sincronización en Tiempo Real de Comandas y Carta         ║
  ╚═══════════════════════════════════════════════════════════════════╝
  `));
    console.log(`  ${chalk_1.default.bold('Negocio:')}        ${chalk_1.default.green(config.businessSlug)} (${config.businessId})`);
    console.log(`  ${chalk_1.default.bold('Spooler Path:')}   ${chalk_1.default.yellow(config.maxirest.spoolerPath)}`);
    console.log(`  ${chalk_1.default.bold('MySQL MaxiRest:')} ${chalk_1.default.gray(`${config.maxirest.db.host}:${config.maxirest.db.port} [DB: ${config.maxirest.db.database}]`)}`);
    console.log(`  ${chalk_1.default.gray('───────────────────────────────────────────────────────────────────')}`);
    console.log(`  ${chalk_1.default.bold('Comandos disponibles en consola:')}`);
    console.log(`   ${chalk_1.default.cyan.bold('[S]')} Sincronizar Carta / Menú ahora (precios, rubros, artículos)`);
    console.log(`   ${chalk_1.default.yellow.bold('[T]')} Emitir comanda de prueba para probar el Spooler`);
    console.log(`   ${chalk_1.default.magenta.bold('[C]')} Limpiar consola`);
    console.log(`   ${chalk_1.default.red.bold('[Q]')} Salir`);
    console.log(`  ${chalk_1.default.gray('───────────────────────────────────────────────────────────────────')}\n`);
}
async function main() {
    printBanner();
    // Iniciar listener Realtime
    listener.start();
    // Sincronizar carta al inicio si está configurado
    if (config.maxirest.autoSyncMenuOnStart) {
        logger_1.logger.info(`Sincronización automática de inicio habilitada...`);
        menuSync.sync().catch(err => {
            logger_1.logger.warn(`Sincronización inicial omitida: ${err.message}`);
        });
    }
    // Intervalo programado de sincronización de carta (ej. cada X horas)
    if (config.maxirest.autoSyncIntervalHours && config.maxirest.autoSyncIntervalHours > 0) {
        const ms = config.maxirest.autoSyncIntervalHours * 60 * 60 * 1000;
        setInterval(() => {
            logger_1.logger.info(`Ejecutando sincronización periódica programada de la carta...`);
            menuSync.sync().catch(err => logger_1.logger.error(`Error en sync periódico: ${err.message}`));
        }, ms);
    }
    // Configurar captura de teclas de la consola
    readline_1.default.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
    }
    process.stdin.on('keypress', async (str, key) => {
        if (key.ctrl && key.name === 'c') {
            cleanupAndExit();
        }
        const k = (key.name || str || '').toLowerCase();
        if (k === 's') {
            console.log('\n');
            logger_1.logger.info('Iniciando sincronización manual de la carta...');
            await menuSync.sync();
            console.log(chalk_1.default.gray('\nPresione [S] para volver a sincronizar, [T] para prueba o [Q] para salir.\n'));
        }
        else if (k === 't') {
            console.log('\n');
            logger_1.logger.info('Generando comanda de prueba...');
            const testId = `test-${Date.now().toString(36)}`;
            spooler.writeOpenTable({
                orderId: testId,
                tableNumber: '99',
                waiterName: 'Mozo Prueba',
                waiterCode: '1',
                items: [
                    { nombre: 'Café de Prueba', cantidad: 1, precio_unitario: 1500, observaciones: 'Sin azúcar' },
                    { nombre: 'Medialuna', cantidad: 2, precio_unitario: 800, observaciones: 'Calentita' },
                ],
                total: 3100,
            });
            setTimeout(() => {
                spooler.writeMarchar(testId, '99', 'COCINA');
            }, 2000);
            console.log(chalk_1.default.gray('\nArchivos de prueba escritos en la carpeta del spooler.\n'));
        }
        else if (k === 'c') {
            printBanner();
        }
        else if (k === 'q') {
            cleanupAndExit();
        }
    });
}
function cleanupAndExit() {
    console.log('\n');
    logger_1.logger.info('Deteniendo puente MaxiRest...');
    listener.stop();
    logger_1.logger.success('Puente detenido correctamente. ¡Hasta luego!');
    process.exit(0);
}
main().catch(err => {
    logger_1.logger.error(`Error fatal en el puente: ${err.message}`, err);
});
