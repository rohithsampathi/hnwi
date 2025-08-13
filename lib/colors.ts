// lib/colors.ts
// Centralized Color System using 60-30-10 Principle
// 60% = Tertiary (dominant background colors)
// 30% = Secondary (supporting elements, cards, sections)
// 10% = Primary (accent colors, CTAs, focus elements)

export const colors = {
  dark: {
    // PRIMARY (10%) - Gold accents
    primary: {
      main: '#DAA520',    // Dark Goldenrod
      light: '#FFD700',   // Gold
      dark: '#B8860B',    // Darker gold
      50: '#FFF9E6',      // Very light gold tint
      100: '#FFEC99',     // Light gold tint
      200: '#FFE066',     // Medium gold tint
      300: '#FFD700',     // Pure gold
      400: '#E6C200',     // Slightly darker gold
      500: '#DAA520',     // Main gold
      600: '#CC9900',     // Dark gold
      700: '#B8860B',     // Darker gold
      800: '#996F00',     // Very dark gold
      900: '#805C00',     // Darkest gold
    },
    
    // SECONDARY (30%) - Dark grays for cards and supporting elements
    secondary: {
      50: '#4a4a4a',      // Lightest dark gray
      100: '#3a3a3a',     // Light dark gray
      200: '#2a2a2a',     // Medium dark gray
      300: '#252525',     // Darker gray
      400: '#202020',     // Very dark gray
      500: '#1a1a1a',     // Main dark gray
      600: '#151515',     // Darker
      700: '#101010',     // Much darker
      800: '#0a0a0a',     // Very dark
      900: '#050505',     // Almost black
    },
    
    // TERTIARY (60%) - Black backgrounds
    tertiary: {
      50: '#1a1a1a',      // Lightest black
      100: '#151515',     // Light black
      200: '#101010',     // Medium black
      300: '#0a0a0a',     // Dark black
      400: '#050505',     // Very dark black
      500: '#000000',     // Pure black
      600: '#000000',     // Pure black
      700: '#000000',     // Pure black
      800: '#000000',     // Pure black
      900: '#000000',     // Pure black
    },
    
    // Text colors
    text: {
      primary: '#ffffff',     // White text
      secondary: '#e0e0e0',   // Light gray text
      tertiary: '#b0b0b0',    // Medium gray text
      muted: '#808080',       // Muted gray text
    }
  },
  
  light: {
    // PRIMARY (10%) - Platinum accents
    primary: {
      main: '#C0C0C0',    // Silver
      light: '#E5E5E5',   // Light silver
      dark: '#A8A8A8',    // Dark silver
      50: '#F8F8F8',      // Very light platinum tint
      100: '#F0F0F0',     // Light platinum tint
      200: '#E8E8E8',     // Medium platinum tint
      300: '#E0E0E0',     // Pure platinum
      400: '#D8D8D8',     // Slightly darker platinum
      500: '#C0C0C0',     // Main platinum
      600: '#B8B8B8',     // Dark platinum
      700: '#A8A8A8',     // Darker platinum
      800: '#989898',     // Very dark platinum
      900: '#888888',     // Darkest platinum
    },
    
    // SECONDARY (30%) - Light grays for cards and supporting elements  
    secondary: {
      50: '#fafafa',      // Very light gray
      100: '#f8f8f8',     // Light gray
      200: '#f5f5f5',     // Medium light gray
      300: '#f0f0f0',     // Darker light gray
      400: '#e8e8e8',     // Medium gray
      500: '#e0e0e0',     // Main gray
      600: '#d8d8d8',     // Darker gray
      700: '#d0d0d0',     // Much darker gray
      800: '#c8c8c8',     // Dark gray
      900: '#c0c0c0',     // Darkest gray
    },
    
    // TERTIARY (60%) - White backgrounds
    tertiary: {
      50: '#ffffff',      // Pure white
      100: '#fefefe',     // Almost white
      200: '#fcfcfc',     // Very light
      300: '#fafafa',     // Light
      400: '#f8f8f8',     // Medium light
      500: '#f5f5f5',     // Main white
      600: '#f0f0f0',     // Darker white
      700: '#e8e8e8',     // Much darker
      800: '#e0e0e0',     // Dark
      900: '#d8d8d8',     // Darkest
    },
    
    // Text colors
    text: {
      primary: '#1a1a1a',     // Dark text
      secondary: '#2a2a2a',   // Medium dark text
      tertiary: '#4a4a4a',    // Light dark text
      muted: '#6a6a6a',       // Muted text
    }
  }
} as const;

export type ColorTheme = 'light' | 'dark';
export type ColorScale = 'primary' | 'secondary' | 'tertiary';
export type ColorShade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 'main' | 'light' | 'dark';

// Helper function to get color value
export const getColor = (theme: ColorTheme, scale: ColorScale, shade: ColorShade = 500) => {
  return colors[theme][scale][shade as keyof typeof colors[typeof theme][typeof scale]];
};

// Centralized card styling
export const getCardStyle = (theme: ColorTheme) => {
  return {
    dark: {
      background: colors.dark.secondary[200], // Dark gray for cards
      color: colors.dark.text.primary,
      titleColor: colors.dark.primary.main, // Gold for titles
      boxShadow: "none"
    },
    light: {
      background: colors.light.secondary[300], // Light gray for cards  
      color: colors.light.text.primary,
      titleColor: "#000000", // Black for titles in light mode
      boxShadow: "none"
    }
  }[theme];
};

// Get card background colors using HSL
export const getCardColors = (theme: ColorTheme) => {
  return {
    dark: "hsl(0, 0%, 17%)", // Dark gray secondary color
    light: "hsl(0, 0%, 94%)" // Light gray secondary color
  }[theme];
};

// Centralized Card Styling System
export const getMetallicCardStyle = (theme: ColorTheme) => {
  return {
    className: "rounded-3xl cursor-pointer transition-all duration-300 hover:scale-[1.02] relative overflow-hidden",
    style: {
      background: theme === "dark" 
        ? "linear-gradient(135deg, #1f1f1f 0%, #2a2a2a 25%, #1a1a1a 50%, #2a2a2a 75%, #1f1f1f 100%)"
        : "linear-gradient(135deg, #f8f8f8 0%, #e0e0e0 25%, #ffffff 50%, #e0e0e0 75%, #f8f8f8 100%)",
      border: theme === "dark" 
        ? "2px solid rgba(255, 255, 255, 0.1)" 
        : "2px solid rgba(0, 0, 0, 0.1)",
      boxShadow: "none",
      backdropFilter: "blur(8px)",
      color: theme === "dark" ? "white" : "#1a1a1a",
    }
  };
};

export const getMatteCardStyle = (theme: ColorTheme) => {
  return {
    className: "rounded-xl transition-all duration-300",
    style: {
      background: getCardColors(theme),
      border: theme === "dark" 
        ? "1px solid rgba(255,255,255,0.05)"
        : "1px solid rgba(0,0,0,0.05)",
      boxShadow: "none"
    }
  };
};

// Centralized text color functions for better visibility
export const getVisibleTextColor = (theme: ColorTheme, type: 'primary' | 'heading' | 'accent' | 'icon' = 'primary') => {
  const colorMap = {
    dark: {
      primary: "text-primary",
      heading: "text-white", 
      accent: "text-primary",
      icon: "text-primary"
    },
    light: {
      primary: "text-black",
      heading: "text-black",
      accent: "text-black", 
      icon: "text-black"
    }
  };
  
  return colorMap[theme][type];
};

export const getVisibleIconColor = (theme: ColorTheme) => {
  return theme === "dark" ? "text-primary" : "text-black";
};

export const getVisibleHeadingColor = (theme: ColorTheme) => {
  return theme === "dark" ? "text-white" : "text-black";
};

export const getVisibleSubtextColor = (theme: ColorTheme) => {
  return theme === "dark" ? "text-gray-300" : "text-gray-700";
};

// Centralized subtle card style for inner elements
export const getSubtleCardStyle = (theme: ColorTheme) => {
  return {
    className: "rounded-xl transition-all duration-300 border-2",
    style: {
      background: theme === "dark" 
        ? "linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 50%, #2a2a2a 100%)"
        : "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 50%, #f5f5f5 100%)",
      border: theme === "dark" 
        ? "2px solid rgba(255,255,255,0.1)"
        : "2px solid rgba(0,0,0,0.1)",
      boxShadow: "none"
    }
  };
};

// CSS Custom Properties mapping
export const getCSSVariables = (theme: ColorTheme) => {
  const themeColors = colors[theme];
  
  return {
    // Primary colors (10% usage)
    '--color-primary-50': themeColors.primary[50],
    '--color-primary-100': themeColors.primary[100],
    '--color-primary-200': themeColors.primary[200],
    '--color-primary-300': themeColors.primary[300],
    '--color-primary-400': themeColors.primary[400],
    '--color-primary-500': themeColors.primary[500],
    '--color-primary-600': themeColors.primary[600],
    '--color-primary-700': themeColors.primary[700],
    '--color-primary-800': themeColors.primary[800],
    '--color-primary-900': themeColors.primary[900],
    '--color-primary': themeColors.primary.main,
    '--color-primary-light': themeColors.primary.light,
    '--color-primary-dark': themeColors.primary.dark,
    
    // Secondary colors (30% usage)
    '--color-secondary-50': themeColors.secondary[50],
    '--color-secondary-100': themeColors.secondary[100],
    '--color-secondary-200': themeColors.secondary[200],
    '--color-secondary-300': themeColors.secondary[300],
    '--color-secondary-400': themeColors.secondary[400],
    '--color-secondary-500': themeColors.secondary[500],
    '--color-secondary-600': themeColors.secondary[600],
    '--color-secondary-700': themeColors.secondary[700],
    '--color-secondary-800': themeColors.secondary[800],
    '--color-secondary-900': themeColors.secondary[900],
    
    // Tertiary colors (60% usage)
    '--color-tertiary-50': themeColors.tertiary[50],
    '--color-tertiary-100': themeColors.tertiary[100],
    '--color-tertiary-200': themeColors.tertiary[200],
    '--color-tertiary-300': themeColors.tertiary[300],
    '--color-tertiary-400': themeColors.tertiary[400],
    '--color-tertiary-500': themeColors.tertiary[500],
    '--color-tertiary-600': themeColors.tertiary[600],
    '--color-tertiary-700': themeColors.tertiary[700],
    '--color-tertiary-800': themeColors.tertiary[800],
    '--color-tertiary-900': themeColors.tertiary[900],
    
    // Text colors
    '--color-text-primary': themeColors.text.primary,
    '--color-text-secondary': themeColors.text.secondary,
    '--color-text-tertiary': themeColors.text.tertiary,
    '--color-text-muted': themeColors.text.muted,
  };
};