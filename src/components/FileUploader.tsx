
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, File, Folder } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface SerializedFile {
  name: string;
  type: string;
  size: number;
  lastModified: number;
}

interface FileUploaderProps {
  onFilesUploaded: (files: File[]) => void;
  existingFiles?: SerializedFile[];
}

export function FileUploader({ onFilesUploaded, existingFiles = [] }: FileUploaderProps) {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Initialize files from existingFiles if provided
  useEffect(() => {
    if (existingFiles && existingFiles.length > 0) {
      console.log("Restored file metadata from localStorage:", existingFiles);
    }
  }, [existingFiles]);

  // Helper function to check if a file is an Excel file
  const isExcelFile = (file: File): boolean => {
    // Accept more Excel file types and extensions
    const excelTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/vnd.ms-excel.sheet.macroEnabled.12', // .xlsm
      'application/vnd.ms-excel.sheet.binary.macroEnabled.12', // .xlsb
      'application/vnd.ms-excel.template.macroEnabled.12', // .xltm
      'application/vnd.ms-excel.addin.macroEnabled.12', // .xlam
      'application/vnd.openxmlformats-officedocument.spreadsheetml.template', // .xltx
    ];

    // Also check file extension if MIME type detection doesn't work
    const fileName = file.name.toLowerCase();
    const excelExtensions = ['.xlsx', '.xls', '.xlsm', '.xlsb', '.xltm', '.xlam', '.xltx', '.csv'];
    
    return excelTypes.includes(file.type) || 
           excelExtensions.some(ext => fileName.endsWith(ext));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      console.log(`Processing ${e.target.files.length} files from ${e.target.id}`);
      
      const allFiles = Array.from(e.target.files);
      // Log all files to check what's being received
      allFiles.forEach((file, index) => {
        console.log(`Raw file ${index}: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);
      });
      
      const newFiles = allFiles.filter(file => isExcelFile(file));
      
      console.log(`After filtering, found ${newFiles.length} Excel files`);
      
      if (newFiles.length > 0) {
        setFiles(prev => [...prev, ...newFiles]);
        toast({
          title: "Files Added",
          description: `Added ${newFiles.length} Excel files`,
        });
      } else if (e.target.files.length > 0) {
        toast({
          variant: "destructive",
          title: "Invalid Files",
          description: "Only Excel files (.xlsx, .xls, .csv, etc.) are supported",
        });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files?.length) {
      console.log(`Processing ${e.dataTransfer.files.length} files from drop event`);
      
      const allFiles = Array.from(e.dataTransfer.files);
      // Log all files to check what's being received
      allFiles.forEach((file, index) => {
        console.log(`Raw dropped file ${index}: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);
      });
      
      const newFiles = allFiles.filter(file => isExcelFile(file));
      
      console.log(`After filtering dropped files, found ${newFiles.length} Excel files`);
      
      if (newFiles.length > 0) {
        setFiles(prev => [...prev, ...newFiles]);
        toast({
          title: "Files Added",
          description: `Added ${newFiles.length} Excel files`,
        });
      } else if (e.dataTransfer.files.length > 0) {
        toast({
          variant: "destructive",
          title: "Invalid Files", 
          description: "Only Excel files (.xlsx, .xls, .csv, etc.) are supported",
        });
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (files.length > 0) {
      onFilesUploaded(files);
    } else {
      toast({
        variant: "destructive",
        title: "No Files",
        description: "Please add files before processing",
      });
    }
  };

  // Debugging effect to track files state
  useEffect(() => {
    console.log(`Current files in state: ${files.length}`);
    files.forEach((file, index) => {
      console.log(`File ${index}: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);
    });
  }, [files]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors
            ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/50'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <input
            type="file"
            id="file-upload"
            multiple
            accept=".xlsx,.xls,.xlsm,.xlsb,.xltx,.xltm,.csv"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="flex flex-col items-center gap-2">
            <Upload size={40} className="text-muted-foreground" />
            <p className="font-medium">Click to upload files</p>
            <p className="text-sm text-muted-foreground">Excel files only (.xlsx, .xls, .csv, etc.)</p>
          </div>
        </div>

        <div 
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors
            ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/50'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('folder-upload')?.click()}
        >
          <input
            type="file"
            id="folder-upload"
            // Use directory attribute with proper TypeScript handling
            // @ts-ignore - TypeScript doesn't recognize webkitdirectory and directory attributes
            webkitdirectory=""
            directory=""
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="flex flex-col items-center gap-2">
            <Folder size={40} className="text-muted-foreground" />
            <p className="font-medium">Click to upload folder</p>
            <p className="text-sm text-muted-foreground">Will process all Excel files</p>
          </div>
        </div>
      </div>

      {(files.length > 0 || existingFiles.length > 0) ? (
        <>
          <div className="border rounded-md">
            <div className="p-3 bg-secondary/50 border-b">
              <h3 className="font-medium">
                {files.length > 0 
                  ? `Uploaded Files (${files.length})` 
                  : `Saved Files (${existingFiles.length})`
                }
              </h3>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {files.length > 0 ? (
                  files.map((file, index) => (
                    <Card key={index} className="bg-secondary/30">
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <File size={18} className="text-primary" />
                          <span className="truncate max-w-[250px]">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index);
                          }}
                        >
                          <X size={16} />
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  existingFiles.map((file, index) => (
                    <Card key={index} className="bg-secondary/30">
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <File size={18} className="text-primary" />
                          <span className="truncate max-w-[250px]">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                            From previous session
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleSubmit} 
              className="gap-2"
              disabled={files.length === 0 && existingFiles.length > 0}
            >
              <Upload size={16} />
              {files.length > 0 ? "Process Files" : "Files Already Processed"}
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          No files uploaded yet. Please upload Excel files or a folder containing Excel files.
        </div>
      )}
    </div>
  );
}
