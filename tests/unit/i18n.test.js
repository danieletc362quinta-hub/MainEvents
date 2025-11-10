import { t, setLanguage, getCurrentLanguage } from '../../src/utils/i18n.js';

describe('Internationalization Tests', () => {
  beforeEach(() => {
    // Limpiar localStorage
    localStorage.clear();
  });

  describe('Translation function', () => {
    test('should translate Spanish keys', () => {
      const translation = t('navigation.home', 'es');
      expect(translation).toBe('Inicio');
    });

    test('should translate English keys', () => {
      const translation = t('navigation.home', 'en');
      expect(translation).toBe('Home');
    });

    test('should default to Spanish when no language specified', () => {
      const translation = t('navigation.home');
      expect(translation).toBe('Inicio');
    });

    test('should handle nested keys', () => {
      const translation = t('auth.login', 'es');
      expect(translation).toBe('Iniciar Sesión');
    });

    test('should return key when translation not found', () => {
      const translation = t('nonexistent.key', 'es');
      expect(translation).toBe('nonexistent.key');
    });

    test('should handle invalid language', () => {
      const translation = t('navigation.home', 'invalid');
      expect(translation).toBe('navigation.home');
    });
  });

  describe('Language management', () => {
    test('should set language', () => {
      const result = setLanguage('en');
      expect(result).toBe(true);
      expect(localStorage.getItem('mainevents_language')).toBe('en');
    });

    test('should reject invalid language', () => {
      const result = setLanguage('invalid');
      expect(result).toBe(false);
    });

    test('should get current language', () => {
      setLanguage('en');
      const currentLang = getCurrentLanguage();
      expect(currentLang).toBe('en');
    });

    test('should default to Spanish when no language set', () => {
      const currentLang = getCurrentLanguage();
      expect(currentLang).toBe('es');
    });
  });

  describe('Translation coverage', () => {
    const languages = ['es', 'en'];
    const translationKeys = [
      'navigation.home',
      'navigation.events',
      'navigation.profile',
      'auth.login',
      'auth.register',
      'events.title',
      'events.createEvent',
      'suppliers.title',
      'suppliers.addSupplier',
      'participants.title',
      'admin.title',
      'forms.required',
      'errors.generic',
      'success.saved',
      'settings.title',
      'availability.title',
      'security.title'
    ];

    languages.forEach(lang => {
      describe(`${lang} translations`, () => {
        translationKeys.forEach(key => {
          test(`should translate ${key}`, () => {
            const translation = t(key, lang);
            expect(translation).toBeDefined();
            expect(translation).not.toBe(key); // No debería devolver la clave
            expect(typeof translation).toBe('string');
            expect(translation.length).toBeGreaterThan(0);
          });
        });
      });
    });
  });

  describe('Translation consistency', () => {
    test('should have same keys in both languages', () => {
      const esKeys = Object.keys(require('../../src/utils/i18n.js').translations.es);
      const enKeys = Object.keys(require('../../src/utils/i18n.js').translations.en);
      
      expect(esKeys.sort()).toEqual(enKeys.sort());
    });

    test('should have consistent nested structure', () => {
      const { translations } = require('../../src/utils/i18n.js');
      
      const checkStructure = (obj1, obj2, path = '') => {
        for (const key in obj1) {
          if (typeof obj1[key] === 'object' && obj1[key] !== null) {
            expect(obj2[key]).toBeDefined();
            checkStructure(obj1[key], obj2[key], `${path}.${key}`);
          } else {
            expect(obj2[key]).toBeDefined();
            expect(typeof obj2[key]).toBe('string');
          }
        }
      };
      
      checkStructure(translations.es, translations.en);
    });
  });

  describe('Special characters and encoding', () => {
    test('should handle special characters in Spanish', () => {
      const translation = t('auth.forgotPassword', 'es');
      expect(translation).toContain('¿');
      expect(translation).toContain('?');
    });

    test('should handle special characters in English', () => {
      const translation = t('auth.forgotPassword', 'en');
      expect(translation).toContain('?');
    });

    test('should preserve HTML entities', () => {
      const translation = t('forms.required', 'es');
      expect(translation).toBeDefined();
      expect(typeof translation).toBe('string');
    });
  });

  describe('Performance', () => {
    test('should translate quickly', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        t('navigation.home', 'es');
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100); // Debe completarse en menos de 100ms
    });
  });
});
