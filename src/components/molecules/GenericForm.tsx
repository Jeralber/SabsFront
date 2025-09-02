import { FormEvent, useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import {
  Plus,
  X,
  Save,
  Calendar,
  Mail,
  Lock,
  Hash,
  Type,
  CheckSquare,
} from "lucide-react";

export type FieldDefinition<T> = {
  name: keyof T;
  label: string;
  required?: boolean;
  type?:
    | "text"
    | "date"
    | "number"
    | "checkbox"
    | "select"
    | "email"
    | "password"
    | "array";
  arrayFields?: FieldDefinition<any>[];
  readOnly?: boolean;
  options?: { label: string; value: any }[];
  allowQuickCreate?: boolean;
  quickCreateFields?: FieldDefinition<any>[];
  onQuickCreate?: (data: any) => Promise<{ id: any; label: string }>;
  quickCreateTitle?: string;
  min?: number;
  max?: number;
  onChange?: (value: any) => void;
};

export type GenericFormProps<T> = {
  fields: FieldDefinition<T>[];
  initialValues: Partial<T>;
  onSubmit: (values: Partial<T>) => void;
  onCancel: () => void;
  onClose?: () => void;
  title?: string;
  forceHorizontal?: boolean; // Nueva prop para forzar layout horizontal
};

// Función para obtener el icono según el tipo de campo
const getFieldIcon = (type?: string) => {
  switch (type) {
    case "email":
      return <Mail size={16} className="text-gray-400" />;
    case "password":
      return <Lock size={16} className="text-gray-400" />;
    case "date":
      return <Calendar size={16} className="text-gray-400" />;
    case "number":
      return <Hash size={16} className="text-gray-400" />;
    case "checkbox":
      return <CheckSquare size={16} className="text-gray-400" />;
    default:
      return <Type size={16} className="text-gray-400" />;
  }
};

export function GenericForm<T>({
  fields,
  initialValues,
  onSubmit,
  onCancel,
  title = "Formulario",
  forceHorizontal = false,
}: GenericFormProps<T>) {
  const [formData, setFormData] = useState<Partial<T>>(initialValues);
  const [showQuickCreate, setShowQuickCreate] = useState<string | null>(null);
  const [quickCreateData, setQuickCreateData] = useState<any>({});
  const [isCreating, setIsCreating] = useState(false);

  // Determinar si usar layout horizontal
  const useHorizontalLayout = forceHorizontal || fields.length > 4;
  const maxWidth = useHorizontalLayout ? "max-w-6xl" : "max-w-2xl";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    fieldName: keyof T
  ) => {
    const value =
      e.target.type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleQuickCreateChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    fieldName: string
  ) => {
    const value =
      e.target.type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
    setQuickCreateData((prev: any) => ({ ...prev, [fieldName]: value }));
  };

  const handleQuickCreate = async (field: FieldDefinition<T>) => {
    if (!field.onQuickCreate) return;

    setIsCreating(true);
    try {
      const newItem = await field.onQuickCreate(quickCreateData);

      setFormData((prev) => ({ ...prev, [field.name]: newItem.id }));

      setShowQuickCreate(null);
      setQuickCreateData({});
    } catch (error) {
      console.error("Error al crear:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <>
      {/* Overlay con animación */}
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        {/* Modal principal con animación y ancho dinámico */}
        <div
          className={`bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden w-full ${maxWidth} mx-4 animate-in slide-in-from-bottom-4 duration-300 border border-gray-200 dark:border-gray-700`}
        >
          {/* Header del formulario con gradiente verde */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Type size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white">{title}</h2>
            </div>
            <Button
              type="button"
              variant="light"
              size="sm"
              className="text-white hover:bg-white/20 transition-colors duration-200"
              onClick={onCancel}
            >
              <X size={20} />
            </Button>
          </div>

          {/* Contenido del formulario */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Grid dinámico basado en el número de campos */}
              <div
                className={`${
                  useHorizontalLayout
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-6"
                }`}
              >
                {fields.map((field) => (
                  <div
                    key={String(field.name)}
                    className={`group transition-all duration-200 hover:transform hover:scale-[1.02] ${
                      useHorizontalLayout ? "" : "w-full"
                    }`}
                  >
                    {/* Label con icono */}
                    <div className="flex items-center gap-2 mb-2">
                      {getFieldIcon(field.type)}
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        {field.label}
                        {field.required && (
                          <span className="text-red-500 text-xs">*</span>
                        )}
                      </label>
                    </div>

                    {/* Campo según tipo */}
                    {field.type === "select" ? (
                      <div className="flex gap-3">
                        <div className="flex-1 relative">
                          <select
                            name={String(field.name)}
                            value={String(formData[field.name] ?? "")}
                            onChange={(e) => handleChange(e, field.name)}
                            className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500"
                            required={field.required}
                          >
                            <option value="" className="text-gray-500">
                              Seleccione una opción...
                            </option>
                            {field.options?.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {field.allowQuickCreate && (
                          <Button
                            type="button"
                            size="lg"
                            variant="bordered"
                            className="px-4 text-green-600 hover:text-green-700 border-2 border-green-200 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200"
                            onClick={() =>
                              setShowQuickCreate(String(field.name))
                            }
                          >
                            <Plus size={18} />
                          </Button>
                        )}
                      </div>
                    ) : field.type === "checkbox" ? (
                      <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
                        <input
                          type="checkbox"
                          name={String(field.name)}
                          checked={Boolean(formData[field.name])}
                          onChange={(e) => handleChange(e, field.name)}
                          className="h-5 w-5 text-green-600 focus:ring-green-500 border-2 border-gray-300 rounded-md transition-all duration-200"
                          readOnly={field.readOnly}
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                          {field.label}
                        </span>
                      </div>
                    ) : (
                      <div className="relative">
                        <Input
                          isRequired={field.required}
                          name={String(field.name)}
                          type={field.type || "text"}
                          isReadOnly={field.readOnly}
                          value={String(formData[field.name] ?? "")}
                          onChange={(e) => handleChange(e, field.name)}
                          className="w-full transition-all duration-200 hover:scale-[1.01]"
                          classNames={{
                            input: "text-base",
                            inputWrapper:
                              "border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 focus-within:border-green-500 rounded-xl bg-white dark:bg-gray-800 transition-all duration-200",
                          }}
                          fullWidth
                          size="lg"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </form>
          </div>

          {/* Footer con botones */}
          <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="bordered"
              size="lg"
              className="px-6 text-gray-600 hover:text-gray-700 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              onClick={onCancel}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="lg"
              className="px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              onClick={handleSubmit}
            >
              <Save size={18} className="mr-2" />
              Guardar
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de creación rápida con tema verde */}
      {showQuickCreate && (
        <div className="fixed inset-0 flex items-center justify-center z-60 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-in slide-in-from-bottom-4 duration-300 border border-gray-200 dark:border-gray-700">
            {/* Header del modal de creación con gradiente verde */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Plus size={18} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {fields.find((f) => String(f.name) === showQuickCreate)
                    ?.quickCreateTitle || "Crear Nuevo"}
                </h3>
              </div>
              <Button
                type="button"
                variant="light"
                size="sm"
                className="text-white hover:bg-white/20 transition-colors duration-200"
                onClick={() => {
                  setShowQuickCreate(null);
                  setQuickCreateData({});
                }}
              >
                <X size={18} />
              </Button>
            </div>

            {/* Contenido del modal */}
            <div className="p-6">
              <div className="space-y-4">
                {fields
                  .find((f) => String(f.name) === showQuickCreate)
                  ?.quickCreateFields?.map((qField) => (
                    <div
                      key={qField.name as string}
                      className="group transition-all duration-200"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {getFieldIcon(qField.type)}
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                          {qField.label}
                          {qField.required && (
                            <span className="text-red-500 text-xs">*</span>
                          )}
                        </label>
                      </div>

                      {qField.type === "checkbox" ? (
                        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
                          <input
                            type="checkbox"
                            checked={Boolean(
                              quickCreateData[qField.name as string]
                            )}
                            onChange={(e) =>
                              handleQuickCreateChange(e, qField.name as string)
                            }
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-2 border-gray-300 rounded transition-all duration-200"
                          />
                          <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                            {qField.label}
                          </span>
                        </div>
                      ) : (
                        <Input
                          type={qField.type || "text"}
                          value={String(
                            quickCreateData[qField.name as string] ?? ""
                          )}
                          onChange={(e) =>
                            handleQuickCreateChange(e, qField.name as string)
                          }
                          isRequired={qField.required}
                          className="transition-all duration-200"
                          classNames={{
                            inputWrapper:
                              "border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 focus-within:border-green-500 rounded-xl bg-white dark:bg-gray-800 transition-all duration-200",
                          }}
                          fullWidth
                          size="lg"
                        />
                      )}
                    </div>
                  ))}
              </div>

              {/* Botones del modal */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="bordered"
                  size="lg"
                  className="px-4 text-gray-600 hover:text-gray-700 border-2 border-gray-300 hover:border-gray-400 transition-all duration-200"
                  onClick={() => {
                    setShowQuickCreate(null);
                    setQuickCreateData({});
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  size="lg"
                  className="px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  onClick={() =>
                    handleQuickCreate(
                      fields.find((f) => String(f.name) === showQuickCreate)!
                    )
                  }
                  disabled={isCreating}
                >
                  <Plus size={16} className="mr-2" />
                  {isCreating ? "Creando..." : "Crear"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
