const express = require("express");
const app = express();
const PORT = 8080;

// Cookie parser
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// view engine
app.set("view engine", "ejs");

// encode body
app.use(express.urlencoded({ extended: true }));

// Password encrypt (bcrypt)
const bcrypt = require("bcryptjs");
const password = "purple-monkey-dinosaur"; // found in the req.body object
const hashedPassword = bcrypt.hashSync(password, 10);



const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {};


const getUserByEmail = (email, users) => {
  // Check if user exists? => look for that email
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return false;
};


// generate  ID for short URL
const generateRandomString = function () {
  let randomString = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i <= 6; i++) {
    let charIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[charIndex];
  }
  return randomString;
};

// Routes

app.get("/urls.json", (req, res) => {
  res.json(users);
});

app.get("/urls", (req, res) => {
  const userID = req.cookies.user_id;
  if (!userID) {
    res.redirect("/login");
  } else {
    // Filter urlDatabase to only show URLs created by the current user
    const userUrls = {};
    for (const [id, urlObj] of Object.entries(urlDatabase)) {
      if (urlObj.userID === userID) {
        userUrls[id] = urlObj.longURL;
      }
    }
    const templateVars = {
      user: users[userID],
      urls: userUrls,
    };
    res.render("urls_index", templateVars);
  }
});

// GET endpoint to display a form for creating a new URL
app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"];
  if (!userID) {
    res.redirect("/login");
  } else {
    let templateVars = {
      user: users[userID],
    };
    res.render("urls_new", templateVars);
  }
});

// POST endpoint to create a new short URL
app.post("/urls", (req, res) => {
  const userID = req.cookies.user_id;
  if (!userID) {
    res.status(401).send("Unauthorized");
  } else {
    let id = generateRandomString();
    urlDatabase[id] = {
      longURL: req.body.longURL,
      userID: userID,
    };
    res.redirect(`/urls/${id}`);
  }
});


app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"];
  if (!userID) {
    res.redirect("/login");
  } else {
    let templateVars = {
      user: users[userID],
    };
    res.render("urls_new", templateVars);
  }
});

app.post("/urls", (req, res) => {
  const userID = req.cookies.user_id;
  if (!userID) {
    res.status(401).send("Unauthorized");
  } else {
    let id = generateRandomString();
    urlDatabase[id] = {
      longURL: req.body.longURL,
      userID: userID,
    };
    res.redirect(`/urls/${id}`);
  }
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls/");
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const userID = req.cookies.user_id;
  if (!userID) {
    res.redirect("/login");
  } else {
    const templateVars = {
      user: req.cookies["user_id"],
      id: req.params.id,
      longURL: urlDatabase[req.params.id],
    };
    res.render("urls_show", templateVars);
  }
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  res.redirect("/urls");
});

// Login user

app.post("/login", (req, res) => {
  // extract the email and password
  const { email, password } = req.body;
  // validation if the user exists
  const user = getUserByEmail(email, users);
  // check the passwords
  if (user && bcrypt.compareSync(password, user.password)) {
    // set the cookie
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  } else {
    // otherwise, send back 401
    res.status(401).send("Bad credentials");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

//////  REGISTER USER //////

app.get("/register", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const userId = Math.random().toString(36).substring(2, 8);
  const hashedPassword = bcrypt.hashSync(password, 10);

  for (let userId in users) {
    if (users[userId].email === email) {
      // user exist
      res.status(400).send("User already exist");
      return;
    }
  }

  // Creates a new user based on form input from this page /register
  users[userId] = {
    id: userId,
    email,
    password: hashedPassword
  };

  if (email && password) {
    // set cookies
    res.cookie("user_id", email);
    res.redirect("/urls");
  } else {
    res.status(400).send("Must enter in credentials");
  }
  console.log(users);
  res.redirect("/urls");
});

//////  LOGIN  //////

app.get("/login", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] };
  if (templateVars.user) {
    res.redirect("/urls");
  } else {
    res.render("urls_login", templateVars);
  }
});

app.post("/login", (req, res) => {
  // extract the email and password
  const { email, password } = req.body;
  // validation if the user exists
  const user = getUserByEmail(email, users);
  // check the passwords
  if (bcrypt.compareSync(password, user.password)) {
    // set the cookie
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  } else {
    // otherwise, send back 401
    res.status(401).send("Bad credentials");
  }
});

app.listen(PORT, () => {
  console.log(` listening on port ${PORT}!`);
});
