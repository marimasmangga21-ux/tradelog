"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
  className?: string;
  id?: string;
  autoFocus?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

/**
 * Input dengan saran (datalist) — keyboard friendly, tanpa dependency.
 * Bisa diketik bebas untuk instrumen yang tidak ada di daftar.
 */
export function Combobox({
  value,
  onChange,
  options,
  placeholder,
  className,
  id,
  autoFocus,
  onKeyDown,
}: ComboboxProps) {
  const listId = React.useId();

  return (
    <>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        placeholder={placeholder}
        className={cn("font-mono uppercase tracking-tight text-[#f4f4f5]", className)}
        list={listId}
        autoComplete="off"
        autoFocus={autoFocus}
        onKeyDown={onKeyDown}
        spellCheck={false}
      />
      <datalist id={listId}>
        {options.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </>
  );
}
