import ForecastCard from '../ForecastCard';

export default function ForecastCardExample() {
  const mockItems = [
    {
      item: "Organic Tomatoes",
      currentStock: 45,
      predicted: 60,
      confidence: 94,
      savings: 23.50
    },
    {
      item: "Fresh Lettuce",
      currentStock: 30,
      predicted: 25,
      confidence: 87,
      savings: 15.75
    },
    {
      item: "Red Peppers",
      currentStock: 20,
      predicted: 35,
      confidence: 91,
      savings: 18.25
    }
  ];

  return (
    <div className="p-4">
      <ForecastCard
        date="Tomorrow"
        items={mockItems}
        totalSavings={57.50}
        onGenerateOrder={() => {
          console.log('Generate order triggered in example');
        }}
      />
    </div>
  );
}