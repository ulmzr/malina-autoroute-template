(() => {
  // node_modules/malinajs/runtime.js
  var __app_onerror = console.error;
  var isFunction = (fn) => typeof fn == "function";
  var isObject = (d2) => typeof d2 == "object";
  var safeCall = (fn) => {
    try {
      return isFunction(fn) && fn();
    } catch (e) {
      __app_onerror(e);
    }
  };
  function $watch(cd, fn, callback, w2) {
    if (!w2)
      w2 = {};
    w2.fn = fn;
    w2.cb = callback;
    if (!("value" in w2))
      w2.value = NaN;
    cd.watchers.push(w2);
    return w2;
  }
  function $watchReadOnly(cd, fn, callback) {
    return $watch(cd, fn, callback, { ro: true });
  }
  function cd_onDestroy(cd, fn) {
    if (fn)
      cd._d.push(fn);
  }
  function $$removeItem(array, item) {
    let i2 = array.indexOf(item);
    if (i2 >= 0)
      array.splice(i2, 1);
  }
  function $ChangeDetector(parent) {
    this.parent = parent;
    this.children = [];
    this.watchers = [];
    this._d = [];
    this.prefix = [];
    this.$$ = parent?.$$;
  }
  $ChangeDetector.prototype.new = function() {
    var cd = new $ChangeDetector(this);
    this.children.push(cd);
    return cd;
  };
  $ChangeDetector.prototype.destroy = function(option) {
    if (option !== false && this.parent)
      $$removeItem(this.parent.children, this);
    this.watchers.length = 0;
    this.prefix.length = 0;
    this._d.map(safeCall);
    this._d.length = 0;
    this.children.map((cd) => cd.destroy(false));
    this.children.length = 0;
  };
  var isArray = (a2) => Array.isArray(a2);
  var compareDeep = (a2, b2, lvl) => {
    if (lvl < 0 || !a2 || !b2)
      return a2 !== b2;
    if (a2 === b2)
      return false;
    let o0 = isObject(a2);
    let o1 = isObject(b2);
    if (!(o0 && o1))
      return a2 !== b2;
    let a0 = isArray(a2);
    let a1 = isArray(b2);
    if (a0 !== a1)
      return true;
    if (a0) {
      if (a2.length !== b2.length)
        return true;
      for (let i2 = 0; i2 < a2.length; i2++) {
        if (compareDeep(a2[i2], b2[i2], lvl - 1))
          return true;
      }
    } else {
      let set = {};
      for (let k in a2) {
        if (compareDeep(a2[k], b2[k], lvl - 1))
          return true;
        set[k] = true;
      }
      for (let k in b2) {
        if (set[k])
          continue;
        return true;
      }
    }
    return false;
  };
  function cloneDeep(d2, lvl) {
    if (lvl < 0 || !d2)
      return d2;
    if (isObject(d2)) {
      if (d2 instanceof Date)
        return d2;
      if (d2 instanceof Element)
        return d2;
      if (isArray(d2))
        return d2.map((i2) => cloneDeep(i2, lvl - 1));
      let r = {};
      for (let k in d2)
        r[k] = cloneDeep(d2[k], lvl - 1);
      return r;
    }
    return d2;
  }
  function $$deepComparator(depth) {
    return function(w2, value) {
      let diff = compareDeep(w2.value, value, depth);
      diff && (w2.value = cloneDeep(value, depth), !w2.idle && w2.cb(value));
      w2.idle = false;
      return !w2.ro && diff ? 1 : 0;
    };
  }
  var $$compareDeep = $$deepComparator(10);
  var keyComparator = (w2, value) => {
    let diff = false;
    for (let k in value) {
      if (w2.value[k] != value[k])
        diff = true;
      w2.value[k] = value[k];
    }
    diff && !w2.idle && w2.cb(value);
    w2.idle = false;
    return !w2.ro && diff ? 1 : 0;
  };
  var fire = (w2) => {
    if (w2.cmp)
      w2.cmp(w2, w2.fn());
    else {
      w2.value = w2.fn();
      w2.cb(w2.value);
    }
  };
  function $digest($cd) {
    let loop = 10;
    let w2;
    while (loop >= 0) {
      let changes = 0;
      let index = 0;
      let queue = [];
      let i2, value, cd = $cd;
      while (cd) {
        for (i2 = 0; i2 < cd.prefix.length; i2++)
          cd.prefix[i2]();
        for (i2 = 0; i2 < cd.watchers.length; i2++) {
          w2 = cd.watchers[i2];
          value = w2.fn();
          if (w2.value !== value) {
            if (w2.cmp) {
              changes += w2.cmp(w2, value);
            } else {
              w2.value = value;
              if (!w2.ro)
                changes++;
              w2.cb(w2.value);
            }
          }
        }
        if (cd.children.length)
          queue.push.apply(queue, cd.children);
        cd = queue[index++];
      }
      loop--;
      if (!changes)
        break;
    }
    if (loop < 0)
      __app_onerror("Infinity changes: ", w2);
  }
  var templatecache = {};
  var $$uniqIndex = 1;
  var childNodes = "childNodes";
  var firstChild = "firstChild";
  var noop = (a2) => a2;
  var insertAfter = (label, node) => {
    label.parentNode.insertBefore(node, label.nextSibling);
  };
  var $$htmlToFragmentClean = (html) => {
    if (templatecache[html])
      return templatecache[html].cloneNode(true);
    let t = document.createElement("template");
    t.innerHTML = html.replace(/<>/g, "<!---->");
    let result = t.content;
    let it = document.createNodeIterator(result, 128);
    let n;
    while (n = it.nextNode()) {
      if (!n.nodeValue)
        n.parentNode.replaceChild(document.createTextNode(""), n);
    }
    templatecache[html] = result.cloneNode(true);
    return result;
  };
  function $$removeElements(el, last) {
    let next;
    while (el) {
      next = el.nextSibling;
      el.remove();
      if (el == last)
        break;
      el = next;
    }
  }
  var _tick_list = [];
  var _tick_planned = {};
  function $tick(fn, uniq) {
    if (uniq) {
      if (_tick_planned[uniq])
        return;
      _tick_planned[uniq] = true;
    }
    _tick_list.push(fn);
    if (_tick_planned.$tick)
      return;
    _tick_planned.$tick = true;
    Promise.resolve().then(() => {
      _tick_planned = {};
      let list = _tick_list;
      _tick_list = [];
      list.map(safeCall);
    });
  }
  var current_component;
  var $context;
  var $onDestroy = (fn) => current_component._d.push(fn);
  var $insertElementByOption = ($label, $option, $element) => {
    if ($option.$l) {
      insertAfter($label, $element);
    } else {
      $label.appendChild($element);
    }
  };
  var $readOnlyBase = {
    a: ($component) => {
      $component.$cd = {
        _d: $component._d,
        watchers: [],
        prefix: [],
        new: () => $component.$cd,
        destroy: noop,
        $$: $component
      };
    },
    b: ($component) => {
      let watchers = $component.$cd.watchers;
      let prefix = $component.$cd.prefix;
      while (watchers.length || prefix.length) {
        let wl = watchers.slice();
        watchers.length = 0;
        prefix.forEach(safeCall);
        prefix.length = 0;
        wl.forEach((w2) => w2.cb(w2.fn()));
      }
    }
  };
  var $base = {
    a: ($component) => {
      let $cd = new $ChangeDetector();
      $cd.$$ = $component;
      $onDestroy(() => $cd.destroy());
      let id = `a${$$uniqIndex++}`;
      let process;
      let apply = (r) => {
        if (process)
          return r;
        $tick(() => {
          try {
            process = true;
            $digest($cd);
          } finally {
            process = false;
          }
        }, id);
        return r;
      };
      $component.$cd = $cd;
      $component.apply = apply;
      $component.push = apply;
      apply();
    },
    b: noop
  };
  var makeComponent = (init, $base2) => {
    return ($element, $option = {}) => {
      let prev = current_component;
      $context = $option.context || {};
      let $component = current_component = {
        $option,
        destroy: () => $component._d.map(safeCall),
        context: $context,
        exported: {},
        _d: [],
        _m: []
      };
      $base2.a($component);
      try {
        $insertElementByOption($element, $option, init($option, $component.apply));
        $base2.b($component);
      } finally {
        current_component = prev;
        $context = null;
      }
      $tick(() => $component._d.push(...$component._m.map(safeCall)));
      return $component;
    };
  };
  var callComponent = (cd, context, component, label, option, propFn, cmp, setter, classFn) => {
    option.$l = 1;
    option.context = { ...context };
    let $component, parentWatch, childWatch;
    if (propFn) {
      if (cmp) {
        parentWatch = $watch(cd, propFn, (value) => {
          option.props = value;
          if ($component) {
            $component.push?.();
            childWatch && (childWatch.idle = true);
            $component.apply?.();
          }
        }, { ro: true, value: {}, cmp });
        fire(parentWatch);
      } else
        option.props = propFn();
    }
    if (classFn) {
      fire($watch(cd, classFn, (value) => {
        option.$class = value;
        $component?.apply?.();
      }, { ro: true, value: {}, cmp: keyComparator }));
    }
    $component = safeCall(() => component(label, option));
    if ($component) {
      cd_onDestroy(cd, $component.destroy);
      if (setter && $component.exportedProps) {
        childWatch = $watch($component.$cd, $component.exportedProps, (value) => {
          setter(value);
          cd.$$.apply();
        }, { ro: true, idle: true, value: parentWatch.value, cmp });
      }
    }
    return $component;
  };
  var autoSubscribe = (...list) => {
    list.forEach((i2) => {
      if (isFunction(i2.subscribe)) {
        let unsub = i2.subscribe(current_component.apply);
        if (isFunction(unsub))
          cd_onDestroy(current_component, unsub);
      }
    });
  };
  var bindText = (cd, element, fn) => {
    $watchReadOnly(cd, () => "" + fn(), (value) => {
      element.textContent = value;
    });
  };
  var attachSlot = ($context2, $cd, slotName, label, props, placeholder, cmp) => {
    let $slot = $cd.$$.$option.slots?.[slotName];
    if ($slot) {
      let resultProps = {}, push;
      if (props) {
        let setter = (k) => {
          return (v2) => {
            resultProps[k] = v2;
            push?.();
          };
        };
        for (let k in props) {
          let v2 = props[k];
          if (isFunction(v2)) {
            fire($watch($cd, v2, setter(k), { ro: true, cmp }));
          } else
            resultProps[k] = v2;
        }
      }
      push = $slot($cd, label, $context2, resultProps);
    } else
      placeholder?.();
  };
  var makeSlot = (parentCD, fn) => {
    return (callerCD, label, $context2, props) => {
      let $cd = parentCD.new();
      cd_onDestroy(callerCD, () => $cd.destroy());
      let r = fn($cd, $context2, callerCD, props || {});
      insertAfter(label, r.el || r);
      $cd.$$.apply?.();
      return r.push;
    };
  };
  var prefixPush = ($cd, fn) => {
    $cd.prefix.push(fn);
    fn();
  };
  function $$ifBlock($cd, $parentElement, fn, tpl, build, tplElse, buildElse) {
    let childCD;
    let first, last;
    function create(fr, builder) {
      childCD = $cd.new();
      let tpl2 = fr.cloneNode(true);
      builder(childCD, tpl2);
      first = tpl2[firstChild];
      last = tpl2.lastChild;
      insertAfter($parentElement, tpl2);
    }
    function destroy() {
      if (!childCD)
        return;
      childCD.destroy();
      childCD = null;
      $$removeElements(first, last);
      first = last = null;
    }
    $watch($cd, fn, (value) => {
      if (value) {
        destroy();
        create(tpl, build);
      } else {
        destroy();
        if (buildElse)
          create(tplElse, buildElse);
      }
    });
  }

  // node_modules/storxy/dist/storxy.esm.js
  function a(t) {
    return t !== null && typeof t == "object";
  }
  function f(t) {
    return typeof t == "function";
  }
  function $(t, r) {
    return t != t ? r == r : t !== r || t && a(t) || f(t);
  }
  function p(t, r, n) {
    if (!a(t))
      return t;
    for (let e in t)
      t[e] = p(t[e], r);
    let u = (e) => (!n || e === n) && r();
    return new Proxy(t, { set(e, o, i2) {
      return $(e[o], i2) && (e[o] = p(i2, r), u(o)), true;
    }, deleteProperty(e, o) {
      return delete e[o], u(o), true;
    } });
  }
  function l(t, r) {
    let n, u = /* @__PURE__ */ new Set(), s = null, e = p({ $: t }, () => n(), "$");
    n = () => {
      u.forEach((i2) => i2(e.$));
    };
    let o = (i2) => {
      u.delete(i2), s && !u.size && (f(s) ? s(e) : f(s.then) && s.then((c) => c(e)));
    };
    return e.subscribe = (i2, c) => (u.size || (s = f(r) ? r(e) : null), u.add(i2), c || i2(e.$), () => o(i2)), e.$$ = e.subscribe, e;
  }

  // node_modules/malinajs-router/dist/malina-router.js
  var i = w();
  function w() {
    let t = window.location.pathname === "srcdoc", a2 = () => t ? $2() : b(), o = (e, n) => {
      t ? window.location.hash = e : history.pushState({}, "", e), n.$ = a2();
    }, r = l(a2(), () => {
      window.hashchange = window.onpopstate = () => {
        r.$ = a2();
      };
      let e = g((n) => o(n, r));
      return () => {
        window.hashchange = window.onpopstate = null, e();
      };
    });
    return { subscribe: r.subscribe, $$: r.subscribe, goto: (e) => o(e, r), method: (e) => r.$ = a2(t = e === "hash") };
  }
  function b() {
    return { path: window.location.pathname, query: f2(window.location.href), hash: window.location.hash.slice(1) };
  }
  function $2() {
    let t = String(window.location.hash.slice(1) || "/").match(/^([^?#]+)(?:\?([^#]+))?(?:#(.+))?$/);
    return { path: t[1] || "", query: f2(window.location.href), hash: t[3] || "" };
  }
  function g(t) {
    let a2 = (o) => {
      let r = o.target.closest("a[href]");
      r && /^\/$|^\/\w|^\/#\/\w/.test(r.getAttribute("href")) && (o.preventDefault(), t(r.getAttribute("href").replace(/^\/#/, "")));
    };
    return addEventListener("click", a2), () => removeEventListener("click", a2);
  }
  function f2(t) {
    let a2 = new URL(t).searchParams, o = {};
    for (let [r, e] of a2)
      o[`${r}`] = e;
    return o;
  }
  function v(t) {
    let a2 = t.fallback ? "fallbacks" : "childs", o = l({}), r = { url: "", query: "", params: {}, subscribe: o.subscribe };
    o.$ = r;
    let e = { un: null, exact: false, pattern: "", parent: $context.parent, fallback: t.fallback, childs: /* @__PURE__ */ new Set(), activeChilds: /* @__PURE__ */ new Set(), fallbacks: /* @__PURE__ */ new Set(), active: false, makePattern(n) {
      e.exact = !n.endsWith("/*"), e.pattern = h(`${e.parent && e.parent.pattern || ""}${n}`);
    }, register: () => {
      if (!!e.parent)
        return e.parent[a2].add(e), () => {
          e.parent[a2].delete(e), e.un && e.un();
        };
    }, show: () => {
      e.redirect ? i.goto(e.redirect) : (t.onShow(), !e.fallback && e.parent && e.parent.activeChilds.add(e), e.active = true);
    }, hide: () => {
      t.onHide(), !e.fallback && e.parent && e.parent.activeChilds.delete(e), e.active = false;
    }, match: (n) => {
      let s = d(e.pattern, n);
      !e.fallback && s && (!e.exact || e.exact && s.exact) ? (e.show(), r.params = s.params, o.$ = r) : e.hide(), $tick(() => {
        if (s && e.childs.size > 0 && e.activeChilds.size == 0) {
          let c = e;
          for (; c.fallbacks.size == 0; )
            if (c = c.parent, !c)
              return;
          c && c.fallbacks.forEach((l2) => {
            l2.show();
          });
        }
      });
    }, meta: r };
    return e.makePattern(t.path), e.un = i.subscribe((n) => {
      r.url = n.path, r.query = n.query, r.params = {}, o.$ = r, e.match(n.path), t.force && e.active && (t.onHide(), $tick(() => t.onShow()));
    }), $context.parent = e, $context.route = e.meta, $onDestroy(e.register()), e;
  }
  function d(t, a2) {
    t = h(t), a2 = h(a2);
    let o = [], r = {}, e = true, n = t.split("/").map((c) => c.startsWith(":") ? (o.push(c.slice(1)), "([^\\/]+)") : c).join("\\/"), s = a2.match(new RegExp(`^${n}$`));
    if (s || (e = false, s = a2.match(new RegExp(`^${n == "\\/" ? "" : n}/|^${n}$`))), !!s)
      return o.forEach((c, l2) => r[c] = s[l2 + 1]), { exact: e, params: r };
  }
  function h(t) {
    return t = t.replace(/(^\/#)|(^\/\/#)|(^\/\/)|(\/\*$)|(\/$)/g, ""), t.startsWith("/") || (t = "/" + t), t;
  }

  // node_modules/malinajs-router/cmp/Route.xht
  var Route_default = makeComponent(($option, $$apply) => {
    const $component = current_component;
    let $props = $option.props || {};
    const $context2 = $context;
    autoSubscribe(v, i);
    let { path = "/*", fallback = false, redirect = null, force = false } = $props;
    current_component.push = () => ({ path = path, fallback = fallback, redirect = redirect, force = force } = $props = $option.props || {});
    current_component.exportedProps = () => ({ path, fallback, redirect, force });
    let active = false;
    const route = v({
      path,
      fallback,
      force,
      redirect,
      onShow: () => $$apply(active = true),
      onHide: () => $$apply(active = false)
    });
    {
      let $cd = $component.$cd;
      const $parentElement = $$htmlToFragmentClean(`<>`);
      let el1 = $parentElement[firstChild];
      $$ifBlock(
        $cd,
        el1,
        () => !!active,
        $$htmlToFragmentClean(` <> `),
        ($cd2, $parentElement2) => {
          let el0 = $parentElement2[childNodes][1];
          attachSlot($context2, $cd2, "default", el0, {
            url: () => route.meta.url,
            query: () => route.meta.query,
            params: () => route.meta.params
          });
        }
      );
      $watch($cd, () => path, () => {
        route.makePattern(path);
      });
      prefixPush($cd, () => {
        route.redirect = redirect;
      });
      return $parentElement;
    }
  }, $base);

  // src/routes/+page.xht
  var page_default = ($element, $option = {}) => {
    {
      const $parentElement = $$htmlToFragmentClean(`<center> <h1> Homepage <p>About homepage</p> </h1> </center>`);
      $insertElementByOption($element, $option, $parentElement);
    }
  };

  // src/modules/E404.xht
  var E404_default = ($element, $option = {}) => {
    {
      const $parentElement = $$htmlToFragmentClean(`<center> <h1>404</h1> <p>FILE NOT FOUND</p> </center>`);
      $insertElementByOption($element, $option, $parentElement);
    }
  };

  // src/routes/about/Slug.xht
  var Slug_default = makeComponent(($option, $$apply) => {
    const $component = current_component;
    let $props = $option.props || {};
    let { slug } = $props;
    current_component.push = () => ({ slug = slug } = $props = $option.props || {});
    current_component.exportedProps = () => ({ slug });
    {
      let $cd = $component.$cd;
      const $parentElement = $$htmlToFragmentClean(`<h2> About <sub> </sub> </h2> <br/>`);
      let el0 = $parentElement[firstChild][childNodes][1][firstChild];
      bindText($cd, el0, () => `Content of slug=` + slug + ` serve on /about/Slug.xht.`);
      $watch($cd, () => slug, () => {
        console.log(slug);
      });
      return $parentElement;
    }
  }, $base);

  // src/routes/about/+page.xht
  var page_default2 = makeComponent(($option, $$apply) => {
    const $component = current_component;
    let $props = $option.props || {};
    const $context2 = $context;
    let { params = {} } = $props;
    current_component.push = () => ({ params = params } = $props = $option.props || {});
    current_component.exportedProps = () => ({ params });
    let slug;
    {
      let $cd = $component.$cd;
      const $parentElement = $$htmlToFragmentClean(`<h2> About <sub>Content of About serve on /about/+page.xht.</sub> </h2> <br/> <>`);
      let el1 = $parentElement[childNodes][4];
      $$ifBlock(
        $cd,
        el1,
        () => !!slug,
        $$htmlToFragmentClean(` <> `),
        ($cd2, $parentElement2) => {
          let el0 = $parentElement2[childNodes][1];
          callComponent(
            $cd2,
            $context2,
            Slug_default,
            el0,
            {},
            () => ({ slug }),
            keyComparator
          );
        }
      );
      $watch($cd, () => params, () => {
        slug = params.slug;
      });
      return $parentElement;
    }
  }, $base);

  // src/routes/about/book/Slug.xht
  var Slug_default2 = makeComponent(($option, $$apply) => {
    const $component = current_component;
    let $props = $option.props || {};
    let { slug } = $props;
    current_component.push = () => ({ slug = slug } = $props = $option.props || {});
    current_component.exportedProps = () => ({ slug });
    {
      let $cd = $component.$cd;
      const $parentElement = $$htmlToFragmentClean(`<h2> Book <sub> </sub> </h2> <br/>`);
      let el0 = $parentElement[firstChild][childNodes][1][firstChild];
      bindText($cd, el0, () => `Content of slug=` + slug + ` serve on /about/book/Slug.xht.`);
      $watch($cd, () => slug, () => {
        console.log(slug);
      });
      return $parentElement;
    }
  }, $base);

  // src/routes/about/book/+page.xht
  var page_default3 = makeComponent(($option, $$apply) => {
    const $component = current_component;
    let $props = $option.props || {};
    const $context2 = $context;
    let { params = {} } = $props;
    current_component.push = () => ({ params = params } = $props = $option.props || {});
    current_component.exportedProps = () => ({ params });
    let slug;
    {
      let $cd = $component.$cd;
      const $parentElement = $$htmlToFragmentClean(`<h2> Book <sub>Content of Book serve on /about/book/+page.xht.</sub> </h2> <br/> <>`);
      let el1 = $parentElement[childNodes][4];
      $$ifBlock(
        $cd,
        el1,
        () => !!slug,
        $$htmlToFragmentClean(` <> `),
        ($cd2, $parentElement2) => {
          let el0 = $parentElement2[childNodes][1];
          callComponent(
            $cd2,
            $context2,
            Slug_default2,
            el0,
            {},
            () => ({ slug }),
            keyComparator
          );
        }
      );
      $watch($cd, () => params, () => {
        slug = params.slug;
      });
      return $parentElement;
    }
  }, $base);

  // src/Router.xht
  var Router_default = makeComponent(($option, $$apply) => {
    const $component = current_component;
    const $context2 = $context;
    {
      let $cd = $component.$cd;
      const $parentElement = $$htmlToFragmentClean(`<>`);
      let el12 = $parentElement[firstChild];
      {
        let slots = {};
        slots.default = makeSlot($cd, ($cd2, $context3, $instance_Route) => {
          let $parentElement2 = $$htmlToFragmentClean(`<> <> <> <> <> <>`);
          let el1 = $parentElement2[firstChild];
          let el3 = $parentElement2[childNodes][2];
          let el5 = $parentElement2[childNodes][4];
          let el7 = $parentElement2[childNodes][6];
          let el9 = $parentElement2[childNodes][8];
          let el11 = $parentElement2[childNodes][10];
          {
            let slots2 = {};
            slots2.default = makeSlot($cd2, ($cd3, $context4, $instance_Route2) => {
              let $parentElement3 = $$htmlToFragmentClean(`<>`);
              let el0 = $parentElement3[firstChild];
              callComponent($cd3, $context4, page_default, el0, {});
              return $parentElement3;
            });
            callComponent($cd2, $context3, Route_default, el1, { slots: slots2, props: { path: `/` } });
          }
          {
            let slots2 = {};
            slots2.default = makeSlot($cd2, ($cd3, $context4, $instance_Route2) => {
              let $parentElement3 = $$htmlToFragmentClean(`<>`);
              let el2 = $parentElement3[firstChild];
              callComponent($cd3, $context4, page_default2, el2, {});
              return $parentElement3;
            });
            callComponent($cd2, $context3, Route_default, el3, { slots: slots2, props: { path: `/about` } });
          }
          {
            let slots2 = {};
            slots2.default = makeSlot($cd2, ($cd3, $context4, $instance_Route2, props) => {
              let $parentElement3 = $$htmlToFragmentClean(` <> `);
              let { params } = props;
              let push = () => ({ params } = props, $$apply());
              let el4 = $parentElement3[childNodes][1];
              callComponent(
                $cd3,
                $context4,
                page_default2,
                el4,
                {},
                () => ({ params }),
                keyComparator
              );
              return { push, el: $parentElement3 };
            });
            callComponent($cd2, $context3, Route_default, el5, { slots: slots2, props: { path: `/about/:slug` } });
          }
          {
            let slots2 = {};
            slots2.default = makeSlot($cd2, ($cd3, $context4, $instance_Route2) => {
              let $parentElement3 = $$htmlToFragmentClean(`<>`);
              let el6 = $parentElement3[firstChild];
              callComponent($cd3, $context4, page_default3, el6, {});
              return $parentElement3;
            });
            callComponent($cd2, $context3, Route_default, el7, { slots: slots2, props: { path: `/about/book` } });
          }
          {
            let slots2 = {};
            slots2.default = makeSlot($cd2, ($cd3, $context4, $instance_Route2, props) => {
              let $parentElement3 = $$htmlToFragmentClean(` <> `);
              let { params } = props;
              let push = () => ({ params } = props, $$apply());
              let el8 = $parentElement3[childNodes][1];
              callComponent(
                $cd3,
                $context4,
                page_default3,
                el8,
                {},
                () => ({ params }),
                keyComparator
              );
              return { push, el: $parentElement3 };
            });
            callComponent($cd2, $context3, Route_default, el9, { slots: slots2, props: { path: `/about/book/:slug` } });
          }
          {
            let slots2 = {};
            slots2.default = makeSlot($cd2, ($cd3, $context4, $instance_Route2) => {
              let $parentElement3 = $$htmlToFragmentClean(`<>`);
              let el10 = $parentElement3[firstChild];
              callComponent($cd3, $context4, E404_default, el10, {});
              return $parentElement3;
            });
            callComponent($cd2, $context3, Route_default, el11, { slots: slots2, props: { fallback: true } });
          }
          return $parentElement2;
        });
        callComponent($cd, $context2, Route_default, el12, { slots });
      }
      return $parentElement;
    }
  }, $base);

  // src/App.xht
  var App_default = makeComponent(($option) => {
    const $component = current_component;
    const $context2 = $context;
    {
      let $cd = $component.$cd;
      const $parentElement = $$htmlToFragmentClean(`<>`);
      let el0 = $parentElement[firstChild];
      callComponent($cd, $context2, Router_default, el0, {});
      return $parentElement;
    }
  }, $readOnlyBase);

  // src/main.js
  App_default(document.body);
})();
