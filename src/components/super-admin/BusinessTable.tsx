'use client';

import React, { useState } from 'react';
import { Business } from '@/types';
import { Search } from 'lucide-react';
import { BusinessRow } from './BusinessRow';

interface BusinessTableProps {
  businesses: Business[];
}

export function BusinessTable({ businesses }: BusinessTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filtered = businesses.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden flex flex-col">
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Negocios Registrados</h2>
        <div className="relative w-72">
          <Search className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre o slug..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
              <th className="p-4 font-medium">Logo</th>
              <th className="p-4 font-medium">Nombre</th>
              <th className="p-4 font-medium">Slug</th>
              <th className="p-4 font-medium">Plan</th>
              <th className="p-4 font-medium">Estado</th>
              <th className="p-4 font-medium">Trial</th>
              <th className="p-4 font-medium">Creación</th>
              <th className="p-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((business) => (
                <BusinessRow key={business.id} business={business} />
              ))
            ) : (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-500">
                  No se encontraron negocios con esos criterios.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t border-white/10 flex items-center justify-between bg-white/5">
          <span className="text-sm text-gray-400">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filtered.length)} de {filtered.length}
          </span>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm disabled:opacity-50 transition-colors"
            >
              Anterior
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm disabled:opacity-50 transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
