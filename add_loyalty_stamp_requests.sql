-- add_loyalty_stamp_requests.sql
-- Tabla para solicitudes de sellos vía QR fijo en caja con aprobación en tiempo real desde el panel admin.

CREATE TABLE IF NOT EXISTS public.loyalty_stamp_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  loyalty_id UUID NOT NULL REFERENCES public.customer_loyalty(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_loyalty_stamp_requests_business_status
  ON public.loyalty_stamp_requests (business_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_loyalty_stamp_requests_loyalty
  ON public.loyalty_stamp_requests (loyalty_id, created_at DESC);

-- Habilitar RLS
ALTER TABLE public.loyalty_stamp_requests ENABLE ROW LEVEL SECURITY;

-- Permitir insertar y leer solicitudes desde la carta pública y el panel admin
DROP POLICY IF EXISTS "Allow public insert stamp requests" ON public.loyalty_stamp_requests;
CREATE POLICY "Allow public insert stamp requests"
  ON public.loyalty_stamp_requests
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select stamp requests" ON public.loyalty_stamp_requests;
CREATE POLICY "Allow public select stamp requests"
  ON public.loyalty_stamp_requests
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow business owners update stamp requests" ON public.loyalty_stamp_requests;
CREATE POLICY "Allow business owners update stamp requests"
  ON public.loyalty_stamp_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = loyalty_stamp_requests.business_id
        AND b.owner_id = auth.uid()
    )
  );
