import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface FileUploaderProps {
  onUploadComplete?: (filePath: string) => void;
}

export function FileUploader({ onUploadComplete }: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('File uploaded successfully');
        onUploadComplete?.(data.filePath);
      } else {
        toast.error(data.error || 'Failed to upload file');
      }
    } catch (error) {
      toast.error('Error uploading file');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (fileName: string) => {
    try {
      const response = await fetch('/api/upload/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('File deleted successfully');
      } else {
        toast.error(data.error || 'Failed to delete file');
      }
    } catch (error) {
      toast.error('Error deleting file');
      console.error('Delete error:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>File Upload</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            type="file"
            onChange={handleFileUpload}
            disabled={isUploading}
            accept="image/*,video/*"
          />
          {isUploading && <p>Uploading...</p>}
        </div>
      </CardContent>
    </Card>
  );
} 