import express from "express";
import cors from "cors";
import sportsRouter from "./routes/sports.ts";

const app = express();
const PORT = 8000;

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))

// Middleware
app.use(express.json());

app.use('/api/sports', sportsRouter);

// Root GET route
app.get("/", (req, res) => {
  res.send("Welcome to the Peak backend API!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
