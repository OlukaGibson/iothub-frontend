
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  BarChart2, 
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Download, 
  RefreshCw,
  Calendar,
  ArrowDownUp
} from "lucide-react";
import { useState } from "react";

const VisualizationPage = () => {
  const [selectedDevice, setSelectedDevice] = useState("");
  const [selectedMetric, setSelectedMetric] = useState("");

  // Sample data for the charts
  const temperatureData = [
    { time: "00:00", value: 22.5 },
    { time: "02:00", value: 21.8 },
    { time: "04:00", value: 21.2 },
    { time: "06:00", value: 21.3 },
    { time: "08:00", value: 22.5 },
    { time: "10:00", value: 23.8 },
    { time: "12:00", value: 24.5 },
    { time: "14:00", value: 25.1 },
    { time: "16:00", value: 24.8 },
    { time: "18:00", value: 24.0 },
    { time: "20:00", value: 23.5 },
    { time: "22:00", value: 22.9 },
  ];

  const humidityData = [
    { time: "00:00", value: 55 },
    { time: "02:00", value: 56 },
    { time: "04:00", value: 57 },
    { time: "06:00", value: 58 },
    { time: "08:00", value: 60 },
    { time: "10:00", value: 57 },
    { time: "12:00", value: 52 },
    { time: "14:00", value: 50 },
    { time: "16:00", value: 48 },
    { time: "18:00", value: 50 },
    { time: "20:00", value: 52 },
    { time: "22:00", value: 54 },
  ];

  const weeklyData = [
    { day: "Mon", temperature: 22.5, humidity: 55 },
    { day: "Tue", temperature: 23.2, humidity: 53 },
    { day: "Wed", temperature: 24.0, humidity: 50 },
    { day: "Thu", temperature: 23.5, humidity: 52 },
    { day: "Fri", temperature: 24.5, humidity: 48 },
    { day: "Sat", temperature: 25.1, humidity: 45 },
    { day: "Sun", temperature: 24.2, humidity: 50 },
  ];

  const distributionData = [
    { name: "18-20°C", value: 15 },
    { name: "20-22°C", value: 25 },
    { name: "22-24°C", value: 35 },
    { name: "24-26°C", value: 20 },
    { name: "26-28°C", value: 5 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Visualization</h1>
          <p className="text-gray-600 mt-1">Analyze and visualize your IoT device data</p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <Button variant="outline" className="flex items-center">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" className="flex items-center">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Device</label>
              <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                <SelectTrigger>
                  <SelectValue placeholder="Select device" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="temp001">Temperature Sensor 1</SelectItem>
                  <SelectItem value="hum001">Humidity Sensor 1</SelectItem>
                  <SelectItem value="pres001">Pressure Sensor 1</SelectItem>
                  <SelectItem value="mot001">Motion Detector 1</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Metric</label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger>
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="temperature">Temperature</SelectItem>
                  <SelectItem value="humidity">Humidity</SelectItem>
                  <SelectItem value="pressure">Pressure</SelectItem>
                  <SelectItem value="battery">Battery Level</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Time Range</label>
              <DateRangePicker />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="line" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="line" className="flex items-center">
            <LineChartIcon className="mr-2 h-4 w-4" />
            Line Chart
          </TabsTrigger>
          <TabsTrigger value="bar" className="flex items-center">
            <BarChart2 className="mr-2 h-4 w-4" />
            Bar Chart
          </TabsTrigger>
          <TabsTrigger value="pie" className="flex items-center">
            <PieChartIcon className="mr-2 h-4 w-4" />
            Distribution
          </TabsTrigger>
        </TabsList>

        <TabsContent value="line">
          <Card>
            <CardHeader>
              <CardTitle>Temperature Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={temperatureData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[20, 26]} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      name="Temperature (°C)"
                      stroke="#0080ff" 
                      strokeWidth={2}
                      dot={{ fill: "#0080ff", r: 3 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bar">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis yAxisId="left" orientation="left" stroke="#0080ff" />
                    <YAxis yAxisId="right" orientation="right" stroke="#00c853" />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      yAxisId="left"
                      dataKey="temperature" 
                      name="Temperature (°C)" 
                      fill="#0080ff"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      yAxisId="right"
                      dataKey="humidity" 
                      name="Humidity (%)" 
                      fill="#00c853"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pie">
          <Card>
            <CardHeader>
              <CardTitle>Temperature Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Humidity Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={humidityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[40, 65]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    name="Humidity (%)"
                    stroke="#00c853" 
                    strokeWidth={2}
                    dot={{ fill: "#00c853", r: 3 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Temperature</p>
                  <div className="mt-1">
                    <p className="text-2xl font-bold">23.5°C</p>
                    <p className="text-sm text-gray-500 mt-1">Average</p>
                  </div>
                  <div className="flex justify-between mt-2">
                    <div>
                      <p className="text-sm font-medium">21.2°C</p>
                      <p className="text-xs text-gray-500">Min</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">25.1°C</p>
                      <p className="text-xs text-gray-500">Max</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Humidity</p>
                  <div className="mt-1">
                    <p className="text-2xl font-bold">52.5%</p>
                    <p className="text-sm text-gray-500 mt-1">Average</p>
                  </div>
                  <div className="flex justify-between mt-2">
                    <div>
                      <p className="text-sm font-medium">48%</p>
                      <p className="text-xs text-gray-500">Min</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">60%</p>
                      <p className="text-xs text-gray-500">Max</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Data Points Collected</span>
                  <span>5,280</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Collection Period</span>
                  <span>Last 7 days</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Update Frequency</span>
                  <span>Every 15 minutes</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Last Update</span>
                  <span>5 minutes ago</span>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                View Detailed Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default VisualizationPage;
