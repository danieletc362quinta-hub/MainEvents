/**
 * Tests unitarios para el sistema responsive
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LanguageProvider } from '../../frontend/src/contexts/LanguageContext';
import ResponsiveContainer from '../../frontend/src/components/ui/ResponsiveContainer';
import EnhancedNavigation from '../../frontend/src/components/ui/EnhancedNavigation';

// Mock de window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock de window.innerWidth e innerHeight
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768,
});

const TestWrapper = ({ children, language = 'es' }) => {
  const theme = createTheme();
  
  return (
    <ThemeProvider theme={theme}>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </ThemeProvider>
  );
};

describe('Sistema Responsive', () => {
  describe('ResponsiveContainer Component', () => {
    test('debe renderizar correctamente', () => {
      render(
        <TestWrapper>
          <ResponsiveContainer>
            <div>Test Content</div>
          </ResponsiveContainer>
        </TestWrapper>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    test('debe mostrar información de debug cuando está habilitada', () => {
      render(
        <TestWrapper>
          <ResponsiveContainer showDebugInfo={true}>
            <div>Test Content</div>
          </ResponsiveContainer>
        </TestWrapper>
      );

      expect(screen.getByText('Debug Responsive')).toBeInTheDocument();
    });

    test('debe detectar breakpoint actual', () => {
      // Mock para breakpoint md
      window.matchMedia = jest.fn().mockImplementation(query => {
        if (query === '(min-width: 900px) and (max-width: 1199px)') {
          return { matches: true };
        }
        return { matches: false };
      });

      render(
        <TestWrapper>
          <ResponsiveContainer showDebugInfo={true}>
            <div>Test Content</div>
          </ResponsiveContainer>
        </TestWrapper>
      );

      expect(screen.getByText(/MD/)).toBeInTheDocument();
    });

    test('debe ejecutar tests de responsive cuando está habilitado', async () => {
      render(
        <TestWrapper>
          <ResponsiveContainer enableResponsiveTesting={true}>
            <div>Test Content</div>
          </ResponsiveContainer>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Tests')).toBeInTheDocument();
      });
    });

    test('debe manejar cambios de orientación', () => {
      const onResponsiveChange = jest.fn();
      
      render(
        <TestWrapper>
          <ResponsiveContainer onResponsiveChange={onResponsiveChange}>
            <div>Test Content</div>
          </ResponsiveContainer>
        </TestWrapper>
      );

      // Simular cambio de orientación
      Object.defineProperty(window, 'innerWidth', { value: 768 });
      Object.defineProperty(window, 'innerHeight', { value: 1024 });
      
      fireEvent(window, new Event('resize'));

      expect(onResponsiveChange).toHaveBeenCalled();
    });

    test('debe detectar dispositivos móviles', () => {
      // Mock para dispositivo móvil
      window.matchMedia = jest.fn().mockImplementation(query => {
        if (query === '(max-width: 899px)') {
          return { matches: true };
        }
        return { matches: false };
      });

      render(
        <TestWrapper>
          <ResponsiveContainer showDebugInfo={true}>
            <div>Test Content</div>
          </ResponsiveContainer>
        </TestWrapper>
      );

      expect(screen.getByText('Mobile: Yes')).toBeInTheDocument();
    });

    test('debe detectar tablets', () => {
      // Mock para tablet
      window.matchMedia = jest.fn().mockImplementation(query => {
        if (query === '(min-width: 600px) and (max-width: 899px)') {
          return { matches: true };
        }
        return { matches: false };
      });

      render(
        <TestWrapper>
          <ResponsiveContainer showDebugInfo={true}>
            <div>Test Content</div>
          </ResponsiveContainer>
        </TestWrapper>
      );

      expect(screen.getByText('Tablet: Yes')).toBeInTheDocument();
    });

    test('debe detectar escritorio', () => {
      // Mock para escritorio
      window.matchMedia = jest.fn().mockImplementation(query => {
        if (query === '(min-width: 1200px)') {
          return { matches: true };
        }
        return { matches: false };
      });

      render(
        <TestWrapper>
          <ResponsiveContainer showDebugInfo={true}>
            <div>Test Content</div>
          </ResponsiveContainer>
        </TestWrapper>
      );

      expect(screen.getByText('Desktop: Yes')).toBeInTheDocument();
    });
  });

  describe('EnhancedNavigation Component', () => {
    test('debe renderizar navegación de escritorio en pantallas grandes', () => {
      // Mock para pantalla grande
      window.matchMedia = jest.fn().mockImplementation(query => {
        if (query === '(min-width: 1200px)') {
          return { matches: true };
        }
        return { matches: false };
      });

      render(
        <TestWrapper>
          <EnhancedNavigation currentPath="/" />
        </TestWrapper>
      );

      expect(screen.getByText('MainEvents')).toBeInTheDocument();
    });

    test('debe renderizar navegación móvil en pantallas pequeñas', () => {
      // Mock para pantalla móvil
      window.matchMedia = jest.fn().mockImplementation(query => {
        if (query === '(max-width: 899px)') {
          return { matches: true };
        }
        return { matches: false };
      });

      render(
        <TestWrapper>
          <EnhancedNavigation currentPath="/" />
        </TestWrapper>
      );

      expect(screen.getByText('MainEvents')).toBeInTheDocument();
    });

    test('debe mostrar menú móvil al hacer clic en el botón de menú', () => {
      // Mock para pantalla móvil
      window.matchMedia = jest.fn().mockImplementation(query => {
        if (query === '(max-width: 899px)') {
          return { matches: true };
        }
        return { matches: false };
      });

      render(
        <TestWrapper>
          <EnhancedNavigation currentPath="/" />
        </TestWrapper>
      );

      const menuButton = screen.getByRole('button', { name: /menu/i });
      fireEvent.click(menuButton);

      expect(screen.getByText('Inicio')).toBeInTheDocument();
    });

    test('debe navegar correctamente', () => {
      const onNavigate = jest.fn();
      
      render(
        <TestWrapper>
          <EnhancedNavigation currentPath="/" onNavigate={onNavigate} />
        </TestWrapper>
      );

      const eventsButton = screen.getByText('Eventos');
      fireEvent.click(eventsButton);

      expect(onNavigate).toHaveBeenCalledWith('/events');
    });

    test('debe mostrar notificaciones cuando está habilitado', () => {
      render(
        <TestWrapper>
          <EnhancedNavigation 
            currentPath="/" 
            showNotifications={true} 
            notificationCount={5} 
          />
        </TestWrapper>
      );

      expect(screen.getByText('5')).toBeInTheDocument();
    });

    test('debe mostrar botón de ayuda cuando está habilitado', () => {
      render(
        <TestWrapper>
          <EnhancedNavigation 
            currentPath="/" 
            showHelp={true} 
          />
        </TestWrapper>
      );

      const helpButton = screen.getByRole('button', { name: /help/i });
      expect(helpButton).toBeInTheDocument();
    });
  });

  describe('Tests de Breakpoints', () => {
    test('debe manejar breakpoint xs', () => {
      Object.defineProperty(window, 'innerWidth', { value: 400 });
      
      window.matchMedia = jest.fn().mockImplementation(query => {
        if (query === '(max-width: 599px)') {
          return { matches: true };
        }
        return { matches: false };
      });

      render(
        <TestWrapper>
          <ResponsiveContainer showDebugInfo={true}>
            <div>Test Content</div>
          </ResponsiveContainer>
        </TestWrapper>
      );

      expect(screen.getByText(/XS/)).toBeInTheDocument();
    });

    test('debe manejar breakpoint sm', () => {
      Object.defineProperty(window, 'innerWidth', { value: 700 });
      
      window.matchMedia = jest.fn().mockImplementation(query => {
        if (query === '(min-width: 600px) and (max-width: 899px)') {
          return { matches: true };
        }
        return { matches: false };
      });

      render(
        <TestWrapper>
          <ResponsiveContainer showDebugInfo={true}>
            <div>Test Content</div>
          </ResponsiveContainer>
        </TestWrapper>
      );

      expect(screen.getByText(/SM/)).toBeInTheDocument();
    });

    test('debe manejar breakpoint md', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1000 });
      
      window.matchMedia = jest.fn().mockImplementation(query => {
        if (query === '(min-width: 900px) and (max-width: 1199px)') {
          return { matches: true };
        }
        return { matches: false };
      });

      render(
        <TestWrapper>
          <ResponsiveContainer showDebugInfo={true}>
            <div>Test Content</div>
          </ResponsiveContainer>
        </TestWrapper>
      );

      expect(screen.getByText(/MD/)).toBeInTheDocument();
    });

    test('debe manejar breakpoint lg', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1300 });
      
      window.matchMedia = jest.fn().mockImplementation(query => {
        if (query === '(min-width: 1200px) and (max-width: 1535px)') {
          return { matches: true };
        }
        return { matches: false };
      });

      render(
        <TestWrapper>
          <ResponsiveContainer showDebugInfo={true}>
            <div>Test Content</div>
          </ResponsiveContainer>
        </TestWrapper>
      );

      expect(screen.getByText(/LG/)).toBeInTheDocument();
    });

    test('debe manejar breakpoint xl', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1600 });
      
      window.matchMedia = jest.fn().mockImplementation(query => {
        if (query === '(min-width: 1536px)') {
          return { matches: true };
        }
        return { matches: false };
      });

      render(
        <TestWrapper>
          <ResponsiveContainer showDebugInfo={true}>
            <div>Test Content</div>
          </ResponsiveContainer>
        </TestWrapper>
      );

      expect(screen.getByText(/XL/)).toBeInTheDocument();
    });
  });

  describe('Tests de Orientación', () => {
    test('debe detectar orientación vertical', () => {
      Object.defineProperty(window, 'innerWidth', { value: 768 });
      Object.defineProperty(window, 'innerHeight', { value: 1024 });

      render(
        <TestWrapper>
          <ResponsiveContainer showDebugInfo={true}>
            <div>Test Content</div>
          </ResponsiveContainer>
        </TestWrapper>
      );

      expect(screen.getByText('Portrait')).toBeInTheDocument();
    });

    test('debe detectar orientación horizontal', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1024 });
      Object.defineProperty(window, 'innerHeight', { value: 768 });

      render(
        <TestWrapper>
          <ResponsiveContainer showDebugInfo={true}>
            <div>Test Content</div>
          </ResponsiveContainer>
        </TestWrapper>
      );

      expect(screen.getByText('Landscape')).toBeInTheDocument();
    });
  });

  describe('Tests de Rendimiento', () => {
    test('debe renderizar rápidamente', () => {
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <ResponsiveContainer>
            <div>Test Content</div>
          </ResponsiveContainer>
        </TestWrapper>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Debe renderizar en menos de 50ms
      expect(renderTime).toBeLessThan(50);
    });

    test('debe manejar múltiples cambios de tamaño', () => {
      const onResponsiveChange = jest.fn();
      
      render(
        <TestWrapper>
          <ResponsiveContainer onResponsiveChange={onResponsiveChange}>
            <div>Test Content</div>
          </ResponsiveContainer>
        </TestWrapper>
      );

      // Simular múltiples cambios de tamaño
      for (let i = 0; i < 10; i++) {
        Object.defineProperty(window, 'innerWidth', { value: 800 + i * 100 });
        fireEvent(window, new Event('resize'));
      }

      expect(onResponsiveChange).toHaveBeenCalledTimes(10);
    });
  });

  describe('Tests de Accesibilidad', () => {
    test('debe ser navegable por teclado', () => {
      render(
        <TestWrapper>
          <EnhancedNavigation currentPath="/" />
        </TestWrapper>
      );

      const firstButton = screen.getByText('Inicio');
      firstButton.focus();
      expect(document.activeElement).toBe(firstButton);
    });

    test('debe tener roles ARIA apropiados', () => {
      render(
        <TestWrapper>
          <EnhancedNavigation currentPath="/" />
        </TestWrapper>
      );

      const navigation = screen.getByRole('navigation');
      expect(navigation).toBeInTheDocument();
    });

    test('debe tener labels descriptivos', () => {
      render(
        <TestWrapper>
          <EnhancedNavigation currentPath="/" />
        </TestWrapper>
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });
  });
});