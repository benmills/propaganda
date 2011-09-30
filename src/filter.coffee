$               = require 'jquery'
ejs             = require 'ejs'
markdown        = require 'robotskirt'
pygmentize      = require './pygmentize'
{EventEmitter}  = require 'events'

class Filter
  @DONE = 'done'

  @ejs: (output) ->
    context =
      content: output
      stylesheet: @css
    
    ejs.render @template, {locals: context}

  @header: (output) ->
    return output if not @options.headerSel?
    
    sel = @options.headerSel
    $('body').html('')
    $(output).appendTo('body')
    
    blocksHtml = ''
    header = ''
    $(sel).each ->
      header += $(this).remove().clone().wrap('<div></div>').parent().html()

    if header.length
      if @options.blocks?
        @options.blocks = [@options.blocks] if typeof @options.blocks is 'string'
        blocksHtml += "<div>#{b}</div>" for b in @options.blocks
        
      $('div#main').before("<header><div class='center'>#{blocksHtml}#{header}</div></header>")
      $('body').html()
    else
      output

  @footer: (output) ->
    return output if not @options.footerSel?
    
    sel = @options.footerSel
    $('body').html('')
    $(output).appendTo('body')

    startIndex = $(sel).index()
    $elements = $('div#main').children()
    length = $elements.length - 1
    footer = ''

    for i in [startIndex..length]
      footer += $($elements[i]).remove().clone().wrap('<div></div>').parent().html()

    if footer.length
      $('div#main').after("<footer><div class='center'>#{footer}</div></footer>")
      $('body').html()
    else
      output

  @markdown: (output) ->
    waiting = new EventEmitter()
    markdown.toHtml output, (html) ->
      waiting.emit Filter.DONE, html.toString()
    waiting

  @highlight: (output) ->
    waiting = new EventEmitter()
    $('body').html('')
    $(output).appendTo('body')
    $code = $("code")
    toColor = $code.length
    errors = ''
    doneHighlighting = false
    cmd = @pygmentizeCmd

    finishHighlight = ->
      if toColor == 1
        doneHighlighting = true
        waiting.emit Filter.DONE, $('body').html()
      else
        toColor--
    
    $code.each ->
      $item = $(this)

      do ($item) ->
        lang = $item.attr('class')
        if lang.length > 0
          unescapedHtml = $("<div/>").html($item.html()).text()
          pygmentize(
            cmd, unescapedHtml, $item.attr('class'),
            (colorizeErrors, highlightedCode) ->
              if highlightedCode
                errors += colorizeErrors
                $item.parent("pre").replaceWith(highlightedCode)
              finishHighlight()
          )
        else
          finishHighlight()

    if doneHighlighting
      $('body').html()
    else
      waiting


module.exports.Filter = Filter
