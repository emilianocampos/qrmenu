"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const chalk_1 = __importDefault(require("chalk"));
function getTime() {
    return new Date().toLocaleTimeString('es-AR', { hour12: false });
}
exports.logger = {
    info: (msg) => {
        console.log(`${chalk_1.default.gray(`[${getTime()}]`)} ${chalk_1.default.blue('ℹ')} ${msg}`);
    },
    success: (msg) => {
        console.log(`${chalk_1.default.gray(`[${getTime()}]`)} ${chalk_1.default.green('✔')} ${chalk_1.default.greenBright(msg)}`);
    },
    warn: (msg) => {
        console.log(`${chalk_1.default.gray(`[${getTime()}]`)} ${chalk_1.default.yellow('⚠')} ${chalk_1.default.yellow(msg)}`);
    },
    error: (msg, err) => {
        console.error(`${chalk_1.default.gray(`[${getTime()}]`)} ${chalk_1.default.red('✖')} ${chalk_1.default.redBright(msg)}`);
        if (err)
            console.error(chalk_1.default.red(err.stack || err.message || err));
    },
    spooler: (msg) => {
        console.log(`${chalk_1.default.gray(`[${getTime()}]`)} ${chalk_1.default.magentaBright('[SPOOLER]')} ${msg}`);
    },
    menuSync: (msg) => {
        console.log(`${chalk_1.default.gray(`[${getTime()}]`)} ${chalk_1.default.cyanBright('[CARTA-SYNC]')} ${msg}`);
    },
    realtime: (msg) => {
        console.log(`${chalk_1.default.gray(`[${getTime()}]`)} ${chalk_1.default.yellowBright('[REALTIME]')} ${msg}`);
    },
};
