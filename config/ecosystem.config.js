module.exports = {
  apps: [
    {
      name: 'VisualSearch',
      script: './server.js',
      watch: ['server', 'config', 'server.js', 'router'],
      ignore_watch: ['src', 'node_modules', 'dist/**'],
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
}
