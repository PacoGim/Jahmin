
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
        return new Promise((resolve) => {
            let storeDbVersion = undefined;
            dbVersion.subscribe((value) => (storeDbVersion = value))();
            // Waits for the version to change in main.
            ipcRenderer.invoke('sync-db-version', storeDbVersion).then((result) => {
                dbVersion.set(result);
                // console.log('New Version: ', result)
                resolve(result);
                setTimeout(() => {
                    syncDbVersionIPC();
                }, 2000);
            });
        });
    }

    async function getAlbumColors(id) {
        getAlbumColorsIPC(id).then((color) => {
            document.documentElement.style.setProperty('--low-color', `hsl(${color.hue},${color.saturation}%,${color.lightnessLow}%)`);
            document.documentElement.style.setProperty('--base-color', `hsl(${color.hue},${color.saturation}%,${color.lightnessBase}%)`);
            document.documentElement.style.setProperty('--high-color', `hsl(${color.hue},${color.saturation}%,${color.lightnessHigh}%)`);
        });
    }

    async function setNewPlayback(albumID, playbackSongs, indexToPlay, playNow) {
        albumPlayingIdStore.set(albumID);
        playbackStore.set(playbackSongs);
        playbackCursor.set([indexToPlay, playNow]);
        getAlbumColors(albumID);
    }

    function scrollSongListToTop() {
        document.querySelector('song-list-svlt').scrollTop = 0;
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

    // (96:2) {:else}
    function create_else_block(ctx) {
    	let album_artist;

    	const block = {
    		c: function create() {
    			album_artist = element("album-artist");
    			set_custom_element_data(album_artist, "class", "svelte-1jsw531");
    			add_location(album_artist, file$2, 96, 3, 3701);
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
    		source: "(96:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (94:54) 
    function create_if_block_1$1(ctx) {
    	let album_artist;
    	let t_value = /*album*/ ctx[0]["DynamicAlbumArtist"] + "";
    	let t;

    	const block = {
    		c: function create() {
    			album_artist = element("album-artist");
    			t = text(t_value);
    			set_custom_element_data(album_artist, "class", "svelte-1jsw531");
    			add_location(album_artist, file$2, 94, 3, 3629);
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
    		source: "(94:54) ",
    		ctx
    	});

    	return block;
    }

    // (92:2) {#if album['AlbumArtist'] !== undefined}
    function create_if_block$1(ctx) {
    	let album_artist;
    	let t_value = /*album*/ ctx[0]["AlbumArtist"] + "";
    	let t;

    	const block = {
    		c: function create() {
    			album_artist = element("album-artist");
    			t = text(t_value);
    			set_custom_element_data(album_artist, "class", "svelte-1jsw531");
    			add_location(album_artist, file$2, 92, 3, 3519);
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
    		source: "(92:2) {#if album['AlbumArtist'] !== undefined}",
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
    			set_custom_element_data(overlay_gradient, "class", "svelte-1jsw531");
    			add_location(overlay_gradient, file$2, 86, 1, 3390);
    			set_custom_element_data(album_name, "class", "svelte-1jsw531");
    			add_location(album_name, file$2, 89, 2, 3431);
    			set_custom_element_data(album_details, "class", "svelte-1jsw531");
    			add_location(album_details, file$2, 88, 1, 3413);
    			attr_dev(album_1, "id", album_1_id_value = /*album*/ ctx[0].ID);

    			attr_dev(album_1, "class", album_1_class_value = "" + (null_to_empty(/*$selectedAlbumId*/ ctx[1] === /*album*/ ctx[0]?.ID
    			? "selected"
    			: "") + " svelte-1jsw531"));

    			add_location(album_1, file$2, 83, 0, 3252);
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
    			: "") + " svelte-1jsw531"))) {
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

    	function selectLastPlayedSong() {
    		$$invalidate(0, album["Songs"] = album["Songs"].sort((a, b) => a["Track"] - b["Track"]), album);

    		// $selectedAlbumId = album
    		let lastPlayedSong = album["Songs"].find(i => i["ID"] === Number(localStorage.getItem("LastPlayedSongID")));

    		if (lastPlayedSong) {
    			let lastPlayedSongID = lastPlayedSong["ID"];

    			if (lastPlayedSongID) {
    				setTimeout(
    					() => {
    						let $song = document.querySelector(`#${CSS.escape(String(lastPlayedSongID))}`);

    						if ($song) {
    							$song.scrollIntoView({ block: "center" });
    						}
    					},
    					100
    				);
    			}
    		}
    	}

    	// function fetchAlbumCover() {
    	// 	getCoverIPC(album['RootDir']).then((result) => {
    	// 		if (result !== null) {
    	// 			coverSrc = result['filePath']
    	// 			coverType = result['fileType']
    	// 		} else {
    	// 			coverType = 'not found'
    	// 		}
    	// 	})
    	// }
    	// function addIntersectionObserver() {
    	// 	new IntersectionObserver(
    	// 		(entries) => {
    	// 			if (entries[0].isIntersecting === true && coverSrc === undefined) {
    	// 				fetchAlbumCover()
    	// 			}
    	// 		},
    	// 		{ root: document.querySelector(`art-grid-svlt`), threshold: 0, rootMargin: '0px 0px 50% 0px' }
    	// 	).observe(document.querySelector(`art-grid-svlt > #${CSS.escape(album['ID'])}`))
    	// }
    	// On Album Click/Double Click
    	function prepareAlbum(evt) {
    		return __awaiter(this, void 0, void 0, function* () {
    			scrollSongListToTop();

    			// Song Sorting
    			$$invalidate(0, album["Songs"] = album["Songs"].sort((a, b) => a["Track"] - b["Track"]), album);

    			// $selectedAlbumId = album
    			if (evt["type"] === "dblclick") ; // setNewPlayback(album['ID'], 0, true)
    		});
    	}

    	const writable_props = ["album", "index"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Album> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("album" in $$props) $$invalidate(0, album = $$props.album);
    		if ("index" in $$props) $$invalidate(2, index = $$props.index);
    	};

    	$$self.$capture_state = () => ({
    		__awaiter,
    		onMount,
    		getCoverIPC,
    		setNewPlayback,
    		scrollSongListToTop,
    		albumPlayingIdStore,
    		selectedAlbumId,
    		CoverArt,
    		album,
    		index,
    		coverType,
    		coverSrc,
    		selectLastPlayedSong,
    		prepareAlbum,
    		$selectedAlbumId
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
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

    			set_custom_element_data(art_grid_svlt, "class", "svelte-ueqdm");
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
    			add_location(polygon, file$6, 34, 1, 898);
    			attr_dev(rect, "x", "0");
    			attr_dev(rect, "y", "4.75");
    			attr_dev(rect, "transform", "matrix(-1 -1.224647e-16 1.224647e-16 -1 10 96.5001)");
    			attr_dev(rect, "width", "10");
    			attr_dev(rect, "height", "87");
    			add_location(rect, file$6, 35, 1, 942);
    			attr_dev(svg, "class", "player-button");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "id", "Layer_1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "x", "0px");
    			attr_dev(svg, "y", "0px");
    			attr_dev(svg, "viewBox", "0 0 100 100");
    			attr_dev(svg, "xml:space", "preserve");
    			add_location(svg, file$6, 23, 0, 656);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, polygon);
    			append_dev(svg, rect);

    			if (!mounted) {
    				dispose = listen_dev(svg, "click", /*click_handler*/ ctx[1], false, false, false);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PreviousButton", slots, []);
    	let { player } = $$props;
    	const writable_props = ["player"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PreviousButton> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => previousButtonEvent();

    	$$self.$$set = $$props => {
    		if ("player" in $$props) $$invalidate(0, player = $$props.player);
    	};

    	$$self.$capture_state = () => ({ player });

    	$$self.$inject_state = $$props => {
    		if ("player" in $$props) $$invalidate(0, player = $$props.player);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [player, click_handler];
    }

    class PreviousButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { player: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PreviousButton",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*player*/ ctx[0] === undefined && !("player" in props)) {
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
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			player_progress = element("player-progress");
    			progress_foreground = element("progress-foreground");
    			t = space();
    			img = element("img");
    			set_custom_element_data(progress_foreground, "class", "svelte-13v4vxv");
    			add_location(progress_foreground, file$8, 81, 1, 3718);
    			attr_dev(img, "id", "waveform-image");
    			if (img.src !== (img_src_value = "")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-13v4vxv");
    			add_location(img, file$8, 82, 1, 3743);
    			set_custom_element_data(player_progress, "class", "svelte-13v4vxv");
    			add_location(player_progress, file$8, 80, 0, 3699);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, player_progress, anchor);
    			append_dev(player_progress, progress_foreground);
    			append_dev(player_progress, t);
    			append_dev(player_progress, img);
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
    	let progressBackgroundEl = undefined;
    	let isPlaybackCursorFirstAssign = true;

    	function getWaveformImage(index) {
    		return __awaiter(this, void 0, void 0, function* () {
    			let song = $playbackStore === null || $playbackStore === void 0
    			? void 0
    			: $playbackStore[index];

    			// Fade Out
    			progressBackgroundEl.style.opacity = "0";

    			getWaveformIPC(song.SourceFile).then(waveformUrl => {
    				let currentSongPlaying = $playbackStore[$playbackCursor[0]];

    				/* If the song and the actual playing song ID match, it shows the waveform.
        Prevents multiple waveforms to be shown back to back and makes sure the proper waveform is for the proper playing song.*/
    				if (currentSongPlaying.ID === song.ID) {
    					// Timeout used to Fade In AFTER the css Fade Out
    					setTimeout(
    						() => {
    							progressBackgroundEl.src = waveformUrl;
    							progressBackgroundEl.style.opacity = "1";
    						},
    						250
    					);
    				}
    			});
    		});
    	}

    	onMount(() => {
    		hookPlayerProgressEvents();
    		progressBackgroundEl = document.querySelector("img#waveform-image");
    	});

    	function hookPlayerProgressEvents() {
    		let playerProgress = document.querySelector("player-progress");
    		let playerForeground = document.querySelector("player-progress progress-foreground");
    		playerProgress.addEventListener("mouseenter", () => isMouseIn = true);
    		playerProgress.addEventListener("mouseleave", () => isMouseIn = false);
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
    		player,
    		song,
    		pauseDebounce,
    		isMouseDown,
    		isMouseIn,
    		progressBackgroundEl,
    		isPlaybackCursorFirstAssign,
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
    		if ("progressBackgroundEl" in $$props) progressBackgroundEl = $$props.progressBackgroundEl;
    		if ("isPlaybackCursorFirstAssign" in $$props) $$invalidate(2, isPlaybackCursorFirstAssign = $$props.isPlaybackCursorFirstAssign);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*isPlaybackCursorFirstAssign, $playbackCursor*/ 12) {
    			 {
    				if (isPlaybackCursorFirstAssign === true) {
    					$$invalidate(2, isPlaybackCursorFirstAssign = false);
    				} else {
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

    function getWaveformIPCData(arrayBuffer) {
        return new Promise(async (resolve, reject) => {
            let ctx = new window.AudioContext();
            let audioBuffer = await ctx.decodeAudioData(arrayBuffer);
            let filteredData = filterData(audioBuffer);
            let normalizedData = normalizeData(filteredData);
            resolve(normalizedData);
        });
    }
    function filterData(audioBuffer) {
        const rawData = audioBuffer.getChannelData(0);
        // console.log(rawData)
        const samples = 65535 / 10;
        // const samples = 500
        const blockSize = Math.floor(rawData.length / samples);
        const filteredData = [];
        for (let i = 0; i < samples; i++) {
            let blockStart = blockSize * i;
            let sum = 0;
            for (let j = 0; j < blockSize; j++) {
                sum = sum + Math.abs(rawData[blockStart + j]);
            }
            if (isNaN(sum))
                sum = 0;
            filteredData.push(sum / blockSize);
        }
        return filteredData;
    }
    function normalizeData(filteredData) {
        const multiplier = Math.pow(Math.max(...filteredData), -1);
        return filteredData.map((n) => n * multiplier);
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
    			add_location(track, file$a, 145, 2, 5603);
    			audio.controls = audio_controls_value = true;
    			attr_dev(audio, "class", "svelte-g8dn23");
    			add_location(audio, file$a, 144, 1, 5485);
    			set_custom_element_data(player_buttons, "class", "svelte-g8dn23");
    			add_location(player_buttons, file$a, 148, 1, 5641);
    			set_custom_element_data(player_svlt, "class", "svelte-g8dn23");
    			add_location(player_svlt, file$a, 143, 0, 5470);
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
    	let $albumPlayingIdStore;
    	validate_store(playbackCursor, "playbackCursor");
    	component_subscribe($$self, playbackCursor, $$value => $$invalidate(5, $playbackCursor = $$value));
    	validate_store(playbackStore, "playbackStore");
    	component_subscribe($$self, playbackStore, $$value => $$invalidate(13, $playbackStore = $$value));
    	validate_store(isPlaying, "isPlaying");
    	component_subscribe($$self, isPlaying, $$value => $$invalidate(14, $isPlaying = $$value));
    	validate_store(albumPlayingIdStore, "albumPlayingIdStore");
    	component_subscribe($$self, albumPlayingIdStore, $$value => $$invalidate(15, $albumPlayingIdStore = $$value));
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
    		getWaveformIPCData,
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
    			add_location(img0, file$b, 22, 1, 688);
    			attr_dev(img1, "class", "star svelte-1vgxguc");
    			if (img1.src !== (img1_src_value = "./img/star/star-" + /*starLevel*/ ctx[0] + ".svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$b, 36, 1, 1106);
    			attr_dev(stars, "class", "svelte-1vgxguc");
    			add_location(stars, file$b, 21, 0, 614);
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
    	let t0_value = /*song*/ ctx[0].Track + "";
    	let t0;
    	let t1;
    	let song_title;
    	let t2_value = /*song*/ ctx[0].Title + "";
    	let t2;
    	let t3;
    	let star;
    	let t4;
    	let song_duration;
    	let t5_value = parseDuration(/*song*/ ctx[0].Duration) + "";
    	let t5;
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
    			t0 = text(t0_value);
    			t1 = space();
    			song_title = element("song-title");
    			t2 = text(t2_value);
    			t3 = space();
    			create_component(star.$$.fragment);
    			t4 = space();
    			song_duration = element("song-duration");
    			t5 = text(t5_value);
    			set_custom_element_data(song_number, "class", "svelte-6gpb2w");
    			add_location(song_number, file$c, 39, 1, 1183);
    			set_custom_element_data(song_title, "class", "svelte-6gpb2w");
    			add_location(song_title, file$c, 41, 1, 1274);
    			set_custom_element_data(song_duration, "class", "svelte-6gpb2w");
    			add_location(song_duration, file$c, 43, 1, 1372);
    			set_custom_element_data(song_list_item, "id", song_list_item_id_value = /*song*/ ctx[0].ID);
    			set_custom_element_data(song_list_item, "index", /*index*/ ctx[1]);

    			set_custom_element_data(song_list_item, "class", song_list_item_class_value = "\n\t" + (/*$playbackCursor*/ ctx[2][0] === /*index*/ ctx[1] && /*$selectedAlbumId*/ ctx[3] === /*$albumPlayingIdStore*/ ctx[4]
    			? "playing"
    			: "") + "\n\t" + (/*$selectedSongsStore*/ ctx[5].includes(/*song*/ ctx[0].ID)
    			? "selected"
    			: "") + " svelte-6gpb2w");

    			add_location(song_list_item, file$c, 29, 0, 929);
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
    			mount_component(star, song_list_item, null);
    			append_dev(song_list_item, t4);
    			append_dev(song_list_item, song_duration);
    			append_dev(song_duration, t5);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*song*/ 1) && t0_value !== (t0_value = /*song*/ ctx[0].Track + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*song*/ 1) && t2_value !== (t2_value = /*song*/ ctx[0].Title + "")) set_data_dev(t2, t2_value);
    			const star_changes = {};
    			if (dirty & /*song*/ 1) star_changes.songRating = /*song*/ ctx[0].Rating;
    			star.$set(star_changes);
    			if ((!current || dirty & /*song*/ 1) && t5_value !== (t5_value = parseDuration(/*song*/ ctx[0].Duration) + "")) set_data_dev(t5, t5_value);

    			if (!current || dirty & /*song*/ 1 && song_list_item_id_value !== (song_list_item_id_value = /*song*/ ctx[0].ID)) {
    				set_custom_element_data(song_list_item, "id", song_list_item_id_value);
    			}

    			if (!current || dirty & /*index*/ 2) {
    				set_custom_element_data(song_list_item, "index", /*index*/ ctx[1]);
    			}

    			if (!current || dirty & /*$playbackCursor, index, $selectedAlbumId, $albumPlayingIdStore, $selectedSongsStore, song*/ 63 && song_list_item_class_value !== (song_list_item_class_value = "\n\t" + (/*$playbackCursor*/ ctx[2][0] === /*index*/ ctx[1] && /*$selectedAlbumId*/ ctx[3] === /*$albumPlayingIdStore*/ ctx[4]
    			? "playing"
    			: "") + "\n\t" + (/*$selectedSongsStore*/ ctx[5].includes(/*song*/ ctx[0].ID)
    			? "selected"
    			: "") + " svelte-6gpb2w")) {
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
    	let $playbackCursor;
    	let $selectedAlbumId;
    	let $albumPlayingIdStore;
    	let $selectedSongsStore;
    	validate_store(playbackCursor, "playbackCursor");
    	component_subscribe($$self, playbackCursor, $$value => $$invalidate(2, $playbackCursor = $$value));
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
    		playbackCursor,
    		selectedAlbumId,
    		selectedSongsStore,
    		Star,
    		song,
    		index,
    		parseDuration,
    		setStar,
    		$playbackCursor,
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
    		$playbackCursor,
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
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    // (48:1) {#if $songListStore !== undefined}
    function create_if_block$2(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = /*$songListStore*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*song*/ ctx[7].ID;
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
    			if (dirty & /*$songListStore*/ 1) {
    				const each_value = /*$songListStore*/ ctx[0];
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
    		source: "(48:1) {#if $songListStore !== undefined}",
    		ctx
    	});

    	return block;
    }

    // (49:2) {#each $songListStore as song, index (song.ID)}
    function create_each_block$2(key_1, ctx) {
    	let first;
    	let songlistitem;
    	let current;

    	songlistitem = new SongListItem({
    			props: {
    				song: /*song*/ ctx[7],
    				index: /*index*/ ctx[9]
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
    			if (dirty & /*$songListStore*/ 1) songlistitem_changes.song = /*song*/ ctx[7];
    			if (dirty & /*$songListStore*/ 1) songlistitem_changes.index = /*index*/ ctx[9];
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
    		source: "(49:2) {#each $songListStore as song, index (song.ID)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let song_list_svlt;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*$songListStore*/ ctx[0] !== undefined && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			song_list_svlt = element("song-list-svlt");
    			if (if_block) if_block.c();
    			set_custom_element_data(song_list_svlt, "class", "svelte-1pk1mov");
    			add_location(song_list_svlt, file$d, 46, 0, 1852);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, song_list_svlt, anchor);
    			if (if_block) if_block.m(song_list_svlt, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(song_list_svlt, "click", /*click_handler*/ ctx[4], false, false, false);
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
    			mounted = false;
    			dispose();
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

    function instance$d($$self, $$props, $$invalidate) {
    	let $selectedAlbumId;
    	let $selectedSongsStore;
    	let $songListStore;
    	validate_store(selectedAlbumId, "selectedAlbumId");
    	component_subscribe($$self, selectedAlbumId, $$value => $$invalidate(3, $selectedAlbumId = $$value));
    	validate_store(selectedSongsStore, "selectedSongsStore");
    	component_subscribe($$self, selectedSongsStore, $$value => $$invalidate(6, $selectedSongsStore = $$value));
    	validate_store(songListStore, "songListStore");
    	component_subscribe($$self, songListStore, $$value => $$invalidate(0, $songListStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SongList", slots, []);
    	let isSelectedAlbumIdFirstAssign = true;
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

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SongList> was created with unknown prop '${key}'`);
    	});

    	const click_handler = e => selectSongs(e);

    	$$self.$capture_state = () => ({
    		SongListItem,
    		scrollSongListToTop,
    		selectedAlbumId,
    		songListStore,
    		selectedSongsStore,
    		isSelectedAlbumIdFirstAssign,
    		lastSelectedSong,
    		selectSongs,
    		$selectedAlbumId,
    		$selectedSongsStore,
    		$songListStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("isSelectedAlbumIdFirstAssign" in $$props) $$invalidate(2, isSelectedAlbumIdFirstAssign = $$props.isSelectedAlbumIdFirstAssign);
    		if ("lastSelectedSong" in $$props) lastSelectedSong = $$props.lastSelectedSong;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$selectedAlbumId, isSelectedAlbumIdFirstAssign*/ 12) {
    			 {

    				if (isSelectedAlbumIdFirstAssign) {
    					$$invalidate(2, isSelectedAlbumIdFirstAssign = false);
    				} else {
    					scrollSongListToTop();
    				}
    			}
    		}
    	};

    	return [
    		$songListStore,
    		selectSongs,
    		isSelectedAlbumIdFirstAssign,
    		$selectedAlbumId,
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
            'before Nano ID. If you use Expo, install `expo-random` ' +
            'and use `nanoid/async`.'
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
    	let current;

    	function tagediteditor0_value_binding(value) {
    		/*tagediteditor0_value_binding*/ ctx[15].call(null, value);
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
    		/*tagediteditor1_value_binding*/ ctx[16].call(null, value);
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
    		/*tagediteditor2_value_binding*/ ctx[17].call(null, value);
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
    		/*tagediteditor3_value_binding*/ ctx[18].call(null, value);
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
    		/*tagediteditor4_value_binding*/ ctx[19].call(null, value);
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
    		/*tagediteditor5_value_binding*/ ctx[20].call(null, value);
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
    		/*tagediteditor6_value_binding*/ ctx[21].call(null, value);
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
    		/*tagediteditor7_value_binding*/ ctx[22].call(null, value);
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
    		/*tagediteditor8_value_binding*/ ctx[23].call(null, value);
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
    		/*tagediteditor9_value_binding*/ ctx[24].call(null, value);
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
    		/*tagediteditor10_value_binding*/ ctx[25].call(null, value);
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
    		/*tagediteditor11_value_binding*/ ctx[26].call(null, value);
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
    			set_custom_element_data(component_name, "class", "svelte-1tatulc");
    			add_location(component_name, file$g, 315, 1, 9223);
    			set_custom_element_data(track_disc_tag_editor, "class", "svelte-1tatulc");
    			add_location(track_disc_tag_editor, file$g, 320, 1, 9418);
    			set_custom_element_data(date_tag_editor, "class", "svelte-1tatulc");
    			add_location(date_tag_editor, file$g, 339, 1, 10245);
    			set_custom_element_data(tag_edit_svlt, "class", "svelte-1tatulc");
    			add_location(tag_edit_svlt, file$g, 314, 0, 9206);
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
    	component_subscribe($$self, selectedAlbumId, $$value => $$invalidate(13, $selectedAlbumId = $$value));
    	validate_store(selectedSongsStore, "selectedSongsStore");
    	component_subscribe($$self, selectedSongsStore, $$value => $$invalidate(14, $selectedSongsStore = $$value));
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

    	// let newTags: TagDetailType = {
    	// 	Album: undefined,
    	// 	AlbumArtist: undefined,
    	// 	Artist: undefined,
    	// 	Comment: undefined,
    	// 	Composer: undefined,
    	// 	Date_Year: undefined,
    	// 	Date_Month: undefined,
    	// 	Date_Day: undefined,
    	// 	DiscNumber: undefined,
    	// 	Genre: undefined,
    	// 	Rating: undefined,
    	// 	Title: undefined,
    	// 	Track: undefined
    	// }
    	let previousSongList = undefined;

    	function foo() {
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
    	}

    	function groupSongs() {
    		resetFields();

    		// Goes through every song and checks every tag.
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
    		}
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
    		TagEditSeparator: TagEdit_Separator,
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
    		previousSongList,
    		foo,
    		checkSongs,
    		resetFields,
    		groupSongs,
    		$selectedAlbumId,
    		$selectedSongsStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("isSelectedSongsFirstAssign" in $$props) $$invalidate(12, isSelectedSongsFirstAssign = $$props.isSelectedSongsFirstAssign);
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
    		if ("previousSongList" in $$props) previousSongList = $$props.previousSongList;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*albumTag, titleTag, commentTag, trackTag, discNumberTag, composerTag, genreTag, artistTag, albumArtistTag, dateYearTag, dateMonthTag, dateDayTag*/ 4095) {
    			 {
    				foo();
    			}
    		}

    		if ($$self.$$.dirty[0] & /*$selectedAlbumId, $selectedSongsStore, isSelectedSongsFirstAssign*/ 28672) {
    			 {

    				if (isSelectedSongsFirstAssign === true) {
    					$$invalidate(12, isSelectedSongsFirstAssign = false);
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

    		// let lastPlayedSongId = localStorage.getItem('LastPlayedSongID')
    		let lastPlayedSongIndex = Number(localStorage.getItem("LastPlayedSongIndex"));

    		getAlbumColors(lastPlayedAlbumId);
    		set_store_value(selectedAlbumId, $selectedAlbumId = lastPlayedAlbumId, $selectedAlbumId);

    		getAlbumIPC(lastPlayedAlbumId).then(result => {
    			set_store_value(songListStore, $songListStore = result.Songs, $songListStore);
    			setNewPlayback(lastPlayedAlbumId, $songListStore, lastPlayedSongIndex, false);
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
    					setNewPlayback(ALBUM_ID, result.Songs, 0, true);
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
    			const SONG_INDEX = Number(SONG_LIST_ITEM_ELEMENT.getAttribute("index"));

    			if (evt.type === "dblclick") {
    				getAlbumIPC($selectedAlbumId).then(result => {
    					setNewPlayback($selectedAlbumId, result.Songs, SONG_INDEX, true);
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
    			attr_dev(main, "class", "svelte-qj5o4s");
    			add_location(main, file$j, 49, 0, 1746);
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
    			console.log(100 / result["total"] * result["current"], "% Total:", result["total"], " Current:", result["current"]);

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
    		syncDbVersionIPC,
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
