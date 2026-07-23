"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import React from "react";

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function SubmitButton({ children, className, ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      {...props}
      disabled={pending || props.disabled}
      className={`flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all ${className || ""}`}
    >
      {pending && <Loader2 className="w-5 h-5 animate-spin" />}
      {pending ? "Cargando..." : children}
    </button>
  );
}
