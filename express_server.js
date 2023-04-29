// Import required modules
const express = require("express");
const app = express();
const PORT = 8080;
const bcrypt = require("bcryptjs");

app.use(express.static("public"));

// Import data objects
const { users, urlDatabase } = require("./data");

// Import helper functions from external file
const { getUserByEmail, generateRandomString, setLongUrl } =
  require("./helpers/helpers")({ users });

// Configure cookie session
const cookieSession = require("cookie-session");

app.use(
  cookieSession({
    name: "session",
    keys: ["235fgs", "sef25", "test", "app", "hello"],
  })
);

// Configure view engine
app.set("view engine", "ejs");

// Parse incoming request bodies with urlencoded payloads
app.use(express.urlencoded({ extended: true }));

// Define routes
app.get("/urls.json", (req, res) => {
  // Return JSON object containing user data
  res.json(users);
});

// Homepage
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    // Message when user is not logged in
    res.status(401).send("Login required");
  } else {
    // Filter urlDatabase to only show URLs created by the current user
    const userUrls = {};
    for (const [id, urlObj] of Object.entries(urlDatabase)) {
      if (urlObj.userID === userID) {
        userUrls[id] = urlObj.longURL;
      }
    }
    // Render URLs index page with user-specific URL data
    const templateVars = {
      user: users[userID],
      urls: userUrls,
    };
    res.render("urls_index", templateVars);
  }
});

// Display form for creating a new URL
app.get("/urls/new", (req, res) => {
  const userID = req.session["user_id"];
  if (!userID) {
    // Redirect to login page if user is not logged in
    res.status(401).send("Login");
  } else {
    // Render new URL form with user data
    let templateVars = {
      user: users[userID],
    };
    res.render("urls_new", templateVars);
  }
});

// Create a new short URL
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    // Return 401 Unauthorized status if user is not logged in
    res.status(401).send("Unauthorized");
  } else {
    // Generate random short URL ID and add new URL to database
    let id = generateRandomString();
    urlDatabase[id] = {
      longURL: setLongUrl(req.body.longURL),
      userID: userID,
    };
    // Redirect to new URL page
    res.redirect(`/urls/${id}`);
  }
});

// Delete a short URL
app.post("/urls/:id/delete", (req, res) => {
  if (!req.session.user_id) {
    // If not logged in, redirect to login page or show an error message
    res.status(401).send("You need to log in to delete a URL");
    return;
  }
  const url = urlDatabase[req.params.id];
  if (!url) {
    res.status(404).send("URL not found");
    return;
  }

  if (url.userID !== req.session.user_id) {
    res.status(403).send("You are not authorized to delete this URL");
    return;
  }

  delete urlDatabase[req.params.id];
  res.redirect("/urls/");
});

// Redirect to long URL associated with a short URL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
  console.log(longURL);
});


app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const id = req.params.id;

  if (!userID) {
    // If user is not logged in, redirect to login page
    res.status(401).send("Login required");
  } else if (!urlDatabase[id]) {
    // If the ID does not exist in the database, send an error message
    res.status(404).send("URL not found");
  } else {
    // If user is logged in and the ID exists, render the urls_show template with the provided URL data
    const templateVars = {
      user: users[req.session["user_id"]],
      id: id,
      longURL: urlDatabase[id],
    };
    res.render("urls_show", templateVars);
  }
});

app.post("/urls/:id", (req, res) => {
  // Check if the user is logged in
  if (!req.session.user_id) {
    res.status(401).send("Unauthorized");
    return;
  }
  const id = req.params.id;
  const longURL = req.body.longURL;
  if (!urlDatabase[id] || urlDatabase[id].userID !== req.session.user_id) {
    res.status(403).send("Forbidden");
    return;
  }
  urlDatabase[id].longURL = longURL;
  res.redirect("/urls");
});

// Login user

app.post("/login", (req, res) => {
  // Extract the email and password from the request body
  const { email, password } = req.body;
  // Check if the user exists in the user database
  const user = getUserByEmail(email, users);
  // Check if the provided password matches the password associated with the email
  if (user && bcrypt.compareSync(password, user.password)) {
    // Set the user_id cookie and redirect to the urls page
    req.session.user_id = user.id;
    res.redirect("/urls");
  } else {
    // Otherwise, send a 401 Unauthorized response
    res.status(401).send("Bad credentials");
  }
});

app.post("/logout", (req, res) => {
  // Clear the user_id cookie and redirect to the login page
  req.session = null;
  res.redirect("/login");
});

//////  REGISTER USER //////

app.get("/register", (req, res) => {
  // Render the urls_register template with the user data
  let templateVars = { user: users[req.session["user_id"]] };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  // Extract the email and password from the request body
  const { email, password } = req.body;
  // Generate a unique user ID
  const userId = Math.random().toString(36).substring(2, 8);
  // Hash the password for storage
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Check if the user already exists in the user database
  for (let userId in users) {
    if (users[userId].email === email) {
      // If the user already exists, send a 400 Bad Request response
      res.status(400).send("User already exist");
      return;
    }
  }

  // Add the new user to the user database
  users[userId] = {
    id: userId,
    email,
    password: hashedPassword,
  };

  if (email && password) {
    // Set the user_id cookie and redirect to the urls page
    req.session.user_id = userId;
    res.redirect("/urls");
  } else {
    // If email and/or password are missing, send a 400 Bad Request response
    res.status(400).send("Must enter in credentials");
  }
  console.log(users);
  res.redirect("/urls");
});

//////  LOGIN  //////

// This route handles displaying the login page
app.get("/login", (req, res) => {
  // Create an object with user information
  let templateVars = { user: users[req.session["user_id"]] };

  // Check if there is already a user logged in, if so, redirect to main page
  if (templateVars.user) {
    res.redirect("/urls");
  } else {
    // Render the login page and pass in the user object
    res.render("urls_login", templateVars);
  }
});

// This route handles processing the login form submission
app.post("/login", (req, res) => {
  // Extract the email and password from the form submission
  const { email, password } = req.body;

  // Find the user based on their email
  const user = getUserByEmail(email, users);

  // If the user is found and the password matches, set the user_id session cookie and redirect to main page
  if (bcrypt.compareSync(password, user.password)) {
    req.session.user_id = user.id;
    res.redirect("/urls");
  } else {
    // If the email or password is incorrect, return a 401 error
    res.status(401).send("Bad credentials");
  }
});

// Start listening on the specified port
app.listen(PORT, () => {
  console.log(` listening on port ${PORT}!`);
});
