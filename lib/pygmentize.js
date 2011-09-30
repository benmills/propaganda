(function() {
  var exec, spawn, _ref;
  _ref = require('child_process'), spawn = _ref.spawn, exec = _ref.exec;
  module.exports = function(cmd, code, language_name, callback) {
    return exec(cmd, function(err, stdout) {
      var errors, output, pygments;
      if (err) {
        callback('', '');
        return;
      }
      pygments = spawn(cmd, ['-l', language_name, '-f', 'html']);
      output = '';
      errors = '';
      pygments.stderr.addListener('data', function(error) {
        if (error) {
          return errors += error.toString();
        }
      });
      pygments.stdout.addListener('data', function(result) {
        if (result) {
          return output += result;
        }
      });
      pygments.addListener('exit', function() {
        return callback(errors, output);
      });
      pygments.stdin.write(code);
      return pygments.stdin.end();
    });
  };
}).call(this);
