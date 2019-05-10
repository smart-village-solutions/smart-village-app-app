// taken from https://github.com/kevinwolfcr/formal/tree/master/apps/formal-playground-native/scripts
// to enable react hooks with expo sdk 32 until 33 is released which will update react and react native versions

/* eslint-disable import/no-extraneous-dependencies, no-console, @typescript-eslint/no-var-requires */

/*
 * This script is intended as a workaround while Expo lands
 * official support for React Hooks.
 */

const { execSync } = require('child_process');

function enableRnHooks() {
  execSync('cp -R scripts/rn-renderer/* ../../node_modules/react-native/Libraries/Renderer', {
    stdio: 'inherit'
  });
}

enableRnHooks();
