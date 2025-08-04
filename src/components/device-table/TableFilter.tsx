
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table } from "@tanstack/react-table";
import { DeviceEntry } from "./types";

interface TableFilterProps {
  table: Table<DeviceEntry>;
  fieldDefinitions: Record<string, string>;
}

export function TableFilter({ table, fieldDefinitions }: TableFilterProps) {
  return (
    <div className="flex items-center justify-between">
      <Input
        placeholder="Filter data..."
        value={(table.getColumn("timestamp")?.getFilterValue() as string) ?? ""}
        onChange={(e) =>
          table.getColumn("timestamp")?.setFilterValue(e.target.value)
        }
        className="max-w-sm"
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="ml-auto">
            Columns <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {table
            .getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id === "timestamp" ? "Timestamp" : fieldDefinitions[column.id]}
              </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
