import * as Hapi from '@hapi/hapi';
import { ApolloServer, gql } from 'apollo-server-hapi';

const books = [
  {
    title: "Harry Potter and the Sorcerer's stone",
    author: 'J.K. Rowling',
  },
  {
    title: 'Jurassic Park',
    author: 'Michael Crichton',
  },
];

const typeDefs = `
  type Query { books: [Book] }
  type Book { title: String, author: String }
`;

const resolvers = {
  Query: { books: () => books },
};

const init = async () => {
  const server = new ApolloServer({ typeDefs, resolvers });

  const app = Hapi.server({
    port: 3000,
    host: 'localhost'
  });

  await server.applyMiddleware({
    app,
  });

  await server.installSubscriptionHandlers(app.listener);

  await app.start();

  console.log('Server running on %s', app.info.uri);
};

process.on('unhandledRejection', (err) => {

  console.log(err);
  process.exit(1);
});

init();
