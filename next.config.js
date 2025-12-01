/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  skipTrailingSlashRedirect: true,
  webpack: (config, { isServer }) => {
    // Suppress TensorFlow.js warnings in console
    config.resolve.alias = {
      ...config.resolve.alias,
      '@tensorflow/tfjs': false,
    };

    // Ignore TensorFlow.js warnings
    config.ignoreWarnings = [
      { module: /node_modules\/@tensorflow/ },
      { message: /CleanupUninitializedAndNodeArgs/ },
    ];

    return config;
  },
  async headers() {
    return [
      {
        source: '/widget.js',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type',
          },
        ],
      },
      {
        source: '/widget',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: 'frame-ancestors *',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;