/* AlbumPeel site: shows posts of the Blogger blog (albumpeel.blogspot.com) by label.
   Labels: news | blog | qna.   Markup:  <div class="feed" data-label="blog" data-max="3" data-style="cards|list"></div>
   Blogger feeds are read with JSONP (script tag) because the feed has no CORS header. */
(function () {
  var BLOG = 'https://albumpeel.blogspot.com';
  var TXT = {
    ko: { empty: '아직 글이 없습니다. 곧 올라옵니다.', err: '블로그를 불러오지 못했습니다.', go: '블로그에서 보기', locale: 'ko-KR' },
    en: { empty: 'No posts yet. Coming soon.', err: 'Could not load the blog.', go: 'Open on the blog', locale: 'en-US' }
  };
  // page key (data-label) -> Blogger label. Change here if the labels change.
  var LABELS = { news: 'news', blog: 'blog', qa: 'qna' };
  // language: every post carries ONE kind label (news | blog | qna) and ONE language label (ko | en).
  // 'intersect' = feed of both labels (/-/news/ko, verified to work on Blogger feeds); 'suffix' = single labels news-ko / news-en; 'none' = no language filter
  var LANG_MODE = 'intersect';
  var LANG_LABELS = { ko: 'ko', en: 'en' };
  var counter = 0;

  function strip(html) {
    var d = document.createElement('div');
    d.innerHTML = html || '';
    return (d.textContent || '').replace(/\s+/g, ' ').trim();
  }
  function link(entry) {
    var l = entry.link || [];
    for (var i = 0; i < l.length; i++) if (l[i].rel === 'alternate') return l[i].href;
    return BLOG;
  }
  // Blogger entry id = tag:blogger.com,1999:blog-<blogId>.post-<postId>  ->  read the post inside this site (post.html?id=<postId>)
  function postId(entry) {
    var m = /\.post-(\d+)$/.exec((entry.id && entry.id.$t) || '');
    return m ? m[1] : '';
  }
  function postHref(entry) {
    var id = postId(entry);
    return id ? 'post.html?id=' + id : link(entry);
  }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }
  function message(box, text) {
    box.innerHTML = '';
    box.appendChild(el('p', 'note', text));
  }

  function render(box, entries, lang) {
    var t = TXT[lang] || TXT.ko;
    box.innerHTML = '';
    if (!entries || !entries.length) { message(box, t.empty); return; }
    var list = box.getAttribute('data-style') === 'list';
    var wrap = el(list ? 'ul' : 'div', list ? 'feedlist' : 'grid3');
    entries.forEach(function (e) {
      var title = (e.title && e.title.$t) || '';
      var date = e.published ? new Date(e.published.$t).toLocaleDateString(t.locale) : '';
      var href = postHref(e);                                  // same window: the post is shown inside this site
      if (list) {
        var li = el('li');
        li.appendChild(el('span', 'fdate', date));
        var a = el('a', null, title); a.href = href;
        li.appendChild(a);
        wrap.appendChild(li);
        return;
      }
      var card = el('div', 'card');
      var thumb = e.media$thumbnail && e.media$thumbnail.url;
      if (thumb) thumb = thumb.replace(/\/s\d+(-c)?\//, '/w480-h300-c/');
      if (!thumb && e.content && e.content.$t) {                      // no thumbnail from Blogger: first picture of the post
        var m = /<img[^>]+src=["']([^"']+)["']/i.exec(e.content.$t);
        if (m) thumb = m[1];
      }
      if (thumb) {
        var img = el('img', 'thumb');
        img.src = thumb;
        img.alt = '';
        img.loading = 'lazy';
        card.appendChild(img);
      }
      var h = el('h3'); var a2 = el('a', null, title); a2.href = href; h.appendChild(a2);
      card.appendChild(h);
      card.appendChild(el('p', 'note', date));
      var text = strip((e.summary && e.summary.$t) || (e.content && e.content.$t));
      card.appendChild(el('p', null, text.length > 120 ? text.slice(0, 120) + '…' : text));
      wrap.appendChild(card);
    });
    box.appendChild(wrap);
  }

  function load(box) {
    var key = box.getAttribute('data-label') || 'blog';
    var label = LABELS[key] || key;
    var max = parseInt(box.getAttribute('data-max') || '3', 10);
    var lang = document.documentElement.lang === 'en' ? 'en' : 'ko';
    var t = TXT[lang];
    var path = encodeURIComponent(label);
    if (LANG_MODE === 'intersect') path += '/' + encodeURIComponent(LANG_LABELS[lang]);
    else if (LANG_MODE === 'suffix') path = encodeURIComponent(label + '-' + lang);
    var cb = '__apFeed' + (counter++);
    var done = false;
    var s = document.createElement('script');
    var timer = setTimeout(fail, 9000);
    function fail() {
      if (done) return;
      done = true; delete window[cb]; if (s.parentNode) s.parentNode.removeChild(s);
      message(box, t.err);
    }
    window[cb] = function (data) {
      if (done) return;
      done = true; clearTimeout(timer); delete window[cb]; if (s.parentNode) s.parentNode.removeChild(s);
      render(box, data && data.feed && data.feed.entry, lang);
    };
    s.onerror = fail;
    s.src = BLOG + '/feeds/posts/default/-/' + path + '?alt=json-in-script&callback=' + cb + '&max-results=' + max;
    document.head.appendChild(s);
  }

  // ---- single post page (post.html?id=<postId>): the post body is read from the Blogger feed and shown in the site design
  var PT = {
    ko: { back: '← 목록으로', orig: '블로그에서 원문 보기', miss: '글을 찾을 수 없습니다.', err: '글을 불러오지 못했습니다.', loading: '불러오는 중…' },
    en: { back: '← Back to the list', orig: 'View the original on the blog', miss: 'The post was not found.', err: 'Could not load the post.', loading: 'Loading…' }
  };
  var ALLOWED_FRAMES = /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com)\//i;
  function clean(html) {                                    // the post is written by us; this still removes scripts and event handlers
    var doc = new DOMParser().parseFromString('<body>' + (html || '') + '</body>', 'text/html');
    var kill = doc.body.querySelectorAll('script,style,link,meta,object,embed,form,base');
    for (var i = 0; i < kill.length; i++) kill[i].parentNode.removeChild(kill[i]);
    var frames = doc.body.querySelectorAll('iframe');
    for (var f = 0; f < frames.length; f++) if (!ALLOWED_FRAMES.test(frames[f].getAttribute('src') || '')) frames[f].parentNode.removeChild(frames[f]);
    var all = doc.body.querySelectorAll('*');
    for (var j = 0; j < all.length; j++) {
      var n = all[j];
      for (var k = n.attributes.length - 1; k >= 0; k--) {
        var an = n.attributes[k].name.toLowerCase(), av = n.attributes[k].value;
        if (an.indexOf('on') === 0 || /^\s*javascript:/i.test(av)) n.removeAttribute(n.attributes[k].name);
      }
      if (n.tagName === 'A' && n.getAttribute('href')) { n.setAttribute('target', '_blank'); n.setAttribute('rel', 'noopener'); }
    }
    return doc.body.innerHTML;
  }
  function loadPost(box) {
    var lang = document.documentElement.lang === 'en' ? 'en' : 'ko';
    var t = PT[lang];
    var id = (/[?&]id=(\d+)/.exec(location.search) || [])[1];
    if (!id) { message(box, t.miss); return; }
    message(box, t.loading);
    var cb = '__apPost' + (counter++), done = false;
    var s = document.createElement('script');
    var timer = setTimeout(fail, 9000);
    function fail() { if (done) return; done = true; delete window[cb]; if (s.parentNode) s.parentNode.removeChild(s); message(box, t.err); }
    window[cb] = function (data) {
      if (done) return;
      done = true; clearTimeout(timer); delete window[cb]; if (s.parentNode) s.parentNode.removeChild(s);
      var e = data && data.entry;
      if (!e) { message(box, t.miss); return; }
      var title = (e.title && e.title.$t) || '';
      var date = e.published ? new Date(e.published.$t).toLocaleDateString(TXT[lang].locale) : '';
      document.title = title + ' — AlbumPeel';
      box.innerHTML = '';
      box.appendChild(el('h1', 'ptitle', title));
      box.appendChild(el('p', 'note', date));
      var body = el('div', 'pbody'); body.innerHTML = clean(e.content && e.content.$t); box.appendChild(body);
      var nav = el('p', 'pnav');
      var back = el('a', null, t.back); back.href = 'javascript:history.back()';
      var cats = (e.category || []).map(function (c) { return c.term; });
      back.href = (cats.indexOf('news') >= 0 ? 'news.html' : cats.indexOf('qna') >= 0 ? 'qa.html' : 'blog.html');
      nav.appendChild(back);
      var o = el('a', null, t.orig); o.href = link(e); o.target = '_blank'; o.rel = 'noopener'; o.style.marginLeft = '18px';
      nav.appendChild(o);
      box.appendChild(nav);
    };
    s.onerror = fail;
    s.src = BLOG + '/feeds/posts/default/' + id + '?alt=json-in-script&callback=' + cb;
    document.head.appendChild(s);
  }

  window.AlbumPeelFeed = { render: render, clean: clean };            // used by the render test
  function start() {
    var boxes = document.querySelectorAll('.feed[data-label]');
    for (var i = 0; i < boxes.length; i++) load(boxes[i]);
    var post = document.getElementById('post');
    if (post) loadPost(post);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
