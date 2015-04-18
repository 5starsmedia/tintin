'use strict';

var program = require('commander');
var deasync = require('deasync');
var mongoose = require('mongoose');
var config = require('./config.js')
var Stomp = require('stomp-client');

program
  .version('0.0.1')
  .description('TinTin command line utility')
;
/*
 var connect = deasync(function (next) {
 mongoose.connect(config.get('mongodb'), next);
 });

 var disconnect = deasync(function (next) {
 mongoose.disconnect(next);
 });*/

var addTask = deasync(function (taskName, next) {
  var client = new Stomp(config.get('tasks.stomp.host'), config.get('tasks.stomp.port'), config.get('tasks.stomp.login'), config.get('tasks.stomp.password'));
  client.on('error', function (err) {
    if (err) { return console.log(err.toString()); }
  });
  console.log('Connecting to tasks stomp...');
  client.connect(function () {
    console.log('Connection to tasks stomp ready');
    console.log('Publish task', taskName, 'to queue');
    client.publish(config.get('tasks.stomp.destination'), JSON.stringify({body: {name: taskName}}));
    console.log('Disconnecting from tasks stomp...');
    client.disconnect(function () {
      console.log('Disconnected from tasks stomp');
      next();
    });
  });
});

program
  .command('push-task <taskname>')
  .description('Push specified task to task queue')
  .action(function (taskName, opts) {
    addTask(taskName);
  });

program
  .command('*')
  .action(function(commandName){
    console.log('Invalid command', commandName);
  });

program.parse(process.argv);

if (!program.args.length) {
  program.help();
}

