/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    // Suppress TensorFlow.js warnings in console
    config.resolve.alias = {
      ...config.resolve.alias,
      '@tensorflow/tfjs': false,
    };

    // Ignore warnings from third-party modules
    config.ignoreWarnings = [
      { module: /node_modules\/@tensorflow/ },
      { message: /CleanupUninitializedAndNodeArgs/ },
      // Supabase imports realtime modules that reference Node.js APIs,
      // but these code paths aren't executed in Edge Runtime middleware
      { module: /node_modules\/@supabase\/realtime-js/ },
      { module: /node_modules\/@supabase\/supabase-js/ },
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