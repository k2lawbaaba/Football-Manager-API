let { faker } = require("@faker-js/faker");

const generatePlayers = (Team) => {
  const positions = ["Attacker", "Midfielder", "Defender", "Goalkeeper"];
  const desiredCounts = [5, 6, 6, 3];
  const players = [];

  for (let i = 0; i < positions.length; i++) {
    const position = positions[i];
    const desiredCount = desiredCounts[i];

    let count = 0;
    while (count < desiredCount) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const age = faker.number.int({ min: 18, max: 40 });
      const Country = faker.location.country();
      const image = faker.image.avatar();

      players.push({
        firstName,
        lastName,
        position,
        age,
        image,
        Country,
        Team,
      });
      count++;
    }
  }
  return players;
};

module.exports = generatePlayers;
