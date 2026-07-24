-- Migración para módulo Super Admin
-- Añade la columna 'trial_enabled' a la tabla 'businesses' si no existe.
-- Los negocios existentes tendrán el trial habilitado por defecto.

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS trial_enabled BOOLEAN DEFAULT TRUE;
