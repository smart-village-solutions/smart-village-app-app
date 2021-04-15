import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { DocumentNode } from 'graphql';

const httpLink = createHttpLink({
  uri: 'https://apollo.bad-belzig.smart-village.app/graphql'
});

export const OParlClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: httpLink
});

export const executeOParlQuery = async (
  query: readonly [DocumentNode, string],
  setterFunc: React.Dispatch<React.SetStateAction<any>>,
  variables?: any
) => {
  try {
    const { data, errors } = await OParlClient.query({
      query: query[0],
      variables
    });
    if (!errors) setterFunc(data[query[1]]);
  } catch (e) {
    console.warn('caught:', e);
  }
};

// export const OParlContext = createContext<ApolloClient<any>>(
//   new ApolloClient({
//     cache: new InMemoryCache(),
//     link: httpLink
//   })
// );

// export const OParlProvider = ({ children }: { children: React.ReactNode }) => {
//   return (
//     <OParlContext.Consumer>
//       {(client) => <OParlContext.Provider value={client}>{children}</OParlContext.Provider>}
//     </OParlContext.Consumer>
//   );
// };
