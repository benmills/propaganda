less      = require 'less'
fs        = require 'fs'
p         = console.log
{Filter}  = require './filter'

class Propaganda
  constructor: (@options, @parsedCallback) ->
    @output        = fs.readFileSync(@options.file).toString()
    @stylesheet    = fs.readFileSync(@options.stylesheet).toString()
    @template      = fs.readFileSync(@options.template).toString()
    @pygmentizeCmd = @options.pygmentizeCmd || 'pygmentize'
    @errors        = ''

    @preParse =>
      @applyFilters [
        Filter.markdown,
        Filter.ejs,
        Filter.header,
        Filter.footer,
        Filter.highlight
      ], =>
        @parsedCallback(@errors, @output)

  preParse: (callback) ->
    less.render @stylesheet, (err, css) =>
      @css = css.toString()
      callback()

  applyFilters: (filters, callback) ->
    if filters.length == 0
      callback()
    else
      result = filters.shift().call(this, @output)
      if typeof result == 'string'
        @output = result
        @applyFilters(filters, callback)
      else
        result.on Filter.DONE, (output) =>
          @output = output
          @applyFilters(filters, callback)
        
module.exports = (options, callback) ->
  new Propaganda options, (err, output) ->
    fs.writeFileSync 'index.html', output
