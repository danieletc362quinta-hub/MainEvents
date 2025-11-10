import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },

  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    maxlength: 100,
    trim: true
  },
  comment: {
    type: String,
    required: true,
    maxlength: 1000,
    trim: true
  },
  categories: {
    organization: { type: Number, min: 1, max: 5 },
    value: { type: Number, min: 1, max: 5 },
    experience: { type: Number, min: 1, max: 5 },
    service: { type: Number, min: 1, max: 5 }
  },
  helpful: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    helpful: Boolean
  }],
  verified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Índices
reviewSchema.index({ event: 1, createdAt: -1 });

reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ rating: -1 });

// Middleware para actualizar rating promedio
reviewSchema.post('save', async function() {
  const Review = this.constructor;
  
  if (this.event) {
    const stats = await Review.aggregate([
      { $match: { event: this.event, status: 'approved' } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    
    if (stats.length > 0) {
      await mongoose.model('Event').findByIdAndUpdate(this.event, {
        rating: {
          average: Math.round(stats[0].avgRating * 10) / 10,
          count: stats[0].count
        }
      });
    }
  }
  

});

export default mongoose.model('Review', reviewSchema); 