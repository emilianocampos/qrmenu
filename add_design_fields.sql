-- Añadir campos de diseño adicionales a la tabla businesses sin eliminar columnas existentes

DO $$
BEGIN
    -- Colors
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'background_color') THEN
        ALTER TABLE public.businesses ADD COLUMN background_color text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'surface_color') THEN
        ALTER TABLE public.businesses ADD COLUMN surface_color text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'text_color') THEN
        ALTER TABLE public.businesses ADD COLUMN text_color text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'accent_color') THEN
        ALTER TABLE public.businesses ADD COLUMN accent_color text;
    END IF;

    -- Typography
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'font_weight') THEN
        ALTER TABLE public.businesses ADD COLUMN font_weight text;
    END IF;

    -- Alignments
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'category_alignment') THEN
        ALTER TABLE public.businesses ADD COLUMN category_alignment text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'product_alignment') THEN
        ALTER TABLE public.businesses ADD COLUMN product_alignment text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'price_alignment') THEN
        ALTER TABLE public.businesses ADD COLUMN price_alignment text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'title_alignment') THEN
        ALTER TABLE public.businesses ADD COLUMN title_alignment text;
    END IF;

    -- Layout & Styles
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'card_style') THEN
        ALTER TABLE public.businesses ADD COLUMN card_style text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'border_radius') THEN
        ALTER TABLE public.businesses ADD COLUMN border_radius integer;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'shadow') THEN
        ALTER TABLE public.businesses ADD COLUMN shadow text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'spacing') THEN
        ALTER TABLE public.businesses ADD COLUMN spacing text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'separator_style') THEN
        ALTER TABLE public.businesses ADD COLUMN separator_style text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'image_style') THEN
        ALTER TABLE public.businesses ADD COLUMN image_style text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'button_style') THEN
        ALTER TABLE public.businesses ADD COLUMN button_style text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'header_style') THEN
        ALTER TABLE public.businesses ADD COLUMN header_style text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'visual_density') THEN
        ALTER TABLE public.businesses ADD COLUMN visual_density text;
    END IF;
END $$;
