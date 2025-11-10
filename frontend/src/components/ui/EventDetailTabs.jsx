import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  useTheme,
  useMediaQuery,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  TextField,
  Button,
  Rating
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Comment as CommentIcon,
  People as PeopleIcon,
  Star as StarIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { useLanguage } from '../../contexts/UnifiedLanguageContext';

const EventDetailTabs = ({ 
  event, 
  comments = [], 
  attendees = [], 
  onAddComment,
  onRateEvent 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  const handleRatingChange = (newRating) => {
    setRating(newRating);
    onRateEvent(newRating);
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`event-tabpanel-${index}`}
      aria-labelledby={`event-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );

  return (
    <Paper
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)'
      }}
    >
      {/* Tabs Header */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? 'fullWidth' : 'standard'}
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: 'white',
              height: 3,
              borderRadius: '2px 2px 0 0'
            },
            '& .MuiTab-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              minHeight: 60,
              '&.Mui-selected': {
                color: 'white'
              },
              '&:hover': {
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }
          }}
        >
          <Tab
            icon={<DescriptionIcon />}
            iconPosition="start"
            label={t('events.description')}
            sx={{ minHeight: 60 }}
          />
          <Tab
            icon={<CommentIcon />}
            iconPosition="start"
            label={`${t('events.comments')} (${comments.length})`}
            sx={{ minHeight: 60 }}
          />
          <Tab
            icon={<PeopleIcon />}
            iconPosition="start"
            label={`${t('participants.title')} (${attendees.length})`}
            sx={{ minHeight: 60 }}
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <TabPanel value={activeTab} index={0}>
        {/* Descripción */}
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              mb: 2,
              color: theme.palette.grey[800],
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <DescriptionIcon color="primary" />
            {t('events.description')}
          </Typography>
          
          <Typography
            variant="body1"
            sx={{
              lineHeight: 1.8,
              color: theme.palette.grey[700],
              fontSize: '1.1rem',
              mb: 3
            }}
          >
            {event?.description || 'No hay descripción disponible para este evento.'}
          </Typography>

          {/* Información adicional del evento */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 2,
              mt: 3
            }}
          >
            <Paper
              sx={{
                p: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: 2
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Información del Evento
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Organizado por {event?.user?.name || event?.organizer || 'MainEvents'}
              </Typography>
            </Paper>

            <Paper
              sx={{
                p: 2,
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                borderRadius: 2
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Estadísticas
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {attendees.length} asistentes de {event?.capacity || 0} disponibles
              </Typography>
            </Paper>
          </Box>
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {/* Comentarios */}
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              mb: 2,
              color: theme.palette.grey[800],
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <CommentIcon color="primary" />
            {t('events.comments')}
          </Typography>

          {/* Agregar comentario */}
          <Paper
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 2,
              background: 'linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%)'
            }}
          >
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Rating
                value={rating}
                onChange={(event, newValue) => handleRatingChange(newValue)}
                size="large"
                sx={{
                  '& .MuiRating-iconFilled': {
                    color: theme.palette.warning.main
                  }
                }}
              />
              <Typography variant="body2" sx={{ alignSelf: 'center', color: theme.palette.grey[600] }}>
                Califica este evento
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Escribe tu comentario..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'white'
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)'
                  }
                }}
              >
                <SendIcon />
              </Button>
            </Box>
          </Paper>

          {/* Lista de comentarios */}
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {comments.length === 0 ? (
              <Typography
                variant="body2"
                sx={{
                  textAlign: 'center',
                  color: theme.palette.grey[500],
                  py: 4
                }}
              >
                No hay comentarios aún. ¡Sé el primero en comentar!
              </Typography>
            ) : (
              comments.map((comment, index) => (
                <React.Fragment key={index}>
                  <ListItem
                    sx={{
                      alignItems: 'flex-start',
                      py: 2,
                      px: 0
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                          fontWeight: 600
                        }}
                      >
                        {comment.user?.name?.charAt(0) || 'U'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {comment.user?.name || 'Usuario'}
                          </Typography>
                          {comment.rating && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <StarIcon sx={{ fontSize: '1rem', color: theme.palette.warning.main }} />
                              <Typography variant="caption" sx={{ color: theme.palette.grey[600] }}>
                                {comment.rating}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ color: theme.palette.grey[700] }}>
                          {comment.text}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < comments.length - 1 && <Divider />}
                </React.Fragment>
              ))
            )}
          </List>
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        {/* Asistentes */}
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              mb: 2,
              color: theme.palette.grey[800],
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <PeopleIcon color="primary" />
            {t('participants.title')}
          </Typography>

          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {attendees.length === 0 ? (
              <Typography
                variant="body2"
                sx={{
                  textAlign: 'center',
                  color: theme.palette.grey[500],
                  py: 4
                }}
              >
                Aún no hay asistentes registrados.
              </Typography>
            ) : (
              attendees.map((attendee, index) => (
                <React.Fragment key={index}>
                  <ListItem
                    sx={{
                      py: 2,
                      px: 0
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                          fontWeight: 600
                        }}
                      >
                        {attendee.name?.charAt(0) || 'A'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {attendee.name || 'Asistente'}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Chip
                            label={attendee.status || 'Confirmado'}
                            size="small"
                            color={attendee.status === 'confirmed' ? 'success' : 'default'}
                            sx={{ fontSize: '0.75rem' }}
                          />
                          <Typography variant="caption" sx={{ color: theme.palette.grey[600] }}>
                            {attendee.email}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < attendees.length - 1 && <Divider />}
                </React.Fragment>
              ))
            )}
          </List>
        </Box>
      </TabPanel>
    </Paper>
  );
};

export default EventDetailTabs;
