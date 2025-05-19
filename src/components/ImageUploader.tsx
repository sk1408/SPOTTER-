
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, X, Image, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

export function ImageUploader() {
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<{
    legal: boolean;
    confidence: number;
    patterns: string[];
  } | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setImage(reader.result as string);
          setAnalysisResult(null); // Reset previous analysis
        };
        reader.readAsDataURL(file);
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
    
    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setImage(reader.result as string);
          setAnalysisResult(null); // Reset previous analysis
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeImage = () => {
    setImage(null);
    setAnalysisResult(null);
  };

  const analyzeImage = () => {
    if (!image) return;
    
    setAnalyzing(true);
    toast({
      title: "Analysis Started",
      description: "Analyzing chart pattern for trading legality...",
    });

    // Simulate AI analysis - in a real app, this would call an API
    setTimeout(() => {
      // This is a mock analysis - in a real app, you would use actual AI analysis
      const randomLegal = Math.random() > 0.5;
      const randomConfidence = 0.7 + (Math.random() * 0.25);
      
      const patterns = randomLegal 
        ? ['Normal price volatility', 'Regular trading volume', 'Continuous price movement'] 
        : ['Suspicious price spike before news', 'Abnormal trading volume', 'Irregular price patterns'];
      
      setAnalysisResult({
        legal: randomLegal,
        confidence: randomConfidence,
        patterns: patterns,
      });
      
      toast({
        title: "Analysis Complete",
        description: `The chart shows ${randomLegal ? 'legal' : 'potentially illegal'} trading patterns.`,
        variant: randomLegal ? "default" : "destructive",
      });
      
      setAnalyzing(false);
    }, 2500);
  };

  return (
    <div className="space-y-4">
      {!image ? (
        <div 
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors
            ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/50'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('image-upload')?.click()}
        >
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          <div className="flex flex-col items-center gap-2">
            <Image size={40} className="text-muted-foreground" />
            <p className="font-medium">Click to upload or drag and drop</p>
            <p className="text-sm text-muted-foreground">PNG, JPG, or GIF (max 10MB)</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <div className="rounded-md overflow-hidden border shadow-sm">
              <img src={image} alt="Uploaded chart" className="w-full h-auto max-h-[500px] object-contain" />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="absolute top-2 right-2 bg-white dark:bg-black rounded-full"
              onClick={removeImage}
            >
              <X size={16} />
            </Button>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={analyzeImage}
              disabled={analyzing}
              className="gap-2"
            >
              {analyzing ? (
                <>
                  <span className="animate-spin inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full" aria-hidden="true"></span>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <AlertCircle size={16} />
                  <span>Analyze Trading Pattern</span>
                </>
              )}
            </Button>
          </div>
          
          {analysisResult && (
            <>
              <Separator />
              
              <Alert variant={analysisResult.legal ? "default" : "destructive"}>
                {analysisResult.legal ? 
                  <CheckCircle className="h-4 w-4" /> : 
                  <AlertCircle className="h-4 w-4" />}
                <AlertTitle>
                  {analysisResult.legal 
                    ? "Legal Trading Pattern Detected" 
                    : "Potential Illegal Trading Pattern"}
                </AlertTitle>
                <AlertDescription>
                  <div className="space-y-2 mt-2">
                    <p>
                      <span className="font-medium">Confidence:</span> {Math.round(analysisResult.confidence * 100)}%
                    </p>
                    <div>
                      <span className="font-medium">Detected patterns:</span>
                      <ul className="list-disc pl-5 mt-1">
                        {analysisResult.patterns.map((pattern, index) => (
                          <li key={index}>{pattern}</li>
                        ))}
                      </ul>
                    </div>
                    {!analysisResult.legal && (
                      <p className="text-sm italic mt-1">
                        This chart shows potential market manipulation indicators. 
                        Consider further investigation.
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            </>
          )}
        </div>
      )}
    </div>
  );
}
