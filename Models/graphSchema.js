const graphql = require("graphql");
let _ = require("lodash");
const bcrypt = require("bcrypt");
const createManager = require("../Controllers/createManager");
const { manager, player, team } = require("../Models/mongooseSchema");
let login = require("../Controllers/login");
let transfer = require("../Controllers/transfer");

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLInt,
  GraphQLID,
  GraphQLList,
} = graphql;

const ManagerType = new GraphQLObjectType({
  name: "Manager",
  fields: () => ({
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    // password: { type: GraphQLString },
    teamName: { type: GraphQLString },
    country: { type: GraphQLString },
  }),
});

const PlayerType = new GraphQLObjectType({
  name: "Player",
  fields: () => ({
    _id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    position: { type: GraphQLString },
    age: { type: GraphQLInt },
    Team: { type: GraphQLString },
    Country: { type: GraphQLString },
    marketValue: { type: GraphQLInt },
    transfer_Status: { type: GraphQLString },
    askingPrice: { type: GraphQLInt },
  }),
});

const TeamType = new GraphQLObjectType({
  name: "Team",
  fields: () => ({
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    additional_budget: { type: GraphQLInt },
    country: { type: GraphQLString },
    teamValue: { type: GraphQLInt },
    numberOfPlayers: { type: GraphQLInt },
    ownerID: { type: GraphQLID },
    Manager: {
      type: ManagerType,
      resolve(roots, args) {
        return manager.findOne({ teamName: roots.name });
      },
    },
    Players: {
      type: new GraphQLList(PlayerType),
      resolve(roots, args) {
        return player.find({ Team: roots.name });
      },
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQuery",
  fields: {
    Player: {
      type: PlayerType,
      args: {
        id: { type: GraphQLID },
      },
      resolve(root, args, context) {
        if (context.user) return player.findById({ _id: args.id });
        else throw new Error(`Access denied. You must login first`);
      },
    },
    players: {
      type: new GraphQLList(PlayerType),
      resolve: (root, args, context) => {
        if (context.user) return player.find({});
        else throw new Error(`Access denied. You must login first`);
      },
    },
    Managers: {
      type: new GraphQLList(ManagerType),
      resolve: (obj, args, context) => {
        let user = context.user;
        if (user) return manager.find({});
        else throw new Error(`Access denied. You must login first`);
      },
    },
    Team: {
      type: TeamType,
      args: {
        id: { type: GraphQLID },
      },
      resolve(root, args, context) {
        let user = context.user;
        if (user) return team.findById({ _id: args.id });
        else throw new Error(`Access denied. You must login first`);
        // return _.find(players, { _id: args.id });
      },
    },
    Teams: {
      type: new GraphQLList(TeamType),
      resolve: (obj, args, context) => {
        const user = context.user;
        console.log(user);
        if (user) {
          return team.find({});
        } else {
          throw new Error(`Access denied. You must login first`);
        }
      },
    },
    TransferList: {
      type: new GraphQLList(PlayerType),
      resolve: (root, args, context) => {
        if (context.user) return player.find({ transfer_Status: "true" });
        else throw new Error(`Access denied. You must login first`);
      },
    },
  },
});

// populating the collection
const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    signUp: {
      type: ManagerType,
      args: {
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        teamName: { type: GraphQLString },
        country: { type: GraphQLString },
      },
      resolve: async (roots, args) => {
        return createManager(
          ({ name, email, teamName, country, password } = args)
        );
        //    return res.status(201).json({ Message: saveNewManager });
      },
    },

    Login: {
      type: TeamType,
      args: {
        email: { type: GraphQLString },
        password: { type: GraphQLString },
      },
      resolve: (roots, args, context, res) => {
        const { email, password } = args;

        let logged = login(context, email, password);

        return logged;
        // return roots.name;
      },
    },
    updatePlayer: {
      type: PlayerType,
      args: {
        id: { type: GraphQLID },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        position: { type: GraphQLString },
        age: { type: GraphQLInt },
        team: { type: GraphQLString },
        Country: { type: GraphQLString },
        marketValue: { type: GraphQLInt },
        transfer_Status: { type: GraphQLString },
        askingPrice: { type: GraphQLInt },
      },
      resolve: async (roots, args, context) => {
        if (context.user) {
          let isManager = await manager.findById({ _id: context.user });

          let playerExist = await player.findById({ _id: args.id });

          if (isManager.teamName === playerExist.Team) {
            let isPlayer = await player.findByIdAndUpdate(
              { _id: args.id },
              { $set: args },
              { new: true }
            );

            if (isPlayer) return isPlayer;
            else throw new Error("Update failed. Check the player ID");
          } else {
            throw new Error(
              "Access denied, you can only modify your team members"
            );
          }
        } else {
          throw new Error(`Access denied. You must login first`);
        }
      },
    },
    Transfer: {
      type: GraphQLString,
      args: {
        id: { type: GraphQLID },
        Price: { type: graphql.GraphQLFloat },
      },
      resolve: async (roots, args, context) => {
        let userID = context.user;
        let res = context.res;
        if (userID) {
          console.log("Transfer");
          return transfer(res, userID, args.id);
        } else {
          throw new Error(`Access denied. You must login first`);
        }
      },
    },
  },
});

module.exports = new graphql.GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
