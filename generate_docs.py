import os
from fpdf import FPDF

class ProjectDocsPDF(FPDF):
    def header(self):
        if self.page_no() > 1:
            self.set_font('Helvetica', 'I', 8)
            self.set_text_color(100, 116, 139)
            self.cell(0, 5, 'Documentacion Tecnica - Carta QR SaaS', 0, 0, 'L')
            self.cell(0, 5, 'Pagina ' + str(self.page_no()), 0, 1, 'R')
            self.set_draw_color(30, 45, 69)
            self.line(20, 23, 190, 23)
            self.ln(5)

    def footer(self):
        if self.page_no() > 1:
            self.set_y(-15)
            self.set_font('Helvetica', 'I', 8)
            self.set_text_color(100, 116, 139)
            self.cell(0, 10, 'Carta QR SaaS - Todos los derechos reservados', 0, 0, 'C')

def create_documentation():
    pdf = ProjectDocsPDF(orientation='P', unit='mm', format='A4')
    pdf.set_margins(20, 20, 20)
    pdf.alias_nb_pages()
    
    # ---------------- PAGE 1: COVER PAGE ----------------
    pdf.add_page()
    pdf.ln(40)
    
    # Title Box
    pdf.set_draw_color(249, 115, 22) # orange
    pdf.set_line_width(1.5)
    pdf.rect(20, 50, 170, 55)
    
    pdf.set_xy(25, 58)
    pdf.set_font('Helvetica', 'B', 24)
    pdf.set_text_color(10, 14, 26) # deep blue
    pdf.cell(0, 10, 'DOCUMENTACION TECNICA', 0, 1, 'C')
    
    pdf.set_x(25)
    pdf.set_font('Helvetica', 'B', 18)
    pdf.set_text_color(249, 115, 22) # orange
    pdf.cell(0, 10, 'CARTA DIGITAL SAAS - PLATAFORMA QR', 0, 1, 'C')
    
    pdf.set_x(25)
    pdf.set_font('Helvetica', '', 12)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(0, 10, 'Estructura, Arquitectura, Esquemas y Pseudocodigo', 0, 1, 'C')
    
    # Metadata Box
    pdf.set_xy(20, 160)
    pdf.set_font('Helvetica', 'B', 11)
    pdf.set_text_color(10, 14, 26)
    pdf.cell(50, 8, 'Plataforma:', 0, 0)
    pdf.set_font('Helvetica', '', 11)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(0, 8, 'Next.js 15, TypeScript, Supabase, Material UI', 0, 1)
    
    pdf.set_x(20)
    pdf.set_font('Helvetica', 'B', 11)
    pdf.set_text_color(10, 14, 26)
    pdf.cell(50, 8, 'Base de Datos:', 0, 0)
    pdf.set_font('Helvetica', '', 11)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(0, 8, 'PostgreSQL (Supabase DB con RLS habilitado)', 0, 1)
    
    pdf.set_x(20)
    pdf.set_font('Helvetica', 'B', 11)
    pdf.set_text_color(10, 14, 26)
    pdf.cell(50, 8, 'Version:', 0, 0)
    pdf.set_font('Helvetica', '', 11)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(0, 8, '1.2.0 (Redisenio de Carta y Sistema de Resenias)', 0, 1)
    
    pdf.set_x(20)
    pdf.set_font('Helvetica', 'B', 11)
    pdf.set_text_color(10, 14, 26)
    pdf.cell(50, 8, 'Fecha de Emision:', 0, 0)
    pdf.set_font('Helvetica', '', 11)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(0, 8, 'Julio, 2026', 0, 1)

    # Helper printing functions to automatically manage styling
    def add_title(text):
        pdf.set_font('Helvetica', 'B', 22)
        pdf.set_text_color(10, 14, 26)
        pdf.cell(0, 15, text, 0, 1, 'L')
        pdf.ln(5)

    def add_heading1(text):
        pdf.ln(6)
        pdf.set_font('Helvetica', 'B', 16)
        pdf.set_text_color(10, 14, 26)
        pdf.cell(0, 10, text, 0, 1, 'L')
        # orange underbar accent
        pdf.set_draw_color(249, 115, 22)
        pdf.set_line_width(0.8)
        pdf.line(pdf.get_x(), pdf.get_y(), pdf.get_x() + 25, pdf.get_y())
        pdf.ln(4)

    def add_heading2(text):
        pdf.ln(3)
        pdf.set_font('Helvetica', 'B', 11)
        pdf.set_text_color(249, 115, 22)
        pdf.cell(0, 8, text, 0, 1, 'L')
        pdf.ln(1)

    def add_body(text):
        pdf.set_font('Helvetica', '', 10)
        pdf.set_text_color(30, 41, 59)
        pdf.multi_cell(0, 6, text)
        pdf.ln(2)

    def add_list_item(label, text):
        pdf.set_font('Helvetica', 'B', 10)
        pdf.set_text_color(30, 41, 59)
        pdf.write(6, '- ' + label + ': ')
        pdf.set_font('Helvetica', '', 10)
        pdf.set_text_color(71, 85, 105)
        pdf.write(6, text + '\n')
        pdf.ln(1)

    def add_code(code_text):
        pdf.set_font('Courier', '', 8.5)
        pdf.set_text_color(30, 41, 59)
        pdf.set_fill_color(244, 244, 245)
        pdf.set_draw_color(228, 228, 231)
        pdf.set_line_width(0.2)
        pdf.multi_cell(0, 4.5, code_text, fill=True, border=1)
        pdf.ln(3)

    # ---------------- PAGE 2: ARCHITECTURE ----------------
    pdf.add_page()
    add_title('1. Arquitectura del Proyecto')
    
    add_heading1('Estructura de Carpetas')
    add_body('El proyecto esta estructurado como una aplicacion SaaS moderna usando Next.js 15 App Router. A continuacion se detallan las carpetas principales y su proposito:')
    
    add_list_item('src/actions', 'Contiene las Acciones del Servidor (Server Actions), encargadas de interactuar de forma segura con la base de datos Supabase, ejecutar operaciones CRUD y gestionar la autenticacion.')
    add_list_item('src/app', 'Define las rutas de la aplicacion. Utiliza subcarpetas dinamicas (como c/[slug]) y carpetas de grupo de rutas (como (auth) y (dashboard)) para modularizar el proyecto.')
    add_list_item('src/components', 'Componentes modulares reutilizables. Separados en dashboard (administracion), ui (componentes basicos de control) y public (la interfaz publica de la carta del restaurante).')
    add_list_item('src/lib', 'Configuraciones de cliente y servidor de Supabase, asi como middlewares de autenticacion.')
    add_list_item('src/types', 'Definiciones de tipos de TypeScript correspondientes a las entidades de negocios, productos, categorias y reviews.')
    
    add_heading1('Detalle de Archivos del Sistema')
    add_list_item('src/middleware.ts', 'Intercepta las peticiones HTTP entrantes para validar la sesion del usuario y redirigir segun corresponda.')
    add_list_item('src/lib/supabase/server.ts', 'Inicializador del cliente Supabase del lado del servidor para Server Actions y Server Components.')
    add_list_item('src/lib/supabase/client.ts', 'Inicializador del cliente Supabase del lado del navegador para la interaccion del usuario.')
    add_list_item('src/lib/supabase/middleware.ts', 'Gestiona las cookies de sesion y las actualiza durante las transiciones de rutas protegidas.')

    # ---------------- PAGE 3: DATABASE SCHEMA ----------------
    pdf.add_page()
    add_title('2. Esquema de Base de Datos')
    
    add_body('La base de datos esta alojada en Supabase y utiliza PostgreSQL. Tiene habilitado el control de acceso basado en roles y politicas de seguridad a nivel de fila (Row Level Security - RLS) para aislar los datos de los diferentes comercios.')
    
    add_heading1('Estructura de las Tablas principales')
    
    add_heading2('Tabla: profiles')
    add_body('Almacena la informacion del perfil del administrador.')
    add_list_item('id (UUID, PK)', 'Identificador unico referenciado de auth.users (Supabase Auth).')
    add_list_item('name / email (TEXT)', 'Nombre completo y direccion de correo del administrador.')
    add_list_item('created_at (TIMESTAMPTZ)', 'Fecha y hora de creacion.')
    
    add_heading2('Tabla: businesses')
    add_body('Almacena la configuracion y personalizacion visual de cada comercio.')
    add_list_item('id (UUID, PK)', 'Identificador unico autogenerado.')
    add_list_item('owner_id (UUID, FK)', 'Referencia al creador (profiles.id).')
    add_list_item('name / slug (TEXT)', 'Nombre comercial y el identificador unico URL (ej: bella-vista).')
    add_list_item('logo_url / cover_image / banner_image (TEXT)', 'Direcciones URL de imagenes almacenadas en el Storage.')
    add_list_item('color_primary / color_secondary (TEXT)', 'Colores hexadecimales de la identidad visual de la marca.')
    add_list_item('typography / theme (TEXT)', 'Tipografia seleccionada y tema general (light o dark).')
    
    add_heading2('Tabla: categories')
    add_body('Agrupa los productos de un comercio.')
    add_list_item('id (UUID, PK)', 'Identificador unico autogenerado.')
    add_list_item('business_id (UUID, FK)', 'Referencia al negocio (businesses.id).')
    add_list_item('name (TEXT)', 'Nombre de la categoria (ej: Entradas, Bebidas).')
    add_list_item('item_order (INTEGER)', 'Orden secuencial de aparicion.')

    # ---------------- PAGE 4: DATABASE SCHEMA CONT ----------------
    pdf.add_page()
    add_title('Esquema de Base de Datos (Cont.)')
    
    add_heading2('Tabla: products')
    add_body('Almacena los productos de la carta digital.')
    add_list_item('id (UUID, PK)', 'Identificador unico autogenerado.')
    add_list_item('business_id (UUID, FK)', 'Referencia al negocio propietario (businesses.id).')
    add_list_item('category_id (UUID, FK)', 'Referencia a la categoria del producto (categories.id).')
    add_list_item('name / description (TEXT)', 'Nombre y descripcion del plato o bebida.')
    add_list_item('price (NUMERIC)', 'Precio unitario con decimales.')
    add_list_item('image_url (TEXT)', 'Direccion URL de la imagen del producto.')
    add_list_item('is_available (BOOLEAN)', 'Filtro para mostrar u ocultar productos no disponibles en la carta.')
    
    add_heading2('Tabla: reviews')
    add_body('Registra las opiniones y calificaciones aportadas de forma publica por los clientes.')
    add_list_item('id (UUID, PK)', 'Identificador unico autogenerado.')
    add_list_item('business_id (UUID, FK)', 'Referencia al negocio evaluado (businesses.id).')
    add_list_item('first_name / last_name (TEXT)', 'Nombre y apellido del autor del comentario.')
    add_list_item('comment (TEXT)', 'Texto de la reseña compartida.')
    add_list_item('rating (INTEGER)', 'Calificacion numerica por estrellas (del 1 al 5).')
    
    add_heading2('Tabla: settings')
    add_body('Configuraciones operativas del negocio (moneda, redes sociales, direccion, whatsapp).')
    
    add_heading1('Politicas RLS e Indices implementados')
    add_body('Politicas de Lectura Publica: Permitidas para businesses, categories, products, reviews y settings (utilizando true) para permitir el acceso publico sin autenticacion a la carta digital.')
    add_body('Politicas de Escritura/Modificacion: Restringidas mediante cheques de seguridad (auth.uid() = owner_id), asegurando que solo el propietario del comercio pueda modificar sus productos, categorias y configuraciones.')
    add_body('Indices en Reviews: Se agregaron indices en business_id y created_at para optimizar el ordenamiento temporal y filtrado por negocio.')

    # ---------------- PAGE 5: SERVER ACTIONS ----------------
    pdf.add_page()
    add_title('3. Acciones de Servidor (Server Actions)')
    
    add_body('Las Server Actions encapsulan la logica de negocio en el servidor y son llamadas directamente desde los componentes cliente.')
    
    add_heading1('Pseudocodigo de Acciones de Resenias (reviews.ts)')
    
    add_heading2('Funcion: getBusinessBySlug')
    add_code("""
GET_BUSINESS_BY_SLUG(slug: String):
  supabase = CreateSupabaseServerClient()
  response = supabase.FROM("businesses")
                     .SELECT("*")
                     .WHERE("slug" == slug)
                     .SINGLE()
  IF response.error:
    RETURN { error: response.error.message }
  RETURN { data: response.data as Business }
""")
    
    add_heading2('Funcion: getProducts')
    add_code("""
GET_PRODUCTS_FOR_PUBLIC_PAGE(businessId: UUID):
  supabase = CreateSupabaseServerClient()
  response = supabase.FROM("products")
                     .SELECT("*, category:categories(id, name)")
                     .WHERE("business_id" == businessId)
                     .WHERE("is_available" == true)
                     .ORDER_BY("item_order" ASC)
  IF response.error:
    RETURN { error: response.error.message }
  RETURN { data: response.data as Product[] }
""")
    
    add_heading2('Funcion: searchProducts')
    add_code("""
SEARCH_PRODUCTS(businessId: UUID, query: String):
  supabase = CreateSupabaseServerClient()
  
  # Buscar categorias que coincidan con la consulta
  categories = supabase.FROM("categories")
                       .SELECT("id")
                       .WHERE("business_id" == businessId)
                       .WHERE("name" LIKE "%" + query + "%")
                       
  # Construir consulta dinamica OR
  dbQuery = supabase.FROM("products")
                    .SELECT("*, category:categories(id, name)")
                    .WHERE("business_id" == businessId)
                    .WHERE("is_available" == true)
                    
  IF query NOT EMPTY:
    dbQuery.OR("name LIKE %query% OR description LIKE %query% OR category_id IN (categories)")
    
  response = dbQuery.ORDER_BY("item_order" ASC)
  RETURN { data: response.data }
""")

    # ---------------- PAGE 6: SERVER ACTIONS CONT ----------------
    pdf.add_page()
    add_title('Acciones de Servidor (Cont.)')
    
    add_heading2('Funcion: getReviews')
    add_code("""
GET_REVIEWS(businessId: UUID):
  supabase = CreateSupabaseServerClient()
  response = supabase.FROM("reviews")
                     .SELECT("*")
                     .WHERE("business_id" == businessId)
                     .ORDER_BY("created_at" DESC)
  RETURN { data: response.data as Review[] }
""")
    
    add_heading2('Funcion: createReview')
    add_code("""
CREATE_REVIEW(businessId: UUID, reviewData):
  supabase = CreateSupabaseServerClient()
  
  # Validar datos en el servidor
  IF reviewData.first_name EMPTY OR reviewData.last_name EMPTY OR reviewData.comment EMPTY:
    RETURN { error: "Todos los campos son requeridos" }
    
  # Insertar en base de datos
  insertResponse = supabase.FROM("reviews")
                           .INSERT({
                              business_id: businessId,
                              first_name: reviewData.first_name,
                              last_name: reviewData.last_name,
                              comment: reviewData.comment,
                              rating: reviewData.rating
                           })
                           
  # Obtener el slug para revalidar la cache de Next.js
  business = supabase.FROM("businesses")
                     .SELECT("slug")
                     .WHERE("id" == businessId)
                     .SINGLE()
                     
  IF business:
    REVALIDATE_PATH("/c/" + business.slug)
    
  RETURN { data: insertResponse.data }
""")

    add_heading2('Funcion: getAverageRating')
    add_code("""
GET_AVERAGE_RATING(businessId: UUID):
  supabase = CreateSupabaseServerClient()
  reviews = supabase.FROM("reviews")
                    .SELECT("rating")
                    .WHERE("business_id" == businessId)
                    
  totalReviews = LENGTH(reviews)
  IF totalReviews == 0:
    RETURN { data: { average: 0, count: 0 } }
    
  sumRating = SUM(r.rating FOR EACH r IN reviews)
  average = ROUND(sumRating / totalReviews, 1)
  
  RETURN { data: { average: average, count: totalReviews } }
""")

    # ---------------- PAGE 7: PUBLIC MENU ROUTE ----------------
    pdf.add_page()
    add_title('4. Ruta Publica de Carta (/c/[slug])')
    
    add_heading1('Funcionamiento y Renderizado Dinamico')
    add_body('La pagina publica (/c/[slug]) es el nucleo del sistema. Se encarga de procesar el slug introducido en la URL, cargar las dependencias de Supabase correspondientes al comercio de forma segura, y adaptar la interfaz del usuario con los estilos inline especificos sin requerir de hojas de estilo fijas.')
    
    add_heading2('Flujo de Carga de la Pagina')
    add_list_item('1. Resolucion del Comercio', 'Se recupera el slug desde los parametros de la ruta. Como Next.js 15 utiliza promesas asincronas para "params", se realiza "await params" antes de invocar la accion "getBusinessBySlug(slug)".')
    add_list_item('2. Verificacion de Existencia', 'Si el comercio no existe en la base de datos o el slug no es correcto, se dispara de inmediato la funcion "notFound()" de Next.js.')
    add_list_item('3. Consulta Concurrente', 'Se consultan los productos disponibles (donde is_available = true) y la lista de reviews asociadas al identificador del comercio de forma simultanea.')
    add_list_item('4. Inyeccion Dinamica de Estilos', 'Se genera una etiqueta de estilo <style> dinamica en el cuerpo del DOM que define variables CSS globales (--primary-color, --secondary-color, --font-family).')
    add_list_item('5. Fuentes Google Fonts en Caliente', 'Se importa dinamicamente la fuente configurada (Inter, Roboto, Playfair Display, Montserrat, etc.) desde Google Fonts mediante una etiqueta <link> construida en tiempo de ejecucion.')
    
    add_heading2('Codigo de Inyeccion de Variables CSS')
    add_code("""
# Dentro de src/app/c/[slug]/page.tsx
primaryColor = business.color_primary OR "#f97316"
secondaryColor = business.color_secondary OR "#ffffff"
fontName = business.typography OR "Inter"

STYLE_TAG = \"\"\"
  :root {
    --primary-color: {primaryColor};
    --primary-color-rgb: {hexToRgb(primaryColor)};
    --secondary-color: {secondaryColor};
    --font-family: '{fontName}', sans-serif;
    --bg-page: #0a0e1a;
    --bg-card: #111827;
    --border-color: #1e2d45;
  }
  body {
    font-family: var(--font-family);
    background-color: var(--bg-page);
  }
\"\"\"
""")

    # ---------------- PAGE 8: COMPONENT LIST ----------------
    pdf.add_page()
    add_title('5. Componentes de la Carta Publica')
    
    add_body('Los componentes de la carta publica fueron disenados de forma aislada en la carpeta src/components/public/ para no alterar las dependencias del area administrativa. Estan optimizados usando inline styles y TailwindCSS.')
    
    add_heading1('Descripcion de Componentes Publicos')
    
    add_heading2('Navbar.tsx')
    add_body('Barra de navegacion flotante/fija con efecto blur translucido (backdrop-filter) que muestra el logotipo del comercio, titulo y enlaces con scroll suave (#menu, #about, #reviews). Dispone de un Drawer lateral de Material UI para dispositivos moviles.')
    
    add_heading2('SearchBar.tsx')
    add_body('Caja de busqueda premium con bordes que responden dinamicamente al color de foco principal del negocio. Incluye un boton interactivo para limpiar el texto introducido.')
    
    add_heading2('MenuSection.tsx')
    add_body('Controla el estado de busqueda en tiempo real. Realiza la busqueda de forma reactiva en el cliente filtrando los productos cargados por Nombre, Descripcion y Categoria, logrando una experiencia instantanea.')
    
    add_heading2('ProductGrid.tsx')
    add_body('Layout flexible responsivo que utiliza una distribucion Masonry basada en CSS (column-count). Esto permite ajustar la altura exacta de las tarjetas de platos sin dejar espacios vacios verticales.')
    
    add_heading2('ProductCard.tsx')
    add_body('Tarjeta premium de producto. Muestra la imagen (con object-cover), el titulo, la descripcion y el precio a la derecha utilizando el color primario del negocio. Al pasar el cursor, genera una transicion de escala y un sombreado suave.')
    
    add_heading2('AboutSection.tsx')
    add_body('Seccion moderna con estructura asimetrica de rejilla. Renderiza el titulo e historia detallada del restaurante junto a la imagen principal de presentacion comercial del establecimiento.')
    
    add_heading2('ReviewSection.tsx')
    add_body('Contenedor del modulo de comentarios. Conecta el panel de OverallRating con el listado de ReviewCard. Controla la apertura del modal y actualiza la lista de opiniones tras insertar una resenia sin recargar la pagina.')
    
    add_heading2('ReviewDialog.tsx')
    add_body('Formulario Dialog de Material UI con validaciones completas. Permite calificar usando la interfaz interactiva de StarRating y enviar los datos de la reseña a Supabase.')
    
    add_heading2('StarRating.tsx')
    add_body('Componente flexible. Actua como selector interactivo (utilizando estados de hover reactivos) o visualizador estatico de estrellas evaluadas.')

    # Save PDF
    pdf.output("documentacion.pdf")
    print("PDF creado con exito.")

if __name__ == "__main__":
    create_documentation()
