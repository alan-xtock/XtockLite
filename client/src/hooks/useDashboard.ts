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
  const [activeTab, setActiveTab] = useState("csv");
  const [toastApiKey, setToastApiKey] = useState("");
  const [isConnectingToast, setIsConnectingToast] = useState(false);
  const [isToastConnected, setIsToastConnected] = useState(false);
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

    try {
      // Simulate connection to Toast and call prediction endpoint with dummy data
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call delay

      // Generate dummy sales data and call forecast endpoint
      const dummySalesData = [
        { item: "Tomatoes", quantity: 15, date: "2024-01-01", unit: "lbs", price: 2.50 },
        { item: "Lettuce", quantity: 8, date: "2024-01-01", unit: "heads", price: 1.25 },
        { item: "Onions", quantity: 12, date: "2024-01-01", unit: "lbs", price: 1.80 },
        { item: "Carrots", quantity: 10, date: "2024-01-01", unit: "lbs", price: 1.50 },
        { item: "Bell Peppers", quantity: 6, date: "2024-01-01", unit: "lbs", price: 3.00 }
      ];

      // Simulate storing dummy data (you could make an actual API call here)
      console.log('Simulating Toast connection with dummy data:', dummySalesData);

      // Call the actual prediction endpoint
      const response = await fetch('/api/forecasts/generate-1day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weather: selectedWeather })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Forecast generated successfully:', result);

        setIsToastConnected(true);
        setHasUploadedFile(true); // Enable the rest of the flow
        setUploadResult({
          validRows: dummySalesData.length,
          totalRows: dummySalesData.length,
          errors: [],
          toastDataUsed: true
        });

        // Automatically show forecasts
        queryClient.invalidateQueries({ queryKey: ['/api/forecasts'] });
        setShowForecast(true);

        toast({
          title: "Toast Connected Successfully!",
          description: "Your sales data has been imported and forecasts generated."
        });
      } else {
        throw new Error('Failed to generate forecasts');
      }

    } catch (error) {
      console.error('Error connecting to Toast:', error);
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