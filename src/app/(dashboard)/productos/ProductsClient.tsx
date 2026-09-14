'use client';

import React, { useState, useTransition } from 'react';
import { Plus, ChevronLeft, ChevronRight, Trash2, Tags, X, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
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
  const [isAutoImaging, setIsAutoImaging] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiOptions, setAiOptions] = useState({
    descriptions: true,
    images: true,
    overwrite: false,
  });

  const runAiAssistant = async () => {
    setIsAutoImaging(true);
    setAiModalOpen(false);

    let toastMsg = 'El Asistente IA está analizando tu menú y completando los datos...';
    if (!aiOptions.descriptions && !aiOptions.images) {
      toastMsg = 'Eliminando fotos y descripciones de los productos...';
    } else if (!aiOptions.descriptions) {
      toastMsg = 'Actualizando fotos y eliminando descripciones...';
    } else if (!aiOptions.images) {
      toastMsg = 'Generando descripciones y eliminando fotos...';
    }

    const toastId = toast.loading(toastMsg);
    try {
      const res = await fetch('/api/products/auto-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          includeDescriptions: aiOptions.descriptions,
          includeImages: aiOptions.images,
          overwriteExisting: aiOptions.overwrite,
          useGemini: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al procesar la solicitud');

      toast.dismiss(toastId);
      if (!aiOptions.descriptions && !aiOptions.images) {
        toast.success('Se eliminaron todas las fotos y descripciones de los productos.');
      } else if (!aiOptions.descriptions) {
        toast.success('Se actualizaron las fotos y se eliminaron las descripciones.');
      } else if (!aiOptions.images) {
        toast.success('Se generaron descripciones gourmet y se eliminaron las fotos.');
      } else {
        const modeMsg = data.usedGemini ? 'con Gemini AI' : 'con catálogo culinario';
        toast.success(`¡Completado ${modeMsg}! Se actualizaron ${data.updatedCount} platos.`);
      }

      // Recargar productos actualizados
      const supabase = createClient();
      const { data: updatedProds } = await supabase
        .from('products')
        .select('*')
        .eq('business_id', business.id)
        .order('item_order', { ascending: true });
      if (updatedProds) {
        setProducts(updatedProds);
      }
    } catch (err: unknown) {
      toast.dismiss(toastId);
      toast.error(err instanceof Error ? err.message : 'Error en el Asistente IA');
    } finally {
      setIsAutoImaging(false);
    }
  };

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

  const [noCategoryModal, setNoCategoryModal] = useState(false);

  const openCreate = () => {
    if (categories.length === 0) {
      setNoCategoryModal(true);
      return;
    }
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
    if (categories.length === 0) {
      setFormError('Primero debes crear una categoría para poder agregar productos.');
      return;
    }
    if (!form.name.trim()) { setFormError('El nombre es requerido'); return; }
    if (!form.category_id) { setFormError('Debes seleccionar una categoría'); return; }

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
        toast.success('Producto actualizado correctamente.');
      } else if (result.data) {
        setProducts(prev => [result.data as Product, ...prev]);
        toast.success('Producto creado correctamente.');
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
          <div className="flex flex-wrap items-center justify-center gap-3 w-full">
            {products.length > 0 && (
              <>
                <button
                  onClick={() => setAiModalOpen(true)}
                  disabled={isAutoImaging}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                             bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20
                             text-indigo-400 border border-indigo-500/20 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                  title="Abrir Asistente con IA para fotos y descripciones"
                >
                  {isAutoImaging ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                      <span>Procesando con IA...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span>Asistente IA</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setConfirmDeleteAll(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                             bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar Todo
                </button>
              </>
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

      {/* Dialog para cuando NO existen categorías */}
      {noCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setNoCategoryModal(false)} />
          <div className="relative bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6 text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mx-auto">
              <Tags className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Categoría requerida</h3>
            <p className="text-sm text-gray-300">
              Primero debes crear una categoría para poder agregar productos.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => setNoCategoryModal(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              >
                Cancelar
              </button>
              <Link
                href="/categorias"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow-lg shadow-indigo-500/25"
              >
                Crear categoría
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Modal Asistente IA de Carta */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setAiModalOpen(false)} />
          <div className="relative bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/8 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Asistente IA de Carta</h3>
                  <p className="text-xs text-gray-400">Elegí qué querés autocompletar en tu menú</p>
                </div>
              </div>
              <button onClick={() => setAiModalOpen(false)} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Opción 1: Descripciones con IA */}
              <label className={`flex items-start gap-3.5 p-4 rounded-xl border transition-all cursor-pointer ${
                aiOptions.descriptions 
                  ? 'border-indigo-500/30 bg-indigo-500/[0.04]' 
                  : 'border-rose-500/20 bg-rose-500/[0.03]'
              }`}>
                <input
                  type="checkbox"
                  checked={aiOptions.descriptions}
                  onChange={(e) => setAiOptions(o => ({ ...o, descriptions: e.target.checked }))}
                  className="mt-1 w-4 h-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white block">Generar descripciones gourmet con IA</span>
                    {!aiOptions.descriptions && (
                      <span className="text-[10px] font-bold text-rose-400 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Se borrarán
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 block mt-0.5 leading-relaxed">
                    {aiOptions.descriptions
                      ? 'Gemini AI analiza el nombre y categoría de cada producto para redactar descripciones apetitosas, profesionales y concisas.'
                      : '⚠️ Al estar desmarcado, se eliminarán las descripciones existentes de los platos.'}
                  </span>
                </div>
              </label>

              {/* Opción 2: Fotos gastronómicas */}
              <label className={`flex items-start gap-3.5 p-4 rounded-xl border transition-all cursor-pointer ${
                aiOptions.images 
                  ? 'border-indigo-500/30 bg-indigo-500/[0.04]' 
                  : 'border-rose-500/20 bg-rose-500/[0.03]'
              }`}>
                <input
                  type="checkbox"
                  checked={aiOptions.images}
                  onChange={(e) => setAiOptions(o => ({ ...o, images: e.target.checked }))}
                  className="mt-1 w-4 h-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white block">Asignar fotografías profesionales HD</span>
                    {!aiOptions.images && (
                      <span className="text-[10px] font-bold text-rose-400 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Se borrarán
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 block mt-0.5 leading-relaxed">
                    {aiOptions.images
                      ? 'Asocia fotos reales de catálogo gastronómico (cafetería, pastelería, almuerzos, tragos, vinos) a cada producto.'
                      : '⚠️ Al estar desmarcado, se eliminarán las fotos de los productos.'}
                  </span>
                </div>
              </label>

              {/* Opción 3: Sobreescribir */}
              {(aiOptions.descriptions || aiOptions.images) && (
                <label className="flex items-start gap-3.5 p-3 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiOptions.overwrite}
                    onChange={(e) => setAiOptions(o => ({ ...o, overwrite: e.target.checked }))}
                    className="mt-1 w-4 h-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-gray-300 block">Sobreescribir productos que ya tengan datos</span>
                    <span className="text-[11px] text-gray-500 block mt-0.5">
                      Si está desmarcado, solo completará los platos que tengan la foto o la descripción vacía.
                    </span>
                  </div>
                </label>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/8">
              <button
                type="button"
                onClick={() => setAiModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={runAiAssistant}
                disabled={isAutoImaging}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg disabled:opacity-50 cursor-pointer ${
                  !aiOptions.descriptions && !aiOptions.images
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25'
                    : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/25'
                }`}
              >
                {isAutoImaging ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Procesando...</span>
                  </>
                ) : !aiOptions.descriptions && !aiOptions.images ? (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Borrar fotos y descripciones</span>
                  </>
                ) : !aiOptions.descriptions || !aiOptions.images ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Aplicar cambios</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Iniciar Asistente IA</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

