apt-get install openjdk-7-jdk


SET PAPHOS_SITE=bezprovodoff.com


## CRON

notifications.mailing - Розсилка повідомлень на пошту

NODE_ENV=production forever start app.js

export MONGOLAB_URI="mongodb://masterdb.5stars.link:27017,slave1.5stars.link:27018/prerender?replicaSet=5stars&auto_reconnect=true"

## Cron

*/1 * * * * /usr/bin/node /var/www/tintin/api/cli.js push-task notifications.mailing >/dev/null 2>&1
*/1 * * * * /usr/bin/node /var/www/tintin/api/cli.js push-task seo.checkTextUniqueResult >/dev/null 2>&1