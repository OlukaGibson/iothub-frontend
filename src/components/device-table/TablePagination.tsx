
import { Button } from "@/components/ui/button";
import { Table } from "@tanstack/react-table";
import { DeviceEntry } from "./types";

interface TablePaginationProps {
  table: Table<DeviceEntry>;
  rowsPerPage: number;
}

export function TablePagination({ table, rowsPerPage }: TablePaginationProps) {
  return (
    <div className="flex items-center justify-end space-x-2 py-4">
      <div className="flex-1 text-sm text-gray-500">
        Showing {Math.min(rowsPerPage, table.getRowModel().rows.length)} of{" "}
        {table.getRowModel().rows.length} entries
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        Next
      </Button>
    </div>
  );
}
