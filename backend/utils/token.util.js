const JWT = require('jsonwebtoken');

const tokenFromUser = (user) => {
  return JWT.sign({ id: user._id, email: user.email }, process.env.SECRET_KEY);
};

const userIdFromToken = (token) => {
  try {
    const decoded = JWT.verify(token, process.env.SECRET_KEY);
    return decoded.id;
  } catch (err) {
    return null;
  }
};

module.exports = { tokenFromUser, userIdFromToken };
