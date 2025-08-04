
export interface DeviceEntry {
  entryID: number;
  created_at: string;
  [key: string]: any;
}

export interface DeviceTableProps {
  dataEntries: DeviceEntry[];
  fieldDefinitions: Record<string, string>;
}
