import express from 'express';
import {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
  addReview,
  searchSuppliersByServices,
  getTopRatedSuppliers,
  updateAvailability,
  getSupplierStats
} from '../controllers/supplier.controller.js';
import { authRequired } from '../middlewares/validateToken.js';
import { validateSupplier, validateReview } from '../schemas/supplier.schemas.js';

const router = express.Router();

// Rutas públicas
router.get('/suppliers', getSuppliers);
router.get('/suppliers/top-rated', getTopRatedSuppliers);
router.get('/suppliers/search', searchSuppliersByServices);
router.get('/suppliers/stats', getSupplierStats);

// Rutas protegidas
router.use(authRequired);

// CRUD de proveedores
router.post('/suppliers', validateSupplier, createSupplier);
router.get('/suppliers/:id', getSupplierById);
router.put('/suppliers/:id', validateSupplier, updateSupplier);
router.delete('/suppliers/:id', deleteSupplier);

// Reseñas
router.post('/suppliers/:id/reviews', validateReview, addReview);

// Disponibilidad
router.put('/suppliers/:id/availability', updateAvailability);

export default router;
