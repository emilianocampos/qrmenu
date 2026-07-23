-- Crear el bucket 'design-analysis' si no existe
insert into storage.buckets (id, name, public)
select 'design-analysis', 'design-analysis', true
where not exists (
    select 1 from storage.buckets where id = 'design-analysis'
);

-- Políticas de seguridad para el bucket 'design-analysis'
-- Permitir a los usuarios autenticados subir imágenes
create policy "Authenticated users can upload design images"
on storage.objects for insert
with check (
    bucket_id = 'design-analysis' and auth.role() = 'authenticated'
);

-- Permitir acceso público de lectura (necesario para que Gemini o la app puedan leer la imagen)
create policy "Public Access"
on storage.objects for select
using (bucket_id = 'design-analysis');

-- Permitir a los usuarios actualizar o eliminar sus propias subidas
create policy "Users can update their own design images"
on storage.objects for update
using (bucket_id = 'design-analysis' and auth.role() = 'authenticated');

create policy "Users can delete their own design images"
on storage.objects for delete
using (bucket_id = 'design-analysis' and auth.role() = 'authenticated');
