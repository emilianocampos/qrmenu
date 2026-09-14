/**
 * Parser for MaxiRest SQL dumps (MariaDB / MySQL)
 * Parses mxrua (categories), mxart (products), mxmes (tables), mxemp (waiters)
 */

export interface MaxiRestCategory {
  id_pos: number;
  nombre: string;
  activo: boolean;
}

export interface MaxiRestProduct {
  id_pos: number;
  nombre: string;
  descripcion: string;
  id_rubro: number;
  precio: number;
  precio_delivery: number;
  disponible: boolean;
  en_stock: boolean;
  foto?: string;
}

export interface MaxiRestTable {
  mesa: string;
  table_number: number;
  cod_ctv: string;
  mozo_id: number;
}

export interface MaxiRestWaiter {
  id_pos: number;
  nombre: string;
  apellido: string;
  nombre_completo: string;
  nombreusu: string;
}

export interface MaxiRestParsedData {
  categories: {
    name: string;
    icon?: string;
    products: {
      name: string;
      description: string;
      price: number;
      price_delivery?: number;
      is_available: boolean;
      id_pos: number;
    }[];
  }[];
  tables: MaxiRestTable[];
  waiters: MaxiRestWaiter[];
  stats: {
    totalCategories: number;
    totalProducts: number;
    totalTables: number;
    totalWaiters: number;
  };
}

/**
 * Tokenizes SQL VALUES tuples e.g. (1, 'Hamburguesa', 450.00), (2, 'Pizza', ...)
 */
function parseSQLValuesTuples(sql: string, tableName: string): string[][] {
  const results: string[][] = [];
  const regex = new RegExp(`INSERT INTO\\s+\`?${tableName}\`?\\s*(?:\\([^)]+\\))?\\s*VALUES\\s*`, 'gi');
  
  let match;
  while ((match = regex.exec(sql)) !== null) {
    let i = match.index + match[0].length;
    const len = sql.length;

    while (i < len) {
      // Skip whitespace
      while (i < len && /\s/.test(sql[i])) i++;
      if (i >= len || sql[i] === ';') break;

      if (sql[i] === '(') {
        i++; // inside tuple
        const tuple: string[] = [];
        let currentVal = '';
        let inString = false;
        let escapeNext = false;

        while (i < len) {
          const char = sql[i];

          if (escapeNext) {
            currentVal += char;
            escapeNext = false;
            i++;
            continue;
          }

          if (char === '\\') {
            escapeNext = true;
            i++;
            continue;
          }

          if (char === "'") {
            if (inString && sql[i + 1] === "'") {
              // SQL double quote escape ''
              currentVal += "'";
              i += 2;
              continue;
            }
            inString = !inString;
            i++;
            continue;
          }

          if (!inString && (char === ',' || char === ')')) {
            tuple.push(currentVal.trim());
            currentVal = '';
            if (char === ')') {
              i++; // finish tuple
              break;
            }
            i++;
            continue;
          }

          currentVal += char;
          i++;
        }

        if (tuple.length > 0) {
          results.push(tuple);
        }
      } else if (sql[i] === ',') {
        i++; // next tuple in multi-row insert
      } else {
        i++;
      }
    }
  }

  return results;
}

function cleanSQLString(val: string | undefined): string {
  if (!val || val.toUpperCase() === 'NULL') return '';
  return val.replace(/^'|'$/g, '').trim();
}

function parseNum(val: string | undefined, fallback = 0): number {
  if (!val) return fallback;
  const cleaned = val.replace(/[^0-9.-]/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? fallback : n;
}

export function parseMaxiRestSQL(sqlContent: string): MaxiRestParsedData {
  // 1. Parse Rubros (mxrua)
  // Columns in mxrua: id, codigo, nombre, color, grupo_nro, grupo_col, grupo_fot, excluyeinf, evento, deliact, eve_for, eve_form, eve_formh, discont, ...
  const rawRubros = parseSQLValuesTuples(sqlContent, 'mxrua');
  const rubrosMap = new Map<number, string>();
  const rubrosList: MaxiRestCategory[] = [];

  for (const row of rawRubros) {
    if (row.length >= 3) {
      const codigo = parseInt(cleanSQLString(row[1]) || cleanSQLString(row[0]), 10);
      const nombre = cleanSQLString(row[2]);
      // discont is usually column 13 or similar, check if name valid
      if (nombre && !isNaN(codigo)) {
        rubrosMap.set(codigo, nombre);
        rubrosList.push({
          id_pos: codigo,
          nombre,
          activo: true,
        });
      }
    }
  }

  // 2. Parse Artículos (mxart)
  // Columns in mxart: id, codigo, codid, nombre, descripc, nombre_fac, bot_grupo, cod_rua, cod_sua, tipo_adic, unidades, opc_menu, costo, precio1, precio2, precio3, precio4, ...
  const rawArticulos = parseSQLValuesTuples(sqlContent, 'mxart');
  const categoryProductsMap = new Map<string, MaxiRestProduct[]>();

  for (const row of rawArticulos) {
    if (row.length >= 14) {
      const codigo = parseInt(cleanSQLString(row[1]), 10);
      const nombre = cleanSQLString(row[3]);
      const descripcion = cleanSQLString(row[4]);
      const cod_rua = parseInt(cleanSQLString(row[7]), 10);
      const precio1 = parseNum(row[13]);
      const precio2 = parseNum(row[14]);

      if (nombre) {
        const catName = rubrosMap.get(cod_rua) || 'Varios';
        if (!categoryProductsMap.has(catName)) {
          categoryProductsMap.set(catName, []);
        }

        categoryProductsMap.get(catName)!.push({
          id_pos: isNaN(codigo) ? 0 : codigo,
          nombre,
          descripcion,
          id_rubro: cod_rua,
          precio: precio1 > 0 ? precio1 : precio2,
          precio_delivery: precio2,
          disponible: true,
          en_stock: true,
        });
      }
    }
  }

  // 3. Parse Mesas (mxmes)
  // Columns in mxmes: id, mesa, cod_ctv, mozo, ...
  const rawMesas = parseSQLValuesTuples(sqlContent, 'mxmes');
  const tablesList: MaxiRestTable[] = [];

  for (const row of rawMesas) {
    if (row.length >= 4) {
      const mesaStr = cleanSQLString(row[1]);
      const cod_ctv = cleanSQLString(row[2]);
      const mozoId = parseInt(cleanSQLString(row[3]), 10) || 0;
      const num = parseInt(mesaStr, 10);

      if (mesaStr) {
        tablesList.push({
          mesa: mesaStr,
          table_number: isNaN(num) ? tablesList.length + 1 : num,
          cod_ctv,
          mozo_id: mozoId,
        });
      }
    }
  }

  // 4. Parse Mozos / Empleados (mxemp)
  // Columns in mxemp: id, codigo, nombre, apellido, ...
  const rawEmp = parseSQLValuesTuples(sqlContent, 'mxemp');
  const waitersList: MaxiRestWaiter[] = [];

  for (const row of rawEmp) {
    if (row.length >= 4) {
      const codigo = parseInt(cleanSQLString(row[1]), 10);
      const nombre = cleanSQLString(row[2]);
      const apellido = cleanSQLString(row[3]);
      const nombreusu = cleanSQLString(row[11]) || '';

      if (nombre && !isNaN(codigo)) {
        waitersList.push({
          id_pos: codigo,
          nombre,
          apellido,
          nombre_completo: `${nombre} ${apellido}`.trim(),
          nombreusu,
        });
      }
    }
  }

  // Format categories list
  const structuredCategories = Array.from(categoryProductsMap.entries()).map(([catName, prods]) => ({
    name: catName,
    products: prods.map(p => ({
      name: p.nombre,
      description: p.descripcion,
      price: p.precio,
      price_delivery: p.precio_delivery,
      is_available: p.disponible,
      id_pos: p.id_pos,
    })),
  }));

  const totalProds = structuredCategories.reduce((acc, c) => acc + c.products.length, 0);

  return {
    categories: structuredCategories,
    tables: tablesList,
    waiters: waitersList,
    stats: {
      totalCategories: structuredCategories.length,
      totalProducts: totalProds,
      totalTables: tablesList.length,
      totalWaiters: waitersList.length,
    },
  };
}
