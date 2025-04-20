import cookieParser from 'cookie-parser';
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { connectDb } from './lib/db.js';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
const app = express();
dotenv.config();
const PORT = process.env.PORT;
app.use(express.json());
app.use(cookieParser());
app.use(cors())

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/" , (req,res)=>{
  res.status(200).json({message: "Welcome to the Chat App API"});
})

app.listen(PORT,()=>{
  console.log("Server is Running On Port: " + PORT);
  connectDb();
})