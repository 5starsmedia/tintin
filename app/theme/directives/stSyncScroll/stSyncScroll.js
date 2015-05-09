export default
  /*@ngInject*/
  function () {
    return {
      restrict: 'A',
      scope: true,
      link: function () {
        // Build offsets for each line (lines can be wrapped)
        // That's a bit dirty to process each line everytime, but ok for demo.
        // Optimizations are required only for big texts.
        function buildScrollMap() {
          var i, offset, nonEmptyList, pos, a, b, lineHeightMap, linesCount,
            acc, sourceLikeDiv, textarea = $('.source'),
            _scrollMap;

          sourceLikeDiv = $('<div />').css({
            position: 'absolute',
            visibility: 'hidden',
            height: 'auto',
            width: textarea[0].clientWidth,
            'font-size': textarea.css('font-size'),
            'font-family': textarea.css('font-family'),
            'line-height': textarea.css('line-height'),
            'white-space': textarea.css('white-space')
          }).appendTo('body');

          offset = $('.result-html').scrollTop() - $('.result-html').offset().top;
          _scrollMap = [];
          nonEmptyList = [];
          lineHeightMap = [];

          acc = 0;
          textarea.val().split('\n').forEach(function(str) {
            var h, lh;

            lineHeightMap.push(acc);

            if (str.length === 0) {
              acc++;
              return;
            }

            sourceLikeDiv.text(str);
            h = parseFloat(sourceLikeDiv.css('height'));
            lh = parseFloat(sourceLikeDiv.css('line-height'));
            acc += Math.round(h / lh);
          });
          sourceLikeDiv.remove();
          lineHeightMap.push(acc);
          linesCount = acc;

          for (i = 0; i < linesCount; i++) { _scrollMap.push(-1); }

          nonEmptyList.push(0);
          _scrollMap[0] = 0;

          $('.line').each(function(n, el) {
            var $el = $(el), t = $el.data('line');
            if (t === '') { return; }
            t = lineHeightMap[t];
            if (t !== 0) { nonEmptyList.push(t); }
            _scrollMap[t] = Math.round($el.offset().top + offset);
          });

          nonEmptyList.push(linesCount);
          _scrollMap[linesCount] = $('.result-html')[0].scrollHeight;

          pos = 0;
          for (i = 1; i < linesCount; i++) {
            if (_scrollMap[i] !== -1) {
              pos++;
              continue;
            }

            a = nonEmptyList[pos];
            b = nonEmptyList[pos + 1];
            _scrollMap[i] = Math.round((_scrollMap[b] * (i - a) + _scrollMap[a] * (b - i)) / (b - a));
          }

          return _scrollMap;
        }

        // Synchronize scroll position from source to result
        var syncResultScroll = _.debounce(function () {
          var textarea = $('.source'),
            lineHeight = parseFloat(textarea.css('line-height')),
            lineNo, posTo;

          lineNo = Math.floor(textarea.scrollTop() / lineHeight);
          if (!scrollMap) {
            scrollMap = buildScrollMap();
          }
          posTo = scrollMap[lineNo];
          $('.result-html').stop(true).animate({
            scrollTop: posTo
          }, 100, 'linear');
        }, 50, {maxWait: 50});

        // Synchronize scroll position from result to source
        var syncSrcScroll = _.debounce(function () {
          var resultHtml = $('.result-html'),
            scrollTop = resultHtml.scrollTop(),
            textarea = $('.source'),
            lineHeight = parseFloat(textarea.css('line-height')),
            lines,
            i,
            line;

          if (!scrollMap) {
            scrollMap = buildScrollMap();
          }

          lines = Object.keys(scrollMap);

          if (lines.length < 1) {
            return;
          }

          line = lines[0];

          for (i = 1; i < lines.length; i++) {
            if (scrollMap[lines[i]] < scrollTop) {
              line = lines[i];
              continue;
            }

            break;
          }

          textarea.stop(true).animate({
            scrollTop: lineHeight * line
          }, 100, 'linear');
        }, 50, {maxWait: 50});
      }
    };
  }