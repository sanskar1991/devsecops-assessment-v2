// db-init/app-user.js
// Creates an application-scoped user with readWrite on the app DB.
// Values are taken from environment variables so this works for dev & prod.

const dbName   = process.env.APP_DB_NAME     || 'devsecops';
const appUser  = process.env.APP_DB_USERNAME || 'app_user';
const appPass  = process.env.APP_DB_PASSWORD || 'changeME-StrongPass!';

db.getSiblingDB(dbName).createUser({
  user: appUser,
  pwd:  appPass,
  roles: [
    { role: 'readWrite', db: dbName }
  ]
});

print(`Created user ${appUser} with readWrite on ${dbName}`);
