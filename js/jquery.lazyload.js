!function (e, n) {
    "function" == typeof define && define.amd ? define(["jquery"], n) : n(e.jQuery)
}(this, function (e) {
    e.fn.lazyload = function (n) {
        return this.each(function () {
            n = n || {};
            var i = {}, t = e.extend({}, i, n), o = e(this), a = this, r = n.srcSign || "lazy-src", c = n.errCallBack || function () {
                }, f = n.container || e(window), g = function (e, n) {
            }, s = function (e, n, i, t) {
                if (!n[0].src || !(n[0].src.indexOf("img-err.png") > 0 || n[0].src.indexOf("img-err2.png") > 0)) {
                    n.width(), n.height();
                    n[0].src = "/img/img-err.png", i()
                }
            }, d = function (e) {
                var n = (e.width(), e.height(), e.offset().top, e.offset().left, e.clone().addClass("lazy-loding").insertBefore(e));
                 e.hide()
            }, l = function (e, i, t) {
                if (!e.attr("src"))if (1 == n.cache) {
                    console.log(e);
                    var o, a = document.getElementById("canvas1"), r = a.getContext("2d");
                    image = new Image, image.src = e.attr(i), image.onload = function () {
                        r.drawImage(image, 0, 0), o = r.getImageData(0, 0, 500, 250), console.log(o)
                    }
                } else {
                    d(e);
                    var c = e.attr(i);
                    e[0].onerror = function (n) {
                        s(n, e, t, c)
                    }, e[0].onload = function (n) {
                        e.parent().find(".lazy-loding").remove(), e.show(), g(n, e)
                    }, e[0].src = c
                }
            };
            if (t.cache = [], "IMG" == a.tagName) {
                var h = {obj: o, tag: "img", url: o.attr(r)};
                t.cache.push(h)
            } else {
                var u = o.find("img");
                u.each(function (n) {
                    var i = this.nodeName.toLowerCase(), o = e(this).attr(r), a = {obj: u.eq(n), tag: i, url: o};
                    t.cache.push(a)
                })
            }
            var m = function () {
                var n, i = f.height();
                n = e(window).get(0) === window ? e(window).scrollTop() : f.offset().top, e.each(t.cache, function (e, t) {
                    var o, a, f = t.obj, g = t.tag, s = t.url;
                    f && (o = f.offset().top - n, o + f.height(), (o >= 0 && o < i || a > 0 && a <= i) && (s && "img" === g && l(f, r, c), t.obj = null))
                })
            };
            m(), f.bind("scroll", m), f.bind("resize", m)
        })
    }
});