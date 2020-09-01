# Demo of GraphQL stitching + Hapi

This project is a demo of how to add a GraphQL endpoint to Hapi, and stitch together remote schemas.

**Problem:**

Currently, the Hapi server exposes REST endpoints on `/api/*`. However, the CHUB team is adding a GraphQL service that we will need access to from the browser.

**Solution:**

Use Apollo Server with Hapi to handle requests on `/graphql`, and use graphql-tools to stitch together remote endpoints so they are accessible from UI.  

See the api main module to see how things are put together: [`apps/api/src/main.ts`](https://github.com/jaysoo/graphql-hapi-example/blob/main/apps/api/src/main.ts).

## Running

Install deps:
```
yarn
```

Start "remote" service:

```
nx serve books
```

Start API:

```
nx serve api
```

Go to the API (http://localhost:3001/graphql) and execute this query:

```
query {
  books{
    title,
    author
  }
}
```

You should see some results.

## Notes

- This demo does not handle authentication, but we can do so by providing the auth header in executor's `context`.
- Telemetry is possible still since we intercept hapi requests in the `context` function.
- Caching is possible in the executor.
- If the remote schema has subscriptions, we need to provide `subscriber` in addition to `executor`.  
