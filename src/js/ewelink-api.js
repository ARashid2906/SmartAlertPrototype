const ewelink = require('ewelink-api');
const colors = require('colors');

/* instantiate class */
(async () => {
  const connection = new ewelink({
    email: 'abrahamrashid@gmail.com',
    password: 'r4sh1d112003',
    region: 'us',
  });
  /* get all devices */
  const devices = await connection.getDevices();
  console.log("Mis dispositivos".red,devices);

  const region = await connection.getRegion();
  console.log(region);

  const auth = await connection.getCredentials();

  console.log('access token: ', auth.at);
  console.log('api key: ', auth.user.apikey);
  console.log('region: ', auth.region);



})();