
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { 
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { DeviceEntry, DeviceTableProps } from "./device-table/types";
import { TableFilter } from "./device-table/TableFilter";
import { TableContent } from "./device-table/TableContent";
import { TablePagination } from "./device-table/TablePagination";

export const DeviceDataTable = ({ dataEntries, fieldDefinitions }: DeviceTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  const columns = useMemo<ColumnDef<DeviceEntry>[]>(() => {
    return [
      {
        accessorKey: "timestamp",
        header: "Timestamp",
        cell: ({ row }) => formatDate(row.original.created_at),
      },
      ...Object.entries(fieldDefinitions).map(([key, name]) => ({
        accessorKey: key,
        header: name,
        cell: ({ row }) => {
          const value = row.getValue(key);
          return value ? (
            <Badge variant="outline" className="bg-gray-50">
              {value.toString()}
            </Badge>
          ) : (
            <span className="text-gray-400">—</span>
          );
        },
      })),
    ];
  }, [fieldDefinitions]);

  const data = useMemo(() => {
    if (!dataEntries || !Array.isArray(dataEntries)) return [];
    
    return dataEntries.map(entry => ({
      ...entry, 
      id: entry.entryID,
    }));
  }, [dataEntries]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: rowsPerPage,
      },
    },
  });

  return (
    <div className="w-full space-y-4">
      <TableFilter table={table} fieldDefinitions={fieldDefinitions} />
      <TableContent table={table} columns={columns} rowsPerPage={rowsPerPage} />
      <TablePagination table={table} rowsPerPage={rowsPerPage} />
    </div>
  );
};
