let { team, manager, player } = require("../Models/mongooseSchema");

const transfer = async (res, userId, playerId) => {
  try {
    // console.log(userId);
    // verify if the buyer is not same as seller
    let isManager = await manager.findById({ _id: userId });

    let isPlayer = await player.findById({ _id: playerId });

    if (isPlayer) {
      const { Team, transfer_Status, askingPrice, marketValue } = isPlayer;
      let sellingTeam = await team.findOne({ name: Team });
      //   console.log(isManager, Team);
      if (isManager.teamName !== Team) {
        // purchasing manager Team
        let isTeam = await team.findOne({ name: isManager.teamName });

        const { numberOfPlayers, teamValue, additional_budget } = isTeam;
        let teamAsset = teamValue + additional_budget;

        // console.log(askingPrice, teamValue);
        if (askingPrice <= teamValue) {
          let percentageOfValue =
            Math.floor(Math.random() * (100 - 10) + 10) / 100;

          // adding a random percentage of the askingb price to the market value of player
          let currentValue = percentageOfValue * marketValue + marketValue;

          let transferedPlayer = await player.updateOne(
            { _id: playerId },
            {
              marketValue: currentValue,
              transfer_Status: false,
              Team: isManager.teamName,
              askingPrice: 0,
            },
            { new: true }
          );

          //   updating the both team

          teamValue -= askingPrice; // update buying manager team value
          sellingTeam.teamValue += askingPrice; // update selling manager team value
          const teamsToUpdate = [
            {
              name: Team,
              teamValue: sellingTeam.teamValue,
              numberOfPlayers: sellingTeam.numberOfPlayers - 1,
            },
            {
              name: isManager.teamName,
              teamValue: teamValue,
              numberOfPlayers: numberOfPlayers + 1,
            },
          ];

          // Update each team individually
          for (const teamData of teamsToUpdate) {
            const filter = { name: teamData.name };
            const update = { $set: teamData };
            console.log(teamData);
            await team.updateOne(filter, update);
          }
          console.log("succesfull");
          return "Player transfer was successful:" + transferedPlayer;
        } else {
          console.log("failed");
          return "You don't have enough budget for this transaction";
        }
      } else {
        return "Transfer Error: This player is already in your team";
      }
    } else {
      return "Transfer Error : Player not found";
    }
  } catch (error) {
    // return `Transfer Error: error `;
    console.log(error);
    throw new Error(error);
  }
};
module.exports = transfer;
