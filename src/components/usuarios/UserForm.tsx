"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { mensajeError } from "@/lib/apiError";
import { ROL_DESCRIPCION, ROL_LABEL } from "@/lib/roles";
import type { User, UserInput, UserRol } from "@/types";

const ROLES: UserRol[] = ["MANAGER", "ASSISTANT", "MEDICO", "ADMIN"];

function initFrom(u?: User | null): UserInput {
  return {
    username: u?.username ?? "",
    email: u?.email ?? "",
    first_name: u?.first_name ?? "",
    last_name: u?.last_name ?? "",
    rol: u?.rol ?? "ASSISTANT",
    is_active: u?.is_active ?? true,
    password: "",
  };
}

export function UserForm({
  initial,
  onSubmit,
  submitLabel,
}: {
  initial?: User | null;
  onSubmit: (data: UserInput) => Promise<void>;
  submitLabel: string;
}) {
  const editando = !!initial;
  const [form, setForm] = useState<UserInput>(() => initFrom(initial));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof UserInput>(k: K, v: UserInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      // Al editar, no se envía password vacío (dejaría la misma clave).
      const payload: UserInput = { ...form };
      if (!payload.password) delete payload.password;
      await onSubmit(payload);
    } catch (err) {
      setError(mensajeError(err, "No se pudo guardar el usuario."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
      <Input
        label="Usuario"
        value={form.username}
        onChange={(e) => set("username", e.target.value)}
        required
      />
      <Input
        label={editando ? "Nueva contraseña (opcional)" : "Contraseña"}
        type="password"
        value={form.password ?? ""}
        onChange={(e) => set("password", e.target.value)}
        required={!editando}
      />
      <Input
        label="Nombres"
        value={form.first_name ?? ""}
        onChange={(e) => set("first_name", e.target.value)}
      />
      <Input
        label="Apellidos"
        value={form.last_name ?? ""}
        onChange={(e) => set("last_name", e.target.value)}
      />
      <Input
        label="Correo"
        type="email"
        value={form.email ?? ""}
        onChange={(e) => set("email", e.target.value)}
      />
      <Select
        label="Rol (permisos)"
        value={form.rol}
        onChange={(e) => set("rol", e.target.value as UserRol)}
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {ROL_LABEL[r]}
          </option>
        ))}
      </Select>

      <p className="rounded-lg bg-slate-50 p-2 text-xs text-slate-500 sm:col-span-2">
        {ROL_DESCRIPCION[form.rol]}
      </p>

      <label className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-200"
          checked={Boolean(form.is_active)}
          onChange={(e) => set("is_active", e.target.checked)}
        />
        Cuenta activa (puede iniciar sesión)
      </label>

      {error && <p className="text-sm text-rose-500 sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Guardando…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
