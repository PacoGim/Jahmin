
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
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
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
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
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
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
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
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

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
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

    let selectedGroupByStore = writable('');
    let selectedGroupByValueStore = writable('');
    let albumListStore = writable([]);
    // List to show within Song List component.
    let songListStore = writable([]);
    // List to keep track of songs to play.
    let playbackStore = writable([]);
    // Number = index of the playbackStore to play
    // Boolean = Start playing right away or not.
    let playbackCursor = writable([0, false]);
    // ID of the current album playing.
    let albumPlayingIdStore = writable(undefined);
    let songPlayingIDStore = writable(undefined);
    // Allows to share with the rest of the app whether the player is playing or not.
    let isPlaying = writable(false);
    let selectedAlbumId = writable(undefined);
    let selectedSongsStore = writable([]);
    let albumCoverArtMapStore = writable(new Map());
    let appTitle = writable('Jahmin');
    let dbVersion = writable(0);

    const { ipcRenderer } = require('electron');
    function getGroupingIPC(valueToGroupBy) {
        return new Promise((resolve, reject) => {
            ipcRenderer.invoke('get-grouping', valueToGroupBy).then((result) => {
                resolve(result);
            });
        });
    }
    function getConfigIPC() {
        return new Promise((resolve, reject) => {
            ipcRenderer.invoke('get-config').then((result) => {
                resolve(result);
            });
        });
    }
    // TODO Dynamic
    const sortBy = 'RootDir';
    function getAlbumsIPC(groupBy, groupByValue) {
        return new Promise((resolve, reject) => {
            ipcRenderer.invoke('get-albums', groupBy, groupByValue).then((result) => {
                result = result.sort((a, b) => String(a[sortBy]).localeCompare(String(b[sortBy])));
                resolve(result);
            });
        });
    }
    /*
        Show Songs ONLY by folders (For tagging by folder purpose) after selecting options, reload app.
    */
    /*
    export function getAlbumsIPC(): Promise<void> {
        return new Promise((resolve, reject) => {
            ipcRenderer.invoke('get-albums').then((result) => {
                result = result.sort((a, b) => String(a[sortBy]).localeCompare(String(b[sortBy])))

                albums.set(result)
                resolve()
                // When the results arrive, recursive call to wait for the eventual new filtering.
                getAlbumsIPC()
            })
        })
    }

    export function getAllAlbumsIPC(): Promise<void> {
        return new Promise((resolve, reject) => {
            ipcRenderer.invoke('get-all-albums').then((result) => {
                result = result.sort((a, b) => String(a['FolderName']).localeCompare(String(b['FolderName'])))
                console.log(result)

                albums.set(result)
                resolve()
            })
        })
    }

    */
    function getCoverIPC(rootDir) {
        return new Promise((resolve, reject) => {
            ipcRenderer.invoke('get-cover', rootDir).then((result) => {
                resolve(result);
            });
        });
    }
    function getAlbumIPC(albumID) {
        return new Promise((resolve, reject) => {
            ipcRenderer.invoke('get-album', albumID).then((result) => {
                if (result) {
                    // TODO Add custom sorting.
                    result.Songs = result.Songs.sort((a, b) => a.Track - b.Track);
                    resolve(result);
                }
            });
        });
    }
    function getAlbumColorsIPC(imageId) {
        return new Promise((resolve, reject) => {
            ipcRenderer.invoke('get-album-colors', imageId).then((result) => {
                resolve(result);
            });
        });
    }
    function getChangesProgressIPC() {
        return new Promise((resolve, reject) => {
            ipcRenderer.invoke('get-changes-progress').then((result) => {
                resolve(result);
            });
        });
    }
    function getWaveformIPC(path) {
        return new Promise((resolve, reject) => {
            try {
                ipcRenderer.invoke('get-waveform', path).then((result) => {
                    resolve(result);
                });
            }
            catch (error) {
                console.log('Oops', error);
            }
        });
    }
    function showContextMenuIPC(menuToOpen, parameters) {
        ipcRenderer.send('show-context-menu', menuToOpen, parameters);
    }
    // export function getDatabaseVersionIPC() {
    // 	return new Promise((resolve, reject) => {
    // 		ipcRenderer.invoke('get-database-version').then((result) => {
    // 			setTimeout(() => {
    // 				getDatabaseVersionIPC()
    // 			}, 10000)
    // 			let storeVersion
    // 			dbVersion.subscribe((value) => {
    // 				storeVersion = value
    // 			})()
    // 			if (result !== 0 && result !== storeVersion) {
    // 				console.log('New Version: ', result)
    // 				dbVersion.set(result)
    // 			}
    // 			resolve(result)
    // 		})
    // 	})
    // }
    function syncDbVersionIPC() {
        let storeDbVersion = undefined;
        dbVersion.subscribe((value) => (storeDbVersion = value))();
        // Waits for the version to change in main.
        ipcRenderer.invoke('sync-db-version', storeDbVersion).then((result) => {
            dbVersion.set(result);
            console.log(result);
            syncDbVersionIPC();
        });
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    	  path: basedir,
    	  exports: {},
    	  require: function (path, base) {
          return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
        }
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var wavesurfer = createCommonjsModule(function (module, exports) {
    /*!
     * wavesurfer.js 5.0.0 (2021-05-04)
     * https://wavesurfer-js.org
     * @license BSD-3-Clause
     */
    (function webpackUniversalModuleDefinition(root, factory) {
    	module.exports = factory();
    })(commonjsGlobal, function() {
    return /******/ (() => { // webpackBootstrap
    /******/ 	var __webpack_modules__ = ({

    /***/ "./src/drawer.canvasentry.js":
    /*!***********************************!*\
      !*** ./src/drawer.canvasentry.js ***!
      \***********************************/
    /***/ ((module, exports, __webpack_require__) => {


    Object.defineProperty(exports, "__esModule", ({
      value: true
    }));
    exports.default = void 0;

    var _style = _interopRequireDefault(__webpack_require__(/*! ./util/style */ "./src/util/style.js"));

    var _getId = _interopRequireDefault(__webpack_require__(/*! ./util/get-id */ "./src/util/get-id.js"));

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

    /**
     * The `CanvasEntry` class represents an element consisting of a wave `canvas`
     * and an (optional) progress wave `canvas`.
     *
     * The `MultiCanvas` renderer uses one or more `CanvasEntry` instances to
     * render a waveform, depending on the zoom level.
     */
    var CanvasEntry = /*#__PURE__*/function () {
      function CanvasEntry() {
        _classCallCheck(this, CanvasEntry);

        /**
         * The wave node
         *
         * @type {HTMLCanvasElement}
         */
        this.wave = null;
        /**
         * The wave canvas rendering context
         *
         * @type {CanvasRenderingContext2D}
         */

        this.waveCtx = null;
        /**
         * The (optional) progress wave node
         *
         * @type {HTMLCanvasElement}
         */

        this.progress = null;
        /**
         * The (optional) progress wave canvas rendering context
         *
         * @type {CanvasRenderingContext2D}
         */

        this.progressCtx = null;
        /**
         * Start of the area the canvas should render, between 0 and 1
         *
         * @type {number}
         */

        this.start = 0;
        /**
         * End of the area the canvas should render, between 0 and 1
         *
         * @type {number}
         */

        this.end = 1;
        /**
         * Unique identifier for this entry
         *
         * @type {string}
         */

        this.id = (0, _getId.default)(typeof this.constructor.name !== 'undefined' ? this.constructor.name.toLowerCase() + '_' : 'canvasentry_');
        /**
         * Canvas 2d context attributes
         *
         * @type {object}
         */

        this.canvasContextAttributes = {};
      }
      /**
       * Store the wave canvas element and create the 2D rendering context
       *
       * @param {HTMLCanvasElement} element The wave `canvas` element.
       */


      _createClass(CanvasEntry, [{
        key: "initWave",
        value: function initWave(element) {
          this.wave = element;
          this.waveCtx = this.wave.getContext('2d', this.canvasContextAttributes);
        }
        /**
         * Store the progress wave canvas element and create the 2D rendering
         * context
         *
         * @param {HTMLCanvasElement} element The progress wave `canvas` element.
         */

      }, {
        key: "initProgress",
        value: function initProgress(element) {
          this.progress = element;
          this.progressCtx = this.progress.getContext('2d', this.canvasContextAttributes);
        }
        /**
         * Update the dimensions
         *
         * @param {number} elementWidth Width of the entry
         * @param {number} totalWidth Total width of the multi canvas renderer
         * @param {number} width The new width of the element
         * @param {number} height The new height of the element
         */

      }, {
        key: "updateDimensions",
        value: function updateDimensions(elementWidth, totalWidth, width, height) {
          // where the canvas starts and ends in the waveform, represented as a
          // decimal between 0 and 1
          this.start = this.wave.offsetLeft / totalWidth || 0;
          this.end = this.start + elementWidth / totalWidth; // set wave canvas dimensions

          this.wave.width = width;
          this.wave.height = height;
          var elementSize = {
            width: elementWidth + 'px'
          };
          (0, _style.default)(this.wave, elementSize);

          if (this.hasProgressCanvas) {
            // set progress canvas dimensions
            this.progress.width = width;
            this.progress.height = height;
            (0, _style.default)(this.progress, elementSize);
          }
        }
        /**
         * Clear the wave and progress rendering contexts
         */

      }, {
        key: "clearWave",
        value: function clearWave() {
          // wave
          this.waveCtx.clearRect(0, 0, this.waveCtx.canvas.width, this.waveCtx.canvas.height); // progress

          if (this.hasProgressCanvas) {
            this.progressCtx.clearRect(0, 0, this.progressCtx.canvas.width, this.progressCtx.canvas.height);
          }
        }
        /**
         * Set the fill styles for wave and progress
         *
         * @param {string} waveColor Fill color for the wave canvas
         * @param {?string} progressColor Fill color for the progress canvas
         */

      }, {
        key: "setFillStyles",
        value: function setFillStyles(waveColor, progressColor) {
          this.waveCtx.fillStyle = waveColor;

          if (this.hasProgressCanvas) {
            this.progressCtx.fillStyle = progressColor;
          }
        }
        /**
         * Set the canvas transforms for wave and progress
         *
         * @param {boolean} vertical Whether to render vertically
         */

      }, {
        key: "applyCanvasTransforms",
        value: function applyCanvasTransforms(vertical) {
          if (vertical) {
            // Reflect the waveform across the line y = -x
            this.waveCtx.setTransform(0, 1, 1, 0, 0, 0);

            if (this.hasProgressCanvas) {
              this.progressCtx.setTransform(0, 1, 1, 0, 0, 0);
            }
          }
        }
        /**
         * Draw a rectangle for wave and progress
         *
         * @param {number} x X start position
         * @param {number} y Y start position
         * @param {number} width Width of the rectangle
         * @param {number} height Height of the rectangle
         * @param {number} radius Radius of the rectangle
         */

      }, {
        key: "fillRects",
        value: function fillRects(x, y, width, height, radius) {
          this.fillRectToContext(this.waveCtx, x, y, width, height, radius);

          if (this.hasProgressCanvas) {
            this.fillRectToContext(this.progressCtx, x, y, width, height, radius);
          }
        }
        /**
         * Draw the actual rectangle on a `canvas` element
         *
         * @param {CanvasRenderingContext2D} ctx Rendering context of target canvas
         * @param {number} x X start position
         * @param {number} y Y start position
         * @param {number} width Width of the rectangle
         * @param {number} height Height of the rectangle
         * @param {number} radius Radius of the rectangle
         */

      }, {
        key: "fillRectToContext",
        value: function fillRectToContext(ctx, x, y, width, height, radius) {
          if (!ctx) {
            return;
          }

          if (radius) {
            this.drawRoundedRect(ctx, x, y, width, height, radius);
          } else {
            ctx.fillRect(x, y, width, height);
          }
        }
        /**
         * Draw a rounded rectangle on Canvas
         *
         * @param {CanvasRenderingContext2D} ctx Canvas context
         * @param {number} x X-position of the rectangle
         * @param {number} y Y-position of the rectangle
         * @param {number} width Width of the rectangle
         * @param {number} height Height of the rectangle
         * @param {number} radius Radius of the rectangle
         *
         * @return {void}
         * @example drawRoundedRect(ctx, 50, 50, 5, 10, 3)
         */

      }, {
        key: "drawRoundedRect",
        value: function drawRoundedRect(ctx, x, y, width, height, radius) {
          if (height === 0) {
            return;
          } // peaks are float values from -1 to 1. Use absolute height values in
          // order to correctly calculate rounded rectangle coordinates


          if (height < 0) {
            height *= -1;
            y -= height;
          }

          ctx.beginPath();
          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + width - radius, y);
          ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
          ctx.lineTo(x + width, y + height - radius);
          ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
          ctx.lineTo(x + radius, y + height);
          ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
          ctx.closePath();
          ctx.fill();
        }
        /**
         * Render the actual wave and progress lines
         *
         * @param {number[]} peaks Array with peaks data
         * @param {number} absmax Maximum peak value (absolute)
         * @param {number} halfH Half the height of the waveform
         * @param {number} offsetY Offset to the top
         * @param {number} start The x-offset of the beginning of the area that
         * should be rendered
         * @param {number} end The x-offset of the end of the area that
         * should be rendered
         */

      }, {
        key: "drawLines",
        value: function drawLines(peaks, absmax, halfH, offsetY, start, end) {
          this.drawLineToContext(this.waveCtx, peaks, absmax, halfH, offsetY, start, end);

          if (this.hasProgressCanvas) {
            this.drawLineToContext(this.progressCtx, peaks, absmax, halfH, offsetY, start, end);
          }
        }
        /**
         * Render the actual waveform line on a `canvas` element
         *
         * @param {CanvasRenderingContext2D} ctx Rendering context of target canvas
         * @param {number[]} peaks Array with peaks data
         * @param {number} absmax Maximum peak value (absolute)
         * @param {number} halfH Half the height of the waveform
         * @param {number} offsetY Offset to the top
         * @param {number} start The x-offset of the beginning of the area that
         * should be rendered
         * @param {number} end The x-offset of the end of the area that
         * should be rendered
         */

      }, {
        key: "drawLineToContext",
        value: function drawLineToContext(ctx, peaks, absmax, halfH, offsetY, start, end) {
          if (!ctx) {
            return;
          }

          var length = peaks.length / 2;
          var first = Math.round(length * this.start); // use one more peak value to make sure we join peaks at ends -- unless,
          // of course, this is the last canvas

          var last = Math.round(length * this.end) + 1;
          var canvasStart = first;
          var canvasEnd = last;
          var scale = this.wave.width / (canvasEnd - canvasStart - 1); // optimization

          var halfOffset = halfH + offsetY;
          var absmaxHalf = absmax / halfH;
          ctx.beginPath();
          ctx.moveTo((canvasStart - first) * scale, halfOffset);
          ctx.lineTo((canvasStart - first) * scale, halfOffset - Math.round((peaks[2 * canvasStart] || 0) / absmaxHalf));
          var i, peak, h;

          for (i = canvasStart; i < canvasEnd; i++) {
            peak = peaks[2 * i] || 0;
            h = Math.round(peak / absmaxHalf);
            ctx.lineTo((i - first) * scale + this.halfPixel, halfOffset - h);
          } // draw the bottom edge going backwards, to make a single
          // closed hull to fill


          var j = canvasEnd - 1;

          for (j; j >= canvasStart; j--) {
            peak = peaks[2 * j + 1] || 0;
            h = Math.round(peak / absmaxHalf);
            ctx.lineTo((j - first) * scale + this.halfPixel, halfOffset - h);
          }

          ctx.lineTo((canvasStart - first) * scale, halfOffset - Math.round((peaks[2 * canvasStart + 1] || 0) / absmaxHalf));
          ctx.closePath();
          ctx.fill();
        }
        /**
         * Destroys this entry
         */

      }, {
        key: "destroy",
        value: function destroy() {
          this.waveCtx = null;
          this.wave = null;
          this.progressCtx = null;
          this.progress = null;
        }
        /**
         * Return image data of the wave `canvas` element
         *
         * When using a `type` of `'blob'`, this will return a `Promise` that
         * resolves with a `Blob` instance.
         *
         * @param {string} format='image/png' An optional value of a format type.
         * @param {number} quality=0.92 An optional value between 0 and 1.
         * @param {string} type='dataURL' Either 'dataURL' or 'blob'.
         * @return {string|Promise} When using the default `'dataURL'` `type` this
         * returns a data URL. When using the `'blob'` `type` this returns a
         * `Promise` that resolves with a `Blob` instance.
         */

      }, {
        key: "getImage",
        value: function getImage(format, quality, type) {
          var _this = this;

          if (type === 'blob') {
            return new Promise(function (resolve) {
              _this.wave.toBlob(resolve, format, quality);
            });
          } else if (type === 'dataURL') {
            return this.wave.toDataURL(format, quality);
          }
        }
      }]);

      return CanvasEntry;
    }();

    exports.default = CanvasEntry;
    module.exports = exports.default;

    /***/ }),

    /***/ "./src/drawer.js":
    /*!***********************!*\
      !*** ./src/drawer.js ***!
      \***********************/
    /***/ ((module, exports, __webpack_require__) => {


    function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

    Object.defineProperty(exports, "__esModule", ({
      value: true
    }));
    exports.default = void 0;

    var util = _interopRequireWildcard(__webpack_require__(/*! ./util */ "./src/util/index.js"));

    function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

    function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

    function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

    function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

    function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

    function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

    function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

    function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

    /**
     * Parent class for renderers
     *
     * @extends {Observer}
     */
    var Drawer = /*#__PURE__*/function (_util$Observer) {
      _inherits(Drawer, _util$Observer);

      var _super = _createSuper(Drawer);

      /**
       * @param {HTMLElement} container The container node of the wavesurfer instance
       * @param {WavesurferParams} params The wavesurfer initialisation options
       */
      function Drawer(container, params) {
        var _this;

        _classCallCheck(this, Drawer);

        _this = _super.call(this);
        _this.container = util.withOrientation(container, params.vertical);
        /**
         * @type {WavesurferParams}
         */

        _this.params = params;
        /**
         * The width of the renderer
         * @type {number}
         */

        _this.width = 0;
        /**
         * The height of the renderer
         * @type {number}
         */

        _this.height = params.height * _this.params.pixelRatio;
        _this.lastPos = 0;
        /**
         * The `<wave>` element which is added to the container
         * @type {HTMLElement}
         */

        _this.wrapper = null;
        return _this;
      }
      /**
       * Alias of `util.style`
       *
       * @param {HTMLElement} el The element that the styles will be applied to
       * @param {Object} styles The map of propName: attribute, both are used as-is
       * @return {HTMLElement} el
       */


      _createClass(Drawer, [{
        key: "style",
        value: function style(el, styles) {
          return util.style(el, styles);
        }
        /**
         * Create the wrapper `<wave>` element, style it and set up the events for
         * interaction
         */

      }, {
        key: "createWrapper",
        value: function createWrapper() {
          this.wrapper = util.withOrientation(this.container.appendChild(document.createElement('wave')), this.params.vertical);
          this.style(this.wrapper, {
            display: 'block',
            position: 'relative',
            userSelect: 'none',
            webkitUserSelect: 'none',
            height: this.params.height + 'px'
          });

          if (this.params.fillParent || this.params.scrollParent) {
            this.style(this.wrapper, {
              width: '100%',
              overflowX: this.params.hideScrollbar ? 'hidden' : 'auto',
              overflowY: 'hidden'
            });
          }

          this.setupWrapperEvents();
        }
        /**
         * Handle click event
         *
         * @param {Event} e Click event
         * @param {?boolean} noPrevent Set to true to not call `e.preventDefault()`
         * @return {number} Playback position from 0 to 1
         */

      }, {
        key: "handleEvent",
        value: function handleEvent(e, noPrevent) {
          !noPrevent && e.preventDefault();
          var clientX = util.withOrientation(e.targetTouches ? e.targetTouches[0] : e, this.params.vertical).clientX;
          var bbox = this.wrapper.getBoundingClientRect();
          var nominalWidth = this.width;
          var parentWidth = this.getWidth();
          var progressPixels = this.getProgressPixels(bbox, clientX);
          var progress;

          if (!this.params.fillParent && nominalWidth < parentWidth) {
            progress = progressPixels * (this.params.pixelRatio / nominalWidth) || 0;
          } else {
            progress = (progressPixels + this.wrapper.scrollLeft) / this.wrapper.scrollWidth || 0;
          }

          return util.clamp(progress, 0, 1);
        }
      }, {
        key: "getProgressPixels",
        value: function getProgressPixels(wrapperBbox, clientX) {
          if (this.params.rtl) {
            return wrapperBbox.right - clientX;
          } else {
            return clientX - wrapperBbox.left;
          }
        }
      }, {
        key: "setupWrapperEvents",
        value: function setupWrapperEvents() {
          var _this2 = this;

          this.wrapper.addEventListener('click', function (e) {
            var orientedEvent = util.withOrientation(e, _this2.params.vertical);
            var scrollbarHeight = _this2.wrapper.offsetHeight - _this2.wrapper.clientHeight;

            if (scrollbarHeight !== 0) {
              // scrollbar is visible.  Check if click was on it
              var bbox = _this2.wrapper.getBoundingClientRect();

              if (orientedEvent.clientY >= bbox.bottom - scrollbarHeight) {
                // ignore mousedown as it was on the scrollbar
                return;
              }
            }

            if (_this2.params.interact) {
              _this2.fireEvent('click', e, _this2.handleEvent(e));
            }
          });
          this.wrapper.addEventListener('dblclick', function (e) {
            if (_this2.params.interact) {
              _this2.fireEvent('dblclick', e, _this2.handleEvent(e));
            }
          });
          this.wrapper.addEventListener('scroll', function (e) {
            return _this2.fireEvent('scroll', e);
          });
        }
        /**
         * Draw peaks on the canvas
         *
         * @param {number[]|Number.<Array[]>} peaks Can also be an array of arrays
         * for split channel rendering
         * @param {number} length The width of the area that should be drawn
         * @param {number} start The x-offset of the beginning of the area that
         * should be rendered
         * @param {number} end The x-offset of the end of the area that should be
         * rendered
         */

      }, {
        key: "drawPeaks",
        value: function drawPeaks(peaks, length, start, end) {
          if (!this.setWidth(length)) {
            this.clearWave();
          }

          this.params.barWidth ? this.drawBars(peaks, 0, start, end) : this.drawWave(peaks, 0, start, end);
        }
        /**
         * Scroll to the beginning
         */

      }, {
        key: "resetScroll",
        value: function resetScroll() {
          if (this.wrapper !== null) {
            this.wrapper.scrollLeft = 0;
          }
        }
        /**
         * Recenter the view-port at a certain percent of the waveform
         *
         * @param {number} percent Value from 0 to 1 on the waveform
         */

      }, {
        key: "recenter",
        value: function recenter(percent) {
          var position = this.wrapper.scrollWidth * percent;
          this.recenterOnPosition(position, true);
        }
        /**
         * Recenter the view-port on a position, either scroll there immediately or
         * in steps of 5 pixels
         *
         * @param {number} position X-offset in pixels
         * @param {boolean} immediate Set to true to immediately scroll somewhere
         */

      }, {
        key: "recenterOnPosition",
        value: function recenterOnPosition(position, immediate) {
          var scrollLeft = this.wrapper.scrollLeft;
          var half = ~~(this.wrapper.clientWidth / 2);
          var maxScroll = this.wrapper.scrollWidth - this.wrapper.clientWidth;
          var target = position - half;
          var offset = target - scrollLeft;

          if (maxScroll == 0) {
            // no need to continue if scrollbar is not there
            return;
          } // if the cursor is currently visible...


          if (!immediate && -half <= offset && offset < half) {
            // set rate at which waveform is centered
            var rate = this.params.autoCenterRate; // make rate depend on width of view and length of waveform

            rate /= half;
            rate *= maxScroll;
            offset = Math.max(-rate, Math.min(rate, offset));
            target = scrollLeft + offset;
          } // limit target to valid range (0 to maxScroll)


          target = Math.max(0, Math.min(maxScroll, target)); // no use attempting to scroll if we're not moving

          if (target != scrollLeft) {
            this.wrapper.scrollLeft = target;
          }
        }
        /**
         * Get the current scroll position in pixels
         *
         * @return {number} Horizontal scroll position in pixels
         */

      }, {
        key: "getScrollX",
        value: function getScrollX() {
          var x = 0;

          if (this.wrapper) {
            var pixelRatio = this.params.pixelRatio;
            x = Math.round(this.wrapper.scrollLeft * pixelRatio); // In cases of elastic scroll (safari with mouse wheel) you can
            // scroll beyond the limits of the container
            // Calculate and floor the scrollable extent to make sure an out
            // of bounds value is not returned
            // Ticket #1312

            if (this.params.scrollParent) {
              var maxScroll = ~~(this.wrapper.scrollWidth * pixelRatio - this.getWidth());
              x = Math.min(maxScroll, Math.max(0, x));
            }
          }

          return x;
        }
        /**
         * Get the width of the container
         *
         * @return {number} The width of the container
         */

      }, {
        key: "getWidth",
        value: function getWidth() {
          return Math.round(this.container.clientWidth * this.params.pixelRatio);
        }
        /**
         * Set the width of the container
         *
         * @param {number} width The new width of the container
         * @return {boolean} Whether the width of the container was updated or not
         */

      }, {
        key: "setWidth",
        value: function setWidth(width) {
          if (this.width == width) {
            return false;
          }

          this.width = width;

          if (this.params.fillParent || this.params.scrollParent) {
            this.style(this.wrapper, {
              width: ''
            });
          } else {
            var newWidth = ~~(this.width / this.params.pixelRatio) + 'px';
            this.style(this.wrapper, {
              width: newWidth
            });
          }

          this.updateSize();
          return true;
        }
        /**
         * Set the height of the container
         *
         * @param {number} height The new height of the container.
         * @return {boolean} Whether the height of the container was updated or not
         */

      }, {
        key: "setHeight",
        value: function setHeight(height) {
          if (height == this.height) {
            return false;
          }

          this.height = height;
          this.style(this.wrapper, {
            height: ~~(this.height / this.params.pixelRatio) + 'px'
          });
          this.updateSize();
          return true;
        }
        /**
         * Called by wavesurfer when progress should be rendered
         *
         * @param {number} progress From 0 to 1
         */

      }, {
        key: "progress",
        value: function progress(_progress) {
          var minPxDelta = 1 / this.params.pixelRatio;
          var pos = Math.round(_progress * this.width) * minPxDelta;

          if (pos < this.lastPos || pos - this.lastPos >= minPxDelta) {
            this.lastPos = pos;

            if (this.params.scrollParent && this.params.autoCenter) {
              var newPos = ~~(this.wrapper.scrollWidth * _progress);
              this.recenterOnPosition(newPos, this.params.autoCenterImmediately);
            }

            this.updateProgress(pos);
          }
        }
        /**
         * This is called when wavesurfer is destroyed
         */

      }, {
        key: "destroy",
        value: function destroy() {
          this.unAll();

          if (this.wrapper) {
            if (this.wrapper.parentNode == this.container) {
              this.container.removeChild(this.wrapper.domElement);
            }

            this.wrapper = null;
          }
        }
        /* Renderer-specific methods */

        /**
         * Called after cursor related params have changed.
         *
         * @abstract
         */

      }, {
        key: "updateCursor",
        value: function updateCursor() {}
        /**
         * Called when the size of the container changes so the renderer can adjust
         *
         * @abstract
         */

      }, {
        key: "updateSize",
        value: function updateSize() {}
        /**
         * Draw a waveform with bars
         *
         * @abstract
         * @param {number[]|Number.<Array[]>} peaks Can also be an array of arrays for split channel
         * rendering
         * @param {number} channelIndex The index of the current channel. Normally
         * should be 0
         * @param {number} start The x-offset of the beginning of the area that
         * should be rendered
         * @param {number} end The x-offset of the end of the area that should be
         * rendered
         */

      }, {
        key: "drawBars",
        value: function drawBars(peaks, channelIndex, start, end) {}
        /**
         * Draw a waveform
         *
         * @abstract
         * @param {number[]|Number.<Array[]>} peaks Can also be an array of arrays for split channel
         * rendering
         * @param {number} channelIndex The index of the current channel. Normally
         * should be 0
         * @param {number} start The x-offset of the beginning of the area that
         * should be rendered
         * @param {number} end The x-offset of the end of the area that should be
         * rendered
         */

      }, {
        key: "drawWave",
        value: function drawWave(peaks, channelIndex, start, end) {}
        /**
         * Clear the waveform
         *
         * @abstract
         */

      }, {
        key: "clearWave",
        value: function clearWave() {}
        /**
         * Render the new progress
         *
         * @abstract
         * @param {number} position X-Offset of progress position in pixels
         */

      }, {
        key: "updateProgress",
        value: function updateProgress(position) {}
      }]);

      return Drawer;
    }(util.Observer);

    exports.default = Drawer;
    module.exports = exports.default;

    /***/ }),

    /***/ "./src/drawer.multicanvas.js":
    /*!***********************************!*\
      !*** ./src/drawer.multicanvas.js ***!
      \***********************************/
    /***/ ((module, exports, __webpack_require__) => {


    function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

    Object.defineProperty(exports, "__esModule", ({
      value: true
    }));
    exports.default = void 0;

    var _drawer = _interopRequireDefault(__webpack_require__(/*! ./drawer */ "./src/drawer.js"));

    var util = _interopRequireWildcard(__webpack_require__(/*! ./util */ "./src/util/index.js"));

    var _drawer2 = _interopRequireDefault(__webpack_require__(/*! ./drawer.canvasentry */ "./src/drawer.canvasentry.js"));

    function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

    function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

    function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

    function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

    function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

    function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

    function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

    function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

    /**
     * MultiCanvas renderer for wavesurfer. Is currently the default and sole
     * builtin renderer.
     *
     * A `MultiCanvas` consists of one or more `CanvasEntry` instances, depending
     * on the zoom level.
     */
    var MultiCanvas = /*#__PURE__*/function (_Drawer) {
      _inherits(MultiCanvas, _Drawer);

      var _super = _createSuper(MultiCanvas);

      /**
       * @param {HTMLElement} container The container node of the wavesurfer instance
       * @param {WavesurferParams} params The wavesurfer initialisation options
       */
      function MultiCanvas(container, params) {
        var _this;

        _classCallCheck(this, MultiCanvas);

        _this = _super.call(this, container, params);
        /**
         * @type {number}
         */

        _this.maxCanvasWidth = params.maxCanvasWidth;
        /**
         * @type {number}
         */

        _this.maxCanvasElementWidth = Math.round(params.maxCanvasWidth / params.pixelRatio);
        /**
         * Whether or not the progress wave is rendered. If the `waveColor`
         * and `progressColor` are the same color it is not.
         *
         * @type {boolean}
         */

        _this.hasProgressCanvas = params.waveColor != params.progressColor;
        /**
         * @type {number}
         */

        _this.halfPixel = 0.5 / params.pixelRatio;
        /**
         * List of `CanvasEntry` instances.
         *
         * @type {Array}
         */

        _this.canvases = [];
        /**
         * @type {HTMLElement}
         */

        _this.progressWave = null;
        /**
         * Class used to generate entries.
         *
         * @type {function}
         */

        _this.EntryClass = _drawer2.default;
        /**
         * Canvas 2d context attributes.
         *
         * @type {object}
         */

        _this.canvasContextAttributes = params.drawingContextAttributes;
        /**
         * Overlap added between entries to prevent vertical white stripes
         * between `canvas` elements.
         *
         * @type {number}
         */

        _this.overlap = 2 * Math.ceil(params.pixelRatio / 2);
        /**
         * The radius of the wave bars. Makes bars rounded
         *
         * @type {number}
         */

        _this.barRadius = params.barRadius || 0;
        /**
         * Whether to render the waveform vertically. Defaults to false.
         *
         * @type {boolean}
         */

        _this.vertical = params.vertical;
        return _this;
      }
      /**
       * Initialize the drawer
       */


      _createClass(MultiCanvas, [{
        key: "init",
        value: function init() {
          this.createWrapper();
          this.createElements();
        }
        /**
         * Create the canvas elements and style them
         *
         */

      }, {
        key: "createElements",
        value: function createElements() {
          this.progressWave = util.withOrientation(this.wrapper.appendChild(document.createElement('wave')), this.params.vertical);
          this.style(this.progressWave, {
            position: 'absolute',
            zIndex: 3,
            left: 0,
            top: 0,
            bottom: 0,
            overflow: 'hidden',
            width: '0',
            display: 'none',
            boxSizing: 'border-box',
            borderRightStyle: 'solid',
            pointerEvents: 'none'
          });
          this.addCanvas();
          this.updateCursor();
        }
        /**
         * Update cursor style
         */

      }, {
        key: "updateCursor",
        value: function updateCursor() {
          this.style(this.progressWave, {
            borderRightWidth: this.params.cursorWidth + 'px',
            borderRightColor: this.params.cursorColor
          });
        }
        /**
         * Adjust to the updated size by adding or removing canvases
         */

      }, {
        key: "updateSize",
        value: function updateSize() {
          var _this2 = this;

          var totalWidth = Math.round(this.width / this.params.pixelRatio);
          var requiredCanvases = Math.ceil(totalWidth / (this.maxCanvasElementWidth + this.overlap)); // add required canvases

          while (this.canvases.length < requiredCanvases) {
            this.addCanvas();
          } // remove older existing canvases, if any


          while (this.canvases.length > requiredCanvases) {
            this.removeCanvas();
          }

          var canvasWidth = this.maxCanvasWidth + this.overlap;
          var lastCanvas = this.canvases.length - 1;
          this.canvases.forEach(function (entry, i) {
            if (i == lastCanvas) {
              canvasWidth = _this2.width - _this2.maxCanvasWidth * lastCanvas;
            }

            _this2.updateDimensions(entry, canvasWidth, _this2.height);

            entry.clearWave();
          });
        }
        /**
         * Add a canvas to the canvas list
         *
         */

      }, {
        key: "addCanvas",
        value: function addCanvas() {
          var entry = new this.EntryClass();
          entry.canvasContextAttributes = this.canvasContextAttributes;
          entry.hasProgressCanvas = this.hasProgressCanvas;
          entry.halfPixel = this.halfPixel;
          var leftOffset = this.maxCanvasElementWidth * this.canvases.length; // wave

          var wave = util.withOrientation(this.wrapper.appendChild(document.createElement('canvas')), this.params.vertical);
          this.style(wave, {
            position: 'absolute',
            zIndex: 2,
            left: leftOffset + 'px',
            top: 0,
            bottom: 0,
            height: '100%',
            pointerEvents: 'none'
          });
          entry.initWave(wave); // progress

          if (this.hasProgressCanvas) {
            var progress = util.withOrientation(this.progressWave.appendChild(document.createElement('canvas')), this.params.vertical);
            this.style(progress, {
              position: 'absolute',
              left: leftOffset + 'px',
              top: 0,
              bottom: 0,
              height: '100%'
            });
            entry.initProgress(progress);
          }

          this.canvases.push(entry);
        }
        /**
         * Pop single canvas from the list
         *
         */

      }, {
        key: "removeCanvas",
        value: function removeCanvas() {
          var lastEntry = this.canvases[this.canvases.length - 1]; // wave

          lastEntry.wave.parentElement.removeChild(lastEntry.wave.domElement); // progress

          if (this.hasProgressCanvas) {
            lastEntry.progress.parentElement.removeChild(lastEntry.progress.domElement);
          } // cleanup


          if (lastEntry) {
            lastEntry.destroy();
            lastEntry = null;
          }

          this.canvases.pop();
        }
        /**
         * Update the dimensions of a canvas element
         *
         * @param {CanvasEntry} entry Target entry
         * @param {number} width The new width of the element
         * @param {number} height The new height of the element
         */

      }, {
        key: "updateDimensions",
        value: function updateDimensions(entry, width, height) {
          var elementWidth = Math.round(width / this.params.pixelRatio);
          var totalWidth = Math.round(this.width / this.params.pixelRatio); // update canvas dimensions

          entry.updateDimensions(elementWidth, totalWidth, width, height); // style element

          this.style(this.progressWave, {
            display: 'block'
          });
        }
        /**
         * Clear the whole multi-canvas
         */

      }, {
        key: "clearWave",
        value: function clearWave() {
          var _this3 = this;

          util.frame(function () {
            _this3.canvases.forEach(function (entry) {
              return entry.clearWave();
            });
          })();
        }
        /**
         * Draw a waveform with bars
         *
         * @param {number[]|Number.<Array[]>} peaks Can also be an array of arrays
         * for split channel rendering
         * @param {number} channelIndex The index of the current channel. Normally
         * should be 0. Must be an integer.
         * @param {number} start The x-offset of the beginning of the area that
         * should be rendered
         * @param {number} end The x-offset of the end of the area that should be
         * rendered
         * @returns {void}
         */

      }, {
        key: "drawBars",
        value: function drawBars(peaks, channelIndex, start, end) {
          var _this4 = this;

          return this.prepareDraw(peaks, channelIndex, start, end, function (_ref) {
            var absmax = _ref.absmax,
                hasMinVals = _ref.hasMinVals,
                height = _ref.height,
                offsetY = _ref.offsetY,
                halfH = _ref.halfH,
                peaks = _ref.peaks,
                ch = _ref.channelIndex;

            // if drawBars was called within ws.empty we don't pass a start and
            // don't want anything to happen
            if (start === undefined) {
              return;
            } // Skip every other value if there are negatives.


            var peakIndexScale = hasMinVals ? 2 : 1;
            var length = peaks.length / peakIndexScale;
            var bar = _this4.params.barWidth * _this4.params.pixelRatio;
            var gap = _this4.params.barGap === null ? 0 : Math.max(_this4.params.pixelRatio, _this4.params.barGap * _this4.params.pixelRatio);
            var step = bar + gap;
            var scale = length / _this4.width;
            var first = start;
            var last = end;
            var i = first;

            for (i; i < last; i += step) {
              var peak = peaks[Math.floor(i * scale * peakIndexScale)] || 0;
              var h = Math.round(peak / absmax * halfH);
              /* in case of silences, allow the user to specify that we
               * always draw *something* (normally a 1px high bar) */

              if (h == 0 && _this4.params.barMinHeight) {
                h = _this4.params.barMinHeight;
              }

              _this4.fillRect(i + _this4.halfPixel, halfH - h + offsetY, bar + _this4.halfPixel, h * 2, _this4.barRadius, ch);
            }
          });
        }
        /**
         * Draw a waveform
         *
         * @param {number[]|Number.<Array[]>} peaks Can also be an array of arrays
         * for split channel rendering
         * @param {number} channelIndex The index of the current channel. Normally
         * should be 0
         * @param {number?} start The x-offset of the beginning of the area that
         * should be rendered (If this isn't set only a flat line is rendered)
         * @param {number?} end The x-offset of the end of the area that should be
         * rendered
         * @returns {void}
         */

      }, {
        key: "drawWave",
        value: function drawWave(peaks, channelIndex, start, end) {
          var _this5 = this;

          return this.prepareDraw(peaks, channelIndex, start, end, function (_ref2) {
            var absmax = _ref2.absmax,
                hasMinVals = _ref2.hasMinVals,
                height = _ref2.height,
                offsetY = _ref2.offsetY,
                halfH = _ref2.halfH,
                peaks = _ref2.peaks,
                channelIndex = _ref2.channelIndex;

            if (!hasMinVals) {
              var reflectedPeaks = [];
              var len = peaks.length;
              var i = 0;

              for (i; i < len; i++) {
                reflectedPeaks[2 * i] = peaks[i];
                reflectedPeaks[2 * i + 1] = -peaks[i];
              }

              peaks = reflectedPeaks;
            } // if drawWave was called within ws.empty we don't pass a start and
            // end and simply want a flat line


            if (start !== undefined) {
              _this5.drawLine(peaks, absmax, halfH, offsetY, start, end, channelIndex);
            } // always draw a median line


            _this5.fillRect(0, halfH + offsetY - _this5.halfPixel, _this5.width, _this5.halfPixel, _this5.barRadius, channelIndex);
          });
        }
        /**
         * Tell the canvas entries to render their portion of the waveform
         *
         * @param {number[]} peaks Peaks data
         * @param {number} absmax Maximum peak value (absolute)
         * @param {number} halfH Half the height of the waveform
         * @param {number} offsetY Offset to the top
         * @param {number} start The x-offset of the beginning of the area that
         * should be rendered
         * @param {number} end The x-offset of the end of the area that
         * should be rendered
         * @param {channelIndex} channelIndex The channel index of the line drawn
         */

      }, {
        key: "drawLine",
        value: function drawLine(peaks, absmax, halfH, offsetY, start, end, channelIndex) {
          var _this6 = this;

          var _ref3 = this.params.splitChannelsOptions.channelColors[channelIndex] || {},
              waveColor = _ref3.waveColor,
              progressColor = _ref3.progressColor;

          this.canvases.forEach(function (entry, i) {
            _this6.setFillStyles(entry, waveColor, progressColor);

            _this6.applyCanvasTransforms(entry, _this6.params.vertical);

            entry.drawLines(peaks, absmax, halfH, offsetY, start, end);
          });
        }
        /**
         * Draw a rectangle on the multi-canvas
         *
         * @param {number} x X-position of the rectangle
         * @param {number} y Y-position of the rectangle
         * @param {number} width Width of the rectangle
         * @param {number} height Height of the rectangle
         * @param {number} radius Radius of the rectangle
         * @param {channelIndex} channelIndex The channel index of the bar drawn
         */

      }, {
        key: "fillRect",
        value: function fillRect(x, y, width, height, radius, channelIndex) {
          var startCanvas = Math.floor(x / this.maxCanvasWidth);
          var endCanvas = Math.min(Math.ceil((x + width) / this.maxCanvasWidth) + 1, this.canvases.length);
          var i = startCanvas;

          for (i; i < endCanvas; i++) {
            var entry = this.canvases[i];
            var leftOffset = i * this.maxCanvasWidth;
            var intersection = {
              x1: Math.max(x, i * this.maxCanvasWidth),
              y1: y,
              x2: Math.min(x + width, i * this.maxCanvasWidth + entry.wave.width),
              y2: y + height
            };

            if (intersection.x1 < intersection.x2) {
              var _ref4 = this.params.splitChannelsOptions.channelColors[channelIndex] || {},
                  waveColor = _ref4.waveColor,
                  progressColor = _ref4.progressColor;

              this.setFillStyles(entry, waveColor, progressColor);
              this.applyCanvasTransforms(entry, this.params.vertical);
              entry.fillRects(intersection.x1 - leftOffset, intersection.y1, intersection.x2 - intersection.x1, intersection.y2 - intersection.y1, radius);
            }
          }
        }
        /**
         * Returns whether to hide the channel from being drawn based on params.
         *
         * @param {number} channelIndex The index of the current channel.
         * @returns {bool} True to hide the channel, false to draw.
         */

      }, {
        key: "hideChannel",
        value: function hideChannel(channelIndex) {
          return this.params.splitChannels && this.params.splitChannelsOptions.filterChannels.includes(channelIndex);
        }
        /**
         * Performs preparation tasks and calculations which are shared by `drawBars`
         * and `drawWave`
         *
         * @param {number[]|Number.<Array[]>} peaks Can also be an array of arrays for
         * split channel rendering
         * @param {number} channelIndex The index of the current channel. Normally
         * should be 0
         * @param {number?} start The x-offset of the beginning of the area that
         * should be rendered. If this isn't set only a flat line is rendered
         * @param {number?} end The x-offset of the end of the area that should be
         * rendered
         * @param {function} fn The render function to call, e.g. `drawWave`
         * @param {number} drawIndex The index of the current channel after filtering.
         * @param {number?} normalizedMax Maximum modulation value across channels for use with relativeNormalization. Ignored when undefined
         * @returns {void}
         */

      }, {
        key: "prepareDraw",
        value: function prepareDraw(peaks, channelIndex, start, end, fn, drawIndex, normalizedMax) {
          var _this7 = this;

          return util.frame(function () {
            // Split channels and call this function with the channelIndex set
            if (peaks[0] instanceof Array) {
              var channels = peaks;

              if (_this7.params.splitChannels) {
                var filteredChannels = channels.filter(function (c, i) {
                  return !_this7.hideChannel(i);
                });

                if (!_this7.params.splitChannelsOptions.overlay) {
                  _this7.setHeight(Math.max(filteredChannels.length, 1) * _this7.params.height * _this7.params.pixelRatio);
                }

                var overallAbsMax;

                if (_this7.params.splitChannelsOptions && _this7.params.splitChannelsOptions.relativeNormalization) {
                  // calculate maximum peak across channels to use for normalization
                  overallAbsMax = util.max(channels.map(function (channelPeaks) {
                    return util.absMax(channelPeaks);
                  }));
                }

                return channels.forEach(function (channelPeaks, i) {
                  return _this7.prepareDraw(channelPeaks, i, start, end, fn, filteredChannels.indexOf(channelPeaks), overallAbsMax);
                });
              }

              peaks = channels[0];
            } // Return and do not draw channel peaks if hidden.


            if (_this7.hideChannel(channelIndex)) {
              return;
            } // calculate maximum modulation value, either from the barHeight
            // parameter or if normalize=true from the largest value in the peak
            // set


            var absmax = 1 / _this7.params.barHeight;

            if (_this7.params.normalize) {
              absmax = normalizedMax === undefined ? util.absMax(peaks) : normalizedMax;
            } // Bar wave draws the bottom only as a reflection of the top,
            // so we don't need negative values


            var hasMinVals = [].some.call(peaks, function (val) {
              return val < 0;
            });
            var height = _this7.params.height * _this7.params.pixelRatio;
            var halfH = height / 2;
            var offsetY = height * drawIndex || 0; // Override offsetY if overlay is true

            if (_this7.params.splitChannelsOptions && _this7.params.splitChannelsOptions.overlay) {
              offsetY = 0;
            }

            return fn({
              absmax: absmax,
              hasMinVals: hasMinVals,
              height: height,
              offsetY: offsetY,
              halfH: halfH,
              peaks: peaks,
              channelIndex: channelIndex
            });
          })();
        }
        /**
         * Set the fill styles for a certain entry (wave and progress)
         *
         * @param {CanvasEntry} entry Target entry
         * @param {string} waveColor Wave color to draw this entry
         * @param {string} progressColor Progress color to draw this entry
         */

      }, {
        key: "setFillStyles",
        value: function setFillStyles(entry) {
          var waveColor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.params.waveColor;
          var progressColor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.params.progressColor;
          entry.setFillStyles(waveColor, progressColor);
        }
        /**
         * Set the canvas transforms for a certain entry (wave and progress)
         *
         * @param {CanvasEntry} entry Target entry
         * @param {boolean} vertical Whether to render the waveform vertically
         */

      }, {
        key: "applyCanvasTransforms",
        value: function applyCanvasTransforms(entry) {
          var vertical = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
          entry.applyCanvasTransforms(vertical);
        }
        /**
         * Return image data of the multi-canvas
         *
         * When using a `type` of `'blob'`, this will return a `Promise`.
         *
         * @param {string} format='image/png' An optional value of a format type.
         * @param {number} quality=0.92 An optional value between 0 and 1.
         * @param {string} type='dataURL' Either 'dataURL' or 'blob'.
         * @return {string|string[]|Promise} When using the default `'dataURL'`
         * `type` this returns a single data URL or an array of data URLs,
         * one for each canvas. When using the `'blob'` `type` this returns a
         * `Promise` that resolves with an array of `Blob` instances, one for each
         * canvas.
         */

      }, {
        key: "getImage",
        value: function getImage(format, quality, type) {
          if (type === 'blob') {
            return Promise.all(this.canvases.map(function (entry) {
              return entry.getImage(format, quality, type);
            }));
          } else if (type === 'dataURL') {
            var images = this.canvases.map(function (entry) {
              return entry.getImage(format, quality, type);
            });
            return images.length > 1 ? images : images[0];
          }
        }
        /**
         * Render the new progress
         *
         * @param {number} position X-offset of progress position in pixels
         */

      }, {
        key: "updateProgress",
        value: function updateProgress(position) {
          this.style(this.progressWave, {
            width: position + 'px'
          });
        }
      }]);

      return MultiCanvas;
    }(_drawer.default);

    exports.default = MultiCanvas;
    module.exports = exports.default;

    /***/ }),

    /***/ "./src/mediaelement-webaudio.js":
    /*!**************************************!*\
      !*** ./src/mediaelement-webaudio.js ***!
      \**************************************/
    /***/ ((module, exports, __webpack_require__) => {


    function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

    Object.defineProperty(exports, "__esModule", ({
      value: true
    }));
    exports.default = void 0;

    var _mediaelement = _interopRequireDefault(__webpack_require__(/*! ./mediaelement */ "./src/mediaelement.js"));

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

    function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

    function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

    function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

    function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

    function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

    function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

    function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

    function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

    /**
     * MediaElementWebAudio backend: load audio via an HTML5 audio tag, but playback with the WebAudio API.
     * The advantage here is that the html5 <audio> tag can perform range requests on the server and not
     * buffer the entire file in one request, and you still get the filtering and scripting functionality
     * of the webaudio API.
     * Note that in order to use range requests and prevent buffering, you must provide peak data.
     *
     * @since 3.2.0
     */
    var MediaElementWebAudio = /*#__PURE__*/function (_MediaElement) {
      _inherits(MediaElementWebAudio, _MediaElement);

      var _super = _createSuper(MediaElementWebAudio);

      /**
       * Construct the backend
       *
       * @param {WavesurferParams} params Wavesurfer parameters
       */
      function MediaElementWebAudio(params) {
        var _this;

        _classCallCheck(this, MediaElementWebAudio);

        _this = _super.call(this, params);
        /** @private */

        _this.params = params;
        /** @private */

        _this.sourceMediaElement = null;
        return _this;
      }
      /**
       * Initialise the backend, called in `wavesurfer.createBackend()`
       */


      _createClass(MediaElementWebAudio, [{
        key: "init",
        value: function init() {
          this.setPlaybackRate(this.params.audioRate);
          this.createTimer();
          this.createVolumeNode();
          this.createScriptNode();
          this.createAnalyserNode();
        }
        /**
         * Private method called by both `load` (from url)
         * and `loadElt` (existing media element) methods.
         *
         * @param {HTMLMediaElement} media HTML5 Audio or Video element
         * @param {number[]|Number.<Array[]>} peaks Array of peak data
         * @param {string} preload HTML 5 preload attribute value
         * @private
         */

      }, {
        key: "_load",
        value: function _load(media, peaks, preload) {
          _get(_getPrototypeOf(MediaElementWebAudio.prototype), "_load", this).call(this, media, peaks, preload);

          this.createMediaElementSource(media);
        }
        /**
         * Create MediaElementSource node
         *
         * @since 3.2.0
         * @param {HTMLMediaElement} mediaElement HTML5 Audio to load
         */

      }, {
        key: "createMediaElementSource",
        value: function createMediaElementSource(mediaElement) {
          this.sourceMediaElement = this.ac.createMediaElementSource(mediaElement);
          this.sourceMediaElement.connect(this.analyser);
        }
      }, {
        key: "play",
        value: function play(start, end) {
          this.resumeAudioContext();
          return _get(_getPrototypeOf(MediaElementWebAudio.prototype), "play", this).call(this, start, end);
        }
        /**
         * This is called when wavesurfer is destroyed
         *
         */

      }, {
        key: "destroy",
        value: function destroy() {
          _get(_getPrototypeOf(MediaElementWebAudio.prototype), "destroy", this).call(this);

          this.destroyWebAudio();
        }
      }]);

      return MediaElementWebAudio;
    }(_mediaelement.default);

    exports.default = MediaElementWebAudio;
    module.exports = exports.default;

    /***/ }),

    /***/ "./src/mediaelement.js":
    /*!*****************************!*\
      !*** ./src/mediaelement.js ***!
      \*****************************/
    /***/ ((module, exports, __webpack_require__) => {


    function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

    Object.defineProperty(exports, "__esModule", ({
      value: true
    }));
    exports.default = void 0;

    var _webaudio = _interopRequireDefault(__webpack_require__(/*! ./webaudio */ "./src/webaudio.js"));

    var util = _interopRequireWildcard(__webpack_require__(/*! ./util */ "./src/util/index.js"));

    function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

    function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

    function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

    function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

    function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

    function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

    function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

    function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

    function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

    function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

    /**
     * MediaElement backend
     */
    var MediaElement = /*#__PURE__*/function (_WebAudio) {
      _inherits(MediaElement, _WebAudio);

      var _super = _createSuper(MediaElement);

      /**
       * Construct the backend
       *
       * @param {WavesurferParams} params Wavesurfer parameters
       */
      function MediaElement(params) {
        var _this;

        _classCallCheck(this, MediaElement);

        _this = _super.call(this, params);
        /** @private */

        _this.params = params;
        /**
         * Initially a dummy media element to catch errors. Once `_load` is
         * called, this will contain the actual `HTMLMediaElement`.
         * @private
         */

        _this.media = {
          currentTime: 0,
          duration: 0,
          paused: true,
          playbackRate: 1,
          play: function play() {},
          pause: function pause() {},
          volume: 0
        };
        /** @private */

        _this.mediaType = params.mediaType.toLowerCase();
        /** @private */

        _this.elementPosition = params.elementPosition;
        /** @private */

        _this.peaks = null;
        /** @private */

        _this.playbackRate = 1;
        /** @private */

        _this.volume = 1;
        /** @private */

        _this.isMuted = false;
        /** @private */

        _this.buffer = null;
        /** @private */

        _this.onPlayEnd = null;
        /** @private */

        _this.mediaListeners = {};
        return _this;
      }
      /**
       * Initialise the backend, called in `wavesurfer.createBackend()`
       */


      _createClass(MediaElement, [{
        key: "init",
        value: function init() {
          this.setPlaybackRate(this.params.audioRate);
          this.createTimer();
        }
        /**
         * Attach event listeners to media element.
         */

      }, {
        key: "_setupMediaListeners",
        value: function _setupMediaListeners() {
          var _this2 = this;

          this.mediaListeners.error = function () {
            _this2.fireEvent('error', 'Error loading media element');
          };

          this.mediaListeners.canplay = function () {
            _this2.fireEvent('canplay');
          };

          this.mediaListeners.ended = function () {
            _this2.fireEvent('finish');
          }; // listen to and relay play, pause and seeked events to enable
          // playback control from the external media element


          this.mediaListeners.play = function () {
            _this2.fireEvent('play');
          };

          this.mediaListeners.pause = function () {
            _this2.fireEvent('pause');
          };

          this.mediaListeners.seeked = function (event) {
            _this2.fireEvent('seek');
          };

          this.mediaListeners.volumechange = function (event) {
            _this2.isMuted = _this2.media.muted;

            if (_this2.isMuted) {
              _this2.volume = 0;
            } else {
              _this2.volume = _this2.media.volume;
            }

            _this2.fireEvent('volume');
          }; // reset event listeners


          Object.keys(this.mediaListeners).forEach(function (id) {
            _this2.media.removeEventListener(id, _this2.mediaListeners[id]);

            _this2.media.addEventListener(id, _this2.mediaListeners[id]);
          });
        }
        /**
         * Create a timer to provide a more precise `audioprocess` event.
         */

      }, {
        key: "createTimer",
        value: function createTimer() {
          var _this3 = this;

          var onAudioProcess = function onAudioProcess() {
            if (_this3.isPaused()) {
              return;
            }

            _this3.fireEvent('audioprocess', _this3.getCurrentTime()); // Call again in the next frame


            util.frame(onAudioProcess)();
          };

          this.on('play', onAudioProcess); // Update the progress one more time to prevent it from being stuck in
          // case of lower framerates

          this.on('pause', function () {
            _this3.fireEvent('audioprocess', _this3.getCurrentTime());
          });
        }
        /**
         * Create media element with url as its source,
         * and append to container element.
         *
         * @param {string} url Path to media file
         * @param {HTMLElement} container HTML element
         * @param {number[]|Number.<Array[]>} peaks Array of peak data
         * @param {string} preload HTML 5 preload attribute value
         * @throws Will throw an error if the `url` argument is not a valid media
         * element.
         */

      }, {
        key: "load",
        value: function load(url, container, peaks, preload) {
          var media = document.createElement(this.mediaType);
          media.controls = this.params.mediaControls;
          media.autoplay = this.params.autoplay || false;
          media.preload = preload == null ? 'auto' : preload;
          media.src = url;
          media.style.width = '100%';
          var prevMedia = container.querySelector(this.mediaType);

          if (prevMedia) {
            container.removeChild(prevMedia);
          }

          container.appendChild(media);

          this._load(media, peaks, preload);
        }
        /**
         * Load existing media element.
         *
         * @param {HTMLMediaElement} elt HTML5 Audio or Video element
         * @param {number[]|Number.<Array[]>} peaks Array of peak data
         */

      }, {
        key: "loadElt",
        value: function loadElt(elt, peaks) {
          elt.controls = this.params.mediaControls;
          elt.autoplay = this.params.autoplay || false;

          this._load(elt, peaks, elt.preload);
        }
        /**
         * Method called by both `load` (from url)
         * and `loadElt` (existing media element) methods.
         *
         * @param {HTMLMediaElement} media HTML5 Audio or Video element
         * @param {number[]|Number.<Array[]>} peaks Array of peak data
         * @param {string} preload HTML 5 preload attribute value
         * @throws Will throw an error if the `media` argument is not a valid media
         * element.
         * @private
         */

      }, {
        key: "_load",
        value: function _load(media, peaks, preload) {
          // verify media element is valid
          if (!(media instanceof HTMLMediaElement) || typeof media.addEventListener === 'undefined') {
            throw new Error('media parameter is not a valid media element');
          } // load must be called manually on iOS, otherwise peaks won't draw
          // until a user interaction triggers load --> 'ready' event
          //
          // note that we avoid calling media.load here when given peaks and preload == 'none'
          // as this almost always triggers some browser fetch of the media.


          if (typeof media.load == 'function' && !(peaks && preload == 'none')) {
            // Resets the media element and restarts the media resource. Any
            // pending events are discarded. How much media data is fetched is
            // still affected by the preload attribute.
            media.load();
          }

          this.media = media;

          this._setupMediaListeners();

          this.peaks = peaks;
          this.onPlayEnd = null;
          this.buffer = null;
          this.isMuted = media.muted;
          this.setPlaybackRate(this.playbackRate);
          this.setVolume(this.volume);
        }
        /**
         * Used by `wavesurfer.isPlaying()` and `wavesurfer.playPause()`
         *
         * @return {boolean} Media paused or not
         */

      }, {
        key: "isPaused",
        value: function isPaused() {
          return !this.media || this.media.paused;
        }
        /**
         * Used by `wavesurfer.getDuration()`
         *
         * @return {number} Duration
         */

      }, {
        key: "getDuration",
        value: function getDuration() {
          if (this.explicitDuration) {
            return this.explicitDuration;
          }

          var duration = (this.buffer || this.media).duration;

          if (duration >= Infinity) {
            // streaming audio
            duration = this.media.seekable.end(0);
          }

          return duration;
        }
        /**
         * Returns the current time in seconds relative to the audio-clip's
         * duration.
         *
         * @return {number} Current time
         */

      }, {
        key: "getCurrentTime",
        value: function getCurrentTime() {
          return this.media && this.media.currentTime;
        }
        /**
         * Get the position from 0 to 1
         *
         * @return {number} Current position
         */

      }, {
        key: "getPlayedPercents",
        value: function getPlayedPercents() {
          return this.getCurrentTime() / this.getDuration() || 0;
        }
        /**
         * Get the audio source playback rate.
         *
         * @return {number} Playback rate
         */

      }, {
        key: "getPlaybackRate",
        value: function getPlaybackRate() {
          return this.playbackRate || this.media.playbackRate;
        }
        /**
         * Set the audio source playback rate.
         *
         * @param {number} value Playback rate
         */

      }, {
        key: "setPlaybackRate",
        value: function setPlaybackRate(value) {
          this.playbackRate = value || 1;
          this.media.playbackRate = this.playbackRate;
        }
        /**
         * Used by `wavesurfer.seekTo()`
         *
         * @param {number} start Position to start at in seconds
         */

      }, {
        key: "seekTo",
        value: function seekTo(start) {
          if (start != null) {
            this.media.currentTime = start;
          }

          this.clearPlayEnd();
        }
        /**
         * Plays the loaded audio region.
         *
         * @param {number} start Start offset in seconds, relative to the beginning
         * of a clip.
         * @param {number} end When to stop, relative to the beginning of a clip.
         * @emits MediaElement#play
         * @return {Promise} Result
         */

      }, {
        key: "play",
        value: function play(start, end) {
          this.seekTo(start);
          var promise = this.media.play();
          end && this.setPlayEnd(end);
          return promise;
        }
        /**
         * Pauses the loaded audio.
         *
         * @emits MediaElement#pause
         * @return {Promise} Result
         */

      }, {
        key: "pause",
        value: function pause() {
          var promise;

          if (this.media) {
            promise = this.media.pause();
          }

          this.clearPlayEnd();
          return promise;
        }
        /**
         * Set the play end
         *
         * @param {number} end Where to end
         */

      }, {
        key: "setPlayEnd",
        value: function setPlayEnd(end) {
          var _this4 = this;

          this.clearPlayEnd();

          this._onPlayEnd = function (time) {
            if (time >= end) {
              _this4.pause();

              _this4.seekTo(end);
            }
          };

          this.on('audioprocess', this._onPlayEnd);
        }
        /** @private */

      }, {
        key: "clearPlayEnd",
        value: function clearPlayEnd() {
          if (this._onPlayEnd) {
            this.un('audioprocess', this._onPlayEnd);
            this._onPlayEnd = null;
          }
        }
        /**
         * Compute the max and min value of the waveform when broken into
         * <length> subranges.
         *
         * @param {number} length How many subranges to break the waveform into.
         * @param {number} first First sample in the required range.
         * @param {number} last Last sample in the required range.
         * @return {number[]|Number.<Array[]>} Array of 2*<length> peaks or array of
         * arrays of peaks consisting of (max, min) values for each subrange.
         */

      }, {
        key: "getPeaks",
        value: function getPeaks(length, first, last) {
          if (this.buffer) {
            return _get(_getPrototypeOf(MediaElement.prototype), "getPeaks", this).call(this, length, first, last);
          }

          return this.peaks || [];
        }
        /**
         * Set the sink id for the media player
         *
         * @param {string} deviceId String value representing audio device id.
         * @returns {Promise} A Promise that resolves to `undefined` when there
         * are no errors.
         */

      }, {
        key: "setSinkId",
        value: function setSinkId(deviceId) {
          if (deviceId) {
            if (!this.media.setSinkId) {
              return Promise.reject(new Error('setSinkId is not supported in your browser'));
            }

            return this.media.setSinkId(deviceId);
          }

          return Promise.reject(new Error('Invalid deviceId: ' + deviceId));
        }
        /**
         * Get the current volume
         *
         * @return {number} value A floating point value between 0 and 1.
         */

      }, {
        key: "getVolume",
        value: function getVolume() {
          return this.volume;
        }
        /**
         * Set the audio volume
         *
         * @param {number} value A floating point value between 0 and 1.
         */

      }, {
        key: "setVolume",
        value: function setVolume(value) {
          this.volume = value; // no need to change when it's already at that volume

          if (this.media.volume !== this.volume) {
            this.media.volume = this.volume;
          }
        }
        /**
         * Enable or disable muted audio
         *
         * @since 4.0.0
         * @param {boolean} muted Specify `true` to mute audio.
         */

      }, {
        key: "setMute",
        value: function setMute(muted) {
          // This causes a volume change to be emitted too through the
          // volumechange event listener.
          this.isMuted = this.media.muted = muted;
        }
        /**
         * This is called when wavesurfer is destroyed
         *
         */

      }, {
        key: "destroy",
        value: function destroy() {
          var _this5 = this;

          this.pause();
          this.unAll();
          this.destroyed = true; // cleanup media event listeners

          Object.keys(this.mediaListeners).forEach(function (id) {
            if (_this5.media) {
              _this5.media.removeEventListener(id, _this5.mediaListeners[id]);
            }
          });

          if (this.params.removeMediaElementOnDestroy && this.media && this.media.parentNode) {
            this.media.parentNode.removeChild(this.media);
          }

          this.media = null;
        }
      }]);

      return MediaElement;
    }(_webaudio.default);

    exports.default = MediaElement;
    module.exports = exports.default;

    /***/ }),

    /***/ "./src/peakcache.js":
    /*!**************************!*\
      !*** ./src/peakcache.js ***!
      \**************************/
    /***/ ((module, exports) => {


    Object.defineProperty(exports, "__esModule", ({
      value: true
    }));
    exports.default = void 0;

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

    /**
     * Caches the decoded peaks data to improve rendering speed for large audio
     *
     * Is used if the option parameter `partialRender` is set to `true`
     */
    var PeakCache = /*#__PURE__*/function () {
      /**
       * Instantiate cache
       */
      function PeakCache() {
        _classCallCheck(this, PeakCache);

        this.clearPeakCache();
      }
      /**
       * Empty the cache
       */


      _createClass(PeakCache, [{
        key: "clearPeakCache",
        value: function clearPeakCache() {
          /**
           * Flat array with entries that are always in pairs to mark the
           * beginning and end of each subrange.  This is a convenience so we can
           * iterate over the pairs for easy set difference operations.
           * @private
           */
          this.peakCacheRanges = [];
          /**
           * Length of the entire cachable region, used for resetting the cache
           * when this changes (zoom events, for instance).
           * @private
           */

          this.peakCacheLength = -1;
        }
        /**
         * Add a range of peaks to the cache
         *
         * @param {number} length The length of the range
         * @param {number} start The x offset of the start of the range
         * @param {number} end The x offset of the end of the range
         * @return {Number.<Array[]>} Array with arrays of numbers
         */

      }, {
        key: "addRangeToPeakCache",
        value: function addRangeToPeakCache(length, start, end) {
          if (length != this.peakCacheLength) {
            this.clearPeakCache();
            this.peakCacheLength = length;
          } // Return ranges that weren't in the cache before the call.


          var uncachedRanges = [];
          var i = 0; // Skip ranges before the current start.

          while (i < this.peakCacheRanges.length && this.peakCacheRanges[i] < start) {
            i++;
          } // If |i| is even, |start| falls after an existing range.  Otherwise,
          // |start| falls between an existing range, and the uncached region
          // starts when we encounter the next node in |peakCacheRanges| or
          // |end|, whichever comes first.


          if (i % 2 == 0) {
            uncachedRanges.push(start);
          }

          while (i < this.peakCacheRanges.length && this.peakCacheRanges[i] <= end) {
            uncachedRanges.push(this.peakCacheRanges[i]);
            i++;
          } // If |i| is even, |end| is after all existing ranges.


          if (i % 2 == 0) {
            uncachedRanges.push(end);
          } // Filter out the 0-length ranges.


          uncachedRanges = uncachedRanges.filter(function (item, pos, arr) {
            if (pos == 0) {
              return item != arr[pos + 1];
            } else if (pos == arr.length - 1) {
              return item != arr[pos - 1];
            }

            return item != arr[pos - 1] && item != arr[pos + 1];
          }); // Merge the two ranges together, uncachedRanges will either contain
          // wholly new points, or duplicates of points in peakCacheRanges.  If
          // duplicates are detected, remove both and extend the range.

          this.peakCacheRanges = this.peakCacheRanges.concat(uncachedRanges);
          this.peakCacheRanges = this.peakCacheRanges.sort(function (a, b) {
            return a - b;
          }).filter(function (item, pos, arr) {
            if (pos == 0) {
              return item != arr[pos + 1];
            } else if (pos == arr.length - 1) {
              return item != arr[pos - 1];
            }

            return item != arr[pos - 1] && item != arr[pos + 1];
          }); // Push the uncached ranges into an array of arrays for ease of
          // iteration in the functions that call this.

          var uncachedRangePairs = [];

          for (i = 0; i < uncachedRanges.length; i += 2) {
            uncachedRangePairs.push([uncachedRanges[i], uncachedRanges[i + 1]]);
          }

          return uncachedRangePairs;
        }
        /**
         * For testing
         *
         * @return {Number.<Array[]>} Array with arrays of numbers
         */

      }, {
        key: "getCacheRanges",
        value: function getCacheRanges() {
          var peakCacheRangePairs = [];
          var i;

          for (i = 0; i < this.peakCacheRanges.length; i += 2) {
            peakCacheRangePairs.push([this.peakCacheRanges[i], this.peakCacheRanges[i + 1]]);
          }

          return peakCacheRangePairs;
        }
      }]);

      return PeakCache;
    }();

    exports.default = PeakCache;
    module.exports = exports.default;

    /***/ }),

    /***/ "./src/util/absMax.js":
    /*!****************************!*\
      !*** ./src/util/absMax.js ***!
      \****************************/
    /***/ ((module, exports, __webpack_require__) => {


    Object.defineProperty(exports, "__esModule", ({
      value: true
    }));
    exports.default = absMax;

    var _max = _interopRequireDefault(__webpack_require__(/*! ./max */ "./src/util/max.js"));

    var _min = _interopRequireDefault(__webpack_require__(/*! ./min */ "./src/util/min.js"));

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    /**
     * Get the largest absolute value in an array
     *
     * @param   {Array} values Array of numbers
     * @returns {Number} Largest number found
     * @example console.log(max([-3, 2, 1]), max([-3, 2, 4])); // logs 3 4
     * @since 4.3.0
     */
    function absMax(values) {
      var max = (0, _max.default)(values);
      var min = (0, _min.default)(values);
      return -min > max ? -min : max;
    }

    module.exports = exports.default;

    /***/ }),

    /***/ "./src/util/clamp.js":
    /*!***************************!*\
      !*** ./src/util/clamp.js ***!
      \***************************/
    /***/ ((module, exports) => {


    Object.defineProperty(exports, "__esModule", ({
      value: true
    }));
    exports.default = clamp;

    /**
     * Returns a number limited to the given range.
     *
     * @param {number} val The number to be limited to a range
     * @param {number} min The lower boundary of the limit range
     * @param {number} max The upper boundary of the limit range
     * @returns {number} A number in the range [min, max]
     */
    function clamp(val, min, max) {
      return Math.min(Math.max(min, val), max);
    }

    module.exports = exports.default;

    /***/ }),

    /***/ "./src/util/fetch.js":
    /*!***************************!*\
      !*** ./src/util/fetch.js ***!
      \***************************/
    /***/ ((module, exports, __webpack_require__) => {


    Object.defineProperty(exports, "__esModule", ({
      value: true
    }));
    exports.default = fetchFile;

    var _observer = _interopRequireDefault(__webpack_require__(/*! ./observer */ "./src/util/observer.js"));

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

    var ProgressHandler = /*#__PURE__*/function () {
      /**
       * Instantiate ProgressHandler
       *
       * @param {Observer} instance The `fetchFile` observer instance.
       * @param {Number} contentLength Content length.
       * @param {Response} response Response object.
       */
      function ProgressHandler(instance, contentLength, response) {
        _classCallCheck(this, ProgressHandler);

        this.instance = instance;
        this.instance._reader = response.body.getReader();
        this.total = parseInt(contentLength, 10);
        this.loaded = 0;
      }
      /**
       * A method that is called once, immediately after the `ReadableStream``
       * is constructed.
       *
       * @param {ReadableStreamDefaultController} controller Controller instance
       *     used to control the stream.
       */


      _createClass(ProgressHandler, [{
        key: "start",
        value: function start(controller) {
          var _this = this;

          var read = function read() {
            // instance._reader.read() returns a promise that resolves
            // when a value has been received
            _this.instance._reader.read().then(function (_ref) {
              var done = _ref.done,
                  value = _ref.value;

              // result objects contain two properties:
              // done  - true if the stream has already given you all its data.
              // value - some data. Always undefined when done is true.
              if (done) {
                // ensure onProgress called when content-length=0
                if (_this.total === 0) {
                  _this.instance.onProgress.call(_this.instance, {
                    loaded: _this.loaded,
                    total: _this.total,
                    lengthComputable: false
                  });
                } // no more data needs to be consumed, close the stream


                controller.close();
                return;
              }

              _this.loaded += value.byteLength;

              _this.instance.onProgress.call(_this.instance, {
                loaded: _this.loaded,
                total: _this.total,
                lengthComputable: !(_this.total === 0)
              }); // enqueue the next data chunk into our target stream


              controller.enqueue(value);
              read();
            }).catch(function (error) {
              controller.error(error);
            });
          };

          read();
        }
      }]);

      return ProgressHandler;
    }();
    /**
     * Load a file using `fetch`.
     *
     * @param {object} options Request options to use. See example below.
     * @returns {Observer} Observer instance
     * @example
     * // default options
     * let options = {
     *     url: undefined,
     *     method: 'GET',
     *     mode: 'cors',
     *     credentials: 'same-origin',
     *     cache: 'default',
     *     responseType: 'json',
     *     requestHeaders: [],
     *     redirect: 'follow',
     *     referrer: 'client'
     * };
     *
     * // override some options
     * options.url = '../media/demo.wav';

     * // available types: 'arraybuffer', 'blob', 'json' or 'text'
     * options.responseType = 'arraybuffer';
     *
     * // make fetch call
     * let request = util.fetchFile(options);
     *
     * // listen for events
     * request.on('progress', e => {
     *     console.log('progress', e);
     * });
     *
     * request.on('success', data => {
     *     console.log('success!', data);
     * });
     *
     * request.on('error', e => {
     *     console.warn('fetchFile error: ', e);
     * });
     */


    function fetchFile(options) {
      if (!options) {
        throw new Error('fetch options missing');
      } else if (!options.url) {
        throw new Error('fetch url missing');
      }

      var instance = new _observer.default();
      var fetchHeaders = new Headers();
      var fetchRequest = new Request(options.url); // add ability to abort

      instance.controller = new AbortController(); // check if headers have to be added

      if (options && options.requestHeaders) {
        // add custom request headers
        options.requestHeaders.forEach(function (header) {
          fetchHeaders.append(header.key, header.value);
        });
      } // parse fetch options


      var responseType = options.responseType || 'json';
      var fetchOptions = {
        method: options.method || 'GET',
        headers: fetchHeaders,
        mode: options.mode || 'cors',
        credentials: options.credentials || 'same-origin',
        cache: options.cache || 'default',
        redirect: options.redirect || 'follow',
        referrer: options.referrer || 'client',
        signal: instance.controller.signal
      };
      fetch(fetchRequest, fetchOptions).then(function (response) {
        // store response reference
        instance.response = response;
        var progressAvailable = true;

        if (!response.body) {
          // ReadableStream is not yet supported in this browser
          // see https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
          progressAvailable = false;
        } // Server must send CORS header "Access-Control-Expose-Headers: content-length"


        var contentLength = response.headers.get('content-length');

        if (contentLength === null) {
          // Content-Length server response header missing.
          // Don't evaluate download progress if we can't compare against a total size
          // see https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#Access-Control-Expose-Headers
          progressAvailable = false;
        }

        if (!progressAvailable) {
          // not able to check download progress so skip it
          return response;
        } // fire progress event when during load


        instance.onProgress = function (e) {
          instance.fireEvent('progress', e);
        };

        return new Response(new ReadableStream(new ProgressHandler(instance, contentLength, response)), fetchOptions);
      }).then(function (response) {
        var errMsg;

        if (response.ok) {
          switch (responseType) {
            case 'arraybuffer':
              return response.arrayBuffer();

            case 'json':
              return response.json();

            case 'blob':
              return response.blob();

            case 'text':
              return response.text();

            default:
              errMsg = 'Unknown responseType: ' + responseType;
              break;
          }
        }

        if (!errMsg) {
          errMsg = 'HTTP error status: ' + response.status;
        }

        throw new Error(errMsg);
      }).then(function (response) {
        instance.fireEvent('success', response);
      }).catch(function (error) {
        instance.fireEvent('error', error);
      }); // return the fetch request

      instance.fetchRequest = fetchRequest;
      return instance;
    }

    module.exports = exports.default;

    /***/ }),

    /***/ "./src/util/frame.js":
    /*!***************************!*\
      !*** ./src/util/frame.js ***!
      \***************************/
    /***/ ((module, exports, __webpack_require__) => {


    Object.defineProperty(exports, "__esModule", ({
      value: true
    }));
    exports.default = frame;

    var _requestAnimationFrame = _interopRequireDefault(__webpack_require__(/*! ./request-animation-frame */ "./src/util/request-animation-frame.js"));

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    /**
     * Create a function which will be called at the next requestAnimationFrame
     * cycle
     *
     * @param {function} func The function to call
     *
     * @return {func} The function wrapped within a requestAnimationFrame
     */
    function frame(func) {
      return function () {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return (0, _requestAnimationFrame.default)(function () {
          return func.apply(void 0, args);
        });
      };
    }

    module.exports = exports.default;

    /***/ }),

    /***/ "./src/util/get-id.js":
    /*!****************************!*\
      !*** ./src/util/get-id.js ***!
      \****************************/
    /***/ ((module, exports) => {


    Object.defineProperty(exports, "__esModule", ({
      value: true
    }));
    exports.default = getId;

    /**
     * Get a random prefixed ID
     *
     * @param {String} prefix Prefix to use. Default is `'wavesurfer_'`.
     * @returns {String} Random prefixed ID
     * @example
     * console.log(getId()); // logs 'wavesurfer_b5pors4ru6g'
     *
     * let prefix = 'foo-';
     * console.log(getId(prefix)); // logs 'foo-b5pors4ru6g'
     */
    function getId(prefix) {
      if (prefix === undefined) {
        prefix = 'wavesurfer_';
      }

      return prefix + Math.random().toString(32).substring(2);
    }

    module.exports = exports.default;

    /***/ }),

    /***/ "./src/util/index.js":
    /*!***************************!*\
      !*** ./src/util/index.js ***!
      \***************************/
    /***/ ((__unused_webpack_module, exports, __webpack_require__) => {


    Object.defineProperty(exports, "__esModule", ({
      value: true
    }));
    Object.defineProperty(exports, "getId", ({
      enumerable: true,
      get: function get() {
        return _getId.default;
      }
    }));
    Object.defineProperty(exports, "max", ({
      enumerable: true,
      get: function get() {
        return _max.default;
      }
    }));
    Object.defineProperty(exports, "min", ({
      enumerable: true,
      get: function get() {
        return _min.default;
      }
    }));
    Object.defineProperty(exports, "absMax", ({
      enumerable: true,
      get: function get() {
        return _absMax.default;
      }
    }));
    Object.defineProperty(exports, "Observer", ({
      enumerable: true,
      get: function get() {
        return _observer.default;
      }
    }));
    Object.defineProperty(exports, "style", ({
      enumerable: true,
      get: function get() {
        return _style.default;
      }
    }));
    Object.defineProperty(exports, "requestAnimationFrame", ({
      enumerable: true,
      get: function get() {
        return _requestAnimationFrame.default;
      }
    }));
    Object.defineProperty(exports, "frame", ({
      enumerable: true,
      get: function get() {
        return _frame.default;
      }
    }));
    Object.defineProperty(exports, "debounce", ({
      enumerable: true,
      get: function get() {
        return _debounce.default;
      }
    }));
    Object.defineProperty(exports, "preventClick", ({
      enumerable: true,
      get: function get() {
        return _preventClick.default;
      }
    }));
    Object.defineProperty(exports, "fetchFile", ({
      enumerable: true,
      get: function get() {
        return _fetch.default;
      }
    }));
    Object.defineProperty(exports, "clamp", ({
      enumerable: true,
      get: function get() {
        return _clamp.default;
      }
    }));
    Object.defineProperty(exports, "withOrientation", ({
      enumerable: true,
      get: function get() {
        return _orientation.default;
      }
    }));

    var _getId = _interopRequireDefault(__webpack_require__(/*! ./get-id */ "./src/util/get-id.js"));

    var _max = _interopRequireDefault(__webpack_require__(/*! ./max */ "./src/util/max.js"));

    var _min = _interopRequireDefault(__webpack_require__(/*! ./min */ "./src/util/min.js"));

    var _absMax = _interopRequireDefault(__webpack_require__(/*! ./absMax */ "./src/util/absMax.js"));

    var _observer = _interopRequireDefault(__webpack_require__(/*! ./observer */ "./src/util/observer.js"));

    var _style = _interopRequireDefault(__webpack_require__(/*! ./style */ "./src/util/style.js"));

    var _requestAnimationFrame = _interopRequireDefault(__webpack_require__(/*! ./request-animation-frame */ "./src/util/request-animation-frame.js"));

    var _frame = _interopRequireDefault(__webpack_require__(/*! ./frame */ "./src/util/frame.js"));

    var _debounce = _interopRequireDefault(__webpack_require__(/*! debounce */ "./node_modules/debounce/index.js"));

    var _preventClick = _interopRequireDefault(__webpack_require__(/*! ./prevent-click */ "./src/util/prevent-click.js"));

    var _fetch = _interopRequireDefault(__webpack_require__(/*! ./fetch */ "./src/util/fetch.js"));

    var _clamp = _interopRequireDefault(__webpack_require__(/*! ./clamp */ "./src/util/clamp.js"));

    var _orientation = _interopRequireDefault(__webpack_require__(/*! ./orientation */ "./src/util/orientation.js"));

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    /***/ }),

    /***/ "./src/util/max.js":
    /*!*************************!*\
      !*** ./src/util/max.js ***!
      \*************************/
    /***/ ((module, exports) => {


    Object.defineProperty(exports, "__esModule", ({
      value: true
    }));
    exports.default = max;

    /**
     * Get the largest value
     *
     * @param   {Array} values Array of numbers
     * @returns {Number} Largest number found
     * @example console.log(max([1, 2, 3])); // logs 3
     */
    function max(values) {
      var largest = -Infinity;
      Object.keys(values).forEach(function (i) {
        if (values[i] > largest) {
          largest = values[i];
        }
      });
      return largest;
    }

    module.exports = exports.default;

    /***/ }),

    /***/ "./src/util/min.js":
    /*!*************************!*\
      !*** ./src/util/min.js ***!
      \*************************/
    /***/ ((module, exports) => {


    Object.defineProperty(exports, "__esModule", ({
      value: true
    }));
    exports.default = min;

    /**
     * Get the smallest value
     *
     * @param   {Array} values Array of numbers
     * @returns {Number} Smallest number found
     * @example console.log(min([1, 2, 3])); // logs 1
     */
    function min(values) {
      var smallest = Number(Infinity);
      Object.keys(values).forEach(function (i) {
        if (values[i] < smallest) {
          smallest = values[i];
        }
      });
      return smallest;
    }

    module.exports = exports.default;

    /***/ }),

    /***/ "./src/util/observer.js":
    /*!******************************!*\
      !*** ./src/util/observer.js ***!
      \******************************/
    /***/ ((module, exports) => {


    Object.defineProperty(exports, "__esModule", ({
      value: true
    }));
    exports.default = void 0;

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

    /**
     * @typedef {Object} ListenerDescriptor
     * @property {string} name The name of the event
     * @property {function} callback The callback
     * @property {function} un The function to call to remove the listener
     */

    /**
     * Observer class
     */
    var Observer = /*#__PURE__*/function () {
      /**
       * Instantiate Observer
       */
      function Observer() {
        _classCallCheck(this, Observer);

        /**
         * @private
         * @todo Initialise the handlers here already and remove the conditional
         * assignment in `on()`
         */
        this._disabledEventEmissions = [];
        this.handlers = null;
      }
      /**
       * Attach a handler function for an event.
       *
       * @param {string} event Name of the event to listen to
       * @param {function} fn The callback to trigger when the event is fired
       * @return {ListenerDescriptor} The event descriptor
       */


      _createClass(Observer, [{
        key: "on",
        value: function on(event, fn) {
          var _this = this;

          if (!this.handlers) {
            this.handlers = {};
          }

          var handlers = this.handlers[event];

          if (!handlers) {
            handlers = this.handlers[event] = [];
          }

          handlers.push(fn); // Return an event descriptor

          return {
            name: event,
            callback: fn,
            un: function un(e, fn) {
              return _this.un(e, fn);
            }
          };
        }
        /**
         * Remove an event handler.
         *
         * @param {string} event Name of the event the listener that should be
         * removed listens to
         * @param {function} fn The callback that should be removed
         */

      }, {
        key: "un",
        value: function un(event, fn) {
          if (!this.handlers) {
            return;
          }

          var handlers = this.handlers[event];
          var i;

          if (handlers) {
            if (fn) {
              for (i = handlers.length - 1; i >= 0; i--) {
                if (handlers[i] == fn) {
                  handlers.splice(i, 1);
                }
              }
            } else {
              handlers.length = 0;
            }
          }
        }
        /**
         * Remove all event handlers.
         */

      }, {
        key: "unAll",
        value: function unAll() {
          this.handlers = null;
        }
        /**
         * Attach a handler to an event. The handler is executed at most once per
         * event type.
         *
         * @param {string} event The event to listen to
         * @param {function} handler The callback that is only to be called once
         * @return {ListenerDescriptor} The event descriptor
         */

      }, {
        key: "once",
        value: function once(event, handler) {
          var _this2 = this;

          var fn = function fn() {
            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }

            /*  eslint-disable no-invalid-this */
            handler.apply(_this2, args);
            /*  eslint-enable no-invalid-this */

            setTimeout(function () {
              _this2.un(event, fn);
            }, 0);
          };

          return this.on(event, fn);
        }
        /**
         * Disable firing a list of events by name. When specified, event handlers for any event type
         * passed in here will not be called.
         *
         * @since 4.0.0
         * @param {string[]} eventNames an array of event names to disable emissions for
         * @example
         * // disable seek and interaction events
         * wavesurfer.setDisabledEventEmissions(['seek', 'interaction']);
         */

      }, {
        key: "setDisabledEventEmissions",
        value: function setDisabledEventEmissions(eventNames) {
          this._disabledEventEmissions = eventNames;
        }
        /**
         * plugins borrow part of this class without calling the constructor,
         * so we have to be careful about _disabledEventEmissions
         */

      }, {
        key: "_isDisabledEventEmission",
        value: function _isDisabledEventEmission(event) {
          return this._disabledEventEmissions && this._disabledEventEmissions.includes(event);
        }
        /**
         * Manually fire an event
         *
         * @param {string} event The event to fire manually
         * @param {...any} args The arguments with which to call the listeners
         */

      }, {
        key: "fireEvent",
        value: function fireEvent(event) {
          for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
            args[_key2 - 1] = arguments[_key2];
          }

          if (!this.handlers || this._isDisabledEventEmission(event)) {
            return;
          }

          var handlers = this.handlers[event];
          handlers && handlers.forEach(function (fn) {
            fn.apply(void 0, args);
          });
        }
      }]);

      return Observer;
    }();

    exports.default = Observer;
    module.exports = exports.default;

    /***/ }),

    /***/ "./src/util/orientation.js":
    /*!*********************************!*\
      !*** ./src/util/orientation.js ***!
      \*********************************/
    /***/ ((module, exports) => {


    Object.defineProperty(exports, "__esModule", ({
      value: true
    }));
    exports.default = withOrientation;
    var verticalPropMap = {
      width: 'height',
      height: 'width',
      overflowX: 'overflowY',
      overflowY: 'overflowX',
      clientWidth: 'clientHeight',
      clientHeight: 'clientWidth',
      clientX: 'clientY',
      clientY: 'clientX',
      scrollWidth: 'scrollHeight',
      scrollLeft: 'scrollTop',
      offsetLeft: 'offsetTop',
      offsetTop: 'offsetLeft',
      offsetHeight: 'offsetWidth',
      offsetWidth: 'offsetHeight',
      left: 'top',
      right: 'bottom',
      top: 'left',
      bottom: 'right',
      borderRightStyle: 'borderBottomStyle',
      borderRightWidth: 'borderBottomWidth',
      borderRightColor: 'borderBottomColor'
    };
    /**
     * Convert a horizontally-oriented property name to a vertical one.
     *
     * @param {string} prop A property name
     * @param {bool} vertical Whether the element is oriented vertically
     * @returns {string} prop, converted appropriately
     */

    function mapProp(prop, vertical) {
      if (Object.prototype.hasOwnProperty.call(verticalPropMap, prop)) {
        return vertical ? verticalPropMap[prop] : prop;
      } else {
        return prop;
      }
    }

    var isProxy = Symbol("isProxy");
    /**
     * Returns an appropriately oriented object based on vertical.
     * If vertical is true, attribute getting and setting will be mapped through
     * verticalPropMap, so that e.g. getting the object's .width will give its
     * .height instead.
     * Certain methods of an oriented object will return oriented objects as well.
     * Oriented objects can't be added to the DOM directly since they are Proxy objects
     * and thus fail typechecks. Use domElement to get the actual element for this.
     *
     * @param {object} target The object to be wrapped and oriented
     * @param {bool} vertical Whether the element is oriented vertically
     * @returns {Proxy} An oriented object with attr translation via verticalAttrMap
     * @since 5.0.0
     */

    function withOrientation(target, vertical) {
      if (target[isProxy]) {
        return target;
      } else {
        return new Proxy(target, {
          get: function get(obj, prop, receiver) {
            if (prop === isProxy) {
              return true;
            } else if (prop === 'domElement') {
              return obj;
            } else if (prop === 'style') {
              return withOrientation(obj.style, vertical);
            } else if (prop === 'canvas') {
              return withOrientation(obj.canvas, vertical);
            } else if (prop === 'getBoundingClientRect') {
              return function () {
                return withOrientation(obj.getBoundingClientRect.apply(obj, arguments), vertical);
              };
            } else if (prop === 'getContext') {
              return function () {
                return withOrientation(obj.getContext.apply(obj, arguments), vertical);
              };
            } else {
              var value = obj[mapProp(prop, vertical)];
              return typeof value == 'function' ? value.bind(obj) : value;
            }
          },
          set: function set(obj, prop, value) {
            obj[mapProp(prop, vertical)] = value;
            return true;
          }
        });
      }
    }

    module.exports = exports.default;

    /***/ }),

    /***/ "./src/util/prevent-click.js":
    /*!***********************************!*\
      !*** ./src/util/prevent-click.js ***!
      \***********************************/
    /***/ ((module, exports) => {


    Object.defineProperty(exports, "__esModule", ({
      value: true
    }));
    exports.default = preventClick;

    /**
     * Stops propagation of click event and removes event listener
     *
     * @private
     * @param {object} event The click event
     */
    function preventClickHandler(event) {
      event.stopPropagation();
      document.body.removeEventListener('click', preventClickHandler, true);
    }
    /**
     * Starts listening for click event and prevent propagation
     *
     * @param {object} values Values
     */


    function preventClick(values) {
      document.body.addEventListener('click', preventClickHandler, true);
    }

    module.exports = exports.default;

    /***/ }),

    /***/ "./src/util/request-animation-frame.js":
    /*!*********************************************!*\
      !*** ./src/util/request-animation-frame.js ***!
      \*********************************************/
    /***/ ((module, exports) => {


    Object.defineProperty(exports, "__esModule", ({
      value: true
    }));
    exports.default = void 0;

    /* eslint-disable valid-jsdoc */

    /**
     * Returns the `requestAnimationFrame` function for the browser, or a shim with
     * `setTimeout` if the function is not found
     *
     * @return {function} Available `requestAnimationFrame` function for the browser
     */
    var _default = (window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback, element) {
      return setTimeout(callback, 1000 / 60);
    }).bind(window);

    exports.default = _default;
    module.exports = exports.default;

    /***/ }),

    /***/ "./src/util/style.js":
    /*!***************************!*\
      !*** ./src/util/style.js ***!
      \***************************/
    /***/ ((module, exports) => {


    Object.defineProperty(exports, "__esModule", ({
      value: true
    }));
    exports.default = style;

    /**
     * Apply a map of styles to an element
     *
     * @param {HTMLElement} el The element that the styles will be applied to
     * @param {Object} styles The map of propName: attribute, both are used as-is
     *
     * @return {HTMLElement} el
     */
    function style(el, styles) {
      Object.keys(styles).forEach(function (prop) {
        if (el.style[prop] !== styles[prop]) {
          el.style[prop] = styles[prop];
        }
      });
      return el;
    }

    module.exports = exports.default;

    /***/ }),

    /***/ "./src/wavesurfer.js":
    /*!***************************!*\
      !*** ./src/wavesurfer.js ***!
      \***************************/
    /***/ ((module, exports, __webpack_require__) => {


    function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

    Object.defineProperty(exports, "__esModule", ({
      value: true
    }));
    exports.default = void 0;

    var util = _interopRequireWildcard(__webpack_require__(/*! ./util */ "./src/util/index.js"));

    var _drawer = _interopRequireDefault(__webpack_require__(/*! ./drawer.multicanvas */ "./src/drawer.multicanvas.js"));

    var _webaudio = _interopRequireDefault(__webpack_require__(/*! ./webaudio */ "./src/webaudio.js"));

    var _mediaelement = _interopRequireDefault(__webpack_require__(/*! ./mediaelement */ "./src/mediaelement.js"));

    var _peakcache = _interopRequireDefault(__webpack_require__(/*! ./peakcache */ "./src/peakcache.js"));

    var _mediaelementWebaudio = _interopRequireDefault(__webpack_require__(/*! ./mediaelement-webaudio */ "./src/mediaelement-webaudio.js"));

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

    function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

    function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

    function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

    function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

    function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

    function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

    function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

    function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }
    /**
     * WaveSurfer core library class
     *
     * @extends {Observer}
     * @example
     * const params = {
     *   container: '#waveform',
     *   waveColor: 'violet',
     *   progressColor: 'purple'
     * };
     *
     * // initialise like this
     * const wavesurfer = WaveSurfer.create(params);
     *
     * // or like this ...
     * const wavesurfer = new WaveSurfer(params);
     * wavesurfer.init();
     *
     * // load audio file
     * wavesurfer.load('example/media/demo.wav');
     */


    var WaveSurfer = /*#__PURE__*/function (_util$Observer) {
      _inherits(WaveSurfer, _util$Observer);

      var _super = _createSuper(WaveSurfer);

      /**
       * Initialise wavesurfer instance
       *
       * @param {WavesurferParams} params Instantiation options for wavesurfer
       * @example
       * const wavesurfer = new WaveSurfer(params);
       * @returns {this} Wavesurfer instance
       */
      function WaveSurfer(params) {
        var _this;

        _classCallCheck(this, WaveSurfer);

        _this = _super.call(this);
        /**
         * Extract relevant parameters (or defaults)
         * @private
         */

        _this.defaultParams = {
          audioContext: null,
          audioScriptProcessor: null,
          audioRate: 1,
          autoCenter: true,
          autoCenterRate: 5,
          autoCenterImmediately: false,
          backend: 'WebAudio',
          backgroundColor: null,
          barHeight: 1,
          barRadius: 0,
          barGap: null,
          barMinHeight: null,
          container: null,
          cursorColor: '#333',
          cursorWidth: 1,
          dragSelection: true,
          drawingContextAttributes: {
            // Boolean that hints the user agent to reduce the latency
            // by desynchronizing the canvas paint cycle from the event
            // loop
            desynchronized: false
          },
          duration: null,
          fillParent: true,
          forceDecode: false,
          height: 128,
          hideScrollbar: false,
          interact: true,
          loopSelection: true,
          maxCanvasWidth: 4000,
          mediaContainer: null,
          mediaControls: false,
          mediaType: 'audio',
          minPxPerSec: 20,
          normalize: false,
          partialRender: false,
          pixelRatio: window.devicePixelRatio || screen.deviceXDPI / screen.logicalXDPI,
          plugins: [],
          progressColor: '#555',
          removeMediaElementOnDestroy: true,
          renderer: _drawer.default,
          responsive: false,
          rtl: false,
          scrollParent: false,
          skipLength: 2,
          splitChannels: false,
          splitChannelsOptions: {
            overlay: false,
            channelColors: {},
            filterChannels: [],
            relativeNormalization: false
          },
          vertical: false,
          waveColor: '#999',
          xhr: {}
        };
        _this.backends = {
          MediaElement: _mediaelement.default,
          WebAudio: _webaudio.default,
          MediaElementWebAudio: _mediaelementWebaudio.default
        };
        _this.util = util;
        _this.params = Object.assign({}, _this.defaultParams, params);
        _this.params.splitChannelsOptions = Object.assign({}, _this.defaultParams.splitChannelsOptions, params.splitChannelsOptions);
        /** @private */

        _this.container = 'string' == typeof params.container ? document.querySelector(_this.params.container) : _this.params.container;

        if (!_this.container) {
          throw new Error('Container element not found');
        }

        if (_this.params.mediaContainer == null) {
          /** @private */
          _this.mediaContainer = _this.container;
        } else if (typeof _this.params.mediaContainer == 'string') {
          /** @private */
          _this.mediaContainer = document.querySelector(_this.params.mediaContainer);
        } else {
          /** @private */
          _this.mediaContainer = _this.params.mediaContainer;
        }

        if (!_this.mediaContainer) {
          throw new Error('Media Container element not found');
        }

        if (_this.params.maxCanvasWidth <= 1) {
          throw new Error('maxCanvasWidth must be greater than 1');
        } else if (_this.params.maxCanvasWidth % 2 == 1) {
          throw new Error('maxCanvasWidth must be an even number');
        }

        if (_this.params.rtl === true) {
          if (_this.params.vertical === true) {
            util.style(_this.container, {
              transform: 'rotateX(180deg)'
            });
          } else {
            util.style(_this.container, {
              transform: 'rotateY(180deg)'
            });
          }
        }

        if (_this.params.backgroundColor) {
          _this.setBackgroundColor(_this.params.backgroundColor);
        }
        /**
         * @private Used to save the current volume when muting so we can
         * restore once unmuted
         * @type {number}
         */


        _this.savedVolume = 0;
        /**
         * @private The current muted state
         * @type {boolean}
         */

        _this.isMuted = false;
        /**
         * @private Will hold a list of event descriptors that need to be
         * canceled on subsequent loads of audio
         * @type {Object[]}
         */

        _this.tmpEvents = [];
        /**
         * @private Holds any running audio downloads
         * @type {Observer}
         */

        _this.currentRequest = null;
        /** @private */

        _this.arraybuffer = null;
        /** @private */

        _this.drawer = null;
        /** @private */

        _this.backend = null;
        /** @private */

        _this.peakCache = null; // cache constructor objects

        if (typeof _this.params.renderer !== 'function') {
          throw new Error('Renderer parameter is invalid');
        }
        /**
         * @private The uninitialised Drawer class
         */


        _this.Drawer = _this.params.renderer;
        /**
         * @private The uninitialised Backend class
         */
        // Back compat

        if (_this.params.backend == 'AudioElement') {
          _this.params.backend = 'MediaElement';
        }

        if ((_this.params.backend == 'WebAudio' || _this.params.backend === 'MediaElementWebAudio') && !_webaudio.default.prototype.supportsWebAudio.call(null)) {
          _this.params.backend = 'MediaElement';
        }

        _this.Backend = _this.backends[_this.params.backend];
        /**
         * @private map of plugin names that are currently initialised
         */

        _this.initialisedPluginList = {};
        /** @private */

        _this.isDestroyed = false;
        /**
         * Get the current ready status.
         *
         * @example const isReady = wavesurfer.isReady;
         * @return {boolean}
         */

        _this.isReady = false; // responsive debounced event listener. If this.params.responsive is not
        // set, this is never called. Use 100ms or this.params.responsive as
        // timeout for the debounce function.

        var prevWidth = 0;
        _this._onResize = util.debounce(function () {
          if (prevWidth != _this.drawer.wrapper.clientWidth && !_this.params.scrollParent) {
            prevWidth = _this.drawer.wrapper.clientWidth;

            _this.drawer.fireEvent('redraw');
          }
        }, typeof _this.params.responsive === 'number' ? _this.params.responsive : 100);
        return _possibleConstructorReturn(_this, _assertThisInitialized(_this));
      }
      /**
       * Initialise the wave
       *
       * @example
       * var wavesurfer = new WaveSurfer(params);
       * wavesurfer.init();
       * @return {this} The wavesurfer instance
       */


      _createClass(WaveSurfer, [{
        key: "init",
        value: function init() {
          this.registerPlugins(this.params.plugins);
          this.createDrawer();
          this.createBackend();
          this.createPeakCache();
          return this;
        }
        /**
         * Add and initialise array of plugins (if `plugin.deferInit` is falsey),
         * this function is called in the init function of wavesurfer
         *
         * @param {PluginDefinition[]} plugins An array of plugin definitions
         * @emits {WaveSurfer#plugins-registered} Called with the array of plugin definitions
         * @return {this} The wavesurfer instance
         */

      }, {
        key: "registerPlugins",
        value: function registerPlugins(plugins) {
          var _this2 = this;

          // first instantiate all the plugins
          plugins.forEach(function (plugin) {
            return _this2.addPlugin(plugin);
          }); // now run the init functions

          plugins.forEach(function (plugin) {
            // call init function of the plugin if deferInit is falsey
            // in that case you would manually use initPlugins()
            if (!plugin.deferInit) {
              _this2.initPlugin(plugin.name);
            }
          });
          this.fireEvent('plugins-registered', plugins);
          return this;
        }
        /**
         * Get a map of plugin names that are currently initialised
         *
         * @example wavesurfer.getPlugins();
         * @return {Object} Object with plugin names
         */

      }, {
        key: "getActivePlugins",
        value: function getActivePlugins() {
          return this.initialisedPluginList;
        }
        /**
         * Add a plugin object to wavesurfer
         *
         * @param {PluginDefinition} plugin A plugin definition
         * @emits {WaveSurfer#plugin-added} Called with the name of the plugin that was added
         * @example wavesurfer.addPlugin(WaveSurfer.minimap());
         * @return {this} The wavesurfer instance
         */

      }, {
        key: "addPlugin",
        value: function addPlugin(plugin) {
          var _this3 = this;

          if (!plugin.name) {
            throw new Error('Plugin does not have a name!');
          }

          if (!plugin.instance) {
            throw new Error("Plugin ".concat(plugin.name, " does not have an instance property!"));
          } // staticProps properties are applied to wavesurfer instance


          if (plugin.staticProps) {
            Object.keys(plugin.staticProps).forEach(function (pluginStaticProp) {
              /**
               * Properties defined in a plugin definition's `staticProps` property are added as
               * staticProps properties of the WaveSurfer instance
               */
              _this3[pluginStaticProp] = plugin.staticProps[pluginStaticProp];
            });
          }

          var Instance = plugin.instance; // turn the plugin instance into an observer

          var observerPrototypeKeys = Object.getOwnPropertyNames(util.Observer.prototype);
          observerPrototypeKeys.forEach(function (key) {
            Instance.prototype[key] = util.Observer.prototype[key];
          });
          /**
           * Instantiated plugin classes are added as a property of the wavesurfer
           * instance
           * @type {Object}
           */

          this[plugin.name] = new Instance(plugin.params || {}, this);
          this.fireEvent('plugin-added', plugin.name);
          return this;
        }
        /**
         * Initialise a plugin
         *
         * @param {string} name A plugin name
         * @emits WaveSurfer#plugin-initialised
         * @example wavesurfer.initPlugin('minimap');
         * @return {this} The wavesurfer instance
         */

      }, {
        key: "initPlugin",
        value: function initPlugin(name) {
          if (!this[name]) {
            throw new Error("Plugin ".concat(name, " has not been added yet!"));
          }

          if (this.initialisedPluginList[name]) {
            // destroy any already initialised plugins
            this.destroyPlugin(name);
          }

          this[name].init();
          this.initialisedPluginList[name] = true;
          this.fireEvent('plugin-initialised', name);
          return this;
        }
        /**
         * Destroy a plugin
         *
         * @param {string} name A plugin name
         * @emits WaveSurfer#plugin-destroyed
         * @example wavesurfer.destroyPlugin('minimap');
         * @returns {this} The wavesurfer instance
         */

      }, {
        key: "destroyPlugin",
        value: function destroyPlugin(name) {
          if (!this[name]) {
            throw new Error("Plugin ".concat(name, " has not been added yet and cannot be destroyed!"));
          }

          if (!this.initialisedPluginList[name]) {
            throw new Error("Plugin ".concat(name, " is not active and cannot be destroyed!"));
          }

          if (typeof this[name].destroy !== 'function') {
            throw new Error("Plugin ".concat(name, " does not have a destroy function!"));
          }

          this[name].destroy();
          delete this.initialisedPluginList[name];
          this.fireEvent('plugin-destroyed', name);
          return this;
        }
        /**
         * Destroy all initialised plugins. Convenience function to use when
         * wavesurfer is removed
         *
         * @private
         */

      }, {
        key: "destroyAllPlugins",
        value: function destroyAllPlugins() {
          var _this4 = this;

          Object.keys(this.initialisedPluginList).forEach(function (name) {
            return _this4.destroyPlugin(name);
          });
        }
        /**
         * Create the drawer and draw the waveform
         *
         * @private
         * @emits WaveSurfer#drawer-created
         */

      }, {
        key: "createDrawer",
        value: function createDrawer() {
          var _this5 = this;

          this.drawer = new this.Drawer(this.container, this.params);
          this.drawer.init();
          this.fireEvent('drawer-created', this.drawer);

          if (this.params.responsive !== false) {
            window.addEventListener('resize', this._onResize, true);
            window.addEventListener('orientationchange', this._onResize, true);
          }

          this.drawer.on('redraw', function () {
            _this5.drawBuffer();

            _this5.drawer.progress(_this5.backend.getPlayedPercents());
          }); // Click-to-seek

          this.drawer.on('click', function (e, progress) {
            setTimeout(function () {
              return _this5.seekTo(progress);
            }, 0);
          }); // Relay the scroll event from the drawer

          this.drawer.on('scroll', function (e) {
            if (_this5.params.partialRender) {
              _this5.drawBuffer();
            }

            _this5.fireEvent('scroll', e);
          });
        }
        /**
         * Create the backend
         *
         * @private
         * @emits WaveSurfer#backend-created
         */

      }, {
        key: "createBackend",
        value: function createBackend() {
          var _this6 = this;

          if (this.backend) {
            this.backend.destroy();
          }

          this.backend = new this.Backend(this.params);
          this.backend.init();
          this.fireEvent('backend-created', this.backend);
          this.backend.on('finish', function () {
            _this6.drawer.progress(_this6.backend.getPlayedPercents());

            _this6.fireEvent('finish');
          });
          this.backend.on('play', function () {
            return _this6.fireEvent('play');
          });
          this.backend.on('pause', function () {
            return _this6.fireEvent('pause');
          });
          this.backend.on('audioprocess', function (time) {
            _this6.drawer.progress(_this6.backend.getPlayedPercents());

            _this6.fireEvent('audioprocess', time);
          }); // only needed for MediaElement and MediaElementWebAudio backend

          if (this.params.backend === 'MediaElement' || this.params.backend === 'MediaElementWebAudio') {
            this.backend.on('seek', function () {
              _this6.drawer.progress(_this6.backend.getPlayedPercents());
            });
            this.backend.on('volume', function () {
              var newVolume = _this6.getVolume();

              _this6.fireEvent('volume', newVolume);

              if (_this6.backend.isMuted !== _this6.isMuted) {
                _this6.isMuted = _this6.backend.isMuted;

                _this6.fireEvent('mute', _this6.isMuted);
              }
            });
          }
        }
        /**
         * Create the peak cache
         *
         * @private
         */

      }, {
        key: "createPeakCache",
        value: function createPeakCache() {
          if (this.params.partialRender) {
            this.peakCache = new _peakcache.default();
          }
        }
        /**
         * Get the duration of the audio clip
         *
         * @example const duration = wavesurfer.getDuration();
         * @return {number} Duration in seconds
         */

      }, {
        key: "getDuration",
        value: function getDuration() {
          return this.backend.getDuration();
        }
        /**
         * Get the current playback position
         *
         * @example const currentTime = wavesurfer.getCurrentTime();
         * @return {number} Playback position in seconds
         */

      }, {
        key: "getCurrentTime",
        value: function getCurrentTime() {
          return this.backend.getCurrentTime();
        }
        /**
         * Set the current play time in seconds.
         *
         * @param {number} seconds A positive number in seconds. E.g. 10 means 10
         * seconds, 60 means 1 minute
         */

      }, {
        key: "setCurrentTime",
        value: function setCurrentTime(seconds) {
          if (seconds >= this.getDuration()) {
            this.seekTo(1);
          } else {
            this.seekTo(seconds / this.getDuration());
          }
        }
        /**
         * Starts playback from the current position. Optional start and end
         * measured in seconds can be used to set the range of audio to play.
         *
         * @param {?number} start Position to start at
         * @param {?number} end Position to end at
         * @emits WaveSurfer#interaction
         * @return {Promise} Result of the backend play method
         * @example
         * // play from second 1 to 5
         * wavesurfer.play(1, 5);
         */

      }, {
        key: "play",
        value: function play(start, end) {
          var _this7 = this;

          this.fireEvent('interaction', function () {
            return _this7.play(start, end);
          });
          return this.backend.play(start, end);
        }
        /**
         * Set a point in seconds for playback to stop at.
         *
         * @param {number} position Position (in seconds) to stop at
         * @version 3.3.0
         */

      }, {
        key: "setPlayEnd",
        value: function setPlayEnd(position) {
          this.backend.setPlayEnd(position);
        }
        /**
         * Stops and pauses playback
         *
         * @example wavesurfer.pause();
         * @return {Promise} Result of the backend pause method
         */

      }, {
        key: "pause",
        value: function pause() {
          if (!this.backend.isPaused()) {
            return this.backend.pause();
          }
        }
        /**
         * Toggle playback
         *
         * @example wavesurfer.playPause();
         * @return {Promise} Result of the backend play or pause method
         */

      }, {
        key: "playPause",
        value: function playPause() {
          return this.backend.isPaused() ? this.play() : this.pause();
        }
        /**
         * Get the current playback state
         *
         * @example const isPlaying = wavesurfer.isPlaying();
         * @return {boolean} False if paused, true if playing
         */

      }, {
        key: "isPlaying",
        value: function isPlaying() {
          return !this.backend.isPaused();
        }
        /**
         * Skip backward
         *
         * @param {?number} seconds Amount to skip back, if not specified `skipLength`
         * is used
         * @example wavesurfer.skipBackward();
         */

      }, {
        key: "skipBackward",
        value: function skipBackward(seconds) {
          this.skip(-seconds || -this.params.skipLength);
        }
        /**
         * Skip forward
         *
         * @param {?number} seconds Amount to skip back, if not specified `skipLength`
         * is used
         * @example wavesurfer.skipForward();
         */

      }, {
        key: "skipForward",
        value: function skipForward(seconds) {
          this.skip(seconds || this.params.skipLength);
        }
        /**
         * Skip a number of seconds from the current position (use a negative value
         * to go backwards).
         *
         * @param {number} offset Amount to skip back or forwards
         * @example
         * // go back 2 seconds
         * wavesurfer.skip(-2);
         */

      }, {
        key: "skip",
        value: function skip(offset) {
          var duration = this.getDuration() || 1;
          var position = this.getCurrentTime() || 0;
          position = Math.max(0, Math.min(duration, position + (offset || 0)));
          this.seekAndCenter(position / duration);
        }
        /**
         * Seeks to a position and centers the view
         *
         * @param {number} progress Between 0 (=beginning) and 1 (=end)
         * @example
         * // seek and go to the middle of the audio
         * wavesurfer.seekTo(0.5);
         */

      }, {
        key: "seekAndCenter",
        value: function seekAndCenter(progress) {
          this.seekTo(progress);
          this.drawer.recenter(progress);
        }
        /**
         * Seeks to a position
         *
         * @param {number} progress Between 0 (=beginning) and 1 (=end)
         * @emits WaveSurfer#interaction
         * @emits WaveSurfer#seek
         * @example
         * // seek to the middle of the audio
         * wavesurfer.seekTo(0.5);
         */

      }, {
        key: "seekTo",
        value: function seekTo(progress) {
          var _this8 = this;

          // return an error if progress is not a number between 0 and 1
          if (typeof progress !== 'number' || !isFinite(progress) || progress < 0 || progress > 1) {
            throw new Error('Error calling wavesurfer.seekTo, parameter must be a number between 0 and 1!');
          }

          this.fireEvent('interaction', function () {
            return _this8.seekTo(progress);
          });
          var isWebAudioBackend = this.params.backend === 'WebAudio';
          var paused = this.backend.isPaused();

          if (isWebAudioBackend && !paused) {
            this.backend.pause();
          } // avoid small scrolls while paused seeking


          var oldScrollParent = this.params.scrollParent;
          this.params.scrollParent = false;
          this.backend.seekTo(progress * this.getDuration());
          this.drawer.progress(progress);

          if (isWebAudioBackend && !paused) {
            this.backend.play();
          }

          this.params.scrollParent = oldScrollParent;
          this.fireEvent('seek', progress);
        }
        /**
         * Stops and goes to the beginning.
         *
         * @example wavesurfer.stop();
         */

      }, {
        key: "stop",
        value: function stop() {
          this.pause();
          this.seekTo(0);
          this.drawer.progress(0);
        }
        /**
         * Sets the ID of the audio device to use for output and returns a Promise.
         *
         * @param {string} deviceId String value representing underlying output
         * device
         * @returns {Promise} `Promise` that resolves to `undefined` when there are
         * no errors detected.
         */

      }, {
        key: "setSinkId",
        value: function setSinkId(deviceId) {
          return this.backend.setSinkId(deviceId);
        }
        /**
         * Set the playback volume.
         *
         * @param {number} newVolume A value between 0 and 1, 0 being no
         * volume and 1 being full volume.
         * @emits WaveSurfer#volume
         */

      }, {
        key: "setVolume",
        value: function setVolume(newVolume) {
          this.backend.setVolume(newVolume);
          this.fireEvent('volume', newVolume);
        }
        /**
         * Get the playback volume.
         *
         * @return {number} A value between 0 and 1, 0 being no
         * volume and 1 being full volume.
         */

      }, {
        key: "getVolume",
        value: function getVolume() {
          return this.backend.getVolume();
        }
        /**
         * Set the playback rate.
         *
         * @param {number} rate A positive number. E.g. 0.5 means half the normal
         * speed, 2 means double speed and so on.
         * @example wavesurfer.setPlaybackRate(2);
         */

      }, {
        key: "setPlaybackRate",
        value: function setPlaybackRate(rate) {
          this.backend.setPlaybackRate(rate);
        }
        /**
         * Get the playback rate.
         *
         * @return {number} The current playback rate.
         */

      }, {
        key: "getPlaybackRate",
        value: function getPlaybackRate() {
          return this.backend.getPlaybackRate();
        }
        /**
         * Toggle the volume on and off. If not currently muted it will save the
         * current volume value and turn the volume off. If currently muted then it
         * will restore the volume to the saved value, and then rest the saved
         * value.
         *
         * @example wavesurfer.toggleMute();
         */

      }, {
        key: "toggleMute",
        value: function toggleMute() {
          this.setMute(!this.isMuted);
        }
        /**
         * Enable or disable muted audio
         *
         * @param {boolean} mute Specify `true` to mute audio.
         * @emits WaveSurfer#volume
         * @emits WaveSurfer#mute
         * @example
         * // unmute
         * wavesurfer.setMute(false);
         * console.log(wavesurfer.getMute()) // logs false
         */

      }, {
        key: "setMute",
        value: function setMute(mute) {
          // ignore all muting requests if the audio is already in that state
          if (mute === this.isMuted) {
            this.fireEvent('mute', this.isMuted);
            return;
          }

          if (this.backend.setMute) {
            // Backends such as the MediaElement backend have their own handling
            // of mute, let them handle it.
            this.backend.setMute(mute);
            this.isMuted = mute;
          } else {
            if (mute) {
              // If currently not muted then save current volume,
              // turn off the volume and update the mute properties
              this.savedVolume = this.backend.getVolume();
              this.backend.setVolume(0);
              this.isMuted = true;
              this.fireEvent('volume', 0);
            } else {
              // If currently muted then restore to the saved volume
              // and update the mute properties
              this.backend.setVolume(this.savedVolume);
              this.isMuted = false;
              this.fireEvent('volume', this.savedVolume);
            }
          }

          this.fireEvent('mute', this.isMuted);
        }
        /**
         * Get the current mute status.
         *
         * @example const isMuted = wavesurfer.getMute();
         * @return {boolean} Current mute status
         */

      }, {
        key: "getMute",
        value: function getMute() {
          return this.isMuted;
        }
        /**
         * Get the list of current set filters as an array.
         *
         * Filters must be set with setFilters method first
         *
         * @return {array} List of enabled filters
         */

      }, {
        key: "getFilters",
        value: function getFilters() {
          return this.backend.filters || [];
        }
        /**
         * Toggles `scrollParent` and redraws
         *
         * @example wavesurfer.toggleScroll();
         */

      }, {
        key: "toggleScroll",
        value: function toggleScroll() {
          this.params.scrollParent = !this.params.scrollParent;
          this.drawBuffer();
        }
        /**
         * Toggle mouse interaction
         *
         * @example wavesurfer.toggleInteraction();
         */

      }, {
        key: "toggleInteraction",
        value: function toggleInteraction() {
          this.params.interact = !this.params.interact;
        }
        /**
         * Get the fill color of the waveform after the cursor.
         *
         * @return {string} A CSS color string.
         */

      }, {
        key: "getWaveColor",
        value: function getWaveColor() {
          return this.params.waveColor;
        }
        /**
         * Set the fill color of the waveform after the cursor.
         *
         * @param {string} color A CSS color string.
         * @example wavesurfer.setWaveColor('#ddd');
         */

      }, {
        key: "setWaveColor",
        value: function setWaveColor(color) {
          this.params.waveColor = color;
          this.drawBuffer();
        }
        /**
         * Get the fill color of the waveform behind the cursor.
         *
         * @return {string} A CSS color string.
         */

      }, {
        key: "getProgressColor",
        value: function getProgressColor() {
          return this.params.progressColor;
        }
        /**
         * Set the fill color of the waveform behind the cursor.
         *
         * @param {string} color A CSS color string.
         * @example wavesurfer.setProgressColor('#400');
         */

      }, {
        key: "setProgressColor",
        value: function setProgressColor(color) {
          this.params.progressColor = color;
          this.drawBuffer();
        }
        /**
         * Get the background color of the waveform container.
         *
         * @return {string} A CSS color string.
         */

      }, {
        key: "getBackgroundColor",
        value: function getBackgroundColor() {
          return this.params.backgroundColor;
        }
        /**
         * Set the background color of the waveform container.
         *
         * @param {string} color A CSS color string.
         * @example wavesurfer.setBackgroundColor('#FF00FF');
         */

      }, {
        key: "setBackgroundColor",
        value: function setBackgroundColor(color) {
          this.params.backgroundColor = color;
          util.style(this.container, {
            background: this.params.backgroundColor
          });
        }
        /**
         * Get the fill color of the cursor indicating the playhead
         * position.
         *
         * @return {string} A CSS color string.
         */

      }, {
        key: "getCursorColor",
        value: function getCursorColor() {
          return this.params.cursorColor;
        }
        /**
         * Set the fill color of the cursor indicating the playhead
         * position.
         *
         * @param {string} color A CSS color string.
         * @example wavesurfer.setCursorColor('#222');
         */

      }, {
        key: "setCursorColor",
        value: function setCursorColor(color) {
          this.params.cursorColor = color;
          this.drawer.updateCursor();
        }
        /**
         * Get the height of the waveform.
         *
         * @return {number} Height measured in pixels.
         */

      }, {
        key: "getHeight",
        value: function getHeight() {
          return this.params.height;
        }
        /**
         * Set the height of the waveform.
         *
         * @param {number} height Height measured in pixels.
         * @example wavesurfer.setHeight(200);
         */

      }, {
        key: "setHeight",
        value: function setHeight(height) {
          this.params.height = height;
          this.drawer.setHeight(height * this.params.pixelRatio);
          this.drawBuffer();
        }
        /**
         * Hide channels from being drawn on the waveform if splitting channels.
         *
         * For example, if we want to draw only the peaks for the right stereo channel:
         *
         * const wavesurfer = new WaveSurfer.create({...splitChannels: true});
         * wavesurfer.load('stereo_audio.mp3');
         *
         * wavesurfer.setFilteredChannel([0]); <-- hide left channel peaks.
         *
         * @param {array} channelIndices Channels to be filtered out from drawing.
         * @version 4.0.0
         */

      }, {
        key: "setFilteredChannels",
        value: function setFilteredChannels(channelIndices) {
          this.params.splitChannelsOptions.filterChannels = channelIndices;
          this.drawBuffer();
        }
        /**
         * Get the correct peaks for current wave view-port and render wave
         *
         * @private
         * @emits WaveSurfer#redraw
         */

      }, {
        key: "drawBuffer",
        value: function drawBuffer() {
          var nominalWidth = Math.round(this.getDuration() * this.params.minPxPerSec * this.params.pixelRatio);
          var parentWidth = this.drawer.getWidth();
          var width = nominalWidth; // always start at 0 after zooming for scrolling : issue redraw left part

          var start = 0;
          var end = Math.max(start + parentWidth, width); // Fill container

          if (this.params.fillParent && (!this.params.scrollParent || nominalWidth < parentWidth)) {
            width = parentWidth;
            start = 0;
            end = width;
          }

          var peaks;

          if (this.params.partialRender) {
            var newRanges = this.peakCache.addRangeToPeakCache(width, start, end);
            var i;

            for (i = 0; i < newRanges.length; i++) {
              peaks = this.backend.getPeaks(width, newRanges[i][0], newRanges[i][1]);
              this.drawer.drawPeaks(peaks, width, newRanges[i][0], newRanges[i][1]);
            }
          } else {
            peaks = this.backend.getPeaks(width, start, end);

            if (peaks.length > 0) {
              this.empty();
              this.drawer.drawPeaks(peaks, width, start, end);
            }

            this.fireEvent('peaks-ready', peaks);
          }

          if (peaks.length > 0) {
            this.fireEvent('redraw', peaks, width);
          }
        }
        /**
         * Horizontally zooms the waveform in and out. It also changes the parameter
         * `minPxPerSec` and enables the `scrollParent` option. Calling the function
         * with a falsey parameter will reset the zoom state.
         *
         * @param {?number} pxPerSec Number of horizontal pixels per second of
         * audio, if none is set the waveform returns to unzoomed state
         * @emits WaveSurfer#zoom
         * @example wavesurfer.zoom(20);
         */

      }, {
        key: "zoom",
        value: function zoom(pxPerSec) {
          if (!pxPerSec) {
            this.params.minPxPerSec = this.defaultParams.minPxPerSec;
            this.params.scrollParent = false;
          } else {
            this.params.minPxPerSec = pxPerSec;
            this.params.scrollParent = true;
          }

          this.drawBuffer();
          this.drawer.progress(this.backend.getPlayedPercents());
          this.drawer.recenter(this.getCurrentTime() / this.getDuration());
          this.fireEvent('zoom', pxPerSec);
        }
        /**
         * Decode buffer and load
         *
         * @private
         * @param {ArrayBuffer} arraybuffer Buffer to process
         */

      }, {
        key: "loadArrayBuffer",
        value: function loadArrayBuffer(arraybuffer) {
          var _this9 = this;

          this.decodeArrayBuffer(arraybuffer, function (data) {
            if (!_this9.isDestroyed) {
              _this9.loadDecodedBuffer(data);
            }
          });
        }
        /**
         * Directly load an externally decoded AudioBuffer
         *
         * @private
         * @param {AudioBuffer} buffer Buffer to process
         * @emits WaveSurfer#ready
         */

      }, {
        key: "loadDecodedBuffer",
        value: function loadDecodedBuffer(buffer) {
          this.backend.load(buffer);
          this.drawBuffer();
          this.isReady = true;
          this.fireEvent('ready');
        }
        /**
         * Loads audio data from a Blob or File object
         *
         * @param {Blob|File} blob Audio data
         * @example
         */

      }, {
        key: "loadBlob",
        value: function loadBlob(blob) {
          var _this10 = this;

          // Create file reader
          var reader = new FileReader();
          reader.addEventListener('progress', function (e) {
            return _this10.onProgress(e);
          });
          reader.addEventListener('load', function (e) {
            return _this10.loadArrayBuffer(e.target.result);
          });
          reader.addEventListener('error', function () {
            return _this10.fireEvent('error', 'Error reading file');
          });
          reader.readAsArrayBuffer(blob);
          this.empty();
        }
        /**
         * Loads audio and re-renders the waveform.
         *
         * @param {string|HTMLMediaElement} url The url of the audio file or the
         * audio element with the audio
         * @param {number[]|Number.<Array[]>} peaks Wavesurfer does not have to decode
         * the audio to render the waveform if this is specified
         * @param {?string} preload (Use with backend `MediaElement` and `MediaElementWebAudio`)
         * `'none'|'metadata'|'auto'` Preload attribute for the media element
         * @param {?number} duration The duration of the audio. This is used to
         * render the peaks data in the correct size for the audio duration (as
         * befits the current `minPxPerSec` and zoom value) without having to decode
         * the audio.
         * @returns {void}
         * @throws Will throw an error if the `url` argument is empty.
         * @example
         * // uses fetch or media element to load file (depending on backend)
         * wavesurfer.load('http://example.com/demo.wav');
         *
         * // setting preload attribute with media element backend and supplying
         * // peaks
         * wavesurfer.load(
         *   'http://example.com/demo.wav',
         *   [0.0218, 0.0183, 0.0165, 0.0198, 0.2137, 0.2888],
         *   true
         * );
         */

      }, {
        key: "load",
        value: function load(url, peaks, preload, duration) {
          if (!url) {
            throw new Error('url parameter cannot be empty');
          } // this.empty()


          if (preload) {
            // check whether the preload attribute will be usable and if not log
            // a warning listing the reasons why not and nullify the variable
            var preloadIgnoreReasons = {
              "Preload is not 'auto', 'none' or 'metadata'": ['auto', 'metadata', 'none'].indexOf(preload) === -1,
              'Peaks are not provided': !peaks,
              "Backend is not of type 'MediaElement' or 'MediaElementWebAudio'": ['MediaElement', 'MediaElementWebAudio'].indexOf(this.params.backend) === -1,
              'Url is not of type string': typeof url !== 'string'
            };
            var activeReasons = Object.keys(preloadIgnoreReasons).filter(function (reason) {
              return preloadIgnoreReasons[reason];
            });

            if (activeReasons.length) {
              // eslint-disable-next-line no-console
              console.warn('Preload parameter of wavesurfer.load will be ignored because:\n\t- ' + activeReasons.join('\n\t- ')); // stop invalid values from being used

              preload = null;
            }
          } // loadBuffer(url, peaks, duration) requires that url is a string
          // but users can pass in a HTMLMediaElement to WaveSurfer


          if (this.params.backend === 'WebAudio' && url instanceof HTMLMediaElement) {
            url = url.src;
          }

          switch (this.params.backend) {
            case 'WebAudio':
              return this.loadBuffer(url, peaks, duration);

            case 'MediaElement':
            case 'MediaElementWebAudio':
              return this.loadMediaElement(url, peaks, preload, duration);
          }
        }
        /**
         * Loads audio using Web Audio buffer backend.
         *
         * @private
         * @emits WaveSurfer#waveform-ready
         * @param {string} url URL of audio file
         * @param {number[]|Number.<Array[]>} peaks Peaks data
         * @param {?number} duration Optional duration of audio file
         * @returns {void}
         */

      }, {
        key: "loadBuffer",
        value: function loadBuffer(url, peaks, duration) {
          var _this11 = this;

          var load = function load(action) {
            if (action) {
              _this11.tmpEvents.push(_this11.once('ready', action));
            }

            return _this11.getArrayBuffer(url, function (data) {
              return _this11.loadArrayBuffer(data);
            });
          };

          if (peaks) {
            this.backend.setPeaks(peaks, duration);
            this.drawBuffer();
            this.fireEvent('waveform-ready');
            this.tmpEvents.push(this.once('interaction', load));
          } else {
            return load();
          }
        }
        /**
         * Either create a media element, or load an existing media element.
         *
         * @private
         * @emits WaveSurfer#waveform-ready
         * @param {string|HTMLMediaElement} urlOrElt Either a path to a media file, or an
         * existing HTML5 Audio/Video Element
         * @param {number[]|Number.<Array[]>} peaks Array of peaks. Required to bypass web audio
         * dependency
         * @param {?boolean} preload Set to true if the preload attribute of the
         * audio element should be enabled
         * @param {?number} duration Optional duration of audio file
         */

      }, {
        key: "loadMediaElement",
        value: function loadMediaElement(urlOrElt, peaks, preload, duration) {
          var _this12 = this;

          var url = urlOrElt;

          if (typeof urlOrElt === 'string') {
            this.backend.load(url, this.mediaContainer, peaks, preload);
          } else {
            var elt = urlOrElt;
            this.backend.loadElt(elt, peaks); // If peaks are not provided,
            // url = element.src so we can get peaks with web audio

            url = elt.src;
          }

          this.tmpEvents.push(this.backend.once('canplay', function () {
            // ignore when backend was already destroyed
            if (!_this12.backend.destroyed) {
              _this12.drawBuffer();

              _this12.isReady = true;

              _this12.fireEvent('ready');
            }
          }), this.backend.once('error', function (err) {
            return _this12.fireEvent('error', err);
          })); // If peaks are provided, render them and fire the `waveform-ready` event.

          if (peaks) {
            this.backend.setPeaks(peaks, duration);
            this.drawBuffer();
            this.fireEvent('waveform-ready');
          } // If no pre-decoded peaks are provided, or are provided with
          // forceDecode flag, attempt to download the audio file and decode it
          // with Web Audio.


          if ((!peaks || this.params.forceDecode) && this.backend.supportsWebAudio()) {
            this.getArrayBuffer(url, function (arraybuffer) {
              _this12.decodeArrayBuffer(arraybuffer, function (buffer) {
                _this12.backend.buffer = buffer;

                _this12.backend.setPeaks(null);

                _this12.drawBuffer();

                _this12.fireEvent('waveform-ready');
              });
            });
          }
        }
        /**
         * Decode an array buffer and pass data to a callback
         *
         * @private
         * @param {Object} arraybuffer The array buffer to decode
         * @param {function} callback The function to call on complete
         */

      }, {
        key: "decodeArrayBuffer",
        value: function decodeArrayBuffer(arraybuffer, callback) {
          var _this13 = this;

          this.arraybuffer = arraybuffer;
          this.backend.decodeArrayBuffer(arraybuffer, function (data) {
            // Only use the decoded data if we haven't been destroyed or
            // another decode started in the meantime
            if (!_this13.isDestroyed && _this13.arraybuffer == arraybuffer) {
              callback(data);
              _this13.arraybuffer = null;
            }
          }, function () {
            return _this13.fireEvent('error', 'Error decoding audiobuffer');
          });
        }
        /**
         * Load an array buffer using fetch and pass the result to a callback
         *
         * @param {string} url The URL of the file object
         * @param {function} callback The function to call on complete
         * @returns {util.fetchFile} fetch call
         * @private
         */

      }, {
        key: "getArrayBuffer",
        value: function getArrayBuffer(url, callback) {
          var _this14 = this;

          var options = Object.assign({
            url: url,
            responseType: 'arraybuffer'
          }, this.params.xhr);
          var request = util.fetchFile(options);
          this.currentRequest = request;
          this.tmpEvents.push(request.on('progress', function (e) {
            _this14.onProgress(e);
          }), request.on('success', function (data) {
            callback(data);
            _this14.currentRequest = null;
          }), request.on('error', function (e) {
            _this14.fireEvent('error', e);

            _this14.currentRequest = null;
          }));
          return request;
        }
        /**
         * Called while the audio file is loading
         *
         * @private
         * @param {Event} e Progress event
         * @emits WaveSurfer#loading
         */

      }, {
        key: "onProgress",
        value: function onProgress(e) {
          var percentComplete;

          if (e.lengthComputable) {
            percentComplete = e.loaded / e.total;
          } else {
            // Approximate progress with an asymptotic
            // function, and assume downloads in the 1-3 MB range.
            percentComplete = e.loaded / (e.loaded + 1000000);
          }

          this.fireEvent('loading', Math.round(percentComplete * 100), e.target);
        }
        /**
         * Exports PCM data into a JSON array and optionally opens in a new window
         * as valid JSON Blob instance.
         *
         * @param {number} length=1024 The scale in which to export the peaks
         * @param {number} accuracy=10000
         * @param {?boolean} noWindow Set to true to disable opening a new
         * window with the JSON
         * @param {number} start Start index
         * @param {number} end End index
         * @return {Promise} Promise that resolves with array of peaks
         */

      }, {
        key: "exportPCM",
        value: function exportPCM(length, accuracy, noWindow, start, end) {
          length = length || 1024;
          start = start || 0;
          accuracy = accuracy || 10000;
          noWindow = noWindow || false;
          var peaks = this.backend.getPeaks(length, start, end);
          var arr = [].map.call(peaks, function (val) {
            return Math.round(val * accuracy) / accuracy;
          });
          return new Promise(function (resolve, reject) {
            if (!noWindow) {
              var blobJSON = new Blob([JSON.stringify(arr)], {
                type: 'application/json;charset=utf-8'
              });
              var objURL = URL.createObjectURL(blobJSON);
              window.open(objURL);
              URL.revokeObjectURL(objURL);
            }

            resolve(arr);
          });
        }
        /**
         * Save waveform image as data URI.
         *
         * The default format is `'image/png'`. Other supported types are
         * `'image/jpeg'` and `'image/webp'`.
         *
         * @param {string} format='image/png' A string indicating the image format.
         * The default format type is `'image/png'`.
         * @param {number} quality=1 A number between 0 and 1 indicating the image
         * quality to use for image formats that use lossy compression such as
         * `'image/jpeg'`` and `'image/webp'`.
         * @param {string} type Image data type to return. Either 'dataURL' (default)
         * or 'blob'.
         * @return {string|string[]|Promise} When using `'dataURL'` type this returns
         * a single data URL or an array of data URLs, one for each canvas. When using
         * `'blob'` type this returns a `Promise` resolving with an array of `Blob`
         * instances, one for each canvas.
         */

      }, {
        key: "exportImage",
        value: function exportImage(format, quality, type) {
          if (!format) {
            format = 'image/png';
          }

          if (!quality) {
            quality = 1;
          }

          if (!type) {
            type = 'dataURL';
          }

          return this.drawer.getImage(format, quality, type);
        }
        /**
         * Cancel any fetch request currently in progress
         */

      }, {
        key: "cancelAjax",
        value: function cancelAjax() {
          if (this.currentRequest && this.currentRequest.controller) {
            // If the current request has a ProgressHandler, then its ReadableStream might need to be cancelled too
            // See: Wavesurfer issue #2042
            // See Firefox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1583815
            if (this.currentRequest._reader) {
              // Ignoring exceptions thrown by call to cancel()
              this.currentRequest._reader.cancel().catch(function (err) {});
            }

            this.currentRequest.controller.abort();
            this.currentRequest = null;
          }
        }
        /**
         * @private
         */

      }, {
        key: "clearTmpEvents",
        value: function clearTmpEvents() {
          this.tmpEvents.forEach(function (e) {
            return e.un();
          });
        }
        /**
         * Display empty waveform.
         */

      }, {
        key: "empty",
        value: function empty() {
          if (!this.backend.isPaused()) {
            this.stop();
            this.backend.disconnectSource();
          }

          this.isReady = false;
          this.cancelAjax();
          this.clearTmpEvents(); // empty drawer

          this.drawer.progress(0);
          this.drawer.setWidth(0);
          this.drawer.drawPeaks({
            length: this.drawer.getWidth()
          }, 0);
        }
        /**
         * Remove events, elements and disconnect WebAudio nodes.
         *
         * @emits WaveSurfer#destroy
         */

      }, {
        key: "destroy",
        value: function destroy() {
          this.destroyAllPlugins();
          this.fireEvent('destroy');
          this.cancelAjax();
          this.clearTmpEvents();
          this.unAll();

          if (this.params.responsive !== false) {
            window.removeEventListener('resize', this._onResize, true);
            window.removeEventListener('orientationchange', this._onResize, true);
          }

          if (this.backend) {
            this.backend.destroy(); // clears memory usage

            this.backend = null;
          }

          if (this.drawer) {
            this.drawer.destroy();
          }

          this.isDestroyed = true;
          this.isReady = false;
          this.arraybuffer = null;
        }
      }], [{
        key: "create",
        value:
        /** @private */

        /** @private */

        /**
         * Instantiate this class, call its `init` function and returns it
         *
         * @param {WavesurferParams} params The wavesurfer parameters
         * @return {Object} WaveSurfer instance
         * @example const wavesurfer = WaveSurfer.create(params);
         */
        function create(params) {
          var wavesurfer = new WaveSurfer(params);
          return wavesurfer.init();
        }
        /**
         * The library version number is available as a static property of the
         * WaveSurfer class
         *
         * @type {String}
         * @example
         * console.log('Using wavesurfer.js ' + WaveSurfer.VERSION);
         */

      }]);

      return WaveSurfer;
    }(util.Observer);

    exports.default = WaveSurfer;
    WaveSurfer.VERSION = "5.0.0";
    WaveSurfer.util = util;
    module.exports = exports.default;

    /***/ }),

    /***/ "./src/webaudio.js":
    /*!*************************!*\
      !*** ./src/webaudio.js ***!
      \*************************/
    /***/ ((module, exports, __webpack_require__) => {


    function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

    Object.defineProperty(exports, "__esModule", ({
      value: true
    }));
    exports.default = void 0;

    var util = _interopRequireWildcard(__webpack_require__(/*! ./util */ "./src/util/index.js"));

    function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

    function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

    function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

    function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

    function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

    function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

    function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

    function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

    function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

    function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

    // using constants to prevent someone writing the string wrong
    var PLAYING = 'playing';
    var PAUSED = 'paused';
    var FINISHED = 'finished';
    /**
     * WebAudio backend
     *
     * @extends {Observer}
     */

    var WebAudio = /*#__PURE__*/function (_util$Observer) {
      _inherits(WebAudio, _util$Observer);

      var _super = _createSuper(WebAudio);

      /**
       * Construct the backend
       *
       * @param {WavesurferParams} params Wavesurfer parameters
       */
      function WebAudio(params) {
        var _this$stateBehaviors, _this$states;

        var _this;

        _classCallCheck(this, WebAudio);

        _this = _super.call(this);
        /** @private */

        _this.audioContext = null;
        _this.offlineAudioContext = null;
        _this.stateBehaviors = (_this$stateBehaviors = {}, _defineProperty(_this$stateBehaviors, PLAYING, {
          init: function init() {
            this.addOnAudioProcess();
          },
          getPlayedPercents: function getPlayedPercents() {
            var duration = this.getDuration();
            return this.getCurrentTime() / duration || 0;
          },
          getCurrentTime: function getCurrentTime() {
            return this.startPosition + this.getPlayedTime();
          }
        }), _defineProperty(_this$stateBehaviors, PAUSED, {
          init: function init() {
            this.removeOnAudioProcess();
          },
          getPlayedPercents: function getPlayedPercents() {
            var duration = this.getDuration();
            return this.getCurrentTime() / duration || 0;
          },
          getCurrentTime: function getCurrentTime() {
            return this.startPosition;
          }
        }), _defineProperty(_this$stateBehaviors, FINISHED, {
          init: function init() {
            this.removeOnAudioProcess();
            this.fireEvent('finish');
          },
          getPlayedPercents: function getPlayedPercents() {
            return 1;
          },
          getCurrentTime: function getCurrentTime() {
            return this.getDuration();
          }
        }), _this$stateBehaviors);
        _this.params = params;
        /** ac: Audio Context instance */

        _this.ac = params.audioContext || (_this.supportsWebAudio() ? _this.getAudioContext() : {});
        /**@private */

        _this.lastPlay = _this.ac.currentTime;
        /** @private */

        _this.startPosition = 0;
        /** @private */

        _this.scheduledPause = null;
        /** @private */

        _this.states = (_this$states = {}, _defineProperty(_this$states, PLAYING, Object.create(_this.stateBehaviors[PLAYING])), _defineProperty(_this$states, PAUSED, Object.create(_this.stateBehaviors[PAUSED])), _defineProperty(_this$states, FINISHED, Object.create(_this.stateBehaviors[FINISHED])), _this$states);
        /** @private */

        _this.buffer = null;
        /** @private */

        _this.filters = [];
        /** gainNode: allows to control audio volume */

        _this.gainNode = null;
        /** @private */

        _this.mergedPeaks = null;
        /** @private */

        _this.offlineAc = null;
        /** @private */

        _this.peaks = null;
        /** @private */

        _this.playbackRate = 1;
        /** analyser: provides audio analysis information */

        _this.analyser = null;
        /** scriptNode: allows processing audio */

        _this.scriptNode = null;
        /** @private */

        _this.source = null;
        /** @private */

        _this.splitPeaks = [];
        /** @private */

        _this.state = null;
        /** @private */

        _this.explicitDuration = params.duration;
        /**
         * Boolean indicating if the backend was destroyed.
         */

        _this.destroyed = false;
        return _this;
      }
      /**
       * Initialise the backend, called in `wavesurfer.createBackend()`
       */


      _createClass(WebAudio, [{
        key: "supportsWebAudio",
        value:
        /** scriptBufferSize: size of the processing buffer */

        /** audioContext: allows to process audio with WebAudio API */

        /** @private */

        /** @private */

        /**
         * Does the browser support this backend
         *
         * @return {boolean} Whether or not this browser supports this backend
         */
        function supportsWebAudio() {
          return !!(window.AudioContext || window.webkitAudioContext);
        }
        /**
         * Get the audio context used by this backend or create one
         *
         * @return {AudioContext} Existing audio context, or creates a new one
         */

      }, {
        key: "getAudioContext",
        value: function getAudioContext() {
          if (!window.WaveSurferAudioContext) {
            window.WaveSurferAudioContext = new (window.AudioContext || window.webkitAudioContext)();
          }

          return window.WaveSurferAudioContext;
        }
        /**
         * Get the offline audio context used by this backend or create one
         *
         * @param {number} sampleRate The sample rate to use
         * @return {OfflineAudioContext} Existing offline audio context, or creates
         * a new one
         */

      }, {
        key: "getOfflineAudioContext",
        value: function getOfflineAudioContext(sampleRate) {
          if (!window.WaveSurferOfflineAudioContext) {
            window.WaveSurferOfflineAudioContext = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 2, sampleRate);
          }

          return window.WaveSurferOfflineAudioContext;
        }
      }, {
        key: "init",
        value: function init() {
          this.createVolumeNode();
          this.createScriptNode();
          this.createAnalyserNode();
          this.setState(PAUSED);
          this.setPlaybackRate(this.params.audioRate);
          this.setLength(0);
        }
        /** @private */

      }, {
        key: "disconnectFilters",
        value: function disconnectFilters() {
          if (this.filters) {
            this.filters.forEach(function (filter) {
              filter && filter.disconnect();
            });
            this.filters = null; // Reconnect direct path

            this.analyser.connect(this.gainNode);
          }
        }
        /**
         * @private
         *
         * @param {string} state The new state
         */

      }, {
        key: "setState",
        value: function setState(state) {
          if (this.state !== this.states[state]) {
            this.state = this.states[state];
            this.state.init.call(this);
          }
        }
        /**
         * Unpacked `setFilters()`
         *
         * @param {...AudioNode} filters One or more filters to set
         */

      }, {
        key: "setFilter",
        value: function setFilter() {
          for (var _len = arguments.length, filters = new Array(_len), _key = 0; _key < _len; _key++) {
            filters[_key] = arguments[_key];
          }

          this.setFilters(filters);
        }
        /**
         * Insert custom Web Audio nodes into the graph
         *
         * @param {AudioNode[]} filters Packed filters array
         * @example
         * const lowpass = wavesurfer.backend.ac.createBiquadFilter();
         * wavesurfer.backend.setFilter(lowpass);
         */

      }, {
        key: "setFilters",
        value: function setFilters(filters) {
          // Remove existing filters
          this.disconnectFilters(); // Insert filters if filter array not empty

          if (filters && filters.length) {
            this.filters = filters; // Disconnect direct path before inserting filters

            this.analyser.disconnect(); // Connect each filter in turn

            filters.reduce(function (prev, curr) {
              prev.connect(curr);
              return curr;
            }, this.analyser).connect(this.gainNode);
          }
        }
        /** Create ScriptProcessorNode to process audio */

      }, {
        key: "createScriptNode",
        value: function createScriptNode() {
          if (this.params.audioScriptProcessor) {
            this.scriptNode = this.params.audioScriptProcessor;
          } else {
            if (this.ac.createScriptProcessor) {
              this.scriptNode = this.ac.createScriptProcessor(WebAudio.scriptBufferSize);
            } else {
              this.scriptNode = this.ac.createJavaScriptNode(WebAudio.scriptBufferSize);
            }
          }

          this.scriptNode.connect(this.ac.destination);
        }
        /** @private */

      }, {
        key: "addOnAudioProcess",
        value: function addOnAudioProcess() {
          var _this2 = this;

          this.scriptNode.onaudioprocess = function () {
            var time = _this2.getCurrentTime();

            if (time >= _this2.getDuration()) {
              _this2.setState(FINISHED);

              _this2.fireEvent('pause');
            } else if (time >= _this2.scheduledPause) {
              _this2.pause();
            } else if (_this2.state === _this2.states[PLAYING]) {
              _this2.fireEvent('audioprocess', time);
            }
          };
        }
        /** @private */

      }, {
        key: "removeOnAudioProcess",
        value: function removeOnAudioProcess() {
          this.scriptNode.onaudioprocess = null;
        }
        /** Create analyser node to perform audio analysis */

      }, {
        key: "createAnalyserNode",
        value: function createAnalyserNode() {
          this.analyser = this.ac.createAnalyser();
          this.analyser.connect(this.gainNode);
        }
        /**
         * Create the gain node needed to control the playback volume.
         *
         */

      }, {
        key: "createVolumeNode",
        value: function createVolumeNode() {
          // Create gain node using the AudioContext
          if (this.ac.createGain) {
            this.gainNode = this.ac.createGain();
          } else {
            this.gainNode = this.ac.createGainNode();
          } // Add the gain node to the graph


          this.gainNode.connect(this.ac.destination);
        }
        /**
         * Set the sink id for the media player
         *
         * @param {string} deviceId String value representing audio device id.
         * @returns {Promise} A Promise that resolves to `undefined` when there
         * are no errors.
         */

      }, {
        key: "setSinkId",
        value: function setSinkId(deviceId) {
          if (deviceId) {
            /**
             * The webaudio API doesn't currently support setting the device
             * output. Here we create an HTMLAudioElement, connect the
             * webaudio stream to that element and setSinkId there.
             */
            var audio = new window.Audio();

            if (!audio.setSinkId) {
              return Promise.reject(new Error('setSinkId is not supported in your browser'));
            }

            audio.autoplay = true;
            var dest = this.ac.createMediaStreamDestination();
            this.gainNode.disconnect();
            this.gainNode.connect(dest);
            audio.srcObject = dest.stream;
            return audio.setSinkId(deviceId);
          } else {
            return Promise.reject(new Error('Invalid deviceId: ' + deviceId));
          }
        }
        /**
         * Set the audio volume
         *
         * @param {number} value A floating point value between 0 and 1.
         */

      }, {
        key: "setVolume",
        value: function setVolume(value) {
          this.gainNode.gain.setValueAtTime(value, this.ac.currentTime);
        }
        /**
         * Get the current volume
         *
         * @return {number} value A floating point value between 0 and 1.
         */

      }, {
        key: "getVolume",
        value: function getVolume() {
          return this.gainNode.gain.value;
        }
        /**
         * Decode an array buffer and pass data to a callback
         *
         * @private
         * @param {ArrayBuffer} arraybuffer The array buffer to decode
         * @param {function} callback The function to call on complete.
         * @param {function} errback The function to call on error.
         */

      }, {
        key: "decodeArrayBuffer",
        value: function decodeArrayBuffer(arraybuffer, callback, errback) {
          if (!this.offlineAc) {
            this.offlineAc = this.getOfflineAudioContext(this.ac && this.ac.sampleRate ? this.ac.sampleRate : 44100);
          }

          if ('webkitAudioContext' in window) {
            // Safari: no support for Promise-based decodeAudioData enabled
            // Enable it in Safari using the Experimental Features > Modern WebAudio API option
            this.offlineAc.decodeAudioData(arraybuffer, function (data) {
              return callback(data);
            }, errback);
          } else {
            this.offlineAc.decodeAudioData(arraybuffer).then(function (data) {
              return callback(data);
            }).catch(function (err) {
              return errback(err);
            });
          }
        }
        /**
         * Set pre-decoded peaks
         *
         * @param {number[]|Number.<Array[]>} peaks Peaks data
         * @param {?number} duration Explicit duration
         */

      }, {
        key: "setPeaks",
        value: function setPeaks(peaks, duration) {
          if (duration != null) {
            this.explicitDuration = duration;
          }

          this.peaks = peaks;
        }
        /**
         * Set the rendered length (different from the length of the audio)
         *
         * @param {number} length The rendered length
         */

      }, {
        key: "setLength",
        value: function setLength(length) {
          // No resize, we can preserve the cached peaks.
          if (this.mergedPeaks && length == 2 * this.mergedPeaks.length - 1 + 2) {
            return;
          }

          this.splitPeaks = [];
          this.mergedPeaks = []; // Set the last element of the sparse array so the peak arrays are
          // appropriately sized for other calculations.

          var channels = this.buffer ? this.buffer.numberOfChannels : 1;
          var c;

          for (c = 0; c < channels; c++) {
            this.splitPeaks[c] = [];
            this.splitPeaks[c][2 * (length - 1)] = 0;
            this.splitPeaks[c][2 * (length - 1) + 1] = 0;
          }

          this.mergedPeaks[2 * (length - 1)] = 0;
          this.mergedPeaks[2 * (length - 1) + 1] = 0;
        }
        /**
         * Compute the max and min value of the waveform when broken into <length> subranges.
         *
         * @param {number} length How many subranges to break the waveform into.
         * @param {number} first First sample in the required range.
         * @param {number} last Last sample in the required range.
         * @return {number[]|Number.<Array[]>} Array of 2*<length> peaks or array of arrays of
         * peaks consisting of (max, min) values for each subrange.
         */

      }, {
        key: "getPeaks",
        value: function getPeaks(length, first, last) {
          if (this.peaks) {
            return this.peaks;
          }

          if (!this.buffer) {
            return [];
          }

          first = first || 0;
          last = last || length - 1;
          this.setLength(length);

          if (!this.buffer) {
            return this.params.splitChannels ? this.splitPeaks : this.mergedPeaks;
          }
          /**
           * The following snippet fixes a buffering data issue on the Safari
           * browser which returned undefined It creates the missing buffer based
           * on 1 channel, 4096 samples and the sampleRate from the current
           * webaudio context 4096 samples seemed to be the best fit for rendering
           * will review this code once a stable version of Safari TP is out
           */


          if (!this.buffer.length) {
            var newBuffer = this.createBuffer(1, 4096, this.sampleRate);
            this.buffer = newBuffer.buffer;
          }

          var sampleSize = this.buffer.length / length;
          var sampleStep = ~~(sampleSize / 10) || 1;
          var channels = this.buffer.numberOfChannels;
          var c;

          for (c = 0; c < channels; c++) {
            var peaks = this.splitPeaks[c];
            var chan = this.buffer.getChannelData(c);
            var i = void 0;

            for (i = first; i <= last; i++) {
              var start = ~~(i * sampleSize);
              var end = ~~(start + sampleSize);
              /**
               * Initialize the max and min to the first sample of this
               * subrange, so that even if the samples are entirely
               * on one side of zero, we still return the true max and
               * min values in the subrange.
               */

              var min = chan[start];
              var max = min;
              var j = void 0;

              for (j = start; j < end; j += sampleStep) {
                var value = chan[j];

                if (value > max) {
                  max = value;
                }

                if (value < min) {
                  min = value;
                }
              }

              peaks[2 * i] = max;
              peaks[2 * i + 1] = min;

              if (c == 0 || max > this.mergedPeaks[2 * i]) {
                this.mergedPeaks[2 * i] = max;
              }

              if (c == 0 || min < this.mergedPeaks[2 * i + 1]) {
                this.mergedPeaks[2 * i + 1] = min;
              }
            }
          }

          return this.params.splitChannels ? this.splitPeaks : this.mergedPeaks;
        }
        /**
         * Get the position from 0 to 1
         *
         * @return {number} Position
         */

      }, {
        key: "getPlayedPercents",
        value: function getPlayedPercents() {
          return this.state.getPlayedPercents.call(this);
        }
        /** @private */

      }, {
        key: "disconnectSource",
        value: function disconnectSource() {
          if (this.source) {
            this.source.disconnect();
          }
        }
        /**
         * Destroy all references with WebAudio, disconnecting audio nodes and closing Audio Context
         */

      }, {
        key: "destroyWebAudio",
        value: function destroyWebAudio() {
          this.disconnectFilters();
          this.disconnectSource();
          this.gainNode.disconnect();
          this.scriptNode.disconnect();
          this.analyser.disconnect(); // close the audioContext if closeAudioContext option is set to true

          if (this.params.closeAudioContext) {
            // check if browser supports AudioContext.close()
            if (typeof this.ac.close === 'function' && this.ac.state != 'closed') {
              this.ac.close();
            } // clear the reference to the audiocontext


            this.ac = null; // clear the actual audiocontext, either passed as param or the
            // global singleton

            if (!this.params.audioContext) {
              window.WaveSurferAudioContext = null;
            } else {
              this.params.audioContext = null;
            } // clear the offlineAudioContext


            window.WaveSurferOfflineAudioContext = null;
          }
        }
        /**
         * This is called when wavesurfer is destroyed
         */

      }, {
        key: "destroy",
        value: function destroy() {
          if (!this.isPaused()) {
            this.pause();
          }

          this.unAll();
          this.buffer = null;
          this.destroyed = true;
          this.destroyWebAudio();
        }
        /**
         * Loaded a decoded audio buffer
         *
         * @param {Object} buffer Decoded audio buffer to load
         */

      }, {
        key: "load",
        value: function load(buffer) {
          this.startPosition = 0;
          this.lastPlay = this.ac.currentTime;
          this.buffer = buffer;
          this.createSource();
        }
        /** @private */

      }, {
        key: "createSource",
        value: function createSource() {
          this.disconnectSource();
          this.source = this.ac.createBufferSource(); // adjust for old browsers

          this.source.start = this.source.start || this.source.noteGrainOn;
          this.source.stop = this.source.stop || this.source.noteOff;
          this.setPlaybackRate(this.playbackRate);
          this.source.buffer = this.buffer;
          this.source.connect(this.analyser);
        }
        /**
         * @private
         *
         * some browsers require an explicit call to #resume before they will play back audio
         */

      }, {
        key: "resumeAudioContext",
        value: function resumeAudioContext() {
          if (this.ac.state == 'suspended') {
            this.ac.resume && this.ac.resume();
          }
        }
        /**
         * Used by `wavesurfer.isPlaying()` and `wavesurfer.playPause()`
         *
         * @return {boolean} Whether or not this backend is currently paused
         */

      }, {
        key: "isPaused",
        value: function isPaused() {
          return this.state !== this.states[PLAYING];
        }
        /**
         * Used by `wavesurfer.getDuration()`
         *
         * @return {number} Duration of loaded buffer
         */

      }, {
        key: "getDuration",
        value: function getDuration() {
          if (this.explicitDuration) {
            return this.explicitDuration;
          }

          if (!this.buffer) {
            return 0;
          }

          return this.buffer.duration;
        }
        /**
         * Used by `wavesurfer.seekTo()`
         *
         * @param {number} start Position to start at in seconds
         * @param {number} end Position to end at in seconds
         * @return {{start: number, end: number}} Object containing start and end
         * positions
         */

      }, {
        key: "seekTo",
        value: function seekTo(start, end) {
          if (!this.buffer) {
            return;
          }

          this.scheduledPause = null;

          if (start == null) {
            start = this.getCurrentTime();

            if (start >= this.getDuration()) {
              start = 0;
            }
          }

          if (end == null) {
            end = this.getDuration();
          }

          this.startPosition = start;
          this.lastPlay = this.ac.currentTime;

          if (this.state === this.states[FINISHED]) {
            this.setState(PAUSED);
          }

          return {
            start: start,
            end: end
          };
        }
        /**
         * Get the playback position in seconds
         *
         * @return {number} The playback position in seconds
         */

      }, {
        key: "getPlayedTime",
        value: function getPlayedTime() {
          return (this.ac.currentTime - this.lastPlay) * this.playbackRate;
        }
        /**
         * Plays the loaded audio region.
         *
         * @param {number} start Start offset in seconds, relative to the beginning
         * of a clip.
         * @param {number} end When to stop relative to the beginning of a clip.
         */

      }, {
        key: "play",
        value: function play(start, end) {
          if (!this.buffer) {
            return;
          } // need to re-create source on each playback


          this.createSource();
          var adjustedTime = this.seekTo(start, end);
          start = adjustedTime.start;
          end = adjustedTime.end;
          this.scheduledPause = end;
          this.source.start(0, start);
          this.resumeAudioContext();
          this.setState(PLAYING);
          this.fireEvent('play');
        }
        /**
         * Pauses the loaded audio.
         */

      }, {
        key: "pause",
        value: function pause() {
          this.scheduledPause = null;
          this.startPosition += this.getPlayedTime();
          this.source && this.source.stop(0);
          this.setState(PAUSED);
          this.fireEvent('pause');
        }
        /**
         * Returns the current time in seconds relative to the audio-clip's
         * duration.
         *
         * @return {number} The current time in seconds
         */

      }, {
        key: "getCurrentTime",
        value: function getCurrentTime() {
          return this.state.getCurrentTime.call(this);
        }
        /**
         * Returns the current playback rate. (0=no playback, 1=normal playback)
         *
         * @return {number} The current playback rate
         */

      }, {
        key: "getPlaybackRate",
        value: function getPlaybackRate() {
          return this.playbackRate;
        }
        /**
         * Set the audio source playback rate.
         *
         * @param {number} value The playback rate to use
         */

      }, {
        key: "setPlaybackRate",
        value: function setPlaybackRate(value) {
          this.playbackRate = value || 1;
          this.source && this.source.playbackRate.setValueAtTime(this.playbackRate, this.ac.currentTime);
        }
        /**
         * Set a point in seconds for playback to stop at.
         *
         * @param {number} end Position to end at
         * @version 3.3.0
         */

      }, {
        key: "setPlayEnd",
        value: function setPlayEnd(end) {
          this.scheduledPause = end;
        }
      }]);

      return WebAudio;
    }(util.Observer);

    exports.default = WebAudio;
    WebAudio.scriptBufferSize = 256;
    module.exports = exports.default;

    /***/ }),

    /***/ "./node_modules/debounce/index.js":
    /*!****************************************!*\
      !*** ./node_modules/debounce/index.js ***!
      \****************************************/
    /***/ ((module) => {

    /**
     * Returns a function, that, as long as it continues to be invoked, will not
     * be triggered. The function will be called after it stops being called for
     * N milliseconds. If `immediate` is passed, trigger the function on the
     * leading edge, instead of the trailing. The function also has a property 'clear' 
     * that is a function which will clear the timer to prevent previously scheduled executions. 
     *
     * @source underscore.js
     * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
     * @param {Function} function to wrap
     * @param {Number} timeout in ms (`100`)
     * @param {Boolean} whether to execute at the beginning (`false`)
     * @api public
     */
    function debounce(func, wait, immediate){
      var timeout, args, context, timestamp, result;
      if (null == wait) wait = 100;

      function later() {
        var last = Date.now() - timestamp;

        if (last < wait && last >= 0) {
          timeout = setTimeout(later, wait - last);
        } else {
          timeout = null;
          if (!immediate) {
            result = func.apply(context, args);
            context = args = null;
          }
        }
      }
      var debounced = function(){
        context = this;
        args = arguments;
        timestamp = Date.now();
        var callNow = immediate && !timeout;
        if (!timeout) timeout = setTimeout(later, wait);
        if (callNow) {
          result = func.apply(context, args);
          context = args = null;
        }

        return result;
      };

      debounced.clear = function() {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
      };
      
      debounced.flush = function() {
        if (timeout) {
          result = func.apply(context, args);
          context = args = null;
          
          clearTimeout(timeout);
          timeout = null;
        }
      };

      return debounced;
    }
    // Adds compatibility for ES modules
    debounce.debounce = debounce;

    module.exports = debounce;


    /***/ })

    /******/ 	});
    /************************************************************************/
    /******/ 	// The module cache
    /******/ 	var __webpack_module_cache__ = {};
    /******/ 	
    /******/ 	// The require function
    /******/ 	function __webpack_require__(moduleId) {
    /******/ 		// Check if module is in cache
    /******/ 		var cachedModule = __webpack_module_cache__[moduleId];
    /******/ 		if (cachedModule !== undefined) {
    /******/ 			return cachedModule.exports;
    /******/ 		}
    /******/ 		// Create a new module (and put it into the cache)
    /******/ 		var module = __webpack_module_cache__[moduleId] = {
    /******/ 			// no module.id needed
    /******/ 			// no module.loaded needed
    /******/ 			exports: {}
    /******/ 		};
    /******/ 	
    /******/ 		// Execute the module function
    /******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
    /******/ 	
    /******/ 		// Return the exports of the module
    /******/ 		return module.exports;
    /******/ 	}
    /******/ 	
    /************************************************************************/
    /******/ 	
    /******/ 	// startup
    /******/ 	// Load entry module and return exports
    /******/ 	// This entry module is referenced by other modules so it can't be inlined
    /******/ 	var __webpack_exports__ = __webpack_require__("./src/wavesurfer.js");
    /******/ 	
    /******/ 	return __webpack_exports__;
    /******/ })()
    ;
    });

    });

    let waveSurfer;
    function createWaveFormElement(hook) {
        waveSurfer = wavesurfer.create({
            container: hook,
            waveColor: 'transparent',
            cursorColor: 'transparent',
            progressColor: 'transparent',
            normalize: true,
            responsive: true,
            hideScrollbar: true,
            barWidth: 1,
            barGap: null,
            barMinHeight: 1
        });
        waveSurfer.setHeight(64);
    }
    function setWaveSource(source, duration) {
        return new Promise((resolve, reject) => {
            let pcm = JSON.parse(localStorage.getItem(source)) || undefined;
            waveSurfer.load(source, pcm, undefined, duration);
            waveSurfer.on('redraw', () => {
                resolve('');
                waveSurfer.unAll();
            });
            waveSurfer.on('peaks-ready', (peaks) => {
                // TODO Save peaks to pc
                // console.log('peaks-ready', source)
                // localStorage.setItem(source, JSON.stringify(peaks))
                // resolve('')
                // waveSurfer.unAll()
            });
        });
    }
    let currentWaveColor = '';
    function setWaveColor(hslColorString) {
        if (currentWaveColor !== hslColorString) {
            currentWaveColor = hslColorString;
            waveSurfer.setWaveColor(hslColorString);
        }
    }

    async function getAlbumColors(id) {
        getAlbumColorsIPC(id).then((color) => {
            setWaveColor(`hsl(${color.hue},${color.saturation}%,${color.lightnessLow}%)`);
            document.documentElement.style.setProperty('--low-color', `hsl(${color.hue},${color.saturation}%,${color.lightnessLow}%)`);
            document.documentElement.style.setProperty('--base-color', `hsl(${color.hue},${color.saturation}%,${color.lightnessBase}%)`);
            document.documentElement.style.setProperty('--high-color', `hsl(${color.hue},${color.saturation}%,${color.lightnessHigh}%)`);
        });
    }

    async function setNewPlayback(albumID, playbackSongs, SONG_ID_TO_PLAY, playNow) {
        let indexToPlay = playbackSongs.findIndex((song) => song.ID === SONG_ID_TO_PLAY);
        if (indexToPlay === -1) {
            indexToPlay = 0;
        }
        //TODO Sorting
        albumPlayingIdStore.set(albumID);
        playbackStore.set(playbackSongs);
        playbackCursor.set([indexToPlay, playNow]);
        getAlbumColors(albumID);
    }

    /* src/components/CoverArt.svelte generated by Svelte v3.31.0 */
    const file$1 = "src/components/CoverArt.svelte";

    // (59:1) {#if coverType === undefined}
    function create_if_block_3(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = "./img/audio.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "loader svelte-1q9dyby");
    			attr_dev(img, "alt", "");
    			add_location(img, file$1, 59, 2, 2009);
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
    		source: "(59:1) {#if coverType === undefined}",
    		ctx
    	});

    	return block;
    }

    // (62:1) {#if coverType === 'not found'}
    function create_if_block_2(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = "./img/compact-disc.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "notFound svelte-1q9dyby");
    			attr_dev(img, "alt", "");
    			add_location(img, file$1, 61, 32, 2100);
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
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(62:1) {#if coverType === 'not found'}",
    		ctx
    	});

    	return block;
    }

    // (63:1) {#if coverType === 'image'}
    function create_if_block_1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = /*coverSrc*/ ctx[1])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-1q9dyby");
    			add_location(img, file$1, 62, 28, 2194);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*coverSrc*/ 2 && img.src !== (img_src_value = /*coverSrc*/ ctx[1])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(63:1) {#if coverType === 'image'}",
    		ctx
    	});

    	return block;
    }

    // (64:1) {#if coverType === 'video'}
    function create_if_block(ctx) {
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
    			add_location(track, file$1, 65, 3, 2285);
    			if (source.src !== (source_src_value = /*coverSrc*/ ctx[1])) attr_dev(source, "src", source_src_value);
    			add_location(source, file$1, 66, 3, 2314);
    			video.autoplay = true;
    			video.loop = true;
    			attr_dev(video, "class", "svelte-1q9dyby");
    			add_location(video, file$1, 64, 2, 2260);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, video, anchor);
    			append_dev(video, track);
    			append_dev(video, source);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*coverSrc*/ 2 && source.src !== (source_src_value = /*coverSrc*/ ctx[1])) {
    				attr_dev(source, "src", source_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(video);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(64:1) {#if coverType === 'video'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let cover_art;
    	let t0;
    	let t1;
    	let t2;
    	let if_block0 = /*coverType*/ ctx[0] === undefined && create_if_block_3(ctx);
    	let if_block1 = /*coverType*/ ctx[0] === "not found" && create_if_block_2(ctx);
    	let if_block2 = /*coverType*/ ctx[0] === "image" && create_if_block_1(ctx);
    	let if_block3 = /*coverType*/ ctx[0] === "video" && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			cover_art = element("cover-art");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			set_custom_element_data(cover_art, "class", "svelte-1q9dyby");
    			add_location(cover_art, file$1, 57, 0, 1964);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, cover_art, anchor);
    			if (if_block0) if_block0.m(cover_art, null);
    			append_dev(cover_art, t0);
    			if (if_block1) if_block1.m(cover_art, null);
    			append_dev(cover_art, t1);
    			if (if_block2) if_block2.m(cover_art, null);
    			append_dev(cover_art, t2);
    			if (if_block3) if_block3.m(cover_art, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*coverType*/ ctx[0] === undefined) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					if_block0.m(cover_art, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*coverType*/ ctx[0] === "not found") {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_2(ctx);
    					if_block1.c();
    					if_block1.m(cover_art, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*coverType*/ ctx[0] === "image") {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_1(ctx);
    					if_block2.c();
    					if_block2.m(cover_art, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*coverType*/ ctx[0] === "video") {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block(ctx);
    					if_block3.c();
    					if_block3.m(cover_art, null);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(cover_art);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
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
    	let $albumCoverArtMapStore;
    	validate_store(albumCoverArtMapStore, "albumCoverArtMapStore");
    	component_subscribe($$self, albumCoverArtMapStore, $$value => $$invalidate(5, $albumCoverArtMapStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CoverArt", slots, []);
    	
    	let coverType = undefined;
    	let coverSrc = undefined;
    	let { rootDir } = $$props;
    	let { albumId } = $$props;
    	let albumCoverArtVersion = undefined;
    	let coverArtObserver;

    	onMount(() => {
    		addIntersectionObserver();
    	});

    	function addIntersectionObserver() {
    		coverArtObserver = new IntersectionObserver(entries => {
    				if (entries[0].isIntersecting === true) {
    					const ALBUM_COVER_ART_DATA = $albumCoverArtMapStore.get(albumId);

    					if (ALBUM_COVER_ART_DATA) {
    						setCoverData(ALBUM_COVER_ART_DATA);
    					} else {
    						getAlbumCover();
    					}

    					// "Closes" the Cover Art Observer to avoid unnecessary checks.
    					coverArtObserver.disconnect();
    				}
    			},
    		{
    				root: document.querySelector(`art-grid-svlt`),
    				threshold: 0,
    				rootMargin: "0px 0px 50% 0px"
    			});

    		coverArtObserver.observe(document.querySelector(`art-grid-svlt > #${CSS.escape(albumId)}`));
    	}

    	function setCoverData(coverData) {
    		$$invalidate(4, albumCoverArtVersion = coverData.version);
    		$$invalidate(0, coverType = coverData.fileType);
    		$$invalidate(1, coverSrc = coverData.filePath);
    	}

    	function getAlbumCover() {
    		getCoverIPC(rootDir).then(response => {
    			if (response) {
    				$albumCoverArtMapStore.set(albumId, {
    					version: 0,
    					filePath: response.filePath,
    					fileType: response.fileType
    				});

    				albumCoverArtMapStore.set($albumCoverArtMapStore);
    			} else {
    				$$invalidate(0, coverType = "not found");
    			}
    		});
    	}

    	const writable_props = ["rootDir", "albumId"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CoverArt> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("rootDir" in $$props) $$invalidate(2, rootDir = $$props.rootDir);
    		if ("albumId" in $$props) $$invalidate(3, albumId = $$props.albumId);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		getCoverIPC,
    		albumCoverArtMapStore,
    		coverType,
    		coverSrc,
    		rootDir,
    		albumId,
    		albumCoverArtVersion,
    		coverArtObserver,
    		addIntersectionObserver,
    		setCoverData,
    		getAlbumCover,
    		$albumCoverArtMapStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("coverType" in $$props) $$invalidate(0, coverType = $$props.coverType);
    		if ("coverSrc" in $$props) $$invalidate(1, coverSrc = $$props.coverSrc);
    		if ("rootDir" in $$props) $$invalidate(2, rootDir = $$props.rootDir);
    		if ("albumId" in $$props) $$invalidate(3, albumId = $$props.albumId);
    		if ("albumCoverArtVersion" in $$props) $$invalidate(4, albumCoverArtVersion = $$props.albumCoverArtVersion);
    		if ("coverArtObserver" in $$props) coverArtObserver = $$props.coverArtObserver;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$albumCoverArtMapStore, albumId, albumCoverArtVersion*/ 56) {
    			 {
    				const ALBUM_COVER_ART_DATA = $albumCoverArtMapStore.get(albumId);

    				if ((ALBUM_COVER_ART_DATA === null || ALBUM_COVER_ART_DATA === void 0
    				? void 0
    				: ALBUM_COVER_ART_DATA.version) !== albumCoverArtVersion) {
    					setCoverData(ALBUM_COVER_ART_DATA);
    				}
    			}
    		}
    	};

    	return [
    		coverType,
    		coverSrc,
    		rootDir,
    		albumId,
    		albumCoverArtVersion,
    		$albumCoverArtMapStore
    	];
    }

    class CoverArt extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { rootDir: 2, albumId: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CoverArt",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*rootDir*/ ctx[2] === undefined && !("rootDir" in props)) {
    			console.warn("<CoverArt> was created without expected prop 'rootDir'");
    		}

    		if (/*albumId*/ ctx[3] === undefined && !("albumId" in props)) {
    			console.warn("<CoverArt> was created without expected prop 'albumId'");
    		}
    	}

    	get rootDir() {
    		throw new Error("<CoverArt>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rootDir(value) {
    		throw new Error("<CoverArt>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get albumId() {
    		throw new Error("<CoverArt>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set albumId(value) {
    		throw new Error("<CoverArt>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Album.svelte generated by Svelte v3.31.0 */
    const file$2 = "src/components/Album.svelte";

    // (58:2) {:else}
    function create_else_block(ctx) {
    	let album_artist;

    	const block = {
    		c: function create() {
    			album_artist = element("album-artist");
    			set_custom_element_data(album_artist, "class", "svelte-oc8a79");
    			add_location(album_artist, file$2, 58, 3, 1896);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, album_artist, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(album_artist);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(58:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (56:54) 
    function create_if_block_1$1(ctx) {
    	let album_artist;
    	let t_value = /*album*/ ctx[0]["DynamicAlbumArtist"] + "";
    	let t;

    	const block = {
    		c: function create() {
    			album_artist = element("album-artist");
    			t = text(t_value);
    			set_custom_element_data(album_artist, "class", "svelte-oc8a79");
    			add_location(album_artist, file$2, 56, 3, 1824);
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
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(56:54) ",
    		ctx
    	});

    	return block;
    }

    // (54:2) {#if album['AlbumArtist'] !== undefined}
    function create_if_block$1(ctx) {
    	let album_artist;
    	let t_value = /*album*/ ctx[0]["AlbumArtist"] + "";
    	let t;

    	const block = {
    		c: function create() {
    			album_artist = element("album-artist");
    			t = text(t_value);
    			set_custom_element_data(album_artist, "class", "svelte-oc8a79");
    			add_location(album_artist, file$2, 54, 3, 1714);
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
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(54:2) {#if album['AlbumArtist'] !== undefined}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let album_1;
    	let coverart;
    	let t0;
    	let overlay_gradient;
    	let t1;
    	let album_details;
    	let album_name;
    	let t2_value = /*album*/ ctx[0]["Name"] + "";
    	let t2;
    	let t3;
    	let album_1_id_value;
    	let album_1_class_value;
    	let current;

    	coverart = new CoverArt({
    			props: {
    				rootDir: /*album*/ ctx[0].RootDir,
    				albumId: /*album*/ ctx[0].ID
    			},
    			$$inline: true
    		});

    	function select_block_type(ctx, dirty) {
    		if (/*album*/ ctx[0]["AlbumArtist"] !== undefined) return create_if_block$1;
    		if (/*album*/ ctx[0]["DynamicAlbumArtist"] !== undefined) return create_if_block_1$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			album_1 = element("album");
    			create_component(coverart.$$.fragment);
    			t0 = space();
    			overlay_gradient = element("overlay-gradient");
    			t1 = space();
    			album_details = element("album-details");
    			album_name = element("album-name");
    			t2 = text(t2_value);
    			t3 = space();
    			if_block.c();
    			set_custom_element_data(overlay_gradient, "class", "svelte-oc8a79");
    			add_location(overlay_gradient, file$2, 48, 1, 1585);
    			set_custom_element_data(album_name, "class", "svelte-oc8a79");
    			add_location(album_name, file$2, 51, 2, 1626);
    			set_custom_element_data(album_details, "class", "svelte-oc8a79");
    			add_location(album_details, file$2, 50, 1, 1608);
    			attr_dev(album_1, "id", album_1_id_value = /*album*/ ctx[0].ID);

    			attr_dev(album_1, "class", album_1_class_value = "" + (null_to_empty(/*$selectedAlbumId*/ ctx[1] === /*album*/ ctx[0]?.ID
    			? "selected"
    			: "") + " svelte-oc8a79"));

    			add_location(album_1, file$2, 45, 0, 1447);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, album_1, anchor);
    			mount_component(coverart, album_1, null);
    			append_dev(album_1, t0);
    			append_dev(album_1, overlay_gradient);
    			append_dev(album_1, t1);
    			append_dev(album_1, album_details);
    			append_dev(album_details, album_name);
    			append_dev(album_name, t2);
    			append_dev(album_details, t3);
    			if_block.m(album_details, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const coverart_changes = {};
    			if (dirty & /*album*/ 1) coverart_changes.rootDir = /*album*/ ctx[0].RootDir;
    			if (dirty & /*album*/ 1) coverart_changes.albumId = /*album*/ ctx[0].ID;
    			coverart.$set(coverart_changes);
    			if ((!current || dirty & /*album*/ 1) && t2_value !== (t2_value = /*album*/ ctx[0]["Name"] + "")) set_data_dev(t2, t2_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(album_details, null);
    				}
    			}

    			if (!current || dirty & /*album*/ 1 && album_1_id_value !== (album_1_id_value = /*album*/ ctx[0].ID)) {
    				attr_dev(album_1, "id", album_1_id_value);
    			}

    			if (!current || dirty & /*$selectedAlbumId, album*/ 3 && album_1_class_value !== (album_1_class_value = "" + (null_to_empty(/*$selectedAlbumId*/ ctx[1] === /*album*/ ctx[0]?.ID
    			? "selected"
    			: "") + " svelte-oc8a79"))) {
    				attr_dev(album_1, "class", album_1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(coverart.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(coverart.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(album_1);
    			destroy_component(coverart);
    			if_block.d();
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
    	let $selectedAlbumId;
    	validate_store(selectedAlbumId, "selectedAlbumId");
    	component_subscribe($$self, selectedAlbumId, $$value => $$invalidate(1, $selectedAlbumId = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Album", slots, []);
    	
    	let { album } = $$props;
    	let { index } = $$props;
    	let coverType = undefined;
    	let coverSrc = undefined; /* Image Source URL */

    	onMount(() => {
    		let lastPlayedAlbumID = localStorage.getItem("LastPlayedAlbumID");

    		if (album.ID === lastPlayedAlbumID) {
    			let albumEl = document.querySelector(`#${CSS.escape(album.ID)}`);

    			if (albumEl) {
    				albumEl.scrollIntoView({ block: "center" });
    			}
    		}
    	});

    	const writable_props = ["album", "index"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Album> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("album" in $$props) $$invalidate(0, album = $$props.album);
    		if ("index" in $$props) $$invalidate(2, index = $$props.index);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		getCoverIPC,
    		setNewPlayback,
    		albumPlayingIdStore,
    		selectedAlbumId,
    		CoverArt,
    		album,
    		index,
    		coverType,
    		coverSrc,
    		$selectedAlbumId
    	});

    	$$self.$inject_state = $$props => {
    		if ("album" in $$props) $$invalidate(0, album = $$props.album);
    		if ("index" in $$props) $$invalidate(2, index = $$props.index);
    		if ("coverType" in $$props) coverType = $$props.coverType;
    		if ("coverSrc" in $$props) coverSrc = $$props.coverSrc;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [album, $selectedAlbumId, index];
    }

    class Album extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { album: 0, index: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Album",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*album*/ ctx[0] === undefined && !("album" in props)) {
    			console.warn("<Album> was created without expected prop 'album'");
    		}

    		if (/*index*/ ctx[2] === undefined && !("index" in props)) {
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

    let albumArtSizeConfig = writable(localStorage.getItem('AlbumArtSize'));

    /* src/includes/ArtGrid.svelte generated by Svelte v3.31.0 */

    const file$3 = "src/includes/ArtGrid.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (39:1) {#each $albumListStore as album, index (album['ID'])}
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
    			if (dirty & /*$albumListStore*/ 1) album_changes.album = /*album*/ ctx[2];
    			if (dirty & /*$albumListStore*/ 1) album_changes.index = /*index*/ ctx[4];
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
    		source: "(39:1) {#each $albumListStore as album, index (album['ID'])}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let art_grid_svlt;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*$albumListStore*/ ctx[0];
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

    			set_custom_element_data(art_grid_svlt, "class", "svelte-1hg2le5");
    			add_location(art_grid_svlt, file$3, 37, 0, 1470);
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
    			if (dirty & /*$albumListStore*/ 1) {
    				const each_value = /*$albumListStore*/ ctx[0];
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $albumArtSizeConfig;
    	let $albumListStore;
    	validate_store(albumArtSizeConfig, "albumArtSizeConfig");
    	component_subscribe($$self, albumArtSizeConfig, $$value => $$invalidate(1, $albumArtSizeConfig = $$value));
    	validate_store(albumListStore, "albumListStore");
    	component_subscribe($$self, albumListStore, $$value => $$invalidate(0, $albumListStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ArtGrid", slots, []);

    	onMount(() => {
    		// Whenever a filter is selected resets the scroll to top. Can't do it in reactive statement because querySelector gives undefined.
    		selectedGroupByStore.subscribe(() => {
    			document.querySelector("art-grid-svlt").scrollTop = 0;
    		});

    		selectedGroupByValueStore.subscribe(() => {
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
    		albumArtSizeConfig,
    		albumListStore,
    		selectedGroupByStore,
    		selectedGroupByValueStore,
    		$albumArtSizeConfig,
    		$albumListStore
    	});

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$albumArtSizeConfig*/ 2) {
    			// If the album art size has been set in the store.
    			 if ($albumArtSizeConfig) document.documentElement.style.setProperty("--cover-dimension", `${$albumArtSizeConfig}px`);
    		}
    	};

    	return [$albumListStore, $albumArtSizeConfig];
    }

    class ArtGrid extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ArtGrid",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/includes/Grouping.svelte generated by Svelte v3.31.0 */

    const file$4 = "src/includes/Grouping.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    // (79:2) {#each groups as group (group.id)}
    function create_each_block$1(key_1, ctx) {
    	let group;
    	let input;
    	let input_id_value;
    	let input_value_value;
    	let t0;
    	let label;
    	let t1_value = /*group*/ ctx[15].name + "";
    	let t1;
    	let label_for_value;
    	let t2;
    	let group_name_value;
    	let mounted;
    	let dispose;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			group = element("group");
    			input = element("input");
    			t0 = space();
    			label = element("label");
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(input, "id", input_id_value = /*group*/ ctx[15].id);
    			attr_dev(input, "type", "radio");
    			input.__value = input_value_value = /*group*/ ctx[15].name;
    			input.value = input.__value;
    			attr_dev(input, "class", "svelte-z201rr");
    			/*$$binding_groups*/ ctx[9][0].push(input);
    			add_location(input, file$4, 80, 4, 2583);
    			attr_dev(label, "for", label_for_value = /*group*/ ctx[15].id);
    			attr_dev(label, "class", "svelte-z201rr");
    			add_location(label, file$4, 81, 4, 2677);
    			attr_dev(group, "name", group_name_value = /*group*/ ctx[15].name);
    			attr_dev(group, "class", "svelte-z201rr");
    			add_location(group, file$4, 79, 3, 2553);
    			this.first = group;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, group, anchor);
    			append_dev(group, input);
    			input.checked = input.__value === /*selectedGroupByValue*/ ctx[1];
    			append_dev(group, t0);
    			append_dev(group, label);
    			append_dev(label, t1);
    			append_dev(group, t2);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[8]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*groups*/ 4 && input_id_value !== (input_id_value = /*group*/ ctx[15].id)) {
    				attr_dev(input, "id", input_id_value);
    			}

    			if (dirty & /*groups*/ 4 && input_value_value !== (input_value_value = /*group*/ ctx[15].name)) {
    				prop_dev(input, "__value", input_value_value);
    				input.value = input.__value;
    			}

    			if (dirty & /*selectedGroupByValue*/ 2) {
    				input.checked = input.__value === /*selectedGroupByValue*/ ctx[1];
    			}

    			if (dirty & /*groups*/ 4 && t1_value !== (t1_value = /*group*/ ctx[15].name + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*groups*/ 4 && label_for_value !== (label_for_value = /*group*/ ctx[15].id)) {
    				attr_dev(label, "for", label_for_value);
    			}

    			if (dirty & /*groups*/ 4 && group_name_value !== (group_name_value = /*group*/ ctx[15].name)) {
    				attr_dev(group, "name", group_name_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(group);
    			/*$$binding_groups*/ ctx[9][0].splice(/*$$binding_groups*/ ctx[9][0].indexOf(input), 1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(79:2) {#each groups as group (group.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let grouping_svlt;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let option4;
    	let option5;
    	let t6;
    	let total_groups;
    	let t7;
    	let t8;
    	let t9;
    	let t10_value = /*groups*/ ctx[2].length + "";
    	let t10;
    	let t11;
    	let groups_1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let mounted;
    	let dispose;
    	let each_value = /*groups*/ ctx[2];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*group*/ ctx[15].id;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			grouping_svlt = element("grouping-svlt");
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Group by...";
    			option1 = element("option");
    			option1.textContent = "None";
    			option2 = element("option");
    			option2.textContent = "Genre";
    			option3 = element("option");
    			option3.textContent = "Album Artist";
    			option4 = element("option");
    			option4.textContent = "Album";
    			option5 = element("option");
    			option5.textContent = "Composer";
    			t6 = space();
    			total_groups = element("total-groups");
    			t7 = text("Total ");
    			t8 = text(/*selectedGroupBy*/ ctx[0]);
    			t9 = text(": ");
    			t10 = text(t10_value);
    			t11 = space();
    			groups_1 = element("groups");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			option0.__value = "null";
    			option0.value = option0.__value;
    			option0.disabled = true;
    			option0.selected = true;
    			add_location(option0, file$4, 67, 2, 2147);
    			option1.__value = "none";
    			option1.value = option1.__value;
    			add_location(option1, file$4, 68, 2, 2209);
    			option2.__value = "Genre";
    			option2.value = option2.__value;
    			add_location(option2, file$4, 69, 2, 2246);
    			option3.__value = "AlbumArtist";
    			option3.value = option3.__value;
    			add_location(option3, file$4, 70, 2, 2285);
    			option4.__value = "Album";
    			option4.value = option4.__value;
    			add_location(option4, file$4, 71, 2, 2337);
    			option5.__value = "Composer";
    			option5.value = option5.__value;
    			add_location(option5, file$4, 72, 2, 2376);
    			attr_dev(select, "class", "svelte-z201rr");
    			if (/*selectedGroupBy*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[7].call(select));
    			add_location(select, file$4, 66, 1, 2107);
    			set_custom_element_data(total_groups, "class", "svelte-z201rr");
    			add_location(total_groups, file$4, 75, 1, 2432);
    			attr_dev(groups_1, "class", "svelte-z201rr");
    			add_location(groups_1, file$4, 77, 1, 2504);
    			set_custom_element_data(grouping_svlt, "class", "svelte-z201rr");
    			add_location(grouping_svlt, file$4, 65, 0, 2090);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, grouping_svlt, anchor);
    			append_dev(grouping_svlt, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			append_dev(select, option3);
    			append_dev(select, option4);
    			append_dev(select, option5);
    			select_option(select, /*selectedGroupBy*/ ctx[0]);
    			append_dev(grouping_svlt, t6);
    			append_dev(grouping_svlt, total_groups);
    			append_dev(total_groups, t7);
    			append_dev(total_groups, t8);
    			append_dev(total_groups, t9);
    			append_dev(total_groups, t10);
    			append_dev(grouping_svlt, t11);
    			append_dev(grouping_svlt, groups_1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(groups_1, null);
    			}

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[7]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*selectedGroupBy*/ 1) {
    				select_option(select, /*selectedGroupBy*/ ctx[0]);
    			}

    			if (dirty & /*selectedGroupBy*/ 1) set_data_dev(t8, /*selectedGroupBy*/ ctx[0]);
    			if (dirty & /*groups*/ 4 && t10_value !== (t10_value = /*groups*/ ctx[2].length + "")) set_data_dev(t10, t10_value);

    			if (dirty & /*groups, selectedGroupByValue*/ 6) {
    				const each_value = /*groups*/ ctx[2];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, groups_1, destroy_block, create_each_block$1, null, get_each_context$1);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(grouping_svlt);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			dispose();
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
    	let $dbVersion;
    	let $albumPlayingIdStore;
    	let $selectedGroupByValueStore;
    	let $selectedGroupByStore;
    	validate_store(dbVersion, "dbVersion");
    	component_subscribe($$self, dbVersion, $$value => $$invalidate(5, $dbVersion = $$value));
    	validate_store(albumPlayingIdStore, "albumPlayingIdStore");
    	component_subscribe($$self, albumPlayingIdStore, $$value => $$invalidate(6, $albumPlayingIdStore = $$value));
    	validate_store(selectedGroupByValueStore, "selectedGroupByValueStore");
    	component_subscribe($$self, selectedGroupByValueStore, $$value => $$invalidate(10, $selectedGroupByValueStore = $$value));
    	validate_store(selectedGroupByStore, "selectedGroupByStore");
    	component_subscribe($$self, selectedGroupByStore, $$value => $$invalidate(11, $selectedGroupByStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Grouping", slots, []);
    	let selectedGroupBy = localStorage.getItem("GroupBy");
    	let selectedGroupByValue = localStorage.getItem("GroupByValue");

    	// let selection = selectedGroupByValue
    	let groups = [];

    	let firstSelectedGroupByAssign = true;
    	let firstSelectedGroupByValueAssign = true;
    	let firstDbVersionAssign = true;

    	function getGrouping() {
    		getGroupingIPC(selectedGroupBy).then(result => {
    			$$invalidate(2, groups = result);

    			setTimeout(
    				() => {
    					try {
    						let inputRadioValue = document.querySelector("grouping-svlt groups").querySelector("input[type='radio']:checked").getAttribute("value");
    						document.querySelector(`group[name=${inputRadioValue}]`).scrollIntoView({ block: "center" });
    					} catch(_a) {
    						
    					}
    				},
    				100
    			);
    		});
    	}

    	function saveCurrentPlayingGroup() {
    		localStorage.setItem("GroupByValue", selectedGroupByValue);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Grouping> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[]];

    	function select_change_handler() {
    		selectedGroupBy = select_value(this);
    		$$invalidate(0, selectedGroupBy);
    	}

    	function input_change_handler() {
    		selectedGroupByValue = this.__value;
    		$$invalidate(1, selectedGroupByValue);
    	}

    	$$self.$capture_state = () => ({
    		getGroupingIPC,
    		albumPlayingIdStore,
    		dbVersion,
    		selectedGroupByStore,
    		selectedGroupByValueStore,
    		selectedGroupBy,
    		selectedGroupByValue,
    		groups,
    		firstSelectedGroupByAssign,
    		firstSelectedGroupByValueAssign,
    		firstDbVersionAssign,
    		getGrouping,
    		saveCurrentPlayingGroup,
    		$dbVersion,
    		$albumPlayingIdStore,
    		$selectedGroupByValueStore,
    		$selectedGroupByStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("selectedGroupBy" in $$props) $$invalidate(0, selectedGroupBy = $$props.selectedGroupBy);
    		if ("selectedGroupByValue" in $$props) $$invalidate(1, selectedGroupByValue = $$props.selectedGroupByValue);
    		if ("groups" in $$props) $$invalidate(2, groups = $$props.groups);
    		if ("firstSelectedGroupByAssign" in $$props) $$invalidate(3, firstSelectedGroupByAssign = $$props.firstSelectedGroupByAssign);
    		if ("firstSelectedGroupByValueAssign" in $$props) firstSelectedGroupByValueAssign = $$props.firstSelectedGroupByValueAssign;
    		if ("firstDbVersionAssign" in $$props) $$invalidate(4, firstDbVersionAssign = $$props.firstDbVersionAssign);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$dbVersion, firstDbVersionAssign*/ 48) {
    			 {

    				if (firstDbVersionAssign === true) {
    					$$invalidate(4, firstDbVersionAssign = false);
    				} else {
    					getGrouping();
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*$albumPlayingIdStore*/ 64) {
    			 {
    				saveCurrentPlayingGroup();
    			}
    		}

    		if ($$self.$$.dirty & /*selectedGroupByValue*/ 2) {
    			 {
    				// Get Art Grid Albums as soon as the variable is set.
    				//TODO Save to config file
    				set_store_value(selectedGroupByValueStore, $selectedGroupByValueStore = selectedGroupByValue, $selectedGroupByValueStore);
    			}
    		}

    		if ($$self.$$.dirty & /*selectedGroupBy, firstSelectedGroupByAssign*/ 9) {
    			 {

    				if (firstSelectedGroupByAssign === true) {
    					$$invalidate(3, firstSelectedGroupByAssign = false);

    					// Get Grouping as soon as the variable is set.
    					getGrouping();

    					set_store_value(selectedGroupByStore, $selectedGroupByStore = selectedGroupBy, $selectedGroupByStore);
    				} else {
    					if (selectedGroupBy !== localStorage.getItem("GroupBy")) {
    						// Get Grouping if grouping is changed.
    						getGrouping();

    						set_store_value(selectedGroupByStore, $selectedGroupByStore = selectedGroupBy, $selectedGroupByStore);
    						localStorage.setItem("GroupBy", selectedGroupBy);
    					} //TODO Save to config file
    				}
    			}
    		}
    	};

    	return [
    		selectedGroupBy,
    		selectedGroupByValue,
    		groups,
    		firstSelectedGroupByAssign,
    		firstDbVersionAssign,
    		$dbVersion,
    		$albumPlayingIdStore,
    		select_change_handler,
    		input_change_handler,
    		$$binding_groups
    	];
    }

    class Grouping extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Grouping",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    // import { playbackCursor } from '../store/player.store'
    function nextSong() {
        let playbackCursorIndex = undefined;
        playbackCursor.subscribe((playbackCursorStore) => {
            playbackCursorIndex = playbackCursorStore[0];
        })();
        playbackCursor.set([playbackCursorIndex + 1, true]);
        // let playback = undefined
        // playbackCursor.subscribe((playbackStore) => {
        // 	playback = playbackStore
        // })()
        // playbackCursor.set({
        // 	indexToPlay: playback['indexToPlay'] + 1,
        // 	playNow: true
        // })
    }

    /* src/components/NextButton.svelte generated by Svelte v3.31.0 */
    const file$5 = "src/components/NextButton.svelte";

    function create_fragment$5(ctx) {
    	let svg;
    	let polygon;
    	let rect;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			polygon = svg_element("polygon");
    			rect = svg_element("rect");
    			attr_dev(polygon, "points", "87,48.25 0,4.75 0,91.75 ");
    			add_location(polygon, file$5, 16, 1, 305);
    			attr_dev(rect, "x", "90");
    			attr_dev(rect, "y", "5");
    			attr_dev(rect, "width", "10");
    			attr_dev(rect, "height", "87");
    			add_location(rect, file$5, 17, 1, 352);
    			attr_dev(svg, "class", "player-button");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "id", "Layer_1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "x", "0px");
    			attr_dev(svg, "y", "0px");
    			attr_dev(svg, "viewBox", "0 0 100 100");
    			attr_dev(svg, "xml:space", "preserve");
    			add_location(svg, file$5, 4, 0, 73);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, polygon);
    			append_dev(svg, rect);

    			if (!mounted) {
    				dispose = listen_dev(svg, "click", /*click_handler*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			mounted = false;
    			dispose();
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

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NextButton", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NextButton> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => nextSong();
    	$$self.$capture_state = () => ({ nextSong });
    	return [click_handler];
    }

    class NextButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NextButton",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/components/PreviousButton.svelte generated by Svelte v3.31.0 */
    const file$6 = "src/components/PreviousButton.svelte";

    function create_fragment$6(ctx) {
    	let svg;
    	let polygon;
    	let rect;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			polygon = svg_element("polygon");
    			rect = svg_element("rect");
    			attr_dev(polygon, "points", "13,48.5 100,92 100,5 ");
    			add_location(polygon, file$6, 29, 1, 784);
    			attr_dev(rect, "x", "0");
    			attr_dev(rect, "y", "4.75");
    			attr_dev(rect, "transform", "matrix(-1 -1.224647e-16 1.224647e-16 -1 10 96.5001)");
    			attr_dev(rect, "width", "10");
    			attr_dev(rect, "height", "87");
    			add_location(rect, file$6, 30, 1, 828);
    			attr_dev(svg, "class", "player-button");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "id", "Layer_1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "x", "0px");
    			attr_dev(svg, "y", "0px");
    			attr_dev(svg, "viewBox", "0 0 100 100");
    			attr_dev(svg, "xml:space", "preserve");
    			add_location(svg, file$6, 17, 0, 541);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, polygon);
    			append_dev(svg, rect);

    			if (!mounted) {
    				dispose = listen_dev(svg, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
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

    function instance$6($$self, $$props, $$invalidate) {
    	let $playbackCursor;
    	let $playbackStore;
    	validate_store(playbackCursor, "playbackCursor");
    	component_subscribe($$self, playbackCursor, $$value => $$invalidate(3, $playbackCursor = $$value));
    	validate_store(playbackStore, "playbackStore");
    	component_subscribe($$self, playbackStore, $$value => $$invalidate(4, $playbackStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PreviousButton", slots, []);
    	let { player } = $$props;

    	function previousButtonEvent() {
    		if (player.currentTime <= 2) {
    			let playbackCursorIndex = $playbackCursor[0];
    			let previousPlaybackCursorIndex = playbackCursorIndex - 1;
    			let previousSong = $playbackStore[previousPlaybackCursorIndex];

    			if (previousSong) {
    				set_store_value(playbackCursor, $playbackCursor = [previousPlaybackCursorIndex, true], $playbackCursor);
    			}
    		} else {
    			$$invalidate(1, player.currentTime = 0, player);
    		}
    	}

    	const writable_props = ["player"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PreviousButton> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => previousButtonEvent();

    	$$self.$$set = $$props => {
    		if ("player" in $$props) $$invalidate(1, player = $$props.player);
    	};

    	$$self.$capture_state = () => ({
    		playbackCursor,
    		playbackStore,
    		player,
    		previousButtonEvent,
    		$playbackCursor,
    		$playbackStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("player" in $$props) $$invalidate(1, player = $$props.player);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [previousButtonEvent, player, click_handler];
    }

    class PreviousButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { player: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PreviousButton",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*player*/ ctx[1] === undefined && !("player" in props)) {
    			console.warn("<PreviousButton> was created without expected prop 'player'");
    		}
    	}

    	get player() {
    		throw new Error("<PreviousButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set player(value) {
    		throw new Error("<PreviousButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/PlayButton.svelte generated by Svelte v3.31.0 */
    const file$7 = "src/components/PlayButton.svelte";

    function create_fragment$7(ctx) {
    	let play_pause_button;
    	let left_part;
    	let t;
    	let right_part;
    	let play_pause_button_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			play_pause_button = element("play-pause-button");
    			left_part = element("left-part");
    			t = space();
    			right_part = element("right-part");
    			set_custom_element_data(left_part, "class", "svelte-1lvzyl3");
    			add_location(left_part, file$7, 15, 1, 350);
    			set_custom_element_data(right_part, "class", "svelte-1lvzyl3");
    			add_location(right_part, file$7, 17, 1, 366);
    			set_custom_element_data(play_pause_button, "class", play_pause_button_class_value = "" + (null_to_empty(/*$isPlaying*/ ctx[0] ? "" : "playing") + " svelte-1lvzyl3"));
    			add_location(play_pause_button, file$7, 14, 0, 263);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, play_pause_button, anchor);
    			append_dev(play_pause_button, left_part);
    			append_dev(play_pause_button, t);
    			append_dev(play_pause_button, right_part);

    			if (!mounted) {
    				dispose = listen_dev(play_pause_button, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$isPlaying*/ 1 && play_pause_button_class_value !== (play_pause_button_class_value = "" + (null_to_empty(/*$isPlaying*/ ctx[0] ? "" : "playing") + " svelte-1lvzyl3"))) {
    				set_custom_element_data(play_pause_button, "class", play_pause_button_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(play_pause_button);
    			mounted = false;
    			dispose();
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
    	let $isPlaying;
    	validate_store(isPlaying, "isPlaying");
    	component_subscribe($$self, isPlaying, $$value => $$invalidate(0, $isPlaying = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PlayButton", slots, []);
    	let { player } = $$props;

    	function togglePlay() {
    		if ($isPlaying) {
    			player.pause();
    		} else {
    			if (player.src !== "") {
    				player.play();
    			}
    		}
    	}

    	const writable_props = ["player"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PlayButton> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => togglePlay();

    	$$self.$$set = $$props => {
    		if ("player" in $$props) $$invalidate(2, player = $$props.player);
    	};

    	$$self.$capture_state = () => ({
    		isPlaying,
    		player,
    		togglePlay,
    		$isPlaying
    	});

    	$$self.$inject_state = $$props => {
    		if ("player" in $$props) $$invalidate(2, player = $$props.player);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$isPlaying, togglePlay, player, click_handler];
    }

    class PlayButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { player: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PlayButton",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*player*/ ctx[2] === undefined && !("player" in props)) {
    			console.warn("<PlayButton> was created without expected prop 'player'");
    		}
    	}

    	get player() {
    		throw new Error("<PlayButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set player(value) {
    		throw new Error("<PlayButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/PlayerProgress.svelte generated by Svelte v3.31.0 */
    const file$8 = "src/components/PlayerProgress.svelte";

    function create_fragment$8(ctx) {
    	let player_progress;
    	let progress_foreground;
    	let t;
    	let div;

    	const block = {
    		c: function create() {
    			player_progress = element("player-progress");
    			progress_foreground = element("progress-foreground");
    			t = space();
    			div = element("div");
    			set_custom_element_data(progress_foreground, "class", "svelte-19dx646");
    			add_location(progress_foreground, file$8, 84, 1, 3760);
    			attr_dev(div, "id", "waveform-data");
    			attr_dev(div, "class", "svelte-19dx646");
    			add_location(div, file$8, 85, 1, 3785);
    			set_custom_element_data(player_progress, "class", "svelte-19dx646");
    			add_location(player_progress, file$8, 83, 0, 3741);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, player_progress, anchor);
    			append_dev(player_progress, progress_foreground);
    			append_dev(player_progress, t);
    			append_dev(player_progress, div);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(player_progress);
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

    function instance$8($$self, $$props, $$invalidate) {
    	let $playbackCursor;
    	let $playbackStore;
    	validate_store(playbackCursor, "playbackCursor");
    	component_subscribe($$self, playbackCursor, $$value => $$invalidate(3, $playbackCursor = $$value));
    	validate_store(playbackStore, "playbackStore");
    	component_subscribe($$self, playbackStore, $$value => $$invalidate(8, $playbackStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PlayerProgress", slots, []);

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

    	
    	let { player } = $$props;
    	let { song } = $$props;
    	let pauseDebounce = undefined;
    	let isMouseDown = false;
    	let isMouseIn = false;
    	let isPlaybackCursorFirstAssign = true;
    	let playingSongID = undefined;

    	function getWaveformImage(index) {
    		return __awaiter(this, void 0, void 0, function* () {
    			let song = $playbackStore === null || $playbackStore === void 0
    			? void 0
    			: $playbackStore[index];

    			if (song.ID === playingSongID) return;
    			playingSongID = song.ID;

    			// Fade Out
    			document.documentElement.style.setProperty("--waveform-opacity", "0");

    			setWaveSource(song.SourceFile, song.Duration).then(() => {
    				setTimeout(
    					() => {
    						let currentSongPlaying = $playbackStore[$playbackCursor[0]];

    						if (currentSongPlaying.ID === song.ID) {
    							document.documentElement.style.setProperty("--waveform-opacity", "1");
    						}
    					},
    					250
    				);
    			});
    		});
    	}

    	onMount(() => {
    		createWaveFormElement("#waveform-data");
    		hookPlayerProgressEvents();
    	});

    	function hookPlayerProgressEvents() {
    		let playerProgress = document.querySelector("player-progress");
    		let playerForeground = document.querySelector("player-progress progress-foreground");
    		playerProgress.addEventListener("mouseenter", () => isMouseIn = true);

    		playerProgress.addEventListener("mouseleave", () => {
    			isMouseIn = false;

    			// Resets also mouse down if the user leaves the area while holding the mouse down then comes back with mouse up the event would still trigger.
    			isMouseDown = false;
    		});

    		playerProgress.addEventListener("mousedown", () => isMouseDown = true);
    		playerProgress.addEventListener("mouseup", () => isMouseDown = false);

    		playerProgress.addEventListener("mousemove", evt => {
    			if (isMouseDown && isMouseIn) applyProgressChange(evt);
    		});

    		playerProgress.addEventListener("click", evt => applyProgressChange(evt));

    		function applyProgressChange(evt) {
    			player.pause();
    			playerForeground.classList.add("not-smooth");
    			let playerWidth = playerProgress["scrollWidth"];
    			let selectedPercent = Math.ceil(100 / playerWidth * evt["offsetX"]);
    			document.documentElement.style.setProperty("--song-time", `${selectedPercent}%`);
    			clearTimeout(pauseDebounce);

    			pauseDebounce = setTimeout(
    				() => {
    					$$invalidate(0, player.currentTime = song["Duration"] / (100 / selectedPercent), player);
    					playerForeground.classList.remove("not-smooth");
    					player.play();
    				},
    				500
    			);
    		}
    	}

    	const writable_props = ["player", "song"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PlayerProgress> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("player" in $$props) $$invalidate(0, player = $$props.player);
    		if ("song" in $$props) $$invalidate(1, song = $$props.song);
    	};

    	$$self.$capture_state = () => ({
    		__awaiter,
    		onMount,
    		getWaveformIPC,
    		playbackCursor,
    		playbackStore,
    		createWaveFormElement,
    		setWaveSource,
    		player,
    		song,
    		pauseDebounce,
    		isMouseDown,
    		isMouseIn,
    		isPlaybackCursorFirstAssign,
    		playingSongID,
    		getWaveformImage,
    		hookPlayerProgressEvents,
    		$playbackCursor,
    		$playbackStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("player" in $$props) $$invalidate(0, player = $$props.player);
    		if ("song" in $$props) $$invalidate(1, song = $$props.song);
    		if ("pauseDebounce" in $$props) pauseDebounce = $$props.pauseDebounce;
    		if ("isMouseDown" in $$props) isMouseDown = $$props.isMouseDown;
    		if ("isMouseIn" in $$props) isMouseIn = $$props.isMouseIn;
    		if ("isPlaybackCursorFirstAssign" in $$props) $$invalidate(2, isPlaybackCursorFirstAssign = $$props.isPlaybackCursorFirstAssign);
    		if ("playingSongID" in $$props) playingSongID = $$props.playingSongID;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*isPlaybackCursorFirstAssign, $playbackCursor*/ 12) {
    			 {
    				if (isPlaybackCursorFirstAssign === true) $$invalidate(2, isPlaybackCursorFirstAssign = false); else {
    					getWaveformImage($playbackCursor[0]);
    				}
    			}
    		}
    	};

    	return [player, song, isPlaybackCursorFirstAssign, $playbackCursor];
    }

    class PlayerProgress extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { player: 0, song: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PlayerProgress",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*player*/ ctx[0] === undefined && !("player" in props)) {
    			console.warn("<PlayerProgress> was created without expected prop 'player'");
    		}

    		if (/*song*/ ctx[1] === undefined && !("song" in props)) {
    			console.warn("<PlayerProgress> was created without expected prop 'song'");
    		}
    	}

    	get player() {
    		throw new Error("<PlayerProgress>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set player(value) {
    		throw new Error("<PlayerProgress>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get song() {
    		throw new Error("<PlayerProgress>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set song(value) {
    		throw new Error("<PlayerProgress>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/PlayerVolumeBar.svelte generated by Svelte v3.31.0 */
    const file$9 = "src/components/PlayerVolumeBar.svelte";

    function create_fragment$9(ctx) {
    	let volume_bar;
    	let input;
    	let input_step_value;
    	let t0;
    	let background;
    	let t1;
    	let volume_thumb;
    	let t2_value = Math.round(/*volume*/ ctx[0]) + "";
    	let t2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			volume_bar = element("volume-bar");
    			input = element("input");
    			t0 = space();
    			background = element("background");
    			t1 = space();
    			volume_thumb = element("volume-thumb");
    			t2 = text(t2_value);
    			attr_dev(input, "type", "range");
    			attr_dev(input, "min", "0");
    			attr_dev(input, "max", "100");
    			attr_dev(input, "step", input_step_value = /*isShiftKeyDown*/ ctx[1] ? "5" : "1");
    			attr_dev(input, "class", "svelte-1enb6co");
    			add_location(input, file$9, 41, 1, 1238);
    			attr_dev(background, "class", "svelte-1enb6co");
    			add_location(background, file$9, 52, 1, 1472);
    			set_custom_element_data(volume_thumb, "class", "svelte-1enb6co");
    			add_location(volume_thumb, file$9, 53, 1, 1488);
    			set_custom_element_data(volume_bar, "class", "svelte-1enb6co");
    			add_location(volume_bar, file$9, 40, 0, 1224);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, volume_bar, anchor);
    			append_dev(volume_bar, input);
    			set_input_value(input, /*volume*/ ctx[0]);
    			append_dev(volume_bar, t0);
    			append_dev(volume_bar, background);
    			append_dev(volume_bar, t1);
    			append_dev(volume_bar, volume_thumb);
    			append_dev(volume_thumb, t2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "keydown", /*keydown_handler*/ ctx[4], false, false, false),
    					listen_dev(input, "keyup", /*keyup_handler*/ ctx[5], false, false, false),
    					listen_dev(input, "change", /*input_change_input_handler*/ ctx[6]),
    					listen_dev(input, "input", /*input_change_input_handler*/ ctx[6])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*isShiftKeyDown*/ 2 && input_step_value !== (input_step_value = /*isShiftKeyDown*/ ctx[1] ? "5" : "1")) {
    				attr_dev(input, "step", input_step_value);
    			}

    			if (dirty & /*volume*/ 1) {
    				set_input_value(input, /*volume*/ ctx[0]);
    			}

    			if (dirty & /*volume*/ 1 && t2_value !== (t2_value = Math.round(/*volume*/ ctx[0]) + "")) set_data_dev(t2, t2_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(volume_bar);
    			mounted = false;
    			run_all(dispose);
    		}
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PlayerVolumeBar", slots, []);
    	let volume = 0;
    	let { player } = $$props;
    	let isShiftKeyDown = false;
    	let isPlayerLoaded = false;
    	let saveVolumeDebounce = undefined;

    	onMount(() => {
    		
    	});

    	function volumeChange() {
    		$$invalidate(2, player.volume = volume / 100, player);
    		let volumeBarWidth = document.querySelector("volume-bar").clientWidth;
    		let volumeThumbWidth = document.querySelector("volume-bar volume-thumb").clientWidth;
    		document.documentElement.style.setProperty("--volume-level", `${(volumeBarWidth - volumeThumbWidth) * (volume / 100)}px`);
    		clearTimeout(saveVolumeDebounce);

    		saveVolumeDebounce = setTimeout(
    			() => {
    				localStorage.setItem("volume", String(volume));
    			},
    			1000
    		);
    	}

    	function loadLocalStorageVolume() {
    		$$invalidate(0, volume = Number(localStorage.getItem("volume") || NaN));

    		if (volume === undefined || isNaN(volume) || volume > 100) {
    			$$invalidate(0, volume = 25);
    			localStorage.setItem("volume", String(volume));
    		}

    		$$invalidate(2, player.volume = volume / 100, player);
    		volumeChange();
    	}

    	const writable_props = ["player"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PlayerVolumeBar> was created with unknown prop '${key}'`);
    	});

    	const keydown_handler = evt => {
    		if (evt["key"] === "Shift") $$invalidate(1, isShiftKeyDown = true);
    	};

    	const keyup_handler = () => $$invalidate(1, isShiftKeyDown = false);

    	function input_change_input_handler() {
    		volume = to_number(this.value);
    		$$invalidate(0, volume);
    	}

    	$$self.$$set = $$props => {
    		if ("player" in $$props) $$invalidate(2, player = $$props.player);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		volume,
    		player,
    		isShiftKeyDown,
    		isPlayerLoaded,
    		saveVolumeDebounce,
    		volumeChange,
    		loadLocalStorageVolume
    	});

    	$$self.$inject_state = $$props => {
    		if ("volume" in $$props) $$invalidate(0, volume = $$props.volume);
    		if ("player" in $$props) $$invalidate(2, player = $$props.player);
    		if ("isShiftKeyDown" in $$props) $$invalidate(1, isShiftKeyDown = $$props.isShiftKeyDown);
    		if ("isPlayerLoaded" in $$props) $$invalidate(3, isPlayerLoaded = $$props.isPlayerLoaded);
    		if ("saveVolumeDebounce" in $$props) saveVolumeDebounce = $$props.saveVolumeDebounce;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*player, isPlayerLoaded*/ 12) {
    			 {
    				if (player && isPlayerLoaded === false) {
    					$$invalidate(3, isPlayerLoaded = true);
    					loadLocalStorageVolume();
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*volume, isPlayerLoaded*/ 9) {
    			 {

    				if (isPlayerLoaded === true) {
    					volumeChange();
    				}
    			}
    		}
    	};

    	return [
    		volume,
    		isShiftKeyDown,
    		player,
    		isPlayerLoaded,
    		keydown_handler,
    		keyup_handler,
    		input_change_input_handler
    	];
    }

    class PlayerVolumeBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { player: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PlayerVolumeBar",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*player*/ ctx[2] === undefined && !("player" in props)) {
    			console.warn("<PlayerVolumeBar> was created without expected prop 'player'");
    		}
    	}

    	get player() {
    		throw new Error("<PlayerVolumeBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set player(value) {
    		throw new Error("<PlayerVolumeBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function escapeString(data) {
        data = data.replace('#', escape('#'));
        return data;
    }

    /* src/includes/Player.svelte generated by Svelte v3.31.0 */

    const { console: console_1 } = globals;

    const file$a = "src/includes/Player.svelte";

    function create_fragment$a(ctx) {
    	let player_svlt;
    	let audio;
    	let track;
    	let audio_controls_value;
    	let t0;
    	let player_buttons;
    	let previousbutton;
    	let t1;
    	let playbutton;
    	let t2;
    	let nextbutton;
    	let t3;
    	let playervolumebar;
    	let t4;
    	let playerprogress;
    	let current;
    	let mounted;
    	let dispose;

    	previousbutton = new PreviousButton({
    			props: { player: /*player*/ ctx[1] },
    			$$inline: true
    		});

    	playbutton = new PlayButton({
    			props: { player: /*player*/ ctx[1] },
    			$$inline: true
    		});

    	nextbutton = new NextButton({ $$inline: true });

    	playervolumebar = new PlayerVolumeBar({
    			props: { player: /*player*/ ctx[1] },
    			$$inline: true
    		});

    	playerprogress = new PlayerProgress({
    			props: {
    				player: /*player*/ ctx[1],
    				song: /*currentSong*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			player_svlt = element("player-svlt");
    			audio = element("audio");
    			track = element("track");
    			t0 = space();
    			player_buttons = element("player-buttons");
    			create_component(previousbutton.$$.fragment);
    			t1 = space();
    			create_component(playbutton.$$.fragment);
    			t2 = space();
    			create_component(nextbutton.$$.fragment);
    			t3 = space();
    			create_component(playervolumebar.$$.fragment);
    			t4 = space();
    			create_component(playerprogress.$$.fragment);
    			attr_dev(track, "kind", "captions");
    			add_location(track, file$a, 145, 2, 5610);
    			audio.controls = audio_controls_value = true;
    			attr_dev(audio, "class", "svelte-ho3z84");
    			add_location(audio, file$a, 144, 1, 5492);
    			set_custom_element_data(player_buttons, "class", "svelte-ho3z84");
    			add_location(player_buttons, file$a, 148, 1, 5648);
    			set_custom_element_data(player_svlt, "class", "svelte-ho3z84");
    			add_location(player_svlt, file$a, 143, 0, 5477);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, player_svlt, anchor);
    			append_dev(player_svlt, audio);
    			append_dev(audio, track);
    			append_dev(player_svlt, t0);
    			append_dev(player_svlt, player_buttons);
    			mount_component(previousbutton, player_buttons, null);
    			append_dev(player_buttons, t1);
    			mount_component(playbutton, player_buttons, null);
    			append_dev(player_buttons, t2);
    			mount_component(nextbutton, player_buttons, null);
    			append_dev(player_svlt, t3);
    			mount_component(playervolumebar, player_svlt, null);
    			append_dev(player_svlt, t4);
    			mount_component(playerprogress, player_svlt, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(audio, "play", /*play_handler*/ ctx[6], false, false, false),
    					listen_dev(audio, "pause", /*pause_handler*/ ctx[7], false, false, false),
    					listen_dev(audio, "ended", /*ended_handler*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const previousbutton_changes = {};
    			if (dirty & /*player*/ 2) previousbutton_changes.player = /*player*/ ctx[1];
    			previousbutton.$set(previousbutton_changes);
    			const playbutton_changes = {};
    			if (dirty & /*player*/ 2) playbutton_changes.player = /*player*/ ctx[1];
    			playbutton.$set(playbutton_changes);
    			const playervolumebar_changes = {};
    			if (dirty & /*player*/ 2) playervolumebar_changes.player = /*player*/ ctx[1];
    			playervolumebar.$set(playervolumebar_changes);
    			const playerprogress_changes = {};
    			if (dirty & /*player*/ 2) playerprogress_changes.player = /*player*/ ctx[1];
    			if (dirty & /*currentSong*/ 1) playerprogress_changes.song = /*currentSong*/ ctx[0];
    			playerprogress.$set(playerprogress_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(previousbutton.$$.fragment, local);
    			transition_in(playbutton.$$.fragment, local);
    			transition_in(nextbutton.$$.fragment, local);
    			transition_in(playervolumebar.$$.fragment, local);
    			transition_in(playerprogress.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(previousbutton.$$.fragment, local);
    			transition_out(playbutton.$$.fragment, local);
    			transition_out(nextbutton.$$.fragment, local);
    			transition_out(playervolumebar.$$.fragment, local);
    			transition_out(playerprogress.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(player_svlt);
    			destroy_component(previousbutton);
    			destroy_component(playbutton);
    			destroy_component(nextbutton);
    			destroy_component(playervolumebar);
    			destroy_component(playerprogress);
    			mounted = false;
    			run_all(dispose);
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

    function getUrlFromBuffer(targetBuffer) {
    	return window.URL.createObjectURL(new Blob([targetBuffer]));
    }

    function resetProgress() {
    	let playerForeground = document.querySelector("player-progress progress-foreground");

    	if (playerForeground) {
    		playerForeground.classList.add("not-smooth");
    		document.documentElement.style.setProperty("--song-time", `0%`);

    		setTimeout(
    			() => {
    				playerForeground.classList.remove("not-smooth");
    			},
    			1000
    		);
    	}
    }

    function fetchSong(songPath) {
    	return new Promise((resolve, reject) => {
    			fetch(songPath).then(data => data.arrayBuffer()).then(arrayBuffer => {
    				resolve(arrayBuffer);
    			}).catch(err => {
    				//TODO Alert user that song is not found and offer a way to remove from DB.
    				console.log("OOPS", err);
    			});
    		});
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let $playbackCursor;
    	let $playbackStore;
    	let $isPlaying;
    	let $songPlayingIDStore;
    	let $albumPlayingIdStore;
    	validate_store(playbackCursor, "playbackCursor");
    	component_subscribe($$self, playbackCursor, $$value => $$invalidate(5, $playbackCursor = $$value));
    	validate_store(playbackStore, "playbackStore");
    	component_subscribe($$self, playbackStore, $$value => $$invalidate(13, $playbackStore = $$value));
    	validate_store(isPlaying, "isPlaying");
    	component_subscribe($$self, isPlaying, $$value => $$invalidate(14, $isPlaying = $$value));
    	validate_store(songPlayingIDStore, "songPlayingIDStore");
    	component_subscribe($$self, songPlayingIDStore, $$value => $$invalidate(15, $songPlayingIDStore = $$value));
    	validate_store(albumPlayingIdStore, "albumPlayingIdStore");
    	component_subscribe($$self, albumPlayingIdStore, $$value => $$invalidate(16, $albumPlayingIdStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Player", slots, []);

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

    	
    	let progress = 0;
    	let currentSong = undefined;
    	let nextSongPreloaded = undefined;
    	let player = undefined;
    	let playingInterval = undefined;
    	let firstPlaybackCursorAssign = true;
    	let preLoadNextSongDebounce = undefined;

    	function playSong(playbackCursor) {
    		return __awaiter(this, void 0, void 0, function* () {
    			let indexToPlay = playbackCursor[0];
    			let doPlayNow = playbackCursor[1];
    			let songs = $playbackStore;
    			let songToPlay = songs[indexToPlay];
    			let url = undefined;

    			if ((songToPlay === null || songToPlay === void 0
    			? void 0
    			: songToPlay.ID) === (nextSongPreloaded === null || nextSongPreloaded === void 0
    			? void 0
    			: nextSongPreloaded.ID)) {
    				url = nextSongPreloaded.BufferUrl;
    			} else if (songToPlay === null || songToPlay === void 0
    			? void 0
    			: songToPlay.ID) {
    				let songBuffer = yield fetchSong(escapeString(songToPlay["SourceFile"]));
    				url = getUrlFromBuffer(songBuffer);
    			} else {
    				player.pause();
    				$$invalidate(1, player.src = "", player);
    				set_store_value(isPlaying, $isPlaying = false, $isPlaying);
    				return;
    			}

    			$$invalidate(1, player.src = url, player);
    			$$invalidate(0, currentSong = songToPlay);

    			if (doPlayNow === true) {
    				player.play().then(() => {
    					set_store_value(songPlayingIDStore, $songPlayingIDStore = songToPlay.ID, $songPlayingIDStore);
    					localStorage.setItem("LastPlayedAlbumID", $albumPlayingIdStore);
    					localStorage.setItem("LastPlayedSongID", String(songToPlay.ID));
    					localStorage.setItem("LastPlayedSongIndex", String(indexToPlay));
    					clearTimeout(preLoadNextSongDebounce);

    					preLoadNextSongDebounce = setTimeout(
    						() => {
    							preLoadNextSong(playbackCursor);
    						},
    						500
    					);
    				}).catch(err => {
    					
    				});
    			} else {
    				player.pause();
    			}
    		});
    	}

    	function preLoadNextSong(playbackCursor) {
    		let nextSong = playbackCursor[0] + 1;
    		let songs = $playbackStore;
    		let songToPlay = songs[nextSong];

    		if (songToPlay) {
    			fetchSong(escapeString(songToPlay["SourceFile"])).then(buffer => {
    				nextSongPreloaded = {
    					ID: songToPlay.ID,
    					BufferUrl: getUrlFromBuffer(buffer)
    				};
    			});
    		}
    	}

    	onMount(() => {
    		$$invalidate(1, player = document.querySelector("audio"));
    	});

    	function stopPlayer() {
    		player.removeAttribute("src");
    		player.pause();
    		document.documentElement.style.setProperty("--song-time", `0%`);
    		set_store_value(isPlaying, $isPlaying = false, $isPlaying);
    		return;
    	}

    	function startInterval() {
    		set_store_value(isPlaying, $isPlaying = true, $isPlaying);
    		clearInterval(playingInterval);

    		playingInterval = setInterval(
    			() => {
    				// Rounds to 2 decimals.
    				progress = Math.round((100 / currentSong["Duration"] * player.currentTime + Number.EPSILON) * 100) / 100;

    				document.documentElement.style.setProperty("--song-time", `${progress}%`);
    			},
    			100
    		);
    	}

    	function stopInterval() {
    		// console.log('Stop')
    		set_store_value(isPlaying, $isPlaying = false, $isPlaying);

    		clearInterval(playingInterval);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Player> was created with unknown prop '${key}'`);
    	});

    	const play_handler = () => startInterval();
    	const pause_handler = () => stopInterval();
    	const ended_handler = () => nextSong();

    	$$self.$capture_state = () => ({
    		__awaiter,
    		onMount,
    		NextButton,
    		PreviousButton,
    		PlayButton,
    		PlayerProgress,
    		PlayerVolumeBar,
    		isPlaying,
    		songPlayingIDStore,
    		nextSong,
    		escapeString,
    		albumPlayingIdStore,
    		playbackCursor,
    		playbackStore,
    		progress,
    		currentSong,
    		nextSongPreloaded,
    		player,
    		playingInterval,
    		firstPlaybackCursorAssign,
    		preLoadNextSongDebounce,
    		playSong,
    		preLoadNextSong,
    		getUrlFromBuffer,
    		resetProgress,
    		stopPlayer,
    		fetchSong,
    		startInterval,
    		stopInterval,
    		$playbackCursor,
    		$playbackStore,
    		$isPlaying,
    		$songPlayingIDStore,
    		$albumPlayingIdStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("progress" in $$props) progress = $$props.progress;
    		if ("currentSong" in $$props) $$invalidate(0, currentSong = $$props.currentSong);
    		if ("nextSongPreloaded" in $$props) nextSongPreloaded = $$props.nextSongPreloaded;
    		if ("player" in $$props) $$invalidate(1, player = $$props.player);
    		if ("playingInterval" in $$props) playingInterval = $$props.playingInterval;
    		if ("firstPlaybackCursorAssign" in $$props) $$invalidate(4, firstPlaybackCursorAssign = $$props.firstPlaybackCursorAssign);
    		if ("preLoadNextSongDebounce" in $$props) preLoadNextSongDebounce = $$props.preLoadNextSongDebounce;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*firstPlaybackCursorAssign, $playbackCursor*/ 48) {
    			 {
    				if (firstPlaybackCursorAssign === true) {
    					$$invalidate(4, firstPlaybackCursorAssign = false);
    				} else {
    					// resetProgress()
    					playSong($playbackCursor);
    				}
    			}
    		}
    	};

    	return [
    		currentSong,
    		player,
    		startInterval,
    		stopInterval,
    		firstPlaybackCursorAssign,
    		$playbackCursor,
    		play_handler,
    		pause_handler,
    		ended_handler
    	];
    }

    class Player extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Player",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/components/Star.svelte generated by Svelte v3.31.0 */
    const file$b = "src/components/Star.svelte";

    function create_fragment$b(ctx) {
    	let stars;
    	let img0;
    	let img0_src_value;
    	let t;
    	let img1;
    	let img1_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			stars = element("stars");
    			img0 = element("img");
    			t = space();
    			img1 = element("img");
    			attr_dev(img0, "class", "delete-star svelte-1vgxguc");
    			if (img0.src !== (img0_src_value = "./img/star/star-delete.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			add_location(img0, file$b, 30, 1, 800);
    			attr_dev(img1, "class", "star svelte-1vgxguc");
    			if (img1.src !== (img1_src_value = "./img/star/star-" + /*starLevel*/ ctx[0] + ".svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$b, 44, 1, 1218);
    			attr_dev(stars, "class", "svelte-1vgxguc");
    			add_location(stars, file$b, 29, 0, 726);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, stars, anchor);
    			append_dev(stars, img0);
    			append_dev(stars, t);
    			append_dev(stars, img1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(img0, "click", /*click_handler*/ ctx[5], false, false, false),
    					listen_dev(img1, "mouseleave", /*mouseleave_handler*/ ctx[6], false, false, false),
    					listen_dev(img1, "click", /*click_handler_1*/ ctx[7], false, false, false),
    					listen_dev(img1, "mousemove", /*mousemove_handler*/ ctx[8], false, false, false),
    					listen_dev(
    						stars,
    						"click",
    						function () {
    							if (is_function(/*dispatch*/ ctx[2]("starChange", { starLevel: /*starLevel*/ ctx[0] * 10 }))) /*dispatch*/ ctx[2]("starChange", { starLevel: /*starLevel*/ ctx[0] * 10 }).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*starLevel*/ 1 && img1.src !== (img1_src_value = "./img/star/star-" + /*starLevel*/ ctx[0] + ".svg")) {
    				attr_dev(img1, "src", img1_src_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(stars);
    			mounted = false;
    			run_all(dispose);
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
    	validate_slots("Star", slots, []);
    	const dispatch = createEventDispatcher();
    	let { songRating = 0 } = $$props;
    	let starLevel = songRating / 10;
    	let starLevelTemp = starLevel;
    	let starElementWidth = undefined;

    	function setStarLevel(e) {
    		if (!starElementWidth) {
    			starElementWidth = document.querySelector("img.star").scrollWidth;
    		}

    		let starValue = Math.trunc(100 / starElementWidth * e.offsetX / (100 / 10)) + 1;

    		if (starValue < 1) {
    			starValue = 1;
    		} else if (starValue > 10) {
    			starValue = 10;
    		}

    		$$invalidate(0, starLevel = starValue);
    	}

    	const writable_props = ["songRating"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Star> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(0, starLevel = 0);
    		$$invalidate(1, starLevelTemp = 0);
    	};

    	const mouseleave_handler = () => $$invalidate(0, starLevel = starLevelTemp);
    	const click_handler_1 = () => $$invalidate(1, starLevelTemp = starLevel);
    	const mousemove_handler = e => setStarLevel(e);

    	$$self.$$set = $$props => {
    		if ("songRating" in $$props) $$invalidate(4, songRating = $$props.songRating);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		songRating,
    		starLevel,
    		starLevelTemp,
    		starElementWidth,
    		setStarLevel
    	});

    	$$self.$inject_state = $$props => {
    		if ("songRating" in $$props) $$invalidate(4, songRating = $$props.songRating);
    		if ("starLevel" in $$props) $$invalidate(0, starLevel = $$props.starLevel);
    		if ("starLevelTemp" in $$props) $$invalidate(1, starLevelTemp = $$props.starLevelTemp);
    		if ("starElementWidth" in $$props) starElementWidth = $$props.starElementWidth;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*songRating*/ 16) {
    			 {
    				if (songRating) {
    					$$invalidate(0, starLevel = songRating / 10);
    				} else {
    					$$invalidate(0, starLevel = 0);
    				}
    			}
    		}
    	};

    	return [
    		starLevel,
    		starLevelTemp,
    		dispatch,
    		setStarLevel,
    		songRating,
    		click_handler,
    		mouseleave_handler,
    		click_handler_1,
    		mousemove_handler
    	];
    }

    class Star extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { songRating: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Star",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get songRating() {
    		throw new Error("<Star>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set songRating(value) {
    		throw new Error("<Star>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/SongListItem.svelte generated by Svelte v3.31.0 */

    const { console: console_1$1 } = globals;
    const file$c = "src/components/SongListItem.svelte";

    function create_fragment$c(ctx) {
    	let song_list_item;
    	let song_number;
    	let t0;
    	let t1;
    	let t2_value = /*song*/ ctx[0].Track + "";
    	let t2;
    	let t3;
    	let song_title;
    	let t4_value = /*song*/ ctx[0].Title + "";
    	let t4;
    	let t5;
    	let star;
    	let t6;
    	let song_duration;
    	let t7_value = parseDuration(/*song*/ ctx[0].Duration) + "";
    	let t7;
    	let song_list_item_id_value;
    	let song_list_item_class_value;
    	let current;

    	star = new Star({
    			props: { songRating: /*song*/ ctx[0].Rating },
    			$$inline: true
    		});

    	star.$on("starChange", /*setStar*/ ctx[6]);

    	const block = {
    		c: function create() {
    			song_list_item = element("song-list-item");
    			song_number = element("song-number");
    			t0 = text(/*index*/ ctx[1]);
    			t1 = text(" - ");
    			t2 = text(t2_value);
    			t3 = space();
    			song_title = element("song-title");
    			t4 = text(t4_value);
    			t5 = space();
    			create_component(star.$$.fragment);
    			t6 = space();
    			song_duration = element("song-duration");
    			t7 = text(t7_value);
    			set_custom_element_data(song_number, "class", "svelte-r9k04x");
    			add_location(song_number, file$c, 40, 1, 1239);
    			set_custom_element_data(song_title, "class", "svelte-r9k04x");
    			add_location(song_title, file$c, 41, 1, 1290);
    			set_custom_element_data(song_duration, "class", "svelte-r9k04x");
    			add_location(song_duration, file$c, 43, 1, 1388);
    			set_custom_element_data(song_list_item, "id", song_list_item_id_value = /*song*/ ctx[0].ID);
    			set_custom_element_data(song_list_item, "index", /*index*/ ctx[1]);

    			set_custom_element_data(song_list_item, "class", song_list_item_class_value = "\n\t" + (/*$songPlayingIDStore*/ ctx[2] === /*song*/ ctx[0].ID && /*$selectedAlbumId*/ ctx[3] === /*$albumPlayingIdStore*/ ctx[4]
    			? "playing"
    			: "") + "\n\t" + (/*$selectedSongsStore*/ ctx[5].includes(/*song*/ ctx[0].ID)
    			? "selected"
    			: "") + " svelte-r9k04x");

    			add_location(song_list_item, file$c, 30, 0, 977);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, song_list_item, anchor);
    			append_dev(song_list_item, song_number);
    			append_dev(song_number, t0);
    			append_dev(song_number, t1);
    			append_dev(song_number, t2);
    			append_dev(song_list_item, t3);
    			append_dev(song_list_item, song_title);
    			append_dev(song_title, t4);
    			append_dev(song_list_item, t5);
    			mount_component(star, song_list_item, null);
    			append_dev(song_list_item, t6);
    			append_dev(song_list_item, song_duration);
    			append_dev(song_duration, t7);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*index*/ 2) set_data_dev(t0, /*index*/ ctx[1]);
    			if ((!current || dirty & /*song*/ 1) && t2_value !== (t2_value = /*song*/ ctx[0].Track + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*song*/ 1) && t4_value !== (t4_value = /*song*/ ctx[0].Title + "")) set_data_dev(t4, t4_value);
    			const star_changes = {};
    			if (dirty & /*song*/ 1) star_changes.songRating = /*song*/ ctx[0].Rating;
    			star.$set(star_changes);
    			if ((!current || dirty & /*song*/ 1) && t7_value !== (t7_value = parseDuration(/*song*/ ctx[0].Duration) + "")) set_data_dev(t7, t7_value);

    			if (!current || dirty & /*song*/ 1 && song_list_item_id_value !== (song_list_item_id_value = /*song*/ ctx[0].ID)) {
    				set_custom_element_data(song_list_item, "id", song_list_item_id_value);
    			}

    			if (!current || dirty & /*index*/ 2) {
    				set_custom_element_data(song_list_item, "index", /*index*/ ctx[1]);
    			}

    			if (!current || dirty & /*$songPlayingIDStore, song, $selectedAlbumId, $albumPlayingIdStore, $selectedSongsStore*/ 61 && song_list_item_class_value !== (song_list_item_class_value = "\n\t" + (/*$songPlayingIDStore*/ ctx[2] === /*song*/ ctx[0].ID && /*$selectedAlbumId*/ ctx[3] === /*$albumPlayingIdStore*/ ctx[4]
    			? "playing"
    			: "") + "\n\t" + (/*$selectedSongsStore*/ ctx[5].includes(/*song*/ ctx[0].ID)
    			? "selected"
    			: "") + " svelte-r9k04x")) {
    				set_custom_element_data(song_list_item, "class", song_list_item_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(star.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(star.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(song_list_item);
    			destroy_component(star);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
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

    function instance$c($$self, $$props, $$invalidate) {
    	let $songPlayingIDStore;
    	let $selectedAlbumId;
    	let $albumPlayingIdStore;
    	let $selectedSongsStore;
    	validate_store(songPlayingIDStore, "songPlayingIDStore");
    	component_subscribe($$self, songPlayingIDStore, $$value => $$invalidate(2, $songPlayingIDStore = $$value));
    	validate_store(selectedAlbumId, "selectedAlbumId");
    	component_subscribe($$self, selectedAlbumId, $$value => $$invalidate(3, $selectedAlbumId = $$value));
    	validate_store(albumPlayingIdStore, "albumPlayingIdStore");
    	component_subscribe($$self, albumPlayingIdStore, $$value => $$invalidate(4, $albumPlayingIdStore = $$value));
    	validate_store(selectedSongsStore, "selectedSongsStore");
    	component_subscribe($$self, selectedSongsStore, $$value => $$invalidate(5, $selectedSongsStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SongListItem", slots, []);
    	
    	let { song } = $$props;
    	let { index } = $$props;

    	onMount(() => {
    		let lastPlayedSongId = Number(localStorage.getItem("LastPlayedSongID"));
    		set_store_value(songPlayingIDStore, $songPlayingIDStore = lastPlayedSongId, $songPlayingIDStore);

    		if (lastPlayedSongId === song.ID) {
    			let songEl = document.querySelector(`#${CSS.escape(String(lastPlayedSongId))}`);

    			if (songEl) {
    				songEl.scrollIntoView({ block: "center" });
    			}
    		}
    	});

    	function setStar(starChangeEvent) {
    		// TODO: Add updater
    		console.log(song.SourceFile, starChangeEvent.detail.starLevel);
    	}

    	const writable_props = ["song", "index"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<SongListItem> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("song" in $$props) $$invalidate(0, song = $$props.song);
    		if ("index" in $$props) $$invalidate(1, index = $$props.index);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		albumPlayingIdStore,
    		selectedAlbumId,
    		selectedSongsStore,
    		songPlayingIDStore,
    		Star,
    		song,
    		index,
    		parseDuration,
    		setStar,
    		$songPlayingIDStore,
    		$selectedAlbumId,
    		$albumPlayingIdStore,
    		$selectedSongsStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("song" in $$props) $$invalidate(0, song = $$props.song);
    		if ("index" in $$props) $$invalidate(1, index = $$props.index);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		song,
    		index,
    		$songPlayingIDStore,
    		$selectedAlbumId,
    		$albumPlayingIdStore,
    		$selectedSongsStore,
    		setStar
    	];
    }

    class SongListItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { song: 0, index: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SongListItem",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*song*/ ctx[0] === undefined && !("song" in props)) {
    			console_1$1.warn("<SongListItem> was created without expected prop 'song'");
    		}

    		if (/*index*/ ctx[1] === undefined && !("index" in props)) {
    			console_1$1.warn("<SongListItem> was created without expected prop 'index'");
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

    const file$d = "src/includes/SongList.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	child_ctx[21] = i;
    	return child_ctx;
    }

    // (170:2) {#if $songListStore !== undefined}
    function create_if_block$2(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = /*songsTrimmed*/ ctx[1];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*song*/ ctx[19].ID;
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
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
    			if (dirty & /*songsTrimmed*/ 2) {
    				const each_value = /*songsTrimmed*/ ctx[1];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$2, each_1_anchor, get_each_context$2);
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
    		source: "(170:2) {#if $songListStore !== undefined}",
    		ctx
    	});

    	return block;
    }

    // (171:3) {#each songsTrimmed as song, index (song.ID)}
    function create_each_block$2(key_1, ctx) {
    	let first;
    	let songlistitem;
    	let current;

    	songlistitem = new SongListItem({
    			props: {
    				song: /*song*/ ctx[19],
    				index: /*index*/ ctx[21]
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
    			if (dirty & /*songsTrimmed*/ 2) songlistitem_changes.song = /*song*/ ctx[19];
    			if (dirty & /*songsTrimmed*/ 2) songlistitem_changes.index = /*index*/ ctx[21];
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
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(171:3) {#each songsTrimmed as song, index (song.ID)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let song_list_svlt;
    	let song_list;
    	let t;
    	let song_list_progress_bar;
    	let progress_fill;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*$songListStore*/ ctx[0] !== undefined && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			song_list_svlt = element("song-list-svlt");
    			song_list = element("song-list");
    			if (if_block) if_block.c();
    			t = space();
    			song_list_progress_bar = element("song-list-progress-bar");
    			progress_fill = element("progress-fill");
    			set_custom_element_data(song_list, "class", "svelte-10da8o5");
    			add_location(song_list, file$d, 168, 1, 7376);
    			set_custom_element_data(progress_fill, "class", "svelte-10da8o5");
    			add_location(progress_fill, file$d, 176, 2, 7571);
    			set_custom_element_data(song_list_progress_bar, "class", "svelte-10da8o5");
    			add_location(song_list_progress_bar, file$d, 175, 1, 7544);
    			set_custom_element_data(song_list_svlt, "class", "svelte-10da8o5");
    			add_location(song_list_svlt, file$d, 167, 0, 7283);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, song_list_svlt, anchor);
    			append_dev(song_list_svlt, song_list);
    			if (if_block) if_block.m(song_list, null);
    			append_dev(song_list_svlt, t);
    			append_dev(song_list_svlt, song_list_progress_bar);
    			append_dev(song_list_progress_bar, progress_fill);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(song_list_svlt, "mousewheel", /*mousewheel_handler*/ ctx[8], false, false, false),
    					listen_dev(song_list_svlt, "click", /*click_handler*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$songListStore*/ ctx[0] !== undefined) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$songListStore*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(song_list, null);
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
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const SONG_AMOUNT = 7;

    function isValidPath(event, validPaths) {
    	return event.composedPath().map(path => path.tagName).find(tag => validPaths.includes(tag)); // Return back an array of all elements clicked.
    	// Gives only the tag name of the elements.
    	// If the tag name matches the array of valid values.
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let $songListStore;
    	let $selectedAlbumId;
    	let $selectedSongsStore;
    	validate_store(songListStore, "songListStore");
    	component_subscribe($$self, songListStore, $$value => $$invalidate(0, $songListStore = $$value));
    	validate_store(selectedAlbumId, "selectedAlbumId");
    	component_subscribe($$self, selectedAlbumId, $$value => $$invalidate(7, $selectedAlbumId = $$value));
    	validate_store(selectedSongsStore, "selectedSongsStore");
    	component_subscribe($$self, selectedSongsStore, $$value => $$invalidate(13, $selectedSongsStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SongList", slots, []);
    	let isSelectedAlbumIdFirstAssign = true;
    	let songsTrimmed = [];
    	let scrollTime = 0;
    	let progressValue = 0;

    	// Keeps track of the max size of the song list element.
    	let maxSongListHeight = 0;

    	function trimSongsArray() {
    		// 1º Slice: Slice array from scrollTime to end. Cuts from array songs already scrolled.
    		// 2º Slice: Keep songs from 0 to the set amount.
    		$$invalidate(1, songsTrimmed = $songListStore.slice(scrollTime).slice(0, SONG_AMOUNT));

    		setProgress();
    	}

    	let lastSelectedSong = 0;

    	function selectSongs(e) {
    		let { ctrlKey, metaKey, shiftKey } = e;

    		e["path"].forEach(element => {
    			if (element.tagName === "SONG-LIST-ITEM") {
    				let id = Number(element.getAttribute("id"));
    				let currentSelectedSong = Number(element.getAttribute("index"));

    				if (ctrlKey === false && metaKey === false && shiftKey === false) {
    					set_store_value(selectedSongsStore, $selectedSongsStore = [id], $selectedSongsStore);
    				}

    				if (shiftKey === false && (ctrlKey === true || metaKey === true)) {
    					if (!$selectedSongsStore.includes(id)) {
    						$selectedSongsStore.push(id);
    					} else {
    						$selectedSongsStore.splice($selectedSongsStore.indexOf(id), 1);
    					}
    				}

    				if (shiftKey === true && ctrlKey === false && metaKey === false) {
    					for (let i = currentSelectedSong; i !== lastSelectedSong; currentSelectedSong < lastSelectedSong ? i++ : i--) {
    						let currentID = $songListStore[i].ID;

    						if (!$selectedSongsStore.find(i => i === currentID)) {
    							$selectedSongsStore.push(currentID);
    						}
    					}
    				}

    				lastSelectedSong = currentSelectedSong;
    				selectedSongsStore.set($selectedSongsStore);
    			}
    		});
    	}

    	function scrollContainer(e) {
    		$$invalidate(5, scrollTime = scrollTime + Math.sign(e.deltaY));

    		// Stops scrolling beyond arrays end and always keeps one element visible.
    		if (scrollTime >= $songListStore.length - 1) {
    			$$invalidate(5, scrollTime = $songListStore.length - 1);
    		} else if (scrollTime < 0) {
    			$$invalidate(5, scrollTime = 0);
    		}
    	}

    	function setProgress() {
    		progressValue = 100 / ($songListStore.length - 1) * scrollTime | 0;
    		document.documentElement.style.setProperty("--progress-bar-fill", `${progressValue}%`);
    	}

    	let isMouseDownInScroll = false;

    	onMount(() => {
    		// Set an approximate value on how high would the song list container be to prevent
    		document.documentElement.style.setProperty("--song-list-svlt-height", `${SONG_AMOUNT * 30}px`);

    		scrollBarHandler();
    		let lastPlayedSongId = Number(localStorage.getItem("LastPlayedSongID"));

    		setTimeout(
    			() => {
    				setScrollTimeFromSong(lastPlayedSongId);
    			},
    			250
    		);
    	});

    	function setScrollTimeFromSong(lastPlayedSongId) {
    		let songIndex = $songListStore.findIndex(song => song.ID === lastPlayedSongId);
    		let differenceAmount = Math.floor(SONG_AMOUNT / 2);

    		if (songIndex !== -1) {
    			if (songIndex < differenceAmount) {
    				$$invalidate(5, scrollTime = 0);
    			} else {
    				$$invalidate(5, scrollTime = songIndex - differenceAmount);
    			}
    		}
    	}

    	// Sets the proper scrollTime based of the percentage (in distance) of the bar clicked. 0% = top and 100% = bottom.
    	function setScrollTime(songListProgressBar, e) {
    		let percentClick = 100 / songListProgressBar.clientHeight * e.offsetY;
    		$$invalidate(5, scrollTime = $songListStore.length / 100 * percentClick);
    	}

    	function scrollBarHandler() {
    		let songListProgressBar = document.querySelector("song-list-progress-bar");

    		// Handles moving the cursor over the "scrollbar" then moving out of it so the "scrolling" does not stop abruptly.
    		document.addEventListener("mousemove", e => {
    			// Checks if the other event triggered a mouse down on the "scrollbar".
    			if (isMouseDownInScroll) {
    				// Returns the position (top and height) on screen of the "scrollbar".
    				let { top, height } = songListProgressBar.getBoundingClientRect();

    				// Calculates the difference between the current cursor position on screen relative to the "scrollbar".
    				let difference = e.clientY - top;

    				// Calculates the percentage of scroll.
    				// 0% and lower would mean that the cursor is at the top and beyond the scrollbar.
    				// 100% and above would mean that the cursor is at the bottom and beyond the scrollbar.
    				let percentage = 100 / height * difference;

    				// If the percent is higher than 100% block the percent to 100%.
    				if (percentage >= 100) {
    					percentage = 100;
    				} else if (percentage <= 0) {
    					percentage = 0; // If the percent is lower than 0% block the percent to 0%.
    				}

    				// Sets the scrollTime value with the newly calculated one.
    				$$invalidate(5, scrollTime = ($songListStore.length - 1) / 100 * percentage);
    			}
    		});

    		// If the user clicks on either the scroll bar or the progress fill, set isMouseDownInScroll to true.
    		document.addEventListener("mousedown", e => {
    			if (isValidPath(e, ["SONG-LIST-PROGRESS-BAR", "PROGRESS-FILL"])) {
    				isMouseDownInScroll = true;
    			}
    		});

    		// Anywhere the user releases the mouse button, set isMouseDownInScroll to false.
    		document.addEventListener("mouseup", () => {
    			isMouseDownInScroll = false;
    		});

    		// If the user click on the scrollbar, calls setScrollTime.
    		songListProgressBar.addEventListener("click", evt => setScrollTime(songListProgressBar, evt));
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SongList> was created with unknown prop '${key}'`);
    	});

    	const mousewheel_handler = e => scrollContainer(e);
    	const click_handler = e => selectSongs(e);

    	$$self.$capture_state = () => ({
    		onMount,
    		SongListItem,
    		selectedAlbumId,
    		songListStore,
    		selectedSongsStore,
    		isSelectedAlbumIdFirstAssign,
    		songsTrimmed,
    		scrollTime,
    		progressValue,
    		SONG_AMOUNT,
    		maxSongListHeight,
    		trimSongsArray,
    		lastSelectedSong,
    		selectSongs,
    		scrollContainer,
    		setProgress,
    		isMouseDownInScroll,
    		setScrollTimeFromSong,
    		setScrollTime,
    		isValidPath,
    		scrollBarHandler,
    		$songListStore,
    		$selectedAlbumId,
    		$selectedSongsStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("isSelectedAlbumIdFirstAssign" in $$props) $$invalidate(4, isSelectedAlbumIdFirstAssign = $$props.isSelectedAlbumIdFirstAssign);
    		if ("songsTrimmed" in $$props) $$invalidate(1, songsTrimmed = $$props.songsTrimmed);
    		if ("scrollTime" in $$props) $$invalidate(5, scrollTime = $$props.scrollTime);
    		if ("progressValue" in $$props) progressValue = $$props.progressValue;
    		if ("maxSongListHeight" in $$props) $$invalidate(6, maxSongListHeight = $$props.maxSongListHeight);
    		if ("lastSelectedSong" in $$props) lastSelectedSong = $$props.lastSelectedSong;
    		if ("isMouseDownInScroll" in $$props) isMouseDownInScroll = $$props.isMouseDownInScroll;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$selectedAlbumId, isSelectedAlbumIdFirstAssign*/ 144) {
    			 {

    				if (isSelectedAlbumIdFirstAssign) {
    					$$invalidate(4, isSelectedAlbumIdFirstAssign = false);
    				} else {
    					$$invalidate(5, scrollTime = 0);
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*scrollTime, $songListStore, maxSongListHeight*/ 97) {
    			 {
    				let songList = document.querySelector("song-list");

    				if (songList) {
    					if (songList.clientHeight > maxSongListHeight) {
    						$$invalidate(6, maxSongListHeight = songList.clientHeight);
    						document.documentElement.style.setProperty("--song-list-svlt-height", `${songList.clientHeight}px`);
    					}
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*$songListStore, scrollTime*/ 33) {
    			 {
    				trimSongsArray();
    			}
    		}
    	};

    	return [
    		$songListStore,
    		songsTrimmed,
    		selectSongs,
    		scrollContainer,
    		isSelectedAlbumIdFirstAssign,
    		scrollTime,
    		maxSongListHeight,
    		$selectedAlbumId,
    		mousewheel_handler,
    		click_handler
    	];
    }

    class SongList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SongList",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    // This file replaces `index.js` in bundlers like webpack or Rollup,

    if (process.env.NODE_ENV !== 'production') {
      // All bundlers will remove this block in the production bundle.
      if (
        typeof navigator !== 'undefined' &&
        navigator.product === 'ReactNative' &&
        typeof crypto === 'undefined'
      ) {
        throw new Error(
          'React Native does not have a built-in secure random generator. ' +
            'If you don’t need unpredictable IDs use `nanoid/non-secure`. ' +
            'For secure IDs, import `react-native-get-random-values` ' +
            'before Nano ID.'
        )
      }
      if (typeof msCrypto !== 'undefined' && typeof crypto === 'undefined') {
        throw new Error(
          'Import file with `if (!window.crypto) window.crypto = window.msCrypto`' +
            ' before importing Nano ID to fix IE 11 support'
        )
      }
      if (typeof crypto === 'undefined') {
        throw new Error(
          'Your browser does not have secure random generator. ' +
            'If you don’t need unpredictable IDs, you can use nanoid/non-secure.'
        )
      }
    }

    let nanoid = (size = 21) => {
      let id = '';
      let bytes = crypto.getRandomValues(new Uint8Array(size));

      // A compact alternative for `for (var i = 0; i < step; i++)`.
      while (size--) {
        // It is incorrect to use bytes exceeding the alphabet size.
        // The following mask reduces the random byte in the 0-255 value
        // range to the 0-63 value range. Therefore, adding hacks, such
        // as empty string fallback or magic numbers, is unneccessary because
        // the bitmask trims bytes down to the alphabet size.
        let byte = bytes[size] & 63;
        if (byte < 36) {
          // `0-9a-z`
          id += byte.toString(36);
        } else if (byte < 62) {
          // `A-Z`
          id += (byte - 26).toString(36).toUpperCase();
        } else if (byte < 63) {
          id += '_';
        } else {
          id += '-';
        }
      }
      return id
    };

    /* src/components/TagEdit-Separator.svelte generated by Svelte v3.31.0 */

    const file$e = "src/components/TagEdit-Separator.svelte";

    function create_fragment$e(ctx) {
    	let tag_edit_separator;

    	const block = {
    		c: function create() {
    			tag_edit_separator = element("tag-edit-separator");
    			set_custom_element_data(tag_edit_separator, "class", "svelte-igry7v");
    			add_location(tag_edit_separator, file$e, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tag_edit_separator, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tag_edit_separator);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TagEdit_Separator", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TagEdit_Separator> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class TagEdit_Separator extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TagEdit_Separator",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/components/TagEdit-Editor.svelte generated by Svelte v3.31.0 */
    const file$f = "src/components/TagEdit-Editor.svelte";

    // (38:31) 
    function create_if_block_2$1(ctx) {
    	let textarea;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			textarea = element("textarea");
    			attr_dev(textarea, "rows", "1");
    			attr_dev(textarea, "class", "svelte-3llql4");
    			add_location(textarea, file$f, 38, 2, 1148);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, textarea, anchor);
    			set_input_value(textarea, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[8]),
    					listen_dev(textarea, "mouseleave", /*mouseleave_handler*/ ctx[9], false, false, false),
    					listen_dev(textarea, "mouseover", /*mouseover_handler*/ ctx[10], false, false, false),
    					listen_dev(textarea, "input", /*input_handler*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*value*/ 1) {
    				set_input_value(textarea, /*value*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(textarea);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(38:31) ",
    		ctx
    	});

    	return block;
    }

    // (36:29) 
    function create_if_block_1$2(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "number");
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[2]);
    			attr_dev(input, "class", "svelte-3llql4");
    			add_location(input, file$f, 36, 2, 1065);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler_1*/ ctx[7]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*placeholder*/ 4) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[2]);
    			}

    			if (dirty & /*value*/ 1 && to_number(input.value) !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(36:29) ",
    		ctx
    	});

    	return block;
    }

    // (34:1) {#if type === 'input'}
    function create_if_block$3(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[2]);
    			attr_dev(input, "class", "svelte-3llql4");
    			add_location(input, file$f, 34, 2, 986);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[6]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*placeholder*/ 4) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[2]);
    			}

    			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(34:1) {#if type === 'input'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let tag_edit;
    	let tag_name;
    	let t0;
    	let t1;
    	let warning;
    	let t2;
    	let warning_style_value;
    	let t3;
    	let t4;
    	let tageditseparator;
    	let current;

    	function select_block_type(ctx, dirty) {
    		if (/*type*/ ctx[1] === "input") return create_if_block$3;
    		if (/*type*/ ctx[1] === "number") return create_if_block_1$2;
    		if (/*type*/ ctx[1] === "textarea") return create_if_block_2$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);
    	tageditseparator = new TagEdit_Separator({ $$inline: true });

    	const block = {
    		c: function create() {
    			tag_edit = element("tag-edit");
    			tag_name = element("tag-name");
    			t0 = text(/*tagName*/ ctx[3]);
    			t1 = space();
    			warning = element("warning");
    			t2 = text("(❗)");
    			t3 = space();
    			if (if_block) if_block.c();
    			t4 = space();
    			create_component(tageditseparator.$$.fragment);
    			attr_dev(warning, "title", /*warningMessage*/ ctx[4]);

    			attr_dev(warning, "style", warning_style_value = /*warningMessage*/ ctx[4] === undefined
    			? "display:none"
    			: "");

    			attr_dev(warning, "class", "svelte-3llql4");
    			add_location(warning, file$f, 31, 2, 842);
    			set_custom_element_data(tag_name, "class", "svelte-3llql4");
    			add_location(tag_name, file$f, 28, 1, 816);
    			set_custom_element_data(tag_edit, "id", /*id*/ ctx[5]);
    			set_custom_element_data(tag_edit, "class", "svelte-3llql4");
    			add_location(tag_edit, file$f, 27, 0, 799);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tag_edit, anchor);
    			append_dev(tag_edit, tag_name);
    			append_dev(tag_name, t0);
    			append_dev(tag_name, t1);
    			append_dev(tag_name, warning);
    			append_dev(warning, t2);
    			append_dev(tag_edit, t3);
    			if (if_block) if_block.m(tag_edit, null);
    			append_dev(tag_edit, t4);
    			mount_component(tageditseparator, tag_edit, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*tagName*/ 8) set_data_dev(t0, /*tagName*/ ctx[3]);

    			if (!current || dirty & /*warningMessage*/ 16) {
    				attr_dev(warning, "title", /*warningMessage*/ ctx[4]);
    			}

    			if (!current || dirty & /*warningMessage*/ 16 && warning_style_value !== (warning_style_value = /*warningMessage*/ ctx[4] === undefined
    			? "display:none"
    			: "")) {
    				attr_dev(warning, "style", warning_style_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(tag_edit, t4);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tageditseparator.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tageditseparator.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tag_edit);

    			if (if_block) {
    				if_block.d();
    			}

    			destroy_component(tageditseparator);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function resizeTextArea(id, type) {
    	let textAreaElement = document.querySelector(`#${CSS.escape(id)}`).querySelector("textarea");

    	if (textAreaElement) {
    		if (type === "expand") {
    			textAreaElement.style.minHeight = textAreaElement.scrollHeight + "px";
    		} else if (type === "collapse") {
    			textAreaElement.style.minHeight = "0px";
    		}
    	}
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TagEdit_Editor", slots, []);
    	let { value = "" } = $$props;
    	let { type = "input" } = $$props;
    	let { placeholder = undefined } = $$props;
    	let { tagName } = $$props;
    	let { warningMessage = undefined } = $$props;
    	let id = nanoid(10);
    	const writable_props = ["value", "type", "placeholder", "tagName", "warningMessage"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TagEdit_Editor> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		value = this.value;
    		($$invalidate(0, value), $$invalidate(1, type));
    	}

    	function input_input_handler_1() {
    		value = to_number(this.value);
    		($$invalidate(0, value), $$invalidate(1, type));
    	}

    	function textarea_input_handler() {
    		value = this.value;
    		($$invalidate(0, value), $$invalidate(1, type));
    	}

    	const mouseleave_handler = () => {
    		resizeTextArea(id, "collapse");
    	};

    	const mouseover_handler = () => {
    		resizeTextArea(id, "expand");
    	};

    	const input_handler = () => {
    		resizeTextArea(id, "expand");
    	};

    	$$self.$$set = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("type" in $$props) $$invalidate(1, type = $$props.type);
    		if ("placeholder" in $$props) $$invalidate(2, placeholder = $$props.placeholder);
    		if ("tagName" in $$props) $$invalidate(3, tagName = $$props.tagName);
    		if ("warningMessage" in $$props) $$invalidate(4, warningMessage = $$props.warningMessage);
    	};

    	$$self.$capture_state = () => ({
    		nanoid,
    		onMount,
    		TagEditSeparator: TagEdit_Separator,
    		value,
    		type,
    		placeholder,
    		tagName,
    		warningMessage,
    		id,
    		resizeTextArea
    	});

    	$$self.$inject_state = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("type" in $$props) $$invalidate(1, type = $$props.type);
    		if ("placeholder" in $$props) $$invalidate(2, placeholder = $$props.placeholder);
    		if ("tagName" in $$props) $$invalidate(3, tagName = $$props.tagName);
    		if ("warningMessage" in $$props) $$invalidate(4, warningMessage = $$props.warningMessage);
    		if ("id" in $$props) $$invalidate(5, id = $$props.id);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*type, value*/ 3) {
    			 {
    				if (type === "number" && value === null) {
    					$$invalidate(0, value = "");
    				}
    			}
    		}
    	};

    	return [
    		value,
    		type,
    		placeholder,
    		tagName,
    		warningMessage,
    		id,
    		input_input_handler,
    		input_input_handler_1,
    		textarea_input_handler,
    		mouseleave_handler,
    		mouseover_handler,
    		input_handler
    	];
    }

    class TagEdit_Editor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {
    			value: 0,
    			type: 1,
    			placeholder: 2,
    			tagName: 3,
    			warningMessage: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TagEdit_Editor",
    			options,
    			id: create_fragment$f.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*tagName*/ ctx[3] === undefined && !("tagName" in props)) {
    			console.warn("<TagEdit_Editor> was created without expected prop 'tagName'");
    		}
    	}

    	get value() {
    		throw new Error("<TagEdit_Editor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<TagEdit_Editor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<TagEdit_Editor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<TagEdit_Editor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<TagEdit_Editor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<TagEdit_Editor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tagName() {
    		throw new Error("<TagEdit_Editor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tagName(value) {
    		throw new Error("<TagEdit_Editor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get warningMessage() {
    		throw new Error("<TagEdit_Editor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set warningMessage(value) {
    		throw new Error("<TagEdit_Editor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/includes/TagEdit.svelte generated by Svelte v3.31.0 */

    const { console: console_1$2 } = globals;
    const file$g = "src/includes/TagEdit.svelte";

    function create_fragment$g(ctx) {
    	let tag_edit_svlt;
    	let component_name;
    	let t1;
    	let tagediteditor0;
    	let updating_value;
    	let t2;
    	let tagediteditor1;
    	let updating_value_1;
    	let t3;
    	let track_disc_tag_editor;
    	let tagediteditor2;
    	let updating_value_2;
    	let t4;
    	let tagediteditor3;
    	let updating_value_3;
    	let t5;
    	let tagediteditor4;
    	let updating_value_4;
    	let t6;
    	let tagediteditor5;
    	let updating_value_5;
    	let t7;
    	let tagediteditor6;
    	let updating_value_6;
    	let t8;
    	let tagediteditor7;
    	let updating_value_7;
    	let t9;
    	let tagediteditor8;
    	let updating_value_8;
    	let t10;
    	let date_tag_editor;
    	let tagediteditor9;
    	let updating_value_9;
    	let t11;
    	let tagediteditor10;
    	let updating_value_10;
    	let t12;
    	let tagediteditor11;
    	let updating_value_11;
    	let t13;
    	let star;
    	let t14;
    	let button_group;
    	let button0;
    	let t16;
    	let button1;
    	let current;

    	function tagediteditor0_value_binding(value) {
    		/*tagediteditor0_value_binding*/ ctx[17].call(null, value);
    	}

    	let tagediteditor0_props = { tagName: "Title", type: "input" };

    	if (/*titleTag*/ ctx[1].bind !== void 0) {
    		tagediteditor0_props.value = /*titleTag*/ ctx[1].bind;
    	}

    	tagediteditor0 = new TagEdit_Editor({
    			props: tagediteditor0_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(tagediteditor0, "value", tagediteditor0_value_binding));

    	function tagediteditor1_value_binding(value) {
    		/*tagediteditor1_value_binding*/ ctx[18].call(null, value);
    	}

    	let tagediteditor1_props = { tagName: "Album", type: "input" };

    	if (/*albumTag*/ ctx[0].bind !== void 0) {
    		tagediteditor1_props.value = /*albumTag*/ ctx[0].bind;
    	}

    	tagediteditor1 = new TagEdit_Editor({
    			props: tagediteditor1_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(tagediteditor1, "value", tagediteditor1_value_binding));

    	function tagediteditor2_value_binding(value) {
    		/*tagediteditor2_value_binding*/ ctx[19].call(null, value);
    	}

    	let tagediteditor2_props = {
    		tagName: "Track #",
    		warningMessage: /*trackTag*/ ctx[2].value === "(Multiple Values)"
    		? "It is not recommended to edit the track number of multiple songs at once."
    		: undefined,
    		type: "number",
    		placeholder: "-"
    	};

    	if (/*trackTag*/ ctx[2].bind !== void 0) {
    		tagediteditor2_props.value = /*trackTag*/ ctx[2].bind;
    	}

    	tagediteditor2 = new TagEdit_Editor({
    			props: tagediteditor2_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(tagediteditor2, "value", tagediteditor2_value_binding));

    	function tagediteditor3_value_binding(value) {
    		/*tagediteditor3_value_binding*/ ctx[20].call(null, value);
    	}

    	let tagediteditor3_props = {
    		tagName: "Disc #",
    		type: "number",
    		placeholder: "-"
    	};

    	if (/*discNumberTag*/ ctx[3].bind !== void 0) {
    		tagediteditor3_props.value = /*discNumberTag*/ ctx[3].bind;
    	}

    	tagediteditor3 = new TagEdit_Editor({
    			props: tagediteditor3_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(tagediteditor3, "value", tagediteditor3_value_binding));

    	function tagediteditor4_value_binding(value) {
    		/*tagediteditor4_value_binding*/ ctx[21].call(null, value);
    	}

    	let tagediteditor4_props = { tagName: "Artist", type: "textarea" };

    	if (/*artistTag*/ ctx[6].bind !== void 0) {
    		tagediteditor4_props.value = /*artistTag*/ ctx[6].bind;
    	}

    	tagediteditor4 = new TagEdit_Editor({
    			props: tagediteditor4_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(tagediteditor4, "value", tagediteditor4_value_binding));

    	function tagediteditor5_value_binding(value) {
    		/*tagediteditor5_value_binding*/ ctx[22].call(null, value);
    	}

    	let tagediteditor5_props = {
    		tagName: "Album Artist",
    		type: "textarea"
    	};

    	if (/*albumArtistTag*/ ctx[4].bind !== void 0) {
    		tagediteditor5_props.value = /*albumArtistTag*/ ctx[4].bind;
    	}

    	tagediteditor5 = new TagEdit_Editor({
    			props: tagediteditor5_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(tagediteditor5, "value", tagediteditor5_value_binding));

    	function tagediteditor6_value_binding(value) {
    		/*tagediteditor6_value_binding*/ ctx[23].call(null, value);
    	}

    	let tagediteditor6_props = { tagName: "Genre", type: "input" };

    	if (/*genreTag*/ ctx[5].bind !== void 0) {
    		tagediteditor6_props.value = /*genreTag*/ ctx[5].bind;
    	}

    	tagediteditor6 = new TagEdit_Editor({
    			props: tagediteditor6_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(tagediteditor6, "value", tagediteditor6_value_binding));

    	function tagediteditor7_value_binding(value) {
    		/*tagediteditor7_value_binding*/ ctx[24].call(null, value);
    	}

    	let tagediteditor7_props = { tagName: "Composer", type: "input" };

    	if (/*composerTag*/ ctx[7].bind !== void 0) {
    		tagediteditor7_props.value = /*composerTag*/ ctx[7].bind;
    	}

    	tagediteditor7 = new TagEdit_Editor({
    			props: tagediteditor7_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(tagediteditor7, "value", tagediteditor7_value_binding));

    	function tagediteditor8_value_binding(value) {
    		/*tagediteditor8_value_binding*/ ctx[25].call(null, value);
    	}

    	let tagediteditor8_props = { tagName: "Comment", type: "textarea" };

    	if (/*commentTag*/ ctx[8].bind !== void 0) {
    		tagediteditor8_props.value = /*commentTag*/ ctx[8].bind;
    	}

    	tagediteditor8 = new TagEdit_Editor({
    			props: tagediteditor8_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(tagediteditor8, "value", tagediteditor8_value_binding));

    	function tagediteditor9_value_binding(value) {
    		/*tagediteditor9_value_binding*/ ctx[26].call(null, value);
    	}

    	let tagediteditor9_props = {
    		tagName: "Year",
    		type: "number",
    		placeholder: "-"
    	};

    	if (/*dateYearTag*/ ctx[9].bind !== void 0) {
    		tagediteditor9_props.value = /*dateYearTag*/ ctx[9].bind;
    	}

    	tagediteditor9 = new TagEdit_Editor({
    			props: tagediteditor9_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(tagediteditor9, "value", tagediteditor9_value_binding));

    	function tagediteditor10_value_binding(value) {
    		/*tagediteditor10_value_binding*/ ctx[27].call(null, value);
    	}

    	let tagediteditor10_props = {
    		tagName: "Month",
    		type: "number",
    		placeholder: "-"
    	};

    	if (/*dateMonthTag*/ ctx[10].bind !== void 0) {
    		tagediteditor10_props.value = /*dateMonthTag*/ ctx[10].bind;
    	}

    	tagediteditor10 = new TagEdit_Editor({
    			props: tagediteditor10_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(tagediteditor10, "value", tagediteditor10_value_binding));

    	function tagediteditor11_value_binding(value) {
    		/*tagediteditor11_value_binding*/ ctx[28].call(null, value);
    	}

    	let tagediteditor11_props = {
    		tagName: "Day",
    		type: "number",
    		placeholder: "-"
    	};

    	if (/*dateDayTag*/ ctx[11].bind !== void 0) {
    		tagediteditor11_props.value = /*dateDayTag*/ ctx[11].bind;
    	}

    	tagediteditor11 = new TagEdit_Editor({
    			props: tagediteditor11_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(tagediteditor11, "value", tagediteditor11_value_binding));

    	star = new Star({
    			props: {
    				songRating: Number(/*ratingTag*/ ctx[12].bind)
    			},
    			$$inline: true
    		});

    	star.$on("starChange", /*setStar*/ ctx[13]);

    	const block = {
    		c: function create() {
    			tag_edit_svlt = element("tag-edit-svlt");
    			component_name = element("component-name");
    			component_name.textContent = "Tag Edit";
    			t1 = space();
    			create_component(tagediteditor0.$$.fragment);
    			t2 = space();
    			create_component(tagediteditor1.$$.fragment);
    			t3 = space();
    			track_disc_tag_editor = element("track-disc-tag-editor");
    			create_component(tagediteditor2.$$.fragment);
    			t4 = space();
    			create_component(tagediteditor3.$$.fragment);
    			t5 = space();
    			create_component(tagediteditor4.$$.fragment);
    			t6 = space();
    			create_component(tagediteditor5.$$.fragment);
    			t7 = space();
    			create_component(tagediteditor6.$$.fragment);
    			t8 = space();
    			create_component(tagediteditor7.$$.fragment);
    			t9 = space();
    			create_component(tagediteditor8.$$.fragment);
    			t10 = space();
    			date_tag_editor = element("date-tag-editor");
    			create_component(tagediteditor9.$$.fragment);
    			t11 = space();
    			create_component(tagediteditor10.$$.fragment);
    			t12 = space();
    			create_component(tagediteditor11.$$.fragment);
    			t13 = space();
    			create_component(star.$$.fragment);
    			t14 = space();
    			button_group = element("button-group");
    			button0 = element("button");
    			button0.textContent = "Update";
    			t16 = space();
    			button1 = element("button");
    			button1.textContent = "Cancel";
    			set_custom_element_data(component_name, "class", "svelte-1qow5dk");
    			add_location(component_name, file$g, 325, 1, 9721);
    			set_custom_element_data(track_disc_tag_editor, "class", "svelte-1qow5dk");
    			add_location(track_disc_tag_editor, file$g, 330, 1, 9916);
    			set_custom_element_data(date_tag_editor, "class", "svelte-1qow5dk");
    			add_location(date_tag_editor, file$g, 349, 1, 10743);
    			attr_dev(button0, "class", "svelte-1qow5dk");
    			add_location(button0, file$g, 358, 2, 11156);
    			attr_dev(button1, "class", "svelte-1qow5dk");
    			add_location(button1, file$g, 360, 2, 11183);
    			set_custom_element_data(button_group, "class", "svelte-1qow5dk");
    			add_location(button_group, file$g, 357, 1, 11139);
    			set_custom_element_data(tag_edit_svlt, "class", "svelte-1qow5dk");
    			add_location(tag_edit_svlt, file$g, 324, 0, 9704);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tag_edit_svlt, anchor);
    			append_dev(tag_edit_svlt, component_name);
    			append_dev(tag_edit_svlt, t1);
    			mount_component(tagediteditor0, tag_edit_svlt, null);
    			append_dev(tag_edit_svlt, t2);
    			mount_component(tagediteditor1, tag_edit_svlt, null);
    			append_dev(tag_edit_svlt, t3);
    			append_dev(tag_edit_svlt, track_disc_tag_editor);
    			mount_component(tagediteditor2, track_disc_tag_editor, null);
    			append_dev(track_disc_tag_editor, t4);
    			mount_component(tagediteditor3, track_disc_tag_editor, null);
    			append_dev(tag_edit_svlt, t5);
    			mount_component(tagediteditor4, tag_edit_svlt, null);
    			append_dev(tag_edit_svlt, t6);
    			mount_component(tagediteditor5, tag_edit_svlt, null);
    			append_dev(tag_edit_svlt, t7);
    			mount_component(tagediteditor6, tag_edit_svlt, null);
    			append_dev(tag_edit_svlt, t8);
    			mount_component(tagediteditor7, tag_edit_svlt, null);
    			append_dev(tag_edit_svlt, t9);
    			mount_component(tagediteditor8, tag_edit_svlt, null);
    			append_dev(tag_edit_svlt, t10);
    			append_dev(tag_edit_svlt, date_tag_editor);
    			mount_component(tagediteditor9, date_tag_editor, null);
    			append_dev(date_tag_editor, t11);
    			mount_component(tagediteditor10, date_tag_editor, null);
    			append_dev(date_tag_editor, t12);
    			mount_component(tagediteditor11, date_tag_editor, null);
    			append_dev(tag_edit_svlt, t13);
    			mount_component(star, tag_edit_svlt, null);
    			append_dev(tag_edit_svlt, t14);
    			append_dev(tag_edit_svlt, button_group);
    			append_dev(button_group, button0);
    			append_dev(button_group, t16);
    			append_dev(button_group, button1);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tagediteditor0_changes = {};

    			if (!updating_value && dirty[0] & /*titleTag*/ 2) {
    				updating_value = true;
    				tagediteditor0_changes.value = /*titleTag*/ ctx[1].bind;
    				add_flush_callback(() => updating_value = false);
    			}

    			tagediteditor0.$set(tagediteditor0_changes);
    			const tagediteditor1_changes = {};

    			if (!updating_value_1 && dirty[0] & /*albumTag*/ 1) {
    				updating_value_1 = true;
    				tagediteditor1_changes.value = /*albumTag*/ ctx[0].bind;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			tagediteditor1.$set(tagediteditor1_changes);
    			const tagediteditor2_changes = {};

    			if (dirty[0] & /*trackTag*/ 4) tagediteditor2_changes.warningMessage = /*trackTag*/ ctx[2].value === "(Multiple Values)"
    			? "It is not recommended to edit the track number of multiple songs at once."
    			: undefined;

    			if (!updating_value_2 && dirty[0] & /*trackTag*/ 4) {
    				updating_value_2 = true;
    				tagediteditor2_changes.value = /*trackTag*/ ctx[2].bind;
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			tagediteditor2.$set(tagediteditor2_changes);
    			const tagediteditor3_changes = {};

    			if (!updating_value_3 && dirty[0] & /*discNumberTag*/ 8) {
    				updating_value_3 = true;
    				tagediteditor3_changes.value = /*discNumberTag*/ ctx[3].bind;
    				add_flush_callback(() => updating_value_3 = false);
    			}

    			tagediteditor3.$set(tagediteditor3_changes);
    			const tagediteditor4_changes = {};

    			if (!updating_value_4 && dirty[0] & /*artistTag*/ 64) {
    				updating_value_4 = true;
    				tagediteditor4_changes.value = /*artistTag*/ ctx[6].bind;
    				add_flush_callback(() => updating_value_4 = false);
    			}

    			tagediteditor4.$set(tagediteditor4_changes);
    			const tagediteditor5_changes = {};

    			if (!updating_value_5 && dirty[0] & /*albumArtistTag*/ 16) {
    				updating_value_5 = true;
    				tagediteditor5_changes.value = /*albumArtistTag*/ ctx[4].bind;
    				add_flush_callback(() => updating_value_5 = false);
    			}

    			tagediteditor5.$set(tagediteditor5_changes);
    			const tagediteditor6_changes = {};

    			if (!updating_value_6 && dirty[0] & /*genreTag*/ 32) {
    				updating_value_6 = true;
    				tagediteditor6_changes.value = /*genreTag*/ ctx[5].bind;
    				add_flush_callback(() => updating_value_6 = false);
    			}

    			tagediteditor6.$set(tagediteditor6_changes);
    			const tagediteditor7_changes = {};

    			if (!updating_value_7 && dirty[0] & /*composerTag*/ 128) {
    				updating_value_7 = true;
    				tagediteditor7_changes.value = /*composerTag*/ ctx[7].bind;
    				add_flush_callback(() => updating_value_7 = false);
    			}

    			tagediteditor7.$set(tagediteditor7_changes);
    			const tagediteditor8_changes = {};

    			if (!updating_value_8 && dirty[0] & /*commentTag*/ 256) {
    				updating_value_8 = true;
    				tagediteditor8_changes.value = /*commentTag*/ ctx[8].bind;
    				add_flush_callback(() => updating_value_8 = false);
    			}

    			tagediteditor8.$set(tagediteditor8_changes);
    			const tagediteditor9_changes = {};

    			if (!updating_value_9 && dirty[0] & /*dateYearTag*/ 512) {
    				updating_value_9 = true;
    				tagediteditor9_changes.value = /*dateYearTag*/ ctx[9].bind;
    				add_flush_callback(() => updating_value_9 = false);
    			}

    			tagediteditor9.$set(tagediteditor9_changes);
    			const tagediteditor10_changes = {};

    			if (!updating_value_10 && dirty[0] & /*dateMonthTag*/ 1024) {
    				updating_value_10 = true;
    				tagediteditor10_changes.value = /*dateMonthTag*/ ctx[10].bind;
    				add_flush_callback(() => updating_value_10 = false);
    			}

    			tagediteditor10.$set(tagediteditor10_changes);
    			const tagediteditor11_changes = {};

    			if (!updating_value_11 && dirty[0] & /*dateDayTag*/ 2048) {
    				updating_value_11 = true;
    				tagediteditor11_changes.value = /*dateDayTag*/ ctx[11].bind;
    				add_flush_callback(() => updating_value_11 = false);
    			}

    			tagediteditor11.$set(tagediteditor11_changes);
    			const star_changes = {};
    			if (dirty[0] & /*ratingTag*/ 4096) star_changes.songRating = Number(/*ratingTag*/ ctx[12].bind);
    			star.$set(star_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tagediteditor0.$$.fragment, local);
    			transition_in(tagediteditor1.$$.fragment, local);
    			transition_in(tagediteditor2.$$.fragment, local);
    			transition_in(tagediteditor3.$$.fragment, local);
    			transition_in(tagediteditor4.$$.fragment, local);
    			transition_in(tagediteditor5.$$.fragment, local);
    			transition_in(tagediteditor6.$$.fragment, local);
    			transition_in(tagediteditor7.$$.fragment, local);
    			transition_in(tagediteditor8.$$.fragment, local);
    			transition_in(tagediteditor9.$$.fragment, local);
    			transition_in(tagediteditor10.$$.fragment, local);
    			transition_in(tagediteditor11.$$.fragment, local);
    			transition_in(star.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tagediteditor0.$$.fragment, local);
    			transition_out(tagediteditor1.$$.fragment, local);
    			transition_out(tagediteditor2.$$.fragment, local);
    			transition_out(tagediteditor3.$$.fragment, local);
    			transition_out(tagediteditor4.$$.fragment, local);
    			transition_out(tagediteditor5.$$.fragment, local);
    			transition_out(tagediteditor6.$$.fragment, local);
    			transition_out(tagediteditor7.$$.fragment, local);
    			transition_out(tagediteditor8.$$.fragment, local);
    			transition_out(tagediteditor9.$$.fragment, local);
    			transition_out(tagediteditor10.$$.fragment, local);
    			transition_out(tagediteditor11.$$.fragment, local);
    			transition_out(star.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tag_edit_svlt);
    			destroy_component(tagediteditor0);
    			destroy_component(tagediteditor1);
    			destroy_component(tagediteditor2);
    			destroy_component(tagediteditor3);
    			destroy_component(tagediteditor4);
    			destroy_component(tagediteditor5);
    			destroy_component(tagediteditor6);
    			destroy_component(tagediteditor7);
    			destroy_component(tagediteditor8);
    			destroy_component(tagediteditor9);
    			destroy_component(tagediteditor10);
    			destroy_component(tagediteditor11);
    			destroy_component(star);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const NOT_DEFINED = "NOT_DEFINED";

    function instance$g($$self, $$props, $$invalidate) {
    	let $selectedAlbumId;
    	let $selectedSongsStore;
    	validate_store(selectedAlbumId, "selectedAlbumId");
    	component_subscribe($$self, selectedAlbumId, $$value => $$invalidate(15, $selectedAlbumId = $$value));
    	validate_store(selectedSongsStore, "selectedSongsStore");
    	component_subscribe($$self, selectedSongsStore, $$value => $$invalidate(16, $selectedSongsStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TagEdit", slots, []);
    	
    	
    	let isSelectedSongsFirstAssign = true;
    	let songList = [];
    	let albumTag = { value: NOT_DEFINED, bind: "" };
    	let titleTag = { value: NOT_DEFINED, bind: "" };
    	let trackTag = { value: NOT_DEFINED, bind: "" };
    	let discNumberTag = { value: NOT_DEFINED, bind: "" };
    	let albumArtistTag = { value: NOT_DEFINED, bind: "" };
    	let genreTag = { value: NOT_DEFINED, bind: "" };
    	let artistTag = { value: NOT_DEFINED, bind: "" };
    	let composerTag = { value: NOT_DEFINED, bind: "" };
    	let commentTag = { value: NOT_DEFINED, bind: "" };
    	let dateYearTag = { value: NOT_DEFINED, bind: null };
    	let dateMonthTag = { value: NOT_DEFINED, bind: null };
    	let dateDayTag = { value: NOT_DEFINED, bind: null };
    	let ratingTag = { value: NOT_DEFINED, bind: 0 };
    	let previousSongList = undefined;

    	// Check what fields are changed and creates an object with the changes.
    	function checkChanges() {
    		let updateObject = {};

    		if (titleTag.value !== titleTag.bind) {
    			updateObject.Title = titleTag.bind;
    		}

    		if (albumTag.value !== albumTag.bind) {
    			updateObject.Album = albumTag.bind;
    		}

    		if (trackTag.value !== trackTag.bind) {
    			updateObject.Track = trackTag.bind;
    		}

    		if (discNumberTag.value !== discNumberTag.bind) {
    			updateObject.DiscNumber = discNumberTag.bind;
    		}

    		if (artistTag.value !== artistTag.bind) {
    			updateObject.Artist = artistTag.bind;
    		}

    		if (albumArtistTag.value !== albumArtistTag.bind) {
    			updateObject.AlbumArtist = albumArtistTag.bind;
    		}

    		if (genreTag.value !== genreTag.bind) {
    			updateObject.Genre = genreTag.bind;
    		}

    		if (composerTag.value !== composerTag.bind) {
    			updateObject.Composer = composerTag.bind;
    		}

    		if (commentTag.value !== commentTag.bind) {
    			updateObject.Comment = commentTag.bind;
    		}

    		if (dateYearTag.value !== dateYearTag.bind) {
    			updateObject.Date_Year = dateYearTag.bind;
    		}

    		if (dateMonthTag.value !== dateMonthTag.bind) {
    			updateObject.Date_Month = dateMonthTag.bind;
    		}

    		if (dateDayTag.value !== dateDayTag.bind) {
    			updateObject.Date_Day = dateDayTag.bind;
    		}

    		if (ratingTag.value !== ratingTag.bind) {
    			updateObject.Rating = ratingTag.bind;
    		}

    		console.log(updateObject);
    	}

    	// Check either Selected Songs (if any selected) or Selected Album (if no songs selected). Then, calls group songs
    	function checkSongs() {
    		getAlbumIPC($selectedAlbumId).then(result => {
    			// If songs selected
    			if ($selectedSongsStore.length > 0) {
    				songList = result.Songs.filter(song => $selectedSongsStore.includes(song.ID));

    				// Check if song list changed.
    				if (JSON.stringify(previousSongList) !== JSON.stringify(songList)) {
    					groupSongs();
    					previousSongList = [...songList];
    				}
    			} else {
    				songList = result.Songs;

    				// Check if song list changed.
    				if (JSON.stringify(previousSongList) !== JSON.stringify(songList)) {
    					groupSongs();
    					previousSongList = [...songList];
    				}
    			}
    		});
    	}

    	function resetFields() {
    		$$invalidate(0, albumTag = { value: NOT_DEFINED, bind: "" });
    		$$invalidate(2, trackTag = { value: NOT_DEFINED, bind: "" });
    		$$invalidate(3, discNumberTag = { value: NOT_DEFINED, bind: "" });
    		$$invalidate(1, titleTag = { value: NOT_DEFINED, bind: "" });
    		$$invalidate(7, composerTag = { value: NOT_DEFINED, bind: "" });
    		$$invalidate(5, genreTag = { value: NOT_DEFINED, bind: "" });
    		$$invalidate(4, albumArtistTag = { value: NOT_DEFINED, bind: "" });
    		$$invalidate(6, artistTag = { value: NOT_DEFINED, bind: "" });
    		$$invalidate(8, commentTag = { value: NOT_DEFINED, bind: "" });
    		$$invalidate(9, dateYearTag = { value: NOT_DEFINED, bind: null });
    		$$invalidate(10, dateMonthTag = { value: NOT_DEFINED, bind: null });
    		$$invalidate(9, dateYearTag = { value: NOT_DEFINED, bind: null });
    		$$invalidate(12, ratingTag = { value: NOT_DEFINED, bind: 0 });
    	}

    	function groupSongs() {
    		resetFields();

    		// Goes through every song and checks every tag. If the same tag changes value across songs, it will be set as "Multiple Values"
    		// It also sets the proper values to be used on this component.
    		for (let song of songList) {
    			if (albumTag.value === NOT_DEFINED) {
    				$$invalidate(0, albumTag.value = song.Album, albumTag);
    				$$invalidate(0, albumTag.bind = song.Album, albumTag);
    			} else if (albumTag.value !== NOT_DEFINED && song.Album !== albumTag.value) {
    				$$invalidate(0, albumTag.value = "(Multiple Values)", albumTag);
    				$$invalidate(0, albumTag.bind = "(Multiple Values)", albumTag);
    			}

    			if (titleTag.value === NOT_DEFINED) {
    				$$invalidate(1, titleTag.value = song.Title, titleTag);
    				$$invalidate(1, titleTag.bind = song.Title, titleTag);
    			} else if (titleTag.value !== NOT_DEFINED && song.Title !== titleTag.value) {
    				$$invalidate(1, titleTag.value = "(Multiple Values)", titleTag);
    				$$invalidate(1, titleTag.bind = "(Multiple Values)", titleTag);
    			}

    			if (genreTag.value === NOT_DEFINED) {
    				$$invalidate(5, genreTag.value = song.Genre, genreTag);
    				$$invalidate(5, genreTag.bind = song.Genre, genreTag);
    			} else if (genreTag.value !== NOT_DEFINED && song.Genre !== genreTag.value) {
    				$$invalidate(5, genreTag.value = "(Multiple Values)", genreTag);
    				$$invalidate(5, genreTag.bind = "(Multiple Values)", genreTag);
    			}

    			if (trackTag.value === NOT_DEFINED) {
    				$$invalidate(2, trackTag.value = song.Track, trackTag);
    				$$invalidate(2, trackTag.bind = song.Track, trackTag);
    			} else if (trackTag.value !== NOT_DEFINED && song.Track !== trackTag.value) {
    				$$invalidate(2, trackTag.value = "(Multiple Values)", trackTag);
    				$$invalidate(2, trackTag.bind = "(Multiple Values)", trackTag);
    			}

    			if (discNumberTag.value === NOT_DEFINED) {
    				$$invalidate(3, discNumberTag.value = song.DiscNumber, discNumberTag);
    				$$invalidate(3, discNumberTag.bind = song.DiscNumber, discNumberTag);
    			} else if (discNumberTag.value !== NOT_DEFINED && song.DiscNumber !== discNumberTag.value) {
    				$$invalidate(3, discNumberTag.value = "", discNumberTag);
    				$$invalidate(3, discNumberTag.bind = "", discNumberTag);
    			}

    			if (artistTag.value === NOT_DEFINED) {
    				$$invalidate(6, artistTag.value = song.Artist, artistTag);
    				$$invalidate(6, artistTag.bind = song.Artist, artistTag);
    			} else if (artistTag.value !== NOT_DEFINED && song.Artist !== artistTag.value) {
    				$$invalidate(6, artistTag.value = "(Multiple Values)", artistTag);
    				$$invalidate(6, artistTag.bind = "(Multiple Values)", artistTag);
    			}

    			if (albumArtistTag.value === NOT_DEFINED) {
    				$$invalidate(4, albumArtistTag.value = song.AlbumArtist, albumArtistTag);
    				$$invalidate(4, albumArtistTag.bind = song.AlbumArtist, albumArtistTag);
    			} else if (albumArtistTag.value !== NOT_DEFINED && song.AlbumArtist !== albumArtistTag.value) {
    				$$invalidate(4, albumArtistTag.value = "(Multiple Values)", albumArtistTag);
    				$$invalidate(4, albumArtistTag.bind = "(Multiple Values)", albumArtistTag);
    			}

    			if (commentTag.value === NOT_DEFINED) {
    				$$invalidate(8, commentTag.value = song.Comment, commentTag);
    				$$invalidate(8, commentTag.bind = song.Comment, commentTag);
    			} else if (commentTag.value !== NOT_DEFINED && song.Comment !== commentTag.value) {
    				$$invalidate(8, commentTag.value = "(Multiple Values)", commentTag);
    				$$invalidate(8, commentTag.bind = "(Multiple Values)", commentTag);
    			}

    			if (composerTag.value === NOT_DEFINED) {
    				$$invalidate(7, composerTag.value = song.Composer, composerTag);
    				$$invalidate(7, composerTag.bind = song.Composer, composerTag);
    			} else if (composerTag.value !== NOT_DEFINED && song.Composer !== composerTag.value) {
    				$$invalidate(7, composerTag.value = "(Multiple Values)", composerTag);
    				$$invalidate(7, composerTag.bind = "(Multiple Values)", composerTag);
    			}

    			if (dateYearTag.value === NOT_DEFINED) {
    				$$invalidate(9, dateYearTag.value = song.Date_Year, dateYearTag);
    				$$invalidate(9, dateYearTag.bind = song.Date_Year, dateYearTag);
    			} else if (dateYearTag.value !== NOT_DEFINED && song.Date_Year !== dateYearTag.value) {
    				$$invalidate(9, dateYearTag.value = "", dateYearTag);
    				$$invalidate(9, dateYearTag.bind = "", dateYearTag);
    			}

    			if (dateMonthTag.value === NOT_DEFINED) {
    				$$invalidate(10, dateMonthTag.value = song.Date_Month, dateMonthTag);
    				$$invalidate(10, dateMonthTag.bind = song.Date_Month, dateMonthTag);
    			} else if (dateMonthTag.value !== NOT_DEFINED && song.Date_Month !== dateMonthTag.value) {
    				$$invalidate(10, dateMonthTag.value = "", dateMonthTag);
    				$$invalidate(10, dateMonthTag.bind = "", dateMonthTag);
    			}

    			if (dateDayTag.value === NOT_DEFINED) {
    				$$invalidate(11, dateDayTag.value = song.Date_Day, dateDayTag);
    				$$invalidate(11, dateDayTag.bind = song.Date_Day, dateDayTag);
    			} else if (dateDayTag.value !== NOT_DEFINED && song.Date_Day !== dateDayTag.value) {
    				$$invalidate(11, dateDayTag.value = "", dateDayTag);
    				$$invalidate(11, dateDayTag.bind = "", dateDayTag);
    			}

    			if (ratingTag.value === NOT_DEFINED) {
    				$$invalidate(12, ratingTag.value = song.Rating, ratingTag);
    				$$invalidate(12, ratingTag.bind = song.Rating, ratingTag);
    			} else if (ratingTag.value !== NOT_DEFINED && song.Rating !== ratingTag.value) {
    				$$invalidate(12, ratingTag.value = "", ratingTag);
    				$$invalidate(12, ratingTag.bind = "", ratingTag);
    			}
    		}
    	}

    	function setStar(starChangeEvent) {
    		$$invalidate(12, ratingTag.bind = starChangeEvent.detail.starLevel, ratingTag);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<TagEdit> was created with unknown prop '${key}'`);
    	});

    	function tagediteditor0_value_binding(value) {
    		titleTag.bind = value;
    		$$invalidate(1, titleTag);
    	}

    	function tagediteditor1_value_binding(value) {
    		albumTag.bind = value;
    		$$invalidate(0, albumTag);
    	}

    	function tagediteditor2_value_binding(value) {
    		trackTag.bind = value;
    		$$invalidate(2, trackTag);
    	}

    	function tagediteditor3_value_binding(value) {
    		discNumberTag.bind = value;
    		$$invalidate(3, discNumberTag);
    	}

    	function tagediteditor4_value_binding(value) {
    		artistTag.bind = value;
    		$$invalidate(6, artistTag);
    	}

    	function tagediteditor5_value_binding(value) {
    		albumArtistTag.bind = value;
    		$$invalidate(4, albumArtistTag);
    	}

    	function tagediteditor6_value_binding(value) {
    		genreTag.bind = value;
    		$$invalidate(5, genreTag);
    	}

    	function tagediteditor7_value_binding(value) {
    		composerTag.bind = value;
    		$$invalidate(7, composerTag);
    	}

    	function tagediteditor8_value_binding(value) {
    		commentTag.bind = value;
    		$$invalidate(8, commentTag);
    	}

    	function tagediteditor9_value_binding(value) {
    		dateYearTag.bind = value;
    		$$invalidate(9, dateYearTag);
    	}

    	function tagediteditor10_value_binding(value) {
    		dateMonthTag.bind = value;
    		$$invalidate(10, dateMonthTag);
    	}

    	function tagediteditor11_value_binding(value) {
    		dateDayTag.bind = value;
    		$$invalidate(11, dateDayTag);
    	}

    	$$self.$capture_state = () => ({
    		TagEditEditor: TagEdit_Editor,
    		Star,
    		selectedAlbumId,
    		selectedSongsStore,
    		getAlbumIPC,
    		isSelectedSongsFirstAssign,
    		songList,
    		NOT_DEFINED,
    		albumTag,
    		titleTag,
    		trackTag,
    		discNumberTag,
    		albumArtistTag,
    		genreTag,
    		artistTag,
    		composerTag,
    		commentTag,
    		dateYearTag,
    		dateMonthTag,
    		dateDayTag,
    		ratingTag,
    		previousSongList,
    		checkChanges,
    		checkSongs,
    		resetFields,
    		groupSongs,
    		setStar,
    		$selectedAlbumId,
    		$selectedSongsStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("isSelectedSongsFirstAssign" in $$props) $$invalidate(14, isSelectedSongsFirstAssign = $$props.isSelectedSongsFirstAssign);
    		if ("songList" in $$props) songList = $$props.songList;
    		if ("albumTag" in $$props) $$invalidate(0, albumTag = $$props.albumTag);
    		if ("titleTag" in $$props) $$invalidate(1, titleTag = $$props.titleTag);
    		if ("trackTag" in $$props) $$invalidate(2, trackTag = $$props.trackTag);
    		if ("discNumberTag" in $$props) $$invalidate(3, discNumberTag = $$props.discNumberTag);
    		if ("albumArtistTag" in $$props) $$invalidate(4, albumArtistTag = $$props.albumArtistTag);
    		if ("genreTag" in $$props) $$invalidate(5, genreTag = $$props.genreTag);
    		if ("artistTag" in $$props) $$invalidate(6, artistTag = $$props.artistTag);
    		if ("composerTag" in $$props) $$invalidate(7, composerTag = $$props.composerTag);
    		if ("commentTag" in $$props) $$invalidate(8, commentTag = $$props.commentTag);
    		if ("dateYearTag" in $$props) $$invalidate(9, dateYearTag = $$props.dateYearTag);
    		if ("dateMonthTag" in $$props) $$invalidate(10, dateMonthTag = $$props.dateMonthTag);
    		if ("dateDayTag" in $$props) $$invalidate(11, dateDayTag = $$props.dateDayTag);
    		if ("ratingTag" in $$props) $$invalidate(12, ratingTag = $$props.ratingTag);
    		if ("previousSongList" in $$props) previousSongList = $$props.previousSongList;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*albumTag, titleTag, commentTag, trackTag, discNumberTag, composerTag, genreTag, artistTag, albumArtistTag, dateYearTag, dateMonthTag, dateDayTag, ratingTag*/ 8191) {
    			 {
    				checkChanges();
    			}
    		}

    		if ($$self.$$.dirty[0] & /*$selectedAlbumId, $selectedSongsStore, isSelectedSongsFirstAssign*/ 114688) {
    			 {

    				if (isSelectedSongsFirstAssign === true) {
    					$$invalidate(14, isSelectedSongsFirstAssign = false);
    				} else {
    					checkSongs();
    				}
    			}
    		}
    	};

    	return [
    		albumTag,
    		titleTag,
    		trackTag,
    		discNumberTag,
    		albumArtistTag,
    		genreTag,
    		artistTag,
    		composerTag,
    		commentTag,
    		dateYearTag,
    		dateMonthTag,
    		dateDayTag,
    		ratingTag,
    		setStar,
    		isSelectedSongsFirstAssign,
    		$selectedAlbumId,
    		$selectedSongsStore,
    		tagediteditor0_value_binding,
    		tagediteditor1_value_binding,
    		tagediteditor2_value_binding,
    		tagediteditor3_value_binding,
    		tagediteditor4_value_binding,
    		tagediteditor5_value_binding,
    		tagediteditor6_value_binding,
    		tagediteditor7_value_binding,
    		tagediteditor8_value_binding,
    		tagediteditor9_value_binding,
    		tagediteditor10_value_binding,
    		tagediteditor11_value_binding
    	];
    }

    class TagEdit extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {}, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TagEdit",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src/controllers/ConfigController.svelte generated by Svelte v3.31.0 */

    function create_fragment$h(ctx) {
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
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let $albumArtSizeConfig;
    	validate_store(albumArtSizeConfig, "albumArtSizeConfig");
    	component_subscribe($$self, albumArtSizeConfig, $$value => $$invalidate(0, $albumArtSizeConfig = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ConfigController", slots, []);
    	

    	onMount(() => {
    		getConfigIPC().then(config => {
    			syncConfigLocalStorage(config);
    		});
    	});

    	function syncConfigLocalStorage(config) {
    		syncArtSize(config);
    	}

    	function syncArtSize(config) {
    		var _a;

    		let artSizeConfig = String((_a = config === null || config === void 0
    		? void 0
    		: config.art) === null || _a === void 0
    		? void 0
    		: _a.dimension);

    		let artSizeLS = localStorage.getItem("AlbumArtSize");

    		if (artSizeConfig !== undefined && artSizeConfig !== artSizeLS) {
    			set_store_value(albumArtSizeConfig, $albumArtSizeConfig = artSizeConfig, $albumArtSizeConfig);
    			localStorage.setItem("AlbumArtSize", artSizeConfig);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ConfigController> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		getConfigIPC,
    		albumArtSizeConfig,
    		syncConfigLocalStorage,
    		syncArtSize,
    		$albumArtSizeConfig
    	});

    	return [];
    }

    class ConfigController extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ConfigController",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src/controllers/PlayerController.svelte generated by Svelte v3.31.0 */

    function create_fragment$i(ctx) {
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
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let $selectedGroupByStore;
    	let $selectedGroupByValueStore;
    	let $dbVersion;
    	let $selectedAlbumId;
    	let $songListStore;
    	let $albumListStore;
    	let $selectedSongsStore;
    	validate_store(selectedGroupByStore, "selectedGroupByStore");
    	component_subscribe($$self, selectedGroupByStore, $$value => $$invalidate(2, $selectedGroupByStore = $$value));
    	validate_store(selectedGroupByValueStore, "selectedGroupByValueStore");
    	component_subscribe($$self, selectedGroupByValueStore, $$value => $$invalidate(3, $selectedGroupByValueStore = $$value));
    	validate_store(dbVersion, "dbVersion");
    	component_subscribe($$self, dbVersion, $$value => $$invalidate(4, $dbVersion = $$value));
    	validate_store(selectedAlbumId, "selectedAlbumId");
    	component_subscribe($$self, selectedAlbumId, $$value => $$invalidate(5, $selectedAlbumId = $$value));
    	validate_store(songListStore, "songListStore");
    	component_subscribe($$self, songListStore, $$value => $$invalidate(6, $songListStore = $$value));
    	validate_store(albumListStore, "albumListStore");
    	component_subscribe($$self, albumListStore, $$value => $$invalidate(7, $albumListStore = $$value));
    	validate_store(selectedSongsStore, "selectedSongsStore");
    	component_subscribe($$self, selectedSongsStore, $$value => $$invalidate(8, $selectedSongsStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PlayerController", slots, []);
    	let firstGroupByAssign = true;
    	let firstDbVersionAssign = true;

    	function getAlbums(groupBy, groupByValue) {
    		getAlbumsIPC(groupBy, groupByValue).then(result => set_store_value(albumListStore, $albumListStore = result, $albumListStore));
    	}

    	onMount(() => {
    		document.addEventListener("click", evt => handleClickEvent(evt));
    		document.addEventListener("dblclick", evt => handleClickEvent(evt));
    		loadPreviousState();
    	});

    	function loadPreviousState() {
    		let lastPlayedAlbumId = localStorage.getItem("LastPlayedAlbumID");
    		let lastPlayedSongID = Number(localStorage.getItem("LastPlayedSongID"));
    		getAlbumColors(lastPlayedAlbumId);
    		set_store_value(selectedAlbumId, $selectedAlbumId = lastPlayedAlbumId, $selectedAlbumId);

    		getAlbumIPC(lastPlayedAlbumId).then(result => {
    			set_store_value(songListStore, $songListStore = result.Songs, $songListStore);
    			setNewPlayback(lastPlayedAlbumId, $songListStore, lastPlayedSongID, false);
    		});
    	}

    	function handleClickEvent(evt) {
    		let elementMap = new Map();

    		evt.composedPath().forEach(element => {
    			elementMap.set(element.tagName, element);
    		});

    		const ALBUM_ELEMENT = elementMap.get("ALBUM");
    		const SONG_LIST_ITEM_ELEMENT = elementMap.get("SONG-LIST-ITEM");
    		const SONG_LIST_SVLT = elementMap.get("SONG-LIST-SVLT");
    		const TAG_EDIT_SVLT = elementMap.get("TAG-EDIT-SVLT");

    		if (ALBUM_ELEMENT) {
    			const ALBUM_ID = ALBUM_ELEMENT.getAttribute("id");

    			getAlbumIPC(ALBUM_ID).then(result => {
    				if (evt.type === "dblclick") {
    					setNewPlayback(ALBUM_ID, result.Songs, undefined, true);
    				} else if (evt.type === "click") {
    					// Prevents resetting array if album unchanged.
    					if ($selectedAlbumId !== ALBUM_ID) {
    						set_store_value(selectedAlbumId, $selectedAlbumId = ALBUM_ID, $selectedAlbumId);
    						set_store_value(songListStore, $songListStore = result.Songs, $songListStore);
    					}
    				}
    			});
    		}

    		if (SONG_LIST_ITEM_ELEMENT) {
    			const SONG_ID_TO_PLAY = Number(SONG_LIST_ITEM_ELEMENT.getAttribute("id"));

    			if (evt.type === "dblclick") {
    				getAlbumIPC($selectedAlbumId).then(result => {
    					setNewPlayback($selectedAlbumId, result.Songs, SONG_ID_TO_PLAY, true);
    				});
    			}
    		}

    		if (!(SONG_LIST_SVLT || TAG_EDIT_SVLT)) {
    			set_store_value(selectedSongsStore, $selectedSongsStore = [], $selectedSongsStore);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PlayerController> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		setNewPlayback,
    		getAlbumColors,
    		getAlbumIPC,
    		getAlbumsIPC,
    		albumListStore,
    		dbVersion,
    		selectedAlbumId,
    		selectedGroupByStore,
    		selectedGroupByValueStore,
    		selectedSongsStore,
    		songListStore,
    		firstGroupByAssign,
    		firstDbVersionAssign,
    		getAlbums,
    		loadPreviousState,
    		handleClickEvent,
    		$selectedGroupByStore,
    		$selectedGroupByValueStore,
    		$dbVersion,
    		$selectedAlbumId,
    		$songListStore,
    		$albumListStore,
    		$selectedSongsStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("firstGroupByAssign" in $$props) $$invalidate(0, firstGroupByAssign = $$props.firstGroupByAssign);
    		if ("firstDbVersionAssign" in $$props) $$invalidate(1, firstDbVersionAssign = $$props.firstDbVersionAssign);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*firstGroupByAssign, $selectedGroupByStore, $selectedGroupByValueStore*/ 13) {
    			 {
    				if (firstGroupByAssign === true) {
    					$$invalidate(0, firstGroupByAssign = false);
    				} else {
    					getAlbums($selectedGroupByStore, $selectedGroupByValueStore);
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*$dbVersion, firstDbVersionAssign, $selectedGroupByStore, $selectedGroupByValueStore, $selectedAlbumId*/ 62) {
    			 {

    				if (firstDbVersionAssign === true) {
    					$$invalidate(1, firstDbVersionAssign = false);
    				} else {
    					if ($dbVersion !== 0) {
    						getAlbums($selectedGroupByStore, $selectedGroupByValueStore);

    						// Refills the current album selected songs to add them as they are found.
    						getAlbumIPC($selectedAlbumId).then(result => {
    							set_store_value(songListStore, $songListStore = result.Songs, $songListStore);
    						});
    					}
    				}
    			}
    		}
    	};

    	return [
    		firstGroupByAssign,
    		firstDbVersionAssign,
    		$selectedGroupByStore,
    		$selectedGroupByValueStore,
    		$dbVersion,
    		$selectedAlbumId
    	];
    }

    class PlayerController extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PlayerController",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* src/includes/BackgroundArt.svelte generated by Svelte v3.31.0 */

    const file$h = "src/includes/BackgroundArt.svelte";

    function create_fragment$j(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = "./img/bg.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-ufzy90");
    			add_location(img, file$h, 0, 0, 0);
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
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props) {
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
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BackgroundArt",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* src/includes/SongListBackground.svelte generated by Svelte v3.31.0 */
    const file$i = "src/includes/SongListBackground.svelte";

    function create_fragment$k(ctx) {
    	let song_list_background_svlt;

    	const block = {
    		c: function create() {
    			song_list_background_svlt = element("song-list-background-svlt");
    			set_custom_element_data(song_list_background_svlt, "class", "svelte-1gvvzcg");
    			add_location(song_list_background_svlt, file$i, 36, 0, 1382);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, song_list_background_svlt, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(song_list_background_svlt);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function loadCover(coverArtPath) {
    	if (coverArtPath) {
    		let $el = document.querySelector("song-list-background-svlt");

    		if ($el) {
    			$el.setAttribute("style", `background-image: url('${coverArtPath}');`);
    		}
    	}
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let $albumCoverArtMapStore;
    	let $selectedAlbumId;
    	validate_store(albumCoverArtMapStore, "albumCoverArtMapStore");
    	component_subscribe($$self, albumCoverArtMapStore, $$value => $$invalidate(2, $albumCoverArtMapStore = $$value));
    	validate_store(selectedAlbumId, "selectedAlbumId");
    	component_subscribe($$self, selectedAlbumId, $$value => $$invalidate(3, $selectedAlbumId = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SongListBackground", slots, []);
    	let previousCoverArtVersion = undefined;
    	let previousCoverArtID = undefined;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SongListBackground> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		albumCoverArtMapStore,
    		selectedAlbumId,
    		previousCoverArtVersion,
    		previousCoverArtID,
    		loadCover,
    		$albumCoverArtMapStore,
    		$selectedAlbumId
    	});

    	$$self.$inject_state = $$props => {
    		if ("previousCoverArtVersion" in $$props) $$invalidate(0, previousCoverArtVersion = $$props.previousCoverArtVersion);
    		if ("previousCoverArtID" in $$props) $$invalidate(1, previousCoverArtID = $$props.previousCoverArtID);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$albumCoverArtMapStore, $selectedAlbumId, previousCoverArtID, previousCoverArtVersion*/ 15) {
    			 {
    				// Loads cover if Cover Art map (If image updated) or Selected Album changes.
    				// Get Cover Art from Map.
    				let coverArt = $albumCoverArtMapStore.get($selectedAlbumId);

    				// If Found
    				if (coverArt) {
    					// Checks if the previous id changed.
    					if (previousCoverArtID !== $selectedAlbumId) {
    						// If changed it updates both id and version.
    						$$invalidate(1, previousCoverArtID = $selectedAlbumId);

    						$$invalidate(0, previousCoverArtVersion = coverArt.version);

    						// If a cover is available, load it.
    						loadCover(coverArt.filePath);
    					} else if (coverArt.version !== previousCoverArtVersion) {
    						// Updates the cover version.
    						$$invalidate(0, previousCoverArtVersion = coverArt.version); // Checks if a new version of the album cover is available

    						loadCover(coverArt.filePath);
    					}
    				}
    			}
    		}
    	};

    	return [
    		previousCoverArtVersion,
    		previousCoverArtID,
    		$albumCoverArtMapStore,
    		$selectedAlbumId
    	];
    }

    class SongListBackground extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SongListBackground",
    			options,
    			id: create_fragment$k.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.31.0 */

    const { console: console_1$3, document: document_1 } = globals;
    const file$j = "src/App.svelte";

    function create_fragment$l(ctx) {
    	let title_value;
    	let t0;
    	let playercontroller;
    	let t1;
    	let configcontroller;
    	let t2;
    	let main;
    	let navigation;
    	let t3;
    	let artgrid;
    	let t4;
    	let grouping;
    	let t5;
    	let player;
    	let t6;
    	let songlist;
    	let t7;
    	let tagedit;
    	let t8;
    	let backgroundart;
    	let t9;
    	let songlistbackground;
    	let current;
    	document_1.title = title_value = /*$appTitle*/ ctx[0];
    	playercontroller = new PlayerController({ $$inline: true });
    	configcontroller = new ConfigController({ $$inline: true });
    	navigation = new Navigation({ $$inline: true });
    	artgrid = new ArtGrid({ $$inline: true });
    	grouping = new Grouping({ $$inline: true });
    	player = new Player({ $$inline: true });
    	songlist = new SongList({ $$inline: true });
    	tagedit = new TagEdit({ $$inline: true });
    	backgroundart = new BackgroundArt({ $$inline: true });
    	songlistbackground = new SongListBackground({ $$inline: true });

    	const block = {
    		c: function create() {
    			t0 = space();
    			create_component(playercontroller.$$.fragment);
    			t1 = space();
    			create_component(configcontroller.$$.fragment);
    			t2 = space();
    			main = element("main");
    			create_component(navigation.$$.fragment);
    			t3 = space();
    			create_component(artgrid.$$.fragment);
    			t4 = space();
    			create_component(grouping.$$.fragment);
    			t5 = space();
    			create_component(player.$$.fragment);
    			t6 = space();
    			create_component(songlist.$$.fragment);
    			t7 = space();
    			create_component(tagedit.$$.fragment);
    			t8 = space();
    			create_component(backgroundart.$$.fragment);
    			t9 = space();
    			create_component(songlistbackground.$$.fragment);
    			attr_dev(main, "class", "svelte-1fro297");
    			add_location(main, file$j, 60, 0, 2226);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			mount_component(playercontroller, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(configcontroller, target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(navigation, main, null);
    			append_dev(main, t3);
    			mount_component(artgrid, main, null);
    			append_dev(main, t4);
    			mount_component(grouping, main, null);
    			append_dev(main, t5);
    			mount_component(player, main, null);
    			append_dev(main, t6);
    			mount_component(songlist, main, null);
    			append_dev(main, t7);
    			mount_component(tagedit, main, null);
    			append_dev(main, t8);
    			mount_component(backgroundart, main, null);
    			append_dev(main, t9);
    			mount_component(songlistbackground, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*$appTitle*/ 1) && title_value !== (title_value = /*$appTitle*/ ctx[0])) {
    				document_1.title = title_value;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(playercontroller.$$.fragment, local);
    			transition_in(configcontroller.$$.fragment, local);
    			transition_in(navigation.$$.fragment, local);
    			transition_in(artgrid.$$.fragment, local);
    			transition_in(grouping.$$.fragment, local);
    			transition_in(player.$$.fragment, local);
    			transition_in(songlist.$$.fragment, local);
    			transition_in(tagedit.$$.fragment, local);
    			transition_in(backgroundart.$$.fragment, local);
    			transition_in(songlistbackground.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(playercontroller.$$.fragment, local);
    			transition_out(configcontroller.$$.fragment, local);
    			transition_out(navigation.$$.fragment, local);
    			transition_out(artgrid.$$.fragment, local);
    			transition_out(grouping.$$.fragment, local);
    			transition_out(player.$$.fragment, local);
    			transition_out(songlist.$$.fragment, local);
    			transition_out(tagedit.$$.fragment, local);
    			transition_out(backgroundart.$$.fragment, local);
    			transition_out(songlistbackground.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			destroy_component(playercontroller, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(configcontroller, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(main);
    			destroy_component(navigation);
    			destroy_component(artgrid);
    			destroy_component(grouping);
    			destroy_component(player);
    			destroy_component(songlist);
    			destroy_component(tagedit);
    			destroy_component(backgroundart);
    			destroy_component(songlistbackground);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let $appTitle;
    	validate_store(appTitle, "appTitle");
    	component_subscribe($$self, appTitle, $$value => $$invalidate(0, $appTitle = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	onMount(() => {
    		syncDbVersionIPC();

    		// getNewDbChangesProgress()
    		window.onkeydown = function (e) {
    			return !(e.code == "Space" && e.target == document.body);
    		};

    		window.addEventListener("contextmenu", e => {
    			e.preventDefault();
    			const pathsName = e.composedPath().map(path => path.tagName);

    			if (pathsName.includes("ALBUM")) {
    				let albumElement = e.composedPath().find(path => path.tagName === "ALBUM");
    				let albumID = albumElement.getAttribute("id");
    				showContextMenuIPC("AlbumContextMenu", JSON.stringify({ albumID }));
    			}
    		});
    	}); // window.onclick = (evt: MouseEvent) => {
    	// 	let songListSvelteFound = false
    	// 	evt['path'].forEach((element: HTMLElement) => {
    	// 		if (element.tagName === 'SONG-LIST-SVLT') {

    	// 			songListSvelteFound = true
    	// 		}
    	// 	})
    	// 	if (songListSvelteFound === false) {
    	// 		$selectedSongs = []
    	// 		songListSvelteFound = false
    	// 	}
    	// }
    	function getNewDbChangesProgress() {
    		getChangesProgressIPC().then(result => {
    			console.log(result.total, result.current, 100 / result.total * result.current || 0, "%");

    			setTimeout(
    				() => {
    					getNewDbChangesProgress();
    				},
    				10000
    			);
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Navigation,
    		ArtGrid,
    		Grouping,
    		Player,
    		SongList,
    		TagEdit,
    		ConfigController,
    		PlayerController,
    		BackgroundArt,
    		SongListBackground,
    		onMount,
    		getChangesProgressIPC,
    		showContextMenuIPC,
    		syncDbVersionIPC,
    		albumListStore,
    		appTitle,
    		getNewDbChangesProgress,
    		$appTitle
    	});

    	return [$appTitle];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$l.name
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
