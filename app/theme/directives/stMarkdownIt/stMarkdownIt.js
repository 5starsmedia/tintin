export default
  /*@ngInject*/
  function () {
    return {
      restrict: 'A',
      scope: {
        'value': '=stMarkdownIt'
      },
      link: function (scope, element) {
        var defaults = {
          html:         false,        // Enable HTML tags in source
          xhtmlOut:     false,        // Use '/' to close single tags (<br />)
          breaks:       false,        // Convert '\n' in paragraphs into <br>
          langPrefix:   'language-',  // CSS language prefix for fenced blocks
          linkify:      true,         // autoconvert URL-like texts to links
          typographer:  true,         // Enable smartypants and other sweet transforms

          // options below are for demo only
          _highlight: true,
          _strict: false,
          _view: 'html'               // html / src / debug
        };

        defaults.highlight = function (str, lang) {
          if (!defaults._highlight || !window.hljs) { return ''; }

          var hljs = window.hljs;
          if (lang && hljs.getLanguage(lang)) {
            try {
              return hljs.highlight(lang, str).value;
            } catch (__) {}
          }

          try {
            return hljs.highlightAuto(str).value;
          } catch (__) {}

          return '';
        };
        let mdHtml = window.markdownit(defaults);
        mdHtml.use(function (md) {
          var arrayReplaceAt = md.utils.arrayReplaceAt;
          var escapeHtml = md.utils.escapeHtml;

          function pages_links(state) {
            var blockTokens = state.tokens,
              j, l, i, m,
              regex,
              regexGlobal,
              tokens,
              token,
              htmlLinkLevel,
              text,
              matches,
              nodes,
              level,
              match,
              mentionRegExp = '\\[\\[([^\\[]*)\\]\\]';

            regex       = new RegExp(mentionRegExp);
            regexGlobal = new RegExp(mentionRegExp, 'g');

            function isLinkOpen(str)  { return /^<a[>\s]/i.test(str); }
            function isLinkClose(str) { return /^<\/a\s*>/i.test(str); }

            for (j = 0, l = blockTokens.length; j < l; j++) {
              if (blockTokens[j].type !== 'inline') {
                continue;
              }
              htmlLinkLevel = 0;
              tokens = blockTokens[j].children;

              for (i = tokens.length - 1; i >= 0; i--) {
                token = tokens[i];

                // skip content of markdown links
                if (token.type === 'link_close') {
                  i--;
                  while (tokens[i].level !== token.level && tokens[i].type !== 'link_open') {
                    i--;
                  }
                  continue;
                }

                // skip content of html links
                if (token.type === 'html_inline') {
                  // we are going backwards, so isLinkOpen shows end of link
                  if (isLinkOpen(token.content) && htmlLinkLevel > 0) {
                    htmlLinkLevel--;
                  }
                  if (isLinkClose(token.content)) {
                    htmlLinkLevel++;
                  }
                }
                if (htmlLinkLevel > 0) {
                  continue;
                }

                if (token.type !== 'text') {
                  continue;
                }

                // find mentions
                text = token.content;
                matches = text.match(regexGlobal);
                if (matches === null) {
                  continue;
                }
                nodes = [];
                level = token.level;

                for (m = 0; m < matches.length; m++) {
                  match = matches[m].match(regex);
                  var pos = text.indexOf(matches[m]);

                  if (pos > 0) {
                    nodes.push({
                      type: 'text',
                      content: text.slice(0, pos),
                      level: level
                    });
                  }
                  var name = match[1];

                  nodes.push({
                    type: 'pages_links_open',
                    content: '#/wiki/' + escapeHtml(name).trim().toLowerCase().replace(/ /g, '-'),//person.url || '/people/' + person.guid,
                    level: level++
                  });
                  nodes.push({
                    type: 'pages_links_text',
                    content: escapeHtml(name).trim(),
                    level: level
                  });
                  nodes.push({
                    type: 'pages_links_close',
                    //content: lygneoId,
                    level: --level
                  });
                  text = text.slice(pos + match[0].length);
                }
                if (text.length > 0) {
                  nodes.push({
                    type: 'text',
                    content: text,
                    level: state.level
                  });
                }

                // replace current node
                tokens = arrayReplaceAt(tokens, i, nodes);
                blockTokens[j].children = tokens;
              }
            }
          }
          md.core.ruler.after("inline", "pages_links", pages_links);
          md.renderer.rules.pages_links_open  = (tokens, idx) => {
            return '<a href="' +
            tokens[idx].content +
            '" class="' +
            tokens[idx].linkclass +
            '">';
          };
          md.renderer.rules.pages_links_text  = (tokens, idx) => {
            return tokens[idx].content;
          };
          md.renderer.rules.pages_links_close = () => { return '</a>'; };
        });
        //
        // Inject line numbers for sync scroll. Notes:
        //
        // - We track only headings and paragraphs on first level. That's enough.
        // - Footnotes content causes jumps. Level limit filter it automatically.
        function injectLineNumbers(tokens, idx, options, env, self) {
          var line;
          if (tokens[idx].map && tokens[idx].level === 0) {
            line = tokens[idx].map[0];
            tokens[idx].attrPush([ 'class', 'line' ]);
            tokens[idx].attrPush([ 'data-line', String(line) ]);
          }
          return self.renderToken(tokens, idx, options, env, self);
        }

        mdHtml.renderer.rules.paragraph_open = mdHtml.renderer.rules.heading_open = injectLineNumbers;

        scope.$watch('value', (value) => {
          if (angular.isUndefined(value)) {
            return;
          }
          element.html(mdHtml.render(value));
        })
      }
    };
  }