import TryNowDemo from '../TryNowDemo';

export default function TryNowDemoExample() {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Try Now Demo Component</h2>
      <TryNowDemo
        onStartDemo={() => {
          console.log('Demo started in example');
        }}
      />
    </div>
  );
}