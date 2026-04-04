'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/theme-context';
import { MoreHorizontal, CheckCircle2, Circle } from 'lucide-react';
import {
  BarChart3,
  Calculator,
  Users,
  AlertTriangle,
  Landmark,
  Route,
  ListChecks
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CATEGORIES, getSectionsByCategory, Category } from '@/lib/decision-memo/personal-section-map';
import { PdfMemoData } from '@/lib/pdf/pdf-types';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'ChartBar': BarChart3,
  'Calculator': Calculator,
  'Users': Users,
  'AlertTriangle': AlertTriangle,
  'Landmark': Landmark,
  'Route': Route,
  'ListChecks': ListChecks,
};

interface PersonalMobileNavProps {
  memoData: PdfMemoData;
  activeSection: string;
  viewedSections: Set<string>;
  onSectionChange: (sectionId: string) => void;
}

export default function PersonalMobileNav({
  memoData,
  activeSection,
  viewedSections,
  onSectionChange
}: PersonalMobileNavProps) {
  const { theme } = useTheme();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Filter visible categories (those with sections)
  const visibleCategories = CATEGORIES.filter(category => {
    const sections = getSectionsByCategory(category.id, memoData);
    return sections.length > 0;
  });

  // Split into main (first 3) and more (rest)
  const mainCategories = visibleCategories.slice(0, 3);
  const moreCategories = visibleCategories.slice(3);

  // Find which category contains the active section
  const activeCategoryId = visibleCategories.find(cat => {
    const sections = getSectionsByCategory(cat.id, memoData);
    return sections.some(s => s.id === activeSection);
  })?.id;

  const handleCategoryClick = (categoryId: Category['id']) => {
    // If clicking the active category, navigate to its first section
    const sections = getSectionsByCategory(categoryId, memoData);
    if (sections.length > 0) {
      onSectionChange(sections[0].id);
    }
  };

  const renderCategoryButton = (category: Category, isInMore: boolean = false) => {
    const sections = getSectionsByCategory(category.id, memoData);
    const IconComponent = ICON_MAP[category.icon];
    const isActive = activeCategoryId === category.id;

    if (isInMore) {
      // Render as dropdown menu item
      return (
        <DropdownMenuItem
          key={category.id}
          onClick={() => handleCategoryClick(category.id)}
          className="flex items-center justify-between space-x-3 py-3"
        >
          <div className="flex items-center space-x-3">
            {IconComponent && (
              <IconComponent className={cn("h-5 w-5", isActive && 'text-primary')} />
            )}
            <span className={cn("font-medium", isActive && 'text-primary')}>
              {category.title}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {sections.filter(s => viewedSections.has(s.id)).length}/{sections.length}
          </div>
        </DropdownMenuItem>
      );
    }

    // Render as bottom nav button (matches SidebarNavigation exactly)
    return (
      <Button
        key={category.id}
        variant="ghost"
        size="sm"
        className={cn(
          "flex flex-col items-center justify-center min-w-[52px] h-12 px-1.5 py-1 hover:bg-muted rounded-lg group",
          theme === 'dark' && "hover:text-white"
        )}
        onClick={() => handleCategoryClick(category.id)}
      >
        {IconComponent && (
          <IconComponent
            className={cn(
              "h-5 w-5 mb-0.5 flex-shrink-0",
              isActive && 'text-primary',
              theme === 'dark' && !isActive && "group-hover:text-white"
            )}
          />
        )}
        <span className={cn(
          "text-[9px] font-medium leading-tight text-center",
          isActive && 'text-primary',
          theme === 'dark' && !isActive && "group-hover:text-white"
        )}>
          {category.title.split(' ')[0]}
        </span>
      </Button>
    );
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-xl">
      <div className="flex items-center justify-between px-3 py-1.5 safe-area-pb">
        {/* Main 3 categories */}
        {mainCategories.map(cat => renderCategoryButton(cat, false))}

        {/* More button (matches SidebarNavigation exactly) */}
        {moreCategories.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex flex-col items-center justify-center min-w-[52px] h-12 px-1.5 py-1 hover:bg-muted rounded-lg group",
                  theme === 'dark' && "hover:text-white"
                )}
              >
                <MoreHorizontal className={cn(
                  "h-5 w-5 mb-0.5 flex-shrink-0",
                  theme === 'dark' && "group-hover:text-white"
                )} />
                <span className={cn(
                  "text-[9px] font-medium leading-tight text-center",
                  theme === 'dark' && "group-hover:text-white"
                )}>
                  More
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mb-2">
              {moreCategories.map(cat => renderCategoryButton(cat, true))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
