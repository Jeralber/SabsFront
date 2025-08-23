import { FormEvent, useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Plus } from "lucide-react";

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
};

export type GenericFormProps<T> = {
  fields: FieldDefinition<T>[];
  initialValues: Partial<T>;
  onSubmit: (values: Partial<T>) => void;
  onCancel: () => void;
  onClose?: () => void;
};

export function GenericForm<T>({
  fields,
  initialValues,
  onSubmit,
  onCancel,
}: GenericFormProps<T>) {
  const [formData, setFormData] = useState<Partial<T>>(initialValues);
  const [showQuickCreate, setShowQuickCreate] = useState<string | null>(null);
  const [quickCreateData, setQuickCreateData] = useState<any>({});
  const [isCreating, setIsCreating] = useState(false);

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
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto w-full max-w-lg">
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {fields.map((field) => (
            <div
              key={String(field.name)}
              className="flex flex-col gap-1 w-full"
            >
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label}
              </label>

              {field.type === "select" ? (
                <div className="flex gap-2">
                  <select
                    name={String(field.name)}
                    value={String(formData[field.name] ?? "")}
                    onChange={(e) => handleChange(e, field.name)}
                    className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={field.required}
                  >
                    <option value="">Seleccione...</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  {field.allowQuickCreate && (
                    <Button
                      type="button"
                      size="sm"
                      variant="flat"
                      className="px-3 text-blue-600 hover:text-blue-700 border border-blue-300 hover:border-blue-400"
                      onClick={() => setShowQuickCreate(String(field.name))}
                    >
                      <Plus size={16} />
                    </Button>
                  )}
                </div>
              ) : field.type === "checkbox" ? (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name={String(field.name)}
                    checked={Boolean(formData[field.name])}
                    onChange={(e) => handleChange(e, field.name)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    readOnly={field.readOnly}
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {field.label}
                  </span>
                </div>
              ) : (
                <Input
                  isRequired={field.required}
                  name={String(field.name)}
                  type={field.type || "text"}
                  isReadOnly={field.readOnly}
                  value={String(formData[field.name] ?? "")}
                  onChange={(e) => handleChange(e, field.name)}
                  className="w-full"
                  fullWidth
                />
              )}
            </div>
          ))}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="submit"
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Guardar
            </Button>
            <Button
              type="button"
              variant="flat"
              className="text-green-600 hover:text-green-700"
              onClick={onCancel}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>


      {showQuickCreate && (
        <div className="fixed inset-0 flex items-center justify-center z-60 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {fields.find((f) => String(f.name) === showQuickCreate)
                ?.quickCreateTitle || "Crear Nuevo"}
            </h3>

            <div className="space-y-4">
              {fields
                .find((f) => String(f.name) === showQuickCreate)
                ?.quickCreateFields?.map((qField) => (
                  <div
                    key={qField.name as string}
                    className="flex flex-col gap-1"
                  >
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {qField.label}
                    </label>

                    {qField.type === "checkbox" ? (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={Boolean(
                            quickCreateData[qField.name as string]
                          )}
                          onChange={(e) =>
                            handleQuickCreateChange(e, qField.name as string)
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
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
                        fullWidth
                      />
                    )}
                  </div>
                ))}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                type="button"
                onClick={() =>
                  handleQuickCreate(
                    fields.find((f) => String(f.name) === showQuickCreate)!
                  )
                }
                className="bg-blue-600 text-white hover:bg-blue-700"
                disabled={isCreating}
              >
                {isCreating ? "Creando..." : "Crear"}
              </Button>
              <Button
                type="button"
                variant="flat"
                onClick={() => {
                  setShowQuickCreate(null);
                  setQuickCreateData({});
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
