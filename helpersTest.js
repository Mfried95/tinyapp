const { assert } = require('chai');
const { getUserByEmail } = require('./helpers.js');
const { users } = require('./express_server');


const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('guetUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user2@example.com", users);
    const expectedOutput = testUsers.user2RandomID;
    assert.equal(user, expectedOutput);
  });
  it('should return undefined with an invalid email', function() {
    const user = getUserByEmail("user3@example.com", users);
    assert.equal(user, undefined);
  });
});