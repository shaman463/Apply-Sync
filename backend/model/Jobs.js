import { Description } from '@headlessui/react'
import mongoose, { mongo } from 'mongoose'

const JobSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {type: String, required: true},
    company: {type: String},
    location: {type: String},
    salary: {type: String},
    description: {type: String},
    url: {type: String, required: true},
    status: {type: String, default: 'saved'}, // saved, applied, rejected, offered
    appliedDate: {type: Date},
    savedAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
});

export default mongoose.model("Job", JobSchema);