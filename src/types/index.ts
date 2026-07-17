export type Business = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  color_primary: string | null;
  color_secondary: string | null;
  typography: string | null;
  theme: string | null;
  description: string | null;
  about_title: string | null;
  about_description: string | null;
  cover_image: string | null;
  banner_image: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  address?: string | null;
  schedule?: string | null;
  language?: string | null;
  currency?: string | null;
  plan?: string | null;
  email?: string | null;
  created_at: string;
};

export type Category = {
  id: string;
  business_id: string;
  name: string;
  item_order: number | null;
  is_visible: boolean | null;
  icon: string | null;
  created_at: string;
  product_count?: number;
};

export type Product = {
  id: string;
  business_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean | null;
  is_featured: boolean | null;
  item_order: number | null;
  created_at: string;
  category?: Category;
};

export type Review = {
  id: string;
  business_id: string;
  first_name: string;
  last_name: string;
  comment: string;
  rating: number;
  created_at: string;
};
