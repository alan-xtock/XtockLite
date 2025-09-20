import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle } from "lucide-react";

interface UploadAreaProps {
  onFileUpload?: (file: File) => void;
}

export default function UploadArea({ onFileUpload }: UploadAreaProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [fileName, setFileName] = useState<string>("");

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

  const handleFile = (file: File) => {
    console.log('File uploaded:', file.name);
    setFileName(file.name);
    setIsUploaded(true);
    onFileUpload?.(file);
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
                <p className="text-sm text-accent mt-2">Ready to generate forecast</p>
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
                <Button variant="outline" asChild data-testid="button-browse">
                  <label className="cursor-pointer">
                    <FileText className="h-4 w-4 mr-2" />
                    Browse Files
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileInput}
                      className="hidden"
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