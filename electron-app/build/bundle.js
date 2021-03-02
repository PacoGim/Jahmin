
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

    let dbVersion = writable(0);
    // 'Genre', 'AlbumArtist', 'Album'
    let valuesToGroup = writable([]);
    // Value choosen by the user to filter out the specified tag from the song index.
    let valuesToFilter = writable([]);
    let isValuesToFilterChanged = writable(false);
    let storeConfig = writable(undefined);
    let songList = writable(undefined);
    let isDoneDrawing = writable(false);
    let appTitle = writable('Jahmin');
    /*
        selectedSongs used in:
            App.svelte
            SongList.svelte
            SongListItem.svelte
    */
    let selectedSongs = writable([]);
    let waveformUrl = writable('');

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
    function saveConfig(newConfig) {
        return new Promise((resolve, reject) => {
            ipcRenderer.invoke('save-config', newConfig).then((result) => {
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
                resolve(result);
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
            ipcRenderer.invoke('sync-db-version', storeDbVersion).then((result) => {
                dbVersion.set(result);
                console.log('New Version: ', result);
                resolve(result);
                setTimeout(() => {
                    syncDbVersionIPC();
                }, 2000);
            });
        });
    }

    async function getAlbumColors(id) {
        // let albumImagePath: string = document.querySelector(`#${CSS.escape(id)}`).querySelector('img').getAttribute('src')
        // if (albumImagePath) {
        getAlbumColorsIPC(id).then((color) => {
            document.documentElement.style.setProperty('--low-color', `hsl(${color.hue},${color.saturation}%,${color.lightnessLow}%)`);
            document.documentElement.style.setProperty('--base-color', `hsl(${color.hue},${color.saturation}%,${color.lightnessBase}%)`);
            document.documentElement.style.setProperty('--high-color', `hsl(${color.hue},${color.saturation}%,${color.lightnessHigh}%)`);
        });
        // }
    }

    let playbackIndex = writable({
        indexToPlay: 0,
        playNow: false
    });
    let isPlaying = writable(false);
    let playback = writable(undefined);
    let selectedAlbum = writable(undefined);

    async function setNewPlayback(albumID, index, playNow) {
        let songs = await fetchAlbum(albumID);
        getAlbumColors(albumID);
        playback.set({
            AlbumID: albumID,
            SongList: songs
        });
        playbackIndex.set(undefined);
        playbackIndex.set({
            indexToPlay: index,
            playNow
        });
    }
    function fetchAlbum(albumID) {
        return new Promise(async (resolve, reject) => {
            let album = await getAlbumIPC(albumID);
            let songs = album['Songs'].sort((a, b) => a['Track'] - b['Track']);
            resolve(songs);
        });
    }

    function scrollSongListToTop() {
        document.querySelector('song-list-svlt').scrollTop = 0;
    }

    /* src/components/Album.svelte generated by Svelte v3.31.0 */
    const file$1 = "src/components/Album.svelte";

    // (90:1) {#if coverType === undefined}
    function create_if_block_5(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = "./img/audio.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "loader svelte-1fnukjt");
    			attr_dev(img, "alt", "");
    			add_location(img, file$1, 90, 2, 3617);
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
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(90:1) {#if coverType === undefined}",
    		ctx
    	});

    	return block;
    }

    // (93:1) {#if coverType === 'not found'}
    function create_if_block_4(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = "./img/compact-disc.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "notFound svelte-1fnukjt");
    			attr_dev(img, "alt", "");
    			add_location(img, file$1, 92, 32, 3708);
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
    		source: "(93:1) {#if coverType === 'not found'}",
    		ctx
    	});

    	return block;
    }

    // (94:1) {#if coverType === 'image'}
    function create_if_block_3(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = /*coverSrc*/ ctx[2])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*album*/ ctx[0]["Name"]);
    			attr_dev(img, "class", "svelte-1fnukjt");
    			add_location(img, file$1, 93, 28, 3802);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*coverSrc*/ 4 && img.src !== (img_src_value = /*coverSrc*/ ctx[2])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*album*/ 1 && img_alt_value !== (img_alt_value = /*album*/ ctx[0]["Name"])) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(94:1) {#if coverType === 'image'}",
    		ctx
    	});

    	return block;
    }

    // (95:1) {#if coverType === 'video'}
    function create_if_block_2(ctx) {
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
    			add_location(track, file$1, 96, 3, 3906);
    			if (source.src !== (source_src_value = /*coverSrc*/ ctx[2])) attr_dev(source, "src", source_src_value);
    			add_location(source, file$1, 97, 3, 3935);
    			video.autoplay = true;
    			video.loop = true;
    			attr_dev(video, "class", "svelte-1fnukjt");
    			add_location(video, file$1, 95, 2, 3881);
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
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(95:1) {#if coverType === 'video'}",
    		ctx
    	});

    	return block;
    }

    // (112:2) {:else}
    function create_else_block(ctx) {
    	let album_artist;

    	const block = {
    		c: function create() {
    			album_artist = element("album-artist");
    			set_custom_element_data(album_artist, "class", "svelte-1fnukjt");
    			add_location(album_artist, file$1, 112, 3, 4350);
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
    		source: "(112:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (110:54) 
    function create_if_block_1(ctx) {
    	let album_artist;
    	let t_value = /*album*/ ctx[0]["DynamicAlbumArtist"] + "";
    	let t;

    	const block = {
    		c: function create() {
    			album_artist = element("album-artist");
    			t = text(t_value);
    			set_custom_element_data(album_artist, "class", "svelte-1fnukjt");
    			add_location(album_artist, file$1, 110, 3, 4278);
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
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(110:54) ",
    		ctx
    	});

    	return block;
    }

    // (108:2) {#if album['AlbumArtist'] !== undefined}
    function create_if_block(ctx) {
    	let album_artist;
    	let t_value = /*album*/ ctx[0]["AlbumArtist"] + "";
    	let t;

    	const block = {
    		c: function create() {
    			album_artist = element("album-artist");
    			t = text(t_value);
    			set_custom_element_data(album_artist, "class", "svelte-1fnukjt");
    			add_location(album_artist, file$1, 108, 3, 4168);
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
    		source: "(108:2) {#if album['AlbumArtist'] !== undefined}",
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
    	let img;
    	let img_src_value;
    	let t4;
    	let album_details;
    	let album_name;
    	let t5_value = /*album*/ ctx[0]["Name"] + "";
    	let t5;
    	let t6;
    	let album_1_class_value;
    	let album_1_id_value;
    	let mounted;
    	let dispose;
    	let if_block0 = /*coverType*/ ctx[1] === undefined && create_if_block_5(ctx);
    	let if_block1 = /*coverType*/ ctx[1] === "not found" && create_if_block_4(ctx);
    	let if_block2 = /*coverType*/ ctx[1] === "image" && create_if_block_3(ctx);
    	let if_block3 = /*coverType*/ ctx[1] === "video" && create_if_block_2(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*album*/ ctx[0]["AlbumArtist"] !== undefined) return create_if_block;
    		if (/*album*/ ctx[0]["DynamicAlbumArtist"] !== undefined) return create_if_block_1;
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
    			img = element("img");
    			t4 = space();
    			album_details = element("album-details");
    			album_name = element("album-name");
    			t5 = text(t5_value);
    			t6 = space();
    			if_block4.c();
    			if (img.src !== (img_src_value = "./img/gradient-overlay.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-1fnukjt");
    			add_location(img, file$1, 102, 1, 4012);
    			set_custom_element_data(album_name, "class", "svelte-1fnukjt");
    			add_location(album_name, file$1, 105, 2, 4080);
    			set_custom_element_data(album_details, "class", "svelte-1fnukjt");
    			add_location(album_details, file$1, 104, 1, 4062);

    			attr_dev(album_1, "class", album_1_class_value = "" + (null_to_empty(/*$selectedAlbum*/ ctx[3]?.["ID"] === /*album*/ ctx[0]?.["ID"]
    			? "selected"
    			: "") + " svelte-1fnukjt"));

    			attr_dev(album_1, "id", album_1_id_value = /*album*/ ctx[0]["ID"]);
    			add_location(album_1, file$1, 82, 0, 3377);
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
    			append_dev(album_1, img);
    			append_dev(album_1, t4);
    			append_dev(album_1, album_details);
    			append_dev(album_details, album_name);
    			append_dev(album_name, t5);
    			append_dev(album_details, t6);
    			if_block4.m(album_details, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(album_1, "dblclick", /*dblclick_handler*/ ctx[6], false, false, false),
    					listen_dev(album_1, "click", /*click_handler*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*coverType*/ ctx[1] === undefined) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_5(ctx);
    					if_block0.c();
    					if_block0.m(album_1, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*coverType*/ ctx[1] === "not found") {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_4(ctx);
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
    					if_block2 = create_if_block_3(ctx);
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
    					if_block3 = create_if_block_2(ctx);
    					if_block3.c();
    					if_block3.m(album_1, t3);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (dirty & /*album*/ 1 && t5_value !== (t5_value = /*album*/ ctx[0]["Name"] + "")) set_data_dev(t5, t5_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block4) {
    				if_block4.p(ctx, dirty);
    			} else {
    				if_block4.d(1);
    				if_block4 = current_block_type(ctx);

    				if (if_block4) {
    					if_block4.c();
    					if_block4.m(album_details, null);
    				}
    			}

    			if (dirty & /*$selectedAlbum, album*/ 9 && album_1_class_value !== (album_1_class_value = "" + (null_to_empty(/*$selectedAlbum*/ ctx[3]?.["ID"] === /*album*/ ctx[0]?.["ID"]
    			? "selected"
    			: "") + " svelte-1fnukjt"))) {
    				attr_dev(album_1, "class", album_1_class_value);
    			}

    			if (dirty & /*album*/ 1 && album_1_id_value !== (album_1_id_value = /*album*/ ctx[0]["ID"])) {
    				attr_dev(album_1, "id", album_1_id_value);
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
    			run_all(dispose);
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
    	let $playback;
    	let $selectedAlbum;
    	validate_store(playback, "playback");
    	component_subscribe($$self, playback, $$value => $$invalidate(8, $playback = $$value));
    	validate_store(selectedAlbum, "selectedAlbum");
    	component_subscribe($$self, selectedAlbum, $$value => $$invalidate(3, $selectedAlbum = $$value));
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
    		addIntersectionObserver();
    		let lastPlayedAlbumID = localStorage.getItem("LastPlayedAlbumID");

    		if (album["ID"] === lastPlayedAlbumID) {
    			if ($playback === undefined) {
    				set_store_value(playback, $playback = { AlbumID: lastPlayedAlbumID, SongList: [] }, $playback);
    				selectLastPlayedSong();
    			}
    		}
    	});

    	function selectLastPlayedSong() {
    		$$invalidate(0, album["Songs"] = album["Songs"].sort((a, b) => a["Track"] - b["Track"]), album);
    		set_store_value(selectedAlbum, $selectedAlbum = album, $selectedAlbum);
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

    						setNewPlayback(album["ID"], album["Songs"].findIndex(i => i["ID"] === lastPlayedSongID), false);
    					},
    					100
    				);
    			}
    		}
    	}

    	function fetchAlbumCover() {
    		getCoverIPC(album["RootDir"]).then(result => {
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
    			}).observe(document.querySelector(`art-grid-svlt > #${CSS.escape(album["ID"])}`));
    	}

    	// On Album Click/Double Click
    	function prepareAlbum(evt) {
    		return __awaiter(this, void 0, void 0, function* () {
    			scrollSongListToTop();

    			// Song Sorting
    			$$invalidate(0, album["Songs"] = album["Songs"].sort((a, b) => a["Track"] - b["Track"]), album);

    			set_store_value(selectedAlbum, $selectedAlbum = album, $selectedAlbum);

    			if (evt["type"] === "dblclick") {
    				setNewPlayback(album["ID"], 0, true);
    			}
    		});
    	}

    	const writable_props = ["album", "index"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Album> was created with unknown prop '${key}'`);
    	});

    	const dblclick_handler = evt => prepareAlbum(evt);
    	const click_handler = evt => prepareAlbum(evt);

    	$$self.$$set = $$props => {
    		if ("album" in $$props) $$invalidate(0, album = $$props.album);
    		if ("index" in $$props) $$invalidate(5, index = $$props.index);
    	};

    	$$self.$capture_state = () => ({
    		__awaiter,
    		onMount,
    		getCoverIPC,
    		setNewPlayback,
    		playback,
    		playbackIndex,
    		selectedAlbum,
    		scrollSongListToTop,
    		selectedSongs,
    		album,
    		index,
    		coverType,
    		coverSrc,
    		selectLastPlayedSong,
    		fetchAlbumCover,
    		addIntersectionObserver,
    		prepareAlbum,
    		$playback,
    		$selectedAlbum
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("album" in $$props) $$invalidate(0, album = $$props.album);
    		if ("index" in $$props) $$invalidate(5, index = $$props.index);
    		if ("coverType" in $$props) $$invalidate(1, coverType = $$props.coverType);
    		if ("coverSrc" in $$props) $$invalidate(2, coverSrc = $$props.coverSrc);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		album,
    		coverType,
    		coverSrc,
    		$selectedAlbum,
    		prepareAlbum,
    		index,
    		dblclick_handler,
    		click_handler
    	];
    }

    class Album extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { album: 0, index: 5 });

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

    		if (/*index*/ ctx[5] === undefined && !("index" in props)) {
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

    let selectedGroupByStore = writable('');
    let selectedGroupByValueStore = writable('');
    let albumListStore = writable([]);

    /* src/includes/ArtGrid.svelte generated by Svelte v3.31.0 */
    const file$2 = "src/includes/ArtGrid.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (57:1) {#each $albumListStore as album, index (album['ID'])}
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
    		source: "(57:1) {#each $albumListStore as album, index (album['ID'])}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
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
    			add_location(art_grid_svlt, file$2, 55, 0, 1906);
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
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function scrollToLastAlbumPlayed() {
    	let lastPlayedAlbumID = localStorage.getItem("LastPlayedAlbumID") || undefined;

    	if (lastPlayedAlbumID) {
    		let $album = document.querySelector(`#${CSS.escape(lastPlayedAlbumID)}`);

    		if ($album) {
    			$album.scrollIntoView({ block: "center" });
    		}
    	}
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $albumArtSizeConfig;
    	let $albumListStore;
    	validate_store(albumArtSizeConfig, "albumArtSizeConfig");
    	component_subscribe($$self, albumArtSizeConfig, $$value => $$invalidate(1, $albumArtSizeConfig = $$value));
    	validate_store(albumListStore, "albumListStore");
    	component_subscribe($$self, albumListStore, $$value => $$invalidate(0, $albumListStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ArtGrid", slots, []);

    	onMount(() => {
    		
    	}); // Whenever a filter is selected resets the scroll to top. Can't do it in reactive statement because querySelector gives undefined.
    	// isValuesToFilterChanged.subscribe(() => {
    	// 	document.querySelector('art-grid-svlt').scrollTop = 0
    	// })

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ArtGrid> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		Album,
    		albumArtSizeConfig,
    		albumListStore,
    		scrollToLastAlbumPlayed,
    		$albumArtSizeConfig,
    		$albumListStore
    	});

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$albumArtSizeConfig*/ 2) {
    			 if ($albumArtSizeConfig) document.documentElement.style.setProperty("--cover-dimension", `${$albumArtSizeConfig}px`);
    		}
    	};

    	return [$albumListStore, $albumArtSizeConfig];
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

    /* src/includes/Grouping.svelte generated by Svelte v3.31.0 */

    const file$3 = "src/includes/Grouping.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (74:2) {#each groups as group (group.id)}
    function create_each_block$1(key_1, ctx) {
    	let group;
    	let input;
    	let input_id_value;
    	let input_value_value;
    	let t0;
    	let label;
    	let t1_value = /*group*/ ctx[11].name + "";
    	let t1;
    	let label_for_value;
    	let t2;
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
    			attr_dev(input, "id", input_id_value = /*group*/ ctx[11].id);
    			attr_dev(input, "type", "radio");
    			input.__value = input_value_value = /*group*/ ctx[11].name;
    			input.value = input.__value;
    			attr_dev(input, "class", "svelte-z201rr");
    			/*$$binding_groups*/ ctx[7][0].push(input);
    			add_location(input, file$3, 75, 4, 2420);
    			attr_dev(label, "for", label_for_value = /*group*/ ctx[11].id);
    			attr_dev(label, "class", "svelte-z201rr");
    			add_location(label, file$3, 76, 4, 2514);
    			attr_dev(group, "class", "svelte-z201rr");
    			add_location(group, file$3, 74, 3, 2408);
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
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[6]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*groups*/ 4 && input_id_value !== (input_id_value = /*group*/ ctx[11].id)) {
    				attr_dev(input, "id", input_id_value);
    			}

    			if (dirty & /*groups*/ 4 && input_value_value !== (input_value_value = /*group*/ ctx[11].name)) {
    				prop_dev(input, "__value", input_value_value);
    				input.value = input.__value;
    			}

    			if (dirty & /*selectedGroupByValue*/ 2) {
    				input.checked = input.__value === /*selectedGroupByValue*/ ctx[1];
    			}

    			if (dirty & /*groups*/ 4 && t1_value !== (t1_value = /*group*/ ctx[11].name + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*groups*/ 4 && label_for_value !== (label_for_value = /*group*/ ctx[11].id)) {
    				attr_dev(label, "for", label_for_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(group);
    			/*$$binding_groups*/ ctx[7][0].splice(/*$$binding_groups*/ ctx[7][0].indexOf(input), 1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(74:2) {#each groups as group (group.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
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
    	const get_key = ctx => /*group*/ ctx[11].id;
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
    			add_location(option0, file$3, 62, 2, 2002);
    			option1.__value = "none";
    			option1.value = option1.__value;
    			add_location(option1, file$3, 63, 2, 2064);
    			option2.__value = "Genre";
    			option2.value = option2.__value;
    			add_location(option2, file$3, 64, 2, 2101);
    			option3.__value = "AlbumArtist";
    			option3.value = option3.__value;
    			add_location(option3, file$3, 65, 2, 2140);
    			option4.__value = "Album";
    			option4.value = option4.__value;
    			add_location(option4, file$3, 66, 2, 2192);
    			option5.__value = "Composer";
    			option5.value = option5.__value;
    			add_location(option5, file$3, 67, 2, 2231);
    			attr_dev(select, "class", "svelte-z201rr");
    			if (/*selectedGroupBy*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[5].call(select));
    			add_location(select, file$3, 61, 1, 1962);
    			set_custom_element_data(total_groups, "class", "svelte-z201rr");
    			add_location(total_groups, file$3, 70, 1, 2287);
    			attr_dev(groups_1, "class", "svelte-z201rr");
    			add_location(groups_1, file$3, 72, 1, 2359);
    			set_custom_element_data(grouping_svlt, "class", "svelte-z201rr");
    			add_location(grouping_svlt, file$3, 60, 0, 1945);
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
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[5]);
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function cutText(text) {
    	if (text) {
    		if (text.length > 20) {
    			return text.substr(0, 20) + "...";
    		} else {
    			return text;
    		}
    	} else {
    		return text;
    	}
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $selectedGroupByValueStore;
    	let $selectedGroupByStore;
    	validate_store(selectedGroupByValueStore, "selectedGroupByValueStore");
    	component_subscribe($$self, selectedGroupByValueStore, $$value => $$invalidate(8, $selectedGroupByValueStore = $$value));
    	validate_store(selectedGroupByStore, "selectedGroupByStore");
    	component_subscribe($$self, selectedGroupByStore, $$value => $$invalidate(9, $selectedGroupByStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Grouping", slots, []);
    	let selectedGroupBy = localStorage.getItem("GroupBy");
    	let selectedGroupByValue = localStorage.getItem("GroupByValue");

    	// let selection = selectedGroupByValue
    	let groups = [];

    	let firstSelectedGroupByAssign = true;
    	let firstSelectedGroupByValueAssign = true;

    	function getGrouping() {
    		getGroupingIPC(selectedGroupBy).then(result => $$invalidate(2, groups = result));
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
    		selectedGroupByStore,
    		selectedGroupByValueStore,
    		selectedGroupBy,
    		selectedGroupByValue,
    		groups,
    		firstSelectedGroupByAssign,
    		firstSelectedGroupByValueAssign,
    		getGrouping,
    		cutText,
    		$selectedGroupByValueStore,
    		$selectedGroupByStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("selectedGroupBy" in $$props) $$invalidate(0, selectedGroupBy = $$props.selectedGroupBy);
    		if ("selectedGroupByValue" in $$props) $$invalidate(1, selectedGroupByValue = $$props.selectedGroupByValue);
    		if ("groups" in $$props) $$invalidate(2, groups = $$props.groups);
    		if ("firstSelectedGroupByAssign" in $$props) $$invalidate(3, firstSelectedGroupByAssign = $$props.firstSelectedGroupByAssign);
    		if ("firstSelectedGroupByValueAssign" in $$props) $$invalidate(4, firstSelectedGroupByValueAssign = $$props.firstSelectedGroupByValueAssign);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*selectedGroupByValue, firstSelectedGroupByValueAssign*/ 18) {
    			 {

    				if (firstSelectedGroupByValueAssign === true) {
    					$$invalidate(4, firstSelectedGroupByValueAssign = false);

    					// Get Art Grid Albums as soon as the variable is set.
    					set_store_value(selectedGroupByValueStore, $selectedGroupByValueStore = selectedGroupByValue, $selectedGroupByValueStore);
    				} else {
    					if (selectedGroupByValue !== localStorage.getItem("GroupByValue")) {
    						// Get Art Grid Albums if grouping value is changed.
    						set_store_value(selectedGroupByValueStore, $selectedGroupByValueStore = selectedGroupByValue, $selectedGroupByValueStore);

    						localStorage.setItem("GroupByValue", selectedGroupByValue);
    					} //TODO Save to config file
    				}
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
    		firstSelectedGroupByValueAssign,
    		select_change_handler,
    		input_change_handler,
    		$$binding_groups
    	];
    }

    class Grouping extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Grouping",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    function nextSong() {
        let playback = undefined;
        playbackIndex.subscribe((playbackStore) => {
            playback = playbackStore;
        })();
        playbackIndex.set({
            indexToPlay: playback['indexToPlay'] + 1,
            playNow: true
        });
    }

    /* src/components/NextButton.svelte generated by Svelte v3.31.0 */
    const file$4 = "src/components/NextButton.svelte";

    function create_fragment$4(ctx) {
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
    			add_location(polygon, file$4, 24, 1, 498);
    			attr_dev(rect, "x", "90");
    			attr_dev(rect, "y", "5");
    			attr_dev(rect, "width", "10");
    			attr_dev(rect, "height", "87");
    			add_location(rect, file$4, 25, 1, 545);
    			attr_dev(svg, "class", "player-button");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "id", "Layer_1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "x", "0px");
    			attr_dev(svg, "y", "0px");
    			attr_dev(svg, "viewBox", "0 0 100 100");
    			attr_dev(svg, "xml:space", "preserve");
    			add_location(svg, file$4, 13, 0, 267);
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NextButton", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NextButton> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => nextSong();
    	$$self.$capture_state = () => ({ nextSong, playbackIndex });
    	return [click_handler];
    }

    class NextButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NextButton",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/components/PreviousButton.svelte generated by Svelte v3.31.0 */
    const file$5 = "src/components/PreviousButton.svelte";

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
    			attr_dev(polygon, "points", "13,48.5 100,92 100,5 ");
    			add_location(polygon, file$5, 33, 1, 819);
    			attr_dev(rect, "x", "0");
    			attr_dev(rect, "y", "4.75");
    			attr_dev(rect, "transform", "matrix(-1 -1.224647e-16 1.224647e-16 -1 10 96.5001)");
    			attr_dev(rect, "width", "10");
    			attr_dev(rect, "height", "87");
    			add_location(rect, file$5, 34, 1, 863);
    			attr_dev(svg, "class", "player-button");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "id", "Layer_1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "x", "0px");
    			attr_dev(svg, "y", "0px");
    			attr_dev(svg, "viewBox", "0 0 100 100");
    			attr_dev(svg, "xml:space", "preserve");
    			add_location(svg, file$5, 22, 0, 577);
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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $playbackIndex;
    	validate_store(playbackIndex, "playbackIndex");
    	component_subscribe($$self, playbackIndex, $$value => $$invalidate(3, $playbackIndex = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PreviousButton", slots, []);
    	let { player } = $$props;

    	function previousButtonEvent() {
    		if (player.currentTime < 1) {
    			if ($playbackIndex["indexToPlay"] > 0) {
    				set_store_value(
    					playbackIndex,
    					$playbackIndex = {
    						indexToPlay: $playbackIndex["indexToPlay"] - 1,
    						playNow: true
    					},
    					$playbackIndex
    				);
    			}
    		} else {
    			let index = $playbackIndex["indexToPlay"];
    			set_store_value(playbackIndex, $playbackIndex = undefined, $playbackIndex);
    			set_store_value(playbackIndex, $playbackIndex = { indexToPlay: index, playNow: true }, $playbackIndex);
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
    		playbackIndex,
    		player,
    		previousButtonEvent,
    		$playbackIndex
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
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { player: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PreviousButton",
    			options,
    			id: create_fragment$5.name
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
    const file$6 = "src/components/PlayButton.svelte";

    function create_fragment$6(ctx) {
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
    			add_location(left_part, file$6, 15, 1, 351);
    			set_custom_element_data(right_part, "class", "svelte-1lvzyl3");
    			add_location(right_part, file$6, 17, 1, 367);
    			set_custom_element_data(play_pause_button, "class", play_pause_button_class_value = "" + (null_to_empty(/*$isPlaying*/ ctx[0] ? "" : "playing") + " svelte-1lvzyl3"));
    			add_location(play_pause_button, file$6, 14, 0, 264);
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { player: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PlayButton",
    			options,
    			id: create_fragment$6.name
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
    const file$7 = "src/components/PlayerProgress.svelte";

    function create_fragment$7(ctx) {
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
    			set_custom_element_data(progress_foreground, "class", "svelte-1e5epd0");
    			add_location(progress_foreground, file$7, 79, 1, 3776);
    			attr_dev(img, "id", "progress-background");
    			if (img.src !== (img_src_value = "")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-1e5epd0");
    			add_location(img, file$7, 80, 1, 3801);
    			set_custom_element_data(player_progress, "class", "svelte-1e5epd0");
    			add_location(player_progress, file$7, 78, 0, 3757);
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
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $playbackIndex;
    	let $playback;
    	validate_store(playbackIndex, "playbackIndex");
    	component_subscribe($$self, playbackIndex, $$value => $$invalidate(2, $playbackIndex = $$value));
    	validate_store(playback, "playback");
    	component_subscribe($$self, playback, $$value => $$invalidate(7, $playback = $$value));
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

    	function fetchWave() {
    		return __awaiter(this, void 0, void 0, function* () {
    			if (($playback === null || $playback === void 0
    			? void 0
    			: $playback.SongList.length) > 0) {
    				// Keeps track of the song the getWaveformIPC fn was called for
    				let tempSong = $playback["SongList"][$playbackIndex["indexToPlay"]];

    				progressBackgroundEl.style.opacity = "0";

    				getWaveformIPC(tempSong["SourceFile"]).then(waveformUrl => {
    					setTimeout(
    						() => {
    							// Gets the actual song playing
    							let currentSongPlaying = $playback["SongList"][$playbackIndex["indexToPlay"]];

    							/*
    If the temporary song and the actual playing song match, it shows the waveform
    Prevents the multiple waveform show back to back and makes sure the proper waveform is for the proper song.
    */
    							if (tempSong["$loki"] === currentSongPlaying["$loki"]) {
    								progressBackgroundEl.src = waveformUrl;
    								progressBackgroundEl.style.opacity = "1";
    							}
    						},
    						250
    					);
    				});
    			}
    		});
    	}

    	onMount(() => {
    		hookPlayerProgressEvents();
    		progressBackgroundEl = document.querySelector("img#progress-background");
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
    		playback,
    		playbackIndex,
    		player,
    		song,
    		pauseDebounce,
    		isMouseDown,
    		isMouseIn,
    		progressBackgroundEl,
    		fetchWave,
    		hookPlayerProgressEvents,
    		$playbackIndex,
    		$playback
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("player" in $$props) $$invalidate(0, player = $$props.player);
    		if ("song" in $$props) $$invalidate(1, song = $$props.song);
    		if ("pauseDebounce" in $$props) pauseDebounce = $$props.pauseDebounce;
    		if ("isMouseDown" in $$props) isMouseDown = $$props.isMouseDown;
    		if ("isMouseIn" in $$props) isMouseIn = $$props.isMouseIn;
    		if ("progressBackgroundEl" in $$props) progressBackgroundEl = $$props.progressBackgroundEl;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$playbackIndex*/ 4) {
    			 {
    				fetchWave();
    			}
    		}
    	};

    	return [player, song, $playbackIndex];
    }

    class PlayerProgress extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { player: 0, song: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PlayerProgress",
    			options,
    			id: create_fragment$7.name
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
    const file$8 = "src/components/PlayerVolumeBar.svelte";

    function create_fragment$8(ctx) {
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
    			add_location(input, file$8, 41, 1, 1238);
    			attr_dev(background, "class", "svelte-1enb6co");
    			add_location(background, file$8, 52, 1, 1472);
    			set_custom_element_data(volume_thumb, "class", "svelte-1enb6co");
    			add_location(volume_thumb, file$8, 53, 1, 1488);
    			set_custom_element_data(volume_bar, "class", "svelte-1enb6co");
    			add_location(volume_bar, file$8, 40, 0, 1224);
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
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { player: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PlayerVolumeBar",
    			options,
    			id: create_fragment$8.name
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

    function drawWaveform(normalizedData) {
        const canvas = document.querySelector('canvas');
        const dpr = window.devicePixelRatio || 1;
        const padding = 0;
        canvas.width = canvas.offsetWidth * dpr;
        canvas.height = (canvas.offsetHeight + padding * 2) * dpr;
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        ctx.translate(0, canvas.offsetHeight / 2 + padding);
        const width = canvas.offsetWidth / normalizedData.length;
        processData(width, 0, normalizedData, canvas, ctx, window.getComputedStyle(document.body).getPropertyValue('--low-color'));
    }
    function processData(width, index, normalizedData, canvas, ctx, color) {
        if (index > normalizedData.length - 1) {
            isDoneDrawing.set(true);
            return;
        }
        const x = width * index;
        let y = normalizedData[index] * canvas.offsetHeight;
        if (y < 0) {
            y = 0;
        }
        drawLineSegment(ctx, x, y, width, (index + 1) % 2, color).then(() => {
            processData(width, ++index, normalizedData, canvas, ctx, color);
        });
    }
    function drawLineSegment(ctx, x, y, width, isEven, color) {
        return new Promise((resolve, reject) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = 0.2;
            ctx.beginPath();
            y = isEven ? y : -y;
            ctx.moveTo(x, 0);
            ctx.lineTo(x, y);
            ctx.lineTo(x + width, y);
            ctx.lineTo(x + width, 0);
            ctx.stroke();
            resolve('');
        });
    }

    function escapeString(data) {
        data = data.replace('#', escape('#'));
        return data;
    }

    /* src/includes/Player.svelte generated by Svelte v3.31.0 */
    const file$9 = "src/includes/Player.svelte";

    function create_fragment$9(ctx) {
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
    			add_location(track, file$9, 130, 2, 5018);
    			audio.controls = audio_controls_value = true;
    			attr_dev(audio, "class", "svelte-g8dn23");
    			add_location(audio, file$9, 129, 1, 4900);
    			set_custom_element_data(player_buttons, "class", "svelte-g8dn23");
    			add_location(player_buttons, file$9, 133, 1, 5056);
    			set_custom_element_data(player_svlt, "class", "svelte-g8dn23");
    			add_location(player_svlt, file$9, 128, 0, 4885);
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
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
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
    			});
    		});
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $playbackIndex;
    	let $isDoneDrawing;
    	let $isPlaying;
    	let $playback;
    	validate_store(playbackIndex, "playbackIndex");
    	component_subscribe($$self, playbackIndex, $$value => $$invalidate(4, $playbackIndex = $$value));
    	validate_store(isDoneDrawing, "isDoneDrawing");
    	component_subscribe($$self, isDoneDrawing, $$value => $$invalidate(5, $isDoneDrawing = $$value));
    	validate_store(isPlaying, "isPlaying");
    	component_subscribe($$self, isPlaying, $$value => $$invalidate(12, $isPlaying = $$value));
    	validate_store(playback, "playback");
    	component_subscribe($$self, playback, $$value => $$invalidate(13, $playback = $$value));
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
    	let drawWaveformDebounce = undefined;
    	let playingInterval = undefined;

    	onMount(() => {
    		$$invalidate(1, player = document.querySelector("audio"));
    	});

    	function stopPlayer() {
    		player.removeAttribute("src");
    		player.pause();
    		drawWaveform([0]);
    		document.documentElement.style.setProperty("--song-time", `0%`);
    		set_store_value(isPlaying, $isPlaying = false, $isPlaying);
    		return;
    	}

    	function playSong() {
    		return __awaiter(this, void 0, void 0, function* () {
    			if (($playback === null || $playback === void 0
    			? void 0
    			: $playback["SongList"]) === undefined) {
    				return;
    			}

    			let songBuffer = undefined;
    			$$invalidate(0, currentSong = $playback["SongList"][$playbackIndex["indexToPlay"]]);

    			if (currentSong === undefined) {
    				return stopPlayer();
    			}

    			if (currentSong["$loki"] !== (nextSongPreloaded === null || nextSongPreloaded === void 0
    			? void 0
    			: nextSongPreloaded["ID"])) {
    				songBuffer = yield fetchSong(escapeString(currentSong["SourceFile"]));
    			} else {
    				songBuffer = nextSongPreloaded["SongBuffer"];
    			}

    			const blob = new Blob([songBuffer]);
    			const url = window.URL.createObjectURL(blob);
    			$$invalidate(1, player.src = url, player);

    			if ($playbackIndex["playNow"] === false) {
    				player.pause();
    			} else {
    				player.play().catch(() => {
    					
    				});
    			}

    			localStorage.setItem("LastPlayedAlbumID", $playback["AlbumID"]);
    			localStorage.setItem("LastPlayedSongID", String(currentSong["ID"]));
    			preLoadNextSong();
    		});
    	}

    	function preLoadNextSong() {
    		return __awaiter(this, void 0, void 0, function* () {
    			const nextSong = $playback["SongList"][$playbackIndex["indexToPlay"] + 1];

    			if (nextSong) {
    				let songBuffer = yield fetchSong(escapeString(nextSong["SourceFile"]));

    				nextSongPreloaded = {
    					ID: nextSong["$loki"],
    					SongBuffer: songBuffer
    				};
    			}
    		});
    	}

    	function startInterval() {
    		// console.log('Start')
    		set_store_value(isPlaying, $isPlaying = true, $isPlaying);

    		clearInterval(playingInterval);

    		playingInterval = setInterval(
    			() => {
    				progress = 100 / currentSong["Duration"] * player.currentTime;
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Player> was created with unknown prop '${key}'`);
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
    		isDoneDrawing,
    		songList,
    		waveformUrl,
    		playbackIndex,
    		isPlaying,
    		playback,
    		getWaveformIPCData,
    		drawWaveform,
    		nextSong,
    		getWaveformIPC,
    		escapeString,
    		progress,
    		currentSong,
    		nextSongPreloaded,
    		player,
    		drawWaveformDebounce,
    		playingInterval,
    		resetProgress,
    		stopPlayer,
    		playSong,
    		preLoadNextSong,
    		fetchSong,
    		startInterval,
    		stopInterval,
    		$playbackIndex,
    		$isDoneDrawing,
    		$isPlaying,
    		$playback
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("progress" in $$props) progress = $$props.progress;
    		if ("currentSong" in $$props) $$invalidate(0, currentSong = $$props.currentSong);
    		if ("nextSongPreloaded" in $$props) nextSongPreloaded = $$props.nextSongPreloaded;
    		if ("player" in $$props) $$invalidate(1, player = $$props.player);
    		if ("drawWaveformDebounce" in $$props) drawWaveformDebounce = $$props.drawWaveformDebounce;
    		if ("playingInterval" in $$props) playingInterval = $$props.playingInterval;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$playbackIndex*/ 16) {
    			 {
    				resetProgress();
    				playSong();
    			}
    		}

    		if ($$self.$$.dirty & /*$isDoneDrawing*/ 32) {
    			 {
    				let canvasElement = document.querySelector("canvas");

    				if (canvasElement) {
    					canvasElement.style.opacity = $isDoneDrawing === true ? "1" : "0";
    				}
    			}
    		}
    	};

    	return [
    		currentSong,
    		player,
    		startInterval,
    		stopInterval,
    		$playbackIndex,
    		$isDoneDrawing,
    		play_handler,
    		pause_handler,
    		ended_handler
    	];
    }

    class Player extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Player",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/components/SongListItem.svelte generated by Svelte v3.31.0 */
    const file$a = "src/components/SongListItem.svelte";

    function create_fragment$a(ctx) {
    	let song_list_item;
    	let song_number0;
    	let t0;
    	let t1;
    	let song_number1;
    	let t2_value = /*song*/ ctx[0]["ID"] + "";
    	let t2;
    	let t3;
    	let song_title;
    	let t4_value = /*song*/ ctx[0]["Title"] + "";
    	let t4;
    	let t5;
    	let song_duration;
    	let t6_value = parseDuration(/*song*/ ctx[0]["Duration"]) + "";
    	let t6;
    	let song_list_item_id_value;
    	let song_list_item_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			song_list_item = element("song-list-item");
    			song_number0 = element("song-number");
    			t0 = text(/*index*/ ctx[1]);
    			t1 = space();
    			song_number1 = element("song-number");
    			t2 = text(t2_value);
    			t3 = space();
    			song_title = element("song-title");
    			t4 = text(t4_value);
    			t5 = space();
    			song_duration = element("song-duration");
    			t6 = text(t6_value);
    			set_custom_element_data(song_number0, "class", "svelte-14gcql6");
    			add_location(song_number0, file$a, 31, 1, 923);
    			set_custom_element_data(song_number1, "class", "svelte-14gcql6");
    			add_location(song_number1, file$a, 33, 1, 1012);
    			set_custom_element_data(song_title, "class", "svelte-14gcql6");
    			add_location(song_title, file$a, 34, 1, 1053);
    			set_custom_element_data(song_duration, "class", "svelte-14gcql6");
    			add_location(song_duration, file$a, 35, 1, 1095);
    			set_custom_element_data(song_list_item, "id", song_list_item_id_value = /*song*/ ctx[0]["ID"]);
    			set_custom_element_data(song_list_item, "index", /*index*/ ctx[1]);

    			set_custom_element_data(song_list_item, "class", song_list_item_class_value = "\n\t" + (/*$playbackIndex*/ ctx[2]["indexToPlay"] === /*index*/ ctx[1] && /*$selectedAlbum*/ ctx[3]["ID"] === /*$playback*/ ctx[4]?.["AlbumID"]
    			? "playing"
    			: "") + "\n\t" + (/*$selectedSongs*/ ctx[5].includes(/*song*/ ctx[0]["ID"])
    			? "selected"
    			: "") + " svelte-14gcql6");

    			add_location(song_list_item, file$a, 21, 0, 640);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, song_list_item, anchor);
    			append_dev(song_list_item, song_number0);
    			append_dev(song_number0, t0);
    			append_dev(song_list_item, t1);
    			append_dev(song_list_item, song_number1);
    			append_dev(song_number1, t2);
    			append_dev(song_list_item, t3);
    			append_dev(song_list_item, song_title);
    			append_dev(song_title, t4);
    			append_dev(song_list_item, t5);
    			append_dev(song_list_item, song_duration);
    			append_dev(song_duration, t6);

    			if (!mounted) {
    				dispose = listen_dev(song_list_item, "dblclick", /*dblclick_handler*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*index*/ 2) set_data_dev(t0, /*index*/ ctx[1]);
    			if (dirty & /*song*/ 1 && t2_value !== (t2_value = /*song*/ ctx[0]["ID"] + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*song*/ 1 && t4_value !== (t4_value = /*song*/ ctx[0]["Title"] + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*song*/ 1 && t6_value !== (t6_value = parseDuration(/*song*/ ctx[0]["Duration"]) + "")) set_data_dev(t6, t6_value);

    			if (dirty & /*song*/ 1 && song_list_item_id_value !== (song_list_item_id_value = /*song*/ ctx[0]["ID"])) {
    				set_custom_element_data(song_list_item, "id", song_list_item_id_value);
    			}

    			if (dirty & /*index*/ 2) {
    				set_custom_element_data(song_list_item, "index", /*index*/ ctx[1]);
    			}

    			if (dirty & /*$playbackIndex, index, $selectedAlbum, $playback, $selectedSongs, song*/ 63 && song_list_item_class_value !== (song_list_item_class_value = "\n\t" + (/*$playbackIndex*/ ctx[2]["indexToPlay"] === /*index*/ ctx[1] && /*$selectedAlbum*/ ctx[3]["ID"] === /*$playback*/ ctx[4]?.["AlbumID"]
    			? "playing"
    			: "") + "\n\t" + (/*$selectedSongs*/ ctx[5].includes(/*song*/ ctx[0]["ID"])
    			? "selected"
    			: "") + " svelte-14gcql6")) {
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
    		id: create_fragment$a.name,
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

    function instance$a($$self, $$props, $$invalidate) {
    	let $playbackIndex;
    	let $selectedAlbum;
    	let $playback;
    	let $selectedSongs;
    	validate_store(playbackIndex, "playbackIndex");
    	component_subscribe($$self, playbackIndex, $$value => $$invalidate(2, $playbackIndex = $$value));
    	validate_store(selectedAlbum, "selectedAlbum");
    	component_subscribe($$self, selectedAlbum, $$value => $$invalidate(3, $selectedAlbum = $$value));
    	validate_store(playback, "playback");
    	component_subscribe($$self, playback, $$value => $$invalidate(4, $playback = $$value));
    	validate_store(selectedSongs, "selectedSongs");
    	component_subscribe($$self, selectedSongs, $$value => $$invalidate(5, $selectedSongs = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SongListItem", slots, []);
    	
    	let { song } = $$props;
    	let { index } = $$props;
    	let { albumID } = $$props;

    	function songListItemDbLClickEventHandler() {
    		setNewPlayback(albumID, index, true);
    	}

    	const writable_props = ["song", "index", "albumID"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SongListItem> was created with unknown prop '${key}'`);
    	});

    	const dblclick_handler = () => songListItemDbLClickEventHandler();

    	$$self.$$set = $$props => {
    		if ("song" in $$props) $$invalidate(0, song = $$props.song);
    		if ("index" in $$props) $$invalidate(1, index = $$props.index);
    		if ("albumID" in $$props) $$invalidate(7, albumID = $$props.albumID);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		playback,
    		playbackIndex,
    		selectedAlbum,
    		setNewPlayback,
    		selectedSongs,
    		song,
    		index,
    		albumID,
    		parseDuration,
    		songListItemDbLClickEventHandler,
    		$playbackIndex,
    		$selectedAlbum,
    		$playback,
    		$selectedSongs
    	});

    	$$self.$inject_state = $$props => {
    		if ("song" in $$props) $$invalidate(0, song = $$props.song);
    		if ("index" in $$props) $$invalidate(1, index = $$props.index);
    		if ("albumID" in $$props) $$invalidate(7, albumID = $$props.albumID);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		song,
    		index,
    		$playbackIndex,
    		$selectedAlbum,
    		$playback,
    		$selectedSongs,
    		songListItemDbLClickEventHandler,
    		albumID,
    		dblclick_handler
    	];
    }

    class SongListItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { song: 0, index: 1, albumID: 7 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SongListItem",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*song*/ ctx[0] === undefined && !("song" in props)) {
    			console.warn("<SongListItem> was created without expected prop 'song'");
    		}

    		if (/*index*/ ctx[1] === undefined && !("index" in props)) {
    			console.warn("<SongListItem> was created without expected prop 'index'");
    		}

    		if (/*albumID*/ ctx[7] === undefined && !("albumID" in props)) {
    			console.warn("<SongListItem> was created without expected prop 'albumID'");
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

    	get albumID() {
    		throw new Error("<SongListItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set albumID(value) {
    		throw new Error("<SongListItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/includes/SongList.svelte generated by Svelte v3.31.0 */
    const file$b = "src/includes/SongList.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (38:1) {#if $selectedAlbum !== undefined}
    function create_if_block$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$selectedAlbum*/ ctx[0]["Songs"] !== undefined && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*$selectedAlbum*/ ctx[0]["Songs"] !== undefined) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$selectedAlbum*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(38:1) {#if $selectedAlbum !== undefined}",
    		ctx
    	});

    	return block;
    }

    // (39:2) {#if $selectedAlbum['Songs'] !== undefined}
    function create_if_block_1$1(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = /*$selectedAlbum*/ ctx[0]["Songs"];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*index*/ ctx[7];
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
    			if (dirty & /*$selectedAlbum*/ 1) {
    				const each_value = /*$selectedAlbum*/ ctx[0]["Songs"];
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
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(39:2) {#if $selectedAlbum['Songs'] !== undefined}",
    		ctx
    	});

    	return block;
    }

    // (40:3) {#each $selectedAlbum['Songs'] as song, index (index)}
    function create_each_block$2(key_1, ctx) {
    	let first;
    	let songlistitem;
    	let current;

    	songlistitem = new SongListItem({
    			props: {
    				albumID: /*$selectedAlbum*/ ctx[0]["ID"],
    				song: /*song*/ ctx[5],
    				index: /*index*/ ctx[7]
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
    			if (dirty & /*$selectedAlbum*/ 1) songlistitem_changes.albumID = /*$selectedAlbum*/ ctx[0]["ID"];
    			if (dirty & /*$selectedAlbum*/ 1) songlistitem_changes.song = /*song*/ ctx[5];
    			if (dirty & /*$selectedAlbum*/ 1) songlistitem_changes.index = /*index*/ ctx[7];
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
    		source: "(40:3) {#each $selectedAlbum['Songs'] as song, index (index)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let song_list_svlt;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*$selectedAlbum*/ ctx[0] !== undefined && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			song_list_svlt = element("song-list-svlt");
    			if (if_block) if_block.c();
    			set_custom_element_data(song_list_svlt, "class", "svelte-1pk1mov");
    			add_location(song_list_svlt, file$b, 36, 0, 1552);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, song_list_svlt, anchor);
    			if (if_block) if_block.m(song_list_svlt, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(song_list_svlt, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$selectedAlbum*/ ctx[0] !== undefined) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$selectedAlbum*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
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
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let $selectedSongs;
    	let $selectedAlbum;
    	validate_store(selectedSongs, "selectedSongs");
    	component_subscribe($$self, selectedSongs, $$value => $$invalidate(4, $selectedSongs = $$value));
    	validate_store(selectedAlbum, "selectedAlbum");
    	component_subscribe($$self, selectedAlbum, $$value => $$invalidate(0, $selectedAlbum = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SongList", slots, []);
    	let lastSelectedSong = 0;

    	function selectSongs(e) {
    		let { ctrlKey, metaKey, shiftKey } = e;

    		e["path"].forEach(element => {
    			if (element.tagName === "SONG-LIST-ITEM") {
    				let id = Number(element.getAttribute("id"));
    				let currentSelectedSong = Number(element.getAttribute("index"));

    				if (ctrlKey === false && metaKey === false && shiftKey === false) {
    					set_store_value(selectedSongs, $selectedSongs = [id], $selectedSongs);
    				}

    				if (shiftKey === false && (ctrlKey === true || metaKey === true)) {
    					if (!$selectedSongs.includes(id)) {
    						$selectedSongs.push(id);
    					} else {
    						$selectedSongs.splice($selectedSongs.indexOf(id), 1);
    					}
    				}

    				if (shiftKey === true && ctrlKey === false && metaKey === false) {
    					for (let i = currentSelectedSong; i !== lastSelectedSong; currentSelectedSong < lastSelectedSong ? i++ : i--) {
    						let currentID = $selectedAlbum["Songs"][i]["ID"];

    						if (!$selectedSongs.find(i => i === currentID)) {
    							$selectedSongs.push(currentID);
    						}
    					}
    				}

    				lastSelectedSong = currentSelectedSong;
    				selectedSongs.set($selectedSongs);
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
    		selectedSongs,
    		selectedAlbum,
    		lastSelectedSong,
    		selectSongs,
    		$selectedSongs,
    		$selectedAlbum
    	});

    	$$self.$inject_state = $$props => {
    		if ("lastSelectedSong" in $$props) lastSelectedSong = $$props.lastSelectedSong;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$selectedAlbum, selectSongs, click_handler];
    }

    class SongList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SongList",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/includes/Details.svelte generated by Svelte v3.31.0 */

    const { console: console_1 } = globals;
    const file$c = "src/includes/Details.svelte";

    function create_fragment$c(ctx) {
    	let details_svlt;

    	const block = {
    		c: function create() {
    			details_svlt = element("details-svlt");
    			set_custom_element_data(details_svlt, "class", "svelte-fxqmax");
    			add_location(details_svlt, file$c, 28, 0, 756);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, details_svlt, anchor);
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
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let $selectedSongs;
    	let $selectedAlbum;
    	validate_store(selectedSongs, "selectedSongs");
    	component_subscribe($$self, selectedSongs, $$value => $$invalidate(0, $selectedSongs = $$value));
    	validate_store(selectedAlbum, "selectedAlbum");
    	component_subscribe($$self, selectedAlbum, $$value => $$invalidate(2, $selectedAlbum = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Details", slots, []);
    	let previousSongList = undefined;

    	function checkSongs() {
    		if (!($selectedAlbum === null || $selectedAlbum === void 0
    		? void 0
    		: $selectedAlbum.Songs)) return;

    		let songs = [];

    		$selectedSongs.forEach(index => {
    			songs.push($selectedAlbum.Songs[index]);
    		});

    		if (songs.length === 0) {
    			songs = $selectedAlbum.Songs;
    		}

    		if (JSON.stringify(previousSongList) === JSON.stringify(songs)) {
    			return;
    		} else {
    			previousSongList = [...songs];
    		}

    		console.log(songs);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Details> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		selectedSongs,
    		selectedAlbum,
    		previousSongList,
    		checkSongs,
    		$selectedSongs,
    		$selectedAlbum
    	});

    	$$self.$inject_state = $$props => {
    		if ("previousSongList" in $$props) previousSongList = $$props.previousSongList;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$selectedSongs*/ 1) {
    			 {
    				console.log($selectedSongs);
    			} // $selectedSongs
    			// checkSongs()
    		}
    	};

    	return [$selectedSongs];
    }

    class Details extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Details",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    let lastAlbumPlayed = writable(undefined);
    let lastSongIndexPlayed = writable(undefined);

    /* src/controllers/MainController.svelte generated by Svelte v3.31.0 */

    const { Object: Object_1 } = globals;

    function create_fragment$d(ctx) {
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
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let $valuesToFilter;
    	let $lastSongIndexPlayed;
    	let $isValuesToFilterChanged;
    	let $dbVersion;
    	let $storeConfig;
    	let $valuesToGroup;
    	validate_store(valuesToFilter, "valuesToFilter");
    	component_subscribe($$self, valuesToFilter, $$value => $$invalidate(2, $valuesToFilter = $$value));
    	validate_store(lastSongIndexPlayed, "lastSongIndexPlayed");
    	component_subscribe($$self, lastSongIndexPlayed, $$value => $$invalidate(3, $lastSongIndexPlayed = $$value));
    	validate_store(isValuesToFilterChanged, "isValuesToFilterChanged");
    	component_subscribe($$self, isValuesToFilterChanged, $$value => $$invalidate(0, $isValuesToFilterChanged = $$value));
    	validate_store(dbVersion, "dbVersion");
    	component_subscribe($$self, dbVersion, $$value => $$invalidate(4, $dbVersion = $$value));
    	validate_store(storeConfig, "storeConfig");
    	component_subscribe($$self, storeConfig, $$value => $$invalidate(5, $storeConfig = $$value));
    	validate_store(valuesToGroup, "valuesToGroup");
    	component_subscribe($$self, valuesToGroup, $$value => $$invalidate(6, $valuesToGroup = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MainController", slots, []);

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
        When config file securely saved -> Change dbVersion number in Store.
        Order watches dbVersion number.
        When dbVersion changes -> Order re-fetches the songs.
    */
    	let previousFilter = [...$valuesToFilter];

    	let isFirstRun = true;

    	onMount(() => {
    		loadConfig();
    		set_store_value(lastSongIndexPlayed, $lastSongIndexPlayed = 0, $lastSongIndexPlayed);
    	});

    	function setPreviousFilters() {
    		previousFilter = [...$valuesToFilter];
    	}

    	function updateFilters() {
    		// console.log('Updating Filters')
    		// if the value changed save them to config file.
    		if (previousFilter.toString() !== $valuesToFilter.toString()) {
    			// console.log('Saving Filters')
    			previousFilter = [...$valuesToFilter];

    			saveConfig({ order: { filtering: $valuesToFilter } }).then(newConfig => {
    				if (newConfig) {
    					set_store_value(dbVersion, $dbVersion = Date.now(), $dbVersion);
    					set_store_value(storeConfig, $storeConfig = newConfig, $storeConfig);
    				}
    			});
    		}
    	}

    	// function saveConfig() {}
    	function loadConfig() {
    		var _a;

    		return __awaiter(this, void 0, void 0, function* () {
    			let config = yield getConfigIPC();
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MainController> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		__awaiter,
    		onMount,
    		getConfigIPC,
    		saveConfig,
    		valuesToFilter,
    		isValuesToFilterChanged,
    		valuesToGroup,
    		dbVersion,
    		storeConfig,
    		lastAlbumPlayed,
    		lastSongIndexPlayed,
    		previousFilter,
    		isFirstRun,
    		setPreviousFilters,
    		updateFilters,
    		loadConfig,
    		$valuesToFilter,
    		$lastSongIndexPlayed,
    		$isValuesToFilterChanged,
    		$dbVersion,
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

    class MainController extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MainController",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/controllers/ConfigController.svelte generated by Svelte v3.31.0 */

    function create_fragment$e(ctx) {
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
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ConfigController",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/controllers/PlayerController.svelte generated by Svelte v3.31.0 */

    function create_fragment$f(ctx) {
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
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let $selectedGroupByStore;
    	let $selectedGroupByValueStore;
    	let $albumListStore;
    	validate_store(selectedGroupByStore, "selectedGroupByStore");
    	component_subscribe($$self, selectedGroupByStore, $$value => $$invalidate(1, $selectedGroupByStore = $$value));
    	validate_store(selectedGroupByValueStore, "selectedGroupByValueStore");
    	component_subscribe($$self, selectedGroupByValueStore, $$value => $$invalidate(2, $selectedGroupByValueStore = $$value));
    	validate_store(albumListStore, "albumListStore");
    	component_subscribe($$self, albumListStore, $$value => $$invalidate(3, $albumListStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PlayerController", slots, []);
    	let firstGroupByAssignments = true;

    	function getAlbums(groupBy, groupByValue) {
    		getAlbumsIPC(groupBy, groupByValue).then(result => set_store_value(albumListStore, $albumListStore = result, $albumListStore));
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PlayerController> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		getAlbumsIPC,
    		albumListStore,
    		selectedGroupByStore,
    		selectedGroupByValueStore,
    		firstGroupByAssignments,
    		getAlbums,
    		$selectedGroupByStore,
    		$selectedGroupByValueStore,
    		$albumListStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("firstGroupByAssignments" in $$props) $$invalidate(0, firstGroupByAssignments = $$props.firstGroupByAssignments);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*firstGroupByAssignments, $selectedGroupByStore, $selectedGroupByValueStore*/ 7) {
    			 {
    				if (firstGroupByAssignments === true) {
    					$$invalidate(0, firstGroupByAssignments = false);
    				} else {
    					getAlbums($selectedGroupByStore, $selectedGroupByValueStore);
    				}
    			}
    		}
    	};

    	return [firstGroupByAssignments, $selectedGroupByStore, $selectedGroupByValueStore];
    }

    class PlayerController extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PlayerController",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src/includes/BackgroundArt.svelte generated by Svelte v3.31.0 */

    const file$d = "src/includes/BackgroundArt.svelte";

    function create_fragment$g(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = "./img/bg.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-ufzy90");
    			add_location(img, file$d, 0, 0, 0);
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
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props) {
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
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BackgroundArt",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src/includes/SongListBackground.svelte generated by Svelte v3.31.0 */
    const file$e = "src/includes/SongListBackground.svelte";

    function create_fragment$h(ctx) {
    	let song_list_background_svlt;

    	const block = {
    		c: function create() {
    			song_list_background_svlt = element("song-list-background-svlt");
    			set_custom_element_data(song_list_background_svlt, "class", "svelte-bwgf44");
    			add_location(song_list_background_svlt, file$e, 26, 0, 1110);
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
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let $selectedAlbum;
    	validate_store(selectedAlbum, "selectedAlbum");
    	component_subscribe($$self, selectedAlbum, $$value => $$invalidate(0, $selectedAlbum = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SongListBackground", slots, []);
    	let coverSrc = undefined;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SongListBackground> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		getCoverIPC,
    		selectedAlbum,
    		coverSrc,
    		$selectedAlbum
    	});

    	$$self.$inject_state = $$props => {
    		if ("coverSrc" in $$props) coverSrc = $$props.coverSrc;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$selectedAlbum*/ 1) {
    			 {
    				// console.log($selectedAlbum)
    				if ($selectedAlbum === null || $selectedAlbum === void 0
    				? void 0
    				: $selectedAlbum["RootDir"]) {
    					getCoverIPC($selectedAlbum["RootDir"]).then(response => {
    						if (response["fileType"] === "image") {
    							// coverSrc = `url(${response['filePath']})`
    							// console.log(coverSrc)
    							// document.documentElement.style.setProperty('--song-list-background-image', coverSrc)
    							let $el = document.querySelector("song-list-background-svlt");

    							if ($el) {
    								// console.log($el)
    								// console.log($el.style.backgroundImage)
    								$el.setAttribute("style", `background-image: url('${response["filePath"]}');`);
    							}
    						} // $el.backgroundImage = coverSrc
    						// console.log()
    					}); // console.log($el)
    				}
    			}
    		}
    	};

    	return [$selectedAlbum];
    }

    class SongListBackground extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SongListBackground",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.31.0 */

    const { console: console_1$1, document: document_1 } = globals;
    const file$f = "src/App.svelte";

    function create_fragment$i(ctx) {
    	let title_value;
    	let t0;
    	let controller;
    	let t1;
    	let playercontroller;
    	let t2;
    	let configcontroller;
    	let t3;
    	let main;
    	let navigation;
    	let t4;
    	let artgrid;
    	let t5;
    	let grouping;
    	let t6;
    	let player;
    	let t7;
    	let songlist;
    	let t8;
    	let details;
    	let t9;
    	let backgroundart;
    	let t10;
    	let songlistbackground;
    	let current;
    	document_1.title = title_value = /*$appTitle*/ ctx[0];
    	controller = new MainController({ $$inline: true });
    	playercontroller = new PlayerController({ $$inline: true });
    	configcontroller = new ConfigController({ $$inline: true });
    	navigation = new Navigation({ $$inline: true });
    	artgrid = new ArtGrid({ $$inline: true });
    	grouping = new Grouping({ $$inline: true });
    	player = new Player({ $$inline: true });
    	songlist = new SongList({ $$inline: true });
    	details = new Details({ $$inline: true });
    	backgroundart = new BackgroundArt({ $$inline: true });
    	songlistbackground = new SongListBackground({ $$inline: true });

    	const block = {
    		c: function create() {
    			t0 = space();
    			create_component(controller.$$.fragment);
    			t1 = space();
    			create_component(playercontroller.$$.fragment);
    			t2 = space();
    			create_component(configcontroller.$$.fragment);
    			t3 = space();
    			main = element("main");
    			create_component(navigation.$$.fragment);
    			t4 = space();
    			create_component(artgrid.$$.fragment);
    			t5 = space();
    			create_component(grouping.$$.fragment);
    			t6 = space();
    			create_component(player.$$.fragment);
    			t7 = space();
    			create_component(songlist.$$.fragment);
    			t8 = space();
    			create_component(details.$$.fragment);
    			t9 = space();
    			create_component(backgroundart.$$.fragment);
    			t10 = space();
    			create_component(songlistbackground.$$.fragment);
    			attr_dev(main, "class", "svelte-1i37lnr");
    			add_location(main, file$f, 51, 0, 1838);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			mount_component(controller, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(playercontroller, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(configcontroller, target, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(navigation, main, null);
    			append_dev(main, t4);
    			mount_component(artgrid, main, null);
    			append_dev(main, t5);
    			mount_component(grouping, main, null);
    			append_dev(main, t6);
    			mount_component(player, main, null);
    			append_dev(main, t7);
    			mount_component(songlist, main, null);
    			append_dev(main, t8);
    			mount_component(details, main, null);
    			append_dev(main, t9);
    			mount_component(backgroundart, main, null);
    			append_dev(main, t10);
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
    			transition_in(controller.$$.fragment, local);
    			transition_in(playercontroller.$$.fragment, local);
    			transition_in(configcontroller.$$.fragment, local);
    			transition_in(navigation.$$.fragment, local);
    			transition_in(artgrid.$$.fragment, local);
    			transition_in(grouping.$$.fragment, local);
    			transition_in(player.$$.fragment, local);
    			transition_in(songlist.$$.fragment, local);
    			transition_in(details.$$.fragment, local);
    			transition_in(backgroundart.$$.fragment, local);
    			transition_in(songlistbackground.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(controller.$$.fragment, local);
    			transition_out(playercontroller.$$.fragment, local);
    			transition_out(configcontroller.$$.fragment, local);
    			transition_out(navigation.$$.fragment, local);
    			transition_out(artgrid.$$.fragment, local);
    			transition_out(grouping.$$.fragment, local);
    			transition_out(player.$$.fragment, local);
    			transition_out(songlist.$$.fragment, local);
    			transition_out(details.$$.fragment, local);
    			transition_out(backgroundart.$$.fragment, local);
    			transition_out(songlistbackground.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			destroy_component(controller, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(playercontroller, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(configcontroller, detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(main);
    			destroy_component(navigation);
    			destroy_component(artgrid);
    			destroy_component(grouping);
    			destroy_component(player);
    			destroy_component(songlist);
    			destroy_component(details);
    			destroy_component(backgroundart);
    			destroy_component(songlistbackground);
    		}
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Navigation,
    		ArtGrid,
    		Grouping,
    		Player,
    		SongList,
    		Details,
    		Controller: MainController,
    		ConfigController,
    		PlayerController,
    		BackgroundArt,
    		SongListBackground,
    		appTitle,
    		selectedSongs,
    		onMount,
    		getChangesProgressIPC,
    		syncDbVersionIPC,
    		getNewDbChangesProgress,
    		$appTitle
    	});

    	return [$appTitle];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$i.name
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
