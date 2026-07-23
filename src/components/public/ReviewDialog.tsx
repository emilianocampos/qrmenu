'use client';

import React, { useState, useTransition } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { createReview } from '@/actions/reviews';
import { StarRating } from './StarRating';
import { Loader2, X } from 'lucide-react';

interface ReviewDialogProps {
  open: boolean;
  onClose: () => void;
  businessId: string;
  onSubmitSuccess: () => void;
}

export function ReviewDialog({ open, onClose, businessId, onSubmitSuccess }: ReviewDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({ first_name: '', last_name: '', comment: '', rating: 0 });
  const [errors, setErrors] = useState({ first_name: '', last_name: '', comment: '', rating: '' });
  const [serverError, setServerError] = useState('');

  const handleClose = () => {
    if (isPending) return;
    setForm({ first_name: '', last_name: '', comment: '', rating: 0 });
    setErrors({ first_name: '', last_name: '', comment: '', rating: '' });
    setServerError('');
    onClose();
  };

  const validate = () => {
    const errs = { first_name: '', last_name: '', comment: '', rating: '' };
    let ok = true;
    if (!form.first_name.trim()) { errs.first_name = 'Requerido'; ok = false; }
    if (!form.last_name.trim()) { errs.last_name = 'Requerido'; ok = false; }
    if (!form.comment.trim()) { errs.comment = 'Requerido'; ok = false; }
    if (form.rating === 0) { errs.rating = 'Seleccioná una calificación'; ok = false; }
    setErrors(errs);
    return ok;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setServerError('');
    startTransition(async () => {
      const result = await createReview(businessId, form);
      if (result.error) {
        setServerError(result.error);
      } else {
        onSubmitSuccess();
        handleClose();
      }
    });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px 14px',
    borderRadius: 10,
    backgroundColor: 'var(--bg-page)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    color: 'var(--text-muted)',
    fontSize: '0.82rem',
    fontWeight: 600,
    marginBottom: 6,
  };

  const errorStyle: React.CSSProperties = {
    color: '#f87171',
    fontSize: '0.78rem',
    marginTop: 4,
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          style: {
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 16,
            color: 'var(--text-primary)',
            backgroundImage: 'none',
          }
        }
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 8px' }}>
          <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Escribir una reseña</span>
          <button
            type="button"
            onClick={handleClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, display: 'flex' }}
          >
            <X className="w-5 h-5" />
          </button>
        </DialogTitle>

        <DialogContent style={{ padding: '8px 24px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
            Contanos tu experiencia. Tu opinión ayuda a otros clientes.
          </p>

          {/* Rating stars */}
          <div>
            <span style={labelStyle}>Calificación *</span>
            <StarRating interactive rating={form.rating} onChange={r => { setForm(f => ({ ...f, rating: r })); setErrors(e => ({ ...e, rating: '' })); }} size="lg" />
            {errors.rating && <p style={errorStyle}>{errors.rating}</p>}
          </div>

          {/* Name fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>Nombre *</label>
              <input
                style={{ ...inputStyle, borderColor: errors.first_name ? '#f87171' : 'var(--border-color)' }}
                value={form.first_name}
                onChange={e => { setForm(f => ({ ...f, first_name: e.target.value })); setErrors(er => ({ ...er, first_name: '' })); }}
                onFocus={e => { e.target.style.borderColor = 'var(--primary-color, #f97316)'; }}
                onBlur={e => { e.target.style.borderColor = errors.first_name ? '#f87171' : 'var(--border-color)'; }}
                disabled={isPending}
                placeholder="Juan"
              />
              {errors.first_name && <p style={errorStyle}>{errors.first_name}</p>}
            </div>
            <div>
              <label style={labelStyle}>Apellido *</label>
              <input
                style={{ ...inputStyle, borderColor: errors.last_name ? '#f87171' : 'var(--border-color)' }}
                value={form.last_name}
                onChange={e => { setForm(f => ({ ...f, last_name: e.target.value })); setErrors(er => ({ ...er, last_name: '' })); }}
                onFocus={e => { e.target.style.borderColor = 'var(--primary-color, #f97316)'; }}
                onBlur={e => { e.target.style.borderColor = errors.last_name ? '#f87171' : 'var(--border-color)'; }}
                disabled={isPending}
                placeholder="García"
              />
              {errors.last_name && <p style={errorStyle}>{errors.last_name}</p>}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label style={labelStyle}>Comentario *</label>
            <textarea
              style={{ ...inputStyle, minHeight: 100, resize: 'vertical', borderColor: errors.comment ? '#f87171' : 'var(--border-color)' }}
              value={form.comment}
              onChange={e => { setForm(f => ({ ...f, comment: e.target.value })); setErrors(er => ({ ...er, comment: '' })); }}
              onFocus={e => { e.target.style.borderColor = 'var(--primary-color, #f97316)'; }}
              onBlur={e => { e.target.style.borderColor = errors.comment ? '#f87171' : 'var(--border-color)'; }}
              disabled={isPending}
              placeholder="Contanos tu experiencia..."
            />
            {errors.comment && <p style={errorStyle}>{errors.comment}</p>}
          </div>

          {serverError && (
            <p style={{ color: '#f87171', fontSize: '0.875rem', padding: '10px 14px', backgroundColor: 'rgba(248,113,113,0.08)', borderRadius: 8, border: '1px solid rgba(248,113,113,0.2)' }}>
              {serverError}
            </p>
          )}
        </DialogContent>

        <DialogActions style={{ padding: '8px 24px 20px', display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 10,
              backgroundColor: 'var(--bg-page)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 10,
              backgroundColor: 'var(--primary-color, #f97316)',
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: isPending ? 'not-allowed' : 'pointer',
              opacity: isPending ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontFamily: 'inherit',
            }}
          >
            {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : 'Enviar reseña'}
          </button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
