import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import cors from 'cors'

import path from 'path'
import { fileURLToPath } from "url";

import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import flashcardRoutes from './routes/flashcardRoutes.js';
import aiRoutes from './routes/aiRoutes.js'
import connectDB from "./config/db.js";
import errorHandler from './middleware/errorHandler.js'
import quizRoutes from "./routes/quizRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";


// ES6 module __dirname and __filename alternative  
const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename);
const _dirname = path.resolve();
const app = express()

// database connection
connectDB();

// Middleware
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Static Folder
app.use('/uploads', express.static(path.join(dirname, 'uploads')));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/progress", progressRoutes);

app.use(express.static(path.join(_dirname, "/frontend/dist")));
app.get((req, res) =>{
    res.sendFile(path.resolve(_dirname, "frontend", "dist", "index.html"))
})

app.use(errorHandler); 
// error handler
app.use((req,res) => {
    res.status(404).json({
        sucess:false,
        error:'Route not found',
        statusCode:404
    })
})

const PORT = process.env.PORT || 8000;
app.listen(PORT, ()=>{
    console.log(`Server running in ${process.env.NODE_ENV} mode on ${PORT} `);  
})

process.on('unhandeledRejection', (err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
    
})