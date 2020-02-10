(function (window, document) {
    /* Auto fixed */
    function autoFixed(targetElID, relativeElID, navbarElID) {
        var navbarHeight;
        var relativeHeight = document.getElementById(relativeElID).clientHeight;
        var target = document.getElementById(targetElID);

        if (navbarElID) {
            navbarHeight = document.getElementById(navbarElID).clientHeight;
            relativeHeight += navbarHeight;
        };

        function updateSidebarPosition() {
            var scrollTop = document.scrollingElement.scrollTop;

            if (scrollTop > relativeHeight) {
                target.classList.add('doku-fixed');
            } else {
                target.classList.remove('doku-fixed');
            }
        }

        window.addEventListener('scroll', function () {
            window.requestAnimationFrame(updateSidebarPosition);
        });

        updateSidebarPosition();
    };

    autoFixed('doku-sidebar', 'doku-navbar');

    /* Toggle sidebar */
    document.getElementById('doku-sidebar-toggle').addEventListener('click', function () {
        document.body.classList.toggle('doku-sidebar-visible')
    });

    document.getElementById('doku-main').addEventListener('click', function () {
        document.body.classList.remove('doku-sidebar-visible')
    })

    /* Copyright year auto update */
    document.getElementById('doku-copyrght-year').textContent = new Date().getFullYear();

    /* Init css: sticky polyfill */
    Stickyfill.add(document.getElementsByClassName('doku-document-toc'));
})(window, document);