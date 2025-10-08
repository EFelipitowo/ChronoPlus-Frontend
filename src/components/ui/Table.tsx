import React from 'react';
import '../../pages/styles/style.css'

// Interface genérica para los datos
export interface DataItem {
  [key: string]: string | number | boolean | Date | undefined;
}

export interface ColumnConfig<T = DataItem> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  customRender?: (value: T[keyof T], item: T) => React.ReactNode;
}

interface TableProps<T = DataItem> {
  data: T[];
  columns: ColumnConfig<T>[];
  onSort?: (field: keyof T, direction: 'asc' | 'desc') => void;
  sortField?: keyof T;
  sortDirection?: 'asc' | 'desc';
  onRowClick?: (row: DataItem) => void;
}

const Table = <T extends DataItem>({
  data = [],
  columns,
  onSort,
  sortField,
  sortDirection,
  onRowClick
}: TableProps<T>): React.ReactElement => {
  const handleSort = (field: keyof T) => {
    if (!onSort) return;
    if (sortField === field) {
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      onSort(field, newDirection);
    } else {
      onSort(field, 'asc');
    }
  };

  const getSortIcon = (field: keyof T) => {
    if (!sortField || sortField !== field) {
      return " ";
    }
    return sortDirection === 'asc' ? "↑" : "↓";
  };


  // Función para renderizar el contenido de una celda
  const renderCellContent = (column: ColumnConfig<T>, item: T) => {
    const value = item[column.key];
    if (column.customRender) {
      return column.customRender(item[column.key], item);
    }

    // If column has a click handler (e.g., onRowClick) and it's the "tag" column
    if (column.key === 'tag' && onRowClick) {
      return (
        <span
          className="text-blue-600 hover:underline cursor-pointer"
          onClick={(e) => {
            e.stopPropagation(); // prevent row click if there’s one
            onRowClick(item);
          }}
        >
          {value != null ? String(value) : ""}
        </span>
      );

    }
    

    // Renderizado especial para la columna de estado
    if (column.key === 'tag_estado') {
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${String(value)[0] === "1"
          ? "bg-blue-100 text-blue-800"
          : String(value)[0] === "2"
            ? "bg-green-100 text-green-800"
            : String(value)[0] === "3"
              ? "bg-yellow-100 text-yellow-800"
              : String(value)[0] === "4"
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
          }`}>
          {String(value)}
        </span>
      );

      
    }
    // Handle Date, undefined, or other primitive types
    if (value instanceof Date) return value.toLocaleString();
    if (value === undefined || value === null) return "N/A";
    return String(value);
  };



  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-1 border-black">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="p-4 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-300"
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center">
                    {column.label}
                    {column.sortable !== false && onSort && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr 
                    key={index} 
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"} 
                  >
                  {columns.map((column) => (
                    <td key={String(column.key)} className="p-4 border-b border-gray-200">
                      {renderCellContent(column, item)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-gray-500">
                  No se encontraron resultados para su búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;