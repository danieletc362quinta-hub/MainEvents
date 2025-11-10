import React from 'react';
import {
  Container,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link,
  Paper,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ContactSupport as ContactSupportIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Info as InfoIcon,
  HelpOutline as HelpOutlineIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Security as SecurityIcon,
  Payment as PaymentIcon,
  EventAvailable as EventAvailableIcon,
  Person as PersonIcon
} from '@mui/icons-material';

const Help = () => {
  const faqItems = [
    {
      question: '¿Cómo creo un evento?',
      answer: 'Para crear un evento, inicia sesión en tu cuenta y haz clic en "Crear Evento" en el menú de navegación. Completa el formulario con los detalles de tu evento y haz clic en "Publicar".',
      icon: <EventAvailableIcon color="primary" />
    },
    {
      question: '¿Cómo puedo pagar por un evento?',
      answer: 'Navega hasta la página del evento y haz clic en "Comprar Entrada". Sigue las instrucciones para completar el pago con tu método preferido.',
      icon: <PaymentIcon color="primary" />
    },
    {
      question: '¿Cómo actualizo mi perfil?',
      answer: 'Haz clic en tu foto de perfil en la esquina superior derecha y selecciona "Mi Perfil". Desde allí podrás actualizar tu información personal.',
      icon: <PersonIcon color="primary" />
    },
    {
      question: '¿Qué métodos de pago aceptan?',
      answer: 'Aceptamos tarjetas de crédito/débito (Visa, MasterCard, American Express) y PayPal.',
      icon: <PaymentIcon color="primary" />
    },
    {
      question: '¿Cómo contacto al soporte?',
      answer: 'Puedes contactarnos a través del formulario de contacto en esta página o enviando un correo a soporte@mainevents.com',
      icon: <ContactSupportIcon color="primary" />
    }
  ];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h3" component="h1" gutterBottom color="primary">
          <HelpOutlineIcon sx={{ fontSize: 40, verticalAlign: 'middle', mr: 2 }} />
          Centro de Ayuda
        </Typography>
        <Typography variant="h6" color="text.secondary">
          ¿En qué podemos ayudarte hoy?
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4, mb: 6, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <QuestionAnswerIcon color="primary" sx={{ mr: 1 }} />
          Preguntas Frecuentes
        </Typography>
        
        {faqItems.map((item, index) => (
          <Accordion key={index} sx={{ mb: 1, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ bgcolor: 'grey.50' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {item.icon}
                <Typography sx={{ ml: 2, fontWeight: 'medium' }}>{item.question}</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>{item.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4, height: '100%', borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <ContactSupportIcon color="primary" sx={{ mr: 1 }} />
              Contacto Directo
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon><EmailIcon color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="Correo Electrónico" 
                  secondary={
                    <Link href="mailto:soporte@mainevents.com" color="primary">
                      soporte@mainevents.com
                    </Link>
                  } 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><PhoneIcon color="primary" /></ListItemIcon>
                <ListItemText primary="Teléfono" secondary={
                  <Link href="tel:+541112345678" color="primary">
                    +54 11 1234-5678
                  </Link>
                } />
              </ListItem>
              <ListItem>
                <ListItemIcon><InfoIcon color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="Horario de Atención" 
                  secondary="Lunes a Viernes de 9:00 a 18:00 hs" 
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4, height: '100%', borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <SecurityIcon color="primary" sx={{ mr: 1 }} />
              Seguridad y Privacidad
            </Typography>
            <Typography paragraph>
              En Main Event's nos tomamos muy en serio la seguridad de tus datos. Todas las transacciones están protegidas con encriptación SSL de 256 bits.
            </Typography>
            <Typography paragraph>
              Para más información, por favor revisa nuestros <Link href="/terminos" color="primary">Términos de Servicio</Link> y <Link href="/privacidad" color="primary">Política de Privacidad</Link>.
            </Typography>
            <Typography>
              Si sospechas de alguna actividad sospechosa en tu cuenta, por favor contáctanos de inmediato.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box mt={6} textAlign="center">
        <Typography variant="h6" gutterBottom>
          ¿No encontraste lo que buscabas?
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          size="large" 
          startIcon={<ContactSupportIcon />}
          href="/contacto"
        >
          Contáctanos
        </Button>
      </Box>
    </Container>
  );
};

export default Help;
