module.exports = function (api) {
  api.cache(true);

  const isProduction = process.env.NODE_ENV === 'production';

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      '@babel/plugin-proposal-class-properties',
      ...(isProduction ? ['some-production-plugin'] : [])
    ],
  };
};
