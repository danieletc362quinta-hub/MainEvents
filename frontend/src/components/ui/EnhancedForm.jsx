import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  FormLabel,
  FormGroup,
  Switch,
  Slider,
  Rating,
  Autocomplete,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
  Divider,
  Typography,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Send as SendIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { ResponsiveContainer } from './ResponsiveContainer';

const EnhancedForm = ({
  title,
  subtitle,
  steps = [],
  onSubmit,
  onReset,
  loading = false,
  success = false,
  error = null,
  children,
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Componente de campo de texto mejorado
  const EnhancedTextField = ({
    name,
    label,
    type = 'text',
    required = false,
    multiline = false,
    rows = 1,
    placeholder,
    helperText,
    validation,
    ...fieldProps
  }) => {
    const [value, setValue] = useState(formData[name] || '');
    const [isFocused, setIsFocused] = useState(false);
    const [isValid, setIsValid] = useState(true);

    useEffect(() => {
      setFormData(prev => ({ ...prev, [name]: value }));
    }, [name, value]);

    const handleChange = (event) => {
      const newValue = event.target.value;
      setValue(newValue);
      
      // Validación en tiempo real
      if (validation) {
        const isValidField = validation(newValue);
        setIsValid(isValidField);
        setErrors(prev => ({
          ...prev,
          [name]: isValidField ? null : 'Campo inválido'
        }));
      }
    };

    const handleBlur = () => {
      setIsFocused(false);
      setTouched(prev => ({ ...prev, [name]: true }));
    };

    const handleFocus = () => {
      setIsFocused(true);
    };

    return (
      <Fade in timeout={300}>
        <TextField
          {...fieldProps}
          name={name}
          label={label}
          type={type === 'password' && showPassword ? 'text' : type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          required={required}
          multiline={multiline}
          rows={rows}
          placeholder={placeholder}
          helperText={helperText || (touched[name] && errors[name])}
          error={touched[name] && !!errors[name]}
          fullWidth
          variant="outlined"
          size={isMobile ? 'small' : 'medium'}
          sx={{
            '& .MuiOutlinedInput-root': {
              transition: 'all 0.2s ease',
              '&:hover': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
                },
              },
              '&.Mui-focused': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderWidth: 2,
                },
              },
            },
            '& .MuiInputLabel-root': {
              transition: 'all 0.2s ease',
            },
          }}
          InputProps={{
            endAdornment: type === 'password' && (
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
                size="small"
              >
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            ),
          }}
        />
      </Fade>
    );
  };

  // Componente de selector mejorado
  const EnhancedSelect = ({
    name,
    label,
    options = [],
    required = false,
    multiple = false,
    ...fieldProps
  }) => {
    const [value, setValue] = useState(multiple ? [] : '');

    useEffect(() => {
      setFormData(prev => ({ ...prev, [name]: value }));
    }, [name, value]);

    const handleChange = (event) => {
      setValue(event.target.value);
    };

    return (
      <Fade in timeout={300}>
        <FormControl
          fullWidth
          variant="outlined"
          size={isMobile ? 'small' : 'medium'}
          required={required}
          error={touched[name] && !!errors[name]}
        >
          <InputLabel>{label}</InputLabel>
          <Select
            {...fieldProps}
            value={value}
            onChange={handleChange}
            multiple={multiple}
            renderValue={multiple ? (selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((val) => (
                  <Chip
                    key={val}
                    label={options.find(opt => opt.value === val)?.label || val}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            ) : undefined}
          >
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Fade>
    );
  };

  // Componente de checkbox mejorado
  const EnhancedCheckbox = ({
    name,
    label,
    checked = false,
    ...fieldProps
  }) => {
    const [isChecked, setIsChecked] = useState(checked);

    useEffect(() => {
      setFormData(prev => ({ ...prev, [name]: isChecked }));
    }, [name, isChecked]);

    const handleChange = (event) => {
      setIsChecked(event.target.checked);
    };

    return (
      <Fade in timeout={300}>
        <FormControlLabel
          control={
            <Checkbox
              {...fieldProps}
              checked={isChecked}
              onChange={handleChange}
              color="primary"
            />
          }
          label={label}
          sx={{
            '& .MuiFormControlLabel-label': {
              fontSize: '0.875rem',
            },
          }}
        />
      </Fade>
    );
  };

  // Componente de radio group mejorado
  const EnhancedRadioGroup = ({
    name,
    label,
    options = [],
    value: selectedValue = '',
    ...fieldProps
  }) => {
    const [value, setValue] = useState(selectedValue);

    useEffect(() => {
      setFormData(prev => ({ ...prev, [name]: value }));
    }, [name, value]);

    const handleChange = (event) => {
      setValue(event.target.value);
    };

    return (
      <Fade in timeout={300}>
        <FormControl component="fieldset" fullWidth>
          <FormLabel component="legend">{label}</FormLabel>
          <RadioGroup
            {...fieldProps}
            value={value}
            onChange={handleChange}
            sx={{ mt: 1 }}
          >
            {options.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio color="primary" />}
                label={option.label}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </Fade>
    );
  };

  // Componente de slider mejorado
  const EnhancedSlider = ({
    name,
    label,
    min = 0,
    max = 100,
    step = 1,
    value: sliderValue = min,
    marks = false,
    ...fieldProps
  }) => {
    const [value, setValue] = useState(sliderValue);

    useEffect(() => {
      setFormData(prev => ({ ...prev, [name]: value }));
    }, [name, value]);

    const handleChange = (event, newValue) => {
      setValue(newValue);
    };

    return (
      <Fade in timeout={300}>
        <Box sx={{ px: 2 }}>
          <Typography gutterBottom>{label}</Typography>
          <Slider
            {...fieldProps}
            value={value}
            onChange={handleChange}
            min={min}
            max={max}
            step={step}
            marks={marks}
            valueLabelDisplay="auto"
            sx={{
              '& .MuiSlider-thumb': {
                '&:hover, &.Mui-focusVisible': {
                  boxShadow: `0 0 0 8px ${theme.palette.primary.main}20`,
                },
              },
            }}
          />
        </Box>
      </Fade>
    );
  };

  // Componente de rating mejorado
  const EnhancedRating = ({
    name,
    label,
    value: ratingValue = 0,
    precision = 1,
    ...fieldProps
  }) => {
    const [value, setValue] = useState(ratingValue);

    useEffect(() => {
      setFormData(prev => ({ ...prev, [name]: value }));
    }, [name, value]);

    const handleChange = (event, newValue) => {
      setValue(newValue);
    };

    return (
      <Fade in timeout={300}>
        <Box>
          <Typography gutterBottom>{label}</Typography>
          <Rating
            {...fieldProps}
            value={value}
            onChange={handleChange}
            precision={precision}
            size="large"
            sx={{
              '& .MuiRating-icon': {
                fontSize: '2rem',
              },
            }}
          />
        </Box>
      </Fade>
    );
  };

  // Componente de autocomplete mejorado
  const EnhancedAutocomplete = ({
    name,
    label,
    options = [],
    multiple = false,
    freeSolo = false,
    ...fieldProps
  }) => {
    const [value, setValue] = useState(multiple ? [] : null);

    useEffect(() => {
      setFormData(prev => ({ ...prev, [name]: value }));
    }, [name, value]);

    const handleChange = (event, newValue) => {
      setValue(newValue);
    };

    return (
      <Fade in timeout={300}>
        <Autocomplete
          {...fieldProps}
          options={options}
          value={value}
          onChange={handleChange}
          multiple={multiple}
          freeSolo={freeSolo}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              variant="outlined"
              size={isMobile ? 'small' : 'medium'}
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                key={index}
                label={option}
                {...getTagProps({ index })}
                color="primary"
                variant="outlined"
              />
            ))
          }
        />
      </Fade>
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const handleReset = () => {
    setFormData({});
    setErrors({});
    setTouched({});
    if (onReset) {
      onReset();
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <ResponsiveContainer maxWidth="md">
      <Paper
        elevation={2}
        sx={{
          p: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        }}
      >
        {/* Header del formulario */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Stepper si hay pasos */}
        {steps.length > 0 && (
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
                {step.description && (
                  <StepContent>
                    <Typography>{step.description}</Typography>
                  </StepContent>
                )}
              </Step>
            ))}
          </Stepper>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} {...props}>
          <Box sx={{ mb: 4 }}>
            {children}
          </Box>

          {/* Botones de acción */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'flex-end',
              flexWrap: 'wrap',
            }}
          >
            <Button
              type="button"
              variant="outlined"
              onClick={handleReset}
              startIcon={<ClearIcon />}
              disabled={loading}
            >
              Limpiar
            </Button>
            
            {steps.length > 0 && activeStep > 0 && (
              <Button
                type="button"
                variant="outlined"
                onClick={handleBack}
                disabled={loading}
              >
                Anterior
              </Button>
            )}
            
            {steps.length > 0 && activeStep < steps.length - 1 ? (
              <Button
                type="button"
                variant="contained"
                onClick={handleNext}
                disabled={loading}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <LinearProgress size={16} /> : <SendIcon />}
                sx={{
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                  },
                }}
              >
                {loading ? 'Enviando...' : 'Enviar'}
              </Button>
            )}
          </Box>
        </form>

        {/* Snackbar para notificaciones */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={success ? 'success' : 'error'}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Paper>
    </ResponsiveContainer>
  );
};

export {
  EnhancedForm,
  EnhancedTextField,
  EnhancedSelect,
  EnhancedCheckbox,
  EnhancedRadioGroup,
  EnhancedSlider,
  EnhancedRating,
  EnhancedAutocomplete
};
