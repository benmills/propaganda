(function() {
  var spawn;
  spawn = require('child_process').spawn;
  module.exports = function(code, language_name, callback) {
    var errors, output, pygments;
    pygments = spawn('pygmentize', ['-l', language_name, '-f', 'html']);
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
  };
}).call(this);
