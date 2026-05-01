import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please provide a username.'],
        trim: true,
        unique: true,
        minLength: [3, '']
    },
    email: {
        type: String,
        required: [true, 'Provide an e-mail.'],
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email.']
    },
    password: {
        type: String,
        required: [true, 'Please provide your password.'],
        minLength: [6, 'Ypur password must have atleast 6 characters.'],
        select: false
    },
    firstName: {
        type: String,
        trim: true,
        default: ""
    },

    middleName: {
        type: String,
        trim: true,
        default: ""
    },

    lastName: {
        type: String,
        trim: true,
        default: ""
    },

    phone: {
        type: String,
        trim: true,
        default: ""
    },

    dob: {
        type: Date,
        default: null
    },

    gender: {
        type: String,
        enum: ["Male", "Female", "Other", ""],
        default: ""
    },

    university: {
        type: String,
        trim: true,
        default: ""
    },

    school: {
        type: String,
        trim: true,
        default: ""
    },

    major: {
        type: String,
        trim: true,
        default: ""
    },

    learningTime: {
        type: String,
        trim: true,
        default: ""
    },

    timezone: {
        type: String,
        trim: true,
        default: ""
    },

    language: {
        type: String,
        trim: true,
        default: ""
    },

    linkedin: {
        type: String,
        trim: true,
        default: ""
    },

    github: {
        type: String,
        trim: true,
        default: ""
    },

    portfolio: {
        type: String,
        trim: true,
        default: ""
    }
}, {
    timestamps: true
})

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

const User = mongoose.model('User', userSchema)

export default User;