import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const UploadPage = () => {
  return (
    <Layout>
      <Card>
        <CardHeader>
          <CardTitle>Upload Data</CardTitle>
          <CardDescription>Upload data to the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is the upload page.</p>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default UploadPage;
