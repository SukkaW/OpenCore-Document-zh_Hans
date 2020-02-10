module.exports = function (hexo) {
    const _url_for = hexo.extend.helper.get('url_for').bind(hexo);
    const url_for = (path) => {
        return _url_for(path).replace('index.html', '');
    }

    hexo.extend.helper.register('page_title', function (page = null) {
        page = (page === null) ? this.page : page;

        const data = [page.title, hexo.config.title];
        return data.filter((str) => typeof (str) !== 'undefined' && str.trim() !== '').join(' | ');
    });

    hexo.extend.helper.register('_meta_generator', () => `<meta name="generator" content="Hexo ${hexo.version}">`);

    hexo.extend.helper.register('page_nav', function (page = null) {
        page = (page === null) ? this.page : page;
        const { path } = this;

        let html = '<ul class="doku-pagination">';

        const sidebar = hexo.theme.config.sidebar[page.lang][page.type];
        const sidebarLinkArr = [];
        const sidebarNameArr = [];
        if (sidebar.level === 1) {
            for (const item of sidebar.items) {
                sidebarNameArr.push(item.split(' | ')[0]);
                sidebarLinkArr.push(url_for(item.split(' | ')[1]));
            }
        } else if (sidebar.level === 2) {
            for (const obj of sidebar.items) {
                for (const children of Object.values(obj)) {
                    for (const item of children) {
                        sidebarNameArr.push(item.split(' | ')[0]);
                        sidebarLinkArr.push(url_for(item.split(' | ')[1]));
                    }
                }
            }
        }

        const index = sidebarLinkArr.indexOf(url_for(path));
        if (index > 0) {
            html += `
            <li class="page-item page-prev">
                <a href="${sidebarLinkArr[index - 1]}">
                    <div class="page-item-subtitle"><span class="icon is-small"><i class="fas fa-arrow-left"></i></span> <span>前一页</span></div>
                    <div class="page-item-title h5">${sidebarNameArr[index - 1]}</div>
                </a>
            </li>`;
        }

        if (index < sidebarLinkArr.length - 1) {
            html += `
            <li class="page-item page-next">
                <a href="${sidebarLinkArr[index + 1]}">
                    <div class="page-item-subtitle"><span>后一页</span> <span class="icon is-small"><i class="fas fa-arrow-right"></i></span></div>
                    <div class="page-item-title h5">${sidebarNameArr[index + 1]}</div>
                </a>
            </li>`;
        }

        html += '</ul>';

        return html;
    });

}