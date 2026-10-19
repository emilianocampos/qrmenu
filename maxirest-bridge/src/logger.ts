import chalk from 'chalk';

function getTime(): string {
  return new Date().toLocaleTimeString('es-AR', { hour12: false });
}

export const logger = {
  info: (msg: string) => {
    console.log(`${chalk.gray(`[${getTime()}]`)} ${chalk.blue('ℹ')} ${msg}`);
  },
  success: (msg: string) => {
    console.log(`${chalk.gray(`[${getTime()}]`)} ${chalk.green('✔')} ${chalk.greenBright(msg)}`);
  },
  warn: (msg: string) => {
    console.log(`${chalk.gray(`[${getTime()}]`)} ${chalk.yellow('⚠')} ${chalk.yellow(msg)}`);
  },
  error: (msg: string, err?: any) => {
    console.error(`${chalk.gray(`[${getTime()}]`)} ${chalk.red('✖')} ${chalk.redBright(msg)}`);
    if (err) console.error(chalk.red(err.stack || err.message || err));
  },
  spooler: (msg: string) => {
    console.log(`${chalk.gray(`[${getTime()}]`)} ${chalk.magentaBright('[SPOOLER]')} ${msg}`);
  },
  menuSync: (msg: string) => {
    console.log(`${chalk.gray(`[${getTime()}]`)} ${chalk.cyanBright('[CARTA-SYNC]')} ${msg}`);
  },
  realtime: (msg: string) => {
    console.log(`${chalk.gray(`[${getTime()}]`)} ${chalk.yellowBright('[REALTIME]')} ${msg}`);
  },
};
