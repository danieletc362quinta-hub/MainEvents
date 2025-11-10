export const userGuideSections = [
  {
    id: 'welcome',
    title: 'Bienvenido a MainEvents',
    content: '¡Gracias por usar MainEvents! Esta guía te ayudará a sacar el máximo provecho de nuestra plataforma.',
    position: 'center',
    showSkip: false
  },
  {
    id: 'quick-start',
    title: 'Inicio Rápido',
    content: [
      '1. **Regístrate** en la plataforma',
      '2. **Explora** eventos disponibles',
      '3. **Selecciona** el evento de tu interés',
      '4. **Compra** tus entradas de forma segura',
      '5. **Recibe** tus entradas por correo electrónico'
    ].join('\n'),
    position: 'bottom',
    showSkip: true
  },
  {
    id: 'payment-methods',
    title: 'Métodos de Pago',
    content: [
      '### Tarjetas de Crédito/Débito',
      '- Aceptamos todas las principales tarjetas (Visa, Mastercard, American Express)',
      '- Pago seguro con encriptación SSL',
      '- Procesamiento instantáneo',
      '\n### PayPal',
      '- Pago rápido con tu cuenta de PayPal',
      '- Sin necesidad de ingresar datos de tarjeta',
      '- Protección al comprador',
      '\n### Transferencia Bancaria',
      '- Transferencia directa a nuestra cuenta',
      '- Las entradas se liberan al confirmar el pago'
    ].join('\n'),
    position: 'left',
    showSkip: true
  },
  {
    id: 'account',
    title: 'Mi Cuenta',
    content: 'Gestiona tus datos personales, métodos de pago y el historial de compras desde la sección de Mi Cuenta.',
    position: 'right',
    showSkip: true
  },
  {
    id: 'support',
    title: 'Soporte',
    content: '¿Necesitas ayuda? Contáctanos a través del formulario de soporte o por correo electrónico a soporte@mainevents.com',
    position: 'top',
    showSkip: true,
    isLast: true
  }
];

export const getGuideSection = (id) => {
  return userGuideSections.find(section => section.id === id);
};
