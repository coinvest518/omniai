
const isProd = process.env.NODE_ENV === 'production';


const buildType =
  process.env.BIG_AGI_BUILD === 'standalone' ? 'standalone'
    : process.env.BIG_AGI_BUILD === 'static' ? 'export'
      : undefined;

console.log(`Build Type: ${buildType}`);
console.log(`Analyze Bundle: ${process.env.ANALYZE_BUNDLE}`);

buildType && console.log(`   🧠 omni-AI: building for ${buildType}...\n`);

/** @type {import('next').NextConfig} */
let nextConfig = {
  reactStrictMode: true,

  basePath: isProd ? '/Omni' : '',
  assetPrefix: isProd ? '/Omni/' : '',

  // Static HTML export settings
  ...buildType && {
    output: buildType,
    distDir: 'dist',

    // Disable image optimization for exports
    images: { 
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'img.clerk.com',
          port: '',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'lh3.googleusercontent.com',
          port: '',
          pathname: '/**',
        },
      ], 
    },

    // Optional: Change links `/me` -> `/me/` and emit `/me.html` -> `/me/index.html`
    // trailingSlash: true,
  },

  // Experimental features
  experimental: {
    serverComponentsExternalPackages: ['puppeteer-core'],
  },

  webpack: (config) => {
    // Redirect @mui/material to @mui/joy
    config.resolve.alias['@mui/material'] = '@mui/joy';

    // Enable asynchronous WebAssembly
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };

    // Add a loader for undici
    config.module.rules.push({
      test: /\.m?js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
        },
      },
    });

    return config;
  },

  // Uncomment the following to leave console messages in production
  // compiler: {
  //   removeConsole: false,
  // },
};

// Validate environment variables, if set at build time
await import('./src/server/env.mjs');

// Conditionally enable the Next.js bundle analyzer
if (process.env.ANALYZE_BUNDLE) {
  const { default: withBundleAnalyzer } = await import('@next/bundle-analyzer');
  nextConfig = withBundleAnalyzer({ openAnalyzer: true })(nextConfig);
}

export default nextConfig;