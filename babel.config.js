module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['@babel/plugin-proposal-logical-assignment-operators']
  };
};
