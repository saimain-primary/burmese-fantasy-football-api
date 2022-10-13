module.exports = {
  apps: [
    {
      name: "api.bffsports.com",
      script: "./src/app.js",
      watch: false,
      force: true,
      env: {
        PORT: 3000,
        NODE_ENV: "production",
      },
    },
  ],
};
