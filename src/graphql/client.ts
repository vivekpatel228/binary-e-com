import { ApolloClient, InMemoryCache } from '@apollo/client';
import { RestLink } from 'apollo-link-rest';

const restLink = new RestLink({
  uri: 'https://api.escuelajs.co/api/v1/',
});

export const apolloClient = new ApolloClient({
  link: restLink,
  cache: new InMemoryCache({
    typePolicies: {
      Product: { keyFields: ['id'] },
      Category: { keyFields: ['id'] },
    },
  }),
});
