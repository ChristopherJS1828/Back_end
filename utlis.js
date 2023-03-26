// generatea token using secret from process.env.JWT_SECRET
var jwt = require('jsonwebtoken');
 
// generatea token and returna it
function generateToken(user) {
  if (!user) return null;
 
  var u = {
    userId: user._id,
    name: user.Name,
    email: user.Email,
    
  };
 
  return jwt.sign(u, process.env.JWT_SECRET, {
    expiresIn: 60 * 60 * 24 // expires in 24 hours
  });
}
 
// return basic user details
function getCleanUser(user) {
  if (!user) return null;
 
  return {
    userId: user._id,
    name: user.Name,
    email: user.Email,
  };
}
 
module.exports = {
  generateToken,
  getCleanUser
}