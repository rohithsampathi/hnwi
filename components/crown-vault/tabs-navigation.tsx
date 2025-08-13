interface TabsNavigationProps {
  activeTab: 'summary' | 'assets' | 'heirs' | 'activity';
  setActiveTab: (tab: 'summary' | 'assets' | 'heirs' | 'activity') => void;
}

export function TabsNavigation({ activeTab, setActiveTab }: TabsNavigationProps) {
  const tabs = [
    { id: 'summary' as const, label: 'Summary' },
    { id: 'assets' as const, label: 'Assets' },
    { id: 'heirs' as const, label: 'Heirs' },
    { id: 'activity' as const, label: 'Activity' }
  ];

  return (
    <div className="flex flex-wrap justify-center gap-1 sm:gap-2 p-1 bg-muted/30 rounded-full max-w-fit mx-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => {
            setActiveTab(tab.id);
          }}
          className={`flex-1 sm:flex-initial px-2 sm:px-4 md:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-full transition-all duration-300 whitespace-nowrap ${
            activeTab === tab.id
              ? 'bg-primary text-white shadow-lg'
              : 'bg-background text-foreground/70 hover:text-foreground hover:bg-background/80'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}