const http = require("http");
const nodemailer = require("nodemailer");
const cors = require("cors");

const express = require("express");
const app = express();

// Use CORS Middleware
app.use(cors({
  origin: '*', // Allow all origins or specify a domain for your mobile app
  methods: 'GET, POST',
}));
app.use(express.json()); // To parse JSON request bodies

app.post("/", (req, res) => {
  const { name, email, message } = req.body;

  const auth = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
      user: "pratham.13jaiswal@gmail.com",
      pass: "xaeimzpqxjptgmta",
    },
  });

  const receiver = {
    from: "pratham.13jaiswal@gmail.com",
    to: "prathamesh.r.jaiswal@gmail.com",
    subject: "Node Js Mail Testing!",
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
  };

  auth.sendMail(receiver, (error, emailResponse) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "Failed to send email" });
    }
    console.log("Email sent successfully!");
    res.status(200).json({ success: true, message: "Email sent successfully" });
  });
});

const server = http.createServer(app);

server.listen(8080, () => {
  console.log("Server is running on http://localhost:8080");
});
