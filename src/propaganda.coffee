markdown  = require 'robotskirt'
less      = require 'less'
fs        = require 'fs'
p         = console.log
{Filter}  = require './filter'

class Propaganda
  constructor: (@options, @parsedCallback) ->
    @filters = [
      Filter.ejs,
      Filter.header,
      Filter.footer
    ]

    @file        = fs.readFileSync(@options.file).toString()
    @stylesheet  = fs.readFileSync(@options.stylesheet).toString()
    @template    = fs.readFileSync(@options.template).toString()
    @output      = ''
    @errors      = ''

    @preParse =>
      @applyFilters()
      @postParse =>
        @parsedCallback(@errors, @output)

  preParse: (callback) ->
    markdown.toHtml @file, (html) =>
      @output = html.toString()
      less.render @stylesheet, (err, css) =>
        @css = css.toString()
        callback()

  postParse: (callback) ->
    waiting = Filter.highlight.call(this, @output)
    waiting.on Filter.DONE, (output) =>
      @output = output
      callback()

  applyFilters: ->
    for filter in @filters
      @output = filter.call(this, @output)

module.exports = (options, callback) ->
  new Propaganda options, (err, output) ->
    fs.writeFileSync 'index.html', output
