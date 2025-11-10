import Event from '../models/events.model.js';
import EmailService from '../services/email.service.js';
import User from '../models/user.model.js';
import { config } from '../config.js';

// Eventos creados por el usuario autenticado
export const getEvents = async (req, res) => {
    try {
        const events = await Event.find({ user: req.user.id })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            count: events.length,
            events
        });
    } catch (error) {
        console.error('❌ Error al obtener eventos del usuario:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor al obtener eventos' 
        });
    }
};

// Eventos a los que el usuario está anotado
export const getAttendedEvents = async (req, res) => {
    try {
        const events = await Event.find({ "attendees.user": req.user.id })
            .populate('user', 'name email')
            .sort({ date: 1 });
        
        res.json({
            success: true,
            count: events.length,
            events
        });
    } catch (error) {
        console.error('❌ Error al obtener eventos asistidos:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor al obtener eventos asistidos' 
        });
    }
};

export const createEvent = async (req, res) => {
    try {
        const { name, description, date, endDate, duration, location, image, estado, capacidad, type, organizer, price, tags, category, visibility, urlStreaming } = req.body;
        
        const newEvent = new Event({
            name,
            description,
            date,
            endDate,
            duration,
            location,
            image,
            estado,
            capacidad,
            type,
            organizer,
            price,
            tags,
            category,
            visibility,
            urlStreaming,
            user: req.user.id
        });
        
        await newEvent.save();
        
        // Enviar email de confirmación de evento creado
        try {
            const user = await User.findById(req.user.id);
            if (user) {
                await EmailService.sendEventCreatedEmail(user.email, {
                    userName: user.name,
                    eventName: newEvent.name,
                    eventDate: newEvent.date,
                    eventLocation: newEvent.location,
                    eventUrl: `${config.FRONTEND_URL}/events/${newEvent._id}`
                });
                console.log(`✅ Email de confirmación de evento enviado a ${user.email}`);
            }
        } catch (emailError) {
            console.error('❌ Error al enviar email de confirmación de evento:', emailError);
            // No fallar la creación si el email falla
        }
        
        res.status(201).json({ 
            success: true,
            message: 'Evento creado correctamente', 
            event: newEvent 
        });
    } catch (error) {
        console.error('❌ Error al crear el evento:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                error: 'Error de validación',
                details: errors
            });
        }
        
        res.status(500).json({ 
            error: 'Error interno del servidor al crear el evento' 
        });
    }
};

export const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ 
                error: 'Evento no encontrado' 
            });
        }
        
        // Verificar que el usuario sea el propietario del evento
        if (event.user.toString() !== req.user.id) {
            return res.status(403).json({ 
                error: 'No tienes permisos para modificar este evento' 
            });
        }
        
        // Actualizar campos
        Object.keys(req.body).forEach(key => {
            if (key === 'date' || key === 'endDate') {
                event[key] = new Date(req.body[key]);
            } else {
                event[key] = req.body[key];
            }
        });
        
        // Historial de cambios
        event.historial.push({ 
            user: req.user.id, 
            action: 'editado',
            date: new Date()
        });
        
        await event.save();
        
        res.json({
            success: true,
            message: 'Evento actualizado correctamente',
            event
        });
    } catch (error) {
        console.error('❌ Error al actualizar el evento:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                error: 'ID de evento inválido' 
            });
        }
        
        res.status(500).json({ 
            error: 'Error interno del servidor al actualizar el evento' 
        });
    }
};

export const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ 
                error: 'Evento no encontrado' 
            });
        }
        
        // Verificar que el usuario sea el propietario del evento
        if (event.user.toString() !== req.user.id) {
            return res.status(403).json({ 
                error: 'No tienes permisos para eliminar este evento' 
            });
        }
        
        await Event.findByIdAndDelete(req.params.id);
        
        return res.status(200).json({ 
            success: true,
            message: 'Evento eliminado correctamente' 
        });
    } catch (error) {
        console.error('❌ Error al eliminar el evento:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                error: 'ID de evento inválido' 
            });
        }
        
        res.status(500).json({ 
            error: 'Error interno del servidor al eliminar el evento' 
        });
    }
};

export const getEvent = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validar que el ID no sea undefined o inválido
        if (!id || id === 'undefined' || id === 'null') {
            return res.status(400).json({
                success: false,
                error: 'ID de evento inválido'
            });
        }

        const event = await Event.findById(id)
            .populate('user', 'name email');

        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Evento no encontrado'
            });
        }

        console.log('📋 Evento encontrado:', {
            id: event._id,
            name: event.name,
            user: event.user?.name,
            date: event.date
        });

        res.json(event);
    } catch (error) {
        console.error('❌ Error al obtener el evento:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};

// Anotarse/comprar entradas
export const attendEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        const userId = req.user.id;

        console.log('🎫 Intentando comprar entradas:', { eventId: id, quantity, userId });

        const event = await Event.findById(id);
        console.log('🎫 Evento encontrado:', event ? 'SÍ' : 'NO');
        if (!event) {
            console.log('❌ Evento no encontrado con ID:', id);
            return res.status(404).json({ 
                error: 'Evento no encontrado' 
            });
        }

        // Verificar que el evento esté activo
        console.log('🎫 Estado del evento:', event.estado);
        if (event.estado !== 'activo') {
            console.log('❌ Evento no está activo');
            return res.status(400).json({ 
                error: 'No se pueden comprar entradas para este evento' 
            });
        }

        // Verificar que el evento no sea del mismo usuario
        console.log('🎫 Comparando usuarios:', { eventUser: event.user.toString(), currentUser: userId });
        if (event.user.toString() === userId) {
            console.log('❌ Usuario intentando comprar entradas para su propio evento');
            return res.status(400).json({ 
                error: 'No puedes comprar entradas para tu propio evento' 
            });
        }

        // Capacidad máxima
        const totalEntradas = event.attendees.reduce((sum, a) => sum + a.quantity, 0);
        console.log('🎫 Verificando capacidad:', { 
            totalEntradas, 
            quantity, 
            capacidad: event.capacidad,
            disponible: event.capacidad - totalEntradas 
        });
        if (totalEntradas + quantity > event.capacidad) {
            console.log('❌ No hay suficientes entradas disponibles');
            return res.status(400).json({ 
                error: 'No hay suficientes entradas disponibles',
                available: event.capacidad - totalEntradas
            });
        }

        // Verifica si ya está anotado
        const attendeeIndex = event.attendees.findIndex(a => a.user.toString() === userId);
        if (attendeeIndex !== -1) {
            event.attendees[attendeeIndex].quantity += quantity;
        } else {
            event.attendees.push({ user: userId, quantity });
        }

        // Actualiza el total de concurrentes
        event.concurrentes = event.attendees.reduce((sum, a) => sum + a.quantity, 0);

        await event.save();
        
        console.log('✅ Entradas compradas exitosamente:', {
            eventId: id,
            quantity,
            userId,
            concurrentes: event.concurrentes,
            available: event.capacidad - event.concurrentes
        });
        
        res.json({ 
            success: true,
            message: 'Te anotaste al evento correctamente', 
            concurrentes: event.concurrentes,
            available: event.capacidad - event.concurrentes
        });
    } catch (error) {
        console.error('❌ Error al anotarse al evento:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                error: 'ID de evento inválido' 
            });
        }
        
        res.status(500).json({ 
            error: 'Error interno del servidor al anotarse al evento' 
        });
    }
};

// Marcar como favorito
export const favoriteEvent = async (req, res) => {
    try {
        const { eventId } = req.body;
        const userId = req.user.id;
        
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ 
                error: 'Evento no encontrado' 
            });
        }

        const isFavorite = event.favoritos.includes(userId);
        
        if (!isFavorite) {
            event.favoritos.push(userId);
            await event.save();
            res.json({ 
                success: true,
                message: 'Evento marcado como favorito' 
            });
        } else {
            // Remover de favoritos
            event.favoritos = event.favoritos.filter(id => id.toString() !== userId);
            await event.save();
            res.json({ 
                success: true,
                message: 'Evento removido de favoritos' 
            });
        }
    } catch (error) {
        console.error('❌ Error al marcar favorito:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                error: 'ID de evento inválido' 
            });
        }
        
        res.status(500).json({ 
            error: 'Error interno del servidor al marcar favorito' 
        });
    }
};

// Agregar comentario
export const commentEvent = async (req, res) => {
    try {
        const { eventId, text } = req.body;
        const userId = req.user.id;
        
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ 
                error: 'Evento no encontrado' 
            });
        }

        event.comments.push({ 
            user: userId, 
            text,
            createdAt: new Date()
        });
        
        await event.save();
        
        res.json({ 
            success: true,
            message: 'Comentario agregado correctamente' 
        });
    } catch (error) {
        console.error('❌ Error al comentar evento:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                error: 'ID de evento inválido' 
            });
        }
        
        res.status(500).json({ 
            error: 'Error interno del servidor al comentar evento' 
        });
    }
};

export const getAllEvents = async (req, res) => {
    try {
        const { page = 1, limit = 10, type, estado, category } = req.query;
        
        const filter = {};
        if (type) filter.type = type;
        if (estado) filter.estado = estado;
        if (category) filter.category = category;
        
        const events = await Event.find(filter)
            .populate('user', 'name email')
            .sort({ date: 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        const total = await Event.countDocuments(filter);
        
        res.json({
            success: true,
            events,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('❌ Error al obtener todos los eventos:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor al obtener eventos' 
        });
    }
};

// Eventos destacados para la página principal (sin autenticación)
export const getFeaturedEvents = async (req, res) => {
    try {
        const { limit = 6 } = req.query;
        
        // Obtener eventos activos, ordenados por fecha y visitas
        const events = await Event.find({ 
            estado: 'activo',
            date: { $gte: new Date() } // Solo eventos futuros
        })
        .populate('user', 'name email')
        .sort({ 
            visitas: -1, // Más visitados primero
            date: 1      // Luego por fecha
        })
        .limit(parseInt(limit));
        
        res.json({
            success: true,
            count: events.length,
            events
        });
    } catch (error) {
        console.error('❌ Error al obtener eventos destacados:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor al obtener eventos destacados' 
        });
    }
};

// Subir imagen de evento
export const uploadEventImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: 'No se ha proporcionado ningún archivo'
            });
        }

        // Construir la URL completa de la imagen
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        console.log('📸 Imagen subida exitosamente:', {
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            url: imageUrl
        });

        res.json({
            success: true,
            message: 'Imagen subida exitosamente',
            imageUrl: imageUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('❌ Error al subir imagen:', error);
        res.status(500).json({
            error: 'Error interno del servidor al subir imagen'
        });
    }
};