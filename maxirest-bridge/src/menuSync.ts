import fs from 'fs';
import path from 'path';
import { SupabaseClient } from '@supabase/supabase-js';
import { logger } from './logger';

export interface MenuSyncConfig {
  syncMode?: 'spooler_files' | 'mysql';
  menuExportPath?: string;
  spoolerPath?: string;
  db?: {
    enabled?: boolean;
    host: string;
    port: number;
    user: string;
    password?: string;
    database: string;
  };
}

interface RawCategory {
  codigo: number;
  nombre: string;
  activo: boolean;
}

interface RawProduct {
  codigo: number;
  nombre: string;
  descripc: string;
  cod_rua: number;
  precio: number;
  precio_delivery?: number;
  disponible: boolean;
}

export class MenuSynchronizer {
  private supabase: SupabaseClient;
  private businessId: string;
  private config: MenuSyncConfig;

  constructor(supabase: SupabaseClient, businessId: string, config: MenuSyncConfig) {
    this.supabase = supabase;
    this.businessId = businessId;
    this.config = config;
  }

  /**
   * Sincronización 100% SEGURA:
   * Por defecto lee archivos exportados por MaxiRest (Spooler / TXT / CSV).
   * NUNCA escribe en la base de datos de MaxiRest.
   */
  public async sync(): Promise<{ success: boolean; stats?: any; error?: string }> {
    logger.menuSync(`Iniciando sincronización de carta en modo seguro...`);

    let rawCategories: RawCategory[] = [];
    let rawProducts: RawProduct[] = [];

    const mode = this.config.syncMode || 'spooler_files';

    // 1. MODO PRINCIPAL Y RECOMENDADO: Archivos planos de Spooler / Export
    if (mode === 'spooler_files' || !this.config.db?.enabled) {
      logger.info(`Modo SPOOLER / ARCHIVOS ACTIVO: Lectura pasiva de archivos. Cero riesgo para MaxiRest.`);
      const fileData = this.fetchFromExportFiles();
      rawCategories = fileData.categories;
      rawProducts = fileData.products;

      if (rawCategories.length > 0 || rawProducts.length > 0) {
        logger.success(`Leídos desde archivos de exportación: ${rawCategories.length} rubros y ${rawProducts.length} artículos.`);
      } else {
        logger.warn(`No se encontraron archivos de carta en las carpetas de exportación.`);
        logger.info(`Carpetas revisadas: ${this.config.menuExportPath || 'C:\\MaxiRest\\Export'} y ${this.config.spoolerPath || 'C:\\MaxiRest\\ComandasIn'}`);
      }
    }

    // 2. MODO OPCIONAL: MySQL directo en modo SOLO LECTURA (si el usuario lo activa explícitamente)
    if (rawProducts.length === 0 && this.config.db?.enabled) {
      try {
        logger.info(`Conectando en modo SOLO LECTURA a MySQL MaxiRest (SELECT)...`);
        const dbData = await this.fetchFromMySQL();
        rawCategories = dbData.categories;
        rawProducts = dbData.products;
        logger.success(`Leídos desde MySQL: ${rawCategories.length} rubros y ${rawProducts.length} artículos.`);
      } catch (mysqlErr: any) {
        logger.warn(`No se pudo conectar a MySQL (${mysqlErr.message}).`);
      }
    }

    if (rawCategories.length === 0 && rawProducts.length === 0) {
      return {
        success: false,
        error: 'No se encontraron artículos para sincronizar. Coloca tu archivo CARTA.TXT o ARTICULOS.TXT en la carpeta de exportación.',
      };
    }

    try {
      // 3. Obtener categorías actuales en Supabase
      const { data: currentCategories, error: catError } = await this.supabase
        .from('categories')
        .select('*')
        .eq('business_id', this.businessId);

      if (catError) throw catError;

      const categoryMap = new Map<string, string>(); // categoryNameLower -> categoryId
      let createdCategoriesCount = 0;

      for (const cat of currentCategories || []) {
        categoryMap.set(cat.name.trim().toLowerCase(), cat.id);
      }

      // Sincronizar Rubros de MaxiRest
      const rubroCodeToId = new Map<number, string>();
      for (const rc of rawCategories) {
        const cleanName = rc.nombre.trim();
        const lowerName = cleanName.toLowerCase();

        let catId = categoryMap.get(lowerName);
        if (!catId) {
          const { data: newCat, error: insertCatErr } = await this.supabase
            .from('categories')
            .insert({
              business_id: this.businessId,
              name: cleanName,
              is_visible: rc.activo,
              item_order: rc.codigo,
            })
            .select('id')
            .single();

          if (!insertCatErr && newCat) {
            catId = newCat.id;
            if (catId) {
              categoryMap.set(lowerName, catId);
            }
            createdCategoriesCount++;
          }
        }
        if (catId) {
          rubroCodeToId.set(rc.codigo, catId);
        }
      }

      // 4. Obtener productos actuales en Supabase
      const { data: currentProducts, error: prodError } = await this.supabase
        .from('products')
        .select('id, name, price, image_url, description, is_available, category_id')
        .eq('business_id', this.businessId);

      if (prodError) throw prodError;

      const productMap = new Map<string, any>();
      for (const p of currentProducts || []) {
        productMap.set(p.name.trim().toLowerCase(), p);
      }

      let updatedCount = 0;
      let insertedCount = 0;
      let preservedPhotosCount = 0;

      // 5. Smart Merge: Actualizar precios y disponibilidad SIN tocar fotos ni descripciones
      for (const rp of rawProducts) {
        const cleanName = rp.nombre.trim();
        const lowerName = cleanName.toLowerCase();
        const targetCategoryId = rubroCodeToId.get(rp.cod_rua) || null;

        const existing = productMap.get(lowerName);

        if (existing) {
          // Ya existe en la carta QR:
          // Se preserva intacta la imagen y la descripción
          if (existing.image_url) preservedPhotosCount++;

          const updates: Record<string, any> = {
            price: rp.precio,
            is_available: rp.disponible,
          };

          if (targetCategoryId && existing.category_id !== targetCategoryId) {
            updates.category_id = targetCategoryId;
          }

          if (!existing.description && rp.descripc) {
            updates.description = rp.descripc.trim();
          }

          await this.supabase
            .from('products')
            .update(updates)
            .eq('id', existing.id);

          updatedCount++;
        } else {
          // Producto nuevo en MaxiRest:
          await this.supabase
            .from('products')
            .insert({
              business_id: this.businessId,
              name: cleanName,
              description: rp.descripc ? rp.descripc.trim() : null,
              price: rp.precio,
              category_id: targetCategoryId,
              is_available: rp.disponible,
              image_url: null,
              item_order: rp.codigo,
            });

          insertedCount++;
        }
      }

      const stats = {
        categoriesSynced: rawCategories.length,
        newCategoriesCreated: createdCategoriesCount,
        productsProcessed: rawProducts.length,
        productsUpdated: updatedCount,
        newProductsInserted: insertedCount,
        photosPreservedIntact: preservedPhotosCount,
      };

      logger.success(`Sincronización de carta completada exitosamente:`);
      logger.info(`  • ${stats.productsUpdated} productos actualizados con nuevos precios`);
      logger.info(`  • ${stats.newProductsInserted} productos nuevos agregados`);
      logger.info(`  • ${stats.photosPreservedIntact} fotos y descripciones protegidas intactas`);

      return { success: true, stats };
    } catch (err: any) {
      logger.error(`Error durante la sincronización: ${err.message}`, err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Lee archivos de exportación de MaxiRest (carpeta Export o ComandasIn)
   * Busca archivos como:
   *  - ARTICULOS.TXT, PRECIOS.TXT, CARTA.TXT, LISTA.CSV, o dumps .SQL
   */
  private fetchFromExportFiles(): { categories: RawCategory[]; products: RawProduct[] } {
    const searchDirs = [
      this.config.menuExportPath || 'C:\\MaxiRest\\Export',
      this.config.spoolerPath || 'C:\\MaxiRest\\ComandasIn',
      path.join(__dirname, '..'), // Carpeta local del bridge
    ];

    const categories: RawCategory[] = [];
    const products: RawProduct[] = [];

    for (const dir of searchDirs) {
      if (!fs.existsSync(dir)) continue;

      try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const filepath = path.join(dir, file);
          const ext = path.extname(file).toLowerCase();
          const base = path.basename(file, ext).toUpperCase();

          // 1. Archivos estructurados de texto (.TXT / .CSV)
          if (ext === '.txt' || ext === '.csv') {
            if (base.includes('ART') || base.includes('PRECIO') || base.includes('CARTA') || base.includes('RUBRO') || base.includes('LISTA')) {
              logger.info(`Analizando archivo de exportación: ${filepath}`);
              const parsed = this.parseDelimitedFile(filepath);
              categories.push(...parsed.categories);
              products.push(...parsed.products);
            }
          }

          // 2. Archivos SQL Dump de backup (.SQL)
          if (ext === '.sql') {
            logger.info(`Analizando dump SQL de MaxiRest: ${filepath}`);
            const parsed = this.parseFromSQLDump(filepath);
            categories.push(...parsed.categories);
            products.push(...parsed.products);
          }
        }
      } catch (err: any) {
        logger.warn(`No se pudo leer la carpeta ${dir}: ${err.message}`);
      }

      if (products.length > 0) break;
    }

    return { categories, products };
  }

  /**
   * Parser para archivos planos delimitados por | o ; (Estándar Spooler de MaxiRest)
   * Formato admitido:
   * RUBRO|codigo|nombre
   * ARTICULO|codigo|nombre|precio|cod_rubro|descripcion|estado
   * O líneas directas: codigo|nombre|precio|rubro
   */
  private parseDelimitedFile(filepath: string): { categories: RawCategory[]; products: RawProduct[] } {
    const content = fs.readFileSync(filepath, 'latin1');
    const lines = content.split(/\r?\n/);

    const categories: RawCategory[] = [];
    const products: RawProduct[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#') || line.startsWith('//')) continue;

      const delimiter = line.includes('|') ? '|' : line.includes(';') ? ';' : line.includes('\t') ? '\t' : ',';
      const parts = line.split(delimiter).map(p => p.trim());

      const tag = parts[0].toUpperCase();

      // Formato etiquetado: RUBRO|CODIGO|NOMBRE
      if (tag === 'RUBRO' && parts.length >= 3) {
        const cod = parseInt(parts[1], 10) || 0;
        const name = parts[2];
        if (name) categories.push({ codigo: cod, nombre: name, activo: true });
      }
      // Formato etiquetado: ARTICULO|CODIGO|NOMBRE|PRECIO|COD_RUBRO|DESCRIPCION
      else if ((tag === 'ARTICULO' || tag === 'ITEM') && parts.length >= 4) {
        const cod = parseInt(parts[1], 10) || 0;
        const name = parts[2];
        const precio = parseFloat(parts[3].replace(',', '.')) || 0;
        const codRua = parts.length > 4 ? parseInt(parts[4], 10) || 0 : 0;
        const desc = parts.length > 5 ? parts[5] : '';
        if (name) {
          products.push({
            codigo: cod,
            nombre: name,
            descripc: desc,
            cod_rua: codRua,
            precio,
            disponible: true,
          });
        }
      }
      // Formato columnas directas: CODIGO|NOMBRE|PRECIO|RUBRO
      else if (parts.length >= 3 && !isNaN(parseFloat(parts[2].replace(',', '.')))) {
        const cod = parseInt(parts[0], 10) || 0;
        const name = parts[1];
        const precio = parseFloat(parts[2].replace(',', '.')) || 0;
        const codRua = parts.length > 3 ? parseInt(parts[3], 10) || 0 : 0;
        if (name) {
          products.push({
            codigo: cod,
            nombre: name,
            descripc: '',
            cod_rua: codRua,
            precio,
            disponible: true,
          });
        }
      }
    }

    return { categories, products };
  }

  private parseFromSQLDump(filepath: string): { categories: RawCategory[]; products: RawProduct[] } {
    const content = fs.readFileSync(filepath, 'latin1');
    const categories: RawCategory[] = [];
    const products: RawProduct[] = [];

    // Parse mxrua
    const ruaMatch = content.match(/INSERT INTO `?mxrua`?[^;]+;/i);
    if (ruaMatch) {
      const tuples = ruaMatch[0].match(/\(([^)]+)\)/g) || [];
      for (const t of tuples) {
        const parts = t.slice(1, -1).split(',').map(p => p.trim().replace(/^'|'$/g, ''));
        if (parts.length >= 3) {
          const cod = parseInt(parts[1], 10) || parseInt(parts[0], 10);
          const name = parts[2];
          if (name && !isNaN(cod)) {
            categories.push({
              codigo: cod,
              nombre: name,
              activo: true,
            });
          }
        }
      }
    }

    // Parse mxart
    const artMatch = content.match(/INSERT INTO `?mxart`?[^;]+;/i);
    if (artMatch) {
      const tuples = artMatch[0].match(/\(([^)]+)\)/g) || [];
      for (const t of tuples) {
        const parts = t.slice(1, -1).split(',').map(p => p.trim().replace(/^'|'$/g, ''));
        if (parts.length >= 14) {
          const cod = parseInt(parts[1], 10) || 0;
          const name = parts[3];
          const desc = parts[4] || '';
          const cod_rua = parseInt(parts[7], 10) || 0;
          const p1 = parseFloat(parts[13]) || 0;
          const p2 = parseFloat(parts[14]) || 0;

          if (name) {
            products.push({
              codigo: cod,
              nombre: name,
              descripc: desc,
              cod_rua,
              precio: p1 > 0 ? p1 : p2,
              precio_delivery: p2,
              disponible: true,
            });
          }
        }
      }
    }

    return { categories, products };
  }

  /**
   * Conexión MySQL SOLO LECTURA (Opcional, desactivada por defecto para máxima seguridad)
   */
  private async fetchFromMySQL(): Promise<{ categories: RawCategory[]; products: RawProduct[] }> {
    const mysql = await import('mysql2/promise');
    const connection = await mysql.createConnection({
      host: this.config.db?.host || 'localhost',
      port: this.config.db?.port || 3306,
      user: this.config.db?.user || 'root',
      password: this.config.db?.password || '',
      database: this.config.db?.database || 'maxirest',
      connectTimeout: 5000,
    });

    try {
      // 1. Rubros (mxrua) - Solo SELECT
      const [rubroRows]: any = await connection.execute(
        `SELECT codigo, nombre, discont FROM mxrua WHERE nombre IS NOT NULL AND TRIM(nombre) != ''`
      );

      const categories: RawCategory[] = rubroRows.map((r: any) => ({
        codigo: Number(r.codigo) || 0,
        nombre: String(r.nombre).trim(),
        activo: r.discont === 0 || r.discont === false || r.discont === null,
      }));

      // 2. Artículos (mxart) - Solo SELECT
      const [artRows]: any = await connection.execute(
        `SELECT codigo, nombre, descripc, cod_rua, precio1, precio2, discont FROM mxart WHERE nombre IS NOT NULL AND TRIM(nombre) != ''`
      );

      const products: RawProduct[] = artRows.map((a: any) => {
        const p1 = parseFloat(a.precio1) || 0;
        const p2 = parseFloat(a.precio2) || 0;
        return {
          codigo: Number(a.codigo) || 0,
          nombre: String(a.nombre).trim(),
          descripc: String(a.descripc || '').trim(),
          cod_rua: Number(a.cod_rua) || 0,
          precio: p1 > 0 ? p1 : p2,
          precio_delivery: p2,
          disponible: a.discont === 0 || a.discont === false || a.discont === null,
        };
      });

      return { categories, products };
    } finally {
      await connection.end();
    }
  }
}
