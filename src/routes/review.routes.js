import { Router } from 'express';
import { authRequired } from '../middlewares/validateToken.js';
import { validateSchema } from '../middlewares/validator.middlewares.js';
import { 
  createReview, 
  getEventReviews, 
  updateReview, 
  deleteReview, 
  markReviewHelpful, 
  getUserReviews 
} from '../controllers/review.controller.js';
import {
  createReviewSchema,
  updateReviewSchema,
  helpfulReviewSchema
} from '../schemas/review.schemas.js';

const router = Router();

// Rutas públicas (solo lectura)
router.get('/reviews/event/:eventId', getEventReviews);


// Rutas protegidas
router.post('/reviews', authRequired, validateSchema(createReviewSchema), createReview);
router.put('/reviews/:id', authRequired, validateSchema(updateReviewSchema), updateReview);
router.delete('/reviews/:id', authRequired, deleteReview);
router.post('/reviews/:reviewId/helpful', authRequired, validateSchema(helpfulReviewSchema), markReviewHelpful);
router.get('/reviews/user', authRequired, getUserReviews);

export default router; 