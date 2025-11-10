// Base de datos en memoria temporal para desarrollo
class MemoryDatabase {
  constructor() {
    this.data = {
      users: [],
      events: [],
      participants: [],
      reviews: [],
      coupons: [],
      notifications: []
    };
    this.counters = {
      users: 0,
      events: 0,
      participants: 0,
      reviews: 0,
      coupons: 0,
      notifications: 0
    };
  }

  // Generar ID único
  generateId(collection) {
    this.counters[collection]++;
    return `${collection}_${Date.now()}_${this.counters[collection]}`;
  }

  // Operaciones CRUD genéricas
  async create(collection, data) {
    const id = this.generateId(collection);
    const document = { _id: id, ...data, createdAt: new Date(), updatedAt: new Date() };
    this.data[collection].push(document);
    return document;
  }

  async findById(collection, id) {
    return this.data[collection].find(doc => doc._id === id);
  }

  async find(collection, query = {}) {
    let results = this.data[collection];
    
    // Aplicar filtros básicos
    if (query.email) {
      results = results.filter(doc => doc.email === query.email);
    }
    if (query.status) {
      results = results.filter(doc => doc.status === query.status);
    }
    if (query.organizer) {
      results = results.filter(doc => doc.organizer === query.organizer);
    }
    if (query.eventId) {
      results = results.filter(doc => doc.eventId === query.eventId);
    }
    if (query.userId) {
      results = results.filter(doc => doc.userId === query.userId);
    }

    // Paginación básica
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;
    
    const total = results.length;
    const paginatedResults = results.slice(skip, skip + limit);

    return {
      data: paginatedResults,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    };
  }

  async update(collection, id, data) {
    const index = this.data[collection].findIndex(doc => doc._id === id);
    if (index === -1) return null;
    
    this.data[collection][index] = {
      ...this.data[collection][index],
      ...data,
      updatedAt: new Date()
    };
    
    return this.data[collection][index];
  }

  async delete(collection, id) {
    const index = this.data[collection].findIndex(doc => doc._id === id);
    if (index === -1) return false;
    
    this.data[collection].splice(index, 1);
    return true;
  }

  async count(collection, query = {}) {
    const results = await this.find(collection, query);
    return results.total;
  }

  // Métodos específicos para usuarios
  async findUserByEmail(email) {
    return this.data.users.find(user => user.email === email);
  }

  async findUserByToken(token) {
    return this.data.users.find(user => user.token === token);
  }

  // Métodos específicos para eventos
  async findFeaturedEvents(limit = 6) {
    const featuredEvents = this.data.events
      .filter(event => event.status === 'active' && event.visibility === 'public')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
    
    return {
      events: featuredEvents,
      count: featuredEvents.length,
      success: true
    };
  }

  // Inicializar con datos de ejemplo
  async seed() {
    console.log('🌱 Seeding memory database with sample data...');
    
    // Crear usuarios de ejemplo
    await this.create('users', {
      name: 'Admin',
      lastName: 'User',
      email: 'admin@mainevents.com',
      password: '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5',
      phone: '1234567890',
      accountType: 'admin',
      isActive: true
    });

    await this.create('users', {
      name: 'Juan',
      lastName: 'Pérez',
      email: 'juan@example.com',
      password: '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aA0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8tT9uU0vV1wW2xX3yY4zZ5',
      phone: '0987654321',
      accountType: 'user',
      isActive: true
    });

    // Crear eventos de ejemplo
    await this.create('events', {
      name: 'Conferencia de Tecnología 2024',
      description: 'La mayor conferencia de tecnología del año con los mejores speakers internacionales.',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
      organizer: 'TechCorp',
      date: new Date('2024-03-15T18:00:00.000Z'),
      location: 'Centro de Convenciones',
      price: 2500,
      status: 'active',
      visibility: 'public',
      type: 'Tecnología',
      capacity: 500,
      concurrentes: 342,
      rating: { average: 4.8, count: 156 }
    });

    await this.create('events', {
      name: 'Workshop de Diseño UX/UI',
      description: 'Aprende las mejores prácticas de diseño de interfaces de usuario.',
      image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=600&fit=crop',
      organizer: 'Design Studio',
      date: new Date('2024-03-20T14:00:00.000Z'),
      location: 'Espacio Creativo',
      price: 1200,
      status: 'active',
      visibility: 'public',
      type: 'Educación',
      capacity: 50,
      concurrentes: 23,
      rating: { average: 4.6, count: 89 }
    });

    await this.create('events', {
      name: 'Networking Empresarial',
      description: 'Conecta con otros profesionales y expande tu red de contactos.',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop',
      organizer: 'Business Network',
      date: new Date('2024-03-25T19:00:00.000Z'),
      location: 'Hotel Plaza',
      price: 800,
      status: 'active',
      visibility: 'public',
      type: 'Negocios',
      capacity: 200,
      concurrentes: 156,
      rating: { average: 4.4, count: 67 }
    });

    console.log('✅ Memory database seeded successfully');
  }
}

// Instancia global
const memoryDB = new MemoryDatabase();

// Inicializar con datos de ejemplo
memoryDB.seed();

export default memoryDB;
