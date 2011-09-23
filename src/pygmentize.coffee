{spawn} = require 'child_process'

module.exports = (code, language_name, callback) ->
  pygments = spawn 'pygmentize', ['-l', language_name, '-f', 'html']
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

