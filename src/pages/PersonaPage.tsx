import { useState } from "react";
import { DataTable } from "@/components/molecules/DataTable";
import { GenericForm, FieldDefinition } from "@/components/molecules/GenericForm";
import { usePersona } from "@/hooks/usePersona";
import { useRol } from "@/hooks/useRol";
import { useFicha } from "@/hooks/useFicha";
import { Persona } from "@/types/persona.types";
import { Edit, Trash, Users, UserPlus, User, Mail, Phone, Calendar, Shield, FileText, Hash } from "lucide-react";
import Swal from 'sweetalert2';
import { addToast } from "@heroui/react";

export default function PersonaPage() {
  const {
    personas,
    loading,
    error,
    createPersona,
    updatePersona,
    deletePersona,
    fetchPersonas, // Agregar esta función del hook
  } = usePersona();
  
  const { roles } = useRol();
  const { fichas } = useFicha();
  
  const [showForm, setShowForm] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const formFields: FieldDefinition<Persona>[] = [
    {
      name: "identificacion",
      label: "Identificación",
      type: "text",
      required: true,
    },
    {
      name: "nombre",
      label: "Nombre",
      type: "text",
      required: true,
    },
    {
      name: "apellido",
      label: "Apellido",
      type: "text",
      required: true,
    },
    {
      name: "telefono",
      label: "Teléfono",
      type: "text",
    },
    {
      name: "correo",
      label: "Correo Electrónico",
      type: "email",
      required: true,
    },
    {
      name: "contrasena",
      label: "Contraseña",
      type: "password",
      required: !isEditing, 
    },
    {
      name: "edad",
      label: "Edad",
      type: "number",
      required: true,
    },
    {
      name: "rolId",
      label: "Rol",
      type: "select",
      options: roles.map(rol => ({
        label: rol.nombre,
        value: rol.id,
      })),
    },
    {
      name: "fichaId",
      label: "Ficha",
      type: "select",
      options: fichas.map(ficha => ({
        label: `Ficha ${ficha.numero}`,
        value: ficha.id,
      })),
    },
    {
      name: "activo",
      label: "Activo",
      type: "checkbox",
    },
  ];

  const columns = [
    {
      accessorKey: "id" as keyof Persona,
      header: "ID",
      sortable: true,
      width: "80px",
    },
    {
      accessorKey: "identificacion" as keyof Persona,
      header: "Identificación",
      sortable: true,
      cell: (row: Persona) => (
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{row.identificacion}</span>
        </div>
      ),
    },
    {
      accessorKey: "nombre" as keyof Persona,
      header: "Nombre Completo",
      sortable: true,
      cell: (row: Persona) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-green-500" />
          <span className="font-medium">{`${row.nombre} ${row.apellido}`}</span>
        </div>
      ),
    },
    {
      accessorKey: "correo" as keyof Persona,
      header: "Correo",
      sortable: true,
      cell: (row: Persona) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-purple-500" />
          <span>{row.correo}</span>
        </div>
      ),
    },
    {
      accessorKey: "telefono" as keyof Persona,
      header: "Teléfono",
      cell: (row: Persona) => (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-orange-500" />
          <span>{row.telefono || "N/A"}</span>
        </div>
      ),
    },
    {
      accessorKey: "edad" as keyof Persona,
      header: "Edad",
      sortable: true,
      cell: (row: Persona) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-indigo-500" />
          <span>{row.edad} años</span>
        </div>
      ),
    },
    {
      accessorKey: "rol" as keyof Persona,
      header: "Rol",
      cell: (row: Persona) => (
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-red-500" />
          <span>{row.rol?.nombre || "Sin rol"}</span>
        </div>
      ),
    },
    {
      accessorKey: "ficha" as keyof Persona,
      header: "Ficha",
      cell: (row: Persona) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-teal-500" />
          <span>{row.ficha ? `Ficha ${row.ficha.numero}` : "Sin ficha"}</span>
        </div>
      ),
    },
    {
      accessorKey: "activo" as keyof Persona,
      header: "Estado",
      cell: (row: Persona) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.activo
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          }`}
        >
          {row.activo ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      accessorKey: "fechaCreacion" as keyof Persona,
      header: "Fecha Creación",
      isDate: true,
      sortable: true,
      cell: (row: Persona) => new Date(row.fechaCreacion).toLocaleDateString("es-ES"),
    },
  ];

  const actions = [
    {
      label: "Editar",
      icon: <Edit size={16} />,
      onClick: (row: Persona) => handleEdit(row),
      variant: "primary" as const,
    },
    {
      label: "Eliminar",
      icon: <Trash size={16} />,
      onClick: (row: Persona) => handleDelete(row.id),
      variant: "danger" as const,
      show: (row: Persona) => row.activo, 
    },
  ];

  const handleCreate = () => {
    setEditingPersona(null);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEdit = (persona: Persona) => {
    setEditingPersona(persona);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    const persona = personas.find((p) => p.id === id);
    if (!persona) return;

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar a ${persona.nombre} ${persona.apellido}? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deletePersona(id);
        addToast({
          title: "Persona eliminada",
          description: `${persona.nombre} ${persona.apellido} ha sido eliminado exitosamente.`,
          color: "success",
        });
      } catch (error) {
        addToast({
          title: "Error al eliminar",
          description: error instanceof Error ? error.message : "Error desconocido",
          color: "danger",
        });
      }
    }
  };

  const handleFormSubmit = async (values: Partial<Persona>) => {
    try {
      const processedData = {
        ...values,
        // Asegurar que edad sea número
        edad: typeof values.edad === 'string' ? parseInt(values.edad) : values.edad,
        // Limpiar campos opcionales vacíos
        fichaId: values.fichaId || undefined,
        rolId: values.rolId || undefined,
        telefono: values.telefono || undefined,
      };
  
      if (isEditing && editingPersona) {
        await updatePersona(editingPersona.id, processedData);
        addToast({
          title: "Persona actualizada",
          description: `${values.nombre} ${values.apellido} ha sido actualizado exitosamente.`,
          color: "success",
        });
      } else {
        await createPersona({
          ...processedData,
          activo: values.activo ?? true,
        });
        addToast({
          title: "Persona creada",
          description: `${values.nombre} ${values.apellido} ha sido creado exitosamente.`,
          color: "success",
        });
        
        // Refrescar la lista de personas después de crear
        await fetchPersonas();
      }
      
      setShowForm(false);
      setEditingPersona(null);
      setIsEditing(false);
      
    } catch (error) {
      addToast({
        title: isEditing ? "Error al actualizar" : "Error al crear",
        description: error instanceof Error ? error.message : "Error desconocido",
        color: "danger",
      });
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingPersona(null);
    setIsEditing(false);
  };

  const getInitialValues = (): Partial<Persona> => {
    if (isEditing && editingPersona) {
      return {
        identificacion: editingPersona.identificacion,
        nombre: editingPersona.nombre,
        apellido: editingPersona.apellido,
        telefono: editingPersona.telefono,
        correo: editingPersona.correo,
        edad: editingPersona.edad,
        rolId: editingPersona.rolId,
        fichaId: editingPersona.fichaId,
        activo: editingPersona.activo,
      };
    }
    return {
      activo: true,
    };
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Error al cargar las personas
          </div>
          <div className="text-gray-600 dark:text-gray-400">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Personas
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra los usuarios del sistema
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Gestión de Usuarios</h3>
            <p className="text-emerald-100 mb-4">
              Administra los usuarios, roles y permisos del sistema de manera eficiente
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {personas.filter(p => p.activo).length} Usuarios Activos
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <UserPlus className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {roles.length} Roles Disponibles
                </span>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <Users className="w-16 h-16 text-emerald-200" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="text-gray-600 dark:text-gray-400">
            Cargando personas...
          </div>
        </div>
      ) : (
        <DataTable
          data={personas}
          columns={columns}
          actions={actions}
          onCreate={handleCreate}
          getRowId={(row) => row.id}
          title="Lista de Personas"
          searchPlaceholder="Buscar por nombre, apellido, correo..."
          emptyMessage="No se encontraron personas"
          createButtonLabel="Nueva Persona"
          className="bg-white dark:bg-gray-800 rounded-lg shadow"
          showSearch={true}
          showColumnSelector={true}
        />
      )}

      {showForm && (
        <GenericForm
          fields={formFields}
          initialValues={getInitialValues()}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}