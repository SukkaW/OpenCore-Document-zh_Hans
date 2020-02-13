const { extname } = require('path');
const { stripHTML } = require('hexo-util');

module.exports = function (hexo) {
  function searchGenerator(locals = {}) {
    const url_for = hexo.extend.helper.get('url_for').bind(this);

    const parse = (item) => {
      const _item = {};
      if (item.title) _item.title = item.title;
      if (item.path) _item.url = url_for(item.path);
      if (item._content) {
        _item.content = stripHTML(item.content.trim().replace(/<pre(.*?)\<\/pre\>/gs, ''))
          .replace(/\n/g, ' ').replace(/\s+/g, ' ')
          .replace(new RegExp('(https?|ftp|file)://[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]', 'g'), '');
      }
      return _item;
    };

    const pages = locals.pages;
    const res = [];

    if (pages) {
      pages.each((page) => {
        res.push(parse(page));
      });
    }

    return {
      path: 'search.json',
      data: JSON.stringify(res)
    };
  }

  hexo.extend.generator.register('json', searchGenerator);
};
