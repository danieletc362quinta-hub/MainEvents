import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  CardActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  AlertTitle,
  Grid
} from '@mui/material';
import {
  Help as HelpIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  QuestionAnswer as FAQIcon,
  VideoLibrary as TutorialIcon,
  Support as SupportIcon,
  Book as DocumentationIcon,
  Lightbulb as TipIcon,
  BugReport as BugIcon,
  Feedback as FeedbackIcon,
  Keyboard as KeyboardIcon,
  Mouse as MouseIcon,
  TouchApp as TouchIcon,
  Visibility as VisibilityIcon,
  Hearing as HearingIcon,
  Accessibility as AccessibilityIcon
} from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';

const HelpSystem = ({ 
  open, 
  onClose, 
  initialTab = 0,
  searchQuery = '',
  showTooltips = true 
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [expandedFAQ, setExpandedFAQ] = useState(false);
  const [currentTutorial, setCurrentTutorial] = useState(0);

  // Datos de ayuda
  const helpData = {
    faq: [
      {
        question: t('help.faq.howToCreateEvent'),
        answer: t('help.faq.howToCreateEventAnswer'),
        category: 'events'
      },
      {
        question: t('help.faq.howToBuyTicket'),
        answer: t('help.faq.howToBuyTicketAnswer'),
        category: 'tickets'
      },
      {
        question: t('help.faq.howToCancelTicket'),
        answer: t('help.faq.howToCancelTicketAnswer'),
        category: 'tickets'
      },
      {
        question: t('help.faq.howToChangeLanguage'),
        answer: t('help.faq.howToChangeLanguageAnswer'),
        category: 'settings'
      },
      {
        question: t('help.faq.howToContactSupport'),
        answer: t('help.faq.howToContactSupportAnswer'),
        category: 'support'
      }
    ],
    tutorials: [
      {
        title: t('help.tutorials.gettingStarted'),
        steps: [
          t('help.tutorials.steps.createAccount'),
          t('help.tutorials.steps.verifyEmail'),
          t('help.tutorials.steps.completeProfile'),
          t('help.tutorials.steps.exploreEvents')
        ],
        duration: '5 min'
      },
      {
        title: t('help.tutorials.creatingEvents'),
        steps: [
          t('help.tutorials.steps.eventBasicInfo'),
          t('help.tutorials.steps.eventDetails'),
          t('help.tutorials.steps.eventPricing'),
          t('help.tutorials.steps.eventPublish')
        ],
        duration: '10 min'
      },
      {
        title: t('help.tutorials.managingTickets'),
        steps: [
          t('help.tutorials.steps.ticketPurchase'),
          t('help.tutorials.steps.ticketValidation'),
          t('help.tutorials.steps.ticketTransfer'),
          t('help.tutorials.steps.ticketRefund')
        ],
        duration: '8 min'
      }
    ],
    shortcuts: [
      { key: 'Ctrl + /', action: t('help.shortcuts.openHelp'), category: 'general' },
      { key: 'Ctrl + N', action: t('help.shortcuts.newEvent'), category: 'events' },
      { key: 'Ctrl + S', action: t('help.shortcuts.save'), category: 'general' },
      { key: 'Ctrl + F', action: t('help.shortcuts.search'), category: 'general' },
      { key: 'Ctrl + E', action: t('help.shortcuts.edit'), category: 'general' },
      { key: 'Ctrl + D', action: t('help.shortcuts.delete'), category: 'general' },
      { key: 'Esc', action: t('help.shortcuts.close'), category: 'general' }
    ],
    accessibility: [
      { feature: t('help.accessibility.keyboardNavigation'), description: t('help.accessibility.keyboardNavigationDesc') },
      { feature: t('help.accessibility.screenReader'), description: t('help.accessibility.screenReaderDesc') },
      { feature: t('help.accessibility.highContrast'), description: t('help.accessibility.highContrastDesc') },
      { feature: t('help.accessibility.voiceCommands'), description: t('help.accessibility.voiceCommandsDesc') }
    ]
  };

  const filteredFAQ = helpData.faq.filter(item => 
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleFAQChange = (panel) => (event, isExpanded) => {
    setExpandedFAQ(isExpanded ? panel : false);
  };

  const handleTutorialNext = () => {
    setCurrentTutorial(prev => 
      prev < helpData.tutorials.length - 1 ? prev + 1 : 0
    );
  };

  const handleTutorialPrev = () => {
    setCurrentTutorial(prev => 
      prev > 0 ? prev - 1 : helpData.tutorials.length - 1
    );
  };

  const renderFAQ = () => (
    <Box>
      <TextField
        fullWidth
        placeholder={t('help.searchPlaceholder')}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          )
        }}
        sx={{ mb: 2 }}
      />
      
      {filteredFAQ.map((item, index) => (
        <Accordion
          key={index}
          expanded={expandedFAQ === index}
          onChange={handleFAQChange(index)}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" width="100%">
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                {item.question}
              </Typography>
              <Chip 
                label={item.category} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" color="text.secondary">
              {item.answer}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );

  const renderTutorials = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('help.tutorials.title')}
      </Typography>
      
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              {helpData.tutorials[currentTutorial].title}
            </Typography>
            <Chip 
              label={helpData.tutorials[currentTutorial].duration} 
              color="secondary" 
              size="small"
            />
          </Box>
          
          <Stepper activeStep={-1} orientation="vertical">
            {helpData.tutorials[currentTutorial].steps.map((step, index) => (
              <Step key={index}>
                <StepLabel>{step}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
        <CardActions>
          <Button onClick={handleTutorialPrev} disabled={currentTutorial === 0}>
            {t('actions.previous')}
          </Button>
          <Button onClick={handleTutorialNext} variant="contained">
            {t('actions.next')}
          </Button>
        </CardActions>
      </Card>
    </Box>
  );

  const renderShortcuts = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('help.shortcuts.title')}
      </Typography>
      
      <List>
        {helpData.shortcuts.map((shortcut, index) => (
          <ListItem key={index}>
            <ListItemIcon>
              <KeyboardIcon />
            </ListItemIcon>
            <ListItemText
              primary={shortcut.action}
              secondary={
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip 
                    label={shortcut.key} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                  <Chip 
                    label={shortcut.category} 
                    size="small" 
                    color="secondary" 
                    variant="outlined"
                  />
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const renderAccessibility = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('help.accessibility.title')}
      </Typography>
      
      <Alert severity="info" sx={{ mb: 2 }}>
        <AlertTitle>{t('help.accessibility.infoTitle')}</AlertTitle>
        {t('help.accessibility.infoDescription')}
      </Alert>
      
      {helpData.accessibility.map((item, index) => (
        <Card key={index} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {item.feature}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.description}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  const renderSupport = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('help.support.title')}
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SupportIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {t('help.support.contactUs')}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                {t('help.support.contactUsDescription')}
              </Typography>
              <Button variant="contained" fullWidth>
                {t('help.support.contactButton')}
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <BugIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {t('help.support.reportBug')}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                {t('help.support.reportBugDescription')}
              </Typography>
              <Button variant="outlined" fullWidth>
                {t('help.support.reportBugButton')}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { height: '80vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <HelpIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              {t('help.title')}
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab icon={<FAQIcon />} label={t('help.faq.title')} />
          <Tab icon={<TutorialIcon />} label={t('help.tutorials.title')} />
          <Tab icon={<KeyboardIcon />} label={t('help.shortcuts.title')} />
          <Tab icon={<AccessibilityIcon />} label={t('help.accessibility.title')} />
          <Tab icon={<SupportIcon />} label={t('help.support.title')} />
        </Tabs>
        
        <Box sx={{ height: '60vh', overflow: 'auto' }}>
          {activeTab === 0 && renderFAQ()}
          {activeTab === 1 && renderTutorials()}
          {activeTab === 2 && renderShortcuts()}
          {activeTab === 3 && renderAccessibility()}
          {activeTab === 4 && renderSupport()}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

// Componente de Tooltip mejorado
export const HelpTooltip = ({ 
  children, 
  title, 
  placement = 'top',
  arrow = true,
  interactive = false 
}) => {
  const [open, setOpen] = useState(false);
  
  return (
    <Tooltip
      title={title}
      placement={placement}
      arrow={arrow}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      interactive={interactive}
      PopperProps={{
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
        ],
      }}
    >
      {children}
    </Tooltip>
  );
};

// Hook para usar el sistema de ayuda
export const useHelp = () => {
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpTab, setHelpTab] = useState(0);
  
  const openHelp = (tab = 0) => {
    setHelpTab(tab);
    setHelpOpen(true);
  };
  
  const closeHelp = () => {
    setHelpOpen(false);
  };
  
  return {
    helpOpen,
    helpTab,
    openHelp,
    closeHelp
  };
};

export default HelpSystem;
