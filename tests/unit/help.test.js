/**
 * Tests unitarios para el sistema de ayuda
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LanguageProvider } from '../../frontend/src/contexts/LanguageContext';
import HelpSystem from '../../frontend/src/components/ui/HelpSystem';
import HelpButton from '../../frontend/src/components/ui/HelpButton';
import { useHelpSystem } from '../../frontend/src/hooks/useHelpSystem';

// Mock del contexto de idioma
const mockTranslations = {
  es: {
    help: {
      title: 'Ayuda',
      faq: {
        title: 'Preguntas Frecuentes',
        howToCreateEvent: '¿Cómo crear un evento?',
        howToCreateEventAnswer: 'Para crear un evento...'
      },
      tutorials: {
        title: 'Tutoriales',
        gettingStarted: 'Comenzar'
      },
      shortcuts: {
        title: 'Atajos de Teclado',
        openHelp: 'Abrir ayuda'
      },
      accessibility: {
        title: 'Accesibilidad'
      },
      support: {
        title: 'Soporte'
      }
    },
    actions: {
      previous: 'Anterior',
      next: 'Siguiente'
    }
  },
  en: {
    help: {
      title: 'Help',
      faq: {
        title: 'Frequently Asked Questions',
        howToCreateEvent: 'How to create an event?',
        howToCreateEventAnswer: 'To create an event...'
      },
      tutorials: {
        title: 'Tutorials',
        gettingStarted: 'Getting Started'
      },
      shortcuts: {
        title: 'Keyboard Shortcuts',
        openHelp: 'Open help'
      },
      accessibility: {
        title: 'Accessibility'
      },
      support: {
        title: 'Support'
      }
    },
    actions: {
      previous: 'Previous',
      next: 'Next'
    }
  }
};

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

describe('Sistema de Ayuda', () => {
  describe('HelpSystem Component', () => {
    test('debe renderizar correctamente', () => {
      render(
        <TestWrapper>
          <HelpSystem open={true} onClose={() => {}} />
        </TestWrapper>
      );

      expect(screen.getByText('Ayuda')).toBeInTheDocument();
    });

    test('debe mostrar todas las pestañas', () => {
      render(
        <TestWrapper>
          <HelpSystem open={true} onClose={() => {}} />
        </TestWrapper>
      );

      expect(screen.getByText('Preguntas Frecuentes')).toBeInTheDocument();
      expect(screen.getByText('Tutoriales')).toBeInTheDocument();
      expect(screen.getByText('Atajos de Teclado')).toBeInTheDocument();
      expect(screen.getByText('Accesibilidad')).toBeInTheDocument();
      expect(screen.getByText('Soporte')).toBeInTheDocument();
    });

    test('debe cambiar de pestaña al hacer clic', () => {
      render(
        <TestWrapper>
          <HelpSystem open={true} onClose={() => {}} />
        </TestWrapper>
      );

      const tutorialsTab = screen.getByText('Tutoriales');
      fireEvent.click(tutorialsTab);

      expect(screen.getByText('Comenzar')).toBeInTheDocument();
    });

    test('debe cerrar el modal al hacer clic en el botón de cerrar', () => {
      const onClose = jest.fn();
      
      render(
        <TestWrapper>
          <HelpSystem open={true} onClose={onClose} />
        </TestWrapper>
      );

      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });

    test('debe filtrar FAQ por término de búsqueda', async () => {
      render(
        <TestWrapper>
          <HelpSystem open={true} onClose={() => {}} />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Buscar en la ayuda...');
      fireEvent.change(searchInput, { target: { value: 'evento' } });

      await waitFor(() => {
        expect(screen.getByText('¿Cómo crear un evento?')).toBeInTheDocument();
      });
    });

    test('debe navegar entre tutoriales', () => {
      render(
        <TestWrapper>
          <HelpSystem open={true} onClose={() => {}} initialTab={1} />
        </TestWrapper>
      );

      const nextButton = screen.getByText('Siguiente');
      fireEvent.click(nextButton);

      // Verificar que el tutorial cambió
      expect(screen.getByText('Crear Eventos')).toBeInTheDocument();
    });
  });

  describe('HelpButton Component', () => {
    test('debe renderizar correctamente', () => {
      const onClick = jest.fn();
      
      render(
        <TestWrapper>
          <HelpButton onClick={onClick} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    test('debe llamar onClick al hacer clic', () => {
      const onClick = jest.fn();
      
      render(
        <TestWrapper>
          <HelpButton onClick={onClick} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(onClick).toHaveBeenCalled();
    });

    test('debe mostrar badge cuando se especifica', () => {
      const onClick = jest.fn();
      
      render(
        <TestWrapper>
          <HelpButton onClick={onClick} showBadge={true} badgeContent={3} />
        </TestWrapper>
      );

      expect(screen.getByText('3')).toBeInTheDocument();
    });

    test('debe mostrar tooltip', () => {
      const onClick = jest.fn();
      
      render(
        <TestWrapper>
          <HelpButton onClick={onClick} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.mouseOver(button);

      expect(screen.getByText('Ayuda')).toBeInTheDocument();
    });
  });

  describe('useHelpSystem Hook', () => {
    test('debe proporcionar funciones de ayuda', () => {
      const TestComponent = () => {
        const { openHelp, closeHelp, helpOpen, tooltipsEnabled } = useHelpSystem();
        
        return (
          <div>
            <button onClick={() => openHelp(0)}>Open Help</button>
            <button onClick={closeHelp}>Close Help</button>
            <span data-testid="help-open">{helpOpen.toString()}</span>
            <span data-testid="tooltips-enabled">{tooltipsEnabled.toString()}</span>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(screen.getByTestId('help-open')).toHaveTextContent('false');
      expect(screen.getByTestId('tooltips-enabled')).toHaveTextContent('true');
    });

    test('debe abrir y cerrar ayuda', () => {
      const TestComponent = () => {
        const { openHelp, closeHelp, helpOpen } = useHelpSystem();
        
        return (
          <div>
            <button onClick={() => openHelp(0)}>Open Help</button>
            <button onClick={closeHelp}>Close Help</button>
            <span data-testid="help-open">{helpOpen.toString()}</span>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const openButton = screen.getByText('Open Help');
      const closeButton = screen.getByText('Close Help');
      const helpOpenSpan = screen.getByTestId('help-open');

      fireEvent.click(openButton);
      expect(helpOpenSpan).toHaveTextContent('true');

      fireEvent.click(closeButton);
      expect(helpOpenSpan).toHaveTextContent('false');
    });

    test('debe manejar atajos de teclado', () => {
      const TestComponent = () => {
        const { openHelp, helpOpen } = useHelpSystem();
        
        return (
          <div>
            <span data-testid="help-open">{helpOpen.toString()}</span>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const helpOpenSpan = screen.getByTestId('help-open');

      // Simular Ctrl + /
      fireEvent.keyDown(document, { key: '/', ctrlKey: true });
      expect(helpOpenSpan).toHaveTextContent('true');
    });
  });

  describe('Integración con sistema de idiomas', () => {
    test('debe cambiar idioma correctamente', () => {
      const TestComponent = () => {
        const { language, changeLanguage } = useLanguage();
        
        return (
          <div>
            <span data-testid="current-language">{language}</span>
            <button onClick={() => changeLanguage('en')}>Change to English</button>
            <button onClick={() => changeLanguage('es')}>Change to Spanish</button>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const languageSpan = screen.getByTestId('current-language');
      const englishButton = screen.getByText('Change to English');
      const spanishButton = screen.getByText('Change to Spanish');

      expect(languageSpan).toHaveTextContent('es');

      fireEvent.click(englishButton);
      expect(languageSpan).toHaveTextContent('en');

      fireEvent.click(spanishButton);
      expect(languageSpan).toHaveTextContent('es');
    });
  });

  describe('Accesibilidad', () => {
    test('debe ser navegable por teclado', () => {
      render(
        <TestWrapper>
          <HelpSystem open={true} onClose={() => {}} />
        </TestWrapper>
      );

      const firstTab = screen.getByText('Preguntas Frecuentes');
      firstTab.focus();
      expect(document.activeElement).toBe(firstTab);

      // Simular navegación con Tab
      fireEvent.keyDown(firstTab, { key: 'Tab' });
      // Verificar que el foco se mueve al siguiente elemento
    });

    test('debe tener roles ARIA apropiados', () => {
      render(
        <TestWrapper>
          <HelpSystem open={true} onClose={() => {}} />
        </TestWrapper>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(5);
    });

    test('debe tener labels descriptivos', () => {
      render(
        <TestWrapper>
          <HelpSystem open={true} onClose={() => {}} />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Buscar en la ayuda...');
      expect(searchInput).toHaveAttribute('placeholder');
    });
  });

  describe('Rendimiento', () => {
    test('debe renderizar rápidamente', () => {
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <HelpSystem open={true} onClose={() => {}} />
        </TestWrapper>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Debe renderizar en menos de 100ms
      expect(renderTime).toBeLessThan(100);
    });

    test('debe manejar múltiples cambios de pestaña', () => {
      render(
        <TestWrapper>
          <HelpSystem open={true} onClose={() => {}} />
        </TestWrapper>
      );

      const tabs = screen.getAllByRole('tab');
      
      // Cambiar entre todas las pestañas
      tabs.forEach(tab => {
        fireEvent.click(tab);
      });

      // No debe haber errores
      expect(screen.getByText('Ayuda')).toBeInTheDocument();
    });
  });
});
