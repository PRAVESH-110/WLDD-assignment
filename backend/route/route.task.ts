import express from "express";
import { User } from "../model/model.user"
import { z } from "zod";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import authMiddleware from "../middleware/authMiddleware"

dotenv.config();

const taskRouter = express.Router();
taskRouter.use(express.json());


// Create a new task
taskRouter.post('/', authMiddleware, async function (req, res) {
    
})

// List tasks for the logged-in user
taskRouter.get('/', authMiddleware, async function (req, res) {

})

//update a task
taskRouter.put('/:id', authMiddleware, async function (req, res) {

})
//update a task
taskRouter.delete('/:id', authMiddleware, async function (req, res) {

})

export default taskRouter;