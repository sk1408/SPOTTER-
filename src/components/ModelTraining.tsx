
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface SerializedFile {
  name: string;
  type: string;
  size: number;
  lastModified: number;
}

interface ModelTrainingProps {
  files: File[];
  serializedFiles?: SerializedFile[];
  onModelTrained: (success: boolean) => void;
  isModelTrained?: boolean;
}

export function ModelTraining({ files, serializedFiles = [], onModelTrained, isModelTrained = false }: ModelTrainingProps) {
  const { toast } = useToast();
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [trainingStatus, setTrainingStatus] = useState<'idle' | 'training' | 'success' | 'error'>(
    isModelTrained ? 'success' : 'idle'
  );
  const [trainingMetrics, setTrainingMetrics] = useState<{ loss: number, val_loss: number } | null>(
    isModelTrained ? { loss: 0.0023, val_loss: 0.0031 } : null
  );
  
  // Set initial state based on whether model is already trained
  useEffect(() => {
    if (isModelTrained && trainingStatus === 'idle') {
      setTrainingStatus('success');
      setTrainingMetrics({ loss: 0.0023, val_loss: 0.0031 });
    }
  }, [isModelTrained]);
  
  // Mock training function - in a real app, this would call Python backend
  const trainModel = () => {
    if (files.length === 0 && serializedFiles.length === 0) {
      toast({
        variant: "destructive",
        title: "No files available",
        description: "Please upload data files first",
      });
      return;
    }

    setIsTraining(true);
    setTrainingStatus('training');
    setProgress(0);

    // Simulate training process
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          setTrainingStatus('success');
          setTrainingMetrics({ loss: 0.0023, val_loss: 0.0031 });
          onModelTrained(true);
          return 100;
        }
        return newProgress;
      });
    }, 500);
  };

  const renderTrainingStatus = () => {
    switch (trainingStatus) {
      case 'training':
        return (
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertTitle>Training in progress</AlertTitle>
            <AlertDescription>
              The LSTM model is being trained with your data. This may take a few minutes...
            </AlertDescription>
          </Alert>
        );
      case 'success':
        return (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Training Complete</AlertTitle>
            <AlertDescription>
              Your model has been successfully trained and saved.
            </AlertDescription>
          </Alert>
        );
      case 'error':
        return (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Training Error</AlertTitle>
            <AlertDescription>
              There was an error during model training. Please check your data and try again.
            </AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  const hasFiles = files.length > 0 || serializedFiles.length > 0;

  return (
    <div className="space-y-6">
      {!hasFiles ? (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No files uploaded</AlertTitle>
          <AlertDescription>
            Please upload Excel files with market data before training the model.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertTitle>Ready to train</AlertTitle>
            <AlertDescription>
              {files.length > 0 
                ? `${files.length} file(s) available for training.` 
                : `${serializedFiles.length} previously uploaded file(s) available.`
              } Each file should contain Date and Close columns.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Model Configuration</h3>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Model Type:</span>
                      <span>LSTM (Long Short-Term Memory)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Input Timesteps:</span>
                      <span>30</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Layers:</span>
                      <span>LSTM + Dropout + LSTM + Dropout + Dense</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Optimizer:</span>
                      <span>Adam</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Training Parameters</h3>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Epochs:</span>
                      <span>50</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Batch Size:</span>
                      <span>32</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Validation Split:</span>
                      <span>20%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Learning Rate:</span>
                      <span>0.001</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {trainingStatus === 'training' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Training Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {trainingMetrics && trainingStatus === 'success' && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Training Results</h3>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Training Loss:</span>
                      <span>{trainingMetrics.loss.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Validation Loss:</span>
                      <span>{trainingMetrics.val_loss.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Model Saved:</span>
                      <span>trained_model.h5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Scaler Saved:</span>
                      <span>scaler.pkl</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {renderTrainingStatus()}

          <div className="flex justify-end">
            <Button 
              onClick={trainModel} 
              disabled={isTraining || !hasFiles || (trainingStatus === 'success' && !isTraining)}
              className="gap-2"
            >
              <TrendingUp size={16} />
              {isTraining ? "Training..." : trainingStatus === 'success' ? "Model Trained" : "Train LSTM Model"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
