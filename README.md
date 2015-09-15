apt-get install openjdk-7-jdk


SET PAPHOS_SITE=bezprovodoff.com


## CRON

notifications.mailing - Розсилка повідомлень на пошту
seo.checkTextUniqueResult - перевірка унікальності тексту
posts.deferredPublication - відкладена публікація

NODE_ENV=production forever app.js
NODE_ENV=production forever start app.js
NODE_ENV=production forever restart app.js

export MONGOLAB_URI="mongodb://masterdb.5stars.link:27017,slave1.5stars.link:27018/prerender?replicaSet=5stars&auto_reconnect=true"

## Cron

*/1 * * * * /usr/bin/node /var/www/tintin/api/cli.js push-task notifications.mailing >/dev/null 2>&1
*/1 * * * * /usr/bin/node /var/www/tintin/api/cli.js push-task seo.checkTextUniqueResult >/dev/null 2>&1
*/1 * * * * /usr/bin/node /var/www/tintin/api/cli.js push-task posts.deferredPublication >/dev/null 2>&1

db.createUser({user: "admin", pwd: "5stars", roles: [ { role: "dbOwner", db: "admin" } ]})

mongo --username "adminUser" --password "5stars"  --host=10.0.0.20

db.createUser( {
    user: "admin",
    pwd: "5stars",
    roles: [ { role: "root", db: "admin" } ]
  });

use admin
db.auth("adminUser", "5stars");

use 5stars
db.createUser(
  {
    user: "nginx2",
    pwd: "nginx2",
    roles:
    [
      {
        role: "dbOwner",
        db: "5stars"
      },
      {
        role: "dbAdmin",
        db: "5stars"
      },
      {
        role: "userAdmin",
        db: "5stars"
      }
    ]
  }
)

use dev
db.createUser(
  {
    user: "devUser",
    pwd: "test",
    roles:
    [
      {
        role: "dbOwner",
        db: "dev"
      }
    ]
  }
)

scp -P22120 -r root@5stars.link:/var/www/tintin/sites /var/www/tintin/sites_2


## Tests

npm install mocha -g

cd test
mocha server.js


db.fs.files.dropIndex("filename_1")
db.fs.chunks.dropIndex("files_id_1_n_1")
