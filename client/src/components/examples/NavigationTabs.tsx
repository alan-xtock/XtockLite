import NavigationTabs from '../NavigationTabs';

export default function NavigationTabsExample() {
  return (
    <div className="h-20 relative">
      <NavigationTabs
        activeTab="dashboard"
        onTabChange={(tab) => {
          console.log('Tab changed in example:', tab);
        }}
      />
    </div>
  );
}