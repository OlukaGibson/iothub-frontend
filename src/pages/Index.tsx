import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Box, HardDrive, Upload, Activity, Zap, Thermometer, Droplets } from "lucide-react";
import api from "@/lib/api";
import config from "@/config";
import { useQuery } from "@tanstack/react-query";

// Dashboard summary interface
interface DashboardSummary {
  total_devices: number;
  total_profiles: number;
  total_firmware_versions: number;
  latest_firmware: {
    firmwareVersion: string;
    uploaded_at: string;
  } | null;
  online_devices: number;
  offline_devices: number;
  hourly_activity: Array<{
    hour: number;
    devices_posted: number;
  }>;
}

const DashboardPage = () => {
  // Fetch dashboard summary using React Query
  // Fetch devices to create dashboard summary
  const { data: devices = [], isLoading: devicesLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const response = await api.get('/device');
      return response.data || [];
    }
  });

  // Fetch profiles to create dashboard summary
  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const response = await api.get('/profiles');
      return response.data || [];
    }
  });

  // Fetch firmware to create dashboard summary
  const { data: firmware = [], isLoading: firmwareLoading } = useQuery({
    queryKey: ['firmware'],
    queryFn: async () => {
      const response = await api.get('/firmware');
      return response.data || [];
    }
  });

  const isLoading = devicesLoading || profilesLoading || firmwareLoading;

  // Create dashboard summary from fetched data
  const summaryData: DashboardSummary = {
    total_devices: devices.length,
    online_devices: devices.filter((device: any) => {
      if (!device.last_posted_time) return false;
      const lastPosted = new Date(device.last_posted_time);
      const now = new Date();
      const threeHoursInMs = 3 * 60 * 60 * 1000;
      return (now.getTime() - lastPosted.getTime()) < threeHoursInMs;
    }).length,
    offline_devices: devices.length - devices.filter((device: any) => {
      if (!device.last_posted_time) return false;
      const lastPosted = new Date(device.last_posted_time);
      const now = new Date();
      const threeHoursInMs = 3 * 60 * 60 * 1000;
      return (now.getTime() - lastPosted.getTime()) < threeHoursInMs;
    }).length,
    total_profiles: profiles.length,
    total_firmware_versions: firmware.length,
    latest_firmware: firmware.length > 0 ? {
      firmwareVersion: firmware[0].firmware_version,
      uploaded_at: new Date().toISOString()
    } : null,
    hourly_activity: [] // Not available from FastAPI endpoints
  };
  
  // Format time since last firmware upload
  const formatTimeSince = (dateString: string | undefined): string => {
    if (!dateString) return "Unknown";
    
    const uploadDate = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - uploadDate.getTime();
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };
  
  // Format the hour to display in 12-hour format
  const formatHour = (hour: number): string => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  };
  
  // Transform hourly activity data for the chart
  const deviceActivityData = summaryData?.hourly_activity?.map(item => ({
    time: formatHour(item.hour),
    value: item.devices_posted
  })) || [
    // Fallback data if API data is not available
    { time: '12 AM', value: 0 },
    { time: '4 AM', value: 0 },
    { time: '8 AM', value: 0 },
    { time: '12 PM', value: 0 },
    { time: '4 PM', value: 0 },
    { time: '8 PM', value: 0 },
    { time: '11 PM', value: 0 },
  ];

  // Device status data from API or fallback
  const deviceStatusData = summaryData ? 
    [
      { name: "Online", value: summaryData.online_devices },
      { name: "Offline", value: summaryData.offline_devices },
    ] : 
    [
      { name: "Online", value: 0 },
      { name: "Offline", value: 0 },
    ];

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to your IoT Control Hub. Monitor and manage your devices.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Devices</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {isLoading ? "..." : summaryData?.total_devices || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Box className="h-6 w-6 text-iot-blue" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                {isLoading ? "..." : summaryData?.online_devices || 0} Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Device Profiles</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {isLoading ? "..." : summaryData?.total_profiles || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Activity className="h-6 w-6 text-iot-purple" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                {isLoading ? "..." : summaryData?.total_profiles || 0} Templates
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Firmware Versions</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {isLoading ? "..." : summaryData?.total_firmware_versions || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <HardDrive className="h-6 w-6 text-iot-green" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                1 Update Available
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Last Upload</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {isLoading ? "..." : (
                    summaryData?.latest_firmware ? 
                      formatTimeSince(summaryData.latest_firmware.uploaded_at) : 
                      "Never"
                  )}
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Upload className="h-6 w-6 text-iot-orange" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                {isLoading ? "..." : (
                  summaryData?.latest_firmware ? 
                    `Firmware ${summaryData.latest_firmware.firmwareVersion}` : 
                    "No firmware"
                )}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Activity className="mr-2 h-5 w-5 text-iot-purple" />
              Hourly Device Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-60">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <svg className="animate-spin h-6 w-6 text-gray-500" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={deviceActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis name="Devices" />
                    <Tooltip 
                      formatter={(value) => [`${value} devices`, 'Activity']}
                      labelFormatter={(label) => `Time: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      name="Devices Posting" 
                      stroke="#9333ea" 
                      strokeWidth={2}
                      dot={{ fill: "#9333ea", r: 3 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Zap className="mr-2 h-5 w-5 text-iot-orange" />
              Device Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deviceStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#ff9100" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Device Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: 1, name: "Temperature Sensor", status: "online", lastActive: "2 min ago", reading: "24.5°C" },
                { id: 2, name: "Humidity Sensor", status: "online", lastActive: "5 min ago", reading: "48%" },
                { id: 3, name: "Pressure Sensor", status: "offline", lastActive: "3 hours ago", reading: "1013 hPa" },
                { id: 4, name: "Motion Detector", status: "online", lastActive: "1 min ago", reading: "No motion" },
              ].map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full mr-3 ${device.status === "online" ? "bg-green-500" : "bg-red-500"}`}></div>
                    <div>
                      <p className="font-medium text-gray-800">{device.name}</p>
                      <p className="text-sm text-gray-500">Last active: {device.lastActive}</p>
                    </div>
                  </div>
                  <div>
                    <Badge className={device.status === "online" ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-red-100 text-red-800 hover:bg-red-100"}>
                      {device.reading}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div> */}
    </Layout>
  );
};

export default DashboardPage;