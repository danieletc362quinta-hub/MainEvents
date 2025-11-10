export const validateSchema = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    console.error('❌ Validation error:', error.errors);
    
    // Format validation errors
    const formattedErrors = error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }));
    
    return res.status(400).json({
      error: 'Error de validación',
      details: formattedErrors,
      message: 'Los datos proporcionados no son válidos'
    });
  }
};

// Middleware for validating query parameters
export const validateQuery = (schema) => (req, res, next) => {
  try {
    schema.parse(req.query);
    next();
  } catch (error) {
    console.error('❌ Query validation error:', error.errors);
    
    const formattedErrors = error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }));
    
    return res.status(400).json({
      error: 'Error de validación en parámetros de consulta',
      details: formattedErrors,
      message: 'Los parámetros de consulta no son válidos'
    });
  }
};

// Middleware for validating URL parameters
export const validateParams = (schema) => (req, res, next) => {
  try {
    schema.parse(req.params);
    next();
  } catch (error) {
    console.error('❌ Params validation error:', error.errors);
    
    const formattedErrors = error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }));
    
    return res.status(400).json({
      error: 'Error de validación en parámetros de URL',
      details: formattedErrors,
      message: 'Los parámetros de URL no son válidos'
    });
  }
};