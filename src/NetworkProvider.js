import PropTypes from 'prop-types';
import React, { createContext } from 'react';
import NetInfo from '@react-native-community/netinfo';

import { isConnected } from './helpers';

export const NetworkContext = createContext({ isConnected: false });

export class NetworkProvider extends React.PureComponent {
  state = {
    isConnected: false
  };

  componentDidMount() {
    NetInfo.addEventListener('connectionChange', this.handleConnectivityChange);
  }

  componentWillUnmount() {
    NetInfo.removeEventListener('connectionChange', this.handleConnectivityChange);
  }

  handleConnectivityChange = (connectionInfo) =>
    this.setState({ isConnected: isConnected(connectionInfo) });

  render() {
    return (
      <NetworkContext.Provider value={this.state}>{this.props.children}</NetworkContext.Provider>
    );
  }
}

NetworkProvider.propTypes = {
  children: PropTypes.object.isRequired
};
