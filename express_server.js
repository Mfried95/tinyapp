const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


// EJS setup view engine
app.set("view engine", "ejs");

// Sends urlDatabase to urls_index.ejs to be used there
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const paramsId = req.params.id;
  const templateVars = { id: req.params.id, longURL: urlDatabase[paramsId] };
  res.render("urls_show", templateVars);
});



app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});


app.use(express.urlencoded({ extended: true }));


// Paths
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Listen on Port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});