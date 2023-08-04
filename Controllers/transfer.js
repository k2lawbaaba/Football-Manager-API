let { team, manager, player } = require("../Models/mongooseSchema");

const transaction = async (
  marketValue,
  playerId,
  isManager,
  askingPrice,
  sellingTeam,
  teamValue,
  numberOfPlayers,
  Team,
  additional_budget
) => {
  let percentageOfValue = Math.floor(Math.random() * (100 - 10) + 10) / 100;

  // adding a random percentage of the askingb price to the market value of player
  let playerCurrentValue = percentageOfValue * marketValue + marketValue;

  let transferedPlayer = await player.updateOne(
    { _id: playerId },
    {
      marketValue: playerCurrentValue,
      transfer_Status: false,
      Team: isManager.teamName,
      askingPrice: 0,
    },
    { new: true }
  );

  //   updating the both team
  sellingTeam.additional_budget += askingPrice; // update selling manager team budget
  sellingTeam.teamValue -= marketValue; // update selling manager team value

  //   updating the buying team value and budget
  additional_budget -= askingPrice; // update buying manager team value
  teamValue += playerCurrentValue;

  const teamsToUpdate = [
    {
      name: Team,
      additional_budget: sellingTeam.additional_budget,
      teamValue: sellingTeam.teamValue,
      numberOfPlayers: sellingTeam.numberOfPlayers - 1,
    },
    {
      name: isManager.teamName,
      teamValue: teamValue,
      numberOfPlayers: numberOfPlayers + 1,
      additional_budget: additional_budget,
    },
  ];

  // Update each team individually
  for (const teamData of teamsToUpdate) {
    const filter = { name: teamData.name };
    const update = { $set: teamData };
    // console.log("inside team update");
    await team.updateOne(filter, update);
  }
  //   console.log("succesfull");
  return "Player transfer was successful:" + transferedPlayer;
};

const transfer = async (res, userId, playerId) => {
  try {
    // console.log(userId);
    // verify if the buyer is not same as seller
    let isManager = await manager.findById({ _id: userId });

    let isPlayer = await player.findOne({
      _id: playerId,
      transfer_Status: true,
    });

    if (isPlayer) {
      const { Team, askingPrice, marketValue } = isPlayer;
      let sellingTeam = await team.findOne({ name: Team });
      //   console.log(isManager, Team);
      if (isManager.teamName !== Team) {
        // purchasing manager Team
        let isTeam = await team.findOne({ name: isManager.teamName });

        const { numberOfPlayers, teamValue, additional_budget } = isTeam;

        // console.log(askingPrice, teamValue);
        if (askingPrice <= additional_budget) {
          transaction(
            marketValue,
            playerId,
            isManager,
            askingPrice,
            sellingTeam,
            teamValue,
            numberOfPlayers,
            Team,
            additional_budget
          );
        } else {
          return "You don't have enough budget for this transfer";
        }
      } else {
        return "Transfer Error: This player is already in your team";
      }
    } else {
      return `Transfer Error : Player not found or not available for transfer.
      Please check the transfer list to see players on transfer.`;
    }
  } catch (error) {
    // return `Transfer Error: error `;
    console.log(error);
    throw new Error(error);
  }
};
module.exports = transfer;
