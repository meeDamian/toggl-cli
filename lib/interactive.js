'use strict';

function keyListener({stdin, exit}) {
  return cb => {
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    stdin.on('data', key => {
      if (key === '\u0003' || key === 'q')
        exit();

      cb(key);
    });
  };
}

function start({process, console}, toggl, params) {
  keyListener(process)(key => {
    switch (key) {
      case 'h':
      case '?':
        console.log(cli.getShort());
        break;

      default:
        console.log(key);
        break;
    }
  });
}

module.exports = exports = {
  keyListener,
  start
};
