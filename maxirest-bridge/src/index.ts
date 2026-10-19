import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import path from 'path';
import fs from 'fs';
import readline from 'readline';
import chalk from 'chalk';
import { MaxiRestSpooler } from './spooler';
import { MenuSynchronizer } from './menuSync';
import { OrderListener } from './listener';
import { logger } from './logger';

// Cargar config.json
const configPath = path.join(__dirname, '..', 'config.json');
if (!fs.existsSync(configPath)) {
  console.error(chalk.red(`No se encontró el archivo config.json en ${configPath}`));
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// Inicializar cliente Supabase con soporte WebSocket para Node.js
const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  realtime: {
    transport: WebSocket as any,
  },
});

// Inicializar servicios
const spooler = new MaxiRestSpooler(config.maxirest.spoolerPath);
const menuSync = new MenuSynchronizer(supabase, config.businessId, {
  syncMode: config.maxirest.syncMode || 'spooler_files',
  menuExportPath: config.maxirest.menuExportPath,
  spoolerPath: config.maxirest.spoolerPath,
  db: config.maxirest.db,
});
const listener = new OrderListener(supabase, config.businessId, spooler);

function printBanner() {
  console.clear();
  console.log(chalk.cyan.bold(`
  ╔═══════════════════════════════════════════════════════════════════╗
  ║                 MAMBA QR ➔ MAXIREST PUENTE LOCAL                  ║
  ║         Sincronización en Tiempo Real de Comandas y Carta         ║
  ╚═══════════════════════════════════════════════════════════════════╝
  `));
  console.log(`  ${chalk.bold('Negocio:')}        ${chalk.green(config.businessSlug)} (${config.businessId})`);
  console.log(`  ${chalk.bold('Spooler Path:')}   ${chalk.yellow(config.maxirest.spoolerPath)}`);
  console.log(`  ${chalk.bold('MySQL MaxiRest:')} ${chalk.gray(`${config.maxirest.db.host}:${config.maxirest.db.port} [DB: ${config.maxirest.db.database}]`)}`);
  console.log(`  ${chalk.gray('───────────────────────────────────────────────────────────────────')}`);
  console.log(`  ${chalk.bold('Comandos disponibles en consola:')}`);
  console.log(`   ${chalk.cyan.bold('[S]')} Sincronizar Carta / Menú ahora (precios, rubros, artículos)`);
  console.log(`   ${chalk.yellow.bold('[T]')} Emitir comanda de prueba para probar el Spooler`);
  console.log(`   ${chalk.magenta.bold('[C]')} Limpiar consola`);
  console.log(`   ${chalk.red.bold('[Q]')} Salir`);
  console.log(`  ${chalk.gray('───────────────────────────────────────────────────────────────────')}\n`);
}

async function main() {
  printBanner();

  // Iniciar listener Realtime
  listener.start();

  // Sincronizar carta al inicio si está configurado
  if (config.maxirest.autoSyncMenuOnStart) {
    logger.info(`Sincronización automática de inicio habilitada...`);
    menuSync.sync().catch(err => {
      logger.warn(`Sincronización inicial omitida: ${err.message}`);
    });
  }

  // Intervalo programado de sincronización de carta (ej. cada X horas)
  if (config.maxirest.autoSyncIntervalHours && config.maxirest.autoSyncIntervalHours > 0) {
    const ms = config.maxirest.autoSyncIntervalHours * 60 * 60 * 1000;
    setInterval(() => {
      logger.info(`Ejecutando sincronización periódica programada de la carta...`);
      menuSync.sync().catch(err => logger.error(`Error en sync periódico: ${err.message}`));
    }, ms);
  }

  // Configurar captura de teclas de la consola
  readline.emitKeypressEvents(process.stdin);
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
      logger.info('Iniciando sincronización manual de la carta...');
      await menuSync.sync();
      console.log(chalk.gray('\nPresione [S] para volver a sincronizar, [T] para prueba o [Q] para salir.\n'));
    } else if (k === 't') {
      console.log('\n');
      logger.info('Generando comanda de prueba...');
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
      console.log(chalk.gray('\nArchivos de prueba escritos en la carpeta del spooler.\n'));
    } else if (k === 'c') {
      printBanner();
    } else if (k === 'q') {
      cleanupAndExit();
    }
  });
}

function cleanupAndExit() {
  console.log('\n');
  logger.info('Deteniendo puente MaxiRest...');
  listener.stop();
  logger.success('Puente detenido correctamente. ¡Hasta luego!');
  process.exit(0);
}

main().catch(err => {
  logger.error(`Error fatal en el puente: ${err.message}`, err);
});
