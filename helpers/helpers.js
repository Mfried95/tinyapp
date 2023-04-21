module.exports = () => {
  // A function that takes an email and a users object, loops through the object
  // to find a user with a matching email, and returns the user object.

  const getUserByEmail = function(email, users) {
    // Check if user exists? => look for that email
    for (let userId in users) {
      if (users[userId].email === email) {
        return users[userId];
      }
    }
    return undefined;
  };

  // A function that takes a URL, checks if it starts with http:// or https://,
  // and returns the URL as-is if it does, or prepends 'http://' otherwise.
  
  const setLongUrl = function(url) {
    if (url.match(/^(https:\/\/|http:\/\/)/)) {
      return url;
    } else {
      return "http://" + url;
    }
  };

  // A function that generates a random 6-character string from a set of
  // upper and lower case letters and digits, and returns it.
  
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

  // Export an object that contains the three functions.
  return { getUserByEmail, generateRandomString, setLongUrl };
};
