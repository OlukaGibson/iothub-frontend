import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useState } from "react";
import { 
  HardDrive, 
  Upload, 
  Download, 
  Clock, 
  Tag, 
  FileText, 
  AlertTriangle,
  Check,
  X,
  Search,
  ChevronDown
} from "lucide-react";

const SettingsPage = () => {
  return (
    <Layout>
      <div>Settings Page</div>
    </Layout>
  );
};

export default SettingsPage;
