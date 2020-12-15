
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
    function children(element) {
        return Array.from(element.childNodes);
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

    let songIndex = writable([]);
    let versioning = writable(Date.now());
    // 'Genre', 'AlbumArtist', 'Album'
    let valuesToGroup = writable([]);
    // Value choosen by the user to filter out the specified tag from the song index.
    let valuesToFilter = writable([]);
    let isValuesToFilterChanged = writable(false);
    let storeConfig = writable(undefined);

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
    			set_custom_element_data(navigation_svlt, "class", "svelte-se2ouc");
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

    /* src/includes/ArtGrid.svelte generated by Svelte v3.31.0 */

    const file$1 = "src/includes/ArtGrid.svelte";

    function create_fragment$1(ctx) {
    	let art_grid_svlt;
    	let h1;

    	const block = {
    		c: function create() {
    			art_grid_svlt = element("art-grid-svlt");
    			h1 = element("h1");
    			h1.textContent = "Art Grid";
    			add_location(h1, file$1, 1, 2, 18);
    			set_custom_element_data(art_grid_svlt, "class", "svelte-z3yo5k");
    			add_location(art_grid_svlt, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, art_grid_svlt, anchor);
    			append_dev(art_grid_svlt, h1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(art_grid_svlt);
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

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ArtGrid", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ArtGrid> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class ArtGrid extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ArtGrid",
    			options,
    			id: create_fragment$1.name
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
                console.log(result);
                // When the results arrive, recursive call to wait for the eventual new filtering.
                resolve(result);
                getAlbums();
            });
        });
    }

    /* src/components/Order.svelte generated by Svelte v3.31.0 */

    const { console: console_1 } = globals;

    const file$2 = "src/components/Order.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	child_ctx[3] = i;
    	return child_ctx;
    }

    // (59:0) {#if orderedSongs}
    function create_if_block(ctx) {
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
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
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
    			attr_dev(input, "class", "svelte-17pa8tn");
    			/*$$binding_groups*/ ctx[8][0].push(input);
    			add_location(input, file$2, 61, 3, 2107);
    			attr_dev(label, "for", label_for_value = "all" + /*group*/ ctx[0]);
    			attr_dev(label, "class", "svelte-17pa8tn");
    			add_location(label, file$2, 62, 3, 2185);
    			attr_dev(item, "title", item_title_value = "All " + /*group*/ ctx[0]);
    			add_location(item, file$2, 60, 2, 2077);
    			attr_dev(order, "class", "svelte-17pa8tn");
    			add_location(order, file$2, 59, 1, 2067);
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
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, order, destroy_block, create_each_block, null, get_each_context);
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
    		id: create_if_block.name,
    		type: "if",
    		source: "(59:0) {#if orderedSongs}",
    		ctx
    	});

    	return block;
    }

    // (65:2) {#each orderedSongs as item, index (item['id'])}
    function create_each_block(key_1, ctx) {
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
    			attr_dev(input, "class", "svelte-17pa8tn");
    			/*$$binding_groups*/ ctx[8][0].push(input);
    			add_location(input, file$2, 66, 4, 2348);
    			attr_dev(label, "for", label_for_value = /*item*/ ctx[17]["id"]);
    			attr_dev(label, "class", "svelte-17pa8tn");
    			add_location(label, file$2, 67, 4, 2436);
    			attr_dev(item, "title", item_title_value = /*item*/ ctx[17]["value"]);
    			add_location(item, file$2, 65, 3, 2315);
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
    		id: create_each_block.name,
    		type: "each",
    		source: "(65:2) {#each orderedSongs as item, index (item['id'])}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let if_block_anchor;
    	let if_block = /*orderedSongs*/ ctx[2] && create_if_block(ctx);

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
    					if_block = create_if_block(ctx);
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
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { index: 3, group: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Order",
    			options,
    			id: create_fragment$2.name
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
    const file$3 = "src/includes/Ordering.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	child_ctx[3] = i;
    	return child_ctx;
    }

    // (9:1) {#each $valuesToGroup as group, index (index)}
    function create_each_block$1(key_1, ctx) {
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
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(9:1) {#each $valuesToGroup as group, index (index)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let grouping_svlt;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*$valuesToGroup*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*index*/ ctx[3];
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			grouping_svlt = element("grouping-svlt");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			set_custom_element_data(grouping_svlt, "class", "svelte-ttlru6");
    			add_location(grouping_svlt, file$3, 7, 0, 124);
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
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, grouping_svlt, outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Ordering",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/includes/Player.svelte generated by Svelte v3.31.0 */

    const file$4 = "src/includes/Player.svelte";

    function create_fragment$4(ctx) {
    	let player_svlt;
    	let h1;

    	const block = {
    		c: function create() {
    			player_svlt = element("player-svlt");
    			h1 = element("h1");
    			h1.textContent = "Player";
    			add_location(h1, file$4, 1, 1, 15);
    			set_custom_element_data(player_svlt, "class", "svelte-5wqdl9");
    			add_location(player_svlt, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, player_svlt, anchor);
    			append_dev(player_svlt, h1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(player_svlt);
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

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Player", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Player> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Player extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Player",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/includes/SongList.svelte generated by Svelte v3.31.0 */

    const file$5 = "src/includes/SongList.svelte";

    function create_fragment$5(ctx) {
    	let song_list_svlt;
    	let h1;

    	const block = {
    		c: function create() {
    			song_list_svlt = element("song-list-svlt");
    			h1 = element("h1");
    			h1.textContent = "Song List";
    			add_location(h1, file$5, 1, 2, 19);
    			set_custom_element_data(song_list_svlt, "class", "svelte-1f78hff");
    			add_location(song_list_svlt, file$5, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, song_list_svlt, anchor);
    			append_dev(song_list_svlt, h1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(song_list_svlt);
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

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SongList", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SongList> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class SongList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SongList",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/includes/Details.svelte generated by Svelte v3.31.0 */

    const file$6 = "src/includes/Details.svelte";

    function create_fragment$6(ctx) {
    	let details_svlt;
    	let h1;

    	const block = {
    		c: function create() {
    			details_svlt = element("details-svlt");
    			h1 = element("h1");
    			h1.textContent = "Details";
    			add_location(h1, file$6, 1, 2, 17);
    			set_custom_element_data(details_svlt, "class", "svelte-aofg9s");
    			add_location(details_svlt, file$6, 0, 0, 0);
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props) {
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
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Details",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/controller/Controller.svelte generated by Svelte v3.31.0 */

    const { Object: Object_1, console: console_1$1 } = globals;

    function create_fragment$7(ctx) {
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
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Controller> was created with unknown prop '${key}'`);
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
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Controller",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.31.0 */
    const file$7 = "src/App.svelte";

    function create_fragment$8(ctx) {
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
    	let current;
    	controller = new Controller({ $$inline: true });
    	navigation = new Navigation({ $$inline: true });
    	artgrid = new ArtGrid({ $$inline: true });
    	grouping = new Ordering({ $$inline: true });
    	player = new Player({ $$inline: true });
    	songlist = new SongList({ $$inline: true });
    	details = new Details({ $$inline: true });

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
    			attr_dev(main, "class", "svelte-1f9zqy5");
    			add_location(main, file$7, 19, 0, 693);
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
    	validate_slots("App", slots, []);

    	onMount(() => {
    		// Calls the IPC once to wait for the filtering to be done.
    		getAlbums();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		songIndex,
    		onMount,
    		Navigation,
    		ArtGrid,
    		Grouping: Ordering,
    		Player,
    		SongList,
    		Details,
    		Controller,
    		getAlbums
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$8.name
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
