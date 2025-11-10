import { useTheme, useMediaQuery } from '@mui/material';

export const useResponsive = () => {
  const theme = useTheme();
  
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));
  
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isTabletOrDesktop = useMediaQuery(theme.breakpoints.up('sm'));
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeScreen,
    isMobileOrTablet,
    isTabletOrDesktop,
    breakpoint: isMobile ? 'mobile' : isTablet ? 'tablet' : isDesktop ? 'desktop' : 'large'
  };
};

export const useBreakpoint = () => {
  const theme = useTheme();
  
  const breakpoints = {
    xs: useMediaQuery(theme.breakpoints.only('xs')),
    sm: useMediaQuery(theme.breakpoints.only('sm')),
    md: useMediaQuery(theme.breakpoints.only('md')),
    lg: useMediaQuery(theme.breakpoints.only('lg')),
    xl: useMediaQuery(theme.breakpoints.only('xl')),
  };
  
  const currentBreakpoint = Object.keys(breakpoints).find(key => breakpoints[key]) || 'xs';
  
  return {
    ...breakpoints,
    current: currentBreakpoint
  };
};

export const useResponsiveValue = (values) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  if (typeof values === 'object' && values !== null) {
    if (isMobile && values.mobile !== undefined) return values.mobile;
    if (isTablet && values.tablet !== undefined) return values.tablet;
    if (isDesktop && values.desktop !== undefined) return values.desktop;
    return values.default || values.mobile || values.tablet || values.desktop;
  }
  
  return values;
};
