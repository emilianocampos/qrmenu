'use client';

import React, { useState } from 'react';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { SubmitButton } from '@/components/ui/SubmitButton';

interface LoginFormProps {
  loginAction: (formData: FormData) => Promise<any>;
  serverError?: string;
}

export function LoginForm({ loginAction, serverError }: LoginFormProps) {
  const [password, setPassword] = useState('');

  return (
    <form action={loginAction} className="flex flex-col gap-4">
      {serverError && (
        <p className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm text-center">
          {serverError}
        </p>
      )}

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
      />

      <SubmitButton
        className="mt-4 bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98]"
        type="submit"
      >
        Iniciar Sesión
      </SubmitButton>
    </form>
  );
}
