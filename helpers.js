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
const generateRandomString = function() {
  let randomString = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i <= 6; i++) {
    let charIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[charIndex];
  }
  return randomString;
};







module.export = { getUserByEmail, generateRandomString };