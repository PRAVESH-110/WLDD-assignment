import mongoose from "mongoose";
const { Schema } = mongoose;

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "completed"],
        default: "pending",
        index: true  // Index for efficient filtering by status
    },
    dueDate: {
        type: Date,

    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true  // Index for efficient queries by owner
    }
}, {
    timestamps: true  // This creates createdAt and updatedAt automatically
});
export const Task = mongoose.model('Task', taskSchema)