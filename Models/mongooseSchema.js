let mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

// schema for user collection
const OwnerSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      email: [true, "PLease enter a valid email address"],
      unique: [true, "Email already exists"],
    },
    password: {
      type: String,
      require: [true, "Password is required"],
      validate: {
        validator: (v) =>
          /(?=.*[A-Z])[a-zA-Z0-9]+[\#\@\$\%\&\*\(\)\>\<\~\{\}]+/.test(v),
        message:
          " {VALUE} must contain atleast one capital letter and one special characters",
      },
    },
    teamName: {
      type: String,
      required: [true, "Team is required"],
      unique: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
    },
  },
  { timestamps: true }
);

// sceham for player collection
const playerSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "Player firstname is required"],
    },
    lastName: {
      type: String,
      required: [true, "Player lastname is required"],
    },
    position: {
      type: String,
      enum: ["Attacker", "Midfielder", "Defender", "Goalkeeper"],
    },
    marketValue: {
      type: Number,
      default: 1000000,
      min: [5000, "Minimum value should be greater than or equal to $5k"],
    },

    age: {
      type: Number,
      max: 40, // maximum allowed age for players in the league
      positive: [true, "Age can't be negative or zero"],
      integer: [true, "Age cannot have decimal points"],
      required: [true, "Age is required"],
    },
    image: {
      type: String,
    },
    Country: {
      type: String,
      trim: true,
      required: [true, "Country is required"],
    },
    Team: {
      type: String,
      ref: "team",
    },
    transfer_Status: {
      type: Boolean,
      default: false,
    },
    askingPrice: {
      type: Number,
      default: 0,
      required: [true, "Asking price is required"],
    },
  },
  { timestamps: true }
);

const teamSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Team Name Required"],
      unique: true,
    },
    ownerID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "manager",
    },
    country: {
      type: String,
      require: [true, "Team country is required"],
    },
    // playersID: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "player",
    //   },
    // ],
    numberOfPlayers: {
      type: Number,
      min: 12, // minimum number of player needed to form a valid team
      max: 36, //maximum number of players per team
      default: 20,
    },
    teamValue: {
      type: Number,
      default: 20000000,
    },
    additional_budget: {
      type: Number,
      default: 5000000,
      // required:[true, 'Team budget is required']
    },
  },
  { timestamps: true }
);

const transferSchema = new Schema(
  {
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "player",
    },
    from_teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "team",
    },
    to_teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "team",
    },
    askingPrice: {
      type: Number,
      required: [true, "Asking price is required"],
    },
  },
  { timestamp: true }
);

module.exports.manager = new mongoose.model("manager", OwnerSchema);
module.exports.player = new mongoose.model("player", playerSchema);
module.exports.team = new mongoose.model("team", teamSchema);
// module.exports.transferList = new mongoose.model("transfer", transferSchema);
