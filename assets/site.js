(function () {
  var body = document.body;
  var mdFile = body.getAttribute('data-md');
  var statusEl = document.getElementById('status');
  var content = document.getElementById('content');

  // theme toggle (remembered per browser; works without storage)
  var root = document.documentElement;
  try { var saved = localStorage.getItem('theme'); if (saved) root.setAttribute('data-theme', saved); } catch (e) {}
  var themeBtn = document.getElementById('theme');
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var cur = root.getAttribute('data-theme') || (dark ? 'dark' : 'light');
    var next = cur === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy') ? resolve() : reject(); } catch (e) { reject(e); }
      document.body.removeChild(ta);
    });
  }

  // "href|label" attribute -> pager link
  function pagerLink(attr, cls, prefix) {
    var v = body.getAttribute(attr);
    if (!v) return null;
    var parts = v.split('|');
    var a = document.createElement('a');
    a.className = cls; a.href = parts[0]; a.textContent = prefix + (parts[1] || parts[0]);
    return a;
  }

  // GitHub-style alerts: "> [!IMPORTANT]" -> styled callout box
  var ALERTS = {
    NOTE: ['ℹ️', 'Note'], TIP: ['💡', 'Tip'], IMPORTANT: ['❗', 'Important'],
    WARNING: ['⚠️', 'Warning'], CAUTION: ['🛑', 'Caution']
  };
  function alerts() {
    content.querySelectorAll('blockquote').forEach(function (bq) {
      var p = bq.firstElementChild;
      if (!p || p.tagName !== 'P') return;
      var m = p.innerHTML.match(/^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(?:<br\s*\/?>)?\s*/i);
      if (!m) return;
      var type = m[1].toUpperCase();
      p.innerHTML = p.innerHTML.slice(m[0].length).replace(/\n/g, '<br>');
      if (!p.innerHTML.trim()) bq.removeChild(p);
      bq.className = 'alert alert-' + type.toLowerCase();
      var title = document.createElement('div'); title.className = 'alert-title';
      title.textContent = ALERTS[type][0] + ' ' + ALERTS[type][1];
      bq.insertBefore(title, bq.firstChild);
    });
  }

  function decorate() {
    alerts();
    // copy buttons on every code block
    content.querySelectorAll('pre').forEach(function (pre) {
      var wrap = document.createElement('div'); wrap.className = 'codewrap';
      pre.parentNode.insertBefore(wrap, pre); wrap.appendChild(pre);
      var btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'copy'; btn.textContent = '複製';
      btn.addEventListener('click', function () {
        copyText(pre.innerText).then(function () {
          btn.textContent = '已複製'; setTimeout(function () { btn.textContent = '複製'; }, 1500);
        }, function () {
          btn.textContent = '請手動複製'; setTimeout(function () { btn.textContent = '複製'; }, 2000);
        });
      });
      wrap.appendChild(btn);
    });

    // table of contents from h2 headings
    var h2s = content.querySelectorAll('h2');
    if (h2s.length > 2) {
      var nav = document.createElement('nav'); nav.className = 'toc';
      nav.innerHTML = '<strong>目錄</strong>';
      var ol = document.createElement('ol');
      h2s.forEach(function (h, i) {
        h.id = 'sec-' + (i + 1);
        var li = document.createElement('li'); var a = document.createElement('a');
        a.href = '#' + h.id; a.textContent = h.textContent.replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, '');
        li.appendChild(a); ol.appendChild(li);
      });
      nav.appendChild(ol);
      h2s[0].parentNode.insertBefore(nav, h2s[0]);
    }

    // indent sub-sections: each h3 (and then each h4 inside it) with its body goes into a nested block
    function nest(container, tag, stops, cls) {
      Array.prototype.slice.call(container.children).forEach(function (h) {
        if (h.tagName !== tag) return;
        var box = document.createElement('div'); box.className = cls;
        h.parentNode.insertBefore(box, h);
        var n = h;
        while (n && !(n !== h && stops.indexOf(n.tagName) !== -1)) {
          var next = n.nextElementSibling; box.appendChild(n); n = next;
        }
      });
    }
    nest(content, 'H3', ['H1', 'H2', 'H3'], 'sub sub3');
    content.querySelectorAll('.sub3').forEach(function (box) { nest(box, 'H4', ['H4'], 'sub sub4'); });
    nest(content, 'H4', ['H1', 'H2', 'H3', 'H4'], 'sub sub4');

    // previous / next unit links under the content
    var prev = pagerLink('data-prev', 'prev', '← ');
    var next = pagerLink('data-next', 'next', '');
    if (next) next.textContent = next.textContent + ' →';
    if (prev || next) {
      var pager = document.createElement('nav'); pager.className = 'pager';
      pager.setAttribute('aria-label', '單元切換');
      if (prev) pager.appendChild(prev);
      if (next) pager.appendChild(next);
      content.appendChild(pager);
    }

    // external links open in a new tab
    content.querySelectorAll('a[href^="http"]').forEach(function (a) {
      if (a.href.indexOf(location.origin + '/') === 0) return;   // same site: stay in this tab
      a.target = '_blank'; a.rel = 'noopener';
    });
  }

  if (typeof marked === 'undefined') {
    statusEl.innerHTML = '無法載入渲染元件（可能被網路擋住）。請直接閱讀 <a href="' + mdFile + '">' + mdFile + '</a>。';
    return;
  }
  fetch(mdFile, { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(function (md) {
      content.innerHTML = marked.parse(md);
      statusEl.remove();
      var h1 = content.querySelector('h1');
      if (h1) document.title = h1.textContent;
      decorate();
      if (location.hash) { var el = document.querySelector(location.hash); if (el) el.scrollIntoView(); }
    })
    .catch(function () {
      statusEl.innerHTML = '讀取內容失敗。請直接閱讀 <a href="' + mdFile + '">' + mdFile + '</a>（若是用 file:// 本機開啟，瀏覽器會擋讀檔，請改看網頁版）。';
    });
})();
