import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { FileUploader } from '@/components/FileUploader';
import { ModelTraining } from '@/components/ModelTraining';
import { PredictionResults } from '@/components/PredictionResults';
import { ImageUploader } from '@/components/ImageUploader';
import { BarChart3, TrendingUp, Upload, ChartLine, Trash2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { saveToLocalStorage, getFromLocalStorage, removeFromLocalStorage } from '@/utils/storageUtils';

// Storage keys
const STORAGE_KEYS = {
  UPLOADED_FILES: 'market_prediction_uploaded_files',
  MODEL_TRAINED: 'market_prediction_model_trained',
  PREDICTIONS: 'market_prediction_predictions',
};

// Helper function to create a serializable version of File objects
const serializeFile = (file: File): SerializedFile => ({
  name: file.name,
  type: file.type,
  size: file.size,
  lastModified: file.lastModified,
  // We can't store the actual file data in localStorage, but we can keep metadata
});

// Interface for serialized file data
interface SerializedFile {
  name: string;
  type: string;
  size: number;
  lastModified: number;
}

const Index = () => {
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [serializedFiles, setSerializedFiles] = useState<SerializedFile[]>([]);
  const [modelTrained, setModelTrained] = useState<boolean>(false);
  const [predictions, setPredictions] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("upload");

  // Load persisted data on component mount
  useEffect(() => {
    const savedModelTrained = getFromLocalStorage<boolean>(STORAGE_KEYS.MODEL_TRAINED);
    if (savedModelTrained !== null) {
      setModelTrained(savedModelTrained);
    }

    const savedPredictions = getFromLocalStorage<any>(STORAGE_KEYS.PREDICTIONS);
    if (savedPredictions) {
      setPredictions(savedPredictions);
    }

    const savedFiles = getFromLocalStorage<SerializedFile[]>(STORAGE_KEYS.UPLOADED_FILES);
    if (savedFiles) {
      setSerializedFiles(savedFiles);
      // We can't restore actual File objects from localStorage,
      // but we can keep the metadata for display purposes
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.MODEL_TRAINED, modelTrained);
  }, [modelTrained]);

  useEffect(() => {
    if (predictions) {
      saveToLocalStorage(STORAGE_KEYS.PREDICTIONS, predictions);
    }
  }, [predictions]);

  useEffect(() => {
    if (uploadedFiles.length > 0) {
      const serialized = uploadedFiles.map(file => serializeFile(file));
      setSerializedFiles(serialized);
      saveToLocalStorage(STORAGE_KEYS.UPLOADED_FILES, serialized);
    }
  }, [uploadedFiles]);

  const handleFilesUploaded = (files: File[]) => {
    setUploadedFiles(files);
    toast({
      title: "Files Uploaded",
      description: `Successfully uploaded ${files.length} file(s)`,
    });
  };

  const handleModelTrained = (success: boolean) => {
    setModelTrained(success);
    if (success) {
      toast({
        title: "Model Trained",
        description: "LSTM model was successfully trained and saved",
      });
    }
  };

  const handlePredictions = (data: any) => {
    setPredictions(data);
    toast({
      title: "Predictions Generated",
      description: "Market trend predictions are ready",
    });
  };

  const clearUploadedFiles = () => {
    setUploadedFiles([]);
    setSerializedFiles([]);
    removeFromLocalStorage(STORAGE_KEYS.UPLOADED_FILES);
    toast({
      title: "Data Cleared",
      description: "All uploaded files have been removed",
    });
  };

  const clearTrainedModel = () => {
    setModelTrained(false);
    removeFromLocalStorage(STORAGE_KEYS.MODEL_TRAINED);
    toast({
      title: "Model Cleared",
      description: "Trained model data has been reset",
    });
  };

  const clearPredictions = () => {
    setPredictions(null);
    removeFromLocalStorage(STORAGE_KEYS.PREDICTIONS);
    toast({
      title: "Predictions Cleared",
      description: "All prediction data has been reset",
    });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-market-gradient min-h-screen">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Market Trend Prediction Tool</h1>
            <p className="text-muted-foreground mt-2">
              Upload market data, train LSTM models, and visualize predictions
            </p>
          </div>
          <div className="bg-primary/10 px-4 py-2 rounded-md">
            <span className="text-sm font-medium">Web Application v1.0</span>
          </div>
        </div>
        
        <Separator />
        
        <Tabs defaultValue="upload" className="w-full" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload size={18} />
              <span>Upload Data</span>
            </TabsTrigger>
            <TabsTrigger value="train" className="flex items-center gap-2">
              <BarChart3 size={18} />
              <span>Train Model</span>
            </TabsTrigger>
            <TabsTrigger value="predict" className="flex items-center gap-2">
              <TrendingUp size={18} />
              <span>View Predictions</span>
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center gap-2">
              <ChartLine size={18} />
              <span>Analyze Chart</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Upload Excel Datasets</CardTitle>
                  <CardDescription>
                    Upload .xlsx or .xls files containing market data with Date and Close columns
                  </CardDescription>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={clearUploadedFiles}
                >
                  <Trash2 size={16} />
                  Clear Files
                </Button>
              </CardHeader>
              <CardContent>
                <FileUploader 
                  onFilesUploaded={handleFilesUploaded} 
                  existingFiles={serializedFiles}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="train">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Train LSTM Model</CardTitle>
                  <CardDescription>
                    Train a deep learning model on your uploaded market data
                  </CardDescription>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={clearTrainedModel}
                >
                  <Trash2 size={16} />
                  Reset Model
                </Button>
              </CardHeader>
              <CardContent>
                <ModelTraining 
                  files={uploadedFiles}
                  serializedFiles={serializedFiles}
                  onModelTrained={handleModelTrained}
                  isModelTrained={modelTrained}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predict">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Prediction Results</CardTitle>
                  <CardDescription>
                    View market trend predictions based on your trained model
                  </CardDescription>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={clearPredictions}
                >
                  <Trash2 size={16} />
                  Clear Results
                </Button>
              </CardHeader>
              <CardContent>
                <PredictionResults
                  modelTrained={modelTrained}
                  files={uploadedFiles}
                  serializedFiles={serializedFiles}
                  onPredictions={handlePredictions}
                  existingPredictions={predictions}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="image">
            <Card>
              <CardHeader>
                <CardTitle>Chart Pattern Analysis</CardTitle>
                <CardDescription>
                  Upload chart images and analyze them for legal/illegal trading patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUploader />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
