(function (window, document) {
    var $el = function (id) { return document.getElementById(id); };
    window.getParameterByName = function (name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(window.location.search);
        return results == null ? '' : decodeURIComponent(results[1]);
    };
    window.searchEscape = function (keyword) {
        var htmlEntityMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            '\'': '&#39;',
            '/': '&#x2F;'
        };

        return keyword.replace(/[&<>"'/]/g, function (i) {
            return htmlEntityMap[i];
        });
    };
    var searchKeyword = window.getParameterByName('s');

    /* Fill URL Search Param back to input */
    if (searchKeyword) {
        var parseKeywords = function (key) {
            var input = key.trim().toLowerCase().split(/[\s\-]+/);
            var output = [];

            for (var i in input) {
                var keyword = input[i];
                if (keyword.indexOf('+') > -1) {
                    var keys = keyword.split('+');
                    for (var j in keys) {
                        output.push(keys[j]);
                    }
                } else {
                    output.push(keyword);
                }
            }

            return output;
        }

        var parsedKeywords = parseKeywords(searchKeyword);
        $el('search-input').setAttribute('value', parsedKeywords.join(' '));

        fetch('/search.json').then(function (res) {
            return res.json();
        }).then(function (data) {
            var resultArray = [];
            var resultNum = 0;

            data.forEach(function (data) {
                if (typeof data.title === 'undefined') return;
                if (typeof data.content === 'undefined') return;

                var data_title = data.title.trim().toLowerCase();
                var data_date = new Date(data.date).toLocaleDateString();
                var data_tags = (typeof data.tags !== 'undefined') ? data.tags : [];
                var data_content = data.content.trim().replace(/<[^>]+>/g, '').toLowerCase();

                var isMatch = true;
                var index_title = -1;
                var index_content = -1;
                var hit_title = 0;
                var hit_content = 0;
                var first_occur = -1;
                var data_weight = 0;

                if (data_title !== '' && data_content !== '') {
                    parsedKeywords.forEach(function (keyword, i) {
                        index_title = data_title.indexOf(keyword);
                        hit_title = data_title.split(keyword).length - 1;
                        index_content = data_content.indexOf(keyword);
                        hit_content = data_content.split(keyword).length - 1;

                        if (index_title < 0 && index_content < 0) {
                            isMatch = false;
                        } else {
                            if (index_title >= 0) data_weight = data_weight + 5 * hit_title;
                            if (index_content >= 0) data_weight = data_weight + 1 * hit_content;
                            if (i === 0) first_occur = index_content;
                            resultNum++;
                        }
                    });
                }

                if (isMatch) {
                    var match_title = data.title;
                    var match_content = '';

                    parsedKeywords.forEach(function (keyword) {
                        var regS = new RegExp(keyword, 'gi');
                        match_title = match_title.replace(regS, '<strong><mark>' + window.searchEscape(keyword) + '</mark></strong>');
                    });

                    if (first_occur >= 0) {
                        /* cut out characters & highlight keyword in content
                           There were still some bugs when cutting CJK.
                           Need to set max-height and overflow:none to elements contain search result summary
                        */
                        var start = first_occur - 15;
                        var end = first_occur + 20;
                        if (start < 0) start = 0;
                        if (start === 0) end = 20;
                        if (end > data.content.length) end = data.content.length - 20;

                        match_content = data.content.substr(start, end);
                        parsedKeywords.forEach(function (keyword) {
                            var regS = new RegExp(keyword, 'gi');
                            match_content = match_content.replace(regS, '<strong><mark>' + window.searchEscape(keyword) + '</mark></strong>');
                        })
                    }

                    var str = '<div class="search-item">'
                        + '<div class="search-title">'
                        + '<a href="' + data.url + '">'
                        + match_title
                        + '</a>'
                        + '</div>'
                        + '<div class="search-desc">'
                        + '<div class="search-summary">'
                        + match_content
                        + '</div>'
                        + '</div>'
                        + '</div>';

                    resultArray.push([str, data_weight]);
                }
            });

            var resultHtml = '';
            resultArray.sort(function (x, y) {
                return y[1] - x[1];
            });

            for (var i in resultArray) {
                resultHtml += resultArray[i][0];
            }

            $el('search-result').innerHTML = '<div class="search-info">本次搜索共找到 '
                + resultNum
                + ' 条结果</div>'
                + resultHtml;
        })
    }
})(window, document);
