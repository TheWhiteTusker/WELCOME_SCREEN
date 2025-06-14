module.exports = {
  apps: [
    {
      name: 'nextjs-app',
      script: 'npm',
      args: 'run start',
      cwd: './',
    },
    {
      name: 'ngrok-tunnel',
      script: 'ngrok',
      args: 'http 3000',
    },
  ],
  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'GIT_REPOSITORY',
      path : 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
