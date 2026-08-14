'use client';

import React, { useState } from 'react';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { SubmitButton } from '@/components/ui/SubmitButton';

interface RegisterFormProps {
  signupAction: (formData: FormData) => Promise<any>;
  serverError?: string;
}

export function RegisterForm({ signupAction, serverError }: RegisterFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setError(null);
    if (password !== confirmPassword) {
      e.preventDefault();
      setError('Las contraseñas no coinciden.');
      return;
    }
  };

  return (
    <form action={signupAction} onSubmit={handleSubmit} className="flex flex-col gap-4">
      {(serverError || error) && (
        <p className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm text-center">
          {error || serverError}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-300" htmlFor="name">Tu Nombre</label>
        <input
          className="px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors text-sm"
          name="name"
          placeholder="Ej. Juan Pérez"
          required
          type="text"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-300" htmlFor="email">Email</label>
        <input
          className="px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors text-sm"
          name="email"
          placeholder="tu@correo.com"
          required
          type="email"
        />
      </div>

      <PasswordInput
        label="Contraseña"
        name="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="••••••••"
        required
        minLength={6}
      />

      <PasswordInput
        label="Confirmar contraseña"
        name="confirmPassword"
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
        placeholder="••••••••"
        required
        minLength={6}
      />

      <SubmitButton
        className="mt-4 bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98]"
        type="submit"
      >
        Registrarse
      </SubmitButton>
    </form>
  );
}
