const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
const corsOptions = {
  origin: "http://localhost:3000",
  methods: "GET,POST",
  allowedHeaders: "Content-Type"
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Initialize Google Gemini API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to MySQL database");
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Route to send a message and get a bot response using Google Gemini API
app.post("/send-message", async (req, res) => {
  const userMessage = req.body.message;

  try {
    // Call Gemini API with the user's message
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(userMessage);
    const botResponse = result.response.text();

    // Save the conversation to MySQL
    const query = "INSERT INTO messages (user_message, bot_response) VALUES (?, ?)";
    db.query(query, [userMessage, botResponse], (err, result) => {
      if (err) {
        console.error("Error inserting message:", err);
        res.status(500).json({ error: "Database error" });
      } else {
        res.json({ user_message: userMessage, bot_response: botResponse });
      }
    });
  } catch (err) {
    console.error("Error with Gemini API:", err);
    res.status(500).json({ error: "Gemini API error" });
  }
});

// Route to retrieve chat history
app.get("/chat-history", (req, res) => {
  const query = "SELECT user_message, bot_response FROM messages ORDER BY created_at DESC";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching chat history:", err);
      res.status(500).json({ error: "Database error" });
    } else {
      res.json(results);
    }
  });
});
