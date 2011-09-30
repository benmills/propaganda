{spawn, exec} = require 'child_process'

module.exports = (cmd, code, language_name, callback) ->
  exec cmd, (err, stdout) ->
    if err
      callback '', ''
      return

    pygments = spawn cmd, ['-l', language_name, '-f', 'html']
    output = ''
    errors = ''

    pygments.stderr.addListener 'data', (error)  ->
      errors += error.toString() if error

    pygments.stdout.addListener 'data', (result) ->
      output += result if result

    pygments.addListener 'exit', ->
      callback errors, output

    pygments.stdin.write code
    pygments.stdin.end()

