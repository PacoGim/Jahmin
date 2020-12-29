
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_custom_element_data(node, prop, value) {
        if (prop in node) {
            node[prop] = value;
        }
        else {
            attr(node, prop, value);
        }
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/includes/Navigation.svelte generated by Svelte v3.31.0 */

    const file = "src/includes/Navigation.svelte";

    function create_fragment(ctx) {
    	let navigation_svlt;
    	let h1;

    	const block = {
    		c: function create() {
    			navigation_svlt = element("navigation-svlt");
    			h1 = element("h1");
    			h1.textContent = "N";
    			add_location(h1, file, 1, 1, 19);
    			set_custom_element_data(navigation_svlt, "class", "svelte-1yehk8b");
    			add_location(navigation_svlt, file, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, navigation_svlt, anchor);
    			append_dev(navigation_svlt, h1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(navigation_svlt);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Navigation", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navigation> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Navigation extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navigation",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    let versioning = writable(Date.now());
    let albums = writable([]);
    // 'Genre', 'AlbumArtist', 'Album'
    let valuesToGroup = writable([]);
    // Value choosen by the user to filter out the specified tag from the song index.
    let valuesToFilter = writable([]);
    let isValuesToFilterChanged = writable(false);
    let storeConfig = writable(undefined);
    let songList = writable(undefined);

    const { ipcRenderer } = require('electron');
    function getOrder(index) {
        return new Promise((resolve, reject) => {
            ipcRenderer.invoke('get-order', index).then((result) => {
                //TODO Gets called too many times
                resolve(result);
            });
        });
    }
    function getConfig() {
        return new Promise((resolve, reject) => {
            ipcRenderer.invoke('get-config').then((result) => {
                resolve(result);
            });
        });
    }
    function saveConfig(newConfig) {
        return new Promise((resolve, reject) => {
            ipcRenderer.invoke('save-config', newConfig).then((result) => {
                resolve(result);
            });
        });
    }
    function getAlbums() {
        return new Promise((resolve, reject) => {
            ipcRenderer.invoke('get-albums').then((result) => {
                albums.set(result);
                resolve();
                // When the results arrive, recursive call to wait for the eventual new filtering.
                getAlbums();
            });
        });
    }
    function getCover(rootDir) {
        return new Promise((resolve, reject) => {
            ipcRenderer.invoke('get-cover', rootDir).then((result) => {
                resolve(result);
            });
        });
    }
    function getAlbumSong(albumName) {
        return new Promise((resolve, reject) => {
            ipcRenderer.invoke('get-album-song', albumName).then((result) => {
                resolve(result);
            });
        });
    }

    /* src/components/Album.svelte generated by Svelte v3.31.0 */
    const file$1 = "src/components/Album.svelte";

    // (49:1) {#if coverType === undefined}
    function create_if_block_4(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = "./img/audio.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "loader svelte-7ts4lc");
    			attr_dev(img, "alt", "");
    			add_location(img, file$1, 48, 30, 1390);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(49:1) {#if coverType === undefined}",
    		ctx
    	});

    	return block;
    }

    // (50:1) {#if coverType === 'not found'}
    function create_if_block_3(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = "./img/compact-disc.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "notFound svelte-7ts4lc");
    			attr_dev(img, "alt", "");
    			add_location(img, file$1, 49, 32, 1479);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(50:1) {#if coverType === 'not found'}",
    		ctx
    	});

    	return block;
    }

    // (51:1) {#if coverType === 'image'}
    function create_if_block_2(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = /*coverSrc*/ ctx[2])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*album*/ ctx[0]["Album"]);
    			attr_dev(img, "class", "svelte-7ts4lc");
    			add_location(img, file$1, 50, 28, 1573);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*coverSrc*/ 4 && img.src !== (img_src_value = /*coverSrc*/ ctx[2])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*album*/ 1 && img_alt_value !== (img_alt_value = /*album*/ ctx[0]["Album"])) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(51:1) {#if coverType === 'image'}",
    		ctx
    	});

    	return block;
    }

    // (52:1) {#if coverType === 'video'}
    function create_if_block_1(ctx) {
    	let video;
    	let track;
    	let source;
    	let source_src_value;

    	const block = {
    		c: function create() {
    			video = element("video");
    			track = element("track");
    			source = element("source");
    			attr_dev(track, "kind", "captions");
    			add_location(track, file$1, 53, 3, 1678);
    			if (source.src !== (source_src_value = /*coverSrc*/ ctx[2])) attr_dev(source, "src", source_src_value);
    			add_location(source, file$1, 54, 3, 1707);
    			video.autoplay = true;
    			video.loop = true;
    			attr_dev(video, "class", "svelte-7ts4lc");
    			add_location(video, file$1, 52, 2, 1653);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, video, anchor);
    			append_dev(video, track);
    			append_dev(video, source);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*coverSrc*/ 4 && source.src !== (source_src_value = /*coverSrc*/ ctx[2])) {
    				attr_dev(source, "src", source_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(video);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(52:1) {#if coverType === 'video'}",
    		ctx
    	});

    	return block;
    }

    // (62:1) {:else}
    function create_else_block(ctx) {
    	let album_artist;
    	let t_value = /*album*/ ctx[0]["DynamicAlbumArtist"] + "";
    	let t;

    	const block = {
    		c: function create() {
    			album_artist = element("album-artist");
    			t = text(t_value);
    			set_custom_element_data(album_artist, "class", "svelte-7ts4lc");
    			add_location(album_artist, file$1, 62, 2, 1902);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, album_artist, anchor);
    			append_dev(album_artist, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*album*/ 1 && t_value !== (t_value = /*album*/ ctx[0]["DynamicAlbumArtist"] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(album_artist);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(62:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (60:1) {#if album['AlbumArtist'] === undefined}
    function create_if_block(ctx) {
    	let album_artist;
    	let t_value = /*album*/ ctx[0]["AlbumArtist"] + "";
    	let t;

    	const block = {
    		c: function create() {
    			album_artist = element("album-artist");
    			t = text(t_value);
    			set_custom_element_data(album_artist, "class", "svelte-7ts4lc");
    			add_location(album_artist, file$1, 60, 2, 1839);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, album_artist, anchor);
    			append_dev(album_artist, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*album*/ 1 && t_value !== (t_value = /*album*/ ctx[0]["AlbumArtist"] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(album_artist);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(60:1) {#if album['AlbumArtist'] === undefined}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let album_1;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let album_name;
    	let t4_value = /*album*/ ctx[0]["Album"] + "";
    	let t4;
    	let t5;
    	let mounted;
    	let dispose;
    	let if_block0 = /*coverType*/ ctx[1] === undefined && create_if_block_4(ctx);
    	let if_block1 = /*coverType*/ ctx[1] === "not found" && create_if_block_3(ctx);
    	let if_block2 = /*coverType*/ ctx[1] === "image" && create_if_block_2(ctx);
    	let if_block3 = /*coverType*/ ctx[1] === "video" && create_if_block_1(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*album*/ ctx[0]["AlbumArtist"] === undefined) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block4 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			album_1 = element("album");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			t3 = space();
    			album_name = element("album-name");
    			t4 = text(t4_value);
    			t5 = space();
    			if_block4.c();
    			set_custom_element_data(album_name, "class", "svelte-7ts4lc");
    			add_location(album_name, file$1, 57, 1, 1752);
    			attr_dev(album_1, "class", "svelte-7ts4lc");
    			add_location(album_1, file$1, 47, 0, 1300);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, album_1, anchor);
    			if (if_block0) if_block0.m(album_1, null);
    			append_dev(album_1, t0);
    			if (if_block1) if_block1.m(album_1, null);
    			append_dev(album_1, t1);
    			if (if_block2) if_block2.m(album_1, null);
    			append_dev(album_1, t2);
    			if (if_block3) if_block3.m(album_1, null);
    			append_dev(album_1, t3);
    			append_dev(album_1, album_name);
    			append_dev(album_name, t4);
    			append_dev(album_1, t5);
    			if_block4.m(album_1, null);

    			if (!mounted) {
    				dispose = listen_dev(album_1, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*coverType*/ ctx[1] === undefined) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					if_block0.m(album_1, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*coverType*/ ctx[1] === "not found") {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_3(ctx);
    					if_block1.c();
    					if_block1.m(album_1, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*coverType*/ ctx[1] === "image") {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_2(ctx);
    					if_block2.c();
    					if_block2.m(album_1, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*coverType*/ ctx[1] === "video") {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_1(ctx);
    					if_block3.c();
    					if_block3.m(album_1, t3);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (dirty & /*album*/ 1 && t4_value !== (t4_value = /*album*/ ctx[0]["Album"] + "")) set_data_dev(t4, t4_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block4) {
    				if_block4.p(ctx, dirty);
    			} else {
    				if_block4.d(1);
    				if_block4 = current_block_type(ctx);

    				if (if_block4) {
    					if_block4.c();
    					if_block4.m(album_1, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(album_1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if_block4.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $songList;
    	validate_store(songList, "songList");
    	component_subscribe($$self, songList, $$value => $$invalidate(6, $songList = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Album", slots, []);
    	let { album } = $$props;
    	let { index } = $$props;
    	let coverType = undefined;
    	let coverSrc = undefined; /* Image Source URL */

    	// var observer =body > main > art-grid-svlt > album:nth-child(32) > img
    	// body > main > art-grid-svlt > album:nth-child(1)
    	// observer.observe(document.querySelector('#main-container'))
    	onMount(() => {
    		addIntersectionObserver();
    	});

    	function fetchAlbumCover() {
    		getCover(album["RootDir"]).then(result => {
    			if (result !== null) {
    				$$invalidate(2, coverSrc = result["filePath"]);
    				$$invalidate(1, coverType = result["fileType"]);
    			} else {
    				$$invalidate(1, coverType = "not found");
    			}
    		});
    	}

    	function addIntersectionObserver() {
    		new IntersectionObserver(entries => {
    				if (entries[0].isIntersecting === true && coverSrc === undefined) {
    					fetchAlbumCover();
    				}
    			},
    		{
    				root: document.querySelector(`art-grid-svlt`),
    				threshold: 0,
    				rootMargin: "0px 0px 50% 0px"
    			}).observe(document.querySelector(`art-grid-svlt > album:nth-child(${index + 1})`));
    	}

    	async function fetchAlbumSongList(albumName) {
    		let songs = await getAlbumSong(albumName);
    		songs = songs.sort((a, b) => a["Track"] - b["Track"]);
    		set_store_value(songList, $songList = songs, $songList);
    	}

    	const writable_props = ["album", "index"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Album> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => fetchAlbumSongList(album["Album"]);

    	$$self.$$set = $$props => {
    		if ("album" in $$props) $$invalidate(0, album = $$props.album);
    		if ("index" in $$props) $$invalidate(4, index = $$props.index);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		getAlbumSong,
    		getCover,
    		songList,
    		album,
    		index,
    		coverType,
    		coverSrc,
    		fetchAlbumCover,
    		addIntersectionObserver,
    		fetchAlbumSongList,
    		$songList
    	});

    	$$self.$inject_state = $$props => {
    		if ("album" in $$props) $$invalidate(0, album = $$props.album);
    		if ("index" in $$props) $$invalidate(4, index = $$props.index);
    		if ("coverType" in $$props) $$invalidate(1, coverType = $$props.coverType);
    		if ("coverSrc" in $$props) $$invalidate(2, coverSrc = $$props.coverSrc);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [album, coverType, coverSrc, fetchAlbumSongList, index, click_handler];
    }

    class Album extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { album: 0, index: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Album",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*album*/ ctx[0] === undefined && !("album" in props)) {
    			console.warn("<Album> was created without expected prop 'album'");
    		}

    		if (/*index*/ ctx[4] === undefined && !("index" in props)) {
    			console.warn("<Album> was created without expected prop 'index'");
    		}
    	}

    	get album() {
    		throw new Error("<Album>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set album(value) {
    		throw new Error("<Album>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<Album>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Album>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/includes/ArtGrid.svelte generated by Svelte v3.31.0 */

    const file$2 = "src/includes/ArtGrid.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (32:1) {#each $albums as album, index (album['ID'])}
    function create_each_block(key_1, ctx) {
    	let first;
    	let album;
    	let current;

    	album = new Album({
    			props: {
    				album: /*album*/ ctx[2],
    				index: /*index*/ ctx[4]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(album.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(album, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const album_changes = {};
    			if (dirty & /*$albums*/ 1) album_changes.album = /*album*/ ctx[2];
    			if (dirty & /*$albums*/ 1) album_changes.index = /*index*/ ctx[4];
    			album.$set(album_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(album.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(album.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(album, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(32:1) {#each $albums as album, index (album['ID'])}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let art_grid_svlt;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*$albums*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*album*/ ctx[2]["ID"];
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			art_grid_svlt = element("art-grid-svlt");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			set_custom_element_data(art_grid_svlt, "class", "svelte-110tshu");
    			add_location(art_grid_svlt, file$2, 30, 0, 763);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, art_grid_svlt, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(art_grid_svlt, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$albums*/ 1) {
    				const each_value = /*$albums*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, art_grid_svlt, outro_and_destroy_block, create_each_block, null, get_each_context);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(art_grid_svlt);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $storeConfig;
    	let $albums;
    	validate_store(storeConfig, "storeConfig");
    	component_subscribe($$self, storeConfig, $$value => $$invalidate(1, $storeConfig = $$value));
    	validate_store(albums, "albums");
    	component_subscribe($$self, albums, $$value => $$invalidate(0, $albums = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ArtGrid", slots, []);

    	onMount(() => {
    		// Calls the IPC once to wait for the filtering to be done.
    		getAlbums();

    		// Whenever a filter is selected resest the scroll to top.
    		isValuesToFilterChanged.subscribe(() => {
    			document.querySelector("art-grid-svlt").scrollTop = 0;
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ArtGrid> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		Album,
    		getAlbums,
    		albums,
    		isValuesToFilterChanged,
    		storeConfig,
    		$storeConfig,
    		$albums
    	});

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$storeConfig*/ 2) {
    			 if ($storeConfig !== undefined) {
    				let dimension;

    				try {
    					dimension = $storeConfig["art"]["dimension"];
    				} catch(error) {
    					dimension = 128;
    				} finally {
    					document.documentElement.style.setProperty("--cover-dimension", `${dimension}px`);
    				}
    			}
    		}
    	};

    	return [$albums, $storeConfig];
    }

    class ArtGrid extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ArtGrid",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    function cutWord(word, maxLength) {
        try {
            if (word.length >= maxLength) {
                return word.substr(0, maxLength - 1) + '...';
            }
            else {
                return word;
            }
        }
        catch (error) {
            return word;
        }
    }

    /* src/components/Order.svelte generated by Svelte v3.31.0 */

    const { console: console_1 } = globals;

    const file$3 = "src/components/Order.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	child_ctx[3] = i;
    	return child_ctx;
    }

    // (59:0) {#if orderedSongs}
    function create_if_block$1(ctx) {
    	let order;
    	let item;
    	let input;
    	let input_id_value;
    	let input_value_value;
    	let t0;
    	let label;
    	let t1;
    	let t2;
    	let t3_value = /*orderedSongs*/ ctx[2].length + "";
    	let t3;
    	let t4;
    	let label_for_value;
    	let item_title_value;
    	let t5;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let mounted;
    	let dispose;
    	let each_value = /*orderedSongs*/ ctx[2];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*item*/ ctx[17]["id"];
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			order = element("order");
    			item = element("item");
    			input = element("input");
    			t0 = space();
    			label = element("label");
    			t1 = text(/*group*/ ctx[0]);
    			t2 = text(" (");
    			t3 = text(t3_value);
    			t4 = text(")");
    			t5 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(input, "type", "radio");
    			attr_dev(input, "id", input_id_value = "all" + /*group*/ ctx[0]);
    			input.__value = input_value_value = null;
    			input.value = input.__value;
    			attr_dev(input, "class", "svelte-dupdmc");
    			/*$$binding_groups*/ ctx[8][0].push(input);
    			add_location(input, file$3, 61, 3, 2107);
    			attr_dev(label, "for", label_for_value = "all" + /*group*/ ctx[0]);
    			attr_dev(label, "class", "svelte-dupdmc");
    			add_location(label, file$3, 62, 3, 2185);
    			attr_dev(item, "title", item_title_value = "All " + /*group*/ ctx[0]);
    			add_location(item, file$3, 60, 2, 2077);
    			attr_dev(order, "class", "svelte-dupdmc");
    			add_location(order, file$3, 59, 1, 2067);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, order, anchor);
    			append_dev(order, item);
    			append_dev(item, input);
    			input.checked = input.__value === /*selection*/ ctx[1];
    			append_dev(item, t0);
    			append_dev(item, label);
    			append_dev(label, t1);
    			append_dev(label, t2);
    			append_dev(label, t3);
    			append_dev(label, t4);
    			append_dev(order, t5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(order, null);
    			}

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[7]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*group*/ 1 && input_id_value !== (input_id_value = "all" + /*group*/ ctx[0])) {
    				attr_dev(input, "id", input_id_value);
    			}

    			if (dirty & /*selection*/ 2) {
    				input.checked = input.__value === /*selection*/ ctx[1];
    			}

    			if (dirty & /*group*/ 1) set_data_dev(t1, /*group*/ ctx[0]);
    			if (dirty & /*orderedSongs*/ 4 && t3_value !== (t3_value = /*orderedSongs*/ ctx[2].length + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*group*/ 1 && label_for_value !== (label_for_value = "all" + /*group*/ ctx[0])) {
    				attr_dev(label, "for", label_for_value);
    			}

    			if (dirty & /*group*/ 1 && item_title_value !== (item_title_value = "All " + /*group*/ ctx[0])) {
    				attr_dev(item, "title", item_title_value);
    			}

    			if (dirty & /*orderedSongs, cutWord, selection*/ 6) {
    				const each_value = /*orderedSongs*/ ctx[2];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, order, destroy_block, create_each_block$1, null, get_each_context$1);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(order);
    			/*$$binding_groups*/ ctx[8][0].splice(/*$$binding_groups*/ ctx[8][0].indexOf(input), 1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(59:0) {#if orderedSongs}",
    		ctx
    	});

    	return block;
    }

    // (65:2) {#each orderedSongs as item, index (item['id'])}
    function create_each_block$1(key_1, ctx) {
    	let item;
    	let input;
    	let input_id_value;
    	let input_value_value;
    	let t0;
    	let label;
    	let t1_value = cutWord(/*item*/ ctx[17]["value"], 20) + "";
    	let t1;
    	let label_for_value;
    	let t2;
    	let item_title_value;
    	let mounted;
    	let dispose;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			item = element("item");
    			input = element("input");
    			t0 = space();
    			label = element("label");
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(input, "type", "radio");
    			attr_dev(input, "id", input_id_value = /*item*/ ctx[17]["id"]);
    			input.__value = input_value_value = /*item*/ ctx[17]["value"];
    			input.value = input.__value;
    			attr_dev(input, "class", "svelte-dupdmc");
    			/*$$binding_groups*/ ctx[8][0].push(input);
    			add_location(input, file$3, 66, 4, 2348);
    			attr_dev(label, "for", label_for_value = /*item*/ ctx[17]["id"]);
    			attr_dev(label, "class", "svelte-dupdmc");
    			add_location(label, file$3, 67, 4, 2436);
    			attr_dev(item, "title", item_title_value = /*item*/ ctx[17]["value"]);
    			add_location(item, file$3, 65, 3, 2315);
    			this.first = item;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, item, anchor);
    			append_dev(item, input);
    			input.checked = input.__value === /*selection*/ ctx[1];
    			append_dev(item, t0);
    			append_dev(item, label);
    			append_dev(label, t1);
    			append_dev(item, t2);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler_1*/ ctx[9]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*orderedSongs*/ 4 && input_id_value !== (input_id_value = /*item*/ ctx[17]["id"])) {
    				attr_dev(input, "id", input_id_value);
    			}

    			if (dirty & /*orderedSongs*/ 4 && input_value_value !== (input_value_value = /*item*/ ctx[17]["value"])) {
    				prop_dev(input, "__value", input_value_value);
    				input.value = input.__value;
    			}

    			if (dirty & /*selection*/ 2) {
    				input.checked = input.__value === /*selection*/ ctx[1];
    			}

    			if (dirty & /*orderedSongs*/ 4 && t1_value !== (t1_value = cutWord(/*item*/ ctx[17]["value"], 20) + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*orderedSongs*/ 4 && label_for_value !== (label_for_value = /*item*/ ctx[17]["id"])) {
    				attr_dev(label, "for", label_for_value);
    			}

    			if (dirty & /*orderedSongs*/ 4 && item_title_value !== (item_title_value = /*item*/ ctx[17]["value"])) {
    				attr_dev(item, "title", item_title_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(item);
    			/*$$binding_groups*/ ctx[8][0].splice(/*$$binding_groups*/ ctx[8][0].indexOf(input), 1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(65:2) {#each orderedSongs as item, index (item['id'])}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let if_block_anchor;
    	let if_block = /*orderedSongs*/ ctx[2] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*orderedSongs*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $storeConfig;
    	let $valuesToGroup;
    	let $valuesToFilter;
    	let $isValuesToFilterChanged;
    	let $versioning;
    	validate_store(storeConfig, "storeConfig");
    	component_subscribe($$self, storeConfig, $$value => $$invalidate(5, $storeConfig = $$value));
    	validate_store(valuesToGroup, "valuesToGroup");
    	component_subscribe($$self, valuesToGroup, $$value => $$invalidate(10, $valuesToGroup = $$value));
    	validate_store(valuesToFilter, "valuesToFilter");
    	component_subscribe($$self, valuesToFilter, $$value => $$invalidate(11, $valuesToFilter = $$value));
    	validate_store(isValuesToFilterChanged, "isValuesToFilterChanged");
    	component_subscribe($$self, isValuesToFilterChanged, $$value => $$invalidate(12, $isValuesToFilterChanged = $$value));
    	validate_store(versioning, "versioning");
    	component_subscribe($$self, versioning, $$value => $$invalidate(6, $versioning = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Order", slots, []);

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	let { index } = $$props;
    	let { group } = $$props;
    	let orderedSongs = [];
    	let selection = null;
    	let isSelectionChanged = false;

    	function cleanFilters() {
    		for (let i = index; i < $valuesToGroup.length; i++) {
    			if (i === index) {
    				set_store_value(valuesToFilter, $valuesToFilter[i] = selection, $valuesToFilter);
    			} else {
    				set_store_value(valuesToFilter, $valuesToFilter[i] = null, $valuesToFilter);
    			}
    		}

    		console.log($valuesToFilter);
    		set_store_value(isValuesToFilterChanged, $isValuesToFilterChanged = true, $isValuesToFilterChanged);
    	}

    	function setSelectionFromConfigStore() {
    		$$invalidate(1, selection = $storeConfig["order"]["filtering"][index]);
    		set_store_value(valuesToFilter, $valuesToFilter[index] = selection, $valuesToFilter);
    	}

    	function fetchSongs() {
    		return __awaiter(this, void 0, void 0, function* () {
    			$$invalidate(2, orderedSongs = yield getOrder(index));
    		});
    	}

    	const writable_props = ["index", "group"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Order> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[]];

    	function input_change_handler() {
    		selection = this.__value;
    		$$invalidate(1, selection);
    	}

    	function input_change_handler_1() {
    		selection = this.__value;
    		$$invalidate(1, selection);
    	}

    	$$self.$$set = $$props => {
    		if ("index" in $$props) $$invalidate(3, index = $$props.index);
    		if ("group" in $$props) $$invalidate(0, group = $$props.group);
    	};

    	$$self.$capture_state = () => ({
    		__awaiter,
    		onMount,
    		cutWord,
    		getOrder,
    		versioning,
    		valuesToFilter,
    		valuesToGroup,
    		isValuesToFilterChanged,
    		storeConfig,
    		index,
    		group,
    		orderedSongs,
    		selection,
    		isSelectionChanged,
    		cleanFilters,
    		setSelectionFromConfigStore,
    		fetchSongs,
    		$storeConfig,
    		$valuesToGroup,
    		$valuesToFilter,
    		$isValuesToFilterChanged,
    		$versioning
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("index" in $$props) $$invalidate(3, index = $$props.index);
    		if ("group" in $$props) $$invalidate(0, group = $$props.group);
    		if ("orderedSongs" in $$props) $$invalidate(2, orderedSongs = $$props.orderedSongs);
    		if ("selection" in $$props) $$invalidate(1, selection = $$props.selection);
    		if ("isSelectionChanged" in $$props) $$invalidate(4, isSelectionChanged = $$props.isSelectionChanged);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$storeConfig*/ 32) {
    			 if ($storeConfig !== undefined) {
    				setSelectionFromConfigStore();
    			}
    		}

    		if ($$self.$$.dirty & /*selection, isSelectionChanged*/ 18) {
    			 {

    				if (isSelectionChanged) {
    					cleanFilters();
    				} else {
    					$$invalidate(4, isSelectionChanged = true);
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*$versioning*/ 64) {
    			// Only if the versioning is changed (when a filter/group is changed (Controller)), fetch songs.
    			 {
    				console.log($versioning, " Fetching songs");
    				fetchSongs();
    			}
    		}
    	};

    	return [
    		group,
    		selection,
    		orderedSongs,
    		index,
    		isSelectionChanged,
    		$storeConfig,
    		$versioning,
    		input_change_handler,
    		$$binding_groups,
    		input_change_handler_1
    	];
    }

    class Order extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { index: 3, group: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Order",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*index*/ ctx[3] === undefined && !("index" in props)) {
    			console_1.warn("<Order> was created without expected prop 'index'");
    		}

    		if (/*group*/ ctx[0] === undefined && !("group" in props)) {
    			console_1.warn("<Order> was created without expected prop 'group'");
    		}
    	}

    	get index() {
    		throw new Error("<Order>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Order>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get group() {
    		throw new Error("<Order>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set group(value) {
    		throw new Error("<Order>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/includes/Ordering.svelte generated by Svelte v3.31.0 */
    const file$4 = "src/includes/Ordering.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	child_ctx[3] = i;
    	return child_ctx;
    }

    // (9:1) {#each $valuesToGroup as group, index (index)}
    function create_each_block$2(key_1, ctx) {
    	let first;
    	let order;
    	let current;

    	order = new Order({
    			props: {
    				index: /*index*/ ctx[3],
    				group: /*group*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(order.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(order, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const order_changes = {};
    			if (dirty & /*$valuesToGroup*/ 1) order_changes.index = /*index*/ ctx[3];
    			if (dirty & /*$valuesToGroup*/ 1) order_changes.group = /*group*/ ctx[1];
    			order.$set(order_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(order.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(order.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(order, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(9:1) {#each $valuesToGroup as group, index (index)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let grouping_svlt;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*$valuesToGroup*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*index*/ ctx[3];
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			grouping_svlt = element("grouping-svlt");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			set_custom_element_data(grouping_svlt, "class", "svelte-1kmhdcs");
    			add_location(grouping_svlt, file$4, 7, 0, 124);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, grouping_svlt, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(grouping_svlt, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$valuesToGroup*/ 1) {
    				const each_value = /*$valuesToGroup*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, grouping_svlt, outro_and_destroy_block, create_each_block$2, null, get_each_context$2);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(grouping_svlt);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $valuesToGroup;
    	validate_store(valuesToGroup, "valuesToGroup");
    	component_subscribe($$self, valuesToGroup, $$value => $$invalidate(0, $valuesToGroup = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Ordering", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Ordering> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Order, valuesToGroup, $valuesToGroup });
    	return [$valuesToGroup];
    }

    class Ordering extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Ordering",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function get_interpolator(a, b) {
        if (a === b || a !== a)
            return () => a;
        const type = typeof a;
        if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
            throw new Error('Cannot interpolate values of different type');
        }
        if (Array.isArray(a)) {
            const arr = b.map((bi, i) => {
                return get_interpolator(a[i], bi);
            });
            return t => arr.map(fn => fn(t));
        }
        if (type === 'object') {
            if (!a || !b)
                throw new Error('Object cannot be null');
            if (is_date(a) && is_date(b)) {
                a = a.getTime();
                b = b.getTime();
                const delta = b - a;
                return t => new Date(a + t * delta);
            }
            const keys = Object.keys(b);
            const interpolators = {};
            keys.forEach(key => {
                interpolators[key] = get_interpolator(a[key], b[key]);
            });
            return t => {
                const result = {};
                keys.forEach(key => {
                    result[key] = interpolators[key](t);
                });
                return result;
            };
        }
        if (type === 'number') {
            const delta = b - a;
            return t => a + t * delta;
        }
        throw new Error(`Cannot interpolate ${type} values`);
    }
    function tweened(value, defaults = {}) {
        const store = writable(value);
        let task;
        let target_value = value;
        function set(new_value, opts) {
            if (value == null) {
                store.set(value = new_value);
                return Promise.resolve();
            }
            target_value = new_value;
            let previous_task = task;
            let started = false;
            let { delay = 0, duration = 400, easing = identity, interpolate = get_interpolator } = assign(assign({}, defaults), opts);
            if (duration === 0) {
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                store.set(value = target_value);
                return Promise.resolve();
            }
            const start = now() + delay;
            let fn;
            task = loop(now => {
                if (now < start)
                    return true;
                if (!started) {
                    fn = interpolate(value, new_value);
                    if (typeof duration === 'function')
                        duration = duration(value, new_value);
                    started = true;
                }
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                const elapsed = now - start;
                if (elapsed > duration) {
                    store.set(value = new_value);
                    return false;
                }
                // @ts-ignore
                store.set(value = fn(easing(elapsed / duration)));
                return true;
            });
            return task.promise;
        }
        return {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe
        };
    }

    let songIndex = writable(null);

    /* src/includes/Player.svelte generated by Svelte v3.31.0 */

    const { console: console_1$1 } = globals;
    const file$5 = "src/includes/Player.svelte";

    function create_fragment$5(ctx) {
    	let player_svlt;
    	let audio;
    	let track;
    	let audio_controls_value;
    	let t0;
    	let input0;
    	let t1;
    	let span;
    	let t2_value = Math.floor(/*volume*/ ctx[0] * 100) + "";
    	let t2;
    	let t3;
    	let player_progress;
    	let input1;
    	let t4;
    	let progress_background;
    	let t5;
    	let progress_foreground;
    	let t6_value = Math.round(/*progress*/ ctx[2]) + "";
    	let t6;
    	let t7;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			player_svlt = element("player-svlt");
    			audio = element("audio");
    			track = element("track");
    			t0 = space();
    			input0 = element("input");
    			t1 = space();
    			span = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			player_progress = element("player-progress");
    			input1 = element("input");
    			t4 = space();
    			progress_background = element("progress-background");
    			t5 = space();
    			progress_foreground = element("progress-foreground");
    			t6 = text(t6_value);
    			t7 = text("%");
    			attr_dev(track, "kind", "captions");
    			add_location(track, file$5, 85, 2, 2463);
    			audio.controls = audio_controls_value = true;
    			add_location(audio, file$5, 79, 1, 2290);
    			attr_dev(input0, "type", "range");
    			attr_dev(input0, "min", "0");
    			attr_dev(input0, "max", "1");
    			attr_dev(input0, "step", "0.01");
    			add_location(input0, file$5, 87, 1, 2500);
    			add_location(span, file$5, 88, 1, 2572);
    			attr_dev(input1, "id", "inputProgress");
    			attr_dev(input1, "type", "range");
    			attr_dev(input1, "min", "0");
    			attr_dev(input1, "max", "100");
    			attr_dev(input1, "step", "0.1");
    			attr_dev(input1, "class", "svelte-1xeihws");
    			add_location(input1, file$5, 91, 2, 2658);
    			set_custom_element_data(progress_background, "class", "svelte-1xeihws");
    			add_location(progress_background, file$5, 99, 2, 2802);
    			set_custom_element_data(progress_foreground, "class", "svelte-1xeihws");
    			add_location(progress_foreground, file$5, 100, 2, 2828);
    			set_custom_element_data(player_progress, "class", "svelte-1xeihws");
    			add_location(player_progress, file$5, 90, 1, 2638);
    			set_custom_element_data(player_svlt, "class", "svelte-1xeihws");
    			add_location(player_svlt, file$5, 77, 0, 2249);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, player_svlt, anchor);
    			append_dev(player_svlt, audio);
    			append_dev(audio, track);
    			append_dev(player_svlt, t0);
    			append_dev(player_svlt, input0);
    			set_input_value(input0, /*volume*/ ctx[0]);
    			append_dev(player_svlt, t1);
    			append_dev(player_svlt, span);
    			append_dev(span, t2);
    			append_dev(player_svlt, t3);
    			append_dev(player_svlt, player_progress);
    			append_dev(player_progress, input1);
    			append_dev(player_progress, t4);
    			append_dev(player_progress, progress_background);
    			append_dev(player_progress, t5);
    			append_dev(player_progress, progress_foreground);
    			append_dev(progress_foreground, t6);
    			append_dev(progress_foreground, t7);

    			if (!mounted) {
    				dispose = [
    					listen_dev(audio, "play", /*play_handler*/ ctx[8], false, false, false),
    					listen_dev(audio, "pause", /*pause_handler*/ ctx[9], false, false, false),
    					listen_dev(audio, "ended", /*ended_handler*/ ctx[10], false, false, false),
    					listen_dev(audio, "volumechange", /*volumechange_handler*/ ctx[11], false, false, false),
    					listen_dev(input0, "change", /*input0_change_input_handler*/ ctx[12]),
    					listen_dev(input0, "input", /*input0_change_input_handler*/ ctx[12]),
    					listen_dev(input1, "mousedown", /*mousedown_handler*/ ctx[13], false, false, false),
    					listen_dev(input1, "input", /*input_handler*/ ctx[14], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*volume*/ 1) {
    				set_input_value(input0, /*volume*/ ctx[0]);
    			}

    			if (dirty & /*volume*/ 1 && t2_value !== (t2_value = Math.floor(/*volume*/ ctx[0] * 100) + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*progress*/ 4 && t6_value !== (t6_value = Math.round(/*progress*/ ctx[2]) + "")) set_data_dev(t6, t6_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(player_svlt);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function selectSong() {
    	
    }

    // function updateProgress() {
    // 	progress = (100 / currentSong['Duration']) * player.currentTime
    // 	document.documentElement.style.setProperty('--song-time', `${progress}%`)
    // }
    function updatePlayerDuration(evt) {
    	
    } // console.log(document.querySelector('#foo').value)

    function instance$5($$self, $$props, $$invalidate) {
    	let $songIndex;
    	let $songList;
    	validate_store(songIndex, "songIndex");
    	component_subscribe($$self, songIndex, $$value => $$invalidate(1, $songIndex = $$value));
    	validate_store(songList, "songList");
    	component_subscribe($$self, songList, $$value => $$invalidate(18, $songList = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Player", slots, []);
    	
    	let volume = 0;
    	let progress = 0;
    	let currentSong = undefined;
    	let player = undefined;

    	function playSong(index) {
    		if (index === null) return false;

    		if ($songList === undefined) {
    			return setTimeout(
    				() => {
    					playSong(index);
    				},
    				1000
    			);
    		}

    		currentSong = $songList[index];
    		$$invalidate(7, player.src = currentSong["SourceFile"], player);
    		player.play();
    	}

    	onMount(() => {
    		$$invalidate(7, player = document.querySelector("audio"));
    		$$invalidate(0, volume = Number(localStorage.getItem("volume")));

    		if (isNaN(volume) || volume > 1) {
    			$$invalidate(0, volume = 1);
    			localStorage.setItem("volume", String(volume));
    		}
    	}); // player.volume = volume

    	function saveVolumeChange() {
    		localStorage.setItem("volume", String(player.volume));
    	}

    	let pauseDebounce;

    	function bar() {
    		player.pause();
    		let progressValue = document.querySelector("#inputProgress").value;
    		document.documentElement.style.setProperty("--song-time", `${progressValue}%`);
    		clearInterval(pauseDebounce);

    		pauseDebounce = setTimeout(
    			() => {
    				$$invalidate(7, player.currentTime = currentSong["Duration"] / (100 / progressValue), player);
    				player.play();
    			},
    			200
    		);
    	}

    	let playingInterval;

    	function startInterval() {
    		console.log("Start");
    		clearInterval(playingInterval);

    		playingInterval = setInterval(
    			() => {
    				$$invalidate(2, progress = 100 / currentSong["Duration"] * player.currentTime);
    				document.documentElement.style.setProperty("--song-time", `${progress}%`);
    			},
    			100
    		);
    	}

    	function stopInterval() {
    		console.log("Stop");
    		clearInterval(playingInterval);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Player> was created with unknown prop '${key}'`);
    	});

    	const play_handler = () => startInterval();
    	const pause_handler = () => stopInterval();
    	const ended_handler = () => set_store_value(songIndex, $songIndex++, $songIndex);
    	const volumechange_handler = () => saveVolumeChange();

    	function input0_change_input_handler() {
    		volume = to_number(this.value);
    		$$invalidate(0, volume);
    	}

    	const mousedown_handler = () => bar();
    	const input_handler = () => bar();

    	$$self.$capture_state = () => ({
    		tweened,
    		cubicOut,
    		onMount,
    		songList,
    		songIndex,
    		volume,
    		progress,
    		currentSong,
    		player,
    		playSong,
    		selectSong,
    		saveVolumeChange,
    		updatePlayerDuration,
    		pauseDebounce,
    		bar,
    		playingInterval,
    		startInterval,
    		stopInterval,
    		$songIndex,
    		$songList
    	});

    	$$self.$inject_state = $$props => {
    		if ("volume" in $$props) $$invalidate(0, volume = $$props.volume);
    		if ("progress" in $$props) $$invalidate(2, progress = $$props.progress);
    		if ("currentSong" in $$props) currentSong = $$props.currentSong;
    		if ("player" in $$props) $$invalidate(7, player = $$props.player);
    		if ("pauseDebounce" in $$props) pauseDebounce = $$props.pauseDebounce;
    		if ("playingInterval" in $$props) playingInterval = $$props.playingInterval;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$songIndex*/ 2) {
    			 {
    				playSong($songIndex);
    			}
    		}

    		if ($$self.$$.dirty & /*player, volume*/ 129) {
    			 {
    				//TODO This seems to run more than once
    				if (player) {
    					$$invalidate(7, player.volume = volume, player);
    				}
    			}
    		}
    	};

    	return [
    		volume,
    		$songIndex,
    		progress,
    		saveVolumeChange,
    		bar,
    		startInterval,
    		stopInterval,
    		player,
    		play_handler,
    		pause_handler,
    		ended_handler,
    		volumechange_handler,
    		input0_change_input_handler,
    		mousedown_handler,
    		input_handler
    	];
    }

    class Player extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Player",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/components/SongListItem.svelte generated by Svelte v3.31.0 */
    const file$6 = "src/components/SongListItem.svelte";

    function create_fragment$6(ctx) {
    	let song_list_item;
    	let song_number;
    	let t0_value = /*song*/ ctx[0]["Track"] + "";
    	let t0;
    	let t1;
    	let song_title;
    	let t2_value = /*song*/ ctx[0]["Title"] + "";
    	let t2;
    	let t3;
    	let song_duration;
    	let t4_value = parseDuration(/*song*/ ctx[0]["Duration"]) + "";
    	let t4;
    	let song_list_item_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			song_list_item = element("song-list-item");
    			song_number = element("song-number");
    			t0 = text(t0_value);
    			t1 = space();
    			song_title = element("song-title");
    			t2 = text(t2_value);
    			t3 = space();
    			song_duration = element("song-duration");
    			t4 = text(t4_value);
    			set_custom_element_data(song_number, "class", "svelte-33hcqd");
    			add_location(song_number, file$6, 19, 1, 533);
    			set_custom_element_data(song_title, "class", "svelte-33hcqd");
    			add_location(song_title, file$6, 20, 1, 577);
    			set_custom_element_data(song_duration, "class", "svelte-33hcqd");
    			add_location(song_duration, file$6, 21, 1, 619);

    			set_custom_element_data(song_list_item, "class", song_list_item_class_value = "" + (null_to_empty(/*$songIndex*/ ctx[2] === /*index*/ ctx[1]
    			? "selected"
    			: "") + " svelte-33hcqd"));

    			add_location(song_list_item, file$6, 18, 0, 427);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, song_list_item, anchor);
    			append_dev(song_list_item, song_number);
    			append_dev(song_number, t0);
    			append_dev(song_list_item, t1);
    			append_dev(song_list_item, song_title);
    			append_dev(song_title, t2);
    			append_dev(song_list_item, t3);
    			append_dev(song_list_item, song_duration);
    			append_dev(song_duration, t4);

    			if (!mounted) {
    				dispose = listen_dev(song_list_item, "dblclick", /*dblclick_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*song*/ 1 && t0_value !== (t0_value = /*song*/ ctx[0]["Track"] + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*song*/ 1 && t2_value !== (t2_value = /*song*/ ctx[0]["Title"] + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*song*/ 1 && t4_value !== (t4_value = parseDuration(/*song*/ ctx[0]["Duration"]) + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*$songIndex, index*/ 6 && song_list_item_class_value !== (song_list_item_class_value = "" + (null_to_empty(/*$songIndex*/ ctx[2] === /*index*/ ctx[1]
    			? "selected"
    			: "") + " svelte-33hcqd"))) {
    				set_custom_element_data(song_list_item, "class", song_list_item_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(song_list_item);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function parseDuration(duration) {
    	if (duration >= 60 * 60) {
    		return new Date(duration * 1000).toISOString().substr(11, 8);
    	} else {
    		return new Date(duration * 1000).toISOString().substr(14, 5);
    	}
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $songIndex;
    	validate_store(songIndex, "songIndex");
    	component_subscribe($$self, songIndex, $$value => $$invalidate(2, $songIndex = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SongListItem", slots, []);
    	
    	let { song } = $$props;
    	let { index } = $$props;

    	onMount(() => {
    		
    	}); // console.log(song)

    	const writable_props = ["song", "index"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SongListItem> was created with unknown prop '${key}'`);
    	});

    	const dblclick_handler = () => set_store_value(songIndex, $songIndex = index, $songIndex);

    	$$self.$$set = $$props => {
    		if ("song" in $$props) $$invalidate(0, song = $$props.song);
    		if ("index" in $$props) $$invalidate(1, index = $$props.index);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		songIndex,
    		song,
    		index,
    		parseDuration,
    		$songIndex
    	});

    	$$self.$inject_state = $$props => {
    		if ("song" in $$props) $$invalidate(0, song = $$props.song);
    		if ("index" in $$props) $$invalidate(1, index = $$props.index);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [song, index, $songIndex, dblclick_handler];
    }

    class SongListItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { song: 0, index: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SongListItem",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*song*/ ctx[0] === undefined && !("song" in props)) {
    			console.warn("<SongListItem> was created without expected prop 'song'");
    		}

    		if (/*index*/ ctx[1] === undefined && !("index" in props)) {
    			console.warn("<SongListItem> was created without expected prop 'index'");
    		}
    	}

    	get song() {
    		throw new Error("<SongListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set song(value) {
    		throw new Error("<SongListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<SongListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<SongListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/includes/SongList.svelte generated by Svelte v3.31.0 */
    const file$7 = "src/includes/SongList.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (11:1) {#if $songList !== undefined}
    function create_if_block$2(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = /*$songList*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*index*/ ctx[4];
    	validate_each_keys(ctx, each_value, get_each_context$3, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$3(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$songList*/ 1) {
    				const each_value = /*$songList*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$3, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$3, each_1_anchor, get_each_context$3);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(11:1) {#if $songList !== undefined}",
    		ctx
    	});

    	return block;
    }

    // (12:2) {#each $songList as song, index (index)}
    function create_each_block$3(key_1, ctx) {
    	let first;
    	let songlistitem;
    	let current;

    	songlistitem = new SongListItem({
    			props: {
    				song: /*song*/ ctx[2],
    				index: /*index*/ ctx[4]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(songlistitem.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(songlistitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const songlistitem_changes = {};
    			if (dirty & /*$songList*/ 1) songlistitem_changes.song = /*song*/ ctx[2];
    			if (dirty & /*$songList*/ 1) songlistitem_changes.index = /*index*/ ctx[4];
    			songlistitem.$set(songlistitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(songlistitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(songlistitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(songlistitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(12:2) {#each $songList as song, index (index)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let song_list_svlt;
    	let current;
    	let if_block = /*$songList*/ ctx[0] !== undefined && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			song_list_svlt = element("song-list-svlt");
    			if (if_block) if_block.c();
    			set_custom_element_data(song_list_svlt, "class", "svelte-vpbxf");
    			add_location(song_list_svlt, file$7, 9, 0, 265);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, song_list_svlt, anchor);
    			if (if_block) if_block.m(song_list_svlt, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$songList*/ ctx[0] !== undefined) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$songList*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(song_list_svlt, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(song_list_svlt);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $songIndex;
    	let $songList;
    	validate_store(songIndex, "songIndex");
    	component_subscribe($$self, songIndex, $$value => $$invalidate(1, $songIndex = $$value));
    	validate_store(songList, "songList");
    	component_subscribe($$self, songList, $$value => $$invalidate(0, $songList = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SongList", slots, []);

    	onMount(() => {
    		set_store_value(songIndex, $songIndex = 1, $songIndex);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SongList> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		SongListItem,
    		songList,
    		songIndex,
    		$songIndex,
    		$songList
    	});

    	return [$songList];
    }

    class SongList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SongList",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/includes/Details.svelte generated by Svelte v3.31.0 */

    const file$8 = "src/includes/Details.svelte";

    function create_fragment$8(ctx) {
    	let details_svlt;
    	let h1;

    	const block = {
    		c: function create() {
    			details_svlt = element("details-svlt");
    			h1 = element("h1");
    			h1.textContent = "Details";
    			add_location(h1, file$8, 1, 2, 17);
    			set_custom_element_data(details_svlt, "class", "svelte-1mnbjpt");
    			add_location(details_svlt, file$8, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, details_svlt, anchor);
    			append_dev(details_svlt, h1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(details_svlt);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Details", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Details> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Details extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Details",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/controller/Controller.svelte generated by Svelte v3.31.0 */

    const { Object: Object_1, console: console_1$2 } = globals;

    function create_fragment$9(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $valuesToFilter;
    	let $isValuesToFilterChanged;
    	let $versioning;
    	let $storeConfig;
    	let $valuesToGroup;
    	validate_store(valuesToFilter, "valuesToFilter");
    	component_subscribe($$self, valuesToFilter, $$value => $$invalidate(2, $valuesToFilter = $$value));
    	validate_store(isValuesToFilterChanged, "isValuesToFilterChanged");
    	component_subscribe($$self, isValuesToFilterChanged, $$value => $$invalidate(0, $isValuesToFilterChanged = $$value));
    	validate_store(versioning, "versioning");
    	component_subscribe($$self, versioning, $$value => $$invalidate(3, $versioning = $$value));
    	validate_store(storeConfig, "storeConfig");
    	component_subscribe($$self, storeConfig, $$value => $$invalidate(4, $storeConfig = $$value));
    	validate_store(valuesToGroup, "valuesToGroup");
    	component_subscribe($$self, valuesToGroup, $$value => $$invalidate(5, $valuesToGroup = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Controller", slots, []);

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	/*
        index.store.ts -> Watch valuesToGroup and valuesToFilter changes from Order Components (Filtering)
                                            and Config Component (Grouping)
        When values changes -> Controller detects it and saves it to main config file.
        When config file securely saved -> Change versioning number in Store.
        Order watches versioning number.
        When Versioning changes -> Order re-fetches the songs.
    */
    	let previousFilter = [...$valuesToFilter];

    	let isFirstRun = true;

    	onMount(() => {
    		loadConfig();
    	});

    	function setPreviousFilters() {
    		previousFilter = [...$valuesToFilter];
    	}

    	function updateFilters() {
    		console.log("Updating Filters");

    		// if the value changed save them to config file.
    		if (previousFilter.toString() !== $valuesToFilter.toString()) {
    			console.log("Saving Filters");
    			previousFilter = [...$valuesToFilter];

    			saveConfig({ order: { filtering: $valuesToFilter } }).then(newConfig => {
    				if (newConfig) {
    					set_store_value(versioning, $versioning = Date.now(), $versioning);
    					set_store_value(storeConfig, $storeConfig = newConfig, $storeConfig);
    				}
    			});
    		}
    	}

    	// function saveConfig() {}
    	function loadConfig() {
    		var _a;

    		return __awaiter(this, void 0, void 0, function* () {
    			let config = yield getConfig();
    			set_store_value(storeConfig, $storeConfig = Object.assign({}, config), $storeConfig);

    			if ((_a = config === null || config === void 0
    			? void 0
    			: config["order"]) === null || _a === void 0
    			? void 0
    			: _a["grouping"]) {
    				set_store_value(valuesToGroup, $valuesToGroup = config["order"]["grouping"], $valuesToGroup);
    			}
    		});
    	}

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<Controller> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		__awaiter,
    		onMount,
    		getConfig,
    		saveConfig,
    		valuesToFilter,
    		isValuesToFilterChanged,
    		valuesToGroup,
    		versioning,
    		storeConfig,
    		previousFilter,
    		isFirstRun,
    		setPreviousFilters,
    		updateFilters,
    		loadConfig,
    		$valuesToFilter,
    		$isValuesToFilterChanged,
    		$versioning,
    		$storeConfig,
    		$valuesToGroup
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("previousFilter" in $$props) previousFilter = $$props.previousFilter;
    		if ("isFirstRun" in $$props) isFirstRun = $$props.isFirstRun;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$isValuesToFilterChanged*/ 1) {
    			 {
    				// if first time running, saves the current filters to a variable to check later if it changed (in fn updateFilters).
    				if ($isValuesToFilterChanged === true) {
    					updateFilters();
    					set_store_value(isValuesToFilterChanged, $isValuesToFilterChanged = false, $isValuesToFilterChanged);
    				} else {
    					setPreviousFilters();
    				}
    			}
    		}
    	};

    	return [$isValuesToFilterChanged];
    }

    class Controller extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Controller",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/includes/BackgroundArt.svelte generated by Svelte v3.31.0 */

    const file$9 = "src/includes/BackgroundArt.svelte";

    function create_fragment$a(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = "./img/bg.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-ufzy90");
    			add_location(img, file$9, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("BackgroundArt", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BackgroundArt> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class BackgroundArt extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BackgroundArt",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.31.0 */
    const file$a = "src/App.svelte";

    function create_fragment$b(ctx) {
    	let controller;
    	let t0;
    	let main;
    	let navigation;
    	let t1;
    	let artgrid;
    	let t2;
    	let grouping;
    	let t3;
    	let player;
    	let t4;
    	let songlist;
    	let t5;
    	let details;
    	let t6;
    	let backgroundart;
    	let current;
    	controller = new Controller({ $$inline: true });
    	navigation = new Navigation({ $$inline: true });
    	artgrid = new ArtGrid({ $$inline: true });
    	grouping = new Ordering({ $$inline: true });
    	player = new Player({ $$inline: true });
    	songlist = new SongList({ $$inline: true });
    	details = new Details({ $$inline: true });
    	backgroundart = new BackgroundArt({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(controller.$$.fragment);
    			t0 = space();
    			main = element("main");
    			create_component(navigation.$$.fragment);
    			t1 = space();
    			create_component(artgrid.$$.fragment);
    			t2 = space();
    			create_component(grouping.$$.fragment);
    			t3 = space();
    			create_component(player.$$.fragment);
    			t4 = space();
    			create_component(songlist.$$.fragment);
    			t5 = space();
    			create_component(details.$$.fragment);
    			t6 = space();
    			create_component(backgroundart.$$.fragment);
    			attr_dev(main, "class", "svelte-1f9zqy5");
    			add_location(main, file$a, 12, 0, 465);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(controller, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(navigation, main, null);
    			append_dev(main, t1);
    			mount_component(artgrid, main, null);
    			append_dev(main, t2);
    			mount_component(grouping, main, null);
    			append_dev(main, t3);
    			mount_component(player, main, null);
    			append_dev(main, t4);
    			mount_component(songlist, main, null);
    			append_dev(main, t5);
    			mount_component(details, main, null);
    			append_dev(main, t6);
    			mount_component(backgroundart, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(controller.$$.fragment, local);
    			transition_in(navigation.$$.fragment, local);
    			transition_in(artgrid.$$.fragment, local);
    			transition_in(grouping.$$.fragment, local);
    			transition_in(player.$$.fragment, local);
    			transition_in(songlist.$$.fragment, local);
    			transition_in(details.$$.fragment, local);
    			transition_in(backgroundart.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(controller.$$.fragment, local);
    			transition_out(navigation.$$.fragment, local);
    			transition_out(artgrid.$$.fragment, local);
    			transition_out(grouping.$$.fragment, local);
    			transition_out(player.$$.fragment, local);
    			transition_out(songlist.$$.fragment, local);
    			transition_out(details.$$.fragment, local);
    			transition_out(backgroundart.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(controller, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(navigation);
    			destroy_component(artgrid);
    			destroy_component(grouping);
    			destroy_component(player);
    			destroy_component(songlist);
    			destroy_component(details);
    			destroy_component(backgroundart);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Navigation,
    		ArtGrid,
    		Grouping: Ordering,
    		Player,
    		SongList,
    		Details,
    		Controller,
    		BackgroundArt
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    //@ts-expect-error
    const app = new App({
        target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
