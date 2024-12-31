const express = require("express");
const path = require("path");
const cors = require("cors"); // Import cors
const nodemailer = require("nodemailer");
const LogInCollection = require("./mongo"); // Assumes `mongo.js` is correctly set up
const http = require("http");

const app = express();
const port = process.env.PORT || 8080;

// Enable CORS for Live Server
app.use(cors({
    origin: "http://127.0.0.1:5500", // Allow requests from Live Server
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
}));

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up static file serving and view engine
const publicPath = path.join(__dirname);
console.log("Serving static files from:", publicPath);

app.set("view engine", "ejs");
app.set("views", publicPath);
app.use(express.static(publicPath));

// Routes for Register and Login Pages
app.get("/", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});


app.get('/get-pdfs', async (req, res) => {
    try {
        const pdfs = await Pdf.find();
        res.json(pdfs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching PDFs', error });
    }
});

// Register route to create new user
app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).send('All fields are required');
    }

    try {
        // Check if the user already exists
        const existingUser = await LogInCollection.findOne({ email });
        if (existingUser) {
            return res.status(400).send('User already exists');
        }

        // Create a new user
        const newUser = new LogInCollection({
            name,
            email, // Ensure this is included
            password
        });

        // Save the new user to the database
        await newUser.save();
        res.status(201).send('Registration successful');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error occurred during registration');
    }
});

// Login route for existing users
app.post("/login", async (req, res) => {
    const { name, password } = req.body;

    try {
        // Check if user exists
        const user = await LogInCollection.findOne({ name });
        if (!user) {
            return res.status(404).send("User not found");
        }

        // Validate password
        if (user.password !== password) {
            return res.status(400).send("Incorrect password");
        }

        // Login successful
        res.status(200).send("Login successful!");
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("An error occurred during login");
    }
});

// Contact form route for email sending
app.post("/", (req, res) => {
    const { name, email, message } = req.body;

    const auth = nodemailer.createTransport({
        service: "gmail",
        secure: true,
        port: 465,
        auth: {
            user: "pratham.13jaiswal@gmail.com",
            pass: "xaeimzpqxjptgmta", // Please avoid hardcoding sensitive information like this
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

// Start the server
const server = http.createServer(app);
server.listen(port, () => {
    console.log("Server is running on http://localhost:" + port);
});
