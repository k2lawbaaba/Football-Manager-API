let { manager, team, player } = require("../Models/mongooseSchema");
const bcrypt = require("bcrypt");
const generatePlayers = require("../Controllers/generateFakeData");

const createManager = async ({ name, email, teamName, country, password }) => {
  let newManager = new manager({
    name: name,
    email: email,
    password: await bcrypt.hash(password, 10),
    teamName: teamName,
    country: country,
  });
  let createdNewManager = await newManager.save();
  if (createdNewManager) {
    let createTeam = generatePlayers(teamName);
    let newTeam = new team({
      name: teamName,
      ownerID: createdNewManager._id,
      country: country,
      //   playersID: [],
    });

    let createdNewTeam = await newTeam.save();
    if (createdNewTeam) {
      let newPlayers = await player.insertMany(createTeam);
      //   if (newPlayers) {
      //     for (let player of newPlayers) {
      //       await team.updateOne(
      //         { _id: createdNewTeam._id },
      //         { $addToSet: { playersID: player._id } }
      //       );
      //     }
      //   }
    }
  }

  return createdNewManager;
};
module.exports = createManager;
