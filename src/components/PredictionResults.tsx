
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface SerializedFile {
  name: string;
  type: string;
  size: number;
  lastModified: number;
}

interface PredictionResultsProps {
  modelTrained: boolean;
  files: File[];
  serializedFiles?: SerializedFile[];
  onPredictions: (data: any) => void;
  existingPredictions?: any;
}

export function PredictionResults({ 
  modelTrained, 
  files, 
  serializedFiles = [],
  onPredictions, 
  existingPredictions = null 
}: PredictionResultsProps) {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [predictedData, setPredictedData] = useState<any[] | null>(existingPredictions);

  useEffect(() => {
    if (existingPredictions && !predictedData) {
      setPredictedData(existingPredictions);
    }
  }, [existingPredictions]);

  // Mock prediction function - in a real app, this would call Python backend
  const generatePredictions = () => {
    if (!modelTrained) {
      toast({
        variant: "destructive",
        title: "Model not trained",
        description: "Please train the model first",
      });
      return;
    }

    if (!selectedFile) {
      toast({
        variant: "destructive", 
        title: "No file selected",
        description: "Please select a file for prediction",
      });
      return;
    }

    setLoading(true);

    // Simulate prediction process
    setTimeout(() => {
      // Generate mock data for the chart
      const mockData = [];
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 100);

      for (let i = 0; i < 100; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        const dateStr = currentDate.toISOString().split('T')[0];
        const actualValue = 100 + Math.sin(i/10) * 20 + i/5 + Math.random() * 5;
        
        let predictedValue = null;
        // Only add predictions for the last 20 days
        if (i >= 80) {
          predictedValue = actualValue + (Math.random() - 0.5) * 10;
        }
        
        mockData.push({
          date: dateStr,
          actual: parseFloat(actualValue.toFixed(2)),
          predicted: predictedValue ? parseFloat(predictedValue.toFixed(2)) : null
        });
      }

      setPredictedData(mockData);
      onPredictions(mockData);
      setLoading(false);
    }, 1500);
  };

  // Determine if we have files to work with
  const hasFiles = files.length > 0 || serializedFiles.length > 0;
  const availableFiles = files.length > 0 ? files : serializedFiles.map(sf => ({ name: sf.name }));

  return (
    <div className="space-y-6">
      {!modelTrained ? (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Model not trained</AlertTitle>
          <AlertDescription>
            Please train the LSTM model before generating predictions.
          </AlertDescription>
        </Alert>
      ) : !hasFiles ? (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No files available</AlertTitle>
          <AlertDescription>
            Please upload Excel files with market data.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Dataset</label>
                <Select
                  value={selectedFile}
                  onValueChange={setSelectedFile}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select file for prediction" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFiles.map((file: any, index: number) => (
                      <SelectItem key={index} value={file.name}>
                        {file.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={generatePredictions} 
                disabled={loading || !selectedFile}
                className="gap-2"
              >
                <TrendingUp size={16} />
                {loading ? "Generating..." : "Generate Predictions"}
              </Button>
            </div>

            {predictedData && (
              <>
                <Separator className="my-6" />
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Prediction Results</h3>
                    {existingPredictions && !loading && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Restored from previous session
                      </span>
                    )}
                  </div>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={predictedData}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={(value) => {
                                const date = new Date(value);
                                return `${date.getMonth()+1}/${date.getDate()}`;
                              }}
                              tick={{ fontSize: 12 }}
                            />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip 
                              formatter={(value: number) => [`$${value.toFixed(2)}`, undefined]}
                              labelFormatter={(label) => `Date: ${label}`}
                            />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="actual" 
                              stroke="hsl(var(--primary))" 
                              strokeWidth={2}
                              dot={false} 
                              name="Actual"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="predicted" 
                              stroke="#ff6b6b" 
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }} 
                              name="Predicted"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h4 className="font-medium">Prediction Statistics</h4>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Prediction Period:</span>
                              <span>20 days</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Mean Absolute Error:</span>
                              <span>2.34</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Direction Accuracy:</span>
                              <span>76.5%</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h4 className="font-medium">Market Trend Analysis</h4>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Current Trend:</span>
                              <span className="text-green-600 font-medium">Bullish</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Confidence:</span>
                              <span>82%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Support Level:</span>
                              <span>$98.76</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Resistance Level:</span>
                              <span>$124.35</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
