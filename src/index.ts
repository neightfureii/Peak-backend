import AgentAPI from "apminsight";
AgentAPI.config();

import express from "express";
import cors from "cors";
import sportsRouter from "./routes/sports.ts";
import studentsRouter from "./routes/students.ts";
import securityMiddleware from "./middleware/security.ts";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.ts";

const app = express();
const PORT = 8000;

if (!process.env.FRONTEND_URL) throw new Error('FRONTEND_URL is not set in .env file');

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))

// Better Auth
app.all('/api/auth/*splat', toNodeHandler(auth));

// Middleware
app.use(express.json());

app.use(securityMiddleware);

app.use('/api/sports', sportsRouter);
app.use('/api/students', studentsRouter);

// Root GET route
app.get("/", (req, res) => {
  res.send("Welcome to the Peak backend API!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
