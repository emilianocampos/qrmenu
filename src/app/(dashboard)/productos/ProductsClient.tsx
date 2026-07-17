'use client';

import React, { useState, useTransition } from 'react';
import { Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { FiltersBar } from '@/components/ui/FiltersBar';
import { ProductTable } from '@/components/ui/ProductTable';
import { ProductDialog } from '@/components/ui/ProductDialog';
import { createProduct, updateProduct, deleteProduct, duplicateProduct, deleteAllMenu } from '@/actions/products';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Product, Category, Business } from '@/types';

interface ProductsClientProps {
  initialProducts: Product[];
  categories: Category[];
  business: Business;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category_id: string;
  image_url: string;
  is_available: boolean;
  is_featured: boolean;
  item_order: string;
}

const defaultForm: ProductFormData = {
  name: '',
  description: '',
  price: '',
  category_id: '',
  image_url: '',
  is_available: true,
  is_featured: false,
  item_order: '0',
};

export function ProductsClient({ initialProducts, categories, business }: ProductsClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormData>(defaultForm);
  const [isPending, startTransition] = useTransition();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory ? p.category_id === filterCategory : true;
    const matchStatus = filterStatus === 'available'
      ? p.is_available
      : filterStatus === 'unavailable'
        ? !p.is_available
        : filterStatus === 'featured'
          ? p.is_featured
          : true;
    return matchSearch && matchCat && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedProducts = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleCategoryChange = (val: string) => {
    setFilterCategory(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: string) => {
    setFilterStatus(val);
    setCurrentPage(1);
  };

  const openCreate = () => {
    setEditProduct(null);
    setForm(defaultForm);
    setImageFile(null);
    setImagePreview(null);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({
      name: p.name,
      description: p.description ?? '',
      price: String(p.price),
      category_id: p.category_id ?? '',
      image_url: p.image_url ?? '',
      is_available: p.is_available ?? true,
      is_featured: p.is_featured ?? false,
      item_order: String(p.item_order ?? 0),
    });
    setImagePreview(p.image_url ?? null);
    setImageFile(null);
    setFormError(null);
    setDialogOpen(true);
  };

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setFormError(null);
    if (!form.name.trim()) { setFormError('El nombre es requerido'); return; }

    startTransition(async () => {
      let imageUrl = form.image_url;

      if (imageFile) {
        setUploading(true);
        const supabase = createClient();
        const ext = imageFile.name.split('.').pop();
        const path = `${business.id}/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from('products').upload(path, imageFile, { upsert: true });
        if (uploadErr) {
          setFormError('Error al subir imagen: ' + uploadErr.message);
          setUploading(false);
          return;
        }
        const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(path);
        imageUrl = publicUrl;
        setUploading(false);
      }

      const updates = {
        name: form.name,
        description: form.description || null,
        price: parseFloat(form.price) || 0,
        category_id: form.category_id || null,
        image_url: imageUrl || null,
        is_available: form.is_available,
        is_featured: form.is_featured,
        item_order: parseInt(form.item_order) || 0,
      };

      let result;
      if (editProduct) {
        result = await updateProduct(editProduct.id, updates);
      } else {
        const fd = new FormData();
        fd.append('business_id', business.id);
        Object.entries(updates).forEach(([k, v]) => {
          if (v !== null && v !== undefined) fd.append(k, String(v));
        });
        result = await createProduct(fd);
      }

      if (result.error) { setFormError(result.error); return; }

      // Refresh local state
      if (editProduct) {
        setProducts(prev => prev.map(p => p.id === editProduct.id ? { ...p, ...updates } : p));
      } else if (result.data) {
        setProducts(prev => [result.data as Product, ...prev]);
      }

      setDialogOpen(false);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteProduct(id);
      if (!result.error) {
        setProducts(prev => prev.filter(p => p.id !== id));
        toast.success('Producto eliminado');
      } else {
        toast.error('Error al eliminar: ' + result.error);
      }
      setConfirmDelete(null);
    });
  };

  const handleDeleteAll = () => {
    startTransition(async () => {
      const result = await deleteAllMenu(business.id);
      if (!result.error) {
        setProducts([]);
        toast.success('Todo el menú fue eliminado');
      } else {
        toast.error('Error al eliminar menú: ' + result.error);
      }
      setConfirmDeleteAll(false);
    });
  };

  const handleDuplicate = (id: string) => {
    startTransition(async () => {
      const result = await duplicateProduct(id);
      if (result.data) {
        setProducts(prev => [result.data as Product, ...prev]);
      }
    });
  };

  const toggleAvailable = (p: Product) => {
    startTransition(async () => {
      const result = await updateProduct(p.id, { is_available: !p.is_available });
      if (!result.error) {
        setProducts(prev => prev.map(pr => pr.id === p.id ? { ...pr, is_available: !pr.is_available } : pr));
      }
    });
  };

  const toggleFeatured = (p: Product) => {
    startTransition(async () => {
      const result = await updateProduct(p.id, { is_featured: !p.is_featured });
      if (!result.error) {
        setProducts(prev => prev.map(pr => pr.id === p.id ? { ...pr, is_featured: !pr.is_featured } : pr));
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Productos"
        description={`${products.length} productos en tu carta`}
        breadcrumb={[{ label: 'Dashboard' }, { label: 'Productos' }]}
        action={
          <div className="flex items-center gap-3">
            {products.length > 0 && (
              <button
                onClick={() => setConfirmDeleteAll(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                           bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar Todo
              </button>
            )}
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                         bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow-lg shadow-indigo-500/25 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nuevo Producto
            </button>
          </div>
        }
      />

      {/* Filters */}
      <FiltersBar
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Buscar productos..."
        filters={[
          {
            value: filterCategory,
            onChange: handleCategoryChange,
            options: categories.map(c => ({ value: c.id, label: c.name })),
            defaultLabel: 'Todas las categorías',
          },
          {
            value: filterStatus,
            onChange: handleStatusChange,
            options: [
              { value: 'available', label: 'Disponibles' },
              { value: 'unavailable', label: 'No disponibles' },
              { value: 'featured', label: 'Destacados' },
            ],
            defaultLabel: 'Todos los estados',
          },
        ]}
      />

      {/* Products Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="📦"
          title={search ? 'Sin resultados' : 'No hay productos'}
          description={search ? 'Probá con otro término de búsqueda' : 'Creá tu primer producto para comenzar'}
          action={
            !search && (
              <button
                onClick={openCreate}
                className="px-6 py-3 rounded-xl text-sm font-semibold bg-indigo-500 hover:bg-indigo-600 text-white transition-all cursor-pointer"
              >
                + Crear Producto
              </button>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          <ProductTable
            products={paginatedProducts}
            categories={categories}
            onToggleAvailable={toggleAvailable}
            onToggleFeatured={toggleFeatured}
            onDuplicate={handleDuplicate}
            onEdit={openEdit}
            onDelete={setConfirmDelete}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <span className="text-xs text-gray-500">
                Mostrando {paginatedProducts.length} de {filtered.length} productos
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg text-gray-400 hover:text-white bg-white/5 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-gray-400 px-3 font-medium">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg text-gray-400 hover:text-white bg-white/5 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Product Edit/Create Dialog */}
      <ProductDialog
        open={dialogOpen}
        title={editProduct ? 'Editar Producto' : 'Nuevo Producto'}
        form={form}
        setForm={setForm}
        categories={categories}
        imagePreview={imagePreview}
        onImageSelect={handleImageSelect}
        onClearImage={() => { setImagePreview(null); setImageFile(null); setForm(f => ({ ...f, image_url: '' })); }}
        uploading={uploading}
        isPending={isPending}
        formError={formError}
        onSave={handleSave}
        onClose={() => setDialogOpen(false)}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        title="Eliminar producto"
        description="¿Estás seguro? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
        danger
        loading={isPending}
      />

      <ConfirmDialog
        open={confirmDeleteAll}
        title="Eliminar TODO el menú"
        description="¿Estás completamente seguro? Esta acción eliminará TODOS los productos y categorías de tu negocio de forma permanente. No se puede deshacer."
        confirmLabel="Eliminar todo"
        onConfirm={handleDeleteAll}
        onCancel={() => setConfirmDeleteAll(false)}
        danger
        loading={isPending}
      />
    </div>
  );
}

