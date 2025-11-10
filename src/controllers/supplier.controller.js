import Supplier from '../models/supplier.model.js';
import User from '../models/user.model.js';
// import { validationResult } from 'express-validator';
import { logger } from '../utils/logger.js';

// Crear un nuevo proveedor
export const createSupplier = async (req, res) => {
  try {
    // Validación será manejada por los middlewares de Zod

    const supplierData = {
      ...req.body,
      createdBy: req.user.id
    };

    const supplier = new Supplier(supplierData);
    await supplier.save();

    logger.info(`Proveedor creado: ${supplier.name} por usuario ${req.user.id}`);

    res.status(201).json({
      success: true,
      message: 'Proveedor creado exitosamente',
      data: supplier
    });
  } catch (error) {
    logger.error('Error al crear proveedor:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un proveedor con este email'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener todos los proveedores
export const getSuppliers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'active',
      services,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Filtrar por estado
    if (status) {
      query.status = status;
    }

    // Filtrar por servicios
    if (services) {
      const servicesArray = services.split(',');
      query.services = { $in: servicesArray };
    }

    // Búsqueda por texto
    if (search) {
      query.$text = { $search: search };
    }

    // Configurar ordenamiento
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const suppliers = await Supplier.find(query)
      .populate('createdBy', 'name email')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Supplier.countDocuments(query);

    res.json({
      success: true,
      data: suppliers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Error al obtener proveedores:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener proveedor por ID
export const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('reviews.user', 'name email');

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
      });
    }

    res.json({
      success: true,
      data: supplier
    });
  } catch (error) {
    logger.error('Error al obtener proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar proveedor
export const updateSupplier = async (req, res) => {
  try {
    // Validación será manejada por los middlewares de Zod

    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
      });
    }

    // Verificar permisos (solo el creador o admin puede actualizar)
    if (supplier.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para actualizar este proveedor'
      });
    }

    const updatedSupplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastActive: new Date() },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    logger.info(`Proveedor actualizado: ${updatedSupplier.name} por usuario ${req.user.id}`);

    res.json({
      success: true,
      message: 'Proveedor actualizado exitosamente',
      data: updatedSupplier
    });
  } catch (error) {
    logger.error('Error al actualizar proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar proveedor
export const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
      });
    }

    // Verificar permisos (solo el creador o admin puede eliminar)
    if (supplier.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar este proveedor'
      });
    }

    await Supplier.findByIdAndDelete(req.params.id);

    logger.info(`Proveedor eliminado: ${supplier.name} por usuario ${req.user.id}`);

    res.json({
      success: true,
      message: 'Proveedor eliminado exitosamente'
    });
  } catch (error) {
    logger.error('Error al eliminar proveedor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Agregar reseña a un proveedor
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const supplierId = req.params.id;

    const supplier = await Supplier.findById(supplierId);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
      });
    }

    // Verificar si el usuario ya dejó una reseña
    const existingReview = supplier.reviews.find(
      review => review.user.toString() === req.user.id
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Ya has dejado una reseña para este proveedor'
      });
    }

    await supplier.addReview(req.user.id, rating, comment);

    logger.info(`Reseña agregada al proveedor ${supplier.name} por usuario ${req.user.id}`);

    res.json({
      success: true,
      message: 'Reseña agregada exitosamente'
    });
  } catch (error) {
    logger.error('Error al agregar reseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Buscar proveedores por servicios
export const searchSuppliersByServices = async (req, res) => {
  try {
    const { services, date, location } = req.query;

    if (!services) {
      return res.status(400).json({
        success: false,
        message: 'Los servicios son requeridos para la búsqueda'
      });
    }

    const servicesArray = services.split(',');
    const query = {
      status: 'active',
      'availability.isAvailable': true,
      services: { $in: servicesArray }
    };

    // Si se especifica una fecha, verificar disponibilidad
    if (date) {
      const suppliers = await Supplier.find(query);
      const availableSuppliers = suppliers.filter(supplier => 
        supplier.isAvailableOnDate(date)
      );
      
      return res.json({
        success: true,
        data: availableSuppliers,
        total: availableSuppliers.length
      });
    }

    const suppliers = await Supplier.find(query)
      .populate('createdBy', 'name email')
      .sort({ 'rating.average': -1 });

    res.json({
      success: true,
      data: suppliers,
      total: suppliers.length
    });
  } catch (error) {
    logger.error('Error al buscar proveedores:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener proveedores mejor calificados
export const getTopRatedSuppliers = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const suppliers = await Supplier.getTopRated(parseInt(limit));

    res.json({
      success: true,
      data: suppliers
    });
  } catch (error) {
    logger.error('Error al obtener proveedores mejor calificados:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar disponibilidad de proveedor
export const updateAvailability = async (req, res) => {
  try {
    const { isAvailable, schedule, blackoutDates } = req.body;
    const supplierId = req.params.id;

    const supplier = await Supplier.findById(supplierId);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Proveedor no encontrado'
      });
    }

    // Verificar permisos
    if (supplier.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para actualizar la disponibilidad de este proveedor'
      });
    }

    await supplier.updateAvailability(isAvailable, schedule, blackoutDates);

    logger.info(`Disponibilidad actualizada para proveedor ${supplier.name}`);

    res.json({
      success: true,
      message: 'Disponibilidad actualizada exitosamente'
    });
  } catch (error) {
    logger.error('Error al actualizar disponibilidad:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de proveedores
export const getSupplierStats = async (req, res) => {
  try {
    const stats = await Supplier.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          averageRating: { $avg: '$rating.average' }
        }
      }
    ]);

    const totalSuppliers = await Supplier.countDocuments();
    const activeSuppliers = await Supplier.countDocuments({ status: 'active' });
    const verifiedSuppliers = await Supplier.countDocuments({ 'verification.isVerified': true });

    res.json({
      success: true,
      data: {
        total: totalSuppliers,
        active: activeSuppliers,
        verified: verifiedSuppliers,
        byStatus: stats
      }
    });
  } catch (error) {
    logger.error('Error al obtener estadísticas de proveedores:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
