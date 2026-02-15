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
        default: "pending"
    },
    dueDate: {
        type: Date,

    },
    owner: {
        type: Schema.Types.ObjectId,  // Fixed: Use Schema.Types.ObjectId
        ref: 'User',
        required: true,
        index: true
    }
}, {
    timestamps: true  // This creates createdAt and updatedAt automatically
});
export const Task = mongoose.model('Task', taskSchema)