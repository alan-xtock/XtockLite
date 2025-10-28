import { useState } from 'react';
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useDashboard() {
  const [hasUploadedFile, setHasUploadedFile] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const [showOrder, setShowOrder] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [isGeneratingForecast, setIsGeneratingForecast] = useState(false);
  const [selectedWeather, setSelectedWeather] = useState<"sunny" | "cloudy" | "rainy">("cloudy");
  const [activeTab, setActiveTab] = useState("toast");
  const [toastApiKey, setToastApiKey] = useState("");
  const [isConnectingToast, setIsConnectingToast] = useState(false);
  const [isToastConnected, setIsToastConnected] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0); // 0 = not started, 1 = connecting, 2 = importing data, 3 = generating forecasts, 4 = complete
  const { toast } = useToast();

  // Fetch real sales data
  const { data: salesData } = useQuery({
    queryKey: ['/api/sales-data'],
    enabled: hasUploadedFile || isToastConnected
  });

  // Fetch real forecasts
  const { data: forecasts, isLoading: forecastsLoading } = useQuery({
    queryKey: ['/api/forecasts'],
    enabled: showForecast
  });

  // Generate forecasts mutation - use TRUE 1-day endpoint
  const generateForecastMutation = useMutation({
    mutationFn: async (params: { weather?: "sunny" | "cloudy" | "rainy" }) => {
      const response = await fetch('/api/forecasts/generate-1day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (!response.ok) throw new Error('Failed to generate forecasts');
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Forecast generation successful:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/forecasts'] });
      setShowForecast(true);
      setIsGeneratingForecast(false);
      toast({ title: "Forecasts generated successfully" });
    },
    onError: (error: any) => {
      console.log('Forecast generation failed:', error);
      setIsGeneratingForecast(false);
      toast({
        title: "Failed to generate forecasts",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleUploadStart = () => {
    // Don't set generating forecast during upload
    // Only set it when user clicks the forecast button
  };

  const handleFileUpload = (result: any) => {
    console.log('Upload completed:', result);
    setUploadResult(result);
    setHasUploadedFile(true);
    setIsGeneratingForecast(false); // Ensure button is visible after upload

    // Don't auto-generate forecasts - let user click the button instead
    // This prevents getting stuck in generating state
  };

  const handleGenerateForecast = () => {
    console.log('Generate forecast button clicked');
    setIsGeneratingForecast(true);
    generateForecastMutation.mutate({
      weather: selectedWeather
    });
  };

  const handleGenerateOrder = () => {
    console.log('Generate order triggered');
    setShowOrder(true);
  };

  const handleConnectToast = async () => {
    if (!toastApiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Toast API key",
        variant: "destructive"
      });
      return;
    }

    setIsConnectingToast(true);
    setLoadingProgress(0);

    try {
      // Step 1: Connecting to Toast (1.5s)
      setLoadingProgress(1);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 2: Importing sales data (1.5s)
      setLoadingProgress(2);
      const dummySalesData = [
        { item: "Tomatoes", quantity: 15, date: "2024-01-01", unit: "lbs", price: 2.50 },
        { item: "Lettuce", quantity: 8, date: "2024-01-01", unit: "heads", price: 1.25 },
        { item: "Onions", quantity: 12, date: "2024-01-01", unit: "lbs", price: 1.80 },
        { item: "Carrots", quantity: 10, date: "2024-01-01", unit: "lbs", price: 1.50 },
        { item: "Bell Peppers", quantity: 6, date: "2024-01-01", unit: "lbs", price: 3.00 }
      ];

      setIsToastConnected(true);
      setHasUploadedFile(true);
      setUploadResult({
        validRows: dummySalesData.length,
        totalRows: dummySalesData.length,
        errors: [],
        toastDataUsed: true
      });

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 3: Generating forecasts (2s)
      setLoadingProgress(3);
      console.log('Simulating Toast connection with dummy data:', dummySalesData);

      const response = await fetch('/api/forecasts/generate-1day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weather: selectedWeather })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Forecast generated successfully:', result);

        // Automatically show forecasts
        queryClient.invalidateQueries({ queryKey: ['/api/forecasts'] });
        setShowForecast(true);

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 4: Complete
        setLoadingProgress(4);

        toast({
          title: "Toast Connected Successfully!",
          description: "Your sales data has been imported and forecasts generated."
        });
      } else {
        throw new Error('Failed to generate forecasts');
      }

    } catch (error) {
      console.error('Error connecting to Toast:', error);
      setLoadingProgress(0);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Toast. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConnectingToast(false);
    }
  };

  return {
    // State
    hasUploadedFile,
    showForecast,
    showOrder,
    uploadResult,
    isGeneratingForecast,
    selectedWeather,
    activeTab,
    toastApiKey,
    isConnectingToast,
    isToastConnected,
    loadingProgress,
    salesData,
    forecasts,
    forecastsLoading,

    // Actions
    setSelectedWeather,
    setActiveTab,
    setToastApiKey,
    handleUploadStart,
    handleFileUpload,
    handleGenerateForecast,
    handleGenerateOrder,
    handleConnectToast
  };
}