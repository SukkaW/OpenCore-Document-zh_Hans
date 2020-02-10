module.exports = function (hexo) {
    hexo.extend.tag.register('note', (args, content) => {
        const className = args.shift();
        let header = '';
        let result = '';

        if (args.length) {
          header += `<div class="message-header">${args.join(' ')}</div>`;
        }

        result += `<blockquote class="message doku-blockquote is-${className}">${header}<div class="message-body">`;
        result += hexo.render.renderSync({text: content, engine: 'markdown'});
        result += '</div></blockquote>';

        return result;
      }, true);
}