let jwt = require("jsonwebtoken");
let { manager } = require("../Models/mongooseSchema");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  let token = req.cookies.managerToken;

  if (token) {
    jwt.verify(token, process.env.SECRET_KEY, async (error, decoded) => {
      if (error || !decoded) {
        req.user = null;
        req.email = null;
        next();
      } else {
        const managerExist = await manager.findById(decoded.id);
        req.user = managerExist._id;
        req.email = managerExist.email;

        next();
      }
    });
  } else {
    req.user = null;
    req.email = null;
    next();
    // res.status(403).send("Access denied. You must login first");
  }
};
module.exports = verifyToken;
