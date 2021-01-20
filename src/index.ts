import { ApolloServer as ApolloServerLocal, IResolvers, gql } from 'apollo-server';
import fs from 'fs';
import { initMongoClient } from './dbConnection';
import * as Query from './query';
import * as Mutation from './mutation';
import { parser } from './helper/queue/shops/ashan';

const resolvers = {
  ...Mutation,
  ...Query,
} as IResolvers;

parser('https://auchan.zakaz.ua/ru/categories/pulses-and-grain-auchan/');

const typeDefs = gql(fs.readFileSync(__dirname.concat('/schema.graphql'), 'utf8'));
const configApollo = {
  typeDefs,
  resolvers,
  cors: {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  },
  playground: true,
  introspection: true,
  methods: ['POST', 'GET'],
  formatError: (err) => {
    console.log(JSON.stringify(err, null, 2));
    return err;
  },
};

(async () => {
  await initMongoClient();
  const apolloServer = new ApolloServerLocal(configApollo);
  apolloServer.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`);
  });
})();
