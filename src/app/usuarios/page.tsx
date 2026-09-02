"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { UserForm } from "@/components/usuarios/UserForm";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { mensajeError } from "@/lib/apiError";
import { ROL_LABEL } from "@/lib/roles";
import {
  createUser,
  deleteUser,
  listUsers,
  updateUser,
} from "@/services/users";
import type { User, UserInput } from "@/types";

export default function UsuariosPage() {
  const { user: actual } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modo, setModo] = useState<"lista" | "nuevo" | { editar: User }>(
    "lista",
  );

  useEffect(() => {
    let active = true;
    listUsers()
      .then((r) => {
        if (!active) return;
        setUsers(r.results);
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function reload() {
    setUsers((await listUsers()).results);
  }

  async function handleCreate(data: UserInput) {
    await createUser(data);
    setModo("lista");
    await reload();
  }

  async function handleUpdate(id: number, data: UserInput) {
    await updateUser(id, data);
    setModo("lista");
    await reload();
  }

  async function toggleActivo(u: User) {
    await updateUser(u.id, { is_active: !u.is_active });
    await reload();
  }

  async function handleDelete(u: User) {
    if (!confirm(`¿Eliminar al usuario ${u.username}?`)) return;
    try {
      await deleteUser(u.id);
      await reload();
    } catch (err) {
      alert(mensajeError(err, "No se pudo eliminar el usuario."));
    }
  }

  return (
    <AppShell>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 md:text-2xl">
            Usuarios
          </h1>
          <p className="text-sm text-slate-500">
            Altas, roles (permisos) y acceso al sistema
          </p>
        </div>
        {modo === "lista" && (
          <Button onClick={() => setModo("nuevo")}>Nuevo usuario</Button>
        )}
      </div>

      {modo === "nuevo" && (
        <Card title="Registrar usuario" className="mb-6">
          <UserForm onSubmit={handleCreate} submitLabel="Crear usuario" />
          <button
            onClick={() => setModo("lista")}
            className="mt-3 text-sm text-slate-500 hover:underline"
          >
            Cancelar
          </button>
        </Card>
      )}

      {typeof modo === "object" && "editar" in modo && (
        <Card title={`Editar ${modo.editar.username}`} className="mb-6">
          <UserForm
            initial={modo.editar}
            onSubmit={(data) => handleUpdate(modo.editar.id, data)}
            submitLabel="Guardar cambios"
          />
          <button
            onClick={() => setModo("lista")}
            className="mt-3 text-sm text-slate-500 hover:underline"
          >
            Cancelar
          </button>
        </Card>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200/70 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-400">
            <tr>
              <th className="px-4 py-2 font-medium">Usuario</th>
              <th className="px-4 py-2 font-medium">Nombre</th>
              <th className="px-4 py-2 font-medium">Rol</th>
              <th className="px-4 py-2 font-medium">Estado</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-4 text-slate-400" colSpan={5}>
                  Cargando…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-slate-400" colSpan={5}>
                  Sin usuarios.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-medium text-slate-800">
                    {u.username}
                    {actual?.id === u.id && (
                      <span className="ml-2 text-xs text-teal-600">(vos)</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    {u.fullname.trim() || "—"}
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    {ROL_LABEL[u.rol]}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => toggleActivo(u)}
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.is_active
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {u.is_active ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setModo({ editar: u })}
                        className="text-sm text-teal-600 hover:underline"
                      >
                        Editar
                      </button>
                      {actual?.id !== u.id && (
                        <Button
                          variant="danger"
                          className="px-3 py-1.5 text-xs"
                          onClick={() => handleDelete(u)}
                        >
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
