// Run in nodejs enviroment
const UpdateLoop  = require('../dist/update-loop');

const looper = new UpdateLoop(60, UpdateLoop.INTERVAL);
looper.start();
