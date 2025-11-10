import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const eventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
    endDate: { type: Date }, // fecha de fin opcional
    duration: { type: Number }, // en minutos
    location: { type: String, required: true },
    image: { type: String, default: 'https://via.placeholder.com/800x400?text=Imagen+del+Evento' }, // URL o nombre de archivo
    organizer: { type: String, required: true },

    type: {
        type: String,
        enum: ['publico', 'privado', 'corporativo', 'musical', 'deportivo', 'educativo', 'cultural'],
        default: 'publico',
        required: true
    },
    estado: {
        type: String,
        enum: ['activo', 'cancelado', 'completado', 'pendiente'],
        default: 'activo',
        required: true
    },
    capacidad: { type: Number, required: true },
    concurrentes: { type: Number, default: 0 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // creador
    price: { type: Number, required: true, min: 0 }, // 0 = gratis
    attendees: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        quantity: { type: Number, required: true, min: 1 }
    }],
    tags: [{ type: String }],
    category: { type: String },
    visibility: { type: String, enum: ['publico', 'privado'], default: 'publico' },
    urlStreaming: { type: String },
    comments: [commentSchema],
    favoritos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    visitas: { type: Number, default: 0 },
    rating: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        count: { type: Number, default: 0 }
    },
    historial: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        action: String,
        date: { type: Date, default: Date.now }
    }],

}, { 
    timestamps: true,
    // Configuración de índices optimizados
    indexes: [
        // Índice compuesto para búsquedas por tipo y fecha
        { type: 1, date: 1, estado: 1 },
        // Índice para búsquedas por organizador
        { organizer: 1, date: -1 },
        // Índice para búsquedas por ubicación
        { location: 1 },
        // Índice para búsquedas por precio
        { price: 1 },
        // Índice para búsquedas por capacidad
        { capacidad: 1 },
        // Índice para búsquedas por usuario creador
        { user: 1, date: -1 },
        // Índice para búsquedas por rating
        { 'rating.average': -1 },
        // Índice para búsquedas por tags
        { tags: 1 },
        // Índice para búsquedas por estado
        { estado: 1, date: 1 },
        // Índice para búsquedas por fecha (para eventos próximos)
        { date: 1, estado: 1 },
        // Índice para búsquedas por nombre (text search)
        { name: 'text', description: 'text' }
    ]
});

// Configurar opciones de texto search
eventSchema.index({ name: 'text', description: 'text' }, {
    weights: {
        name: 10,
        description: 5
    }
});

export default mongoose.model("Event", eventSchema);