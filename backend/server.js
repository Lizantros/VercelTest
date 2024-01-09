// Load environment variables from a .env file into process.env
require("dotenv").config();

// Import required modules
const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

// Create an instance of the Express application
const app = express();

// Apply middleware to enable CORS (Cross-Origin Resource Sharing)
app.use(cors());
// Apply middleware to parse JSON bodies
app.use(express.json());
// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));


// Database connection setup using MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
 
});


// Connect to the MySQL database
db.connect((err) => {
  if (err) {
    // Log an error if the connection fails
    console.error("Database connection error:", err.stack);
  } else {
    // Log a success message on successful connection
    console.log("Connected to the database.");

    // Perform an initial test query to the database
    db.query("SELECT 1", (err, results) => {
      if (err) {
        // Log an error if the query fails
        console.error("Initial DB query failed:", err);
      } else {
        // Log a success message with the query results
        console.log("Initial DB query succeeded:", results);
      }
    });
  }
});

// bcrypt test to demonstrate password hashing
async function testBcrypt() {
  try {
    // Hash a test string
    const hash = await bcrypt.hash("test", 10);
    console.log("Hashed string:", hash);
  } catch (err) {
    console.error("bcrypt error:", err);
  }
}
testBcrypt();

// Middleware to authenticate JWT tokens
function authenticateToken(req, res, next) {
  // Extract the token from the Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    // If no token is provided, return 401 Unauthorized
    return res.sendStatus(401);
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // If token verification fails, return 403 Forbidden
      return res.sendStatus(403);
    }
    // Attach the user data to the request object
    req.user = user;
    // Proceed to the next middleware
    next();
  });
}

// Route for user signup
app.post("/signup", async (req, res) => {
  // Validate request data
  if (!req.body.name || !req.body.email || !req.body.password) {
    // If required fields are missing, return 400 Bad Request
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Prepare SQL query to insert a new user
    const sql = "INSERT INTO login (name, email, password) VALUES (?)";
    const values = [req.body.name, req.body.email, hashedPassword];
    // Execute the query
    db.query(sql, [values], (err, data) => {
      if (err) {
        // Log and return error if the query fails
        console.error("Database query error:", err);
        return res.status(500).json({ error: err.message });
      }
      // Return a success message if user is created
      return res.status(201).json({ message: "User created" });
    });
  } catch (err) {
    // Log and return error if the try block fails
    console.error("Error caught in /signup route:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Route for user login
app.post("/login", async (req, res) => {
  // Destructure email and password from request body
  const { email, password } = req.body;

  // SQL query to fetch the user by email
  const sql = "SELECT * FROM login WHERE email = ?";
  // Execute the query
  db.query(sql, [email], async (err, results) => {
    if (err) {
      // Log and return error if the query fails
      console.error("Database query error:", err);
      return res.status(500).json({ error: err.message });
    }

    if (results.length > 0) {
      // User found
      const user = results[0];
      // Compare the hashed password
      if (await bcrypt.compare(password, user.password)) {
        // Generate a JWT token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });
        // Return the token and user name
        return res.json({ token, name: user.name });
      } else {
        // Password mismatch
        return res.status(401).json({ error: "Invalid credentials" });
      }
    } else {
      // User not found
      return res.status(401).json({ error: "Invalid credentials" });
    }
  });
});

// Route to get user info
app.get("/user-info", authenticateToken, (req, res) => {
  // Extract userId from the authenticated user
  const userId = req.user.userId;

  // SQL query to fetch user data
  const sql =
    "SELECT name, email, gw2_account_name, compteImage FROM login WHERE id = ?";
  // Execute the query
  db.query(sql, [userId], (err, results) => {
    if (err) {
      // Log and return error if the query fails
      console.error("Database query error:", err);
      return res.status(500).json({ error: err.message });
    }

    if (results.length > 0) {
      // User found
      const userInfo = results[0];
      // Return user info
      return res.json({
        name: userInfo.name,
        email: userInfo.email,
        gw2AccountName: userInfo.gw2_account_name,
        compteImage: userInfo.compteImage,
      });
    } else {
      // User not found
      return res.status(404).json({ error: "User not found" });
    }
  });
});

// Route to update GW2 account name
app.post("/update-gw2-account-name", authenticateToken, (req, res) => {
  // Extract userId and gw2AccountName from the request
  const userId = req.user.userId;
  const { gw2AccountName } = req.body;

  // Validate the request body
  if (!gw2AccountName) {
    // Return error if gw2AccountName is not provided
    return res.status(400).json({ error: "GW2 account name is required" });
  }

  // SQL query to update the user's GW2 account name
  const sql = "UPDATE login SET gw2_account_name = ? WHERE id = ?";
  // Execute the query
  db.query(sql, [gw2AccountName, userId], (err, results) => {
    if (err) {
      // Log and return error if the query fails
      console.error("Database query error:", err);
      return res
        .status(500)
        .json({ error: "Failed to update GW2 account name" });
    }
    if (results.affectedRows === 0) {
      // User not found
      return res.status(404).json({ error: "User not found" });
    }
    // Return success message
    return res.json({ message: "GW2 account name updated successfully" });
  });
});

// Create a post route
app.post("/create-post", authenticateToken, async (req, res) => {
  // Extract title and content from request body
  const { title, content } = req.body;
  // Get the userId from the authenticated user
  const userId = req.user.userId;

  // SQL query to insert a new post
  const sql = "INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)";
  // Execute the query
  db.query(sql, [title, content, userId], (err, result) => {
    if (err) {
      // Log and return error if the query fails
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Error creating post" });
    }
    // Return success message for post creation
    return res.status(201).json({ message: "Post created successfully" });
  });
});

// Get all posts route
app.get("/get-posts", async (req, res) => {
  // SQL query to fetch all posts along with user info
  const sql = `
    SELECT 
      p.id, p.title, p.content, p.user_id, p.creation_date, 
      u.name AS userName, u.gw2_account_name, u.compteImage
    FROM posts p
    JOIN login u ON p.user_id = u.id
    ORDER BY p.creation_date DESC;
  `;

  // Execute the query
  db.query(sql, (err, results) => {
    if (err) {
      // Log and return error if the query fails
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Error fetching posts" });
    }
    // Return the fetched posts
    return res.json(results);
  });
});

// Route to create a response for a post
app.post("/posts/:id/responses", authenticateToken, (req, res) => {
  // Extract post ID from URL parameters
  const postId = req.params.id;
  const userId = req.user.userId; // Assuming your token includes userId
  const { content } = req.body; // Extract response content from request body

  // Validate the request body
  if (!content) {
    return res.status(400).json({ error: "Content is required" });
  }

  // SQL query to insert a new response
  const sql = "INSERT INTO responses (post_id, user_id, content) VALUES (?, ?, ?)";
  const values = [postId, userId, content];

  // Execute the query
  db.query(sql, values, (err, result) => {
    if (err) {
      // Log and return error if the query fails
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Error creating response" });
    }
    // Return success message for response creation
    return res.status(201).json({ message: "Response created successfully" });
  });
});

// Get post details and responses route
app.get("/posts/:id", async (req, res) => {
  // Extract post ID from the URL parameters
  const { id } = req.params;

  // SQL query to fetch the post details
  const postQuery = `
    SELECT posts.*, login.name AS userName, login.gw2_account_name, login.compteImage 
    FROM posts 
    JOIN login ON posts.user_id = login.id 
    WHERE posts.id = ?`;

  // SQL query to fetch responses for the post
  const responsesQuery = `
    SELECT responses.*, login.name, login.gw2_account_name 
    FROM responses 
    JOIN login ON responses.user_id = login.id 
    WHERE post_id = ? 
    ORDER BY creation_date DESC`;

  try {
    // Fetch post details using a promise for asynchronous operation
    const postDetails = await new Promise((resolve, reject) => {
      db.query(postQuery, [id], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0]);
        }
      });
    });

    // Fetch post responses using a promise for asynchronous operation
    const postResponses = await new Promise((resolve, reject) => {
      db.query(responsesQuery, [id], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    // Return post details and responses
    res.json({
      post: postDetails,
      responses: postResponses,
    });
  } catch (err) {
    // Log and return error if there's an issue with the database queries
    console.error("Database query error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete a post route
app.delete('/posts/:postId', authenticateToken, async (req, res) => {
  // Extract postId from URL parameters
  const { postId } = req.params;
  // Get userId from authenticated user
  const userId = req.user.userId;

  // SQL query to verify the post belongs to the user
  const verifyQuery = 'SELECT * FROM posts WHERE id = ? AND user_id = ?';
  // SQL query to delete the post
  const deleteQuery = 'DELETE FROM posts WHERE id = ?';

  // Verify the post belongs to the user
  db.query(verifyQuery, [postId, userId], (err, results) => {
    if (err) {
      // Log and return error if the query fails
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      // If no matching post is found, return unauthorized error
      return res.status(403).json({ error: "Unauthorized" });
    }

    db.query(deleteQuery, [responseId], (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      return res.json({ message: "Response deleted successfully" });
    });
  });
});

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Specify the destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    // Generate a unique filename for the uploaded file
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Upload image route
app.post("/upload-image", authenticateToken, upload.single('image'), (req, res) => {
  const userId = req.user.userId; // Get the user ID from the request object
  if (!req.file) {
    // If no file was uploaded, return an error response
    return res.status(400).send('No file uploaded.');
  }
  const imagePath = req.file.path; // Get the path where the uploaded image is saved

  const sql = "UPDATE login SET compteImage = ? WHERE id = ?";
  db.query(sql, [imagePath, userId], (err, results) => {
    if (err) {
      // If there was an error executing the database query, return an error response
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Failed to update image data" });
    }
    // If the query was successful, return a success response
    return res.json({ message: "Image uploaded and data updated successfully" });
  });
});


// Get user image route
app.get("/get-user-image/:userId", async (req, res) => {
  const userId = req.params.userId; // Get the userId from the request parameters
  const sql = "SELECT compteImage FROM login WHERE id = ?"; // SQL query to fetch the user image path from the database

  db.query(sql, [userId], (err, results) => { // Execute the SQL query with the userId as a parameter
    if (err) {
      console.error("Database query error:", err); // Log any database query errors
      return res.status(500).send("Error fetching image"); // Send an error response if there is an error
    }

    if (results[0] && results[0].compteImage) {
      // If the query results contain a valid image path
      res.send({ imagePath: results[0].compteImage }); // Send the image path as a response
    } else {
      res.status(404).send("No image found"); // If no image path is found, send a 404 response
    }
  });
});



// Start the server
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});