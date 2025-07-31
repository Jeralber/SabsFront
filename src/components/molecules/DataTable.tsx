import { Button } from "@heroui/button";
import { useState, useMemo } from "react";
import { Edit, Trash, ChevronUp, ChevronDown, Eye, EyeOff, Plus, ChevronLeft, ChevronRight } from "lucide-react";

type Column<T> = {
  accessorKey: keyof T;
  header: string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  isDate?: boolean;
  width?: string; 
};

type ActionButton<T> = {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  variant?: 'primary' | 'secondary' | 'danger';
  show?: (row: T) => boolean; 
};

interface DataTableProps<T> {
  data: T[] | { data: T[], message?: string };
  title?: string;
  columns: Column<T>[];
  actions?: ActionButton<T>[];
  onEdit?: (row: T) => void;
  onCreate?: () => void;
  onDelete?: (id: number) => void;
  getRowId: (row: T) => number;
  searchPlaceholder?: string;
  emptyMessage?: string;
  showSearch?: boolean;
  showColumnSelector?: boolean;
  showCreateButton?: boolean;
  createButtonLabel?: string;
  pageSize?: number; 
  className?: string;
}

export function DataTable<T extends { [key: string]: any }>({
  data,
  title,
  columns,
  actions,
  onEdit,
  onCreate,
  onDelete,
  getRowId,
  searchPlaceholder = "Buscar...",
  emptyMessage = "No se encontraron resultados",
  showSearch = true,
  showColumnSelector = true,
  showCreateButton = true,
  createButtonLabel = "Crear",
  pageSize = 15,
  className = "",
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });
  const [visibleColumns, setVisibleColumns] = useState<Set<keyof T>>(
    new Set(columns.map(col => col.accessorKey))
  );
  const [showColumnSelectorPanel, setShowColumnSelectorPanel] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const normalizedData = useMemo(() => {
    if (Array.isArray(data)) {
      return data;
    } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
      return data.data;
    } else {
      console.error('Error: data no es un array ni contiene una propiedad data que sea array', data);
      return [];
    }
  }, [data]);

  // Función para manejar el ordenamiento
  const handleSort = (key: keyof T) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Función para alternar la visibilidad de una columna
  const toggleColumnVisibility = (key: keyof T) => {
    setVisibleColumns(prevVisible => {
      const newVisible = new Set(prevVisible);
      if (newVisible.has(key)) {
        newVisible.delete(key);
      } else {
        newVisible.add(key);
      }
      return newVisible;
    });
  };

  const sortedAndFilteredData = useMemo(() => {
    let filteredData = normalizedData;
    
    if (showSearch && searchTerm) {
      filteredData = normalizedData.filter((row) => {
        return columns.some((col) => {
          const value = String(row[col.accessorKey] || '');
          return value.toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
    }

    if (sortConfig.key) {
      filteredData = [...filteredData].sort((a, b) => {
        const aValue = a[sortConfig.key as keyof T];
        const bValue = b[sortConfig.key as keyof T];
        
        const column = columns.find(col => col.accessorKey === sortConfig.key);
        if (column?.isDate) {
          const dateA = aValue ? new Date(aValue).getTime() : 0;
          const dateB = bValue ? new Date(bValue).getTime() : 0;
          return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredData;
  }, [normalizedData, columns, searchTerm, sortConfig, showSearch]);

  // Cálculos de paginación
  const totalPages = Math.ceil(sortedAndFilteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = sortedAndFilteredData.slice(startIndex, endIndex);

  // Resetear página cuando cambian los filtros
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generar números de página para mostrar
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const visibleColumnsList = columns.filter(col => 
    visibleColumns.has(col.accessorKey)
  );


  const getActionButtons = (row: T) => {
    const buttons = [];
    
  
    if (actions) {
      return actions
        .filter(action => !action.show || action.show(row))
        .map((action, index) => {
          const variantClasses = {
            primary: "bg-green-600 text-white hover:bg-green-700",
            secondary: "bg-gray-600 text-white hover:bg-gray-700",
            danger: "bg-red-600 text-white hover:bg-red-700"
          };
          
          return (
            <Button
              key={index}
              size="sm"
              onClick={() => action.onClick(row)}
              className={variantClasses[action.variant || 'primary']}
              title={action.label}
            >
              {action.icon || action.label}
            </Button>
          );
        });
    }
    

    if (onEdit) {
      buttons.push(
        <Button
          key="edit"
          size="sm"
          onClick={() => onEdit(row)}
          className="bg-green-600 text-white hover:bg-green-700"
          title="Editar"
        >
          <Edit size={18} />
        </Button>
      );
    }
    
    if (onDelete) {
      buttons.push(
        <Button
          key="delete"
          size="sm"
          variant="light"
          onClick={() => onDelete(getRowId(row))}
          className="text-red-500 hover:text-red-700"
          title="Eliminar"
        >
          <Trash size={18} />
        </Button>
      );
    }
    
    return buttons;
  };

  return (
    <div className={`p-4 bg-white dark:bg-gray-800 rounded-xl shadow ${className}`}>
      {title && <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{title}</h2>}

      <div className="flex flex-wrap justify-between mb-4 gap-2">
        {(onCreate && showCreateButton) && (
          <Button
            onClick={onCreate}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            <Plus size={18} className="mr-1" />
            {createButtonLabel}
          </Button>
        )}

        <div className="flex gap-2">
          {showSearch && (
            <input
              type="text"
              className="border border-gray-300 dark:border-gray-600 p-2 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          )}
          
          {showColumnSelector && (
            <Button
              onClick={() => setShowColumnSelectorPanel(!showColumnSelectorPanel)}
              className="bg-green-600 text-white hover:bg-green-700"
              title="Mostrar/Ocultar columnas"
            >
              {showColumnSelectorPanel ? <EyeOff size={18} /> : <Eye size={18} />}
            </Button>
          )}
        </div>
      </div>

      {showColumnSelectorPanel && showColumnSelector && (
        <div className="mb-4 p-3 border rounded-md bg-gray-50 dark:bg-gray-700">
          <h3 className="font-medium mb-2 text-gray-900 dark:text-white">Mostrar/Ocultar Columnas</h3>
          <div className="flex flex-wrap gap-2">
            {columns.map((column) => (
              <label key={String(column.accessorKey)} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={visibleColumns.has(column.accessorKey)}
                  onChange={() => toggleColumnVisibility(column.accessorKey)}
                  className="rounded-md bg-green-600"
                />
                <span className="text-gray-700 dark:text-gray-300">{column.header}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 rounded-lg shadow">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              {visibleColumnsList.map((col, i) => (
                <th
                  key={i}
                  scope="col"
                  className={`px-6 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300 ${
                    col.sortable !== false ? 'cursor-pointer select-none hover:bg-gray-200 dark:hover:bg-gray-600' : ''
                  }`}
                  style={{ width: col.width }}
                  onClick={() => col.sortable !== false && handleSort(col.accessorKey)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{col.header}</span>
                    {col.sortable !== false && sortConfig.key === col.accessorKey && (
                      <span>
                        {sortConfig.direction === 'asc' ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {(actions || onEdit || onDelete) && (
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  {visibleColumnsList.map((col, i) => (
                    <td key={i} className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {col.cell ? col.cell(row) : String(row[col.accessorKey] || '')}
                    </td>
                  ))}
                  {(actions || onEdit || onDelete) && (
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex space-x-2">
                        {getActionButtons(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={(visibleColumnsList.length + ((actions || onEdit || onDelete) ? 1 : 0))} 
                  className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Controles de paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Mostrando {startIndex + 1} a {Math.min(endIndex, sortedAndFilteredData.length)} de {sortedAndFilteredData.length} resultados
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              size="sm"
            >
              <ChevronLeft size={16} />
            </Button>
            
            {getPageNumbers().map((page) => (
              <Button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`${
                  currentPage === page
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
                }`}
                size="sm"
              >
                {page}
              </Button>
            ))}
            
            <Button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              size="sm"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
