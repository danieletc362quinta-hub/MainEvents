import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let mongod;

// Setup MongoDB Memory Server
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  // Connect to in-memory database
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Clean up database between tests
afterEach(async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

// Disconnect and stop MongoDB Memory Server
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
});

// Global test utilities
global.testUtils = {
  // Create test user
  createTestUser: async (userData = {}) => {
    const User = (await import('../src/models/user.model.js')).default;
    const defaultUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'user',
      ...userData
    };
    
    return await User.create(defaultUser);
  },

  // Create test event
  createTestEvent: async (eventData = {}, organizerId = null) => {
    const Event = (await import('../src/models/events.model.js')).default;
    const defaultEvent = {
      name: 'Test Event',
      description: 'Test event description',
      date: new Date(Date.now() + 86400000), // Tomorrow
      location: 'Test Location',
      type: 'musical',
      image: 'https://example.com/image.jpg',
      capacidad: 100,
      organizer: organizerId,
      ...eventData
    };
    
    return await Event.create(defaultEvent);
  },

  // Generate JWT token
  generateToken: async (user) => {
    const jwt = (await import('../src/libs/jwt.js')).default;
    return jwt.sign({ userId: user._id, role: user.role });
  },

  // Make authenticated request
  authenticatedRequest: (app, token) => {
    return (method, url, data = null) => {
      const request = app[method.toLowerCase()](url)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json');
      
      if (data) {
        return request.send(data);
      }
      
      return request;
    };
  }
}; 