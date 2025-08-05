import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { EyeOff, Eye, Info } from "lucide-react";

interface DeviceEntry {
  entryID: string;
  created_at: string;
  [key: string]: any;
}

interface DeviceGraphsProps {
  dataEntries: DeviceEntry[];
  fieldDefinitions: Record<string, string>;
}

export const DeviceDataGraphs = ({ dataEntries, fieldDefinitions }: DeviceGraphsProps) => {
  // Keep track of which fields are visible
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>(
    Object.keys(fieldDefinitions).reduce((acc, field) => {
      acc[field] = true; // Initially all fields are visible
      return acc;
    }, {} as Record<string, boolean>)
  );

  // Toggle visibility for a single field
  const toggleFieldVisibility = (field: string) => {
    setVisibleFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Show/hide all fields
  const toggleAllFields = (visible: boolean) => {
    const newVisibility = Object.keys(fieldDefinitions).reduce((acc, field) => {
      acc[field] = visible;
      return acc;
    }, {} as Record<string, boolean>);
    
    setVisibleFields(newVisibility);
  };

  // Format data for charts
  const prepareChartData = () => {
    return dataEntries.map(entry => {
      // Process timestamp for X axis
      const date = new Date(entry.created_at);
      const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
      
      // Create a data point with all field values
      const dataPoint: any = { time: formattedDate, timestamp: new Date(entry.created_at).getTime() };
      
      Object.keys(fieldDefinitions).forEach(fieldKey => {
        // For each field, add both the raw value and a parsed numeric value for charting
        const rawValue = entry[fieldKey];
        dataPoint[`${fieldKey}_raw`] = rawValue;
        dataPoint[fieldKey] = parseFloat(rawValue) || 0;
      });
      
      return dataPoint;
    }).sort((a, b) => a.timestamp - b.timestamp);
  };
  
  const chartData = prepareChartData();

  // Check if field has numeric data
  const isNumericField = (fieldKey: string): boolean => {
    const hasNumericValue = dataEntries.some(entry => {
      const value = entry[fieldKey];
      return value !== undefined && value !== null && !isNaN(parseFloat(value));
    });
    return hasNumericValue;
  };

  // Use red color for all charts
  const redChartColor = "#ef4444"; // Tailwind red-500 color

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => toggleAllFields(true)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Show All
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => toggleAllFields(false)}
            className="flex items-center gap-2"
          >
            <EyeOff className="h-4 w-4" />
            Hide All
          </Button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {Object.entries(fieldDefinitions).map(([fieldKey, fieldName]) => {
          const isVisible = visibleFields[fieldKey];
          const isNumeric = isNumericField(fieldKey);
          
          return (
            <div key={fieldKey} className="inline-flex items-center gap-2">
              <Checkbox 
                id={`field-${fieldKey}`} 
                checked={isVisible}
                onCheckedChange={() => toggleFieldVisibility(fieldKey)}
              />
              <Label 
                htmlFor={`field-${fieldKey}`} 
                className="flex items-center cursor-pointer"
              >
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: redChartColor }}
                />
                {fieldName}
                {!isNumeric && (
                  <span title="Non-numeric data">
                    <Info className="h-3 w-3 ml-1 text-gray-400" />
                  </span>
                )}
              </Label>
            </div>
          );
        })}
      </div>

      {/* Individual graphs for each field in a two-column grid with center alignment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2 max-w-[1400px] mx-auto">
        {Object.entries(fieldDefinitions).map(([fieldKey, fieldName]) => {
          // Skip if field is not visible
          if (!visibleFields[fieldKey]) return null;
          
          // Check if field has numeric data
          const isNumeric = isNumericField(fieldKey);
          
          if (!isNumeric) {
            return (
              <Card key={fieldKey} className="w-full max-w-md mx-auto">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <div 
                      className="w-4 h-4 flex-shrink-0 rounded-full mr-2" 
                      style={{ backgroundColor: redChartColor }}
                    />
                    <span className="truncate" title={fieldName}>{fieldName}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-64 bg-gray-50">
                  <div className="text-center text-gray-500">
                    <Info className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>Non-numeric data</p>
                  </div>
                </CardContent>
              </Card>
            );
          }
          
          return (
            <Card key={fieldKey} className="w-full max-w-md mx-auto">
              <CardHeader className="py-3">
                <CardTitle className="text-lg flex items-center">
                  <div 
                    className="w-4 h-4 flex-shrink-0 rounded-full mr-2" 
                    style={{ backgroundColor: redChartColor }}
                  />
                  <span className="truncate" title={fieldName}>{fieldName}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 5, right: 20, left: 10, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="time" 
                        tick={{ fontSize: 10 }} 
                        angle={-45} 
                        textAnchor="end"
                        height={60} 
                      />
                      <YAxis width={40} />
                      <Tooltip />
                      <Line 
                        type="linear"
                        dataKey={fieldKey} 
                        name={fieldName} 
                        stroke={redChartColor}
                        activeDot={{ r: 6 }}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};