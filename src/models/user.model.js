import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
        trim: true,
        default: 'Usuario'
    },
    lastName: {
        type: String,
        required: false,
        trim: true,
        default: ''
    },
    role: {
        type: String,
        enum: ['admin', 'user', 'supplier'],
        required: true,
        default: 'user'
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: function() {
            // La contraseña es requerida solo si no hay cuentas sociales
            return !this.socialAccounts || Object.keys(this.socialAccounts).length === 0;
        }
    },
    phone: {
        type: String,
        trim: true,
        default: ''
    },
    location: {
        type: String,
        trim: true,
        default: ''
    },
    avatar: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        trim: true,
        maxLength: 500,
        default: ''
    },
    socialProviders: {
        type: Map,
        of: {
            id: String,
            email: String,
            name: String,
            picture: String,
            lastLogin: Date
        },
        default: {}
    },
    isActive: {
        type: Boolean,
        default: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date,
        default: null
    },
    socialAccounts: {
        google: {
            id: String,
            email: String,
            name: String,
            picture: String,
            verified: Boolean,
            lastLogin: Date
        },
        facebook: {
            id: String,
            email: String,
            name: String,
            picture: String,
            verified: Boolean,
            lastLogin: Date
        },
        apple: {
            id: String,
            email: String,
            name: String,
            picture: String,
            verified: Boolean,
            lastLogin: Date
        }
    },
    securityFlags: [{
        type: {
            type: String,
            enum: ['REVIEW_REQUIRED', 'SUSPICIOUS_ACTIVITY', 'MULTIPLE_FAILED_ATTEMPTS']
        },
        reason: String,
        timestamp: {
            type: Date,
            default: Date.now
        },
        reviewed: {
            type: Boolean,
            default: false
        }
    }],
    preferences: {
        language: {
            type: String,
            enum: ['es', 'en'],
            default: 'es'
        },
        notifications: {
            email: {
                type: Boolean,
                default: true
            },
            push: {
                type: Boolean,
                default: true
            },
            sms: {
                type: Boolean,
                default: false
            }
        },
        privacy: {
            profileVisibility: {
                type: String,
                enum: ['public', 'private', 'friends'],
                default: 'public'
            },
            showEmail: {
                type: Boolean,
                default: false
            },
            showPhone: {
                type: Boolean,
                default: false
            }
        }
    }
}, {
    timestamps: true
});

export default mongoose.model('User', userSchema)
