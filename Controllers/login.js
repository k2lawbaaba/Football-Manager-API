let { manager, team } = require("../Models/mongooseSchema");
let jwt = require("jsonwebtoken");
let bcrypt = require("bcrypt");
let cookieParser = require("cookie-parser");
require("dotenv").config();

const login = async (context, email, password) => {
  if (!email || !password) throw new Error("Email or Password is required");

  try {
    const isManager = await manager.findOne({ email });
    if (!isManager) throw Error("Email doesn't exist");
    else {
      let passwordMatch = await bcrypt.compare(password, isManager.password);

      if (passwordMatch) {
        //create token
        let token = jwt.sign(
          { id: isManager._id, email: isManager.email },
          process.env.SECRET_KEY,
          {
            expiresIn: "1h",
          }
        );
        context.res.cookie("managerToken", token, { maxAge: 1000 * 60 * 60 });
        console.log(`Welcome ${isManager.name.toUpperCase()}`);
        return await team.findOne({ name: isManager.teamName });
      } else console.log("Invalid Email or password");
    }
  } catch (error) {
    // return error;
    console.log("Error Message", error);
  }
};
module.exports = login;
