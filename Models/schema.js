let { buildSchema } = require("graphql");
const { manager, player, team } = require("../Models/mongooseSchema");
const createManager = require("../Controllers/createManager");
const login = require("../Controllers/login");

const schema = buildSchema(`

input Manager{
    _id: ID
    name : String
    email : String
    password : String
    teamName : String
    country : String
}

type ManagerMessage{
    _id: ID
    name : String
    email : String
    teamName : String
    country : String
}


input Player{
    _id:ID
    firstName:String
    lastName:String
    age:Int
    position:String
    team: String
    country: String
    marketValue : Int
}
type PlayerMessage{
    _id:ID
    firstName:String
    lastName:String
    age:Int
    position:String
    team: String
    country: String
    marketValue : Int
}


input Team{
    _id:ID
    name:String
    Players:[Player]
    Manager:[Manager]
    budget:Float
    additional_budget: Int
    country : String
    numberOfPlayers : Int
}

type TeamMessage{
    _id:ID
    name:String
    Players:[PlayerMessage]
    Manager:[ManagerMessage]
    budget:Float
    additional_budget: Int
    country : String
    numberOfPlayers : Int
}

type Query{
    Player(id:ID!): PlayerMessage
    Team(id: ID!) : TeamMessage
    Manager(id:ID!): ManagerMessage
    Teams: [TeamMessage]
    Players: [PlayerMessage]
    TransferList: [PlayerMessage]
}


type Mutation{
    signUp(
    name : String
    email : String
    password : String
    teamName : String
    country : String
    ): ManagerMessage

    Login(
        email:String!,
        password: String!,       
        ):TeamMessage

    transfer(id:ID!):PlayerMessage
    updatePlayer(id:ID!, input: Player): PlayerMessage
    updateManager(id:ID!, input: Manager): ManagerMessage
    updateTeam(id: ID!, input: Team): TeamMessage
}
`);

const getManager = (args) => {
  return manager.findOne({ _id: args.id });
};
const getPlayer = async (roots, args) => {
  return await player.find({ $or: [{ _id: args.id }, { team: roots.name }] });
};
const getAllTeams = () => {
  return team.find();
};

const getTeam = (args) => {
  return team.findOne({ _id: args.id });
};

const getAllPlayers = () => {
  return player.find();
};
const logIn = (res, args) => {
  return login(res, ({ email, password } = args));
};
const signup = (args) => {
  return createManager(({ name, email, teamName, country, password } = args));
};

// Resolvers for the queries

const rootResolver = {
  Manager: getManager,
  Player: getPlayer,
  Team: getTeam,
  Teams: getAllTeams,
  Players: getAllPlayers,
  Login: logIn,
  signUp: signup,
};

module.exports = { rootResolver, schema };
