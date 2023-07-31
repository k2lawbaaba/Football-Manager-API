const exp = require("express");
const { graphqlHTTP } = require("express-graphql");
const myGraphQLSchema = require("./Models/graphSchema");
let ConnectMongoose = require("./Models/mongooseConnect");
let cors = require("cors");
let verifyToken = require("./Controllers/verifyToken");
let cookieParser = require("cookie-parser");

const app = exp();
app.use(cookieParser());
app.use(verifyToken);

// middlewares
app.use(
  "/graphql",

  graphqlHTTP((req, res, graphQLParams) => ({
    schema: myGraphQLSchema,
    // rootValue: rootResolver,
    graphiql: true,
    context: {
      user: req.user,
      res: res,
      email: req.email,
    },
  }))
);
app.use(
  exp.urlencoded({
    extended: true,
  })
);
app.use(cors);

app.listen(2300, async () => {
  await ConnectMongoose();
  console.log("Server is running on port 2300");
});
