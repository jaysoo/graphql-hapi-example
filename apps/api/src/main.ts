import { introspectSchema, wrapSchema } from '@graphql-tools/wrap';
import { stitchSchemas } from '@graphql-tools/stitch';
import * as Hapi from '@hapi/hapi';
import { print } from 'graphql';
import { ApolloServer } from 'apollo-server-hapi';
import fetch from 'node-fetch';

// Creates executor for wrapping remote schema
function createExecutor(url: string) {
  return async ({ document, variables, context }) => {
    const query = print(document);
    const fetchResult = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Using auth key from hapi side
        Authorization: `Bearer ${context.authKey}`,
      },
      body: JSON.stringify({ query, variables }),
    });
    return fetchResult.json();
  };
}

// Create a remote schema
async function createRemoteSchema(url: string) {
  const executor = createExecutor(url);
  return wrapSchema({
    schema: await introspectSchema(executor, { authKey: '1234' }),
    executor,
  });
}

const init = async () => {
  // Use a remote schema
  const booksSchema = await createRemoteSchema('http://localhost:3000/graphql');

  // Merge multiple schemas
  // Note: we only have one right now, so this step could be skipped.
  const mergedSchema = stitchSchemas({
    subschemas: [booksSchema],
  });

  // stitch schemas together
  const apolloServer = new ApolloServer({
    schema: mergedSchema,
    // Return a context that the executor can access
    // We can also set up telemetry here
    context: async ({ request, h }) => {
      return {
        authKey: '1234',
      };
    },
  });

  const hapiServer = Hapi.server({
    port: 3001,
    host: 'localhost',
  });

  // Set up apollo server
  await apolloServer.applyMiddleware({
    app: hapiServer,
  });

  await apolloServer.installSubscriptionHandlers(hapiServer.listener);

  await hapiServer.start();

  console.log('Server running on %s', hapiServer.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();
