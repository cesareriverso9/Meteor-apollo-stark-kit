import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withApollo } from 'react-apollo';
import { propType } from 'graphql-anywhere';
import userFragment from '../apollo-client/fragments/user.graphql';
import DefaultLayout from '../layouts/default/index.jsx';
import { LogoutBtn } from '../components/auth/index.js';

//------------------------------------------------------------------------------
// COMPONENT:
//------------------------------------------------------------------------------
const HomePage = ({ client, refetch, curUser }) => (
  <DefaultLayout>
    <div className="full-width">
      <LogoutBtn onLogoutHook={() => client.resetStore()} />
      <pre>{JSON.stringify(curUser, null, 2)}</pre>
      <button onClick={() => refetch()}>Refetch the query!</button>
    </div>
  </DefaultLayout>
);

HomePage.propTypes = {
  client: PropTypes.shape({
    resetStore: PropTypes.func.isRequired,
  }).isRequired,
  refetch: PropTypes.func.isRequired,
  curUser: propType(userFragment).isRequired,
};

const enhance = compose(
  withApollo, // To have access to client.resetStore()
);

export default enhance(HomePage);
