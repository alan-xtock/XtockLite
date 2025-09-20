import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface UploadAreaProps {
  onFileUpload?: (result: any) => void;
  onUploadStart?: () => void;
}

export default function UploadArea({ onFileUpload, onUploadStart }: UploadAreaProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    console.log('File selected:', file.name);
    setFileName(file.name);
    setIsUploading(true);
    setUploadProgress(0);
    onUploadStart?.();

    try {
      const formData = new FormData();
      formData.append('csvFile', file);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/upload-csv', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      setUploadResult(result);
      setIsUploaded(true);
      setIsUploading(false);
      
      toast({
        title: "Upload Successful",
        description: `Processed ${result.validRows} rows from your CSV file.`,
      });

      onFileUpload?.(result);

    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      setUploadProgress(0);
      
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload CSV file",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className={`w-full transition-colors ${isDragOver ? 'border-primary' : ''}`}>
      <CardContent className="p-6">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          data-testid="upload-area"
        >
          {isUploaded ? (
            <div className="space-y-4">
              <CheckCircle className="h-12 w-12 text-accent mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">File Uploaded Successfully</h3>
                <p className="text-muted-foreground mt-1">{fileName}</p>
                {uploadResult && (
                  <div className="text-sm mt-2 space-y-1">
                    <p className="text-accent">✓ {uploadResult.validRows} rows processed</p>
                    {uploadResult.errors && uploadResult.errors.length > 0 && (
                      <p className="text-destructive">⚠ {uploadResult.errors.length} rows skipped</p>
                    )}
                  </div>
                )}
                <p className="text-sm text-accent mt-2">Ready to generate forecast</p>
              </div>
            </div>
          ) : isUploading ? (
            <div className="space-y-4">
              <Upload className="h-12 w-12 text-primary mx-auto animate-pulse" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Processing CSV File</h3>
                <p className="text-muted-foreground mt-1">{fileName}</p>
                <div className="mt-3 space-y-2">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-xs text-muted-foreground text-center">
                    {uploadProgress < 90 ? 'Uploading...' : 'Processing data...'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Upload Sales Data</h3>
                <p className="text-muted-foreground mt-1">
                  Drag and drop your 30-day CSV file here
                </p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Button variant="outline" asChild data-testid="button-browse" disabled={isUploading}>
                  <label className="cursor-pointer">
                    <FileText className="h-4 w-4 mr-2" />
                    Browse Files
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileInput}
                      className="hidden"
                      disabled={isUploading}
                      data-testid="input-file"
                    />
                  </label>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Supports CSV files up to 10MB
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}