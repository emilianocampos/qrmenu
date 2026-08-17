import os
from fpdf import FPDF

class PresentationPDF(FPDF):
    def header(self):
        if self.page_no() > 1:
            self.set_font('Helvetica', 'B', 8)
            self.set_text_color(99, 102, 241) # Indigo accent
            self.cell(0, 5, 'PRESENTACION COMERCIAL  |  CARTA DIGITAL QR SAAS', 0, 0, 'L')
            self.set_font('Helvetica', 'I', 8)
            self.set_text_color(100, 116, 139)
            self.cell(0, 5, f'Pagina {self.page_no()}', 0, 1, 'R')
            self.set_draw_color(226, 232, 240)
            self.set_line_width(0.4)
            self.line(20, 20, 190, 20)
            self.ln(6)

    def footer(self):
        if self.page_no() > 1:
            self.set_y(-15)
            self.set_font('Helvetica', '', 8)
            self.set_text_color(148, 163, 184)
            self.cell(0, 10, 'Carta Digital QR SaaS - Plataforma Gastronomica de Gestion', 0, 0, 'C')

def generate_pdf():
    pdf = PresentationPDF(orientation='P', unit='mm', format='A4')
    pdf.set_margins(20, 20, 20)
    pdf.set_auto_page_break(auto=True, margin=20)
    
    # ---------------- PAGE 1: COVER ----------------
    pdf.add_page()
    pdf.ln(15)
    
    # Decorative Top Accent Bar
    pdf.set_fill_color(99, 102, 241) # Indigo
    pdf.rect(20, 30, 170, 4, 'F')
    
    pdf.ln(15)
    pdf.set_font('Helvetica', 'B', 26)
    pdf.set_text_color(15, 23, 42) # Dark Slate
    pdf.multi_cell(170, 10, 'PROPUESTA COMERCIAL: CARTA DIGITAL INTERACTIVA & SISTEMA QR', 0, 'L')
    
    pdf.ln(2)
    pdf.set_font('Helvetica', 'B', 15)
    pdf.set_text_color(249, 115, 22) # Vibrant Orange
    pdf.cell(0, 8, 'Transforma la Experiencia de tus Clientes e Incrementa tus Ventas', 0, 1, 'L')
    
    pdf.ln(6)
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(71, 85, 105)
    intro_text = (
        "Nuestra plataforma SaaS integral esta disenada para restaurantes, cafeterias, bares y "
        "locales gastronomicos. Permite ofrecer un menu digital de alta velocidad, llamado de mozo "
        "en tiempo real, pedidos desde la mesa, cobros automatizados con Mercado Pago y un sistema "
        "de tarjeta de fidelizacion digital por sellos diarios."
    )
    pdf.multi_cell(170, 5.5, intro_text, 0, 'L')
    
    pdf.ln(8)
    
    # Key Highlights Cards (Grid 2x2)
    pdf.set_font('Helvetica', 'B', 11)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 6, 'POR QUE ELEGIR NUESTRA PLATAFORMA:', 0, 1, 'L')
    pdf.ln(3)
    
    cards = [
        ("+30% Velocidad de Atencion", "Los clientes consultan el menu y piden al instante sin esperar la carta fisica de papel."),
        ("+20% en Ticket Promedio", "Fotos HD tentadoras y modelos 3D que incrementan el consumo del cliente en la mesa."),
        ("Llamado de Mozo en Vivo", "Alertas sonoras inmediatas y modales emergentes para atender la mesa sin demoras."),
        ("Fidelizacion por Sellos", "Premia a tus clientes frecuentes con tarjetas digitales para que vuelvan mas seguido.")
    ]
    
    for i, (title, desc) in enumerate(cards):
        x = 20 if i % 2 == 0 else 108
        y = pdf.get_y() if i % 2 == 0 else pdf.get_y() - 30
        if i % 2 == 0 and i > 0:
            pdf.ln(4)
            y = pdf.get_y()
        
        pdf.set_xy(x, y)
        pdf.set_fill_color(248, 250, 252) # Light Card Bg
        pdf.set_draw_color(226, 232, 240)
        pdf.rect(x, y, 82, 26, 'DF')
        
        pdf.set_xy(x + 4, y + 3)
        pdf.set_font('Helvetica', 'B', 10)
        pdf.set_text_color(99, 102, 241)
        pdf.cell(74, 5, title, 0, 1, 'L')
        
        pdf.set_x(x + 4)
        pdf.set_font('Helvetica', '', 8.5)
        pdf.set_text_color(71, 85, 105)
        pdf.multi_cell(74, 4, desc, 0, 'L')
        
        if i % 2 == 1:
            pdf.set_xy(20, y + 30)

    pdf.ln(8)
    # Footer Note on Cover Page
    pdf.set_fill_color(15, 23, 42)
    pdf.rect(20, 245, 170, 22, 'F')
    pdf.set_xy(25, 249)
    pdf.set_font('Helvetica', 'B', 11)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(0, 6, 'Listo para modernizar tu local gastronomico?', 0, 1, 'L')
    pdf.set_x(25)
    pdf.set_font('Helvetica', '', 9.5)
    pdf.set_text_color(203, 213, 225)
    pdf.cell(0, 5, 'Sin costos ocultos de instalacion  |  Puesta en marcha en menos de 24 horas', 0, 1, 'L')

    # ---------------- PAGE 2: MODULES & FEATURES ----------------
    pdf.add_page()
    pdf.ln(5)
    
    pdf.set_font('Helvetica', 'B', 16)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 8, 'MODULOS Y FUNCIONALIDADES CLAVE', 0, 1, 'L')
    pdf.set_draw_color(99, 102, 241)
    pdf.set_line_width(0.8)
    pdf.line(20, pdf.get_y(), 50, pdf.get_y())
    pdf.ln(6)

    features = [
        ("1. Menu Digital Interactivo & Personalizable", 
         "Los clientes escanean el codigo QR desde la mesa o cartel y acceden al menu sin instalar aplicaciones. "
         "Soporta temas Claro y Oscuro, fotos en alta resolucion, categorias dinamicas y colores acordes a la identidad del negocio."),
        
        ("2. Llamado de Mozo en Tiempo Real", 
         "Los clientes solicitan asistencia del mozo desde la carta digital con 1 clic. El panel del restaurante emite "
         "una alerta sonora en vivo y despliega un modal emergente que indica la mesa exacta que necesita atencion."),
        
        ("3. Sistema de Pedidos desde la Mesa & Takeaway", 
         "Los clientes agregan productos al carrito y envian su pedido directo al panel de comandas/cocina. "
         "Reduce los tiempos de espera y optimiza la carga de trabajo del personal."),
        
        ("4. Cobro Integrado con Mercado Pago", 
         "Una vez entregado el pedido, la aplicacion despliega un modal interactivo para que el cliente pague "
         "con Mercado Pago (tarjeta, saldo en cuenta o QR). El dinero impacta de inmediato en el panel del negocio."),
        
        ("5. Tarjeta Digital de Fidelizacion (Sellos)", 
         "Sistema de sellos por visitas diarias. El cliente ingresa su correo para sumar 1 sello por dia de consumo. "
         "Al alcanzar la meta de X sellos (ej. 5 sellos), se desbloquea automaticamente un premio o beneficio configurable."),
        
        ("6. Dashboard de Control & Analiticas", 
         "Visualiza las ganancias diarias y mensuales, ranking de platos mas vendidos, escaneos de QR por fecha "
         "y gestion de stock desde un panel administrable en tiempo real.")
    ]

    for title, text in features:
        pdf.set_font('Helvetica', 'B', 10.5)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(0, 5, title, 0, 1, 'L')
        
        pdf.set_font('Helvetica', '', 9)
        pdf.set_text_color(71, 85, 105)
        pdf.multi_cell(170, 4.2, text, 0, 'L')
        pdf.ln(3.5)

    # ---------------- PAGE 3: PRICING & CLOSING ----------------
    pdf.add_page()
    pdf.ln(5)
    
    pdf.set_font('Helvetica', 'B', 16)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 8, 'PLANES Y MODALIDADES DE SERVICIO', 0, 1, 'L')
    pdf.set_draw_color(99, 102, 241)
    pdf.set_line_width(0.8)
    pdf.line(20, pdf.get_y(), 50, pdf.get_y())
    pdf.ln(6)

    # Pricing Cards
    plans = [
        ("PLAN CARTA QR", "Ideal para negocios que desean digitalizar su menu de forma rapida y elegante.", 
         ["Menu QR ilimitado", "Temas Claro y Oscuro", "Fotos HD y Categorias", "Seccion Sobre Nosotros", "Resenas de Clientes"]),
        
        ("PLAN PRO PEDIDOS", "Perfecto para acelerar el servicio en mesa y recepcion de comandas.", 
         ["Todo lo de Plan Carta QR", "Llamado de Mozo en vivo", "Pedidos desde la mesa", "Modelos 3D de Platos", "Cobros por Mercado Pago"]),
        
        ("PLAN FULL FIDELIDAD", "El paquete definitivo para maximizar facturacion y fidelizar clientes.", 
         ["Todo lo de Plan Pro", "Tarjeta Digital de Sellos", "Premios personalizables", "Analiticas de Ingresos", "Soporte Prioritario 24/7"])
    ]

    for title, subtitle, items in plans:
        y = pdf.get_y()
        pdf.set_fill_color(248, 250, 252)
        pdf.set_draw_color(99, 102, 241) if "FULL" in title else pdf.set_draw_color(226, 232, 240)
        pdf.rect(20, y, 170, 40, 'DF')
        
        pdf.set_xy(25, y + 4)
        pdf.set_font('Helvetica', 'B', 11)
        pdf.set_text_color(99, 102, 241) if "FULL" in title else pdf.set_text_color(15, 23, 42)
        pdf.cell(100, 5, title, 0, 0, 'L')
        
        pdf.set_font('Helvetica', 'I', 8.5)
        pdf.set_text_color(100, 116, 139)
        pdf.cell(60, 5, 'Consulte prueba gratis', 0, 1, 'R')
        
        pdf.set_x(25)
        pdf.set_font('Helvetica', '', 8.5)
        pdf.set_text_color(71, 85, 105)
        pdf.cell(0, 5, subtitle, 0, 1, 'L')
        
        pdf.set_x(25)
        pdf.set_font('Helvetica', 'B', 8)
        pdf.set_text_color(15, 23, 42)
        items_str = "   |   ".join(items)
        pdf.multi_cell(160, 4, f"Incluye: {items_str}", 0, 'L')
        
        pdf.set_xy(20, y + 44)

    pdf.ln(5)
    
    # Contact Callout Box
    pdf.set_fill_color(15, 23, 42)
    pdf.rect(20, pdf.get_y(), 170, 38, 'F')
    
    pdf.set_xy(25, pdf.get_y() + 5)
    pdf.set_font('Helvetica', 'B', 13)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(0, 6, 'DESEAS PROBAR LA PLATAFORMA EN TU LOCAL?', 0, 1, 'L')
    
    pdf.set_x(25)
    pdf.set_font('Helvetica', '', 9.5)
    pdf.set_text_color(203, 213, 225)
    pdf.cell(0, 5, 'Te ayudamos a configurar tu menu y codigos QR en menos de 24 hs.', 0, 1, 'L')
    
    pdf.set_x(25)
    pdf.set_font('Helvetica', 'B', 9.5)
    pdf.set_text_color(249, 115, 22) # Orange accent
    pdf.cell(0, 6, 'Contacto Comercial / WhatsApp: Solicita tu Demo Presencial o Virtual', 0, 1, 'L')

    output_path = os.path.join(os.getcwd(), 'presentacion_comercial_mambaqr.pdf')
    pdf.output(output_path)
    print(f"PDF generado con exito en: {output_path}")

if __name__ == '__main__':
    generate_pdf()
