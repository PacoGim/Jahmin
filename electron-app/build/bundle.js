
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
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

    // Track which nodes are claimed during hydration. Unclaimed nodes can then be removed from the DOM
    // at the end of hydration without touching the remaining nodes.
    let is_hydrating = false;
    function start_hydrating() {
        is_hydrating = true;
    }
    function end_hydrating() {
        is_hydrating = false;
    }
    function upper_bound(low, high, key, value) {
        // Return first index of value larger than input value in the range [low, high)
        while (low < high) {
            const mid = low + ((high - low) >> 1);
            if (key(mid) <= value) {
                low = mid + 1;
            }
            else {
                high = mid;
            }
        }
        return low;
    }
    function init_hydrate(target) {
        if (target.hydrate_init)
            return;
        target.hydrate_init = true;
        // We know that all children have claim_order values since the unclaimed have been detached
        const children = target.childNodes;
        /*
        * Reorder claimed children optimally.
        * We can reorder claimed children optimally by finding the longest subsequence of
        * nodes that are already claimed in order and only moving the rest. The longest
        * subsequence subsequence of nodes that are claimed in order can be found by
        * computing the longest increasing subsequence of .claim_order values.
        *
        * This algorithm is optimal in generating the least amount of reorder operations
        * possible.
        *
        * Proof:
        * We know that, given a set of reordering operations, the nodes that do not move
        * always form an increasing subsequence, since they do not move among each other
        * meaning that they must be already ordered among each other. Thus, the maximal
        * set of nodes that do not move form a longest increasing subsequence.
        */
        // Compute longest increasing subsequence
        // m: subsequence length j => index k of smallest value that ends an increasing subsequence of length j
        const m = new Int32Array(children.length + 1);
        // Predecessor indices + 1
        const p = new Int32Array(children.length);
        m[0] = -1;
        let longest = 0;
        for (let i = 0; i < children.length; i++) {
            const current = children[i].claim_order;
            // Find the largest subsequence length such that it ends in a value less than our current value
            // upper_bound returns first greater value, so we subtract one
            const seqLen = upper_bound(1, longest + 1, idx => children[m[idx]].claim_order, current) - 1;
            p[i] = m[seqLen] + 1;
            const newLen = seqLen + 1;
            // We can guarantee that current is the smallest value. Otherwise, we would have generated a longer sequence.
            m[newLen] = i;
            longest = Math.max(newLen, longest);
        }
        // The longest increasing subsequence of nodes (initially reversed)
        const lis = [];
        // The rest of the nodes, nodes that will be moved
        const toMove = [];
        let last = children.length - 1;
        for (let cur = m[longest] + 1; cur != 0; cur = p[cur - 1]) {
            lis.push(children[cur - 1]);
            for (; last >= cur; last--) {
                toMove.push(children[last]);
            }
            last--;
        }
        for (; last >= 0; last--) {
            toMove.push(children[last]);
        }
        lis.reverse();
        // We sort the nodes being moved to guarantee that their insertion order matches the claim order
        toMove.sort((a, b) => a.claim_order - b.claim_order);
        // Finally, we move the nodes
        for (let i = 0, j = 0; i < toMove.length; i++) {
            while (j < lis.length && toMove[i].claim_order >= lis[j].claim_order) {
                j++;
            }
            const anchor = j < lis.length ? lis[j] : null;
            target.insertBefore(toMove[i], anchor);
        }
    }
    function append(target, node) {
        if (is_hydrating) {
            init_hydrate(target);
            if ((target.actual_end_child === undefined) || ((target.actual_end_child !== null) && (target.actual_end_child.parentElement !== target))) {
                target.actual_end_child = target.firstChild;
            }
            if (node !== target.actual_end_child) {
                target.insertBefore(node, target.actual_end_child);
            }
            else {
                target.actual_end_child = node.nextSibling;
            }
        }
        else if (node.parentNode !== target) {
            target.appendChild(node);
        }
    }
    function insert(target, node, anchor) {
        if (is_hydrating && !anchor) {
            append(target, node);
        }
        else if (node.parentNode !== target || (anchor && node.nextSibling !== anchor)) {
            target.insertBefore(node, anchor || null);
        }
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
            node[prop] = typeof node[prop] === 'boolean' && value === '' ? true : value;
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
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
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
        }
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
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
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
                start_hydrating();
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
            mount_component(component, options.target, options.anchor, options.customElement);
            end_hydrating();
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.3' }, detail)));
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

    /* src/includes/Navigation.svelte generated by Svelte v3.38.3 */

    const file$j = "src/includes/Navigation.svelte";

    function create_fragment$l(ctx) {
    	let navigation_svlt;
    	let h1;

    	const block = {
    		c: function create() {
    			navigation_svlt = element("navigation-svlt");
    			h1 = element("h1");
    			h1.textContent = "N";
    			add_location(h1, file$j, 1, 1, 19);
    			set_custom_element_data(navigation_svlt, "class", "svelte-1yehk8b");
    			add_location(navigation_svlt, file$j, 0, 0, 0);
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
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props) {
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
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navigation",
    			options,
    			id: create_fragment$l.name
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
    // Id of the current album playing.
    let albumPlayingIdStore = writable(undefined);
    let songPlayingIdStore = writable(undefined);
    // Allows to share with the rest of the app whether the player is playing or not.
    let isPlaying = writable(false);
    let selectedAlbumId = writable(undefined);
    let selectedSongsStore = writable([]);
    let albumCoverArtMapStore = writable(new Map());
    let appTitle = writable('Jahmin');
    let dbVersion = writable(0);
    let updateSongProgress = writable(-1);
    let elementMap = writable(undefined);

    const { ipcRenderer } = require('electron');
    let isGetTagEditProgressRunning = false;
    ipcRenderer.on('new-cover', (event, data) => {
        if (data.success === true) {
            let tempAlbumCoverArtMap = undefined;
            albumCoverArtMapStore.subscribe((albumCoverArtMap) => {
                albumCoverArtMap.set(data.id, {
                    version: Date.now(),
                    filePath: data.filePath,
                    fileType: data.fileType
                });
                tempAlbumCoverArtMap = albumCoverArtMap;
            })();
            if (tempAlbumCoverArtMap) {
                albumCoverArtMapStore.set(tempAlbumCoverArtMap);
            }
        }
    });
    function getTagEditProgressIPC() {
        return new Promise((resolve, reject) => {
            if (!isGetTagEditProgressRunning) {
                isGetTagEditProgressRunning = true;
                ipcRenderer.invoke('get-tag-edit-progress').then((result) => {
                    isGetTagEditProgressRunning = false;
                    let percentage = (100 / (result === null || result === void 0 ? void 0 : result.maxLength)) * (result === null || result === void 0 ? void 0 : result.currentLength);
                    console.log(percentage);
                    if (percentage !== 0) {
                        setTimeout(() => {
                            getTagEditProgressIPC();
                        }, 2000);
                    }
                    resolve(result);
                });
            }
        });
    }
    function getTasksToSyncIPC() {
        return new Promise((resolve, reject) => {
            ipcRenderer.invoke('sync-tasks').then((result) => {
                resolve(result);
            });
        });
    }
    function streamAudio(path) {
        return new Promise((resolve, reject) => {
            ipcRenderer.invoke('stream-audio', path).then((result) => {
                // console.log(result)
                // resolve(result)
            });
        });
    }
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
    function editTagsIPC(songList, newTags) {
        return new Promise((resolve, reject) => {
            ipcRenderer.invoke('edit-tags', songList, newTags).then((response) => {
                resolve(response);
            });
        });
    }
    function savePeaksIPC(sourceFile, peaks) {
        return new Promise((resolve, reject) => {
            ipcRenderer.invoke('save-peaks', sourceFile, peaks).then((result) => {
                resolve(result);
            });
        });
    }
    function getPeaksIPC(sourceFile) {
        return new Promise((resolve, reject) => {
            ipcRenderer.invoke('get-peaks', sourceFile).then((result) => {
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
    function getAlbumIPC(albumId) {
        return new Promise((resolve, reject) => {
            ipcRenderer.invoke('get-album', albumId).then((result) => {
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
            setTimeout(() => {
                syncDbVersionIPC();
            }, 2000);
        });
    }

    async function getAlbumColors(albumId) {
        return new Promise((resolve, reject) => {
            getAlbumColorsIPC(albumId).then((color) => {
                if (color === undefined) {
                    color = {
                        hue: 0,
                        lightnessBase: 30,
                        lightnessHigh: 45,
                        lightnessLow: 15,
                        saturation: 0
                    };
                }
                resolve(color);
                document.documentElement.style.setProperty('--low-color', `hsl(${color.hue},${color.saturation}%,${color.lightnessLow}%)`);
                document.documentElement.style.setProperty('--base-color', `hsl(${color.hue},${color.saturation}%,${color.lightnessBase}%)`);
                document.documentElement.style.setProperty('--high-color', `hsl(${color.hue},${color.saturation}%,${color.lightnessHigh}%)`);
            });
        });
    }

    async function setNewPlayback(albumId, playbackSongs, songIdToPlay, playNow) {
        let indexToPlay = playbackSongs.findIndex((song) => song.ID === songIdToPlay);
        if (indexToPlay === -1) {
            indexToPlay = 0;
        }
        //TODO Sorting
        albumPlayingIdStore.set(albumId);
        playbackStore.set(playbackSongs);
        playbackCursor.set([indexToPlay, playNow]);
        getAlbumColors(albumId);
    }

    function hash$1(str) {
      var hash = 5381,
          i    = str.length;

      while(i) {
        hash = (hash * 33) ^ str.charCodeAt(--i);
      }

      /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
       * integers. Since we want the results to be always positive, convert the
       * signed int to an unsigned by doing an unsigned bitshift. */
      return hash >>> 0;
    }

    var stringHash = hash$1;

    function hash(stringToHash, format = 'text') {
        if (format === 'text') {
            return stringHash(stringToHash).toString(36);
        }
        else {
            return stringHash(stringToHash);
        }
    }

    function addIntersectionObserver(rootDir) {
        return new Promise((resolve, reject) => {
            let coverArtObserver;
            let albumId = hash(rootDir, 'text');
            coverArtObserver = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting === true) {
                    let albumCoverArtMap;
                    albumCoverArtMapStore.subscribe((_) => (albumCoverArtMap = _))();
                    const ALBUM_COVER_ART_DATA = albumCoverArtMap.get(albumId);
                    // "Closes" the Cover Art Observer to avoid unnecessary checks.
                    coverArtObserver.disconnect();
                    if (ALBUM_COVER_ART_DATA) {
                        resolve({
                            status: 'cover-found',
                            data: ALBUM_COVER_ART_DATA
                        });
                    }
                    else {
                        resolve({
                            status: 'cover-not-found'
                        });
                    }
                }
            }, { root: document.querySelector(`art-grid-svlt`), threshold: 0, rootMargin: '0px 0px 50% 0px' });
            coverArtObserver.observe(document.querySelector(`art-grid-svlt > #${CSS.escape(String(albumId))}`));
        });
    }

    /* src/components/CoverArt.svelte generated by Svelte v3.38.3 */
    const file$i = "src/components/CoverArt.svelte";

    // (67:1) {#if coverType === undefined}
    function create_if_block_3(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = "./img/audio.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "loader svelte-1q9dyby");
    			attr_dev(img, "alt", "");
    			add_location(img, file$i, 67, 2, 2157);
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
    		source: "(67:1) {#if coverType === undefined}",
    		ctx
    	});

    	return block;
    }

    // (70:1) {#if coverType === 'not found'}
    function create_if_block_2$1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = "./img/compact-disc.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "notFound svelte-1q9dyby");
    			attr_dev(img, "alt", "");
    			add_location(img, file$i, 69, 32, 2248);
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
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(70:1) {#if coverType === 'not found'}",
    		ctx
    	});

    	return block;
    }

    // (71:1) {#if coverType === 'image'}
    function create_if_block_1$2(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = /*coverSrc*/ ctx[1])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-1q9dyby");
    			add_location(img, file$i, 70, 28, 2342);
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
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(71:1) {#if coverType === 'image'}",
    		ctx
    	});

    	return block;
    }

    // (72:1) {#if coverType === 'video'}
    function create_if_block$3(ctx) {
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
    			add_location(track, file$i, 73, 3, 2433);
    			if (source.src !== (source_src_value = /*coverSrc*/ ctx[1])) attr_dev(source, "src", source_src_value);
    			add_location(source, file$i, 74, 3, 2462);
    			video.autoplay = true;
    			video.loop = true;
    			attr_dev(video, "class", "svelte-1q9dyby");
    			add_location(video, file$i, 72, 2, 2408);
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
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(72:1) {#if coverType === 'video'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let cover_art;
    	let t0;
    	let t1;
    	let t2;
    	let if_block0 = /*coverType*/ ctx[0] === undefined && create_if_block_3(ctx);
    	let if_block1 = /*coverType*/ ctx[0] === "not found" && create_if_block_2$1(ctx);
    	let if_block2 = /*coverType*/ ctx[0] === "image" && create_if_block_1$2(ctx);
    	let if_block3 = /*coverType*/ ctx[0] === "video" && create_if_block$3(ctx);

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
    			add_location(cover_art, file$i, 65, 0, 2112);
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
    					if_block1 = create_if_block_2$1(ctx);
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
    					if_block2 = create_if_block_1$2(ctx);
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
    					if_block3 = create_if_block$3(ctx);
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
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let $albumCoverArtMapStore;
    	validate_store(albumCoverArtMapStore, "albumCoverArtMapStore");
    	component_subscribe($$self, albumCoverArtMapStore, $$value => $$invalidate(5, $albumCoverArtMapStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CoverArt", slots, []);
    	
    	let coverType = undefined;
    	let coverSrc = undefined;
    	let { rootDir } = $$props;
    	let { observe = false } = $$props;
    	let albumCoverArtVersion = undefined;

    	onMount(() => {
    		if (observe) {
    			addIntersectionObserver(rootDir).then(result => {
    				if (result.status === "cover-not-found") {
    					getAlbumCover();
    				} else if (result.status === "cover-found") {
    					setCoverArtSource(result.data);
    				}
    			});
    		} // addIntersectionObserver()
    	});

    	function forceCoverSource(rootDir) {
    		let albumId = hash(rootDir, "text");
    		const ALBUM_COVER_ART_DATA = $albumCoverArtMapStore.get(albumId);
    		setCoverArtSource(ALBUM_COVER_ART_DATA);
    	}

    	function setCoverArtSource(coverData) {
    		if (coverData) {
    			$$invalidate(4, albumCoverArtVersion = coverData.version);
    			$$invalidate(0, coverType = coverData.fileType);
    			$$invalidate(1, coverSrc = `${coverData.filePath}#${coverData.version}`);
    		}
    	}

    	function getAlbumCover() {
    		getCoverIPC(rootDir).then(response => {
    			let albumId = hash(rootDir, "text");

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

    	const writable_props = ["rootDir", "observe"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CoverArt> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("rootDir" in $$props) $$invalidate(2, rootDir = $$props.rootDir);
    		if ("observe" in $$props) $$invalidate(3, observe = $$props.observe);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		hash,
    		addIntersectionObserver,
    		getCoverIPC,
    		albumCoverArtMapStore,
    		coverType,
    		coverSrc,
    		rootDir,
    		observe,
    		albumCoverArtVersion,
    		forceCoverSource,
    		setCoverArtSource,
    		getAlbumCover,
    		$albumCoverArtMapStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("coverType" in $$props) $$invalidate(0, coverType = $$props.coverType);
    		if ("coverSrc" in $$props) $$invalidate(1, coverSrc = $$props.coverSrc);
    		if ("rootDir" in $$props) $$invalidate(2, rootDir = $$props.rootDir);
    		if ("observe" in $$props) $$invalidate(3, observe = $$props.observe);
    		if ("albumCoverArtVersion" in $$props) $$invalidate(4, albumCoverArtVersion = $$props.albumCoverArtVersion);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*rootDir*/ 4) {
    			// let coverArtObserver: IntersectionObserver
    			{
    				forceCoverSource(rootDir);
    			}
    		}

    		if ($$self.$$.dirty & /*rootDir, $albumCoverArtMapStore, albumCoverArtVersion*/ 52) {
    			{
    				let albumId = hash(rootDir, "text");
    				const ALBUM_COVER_ART_DATA = $albumCoverArtMapStore.get(albumId);

    				if ((ALBUM_COVER_ART_DATA === null || ALBUM_COVER_ART_DATA === void 0
    				? void 0
    				: ALBUM_COVER_ART_DATA.version) !== albumCoverArtVersion) {
    					setCoverArtSource(ALBUM_COVER_ART_DATA);
    				}
    			}
    		}
    	};

    	return [
    		coverType,
    		coverSrc,
    		rootDir,
    		observe,
    		albumCoverArtVersion,
    		$albumCoverArtMapStore
    	];
    }

    class CoverArt extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { rootDir: 2, observe: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CoverArt",
    			options,
    			id: create_fragment$k.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*rootDir*/ ctx[2] === undefined && !("rootDir" in props)) {
    			console.warn("<CoverArt> was created without expected prop 'rootDir'");
    		}
    	}

    	get rootDir() {
    		throw new Error("<CoverArt>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rootDir(value) {
    		throw new Error("<CoverArt>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get observe() {
    		throw new Error("<CoverArt>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set observe(value) {
    		throw new Error("<CoverArt>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Album.svelte generated by Svelte v3.38.3 */
    const file$h = "src/components/Album.svelte";

    // (58:2) {:else}
    function create_else_block(ctx) {
    	let album_artist;

    	const block = {
    		c: function create() {
    			album_artist = element("album-artist");
    			set_custom_element_data(album_artist, "class", "svelte-kmxgr9");
    			add_location(album_artist, file$h, 58, 3, 1892);
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
    			set_custom_element_data(album_artist, "class", "svelte-kmxgr9");
    			add_location(album_artist, file$h, 56, 3, 1820);
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
    function create_if_block$2(ctx) {
    	let album_artist;
    	let t_value = /*album*/ ctx[0]["AlbumArtist"] + "";
    	let t;

    	const block = {
    		c: function create() {
    			album_artist = element("album-artist");
    			t = text(t_value);
    			set_custom_element_data(album_artist, "class", "svelte-kmxgr9");
    			add_location(album_artist, file$h, 54, 3, 1710);
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
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(54:2) {#if album['AlbumArtist'] !== undefined}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
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
    				observe: true
    			},
    			$$inline: true
    		});

    	function select_block_type(ctx, dirty) {
    		if (/*album*/ ctx[0]["AlbumArtist"] !== undefined) return create_if_block$2;
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
    			set_custom_element_data(overlay_gradient, "class", "svelte-kmxgr9");
    			add_location(overlay_gradient, file$h, 48, 1, 1581);
    			set_custom_element_data(album_name, "class", "svelte-kmxgr9");
    			add_location(album_name, file$h, 51, 2, 1622);
    			set_custom_element_data(album_details, "class", "svelte-kmxgr9");
    			add_location(album_details, file$h, 50, 1, 1604);
    			attr_dev(album_1, "id", album_1_id_value = /*album*/ ctx[0].ID);

    			attr_dev(album_1, "class", album_1_class_value = "" + (null_to_empty(/*$selectedAlbumId*/ ctx[1] === /*album*/ ctx[0]?.ID
    			? "selected"
    			: "") + " svelte-kmxgr9"));

    			add_location(album_1, file$h, 45, 0, 1447);
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
    			: "") + " svelte-kmxgr9"))) {
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
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
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
    		let lastPlayedAlbumId = localStorage.getItem("LastPlayedAlbumId");

    		if (album.ID === lastPlayedAlbumId) {
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
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, { album: 0, index: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Album",
    			options,
    			id: create_fragment$j.name
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

    /* src/includes/ArtGrid.svelte generated by Svelte v3.38.3 */

    const file$g = "src/includes/ArtGrid.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (38:1) {#each $albumListStore as album, index (album.ID)}
    function create_each_block$2(key_1, ctx) {
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
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
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
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(38:1) {#each $albumListStore as album, index (album.ID)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let art_grid_svlt;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*$albumListStore*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*album*/ ctx[2].ID;
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			art_grid_svlt = element("art-grid-svlt");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			set_custom_element_data(art_grid_svlt, "class", "svelte-13lfcks");
    			add_location(art_grid_svlt, file$g, 36, 0, 1375);
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
    				each_value = /*$albumListStore*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, art_grid_svlt, outro_and_destroy_block, create_each_block$2, null, get_each_context$2);
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
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ArtGrid",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* src/includes/Grouping.svelte generated by Svelte v3.38.3 */

    const file$f = "src/includes/Grouping.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    // (77:2) {#each groups as group (group.id)}
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
    			add_location(input, file$f, 78, 4, 2513);
    			attr_dev(label, "for", label_for_value = /*group*/ ctx[15].id);
    			attr_dev(label, "class", "svelte-z201rr");
    			add_location(label, file$f, 79, 4, 2607);
    			attr_dev(group, "name", group_name_value = /*group*/ ctx[15].name);
    			attr_dev(group, "class", "svelte-z201rr");
    			add_location(group, file$f, 77, 3, 2483);
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
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

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
    		source: "(77:2) {#each groups as group (group.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
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
    			add_location(option0, file$f, 65, 2, 2077);
    			option1.__value = "none";
    			option1.value = option1.__value;
    			add_location(option1, file$f, 66, 2, 2139);
    			option2.__value = "Genre";
    			option2.value = option2.__value;
    			add_location(option2, file$f, 67, 2, 2176);
    			option3.__value = "AlbumArtist";
    			option3.value = option3.__value;
    			add_location(option3, file$f, 68, 2, 2215);
    			option4.__value = "Album";
    			option4.value = option4.__value;
    			add_location(option4, file$f, 69, 2, 2267);
    			option5.__value = "Composer";
    			option5.value = option5.__value;
    			add_location(option5, file$f, 70, 2, 2306);
    			attr_dev(select, "class", "svelte-z201rr");
    			if (/*selectedGroupBy*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[7].call(select));
    			add_location(select, file$f, 64, 1, 2037);
    			set_custom_element_data(total_groups, "class", "svelte-z201rr");
    			add_location(total_groups, file$f, 73, 1, 2362);
    			attr_dev(groups_1, "class", "svelte-z201rr");
    			add_location(groups_1, file$f, 75, 1, 2434);
    			set_custom_element_data(grouping_svlt, "class", "svelte-z201rr");
    			add_location(grouping_svlt, file$f, 63, 0, 2020);
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
    				each_value = /*groups*/ ctx[2];
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
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
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
    					}
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
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Grouping",
    			options,
    			id: create_fragment$h.name
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

    /* src/components/NextButton.svelte generated by Svelte v3.38.3 */
    const file$e = "src/components/NextButton.svelte";

    function create_fragment$g(ctx) {
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
    			add_location(polygon, file$e, 16, 1, 305);
    			attr_dev(rect, "x", "90");
    			attr_dev(rect, "y", "5");
    			attr_dev(rect, "width", "10");
    			attr_dev(rect, "height", "87");
    			add_location(rect, file$e, 17, 1, 352);
    			attr_dev(svg, "class", "player-button");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "id", "Layer_1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "x", "0px");
    			attr_dev(svg, "y", "0px");
    			attr_dev(svg, "viewBox", "0 0 100 100");
    			attr_dev(svg, "xml:space", "preserve");
    			add_location(svg, file$e, 4, 0, 73);
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
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NextButton",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src/components/PreviousButton.svelte generated by Svelte v3.38.3 */
    const file$d = "src/components/PreviousButton.svelte";

    function create_fragment$f(ctx) {
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
    			add_location(polygon, file$d, 29, 1, 784);
    			attr_dev(rect, "x", "0");
    			attr_dev(rect, "y", "4.75");
    			attr_dev(rect, "transform", "matrix(-1 -1.224647e-16 1.224647e-16 -1 10 96.5001)");
    			attr_dev(rect, "width", "10");
    			attr_dev(rect, "height", "87");
    			add_location(rect, file$d, 30, 1, 828);
    			attr_dev(svg, "class", "player-button");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "id", "Layer_1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "x", "0px");
    			attr_dev(svg, "y", "0px");
    			attr_dev(svg, "viewBox", "0 0 100 100");
    			attr_dev(svg, "xml:space", "preserve");
    			add_location(svg, file$d, 17, 0, 541);
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
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { player: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PreviousButton",
    			options,
    			id: create_fragment$f.name
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

    /* src/components/PlayButton.svelte generated by Svelte v3.38.3 */
    const file$c = "src/components/PlayButton.svelte";

    function create_fragment$e(ctx) {
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
    			add_location(left_part, file$c, 15, 1, 350);
    			set_custom_element_data(right_part, "class", "svelte-1lvzyl3");
    			add_location(right_part, file$c, 17, 1, 366);
    			set_custom_element_data(play_pause_button, "class", play_pause_button_class_value = "" + (null_to_empty(/*$isPlaying*/ ctx[0] ? "" : "playing") + " svelte-1lvzyl3"));
    			add_location(play_pause_button, file$c, 14, 0, 263);
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
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { player: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PlayButton",
    			options,
    			id: create_fragment$e.name
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

    /* src/components/PlayerProgress.svelte generated by Svelte v3.38.3 */
    const file$b = "src/components/PlayerProgress.svelte";

    function create_fragment$d(ctx) {
    	let player_progress;
    	let player_gloss;
    	let t0;
    	let progress_foreground;
    	let t1;
    	let div;

    	const block = {
    		c: function create() {
    			player_progress = element("player-progress");
    			player_gloss = element("player-gloss");
    			t0 = space();
    			progress_foreground = element("progress-foreground");
    			t1 = space();
    			div = element("div");
    			set_custom_element_data(player_gloss, "class", "svelte-1eondcn");
    			add_location(player_gloss, file$b, 72, 1, 2632);
    			set_custom_element_data(progress_foreground, "class", "svelte-1eondcn");
    			add_location(progress_foreground, file$b, 73, 1, 2650);
    			attr_dev(div, "id", "waveform-data");
    			attr_dev(div, "class", "svelte-1eondcn");
    			add_location(div, file$b, 74, 1, 2675);
    			set_custom_element_data(player_progress, "class", "svelte-1eondcn");
    			add_location(player_progress, file$b, 71, 0, 2613);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, player_progress, anchor);
    			append_dev(player_progress, player_gloss);
    			append_dev(player_progress, t0);
    			append_dev(player_progress, progress_foreground);
    			append_dev(player_progress, t1);
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
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let $updateSongProgress;
    	validate_store(updateSongProgress, "updateSongProgress");
    	component_subscribe($$self, updateSongProgress, $$value => $$invalidate(5, $updateSongProgress = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PlayerProgress", slots, []);
    	
    	let { player } = $$props;
    	let { song } = $$props;
    	let pauseDebounce = undefined;
    	let isMouseDown = false;
    	let isMouseIn = false;

    	// let isPlaybackCursorFirstAssign = true
    	// let playingSongId = undefined
    	/*
    $: {
        if (isPlaybackCursorFirstAssign === true) isPlaybackCursorFirstAssign = false
        else {
            $playbackCursor
            getWaveform($playbackCursor[0])
        }
    }

    async function getWaveform(index: number) {
        let song = $playbackStore?.[index]

        if (song.ID === playingSongId) return

        playingSongId = song.ID

        setWaveSource(song.SourceFile, song.Duration)
    }
    */
    	onMount(() => {
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
    			if (song === undefined) return;
    			player.pause();
    			playerForeground.classList.add("not-smooth");
    			let playerWidth = playerProgress.scrollWidth;

    			//@ts-expect-error
    			let selectedPercent = Math.ceil(100 / playerWidth * evt.offsetX);

    			let songPercentTime = song.Duration / (100 / selectedPercent);

    			// Allows for the player component to get the new value and update the song duration.
    			set_store_value(updateSongProgress, $updateSongProgress = songPercentTime, $updateSongProgress);

    			document.documentElement.style.setProperty("--song-time", `${selectedPercent}%`);
    			clearTimeout(pauseDebounce);

    			pauseDebounce = setTimeout(
    				() => {
    					$$invalidate(0, player.currentTime = songPercentTime, player);
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
    		onMount,
    		updateSongProgress,
    		player,
    		song,
    		pauseDebounce,
    		isMouseDown,
    		isMouseIn,
    		hookPlayerProgressEvents,
    		$updateSongProgress
    	});

    	$$self.$inject_state = $$props => {
    		if ("player" in $$props) $$invalidate(0, player = $$props.player);
    		if ("song" in $$props) $$invalidate(1, song = $$props.song);
    		if ("pauseDebounce" in $$props) pauseDebounce = $$props.pauseDebounce;
    		if ("isMouseDown" in $$props) isMouseDown = $$props.isMouseDown;
    		if ("isMouseIn" in $$props) isMouseIn = $$props.isMouseIn;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [player, song];
    }

    class PlayerProgress extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { player: 0, song: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PlayerProgress",
    			options,
    			id: create_fragment$d.name
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

    /* src/components/PlayerVolumeBar.svelte generated by Svelte v3.38.3 */
    const file$a = "src/components/PlayerVolumeBar.svelte";

    function create_fragment$c(ctx) {
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
    			attr_dev(input, "class", "svelte-19y9jhq");
    			add_location(input, file$a, 41, 1, 1238);
    			attr_dev(background, "class", "svelte-19y9jhq");
    			add_location(background, file$a, 52, 1, 1472);
    			set_custom_element_data(volume_thumb, "class", "svelte-19y9jhq");
    			add_location(volume_thumb, file$a, 53, 1, 1488);
    			set_custom_element_data(volume_bar, "class", "svelte-19y9jhq");
    			add_location(volume_bar, file$a, 40, 0, 1224);
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
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { player: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PlayerVolumeBar",
    			options,
    			id: create_fragment$c.name
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
        data = data.replace('?', escape('?'));
        return data;
    }

    function parseDuration(duration) {
        if (duration >= 60 * 60) {
            return new Date(duration * 1000).toISOString().substr(11, 8);
        }
        else {
            return new Date(duration * 1000).toISOString().substr(14, 5);
        }
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function getDefaultExportFromCjs (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    /*!
     * wavesurfer.js 5.0.1 (2021-05-06)
     * https://wavesurfer-js.org
     * @license BSD-3-Clause
     */

    var wavesurfer_min = createCommonjsModule(function (module, exports) {
    !function(e,t){module.exports=t();}(commonjsGlobal,(function(){return e={427:(e,t,r)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var n=a(r(138)),i=a(r(56));function a(e){return e&&e.__esModule?e:{default:e}}function s(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n);}}var o=function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this.wave=null,this.waveCtx=null,this.progress=null,this.progressCtx=null,this.start=0,this.end=1,this.id=(0, i.default)(void 0!==this.constructor.name?this.constructor.name.toLowerCase()+"_":"canvasentry_"),this.canvasContextAttributes={};}var t,r;return t=e,(r=[{key:"initWave",value:function(e){this.wave=e,this.waveCtx=this.wave.getContext("2d",this.canvasContextAttributes);}},{key:"initProgress",value:function(e){this.progress=e,this.progressCtx=this.progress.getContext("2d",this.canvasContextAttributes);}},{key:"updateDimensions",value:function(e,t,r,i){this.start=this.wave.offsetLeft/t||0,this.end=this.start+e/t,this.wave.width=r,this.wave.height=i;var a={width:e+"px"};(0, n.default)(this.wave,a),this.hasProgressCanvas&&(this.progress.width=r,this.progress.height=i,(0, n.default)(this.progress,a));}},{key:"clearWave",value:function(){this.waveCtx.clearRect(0,0,this.waveCtx.canvas.width,this.waveCtx.canvas.height),this.hasProgressCanvas&&this.progressCtx.clearRect(0,0,this.progressCtx.canvas.width,this.progressCtx.canvas.height);}},{key:"setFillStyles",value:function(e,t){this.waveCtx.fillStyle=e,this.hasProgressCanvas&&(this.progressCtx.fillStyle=t);}},{key:"applyCanvasTransforms",value:function(e){e&&(this.waveCtx.setTransform(0,1,1,0,0,0),this.hasProgressCanvas&&this.progressCtx.setTransform(0,1,1,0,0,0));}},{key:"fillRects",value:function(e,t,r,n,i){this.fillRectToContext(this.waveCtx,e,t,r,n,i),this.hasProgressCanvas&&this.fillRectToContext(this.progressCtx,e,t,r,n,i);}},{key:"fillRectToContext",value:function(e,t,r,n,i,a){e&&(a?this.drawRoundedRect(e,t,r,n,i,a):e.fillRect(t,r,n,i));}},{key:"drawRoundedRect",value:function(e,t,r,n,i,a){0!==i&&(i<0&&(r-=i*=-1),e.beginPath(),e.moveTo(t+a,r),e.lineTo(t+n-a,r),e.quadraticCurveTo(t+n,r,t+n,r+a),e.lineTo(t+n,r+i-a),e.quadraticCurveTo(t+n,r+i,t+n-a,r+i),e.lineTo(t+a,r+i),e.quadraticCurveTo(t,r+i,t,r+i-a),e.lineTo(t,r+a),e.quadraticCurveTo(t,r,t+a,r),e.closePath(),e.fill());}},{key:"drawLines",value:function(e,t,r,n,i,a){this.drawLineToContext(this.waveCtx,e,t,r,n,i,a),this.hasProgressCanvas&&this.drawLineToContext(this.progressCtx,e,t,r,n,i,a);}},{key:"drawLineToContext",value:function(e,t,r,n,i,a,s){if(e){var o,u,l,c=t.length/2,f=Math.round(c*this.start),h=f,d=Math.round(c*this.end)+1,p=this.wave.width/(d-h-1),v=n+i,y=r/n;for(e.beginPath(),e.moveTo((h-f)*p,v),e.lineTo((h-f)*p,v-Math.round((t[2*h]||0)/y)),o=h;o<d;o++)u=t[2*o]||0,l=Math.round(u/y),e.lineTo((o-f)*p+this.halfPixel,v-l);for(var m=d-1;m>=h;m--)u=t[2*m+1]||0,l=Math.round(u/y),e.lineTo((m-f)*p+this.halfPixel,v-l);e.lineTo((h-f)*p,v-Math.round((t[2*h+1]||0)/y)),e.closePath(),e.fill();}}},{key:"destroy",value:function(){this.waveCtx=null,this.wave=null,this.progressCtx=null,this.progress=null;}},{key:"getImage",value:function(e,t,r){var n=this;return "blob"===r?new Promise((function(r){n.wave.toBlob(r,e,t);})):"dataURL"===r?this.wave.toDataURL(e,t):void 0}}])&&s(t.prototype,r),e}();t.default=o,e.exports=t.default;},276:(e,t,r)=>{function n(e){return (n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=function(e,t){if(!t&&e&&e.__esModule)return e;if(null===e||"object"!==n(e)&&"function"!=typeof e)return {default:e};var r=a(t);if(r&&r.has(e))return r.get(e);var i={},s=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if("default"!==o&&Object.prototype.hasOwnProperty.call(e,o)){var u=s?Object.getOwnPropertyDescriptor(e,o):null;u&&(u.get||u.set)?Object.defineProperty(i,o,u):i[o]=e[o];}return i.default=e,r&&r.set(e,i),i}(r(241));function a(e){if("function"!=typeof WeakMap)return null;var t=new WeakMap,r=new WeakMap;return (a=function(e){return e?r:t})(e)}function s(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n);}}function o(e,t){return (o=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function u(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return !1;if(Reflect.construct.sham)return !1;if("function"==typeof Proxy)return !0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return !1}}();return function(){var r,n=c(e);if(t){var i=c(this).constructor;r=Reflect.construct(n,arguments,i);}else r=n.apply(this,arguments);return l(this,r)}}function l(e,t){return !t||"object"!==n(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function c(e){return (c=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}var f=function(e){!function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&o(e,t);}(l,e);var t,r,a=u(l);function l(e,t){var r;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,l),(r=a.call(this)).container=i.withOrientation(e,t.vertical),r.params=t,r.width=0,r.height=t.height*r.params.pixelRatio,r.lastPos=0,r.wrapper=null,r}return t=l,(r=[{key:"style",value:function(e,t){return i.style(e,t)}},{key:"createWrapper",value:function(){this.wrapper=i.withOrientation(this.container.appendChild(document.createElement("wave")),this.params.vertical),this.style(this.wrapper,{display:"block",position:"relative",userSelect:"none",webkitUserSelect:"none",height:this.params.height+"px"}),(this.params.fillParent||this.params.scrollParent)&&this.style(this.wrapper,{width:"100%",overflowX:this.params.hideScrollbar?"hidden":"auto",overflowY:"hidden"}),this.setupWrapperEvents();}},{key:"handleEvent",value:function(e,t){!t&&e.preventDefault();var r,n=i.withOrientation(e.targetTouches?e.targetTouches[0]:e,this.params.vertical).clientX,a=this.wrapper.getBoundingClientRect(),s=this.width,o=this.getWidth(),u=this.getProgressPixels(a,n);return r=!this.params.fillParent&&s<o?u*(this.params.pixelRatio/s)||0:(u+this.wrapper.scrollLeft)/this.wrapper.scrollWidth||0,i.clamp(r,0,1)}},{key:"getProgressPixels",value:function(e,t){return this.params.rtl?e.right-t:t-e.left}},{key:"setupWrapperEvents",value:function(){var e=this;this.wrapper.addEventListener("click",(function(t){var r=i.withOrientation(t,e.params.vertical),n=e.wrapper.offsetHeight-e.wrapper.clientHeight;if(0!==n){var a=e.wrapper.getBoundingClientRect();if(r.clientY>=a.bottom-n)return}e.params.interact&&e.fireEvent("click",t,e.handleEvent(t));})),this.wrapper.addEventListener("dblclick",(function(t){e.params.interact&&e.fireEvent("dblclick",t,e.handleEvent(t));})),this.wrapper.addEventListener("scroll",(function(t){return e.fireEvent("scroll",t)}));}},{key:"drawPeaks",value:function(e,t,r,n){this.setWidth(t)||this.clearWave(),this.params.barWidth?this.drawBars(e,0,r,n):this.drawWave(e,0,r,n);}},{key:"resetScroll",value:function(){null!==this.wrapper&&(this.wrapper.scrollLeft=0);}},{key:"recenter",value:function(e){var t=this.wrapper.scrollWidth*e;this.recenterOnPosition(t,!0);}},{key:"recenterOnPosition",value:function(e,t){var r=this.wrapper.scrollLeft,n=~~(this.wrapper.clientWidth/2),i=this.wrapper.scrollWidth-this.wrapper.clientWidth,a=e-n,s=a-r;if(0!=i){if(!t&&-n<=s&&s<n){var o=this.params.autoCenterRate;o/=n,o*=i,a=r+(s=Math.max(-o,Math.min(o,s)));}(a=Math.max(0,Math.min(i,a)))!=r&&(this.wrapper.scrollLeft=a);}}},{key:"getScrollX",value:function(){var e=0;if(this.wrapper){var t=this.params.pixelRatio;if(e=Math.round(this.wrapper.scrollLeft*t),this.params.scrollParent){var r=~~(this.wrapper.scrollWidth*t-this.getWidth());e=Math.min(r,Math.max(0,e));}}return e}},{key:"getWidth",value:function(){return Math.round(this.container.clientWidth*this.params.pixelRatio)}},{key:"setWidth",value:function(e){if(this.width==e)return !1;if(this.width=e,this.params.fillParent||this.params.scrollParent)this.style(this.wrapper,{width:""});else {var t=~~(this.width/this.params.pixelRatio)+"px";this.style(this.wrapper,{width:t});}return this.updateSize(),!0}},{key:"setHeight",value:function(e){return e!=this.height&&(this.height=e,this.style(this.wrapper,{height:~~(this.height/this.params.pixelRatio)+"px"}),this.updateSize(),!0)}},{key:"progress",value:function(e){var t=1/this.params.pixelRatio,r=Math.round(e*this.width)*t;if(r<this.lastPos||r-this.lastPos>=t){if(this.lastPos=r,this.params.scrollParent&&this.params.autoCenter){var n=~~(this.wrapper.scrollWidth*e);this.recenterOnPosition(n,this.params.autoCenterImmediately);}this.updateProgress(r);}}},{key:"destroy",value:function(){this.unAll(),this.wrapper&&(this.wrapper.parentNode==this.container.domElement&&this.container.removeChild(this.wrapper.domElement),this.wrapper=null);}},{key:"updateCursor",value:function(){}},{key:"updateSize",value:function(){}},{key:"drawBars",value:function(e,t,r,n){}},{key:"drawWave",value:function(e,t,r,n){}},{key:"clearWave",value:function(){}},{key:"updateProgress",value:function(e){}}])&&s(t.prototype,r),l}(i.Observer);t.default=f,e.exports=t.default;},646:(e,t,r)=>{function n(e){return (n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=u(r(276)),a=function(e,t){if(!t&&e&&e.__esModule)return e;if(null===e||"object"!==n(e)&&"function"!=typeof e)return {default:e};var r=o(t);if(r&&r.has(e))return r.get(e);var i={},a=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var s in e)if("default"!==s&&Object.prototype.hasOwnProperty.call(e,s)){var u=a?Object.getOwnPropertyDescriptor(e,s):null;u&&(u.get||u.set)?Object.defineProperty(i,s,u):i[s]=e[s];}return i.default=e,r&&r.set(e,i),i}(r(241)),s=u(r(427));function o(e){if("function"!=typeof WeakMap)return null;var t=new WeakMap,r=new WeakMap;return (o=function(e){return e?r:t})(e)}function u(e){return e&&e.__esModule?e:{default:e}}function l(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n);}}function c(e,t){return (c=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function f(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return !1;if(Reflect.construct.sham)return !1;if("function"==typeof Proxy)return !0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return !1}}();return function(){var r,n=d(e);if(t){var i=d(this).constructor;r=Reflect.construct(n,arguments,i);}else r=n.apply(this,arguments);return h(this,r)}}function h(e,t){return !t||"object"!==n(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function d(e){return (d=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}var p=function(e){!function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&c(e,t);}(o,e);var t,r,i=f(o);function o(e,t){var r;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,o),(r=i.call(this,e,t)).maxCanvasWidth=t.maxCanvasWidth,r.maxCanvasElementWidth=Math.round(t.maxCanvasWidth/t.pixelRatio),r.hasProgressCanvas=t.waveColor!=t.progressColor,r.halfPixel=.5/t.pixelRatio,r.canvases=[],r.progressWave=null,r.EntryClass=s.default,r.canvasContextAttributes=t.drawingContextAttributes,r.overlap=2*Math.ceil(t.pixelRatio/2),r.barRadius=t.barRadius||0,r.vertical=t.vertical,r}return t=o,(r=[{key:"init",value:function(){this.createWrapper(),this.createElements();}},{key:"createElements",value:function(){this.progressWave=a.withOrientation(this.wrapper.appendChild(document.createElement("wave")),this.params.vertical),this.style(this.progressWave,{position:"absolute",zIndex:3,left:0,top:0,bottom:0,overflow:"hidden",width:"0",display:"none",boxSizing:"border-box",borderRightStyle:"solid",pointerEvents:"none"}),this.addCanvas(),this.updateCursor();}},{key:"updateCursor",value:function(){this.style(this.progressWave,{borderRightWidth:this.params.cursorWidth+"px",borderRightColor:this.params.cursorColor});}},{key:"updateSize",value:function(){for(var e=this,t=Math.round(this.width/this.params.pixelRatio),r=Math.ceil(t/(this.maxCanvasElementWidth+this.overlap));this.canvases.length<r;)this.addCanvas();for(;this.canvases.length>r;)this.removeCanvas();var n=this.maxCanvasWidth+this.overlap,i=this.canvases.length-1;this.canvases.forEach((function(t,r){r==i&&(n=e.width-e.maxCanvasWidth*i),e.updateDimensions(t,n,e.height),t.clearWave();}));}},{key:"addCanvas",value:function(){var e=new this.EntryClass;e.canvasContextAttributes=this.canvasContextAttributes,e.hasProgressCanvas=this.hasProgressCanvas,e.halfPixel=this.halfPixel;var t=this.maxCanvasElementWidth*this.canvases.length,r=a.withOrientation(this.wrapper.appendChild(document.createElement("canvas")),this.params.vertical);if(this.style(r,{position:"absolute",zIndex:2,left:t+"px",top:0,bottom:0,height:"100%",pointerEvents:"none"}),e.initWave(r),this.hasProgressCanvas){var n=a.withOrientation(this.progressWave.appendChild(document.createElement("canvas")),this.params.vertical);this.style(n,{position:"absolute",left:t+"px",top:0,bottom:0,height:"100%"}),e.initProgress(n);}this.canvases.push(e);}},{key:"removeCanvas",value:function(){var e=this.canvases[this.canvases.length-1];e.wave.parentElement.removeChild(e.wave.domElement),this.hasProgressCanvas&&e.progress.parentElement.removeChild(e.progress.domElement),e&&(e.destroy(),e=null),this.canvases.pop();}},{key:"updateDimensions",value:function(e,t,r){var n=Math.round(t/this.params.pixelRatio),i=Math.round(this.width/this.params.pixelRatio);e.updateDimensions(n,i,t,r),this.style(this.progressWave,{display:"block"});}},{key:"clearWave",value:function(){var e=this;a.frame((function(){e.canvases.forEach((function(e){return e.clearWave()}));}))();}},{key:"drawBars",value:function(e,t,r,n){var i=this;return this.prepareDraw(e,t,r,n,(function(e){var t=e.absmax,a=e.hasMinVals,s=(e.height,e.offsetY),o=e.halfH,u=e.peaks,l=e.channelIndex;if(void 0!==r)for(var c=a?2:1,f=u.length/c,h=i.params.barWidth*i.params.pixelRatio,d=h+(null===i.params.barGap?0:Math.max(i.params.pixelRatio,i.params.barGap*i.params.pixelRatio)),p=f/i.width,v=n,y=r;y<v;y+=d){var m=u[Math.floor(y*p*c)]||0,b=Math.round(m/t*o);0==b&&i.params.barMinHeight&&(b=i.params.barMinHeight),i.fillRect(y+i.halfPixel,o-b+s,h+i.halfPixel,2*b,i.barRadius,l);}}))}},{key:"drawWave",value:function(e,t,r,n){var i=this;return this.prepareDraw(e,t,r,n,(function(e){var t=e.absmax,a=e.hasMinVals,s=(e.height,e.offsetY),o=e.halfH,u=e.peaks,l=e.channelIndex;if(!a){for(var c=[],f=u.length,h=0;h<f;h++)c[2*h]=u[h],c[2*h+1]=-u[h];u=c;}void 0!==r&&i.drawLine(u,t,o,s,r,n,l),i.fillRect(0,o+s-i.halfPixel,i.width,i.halfPixel,i.barRadius,l);}))}},{key:"drawLine",value:function(e,t,r,n,i,a,s){var o=this,u=this.params.splitChannelsOptions.channelColors[s]||{},l=u.waveColor,c=u.progressColor;this.canvases.forEach((function(s,u){o.setFillStyles(s,l,c),o.applyCanvasTransforms(s,o.params.vertical),s.drawLines(e,t,r,n,i,a);}));}},{key:"fillRect",value:function(e,t,r,n,i,a){for(var s=Math.floor(e/this.maxCanvasWidth),o=Math.min(Math.ceil((e+r)/this.maxCanvasWidth)+1,this.canvases.length),u=s;u<o;u++){var l=this.canvases[u],c=u*this.maxCanvasWidth,f={x1:Math.max(e,u*this.maxCanvasWidth),y1:t,x2:Math.min(e+r,u*this.maxCanvasWidth+l.wave.width),y2:t+n};if(f.x1<f.x2){var h=this.params.splitChannelsOptions.channelColors[a]||{},d=h.waveColor,p=h.progressColor;this.setFillStyles(l,d,p),this.applyCanvasTransforms(l,this.params.vertical),l.fillRects(f.x1-c,f.y1,f.x2-f.x1,f.y2-f.y1,i);}}}},{key:"hideChannel",value:function(e){return this.params.splitChannels&&this.params.splitChannelsOptions.filterChannels.includes(e)}},{key:"prepareDraw",value:function(e,t,r,n,i,s,o){var u=this;return a.frame((function(){if(e[0]instanceof Array){var l=e;if(u.params.splitChannels){var c,f=l.filter((function(e,t){return !u.hideChannel(t)}));return u.params.splitChannelsOptions.overlay||u.setHeight(Math.max(f.length,1)*u.params.height*u.params.pixelRatio),u.params.splitChannelsOptions&&u.params.splitChannelsOptions.relativeNormalization&&(c=a.max(l.map((function(e){return a.absMax(e)})))),l.forEach((function(e,t){return u.prepareDraw(e,t,r,n,i,f.indexOf(e),c)}))}e=l[0];}if(!u.hideChannel(t)){var h=1/u.params.barHeight;u.params.normalize&&(h=void 0===o?a.absMax(e):o);var d=[].some.call(e,(function(e){return e<0})),p=u.params.height*u.params.pixelRatio,v=p/2,y=p*s||0;return u.params.splitChannelsOptions&&u.params.splitChannelsOptions.overlay&&(y=0),i({absmax:h,hasMinVals:d,height:p,offsetY:y,halfH:v,peaks:e,channelIndex:t})}}))()}},{key:"setFillStyles",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this.params.waveColor,r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:this.params.progressColor;e.setFillStyles(t,r);}},{key:"applyCanvasTransforms",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1];e.applyCanvasTransforms(t);}},{key:"getImage",value:function(e,t,r){if("blob"===r)return Promise.all(this.canvases.map((function(n){return n.getImage(e,t,r)})));if("dataURL"===r){var n=this.canvases.map((function(n){return n.getImage(e,t,r)}));return n.length>1?n:n[0]}}},{key:"updateProgress",value:function(e){this.style(this.progressWave,{width:e+"px"});}}])&&l(t.prototype,r),o}(i.default);t.default=p,e.exports=t.default;},328:(e,t,r)=>{function n(e){return (n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}var i;function a(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n);}}function s(e,t,r){return (s="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(e,t,r){var n=function(e,t){for(;!Object.prototype.hasOwnProperty.call(e,t)&&null!==(e=c(e)););return e}(e,t);if(n){var i=Object.getOwnPropertyDescriptor(n,t);return i.get?i.get.call(r):i.value}})(e,t,r||e)}function o(e,t){return (o=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function u(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return !1;if(Reflect.construct.sham)return !1;if("function"==typeof Proxy)return !0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return !1}}();return function(){var r,n=c(e);if(t){var i=c(this).constructor;r=Reflect.construct(n,arguments,i);}else r=n.apply(this,arguments);return l(this,r)}}function l(e,t){return !t||"object"!==n(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function c(e){return (c=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var f=function(e){!function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&o(e,t);}(l,e);var t,r,i=u(l);function l(e){var t;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,l),(t=i.call(this,e)).params=e,t.sourceMediaElement=null,t}return t=l,(r=[{key:"init",value:function(){this.setPlaybackRate(this.params.audioRate),this.createTimer(),this.createVolumeNode(),this.createScriptNode(),this.createAnalyserNode();}},{key:"_load",value:function(e,t,r){s(c(l.prototype),"_load",this).call(this,e,t,r),this.createMediaElementSource(e);}},{key:"createMediaElementSource",value:function(e){this.sourceMediaElement=this.ac.createMediaElementSource(e),this.sourceMediaElement.connect(this.analyser);}},{key:"play",value:function(e,t){return this.resumeAudioContext(),s(c(l.prototype),"play",this).call(this,e,t)}},{key:"destroy",value:function(){s(c(l.prototype),"destroy",this).call(this),this.destroyWebAudio();}}])&&a(t.prototype,r),l}(((i=r(743))&&i.__esModule?i:{default:i}).default);t.default=f,e.exports=t.default;},743:(e,t,r)=>{function n(e){return (n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i,a=(i=r(379))&&i.__esModule?i:{default:i},s=function(e,t){if(!t&&e&&e.__esModule)return e;if(null===e||"object"!==n(e)&&"function"!=typeof e)return {default:e};var r=o(t);if(r&&r.has(e))return r.get(e);var i={},a=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var s in e)if("default"!==s&&Object.prototype.hasOwnProperty.call(e,s)){var u=a?Object.getOwnPropertyDescriptor(e,s):null;u&&(u.get||u.set)?Object.defineProperty(i,s,u):i[s]=e[s];}return i.default=e,r&&r.set(e,i),i}(r(241));function o(e){if("function"!=typeof WeakMap)return null;var t=new WeakMap,r=new WeakMap;return (o=function(e){return e?r:t})(e)}function u(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n);}}function l(e,t,r){return (l="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(e,t,r){var n=function(e,t){for(;!Object.prototype.hasOwnProperty.call(e,t)&&null!==(e=d(e)););return e}(e,t);if(n){var i=Object.getOwnPropertyDescriptor(n,t);return i.get?i.get.call(r):i.value}})(e,t,r||e)}function c(e,t){return (c=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function f(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return !1;if(Reflect.construct.sham)return !1;if("function"==typeof Proxy)return !0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return !1}}();return function(){var r,n=d(e);if(t){var i=d(this).constructor;r=Reflect.construct(n,arguments,i);}else r=n.apply(this,arguments);return h(this,r)}}function h(e,t){return !t||"object"!==n(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function d(e){return (d=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}var p=function(e){!function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&c(e,t);}(a,e);var t,r,i=f(a);function a(e){var t;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,a),(t=i.call(this,e)).params=e,t.media={currentTime:0,duration:0,paused:!0,playbackRate:1,play:function(){},pause:function(){},volume:0},t.mediaType=e.mediaType.toLowerCase(),t.elementPosition=e.elementPosition,t.peaks=null,t.playbackRate=1,t.volume=1,t.isMuted=!1,t.buffer=null,t.onPlayEnd=null,t.mediaListeners={},t}return t=a,(r=[{key:"init",value:function(){this.setPlaybackRate(this.params.audioRate),this.createTimer();}},{key:"_setupMediaListeners",value:function(){var e=this;this.mediaListeners.error=function(){e.fireEvent("error","Error loading media element");},this.mediaListeners.canplay=function(){e.fireEvent("canplay");},this.mediaListeners.ended=function(){e.fireEvent("finish");},this.mediaListeners.play=function(){e.fireEvent("play");},this.mediaListeners.pause=function(){e.fireEvent("pause");},this.mediaListeners.seeked=function(t){e.fireEvent("seek");},this.mediaListeners.volumechange=function(t){e.isMuted=e.media.muted,e.isMuted?e.volume=0:e.volume=e.media.volume,e.fireEvent("volume");},Object.keys(this.mediaListeners).forEach((function(t){e.media.removeEventListener(t,e.mediaListeners[t]),e.media.addEventListener(t,e.mediaListeners[t]);}));}},{key:"createTimer",value:function(){var e=this;this.on("play",(function t(){e.isPaused()||(e.fireEvent("audioprocess",e.getCurrentTime()),s.frame(t)());})),this.on("pause",(function(){e.fireEvent("audioprocess",e.getCurrentTime());}));}},{key:"load",value:function(e,t,r,n){var i=document.createElement(this.mediaType);i.controls=this.params.mediaControls,i.autoplay=this.params.autoplay||!1,i.preload=null==n?"auto":n,i.src=e,i.style.width="100%";var a=t.querySelector(this.mediaType);a&&t.removeChild(a),t.appendChild(i),this._load(i,r,n);}},{key:"loadElt",value:function(e,t){e.controls=this.params.mediaControls,e.autoplay=this.params.autoplay||!1,this._load(e,t,e.preload);}},{key:"_load",value:function(e,t,r){if(!(e instanceof HTMLMediaElement)||void 0===e.addEventListener)throw new Error("media parameter is not a valid media element");"function"!=typeof e.load||t&&"none"==r||e.load(),this.media=e,this._setupMediaListeners(),this.peaks=t,this.onPlayEnd=null,this.buffer=null,this.isMuted=e.muted,this.setPlaybackRate(this.playbackRate),this.setVolume(this.volume);}},{key:"isPaused",value:function(){return !this.media||this.media.paused}},{key:"getDuration",value:function(){if(this.explicitDuration)return this.explicitDuration;var e=(this.buffer||this.media).duration;return e>=1/0&&(e=this.media.seekable.end(0)),e}},{key:"getCurrentTime",value:function(){return this.media&&this.media.currentTime}},{key:"getPlayedPercents",value:function(){return this.getCurrentTime()/this.getDuration()||0}},{key:"getPlaybackRate",value:function(){return this.playbackRate||this.media.playbackRate}},{key:"setPlaybackRate",value:function(e){this.playbackRate=e||1,this.media.playbackRate=this.playbackRate;}},{key:"seekTo",value:function(e){null!=e&&(this.media.currentTime=e),this.clearPlayEnd();}},{key:"play",value:function(e,t){this.seekTo(e);var r=this.media.play();return t&&this.setPlayEnd(t),r}},{key:"pause",value:function(){var e;return this.media&&(e=this.media.pause()),this.clearPlayEnd(),e}},{key:"setPlayEnd",value:function(e){var t=this;this.clearPlayEnd(),this._onPlayEnd=function(r){r>=e&&(t.pause(),t.seekTo(e));},this.on("audioprocess",this._onPlayEnd);}},{key:"clearPlayEnd",value:function(){this._onPlayEnd&&(this.un("audioprocess",this._onPlayEnd),this._onPlayEnd=null);}},{key:"getPeaks",value:function(e,t,r){return this.buffer?l(d(a.prototype),"getPeaks",this).call(this,e,t,r):this.peaks||[]}},{key:"setSinkId",value:function(e){return e?this.media.setSinkId?this.media.setSinkId(e):Promise.reject(new Error("setSinkId is not supported in your browser")):Promise.reject(new Error("Invalid deviceId: "+e))}},{key:"getVolume",value:function(){return this.volume}},{key:"setVolume",value:function(e){this.volume=e,this.media.volume!==this.volume&&(this.media.volume=this.volume);}},{key:"setMute",value:function(e){this.isMuted=this.media.muted=e;}},{key:"destroy",value:function(){var e=this;this.pause(),this.unAll(),this.destroyed=!0,Object.keys(this.mediaListeners).forEach((function(t){e.media&&e.media.removeEventListener(t,e.mediaListeners[t]);})),this.params.removeMediaElementOnDestroy&&this.media&&this.media.parentNode&&this.media.parentNode.removeChild(this.media),this.media=null;}}])&&u(t.prototype,r),a}(a.default);t.default=p,e.exports=t.default;},227:(e,t)=>{function r(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n);}}Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var n=function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this.clearPeakCache();}var t,n;return t=e,(n=[{key:"clearPeakCache",value:function(){this.peakCacheRanges=[],this.peakCacheLength=-1;}},{key:"addRangeToPeakCache",value:function(e,t,r){e!=this.peakCacheLength&&(this.clearPeakCache(),this.peakCacheLength=e);for(var n=[],i=0;i<this.peakCacheRanges.length&&this.peakCacheRanges[i]<t;)i++;for(i%2==0&&n.push(t);i<this.peakCacheRanges.length&&this.peakCacheRanges[i]<=r;)n.push(this.peakCacheRanges[i]),i++;i%2==0&&n.push(r),n=n.filter((function(e,t,r){return 0==t?e!=r[t+1]:t==r.length-1?e!=r[t-1]:e!=r[t-1]&&e!=r[t+1]})),this.peakCacheRanges=this.peakCacheRanges.concat(n),this.peakCacheRanges=this.peakCacheRanges.sort((function(e,t){return e-t})).filter((function(e,t,r){return 0==t?e!=r[t+1]:t==r.length-1?e!=r[t-1]:e!=r[t-1]&&e!=r[t+1]}));var a=[];for(i=0;i<n.length;i+=2)a.push([n[i],n[i+1]]);return a}},{key:"getCacheRanges",value:function(){var e,t=[];for(e=0;e<this.peakCacheRanges.length;e+=2)t.push([this.peakCacheRanges[e],this.peakCacheRanges[e+1]]);return t}}])&&r(t.prototype,n),e}();t.default=n,e.exports=t.default;},765:(e,t,r)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e){var t=(0, n.default)(e),r=(0, i.default)(e);return -r>t?-r:t};var n=a(r(178)),i=a(r(706));function a(e){return e&&e.__esModule?e:{default:e}}e.exports=t.default;},694:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e,t,r){return Math.min(Math.max(t,e),r)},e.exports=t.default;},342:(e,t,r)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e){if(!e)throw new Error("fetch options missing");if(!e.url)throw new Error("fetch url missing");var t=new i.default,r=new Headers,n=new Request(e.url);t.controller=new AbortController,e&&e.requestHeaders&&e.requestHeaders.forEach((function(e){r.append(e.key,e.value);}));var a=e.responseType||"json",o={method:e.method||"GET",headers:r,mode:e.mode||"cors",credentials:e.credentials||"same-origin",cache:e.cache||"default",redirect:e.redirect||"follow",referrer:e.referrer||"client",signal:t.controller.signal};return fetch(n,o).then((function(e){t.response=e;var r=!0;e.body||(r=!1);var n=e.headers.get("content-length");return null===n&&(r=!1),r?(t.onProgress=function(e){t.fireEvent("progress",e);},new Response(new ReadableStream(new s(t,n,e)),o)):e})).then((function(e){var t;if(e.ok)switch(a){case"arraybuffer":return e.arrayBuffer();case"json":return e.json();case"blob":return e.blob();case"text":return e.text();default:t="Unknown responseType: "+a;}throw t||(t="HTTP error status: "+e.status),new Error(t)})).then((function(e){t.fireEvent("success",e);})).catch((function(e){t.fireEvent("error",e);})),t.fetchRequest=n,t};var n,i=(n=r(399))&&n.__esModule?n:{default:n};function a(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n);}}var s=function(){function e(t,r,n){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this.instance=t,this.instance._reader=n.body.getReader(),this.total=parseInt(r,10),this.loaded=0;}var t,r;return t=e,(r=[{key:"start",value:function(e){var t=this;!function r(){t.instance._reader.read().then((function(n){var i=n.done,a=n.value;if(i)return 0===t.total&&t.instance.onProgress.call(t.instance,{loaded:t.loaded,total:t.total,lengthComputable:!1}),void e.close();t.loaded+=a.byteLength,t.instance.onProgress.call(t.instance,{loaded:t.loaded,total:t.total,lengthComputable:!(0===t.total)}),e.enqueue(a),r();})).catch((function(t){e.error(t);}));}();}}])&&a(t.prototype,r),e}();e.exports=t.default;},412:(e,t,r)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e){return function(){for(var t=arguments.length,r=new Array(t),n=0;n<t;n++)r[n]=arguments[n];return (0, i.default)((function(){return e.apply(void 0,r)}))}};var n,i=(n=r(779))&&n.__esModule?n:{default:n};e.exports=t.default;},56:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e){return void 0===e&&(e="wavesurfer_"),e+Math.random().toString(32).substring(2)},e.exports=t.default;},241:(e,t,r)=>{Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"getId",{enumerable:!0,get:function(){return n.default}}),Object.defineProperty(t,"max",{enumerable:!0,get:function(){return i.default}}),Object.defineProperty(t,"min",{enumerable:!0,get:function(){return a.default}}),Object.defineProperty(t,"absMax",{enumerable:!0,get:function(){return s.default}}),Object.defineProperty(t,"Observer",{enumerable:!0,get:function(){return o.default}}),Object.defineProperty(t,"style",{enumerable:!0,get:function(){return u.default}}),Object.defineProperty(t,"requestAnimationFrame",{enumerable:!0,get:function(){return l.default}}),Object.defineProperty(t,"frame",{enumerable:!0,get:function(){return c.default}}),Object.defineProperty(t,"debounce",{enumerable:!0,get:function(){return f.default}}),Object.defineProperty(t,"preventClick",{enumerable:!0,get:function(){return h.default}}),Object.defineProperty(t,"fetchFile",{enumerable:!0,get:function(){return d.default}}),Object.defineProperty(t,"clamp",{enumerable:!0,get:function(){return p.default}}),Object.defineProperty(t,"withOrientation",{enumerable:!0,get:function(){return v.default}});var n=y(r(56)),i=y(r(178)),a=y(r(706)),s=y(r(765)),o=y(r(399)),u=y(r(138)),l=y(r(779)),c=y(r(412)),f=y(r(296)),h=y(r(529)),d=y(r(342)),p=y(r(694)),v=y(r(713));function y(e){return e&&e.__esModule?e:{default:e}}},178:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e){var t=-1/0;return Object.keys(e).forEach((function(r){e[r]>t&&(t=e[r]);})),t},e.exports=t.default;},706:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e){var t=Number(1/0);return Object.keys(e).forEach((function(r){e[r]<t&&(t=e[r]);})),t},e.exports=t.default;},399:(e,t)=>{function r(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n);}}Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var n=function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this._disabledEventEmissions=[],this.handlers=null;}var t,n;return t=e,(n=[{key:"on",value:function(e,t){var r=this;this.handlers||(this.handlers={});var n=this.handlers[e];return n||(n=this.handlers[e]=[]),n.push(t),{name:e,callback:t,un:function(e,t){return r.un(e,t)}}}},{key:"un",value:function(e,t){if(this.handlers){var r,n=this.handlers[e];if(n)if(t)for(r=n.length-1;r>=0;r--)n[r]==t&&n.splice(r,1);else n.length=0;}}},{key:"unAll",value:function(){this.handlers=null;}},{key:"once",value:function(e,t){var r=this;return this.on(e,(function n(){for(var i=arguments.length,a=new Array(i),s=0;s<i;s++)a[s]=arguments[s];t.apply(r,a),setTimeout((function(){r.un(e,n);}),0);}))}},{key:"setDisabledEventEmissions",value:function(e){this._disabledEventEmissions=e;}},{key:"_isDisabledEventEmission",value:function(e){return this._disabledEventEmissions&&this._disabledEventEmissions.includes(e)}},{key:"fireEvent",value:function(e){for(var t=arguments.length,r=new Array(t>1?t-1:0),n=1;n<t;n++)r[n-1]=arguments[n];if(this.handlers&&!this._isDisabledEventEmission(e)){var i=this.handlers[e];i&&i.forEach((function(e){e.apply(void 0,r);}));}}}])&&r(t.prototype,n),e}();t.default=n,e.exports=t.default;},713:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.default=function e(t,r){return t[i]?t:new Proxy(t,{get:function(t,a,s){if(a===i)return !0;if("domElement"===a)return t;if("style"===a)return e(t.style,r);if("canvas"===a)return e(t.canvas,r);if("getBoundingClientRect"===a)return function(){return e(t.getBoundingClientRect.apply(t,arguments),r)};if("getContext"===a)return function(){return e(t.getContext.apply(t,arguments),r)};var o=t[n(a,r)];return "function"==typeof o?o.bind(t):o},set:function(e,t,i){return e[n(t,r)]=i,!0}})};var r={width:"height",height:"width",overflowX:"overflowY",overflowY:"overflowX",clientWidth:"clientHeight",clientHeight:"clientWidth",clientX:"clientY",clientY:"clientX",scrollWidth:"scrollHeight",scrollLeft:"scrollTop",offsetLeft:"offsetTop",offsetTop:"offsetLeft",offsetHeight:"offsetWidth",offsetWidth:"offsetHeight",left:"top",right:"bottom",top:"left",bottom:"right",borderRightStyle:"borderBottomStyle",borderRightWidth:"borderBottomWidth",borderRightColor:"borderBottomColor"};function n(e,t){return Object.prototype.hasOwnProperty.call(r,e)&&t?r[e]:e}var i=Symbol("isProxy");e.exports=t.default;},529:(e,t)=>{function r(e){e.stopPropagation(),document.body.removeEventListener("click",r,!0);}Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e){document.body.addEventListener("click",r,!0);},e.exports=t.default;},779:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var r=(window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(e,t){return setTimeout(e,1e3/60)}).bind(window);t.default=r,e.exports=t.default;},138:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e,t){return Object.keys(t).forEach((function(r){e.style[r]!==t[r]&&(e.style[r]=t[r]);})),e},e.exports=t.default;},631:(e,t,r)=>{function n(e){return (n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=function(e,t){if(!t&&e&&e.__esModule)return e;if(null===e||"object"!==n(e)&&"function"!=typeof e)return {default:e};var r=f(t);if(r&&r.has(e))return r.get(e);var i={},a=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var s in e)if("default"!==s&&Object.prototype.hasOwnProperty.call(e,s)){var o=a?Object.getOwnPropertyDescriptor(e,s):null;o&&(o.get||o.set)?Object.defineProperty(i,s,o):i[s]=e[s];}return i.default=e,r&&r.set(e,i),i}(r(241)),a=c(r(646)),s=c(r(379)),o=c(r(743)),u=c(r(227)),l=c(r(328));function c(e){return e&&e.__esModule?e:{default:e}}function f(e){if("function"!=typeof WeakMap)return null;var t=new WeakMap,r=new WeakMap;return (f=function(e){return e?r:t})(e)}function h(e,t){return (h=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function d(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return !1;if(Reflect.construct.sham)return !1;if("function"==typeof Proxy)return !0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return !1}}();return function(){var r,n=y(e);if(t){var i=y(this).constructor;r=Reflect.construct(n,arguments,i);}else r=n.apply(this,arguments);return p(this,r)}}function p(e,t){return !t||"object"!==n(t)&&"function"!=typeof t?v(e):t}function v(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function y(e){return (y=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function m(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function b(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n);}}function g(e,t,r){return t&&b(e.prototype,t),r&&b(e,r),e}var k=function(e){!function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&h(e,t);}(r,e);var t=d(r);function r(e){var n;if(m(this,r),(n=t.call(this)).defaultParams={audioContext:null,audioScriptProcessor:null,audioRate:1,autoCenter:!0,autoCenterRate:5,autoCenterImmediately:!1,backend:"WebAudio",backgroundColor:null,barHeight:1,barRadius:0,barGap:null,barMinHeight:null,container:null,cursorColor:"#333",cursorWidth:1,dragSelection:!0,drawingContextAttributes:{desynchronized:!1},duration:null,fillParent:!0,forceDecode:!1,height:128,hideScrollbar:!1,interact:!0,loopSelection:!0,maxCanvasWidth:4e3,mediaContainer:null,mediaControls:!1,mediaType:"audio",minPxPerSec:20,normalize:!1,partialRender:!1,pixelRatio:window.devicePixelRatio||screen.deviceXDPI/screen.logicalXDPI,plugins:[],progressColor:"#555",removeMediaElementOnDestroy:!0,renderer:a.default,responsive:!1,rtl:!1,scrollParent:!1,skipLength:2,splitChannels:!1,splitChannelsOptions:{overlay:!1,channelColors:{},filterChannels:[],relativeNormalization:!1},vertical:!1,waveColor:"#999",xhr:{}},n.backends={MediaElement:o.default,WebAudio:s.default,MediaElementWebAudio:l.default},n.util=i,n.params=Object.assign({},n.defaultParams,e),n.params.splitChannelsOptions=Object.assign({},n.defaultParams.splitChannelsOptions,e.splitChannelsOptions),n.container="string"==typeof e.container?document.querySelector(n.params.container):n.params.container,!n.container)throw new Error("Container element not found");if(null==n.params.mediaContainer?n.mediaContainer=n.container:"string"==typeof n.params.mediaContainer?n.mediaContainer=document.querySelector(n.params.mediaContainer):n.mediaContainer=n.params.mediaContainer,!n.mediaContainer)throw new Error("Media Container element not found");if(n.params.maxCanvasWidth<=1)throw new Error("maxCanvasWidth must be greater than 1");if(n.params.maxCanvasWidth%2==1)throw new Error("maxCanvasWidth must be an even number");if(!0===n.params.rtl&&(!0===n.params.vertical?i.style(n.container,{transform:"rotateX(180deg)"}):i.style(n.container,{transform:"rotateY(180deg)"})),n.params.backgroundColor&&n.setBackgroundColor(n.params.backgroundColor),n.savedVolume=0,n.isMuted=!1,n.tmpEvents=[],n.currentRequest=null,n.arraybuffer=null,n.drawer=null,n.backend=null,n.peakCache=null,"function"!=typeof n.params.renderer)throw new Error("Renderer parameter is invalid");n.Drawer=n.params.renderer,"AudioElement"==n.params.backend&&(n.params.backend="MediaElement"),"WebAudio"!=n.params.backend&&"MediaElementWebAudio"!==n.params.backend||s.default.prototype.supportsWebAudio.call(null)||(n.params.backend="MediaElement"),n.Backend=n.backends[n.params.backend],n.initialisedPluginList={},n.isDestroyed=!1,n.isReady=!1;var u=0;return n._onResize=i.debounce((function(){u==n.drawer.wrapper.clientWidth||n.params.scrollParent||(u=n.drawer.wrapper.clientWidth,n.drawer.fireEvent("redraw"));}),"number"==typeof n.params.responsive?n.params.responsive:100),p(n,v(n))}return g(r,[{key:"init",value:function(){return this.registerPlugins(this.params.plugins),this.createDrawer(),this.createBackend(),this.createPeakCache(),this}},{key:"registerPlugins",value:function(e){var t=this;return e.forEach((function(e){return t.addPlugin(e)})),e.forEach((function(e){e.deferInit||t.initPlugin(e.name);})),this.fireEvent("plugins-registered",e),this}},{key:"getActivePlugins",value:function(){return this.initialisedPluginList}},{key:"addPlugin",value:function(e){var t=this;if(!e.name)throw new Error("Plugin does not have a name!");if(!e.instance)throw new Error("Plugin ".concat(e.name," does not have an instance property!"));e.staticProps&&Object.keys(e.staticProps).forEach((function(r){t[r]=e.staticProps[r];}));var r=e.instance;return Object.getOwnPropertyNames(i.Observer.prototype).forEach((function(e){r.prototype[e]=i.Observer.prototype[e];})),this[e.name]=new r(e.params||{},this),this.fireEvent("plugin-added",e.name),this}},{key:"initPlugin",value:function(e){if(!this[e])throw new Error("Plugin ".concat(e," has not been added yet!"));return this.initialisedPluginList[e]&&this.destroyPlugin(e),this[e].init(),this.initialisedPluginList[e]=!0,this.fireEvent("plugin-initialised",e),this}},{key:"destroyPlugin",value:function(e){if(!this[e])throw new Error("Plugin ".concat(e," has not been added yet and cannot be destroyed!"));if(!this.initialisedPluginList[e])throw new Error("Plugin ".concat(e," is not active and cannot be destroyed!"));if("function"!=typeof this[e].destroy)throw new Error("Plugin ".concat(e," does not have a destroy function!"));return this[e].destroy(),delete this.initialisedPluginList[e],this.fireEvent("plugin-destroyed",e),this}},{key:"destroyAllPlugins",value:function(){var e=this;Object.keys(this.initialisedPluginList).forEach((function(t){return e.destroyPlugin(t)}));}},{key:"createDrawer",value:function(){var e=this;this.drawer=new this.Drawer(this.container,this.params),this.drawer.init(),this.fireEvent("drawer-created",this.drawer),!1!==this.params.responsive&&(window.addEventListener("resize",this._onResize,!0),window.addEventListener("orientationchange",this._onResize,!0)),this.drawer.on("redraw",(function(){e.drawBuffer(),e.drawer.progress(e.backend.getPlayedPercents());})),this.drawer.on("click",(function(t,r){setTimeout((function(){return e.seekTo(r)}),0);})),this.drawer.on("scroll",(function(t){e.params.partialRender&&e.drawBuffer(),e.fireEvent("scroll",t);}));}},{key:"createBackend",value:function(){var e=this;this.backend&&this.backend.destroy(),this.backend=new this.Backend(this.params),this.backend.init(),this.fireEvent("backend-created",this.backend),this.backend.on("finish",(function(){e.drawer.progress(e.backend.getPlayedPercents()),e.fireEvent("finish");})),this.backend.on("play",(function(){return e.fireEvent("play")})),this.backend.on("pause",(function(){return e.fireEvent("pause")})),this.backend.on("audioprocess",(function(t){e.drawer.progress(e.backend.getPlayedPercents()),e.fireEvent("audioprocess",t);})),"MediaElement"!==this.params.backend&&"MediaElementWebAudio"!==this.params.backend||(this.backend.on("seek",(function(){e.drawer.progress(e.backend.getPlayedPercents());})),this.backend.on("volume",(function(){var t=e.getVolume();e.fireEvent("volume",t),e.backend.isMuted!==e.isMuted&&(e.isMuted=e.backend.isMuted,e.fireEvent("mute",e.isMuted));})));}},{key:"createPeakCache",value:function(){this.params.partialRender&&(this.peakCache=new u.default);}},{key:"getDuration",value:function(){return this.backend.getDuration()}},{key:"getCurrentTime",value:function(){return this.backend.getCurrentTime()}},{key:"setCurrentTime",value:function(e){e>=this.getDuration()?this.seekTo(1):this.seekTo(e/this.getDuration());}},{key:"play",value:function(e,t){var r=this;return this.fireEvent("interaction",(function(){return r.play(e,t)})),this.backend.play(e,t)}},{key:"setPlayEnd",value:function(e){this.backend.setPlayEnd(e);}},{key:"pause",value:function(){if(!this.backend.isPaused())return this.backend.pause()}},{key:"playPause",value:function(){return this.backend.isPaused()?this.play():this.pause()}},{key:"isPlaying",value:function(){return !this.backend.isPaused()}},{key:"skipBackward",value:function(e){this.skip(-e||-this.params.skipLength);}},{key:"skipForward",value:function(e){this.skip(e||this.params.skipLength);}},{key:"skip",value:function(e){var t=this.getDuration()||1,r=this.getCurrentTime()||0;r=Math.max(0,Math.min(t,r+(e||0))),this.seekAndCenter(r/t);}},{key:"seekAndCenter",value:function(e){this.seekTo(e),this.drawer.recenter(e);}},{key:"seekTo",value:function(e){var t=this;if("number"!=typeof e||!isFinite(e)||e<0||e>1)throw new Error("Error calling wavesurfer.seekTo, parameter must be a number between 0 and 1!");this.fireEvent("interaction",(function(){return t.seekTo(e)}));var r="WebAudio"===this.params.backend,n=this.backend.isPaused();r&&!n&&this.backend.pause();var i=this.params.scrollParent;this.params.scrollParent=!1,this.backend.seekTo(e*this.getDuration()),this.drawer.progress(e),r&&!n&&this.backend.play(),this.params.scrollParent=i,this.fireEvent("seek",e);}},{key:"stop",value:function(){this.pause(),this.seekTo(0),this.drawer.progress(0);}},{key:"setSinkId",value:function(e){return this.backend.setSinkId(e)}},{key:"setVolume",value:function(e){this.backend.setVolume(e),this.fireEvent("volume",e);}},{key:"getVolume",value:function(){return this.backend.getVolume()}},{key:"setPlaybackRate",value:function(e){this.backend.setPlaybackRate(e);}},{key:"getPlaybackRate",value:function(){return this.backend.getPlaybackRate()}},{key:"toggleMute",value:function(){this.setMute(!this.isMuted);}},{key:"setMute",value:function(e){e!==this.isMuted?(this.backend.setMute?(this.backend.setMute(e),this.isMuted=e):e?(this.savedVolume=this.backend.getVolume(),this.backend.setVolume(0),this.isMuted=!0,this.fireEvent("volume",0)):(this.backend.setVolume(this.savedVolume),this.isMuted=!1,this.fireEvent("volume",this.savedVolume)),this.fireEvent("mute",this.isMuted)):this.fireEvent("mute",this.isMuted);}},{key:"getMute",value:function(){return this.isMuted}},{key:"getFilters",value:function(){return this.backend.filters||[]}},{key:"toggleScroll",value:function(){this.params.scrollParent=!this.params.scrollParent,this.drawBuffer();}},{key:"toggleInteraction",value:function(){this.params.interact=!this.params.interact;}},{key:"getWaveColor",value:function(){return this.params.waveColor}},{key:"setWaveColor",value:function(e){this.params.waveColor=e,this.drawBuffer();}},{key:"getProgressColor",value:function(){return this.params.progressColor}},{key:"setProgressColor",value:function(e){this.params.progressColor=e,this.drawBuffer();}},{key:"getBackgroundColor",value:function(){return this.params.backgroundColor}},{key:"setBackgroundColor",value:function(e){this.params.backgroundColor=e,i.style(this.container,{background:this.params.backgroundColor});}},{key:"getCursorColor",value:function(){return this.params.cursorColor}},{key:"setCursorColor",value:function(e){this.params.cursorColor=e,this.drawer.updateCursor();}},{key:"getHeight",value:function(){return this.params.height}},{key:"setHeight",value:function(e){this.params.height=e,this.drawer.setHeight(e*this.params.pixelRatio),this.drawBuffer();}},{key:"setFilteredChannels",value:function(e){this.params.splitChannelsOptions.filterChannels=e,this.drawBuffer();}},{key:"drawBuffer",value:function(){var e,t=Math.round(this.getDuration()*this.params.minPxPerSec*this.params.pixelRatio),r=this.drawer.getWidth(),n=t,i=0,a=Math.max(i+r,n);if(this.params.fillParent&&(!this.params.scrollParent||t<r)&&(i=0,a=n=r),this.params.partialRender){var s,o=this.peakCache.addRangeToPeakCache(n,i,a);for(s=0;s<o.length;s++)e=this.backend.getPeaks(n,o[s][0],o[s][1]),this.drawer.drawPeaks(e,n,o[s][0],o[s][1]);}else e=this.backend.getPeaks(n,i,a),this.drawer.drawPeaks(e,n,i,a);this.fireEvent("redraw",e,n);}},{key:"zoom",value:function(e){e?(this.params.minPxPerSec=e,this.params.scrollParent=!0):(this.params.minPxPerSec=this.defaultParams.minPxPerSec,this.params.scrollParent=!1),this.drawBuffer(),this.drawer.progress(this.backend.getPlayedPercents()),this.drawer.recenter(this.getCurrentTime()/this.getDuration()),this.fireEvent("zoom",e);}},{key:"loadArrayBuffer",value:function(e){var t=this;this.decodeArrayBuffer(e,(function(e){t.isDestroyed||t.loadDecodedBuffer(e);}));}},{key:"loadDecodedBuffer",value:function(e){this.backend.load(e),this.drawBuffer(),this.isReady=!0,this.fireEvent("ready");}},{key:"loadBlob",value:function(e){var t=this,r=new FileReader;r.addEventListener("progress",(function(e){return t.onProgress(e)})),r.addEventListener("load",(function(e){return t.loadArrayBuffer(e.target.result)})),r.addEventListener("error",(function(){return t.fireEvent("error","Error reading file")})),r.readAsArrayBuffer(e),this.empty();}},{key:"load",value:function(e,t,r,n){if(!e)throw new Error("url parameter cannot be empty");if(this.empty(),r){var i={"Preload is not 'auto', 'none' or 'metadata'":-1===["auto","metadata","none"].indexOf(r),"Peaks are not provided":!t,"Backend is not of type 'MediaElement' or 'MediaElementWebAudio'":-1===["MediaElement","MediaElementWebAudio"].indexOf(this.params.backend),"Url is not of type string":"string"!=typeof e},a=Object.keys(i).filter((function(e){return i[e]}));a.length&&(console.warn("Preload parameter of wavesurfer.load will be ignored because:\n\t- "+a.join("\n\t- ")),r=null);}switch("WebAudio"===this.params.backend&&e instanceof HTMLMediaElement&&(e=e.src),this.params.backend){case"WebAudio":return this.loadBuffer(e,t,n);case"MediaElement":case"MediaElementWebAudio":return this.loadMediaElement(e,t,r,n)}}},{key:"loadBuffer",value:function(e,t,r){var n=this,i=function(t){return t&&n.tmpEvents.push(n.once("ready",t)),n.getArrayBuffer(e,(function(e){return n.loadArrayBuffer(e)}))};if(!t)return i();this.backend.setPeaks(t,r),this.drawBuffer(),this.fireEvent("waveform-ready"),this.tmpEvents.push(this.once("interaction",i));}},{key:"loadMediaElement",value:function(e,t,r,n){var i=this,a=e;if("string"==typeof e)this.backend.load(a,this.mediaContainer,t,r);else {var s=e;this.backend.loadElt(s,t),a=s.src;}this.tmpEvents.push(this.backend.once("canplay",(function(){i.backend.destroyed||(i.drawBuffer(),i.isReady=!0,i.fireEvent("ready"));})),this.backend.once("error",(function(e){return i.fireEvent("error",e)}))),t&&(this.backend.setPeaks(t,n),this.drawBuffer(),this.fireEvent("waveform-ready")),t&&!this.params.forceDecode||!this.backend.supportsWebAudio()||this.getArrayBuffer(a,(function(e){i.decodeArrayBuffer(e,(function(e){i.backend.buffer=e,i.backend.setPeaks(null),i.drawBuffer(),i.fireEvent("waveform-ready");}));}));}},{key:"decodeArrayBuffer",value:function(e,t){var r=this;this.arraybuffer=e,this.backend.decodeArrayBuffer(e,(function(n){r.isDestroyed||r.arraybuffer!=e||(t(n),r.arraybuffer=null);}),(function(){return r.fireEvent("error","Error decoding audiobuffer")}));}},{key:"getArrayBuffer",value:function(e,t){var r=this,n=Object.assign({url:e,responseType:"arraybuffer"},this.params.xhr),a=i.fetchFile(n);return this.currentRequest=a,this.tmpEvents.push(a.on("progress",(function(e){r.onProgress(e);})),a.on("success",(function(e){t(e),r.currentRequest=null;})),a.on("error",(function(e){r.fireEvent("error",e),r.currentRequest=null;}))),a}},{key:"onProgress",value:function(e){var t;t=e.lengthComputable?e.loaded/e.total:e.loaded/(e.loaded+1e6),this.fireEvent("loading",Math.round(100*t),e.target);}},{key:"exportPCM",value:function(e,t,r,n,i){e=e||1024,n=n||0,t=t||1e4,r=r||!1;var a=this.backend.getPeaks(e,n,i),s=[].map.call(a,(function(e){return Math.round(e*t)/t}));return new Promise((function(e,t){if(!r){var n=new Blob([JSON.stringify(s)],{type:"application/json;charset=utf-8"}),i=URL.createObjectURL(n);window.open(i),URL.revokeObjectURL(i);}e(s);}))}},{key:"exportImage",value:function(e,t,r){return e||(e="image/png"),t||(t=1),r||(r="dataURL"),this.drawer.getImage(e,t,r)}},{key:"cancelAjax",value:function(){this.currentRequest&&this.currentRequest.controller&&(this.currentRequest._reader&&this.currentRequest._reader.cancel().catch((function(e){})),this.currentRequest.controller.abort(),this.currentRequest=null);}},{key:"clearTmpEvents",value:function(){this.tmpEvents.forEach((function(e){return e.un()}));}},{key:"empty",value:function(){this.backend.isPaused()||(this.stop(),this.backend.disconnectSource()),this.isReady=!1,this.cancelAjax(),this.clearTmpEvents(),this.drawer.progress(0),this.drawer.setWidth(0),this.drawer.drawPeaks({length:this.drawer.getWidth()},0);}},{key:"destroy",value:function(){this.destroyAllPlugins(),this.fireEvent("destroy"),this.cancelAjax(),this.clearTmpEvents(),this.unAll(),!1!==this.params.responsive&&(window.removeEventListener("resize",this._onResize,!0),window.removeEventListener("orientationchange",this._onResize,!0)),this.backend&&(this.backend.destroy(),this.backend=null),this.drawer&&this.drawer.destroy(),this.isDestroyed=!0,this.isReady=!1,this.arraybuffer=null;}}],[{key:"create",value:function(e){return new r(e).init()}}]),r}(i.Observer);t.default=k,k.VERSION="5.0.1",k.util=i,e.exports=t.default;},379:(e,t,r)=>{function n(e){return (n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var i=function(e,t){if(!t&&e&&e.__esModule)return e;if(null===e||"object"!==n(e)&&"function"!=typeof e)return {default:e};var r=a(t);if(r&&r.has(e))return r.get(e);var i={},s=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var o in e)if("default"!==o&&Object.prototype.hasOwnProperty.call(e,o)){var u=s?Object.getOwnPropertyDescriptor(e,o):null;u&&(u.get||u.set)?Object.defineProperty(i,o,u):i[o]=e[o];}return i.default=e,r&&r.set(e,i),i}(r(241));function a(e){if("function"!=typeof WeakMap)return null;var t=new WeakMap,r=new WeakMap;return (a=function(e){return e?r:t})(e)}function s(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n);}}function u(e,t){return (u=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function l(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return !1;if(Reflect.construct.sham)return !1;if("function"==typeof Proxy)return !0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return !1}}();return function(){var r,n=f(e);if(t){var i=f(this).constructor;r=Reflect.construct(n,arguments,i);}else r=n.apply(this,arguments);return c(this,r)}}function c(e,t){return !t||"object"!==n(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function f(e){return (f=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}var h="playing",d="paused",p="finished",v=function(e){!function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&u(e,t);}(a,e);var t,r,i=l(a);function a(e){var t,r,n;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,a),(n=i.call(this)).audioContext=null,n.offlineAudioContext=null,n.stateBehaviors=(s(t={},h,{init:function(){this.addOnAudioProcess();},getPlayedPercents:function(){var e=this.getDuration();return this.getCurrentTime()/e||0},getCurrentTime:function(){return this.startPosition+this.getPlayedTime()}}),s(t,d,{init:function(){this.removeOnAudioProcess();},getPlayedPercents:function(){var e=this.getDuration();return this.getCurrentTime()/e||0},getCurrentTime:function(){return this.startPosition}}),s(t,p,{init:function(){this.removeOnAudioProcess(),this.fireEvent("finish");},getPlayedPercents:function(){return 1},getCurrentTime:function(){return this.getDuration()}}),t),n.params=e,n.ac=e.audioContext||(n.supportsWebAudio()?n.getAudioContext():{}),n.lastPlay=n.ac.currentTime,n.startPosition=0,n.scheduledPause=null,n.states=(s(r={},h,Object.create(n.stateBehaviors.playing)),s(r,d,Object.create(n.stateBehaviors.paused)),s(r,p,Object.create(n.stateBehaviors.finished)),r),n.buffer=null,n.filters=[],n.gainNode=null,n.mergedPeaks=null,n.offlineAc=null,n.peaks=null,n.playbackRate=1,n.analyser=null,n.scriptNode=null,n.source=null,n.splitPeaks=[],n.state=null,n.explicitDuration=e.duration,n.destroyed=!1,n}return t=a,(r=[{key:"supportsWebAudio",value:function(){return !(!window.AudioContext&&!window.webkitAudioContext)}},{key:"getAudioContext",value:function(){return window.WaveSurferAudioContext||(window.WaveSurferAudioContext=new(window.AudioContext||window.webkitAudioContext)),window.WaveSurferAudioContext}},{key:"getOfflineAudioContext",value:function(e){return window.WaveSurferOfflineAudioContext||(window.WaveSurferOfflineAudioContext=new(window.OfflineAudioContext||window.webkitOfflineAudioContext)(1,2,e)),window.WaveSurferOfflineAudioContext}},{key:"init",value:function(){this.createVolumeNode(),this.createScriptNode(),this.createAnalyserNode(),this.setState(d),this.setPlaybackRate(this.params.audioRate),this.setLength(0);}},{key:"disconnectFilters",value:function(){this.filters&&(this.filters.forEach((function(e){e&&e.disconnect();})),this.filters=null,this.analyser.connect(this.gainNode));}},{key:"setState",value:function(e){this.state!==this.states[e]&&(this.state=this.states[e],this.state.init.call(this));}},{key:"setFilter",value:function(){for(var e=arguments.length,t=new Array(e),r=0;r<e;r++)t[r]=arguments[r];this.setFilters(t);}},{key:"setFilters",value:function(e){this.disconnectFilters(),e&&e.length&&(this.filters=e,this.analyser.disconnect(),e.reduce((function(e,t){return e.connect(t),t}),this.analyser).connect(this.gainNode));}},{key:"createScriptNode",value:function(){this.params.audioScriptProcessor?this.scriptNode=this.params.audioScriptProcessor:this.ac.createScriptProcessor?this.scriptNode=this.ac.createScriptProcessor(a.scriptBufferSize):this.scriptNode=this.ac.createJavaScriptNode(a.scriptBufferSize),this.scriptNode.connect(this.ac.destination);}},{key:"addOnAudioProcess",value:function(){var e=this;this.scriptNode.onaudioprocess=function(){var t=e.getCurrentTime();t>=e.getDuration()?(e.setState(p),e.fireEvent("pause")):t>=e.scheduledPause?e.pause():e.state===e.states.playing&&e.fireEvent("audioprocess",t);};}},{key:"removeOnAudioProcess",value:function(){this.scriptNode.onaudioprocess=null;}},{key:"createAnalyserNode",value:function(){this.analyser=this.ac.createAnalyser(),this.analyser.connect(this.gainNode);}},{key:"createVolumeNode",value:function(){this.ac.createGain?this.gainNode=this.ac.createGain():this.gainNode=this.ac.createGainNode(),this.gainNode.connect(this.ac.destination);}},{key:"setSinkId",value:function(e){if(e){var t=new window.Audio;if(!t.setSinkId)return Promise.reject(new Error("setSinkId is not supported in your browser"));t.autoplay=!0;var r=this.ac.createMediaStreamDestination();return this.gainNode.disconnect(),this.gainNode.connect(r),t.srcObject=r.stream,t.setSinkId(e)}return Promise.reject(new Error("Invalid deviceId: "+e))}},{key:"setVolume",value:function(e){this.gainNode.gain.setValueAtTime(e,this.ac.currentTime);}},{key:"getVolume",value:function(){return this.gainNode.gain.value}},{key:"decodeArrayBuffer",value:function(e,t,r){this.offlineAc||(this.offlineAc=this.getOfflineAudioContext(this.ac&&this.ac.sampleRate?this.ac.sampleRate:44100)),"webkitAudioContext"in window?this.offlineAc.decodeAudioData(e,(function(e){return t(e)}),r):this.offlineAc.decodeAudioData(e).then((function(e){return t(e)})).catch((function(e){return r(e)}));}},{key:"setPeaks",value:function(e,t){null!=t&&(this.explicitDuration=t),this.peaks=e;}},{key:"setLength",value:function(e){if(!this.mergedPeaks||e!=2*this.mergedPeaks.length-1+2){this.splitPeaks=[],this.mergedPeaks=[];var t,r=this.buffer?this.buffer.numberOfChannels:1;for(t=0;t<r;t++)this.splitPeaks[t]=[],this.splitPeaks[t][2*(e-1)]=0,this.splitPeaks[t][2*(e-1)+1]=0;this.mergedPeaks[2*(e-1)]=0,this.mergedPeaks[2*(e-1)+1]=0;}}},{key:"getPeaks",value:function(e,t,r){if(this.peaks)return this.peaks;if(!this.buffer)return [];if(t=t||0,r=r||e-1,this.setLength(e),!this.buffer)return this.params.splitChannels?this.splitPeaks:this.mergedPeaks;if(!this.buffer.length){var n=this.createBuffer(1,4096,this.sampleRate);this.buffer=n.buffer;}var i,a=this.buffer.length/e,s=~~(a/10)||1,o=this.buffer.numberOfChannels;for(i=0;i<o;i++){var u=this.splitPeaks[i],l=this.buffer.getChannelData(i),c=void 0;for(c=t;c<=r;c++){var f=~~(c*a),h=~~(f+a),d=l[f],p=d,v=void 0;for(v=f;v<h;v+=s){var y=l[v];y>p&&(p=y),y<d&&(d=y);}u[2*c]=p,u[2*c+1]=d,(0==i||p>this.mergedPeaks[2*c])&&(this.mergedPeaks[2*c]=p),(0==i||d<this.mergedPeaks[2*c+1])&&(this.mergedPeaks[2*c+1]=d);}}return this.params.splitChannels?this.splitPeaks:this.mergedPeaks}},{key:"getPlayedPercents",value:function(){return this.state.getPlayedPercents.call(this)}},{key:"disconnectSource",value:function(){this.source&&this.source.disconnect();}},{key:"destroyWebAudio",value:function(){this.disconnectFilters(),this.disconnectSource(),this.gainNode.disconnect(),this.scriptNode.disconnect(),this.analyser.disconnect(),this.params.closeAudioContext&&("function"==typeof this.ac.close&&"closed"!=this.ac.state&&this.ac.close(),this.ac=null,this.params.audioContext?this.params.audioContext=null:window.WaveSurferAudioContext=null,window.WaveSurferOfflineAudioContext=null);}},{key:"destroy",value:function(){this.isPaused()||this.pause(),this.unAll(),this.buffer=null,this.destroyed=!0,this.destroyWebAudio();}},{key:"load",value:function(e){this.startPosition=0,this.lastPlay=this.ac.currentTime,this.buffer=e,this.createSource();}},{key:"createSource",value:function(){this.disconnectSource(),this.source=this.ac.createBufferSource(),this.source.start=this.source.start||this.source.noteGrainOn,this.source.stop=this.source.stop||this.source.noteOff,this.setPlaybackRate(this.playbackRate),this.source.buffer=this.buffer,this.source.connect(this.analyser);}},{key:"resumeAudioContext",value:function(){"suspended"==this.ac.state&&this.ac.resume&&this.ac.resume();}},{key:"isPaused",value:function(){return this.state!==this.states.playing}},{key:"getDuration",value:function(){return this.explicitDuration?this.explicitDuration:this.buffer?this.buffer.duration:0}},{key:"seekTo",value:function(e,t){if(this.buffer)return this.scheduledPause=null,null==e&&(e=this.getCurrentTime())>=this.getDuration()&&(e=0),null==t&&(t=this.getDuration()),this.startPosition=e,this.lastPlay=this.ac.currentTime,this.state===this.states.finished&&this.setState(d),{start:e,end:t}}},{key:"getPlayedTime",value:function(){return (this.ac.currentTime-this.lastPlay)*this.playbackRate}},{key:"play",value:function(e,t){if(this.buffer){this.createSource();var r=this.seekTo(e,t);e=r.start,t=r.end,this.scheduledPause=t,this.source.start(0,e),this.resumeAudioContext(),this.setState(h),this.fireEvent("play");}}},{key:"pause",value:function(){this.scheduledPause=null,this.startPosition+=this.getPlayedTime(),this.source&&this.source.stop(0),this.setState(d),this.fireEvent("pause");}},{key:"getCurrentTime",value:function(){return this.state.getCurrentTime.call(this)}},{key:"getPlaybackRate",value:function(){return this.playbackRate}},{key:"setPlaybackRate",value:function(e){this.playbackRate=e||1,this.source&&this.source.playbackRate.setValueAtTime(this.playbackRate,this.ac.currentTime);}},{key:"setPlayEnd",value:function(e){this.scheduledPause=e;}}])&&o(t.prototype,r),a}(i.Observer);t.default=v,v.scriptBufferSize=256,e.exports=t.default;},296:e=>{function t(e,t,r){var n,i,a,s,o;function u(){var l=Date.now()-s;l<t&&l>=0?n=setTimeout(u,t-l):(n=null,r||(o=e.apply(a,i),a=i=null));}null==t&&(t=100);var l=function(){a=this,i=arguments,s=Date.now();var l=r&&!n;return n||(n=setTimeout(u,t)),l&&(o=e.apply(a,i),a=i=null),o};return l.clear=function(){n&&(clearTimeout(n),n=null);},l.flush=function(){n&&(o=e.apply(a,i),a=i=null,clearTimeout(n),n=null);},l}t.debounce=t,e.exports=t;}},t={},function r(n){var i=t[n];if(void 0!==i)return i.exports;var a=t[n]={exports:{}};return e[n](a,a.exports,r),a.exports}(631);var e,t;}));

    });

    var WaveSurfer = /*@__PURE__*/getDefaultExportFromCjs(wavesurfer_min);

    let waveformTransitionDuration = Number(getComputedStyle(document.body).getPropertyValue('--waveform-transition-duration').replace('ms', ''));
    let waveSurfer = undefined;
    function getNewWaveSurfer(color) {
        let waveSurfer = WaveSurfer.create({
            container: '#waveform-data',
            waveColor: 'transparent',
            cursorColor: 'transparent',
            progressColor: 'transparent',
            normalize: true,
            responsive: true,
            hideScrollbar: true,
            barWidth: 1,
            barGap: null,
            barMinHeight: 1 / 3
        });
        waveSurfer.setWaveColor(color);
        waveSurfer.setHeight(64);
        return waveSurfer;
    }
    async function setWaveSource(sourceFile, albumId, duration) {
        let peaks = await getPeaksIPC(sourceFile);
        let color = await getAlbumColors(albumId);
        document.documentElement.style.setProperty('--waveform-opacity', '0');
        setTimeout(() => {
            if (waveSurfer !== undefined) {
                waveSurfer.empty();
                waveSurfer.destroy();
                waveSurfer.unAll();
                waveSurfer = undefined;
            }
            waveSurfer = getNewWaveSurfer(`hsl(${color.hue},${color.saturation}%,${color.lightnessLow}%)`);
            waveSurfer.load(escapeString(sourceFile), peaks, undefined, duration);
            if (peaks) {
                document.documentElement.style.setProperty('--waveform-opacity', '1');
            }
            else {
                waveSurfer.on('redraw', () => {
                    console.log('Redrawing');
                    document.documentElement.style.setProperty('--waveform-opacity', '1');
                    waveSurfer.exportPCM(512, undefined, true, undefined).then((newPeaks) => {
                        savePeaksIPC(sourceFile, newPeaks);
                    });
                });
            }
        }, waveformTransitionDuration);
    }

    /* src/includes/Player.svelte generated by Svelte v3.38.3 */

    const { console: console_1$2 } = globals;
    const file$9 = "src/includes/Player.svelte";

    function create_fragment$b(ctx) {
    	let audio;
    	let track;
    	let t0;
    	let player_svlt;
    	let player_buttons;
    	let previousbutton;
    	let t1;
    	let playbutton;
    	let t2;
    	let nextbutton;
    	let t3;
    	let playervolumebar;
    	let t4;
    	let song_duration;
    	let t5_value = /*songTime*/ ctx[2].currentTime + "";
    	let t5;
    	let t6;
    	let t7_value = /*songTime*/ ctx[2].duration + "";
    	let t7;
    	let t8;
    	let playerprogress;
    	let t9;
    	let song_time_left;
    	let t10;
    	let t11_value = /*songTime*/ ctx[2].timeLeft + "";
    	let t11;
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
    			audio = element("audio");
    			track = element("track");
    			t0 = space();
    			player_svlt = element("player-svlt");
    			player_buttons = element("player-buttons");
    			create_component(previousbutton.$$.fragment);
    			t1 = space();
    			create_component(playbutton.$$.fragment);
    			t2 = space();
    			create_component(nextbutton.$$.fragment);
    			t3 = space();
    			create_component(playervolumebar.$$.fragment);
    			t4 = space();
    			song_duration = element("song-duration");
    			t5 = text(t5_value);
    			t6 = text("/");
    			t7 = text(t7_value);
    			t8 = space();
    			create_component(playerprogress.$$.fragment);
    			t9 = space();
    			song_time_left = element("song-time-left");
    			t10 = text("-");
    			t11 = text(t11_value);
    			attr_dev(track, "kind", "captions");
    			add_location(track, file$9, 166, 1, 6655);
    			audio.controls = true;
    			attr_dev(audio, "class", "svelte-72an4d");
    			add_location(audio, file$9, 165, 0, 6538);
    			set_custom_element_data(player_buttons, "class", "svelte-72an4d");
    			add_location(player_buttons, file$9, 170, 1, 6706);
    			set_custom_element_data(song_duration, "class", "song-time svelte-72an4d");
    			add_location(song_duration, file$9, 178, 1, 6848);
    			set_custom_element_data(song_time_left, "class", "song-time svelte-72an4d");
    			add_location(song_time_left, file$9, 184, 1, 6996);
    			set_custom_element_data(player_svlt, "class", "svelte-72an4d");
    			add_location(player_svlt, file$9, 169, 0, 6691);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, audio, anchor);
    			append_dev(audio, track);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, player_svlt, anchor);
    			append_dev(player_svlt, player_buttons);
    			mount_component(previousbutton, player_buttons, null);
    			append_dev(player_buttons, t1);
    			mount_component(playbutton, player_buttons, null);
    			append_dev(player_buttons, t2);
    			mount_component(nextbutton, player_buttons, null);
    			append_dev(player_svlt, t3);
    			mount_component(playervolumebar, player_svlt, null);
    			append_dev(player_svlt, t4);
    			append_dev(player_svlt, song_duration);
    			append_dev(song_duration, t5);
    			append_dev(song_duration, t6);
    			append_dev(song_duration, t7);
    			append_dev(player_svlt, t8);
    			mount_component(playerprogress, player_svlt, null);
    			append_dev(player_svlt, t9);
    			append_dev(player_svlt, song_time_left);
    			append_dev(song_time_left, t10);
    			append_dev(song_time_left, t11);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(audio, "play", /*play_handler*/ ctx[7], false, false, false),
    					listen_dev(audio, "pause", /*pause_handler*/ ctx[8], false, false, false),
    					listen_dev(audio, "ended", /*ended_handler*/ ctx[9], false, false, false)
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
    			if ((!current || dirty & /*songTime*/ 4) && t5_value !== (t5_value = /*songTime*/ ctx[2].currentTime + "")) set_data_dev(t5, t5_value);
    			if ((!current || dirty & /*songTime*/ 4) && t7_value !== (t7_value = /*songTime*/ ctx[2].duration + "")) set_data_dev(t7, t7_value);
    			const playerprogress_changes = {};
    			if (dirty & /*player*/ 2) playerprogress_changes.player = /*player*/ ctx[1];
    			if (dirty & /*currentSong*/ 1) playerprogress_changes.song = /*currentSong*/ ctx[0];
    			playerprogress.$set(playerprogress_changes);
    			if ((!current || dirty & /*songTime*/ 4) && t11_value !== (t11_value = /*songTime*/ ctx[2].timeLeft + "")) set_data_dev(t11, t11_value);
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
    			if (detaching) detach_dev(audio);
    			if (detaching) detach_dev(t0);
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
    		id: create_fragment$b.name,
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

    function instance$b($$self, $$props, $$invalidate) {
    	let $playbackCursor;
    	let $updateSongProgress;
    	let $playbackStore;
    	let $isPlaying;
    	let $albumPlayingIdStore;
    	let $songPlayingIdStore;
    	validate_store(playbackCursor, "playbackCursor");
    	component_subscribe($$self, playbackCursor, $$value => $$invalidate(5, $playbackCursor = $$value));
    	validate_store(updateSongProgress, "updateSongProgress");
    	component_subscribe($$self, updateSongProgress, $$value => $$invalidate(6, $updateSongProgress = $$value));
    	validate_store(playbackStore, "playbackStore");
    	component_subscribe($$self, playbackStore, $$value => $$invalidate(14, $playbackStore = $$value));
    	validate_store(isPlaying, "isPlaying");
    	component_subscribe($$self, isPlaying, $$value => $$invalidate(15, $isPlaying = $$value));
    	validate_store(albumPlayingIdStore, "albumPlayingIdStore");
    	component_subscribe($$self, albumPlayingIdStore, $$value => $$invalidate(16, $albumPlayingIdStore = $$value));
    	validate_store(songPlayingIdStore, "songPlayingIdStore");
    	component_subscribe($$self, songPlayingIdStore, $$value => $$invalidate(17, $songPlayingIdStore = $$value));
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

    	let songTime = {
    		currentTime: "00:00",
    		duration: "00:00",
    		timeLeft: "00:00"
    	};

    	let preLoadNextSongDebounce = undefined;

    	function playSong(playbackCursor) {
    		return __awaiter(this, void 0, void 0, function* () {
    			let indexToPlay = playbackCursor[0];
    			let doPlayNow = playbackCursor[1];
    			let songs = $playbackStore;
    			let songToPlay = songs[indexToPlay];
    			let url = undefined;
    			if (songToPlay === undefined) return;

    			if ((songToPlay === null || songToPlay === void 0
    			? void 0
    			: songToPlay.ID) === (nextSongPreloaded === null || nextSongPreloaded === void 0
    			? void 0
    			: nextSongPreloaded.Id)) {
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

    			$$invalidate(2, songTime = {
    				currentTime: parseDuration(0),
    				duration: parseDuration(songToPlay["Duration"]),
    				timeLeft: parseDuration(songToPlay["Duration"] - 0)
    			});

    			setWaveSource(songToPlay.SourceFile, $albumPlayingIdStore, songToPlay.Duration);

    			if (doPlayNow === true) {
    				player.play().then(() => {
    					set_store_value(songPlayingIdStore, $songPlayingIdStore = songToPlay.ID, $songPlayingIdStore);
    					localStorage.setItem("LastPlayedAlbumId", $albumPlayingIdStore);
    					localStorage.setItem("LastPlayedSongId", String(songToPlay.ID));
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
    					Id: songToPlay.ID,
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

    				$$invalidate(2, songTime = {
    					currentTime: parseDuration(player.currentTime),
    					duration: parseDuration(currentSong["Duration"]),
    					timeLeft: parseDuration(currentSong["Duration"] - player.currentTime)
    				});
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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<Player> was created with unknown prop '${key}'`);
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
    		songPlayingIdStore,
    		updateSongProgress,
    		nextSong,
    		escapeString,
    		albumPlayingIdStore,
    		playbackCursor,
    		playbackStore,
    		parseDuration,
    		setWaveSource,
    		streamAudio,
    		progress,
    		currentSong,
    		nextSongPreloaded,
    		player,
    		playingInterval,
    		songTime,
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
    		$updateSongProgress,
    		$playbackStore,
    		$isPlaying,
    		$albumPlayingIdStore,
    		$songPlayingIdStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("progress" in $$props) progress = $$props.progress;
    		if ("currentSong" in $$props) $$invalidate(0, currentSong = $$props.currentSong);
    		if ("nextSongPreloaded" in $$props) nextSongPreloaded = $$props.nextSongPreloaded;
    		if ("player" in $$props) $$invalidate(1, player = $$props.player);
    		if ("playingInterval" in $$props) playingInterval = $$props.playingInterval;
    		if ("songTime" in $$props) $$invalidate(2, songTime = $$props.songTime);
    		if ("preLoadNextSongDebounce" in $$props) preLoadNextSongDebounce = $$props.preLoadNextSongDebounce;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$playbackCursor*/ 32) {
    			playSong($playbackCursor);
    		}

    		if ($$self.$$.dirty & /*$updateSongProgress, currentSong*/ 65) {
    			{
    				// Updates the song time based of the user seeking in the player progress component.
    				if ($updateSongProgress !== -1) {
    					$$invalidate(2, songTime = {
    						currentTime: parseDuration($updateSongProgress),
    						duration: parseDuration(currentSong["Duration"]),
    						timeLeft: parseDuration(currentSong["Duration"] - $updateSongProgress)
    					});
    				}
    			}
    		}
    	};

    	return [
    		currentSong,
    		player,
    		songTime,
    		startInterval,
    		stopInterval,
    		$playbackCursor,
    		$updateSongProgress,
    		play_handler,
    		pause_handler,
    		ended_handler
    	];
    }

    class Player extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Player",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/components/Star.svelte generated by Svelte v3.38.3 */
    const file$8 = "src/components/Star.svelte";

    function create_fragment$a(ctx) {
    	let stars;
    	let img0;
    	let img0_class_value;
    	let img0_src_value;
    	let t0;
    	let img1;
    	let img1_class_value;
    	let img1_src_value;
    	let stars_class_value;
    	let t1;
    	let button;
    	let t2;
    	let img2;
    	let img2_src_value;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			stars = element("stars");
    			img0 = element("img");
    			t0 = space();
    			img1 = element("img");
    			t1 = space();
    			button = element("button");
    			t2 = text("Undo Rating ");
    			img2 = element("img");
    			attr_dev(img0, "class", img0_class_value = "delete-star " + /*klass*/ ctx[0] + " svelte-1rcb0e4");
    			if (img0.src !== (img0_src_value = "./img/star/star-delete.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			add_location(img0, file$8, 37, 1, 1180);
    			attr_dev(img1, "class", img1_class_value = "star " + /*klass*/ ctx[0] + " svelte-1rcb0e4");
    			if (img1.src !== (img1_src_value = "./img/star/star-" + /*starRating*/ ctx[2] + ".svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$8, 51, 1, 1627);
    			attr_dev(stars, "class", stars_class_value = "" + (null_to_empty(/*klass*/ ctx[0]) + " svelte-1rcb0e4"));
    			add_location(stars, file$8, 36, 0, 1090);
    			attr_dev(img2, "class", "undoIcon svelte-1rcb0e4");
    			if (img2.src !== (img2_src_value = "./img/undo-arrow-svgrepo-com.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "");
    			add_location(img2, file$8, 66, 16, 1999);
    			attr_dev(button, "class", button_class_value = "" + (/*klass*/ ctx[0] + " " + (/*showUndo*/ ctx[1] ? "show-undo" : "") + " svelte-1rcb0e4"));
    			add_location(button, file$8, 61, 0, 1863);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, stars, anchor);
    			append_dev(stars, img0);
    			append_dev(stars, t0);
    			append_dev(stars, img1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button, anchor);
    			append_dev(button, t2);
    			append_dev(button, img2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(img0, "click", /*click_handler*/ ctx[8], false, false, false),
    					listen_dev(img1, "mouseleave", /*mouseleave_handler*/ ctx[9], false, false, false),
    					listen_dev(img1, "click", /*click_handler_1*/ ctx[10], false, false, false),
    					listen_dev(img1, "mousemove", /*mousemove_handler*/ ctx[11], false, false, false),
    					listen_dev(
    						stars,
    						"click",
    						function () {
    							if (is_function(/*dispatch*/ ctx[4]("starChange", { starRating: /*starRating*/ ctx[2] * 10 }))) /*dispatch*/ ctx[4]("starChange", { starRating: /*starRating*/ ctx[2] * 10 }).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(button, "click", /*click_handler_2*/ ctx[12], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*klass*/ 1 && img0_class_value !== (img0_class_value = "delete-star " + /*klass*/ ctx[0] + " svelte-1rcb0e4")) {
    				attr_dev(img0, "class", img0_class_value);
    			}

    			if (dirty & /*klass*/ 1 && img1_class_value !== (img1_class_value = "star " + /*klass*/ ctx[0] + " svelte-1rcb0e4")) {
    				attr_dev(img1, "class", img1_class_value);
    			}

    			if (dirty & /*starRating*/ 4 && img1.src !== (img1_src_value = "./img/star/star-" + /*starRating*/ ctx[2] + ".svg")) {
    				attr_dev(img1, "src", img1_src_value);
    			}

    			if (dirty & /*klass*/ 1 && stars_class_value !== (stars_class_value = "" + (null_to_empty(/*klass*/ ctx[0]) + " svelte-1rcb0e4"))) {
    				attr_dev(stars, "class", stars_class_value);
    			}

    			if (dirty & /*klass, showUndo*/ 3 && button_class_value !== (button_class_value = "" + (/*klass*/ ctx[0] + " " + (/*showUndo*/ ctx[1] ? "show-undo" : "") + " svelte-1rcb0e4"))) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(stars);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button);
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

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Star", slots, []);
    	const dispatch = createEventDispatcher();
    	let { songRating = 0 } = $$props;
    	let { hook } = $$props;
    	let { klass = "" } = $$props;
    	let { showUndo = false } = $$props;
    	let starRating = 0;
    	let starRatingTemp = 0; // Keeps track of the user selected rating.
    	let starElementWidth = undefined;

    	function convertRating(fnSongRating) {
    		// Converts 0-100 Rating to 0-10
    		if (fnSongRating && fnSongRating !== 0) {
    			$$invalidate(2, starRating = fnSongRating / 10);
    		} else {
    			$$invalidate(2, starRating = 0);
    		}

    		$$invalidate(3, starRatingTemp = starRating);
    	}

    	function setStarRating(e) {
    		if (!starElementWidth) {
    			starElementWidth = document.querySelector(`${hook} img.star`).scrollWidth;
    		}

    		// Gets a value from 0 to 10 based on the percentage of the cursor position on star element.
    		let starValue = Math.trunc(100 / starElementWidth * e.offsetX / (100 / 10)) + 1;

    		if (starValue <= 1) {
    			starValue = 1;
    		} else if (starValue >= 10) {
    			starValue = 10;
    		}

    		$$invalidate(2, starRating = starValue);
    	}

    	const writable_props = ["songRating", "hook", "klass", "showUndo"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Star> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(2, starRating = 0);
    		$$invalidate(3, starRatingTemp = 0);
    	};

    	const mouseleave_handler = () => $$invalidate(2, starRating = starRatingTemp);
    	const click_handler_1 = () => $$invalidate(3, starRatingTemp = starRating);
    	const mousemove_handler = e => setStarRating(e);

    	const click_handler_2 = () => {
    		$$invalidate(3, starRatingTemp = 0);
    		dispatch("undoChange");
    	};

    	$$self.$$set = $$props => {
    		if ("songRating" in $$props) $$invalidate(6, songRating = $$props.songRating);
    		if ("hook" in $$props) $$invalidate(7, hook = $$props.hook);
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("showUndo" in $$props) $$invalidate(1, showUndo = $$props.showUndo);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		songRating,
    		hook,
    		klass,
    		showUndo,
    		starRating,
    		starRatingTemp,
    		starElementWidth,
    		convertRating,
    		setStarRating
    	});

    	$$self.$inject_state = $$props => {
    		if ("songRating" in $$props) $$invalidate(6, songRating = $$props.songRating);
    		if ("hook" in $$props) $$invalidate(7, hook = $$props.hook);
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("showUndo" in $$props) $$invalidate(1, showUndo = $$props.showUndo);
    		if ("starRating" in $$props) $$invalidate(2, starRating = $$props.starRating);
    		if ("starRatingTemp" in $$props) $$invalidate(3, starRatingTemp = $$props.starRatingTemp);
    		if ("starElementWidth" in $$props) starElementWidth = $$props.starElementWidth;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*songRating*/ 64) {
    			convertRating(songRating);
    		}
    	};

    	return [
    		klass,
    		showUndo,
    		starRating,
    		starRatingTemp,
    		dispatch,
    		setStarRating,
    		songRating,
    		hook,
    		click_handler,
    		mouseleave_handler,
    		click_handler_1,
    		mousemove_handler,
    		click_handler_2
    	];
    }

    class Star extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			songRating: 6,
    			hook: 7,
    			klass: 0,
    			showUndo: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Star",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*hook*/ ctx[7] === undefined && !("hook" in props)) {
    			console.warn("<Star> was created without expected prop 'hook'");
    		}
    	}

    	get songRating() {
    		throw new Error("<Star>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set songRating(value) {
    		throw new Error("<Star>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hook() {
    		throw new Error("<Star>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hook(value) {
    		throw new Error("<Star>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get klass() {
    		throw new Error("<Star>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set klass(value) {
    		throw new Error("<Star>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showUndo() {
    		throw new Error("<Star>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showUndo(value) {
    		throw new Error("<Star>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/SongListItem.svelte generated by Svelte v3.38.3 */
    const file$7 = "src/components/SongListItem.svelte";

    function create_fragment$9(ctx) {
    	let song_list_item;
    	let song_number;
    	let t0_value = /*song*/ ctx[0].Track + "";
    	let t0;
    	let t1;
    	let song_title;
    	let t2_value = /*song*/ ctx[0].Title + "";
    	let t2;
    	let t3;
    	let song_artist;

    	let t4_value = (/*song*/ ctx[0].DynamicArtists !== undefined
    	? /*song*/ ctx[0].DynamicArtists
    	: "") + "";

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
    			props: {
    				songRating: /*song*/ ctx[0].Rating,
    				hook: "song-list-item"
    			},
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
    			song_artist = element("song-artist");
    			t4 = text(t4_value);
    			t5 = space();
    			create_component(star.$$.fragment);
    			t6 = space();
    			song_duration = element("song-duration");
    			t7 = text(t7_value);
    			set_custom_element_data(song_number, "class", "svelte-la5jpg");
    			add_location(song_number, file$7, 43, 1, 1431);
    			set_custom_element_data(song_title, "class", "svelte-la5jpg");
    			add_location(song_title, file$7, 44, 1, 1472);
    			set_custom_element_data(song_artist, "class", "svelte-la5jpg");
    			add_location(song_artist, file$7, 45, 1, 1511);
    			set_custom_element_data(song_duration, "class", "svelte-la5jpg");
    			add_location(song_duration, file$7, 47, 1, 1683);
    			set_custom_element_data(song_list_item, "id", song_list_item_id_value = /*song*/ ctx[0].ID);
    			set_custom_element_data(song_list_item, "index", /*index*/ ctx[1]);

    			set_custom_element_data(song_list_item, "class", song_list_item_class_value = "\n\t" + (/*$songPlayingIdStore*/ ctx[2] === /*song*/ ctx[0].ID && /*$selectedAlbumId*/ ctx[3] === /*$albumPlayingIdStore*/ ctx[4]
    			? "playing"
    			: "") + "\n\t" + (/*$selectedSongsStore*/ ctx[5].includes(/*song*/ ctx[0].ID)
    			? "selected"
    			: "") + " svelte-la5jpg");

    			add_location(song_list_item, file$7, 36, 0, 1223);
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
    			append_dev(song_list_item, song_artist);
    			append_dev(song_artist, t4);
    			append_dev(song_list_item, t5);
    			mount_component(star, song_list_item, null);
    			append_dev(song_list_item, t6);
    			append_dev(song_list_item, song_duration);
    			append_dev(song_duration, t7);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*song*/ 1) && t0_value !== (t0_value = /*song*/ ctx[0].Track + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*song*/ 1) && t2_value !== (t2_value = /*song*/ ctx[0].Title + "")) set_data_dev(t2, t2_value);

    			if ((!current || dirty & /*song*/ 1) && t4_value !== (t4_value = (/*song*/ ctx[0].DynamicArtists !== undefined
    			? /*song*/ ctx[0].DynamicArtists
    			: "") + "")) set_data_dev(t4, t4_value);

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

    			if (!current || dirty & /*$songPlayingIdStore, song, $selectedAlbumId, $albumPlayingIdStore, $selectedSongsStore*/ 61 && song_list_item_class_value !== (song_list_item_class_value = "\n\t" + (/*$songPlayingIdStore*/ ctx[2] === /*song*/ ctx[0].ID && /*$selectedAlbumId*/ ctx[3] === /*$albumPlayingIdStore*/ ctx[4]
    			? "playing"
    			: "") + "\n\t" + (/*$selectedSongsStore*/ ctx[5].includes(/*song*/ ctx[0].ID)
    			? "selected"
    			: "") + " svelte-la5jpg")) {
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
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $songPlayingIdStore;
    	let $selectedAlbumId;
    	let $albumPlayingIdStore;
    	let $selectedSongsStore;
    	validate_store(songPlayingIdStore, "songPlayingIdStore");
    	component_subscribe($$self, songPlayingIdStore, $$value => $$invalidate(2, $songPlayingIdStore = $$value));
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
    		let lastPlayedSongId = Number(localStorage.getItem("LastPlayedSongId"));
    		set_store_value(songPlayingIdStore, $songPlayingIdStore = lastPlayedSongId, $songPlayingIdStore);

    		if (lastPlayedSongId === song.ID) {
    			let songEl = document.querySelector(`#${CSS.escape(String(lastPlayedSongId))}`);

    			if (songEl) {
    				songEl.scrollIntoView({ block: "center" });
    			}
    		}
    	});

    	function setDynamicArtists() {
    		let splitArtists = song.Artist.split("//").filter(artist => !song.AlbumArtist.includes(artist));

    		if (splitArtists.length > 0) {
    			$$invalidate(0, song.DynamicArtists = `(feat. ${splitArtists.join("//")})`, song);
    		}
    	}

    	function setStar(starChangeEvent) {
    		// console.log(song.SourceFile, starChangeEvent.detail.starRating)
    		editTagsIPC([song.SourceFile], {
    			Rating: starChangeEvent.detail.starRating
    		});
    	}

    	const writable_props = ["song", "index"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SongListItem> was created with unknown prop '${key}'`);
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
    		songPlayingIdStore,
    		Star,
    		parseDuration,
    		editTagsIPC,
    		song,
    		index,
    		setDynamicArtists,
    		setStar,
    		$songPlayingIdStore,
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

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*song*/ 1) {
    			{
    				setDynamicArtists();
    			}
    		}
    	};

    	return [
    		song,
    		index,
    		$songPlayingIdStore,
    		$selectedAlbumId,
    		$albumPlayingIdStore,
    		$selectedSongsStore,
    		setStar
    	];
    }

    class SongListItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { song: 0, index: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SongListItem",
    			options,
    			id: create_fragment$9.name
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

    /* src/includes/SongList.svelte generated by Svelte v3.38.3 */

    const file$6 = "src/includes/SongList.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i];
    	child_ctx[22] = i;
    	return child_ctx;
    }

    // (176:2) {#if $songListStore !== undefined}
    function create_if_block$1(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = /*songsTrimmed*/ ctx[1];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*song*/ ctx[20].ID;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
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
    				each_value = /*songsTrimmed*/ ctx[1];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block, each_1_anchor, get_each_context);
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
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(176:2) {#if $songListStore !== undefined}",
    		ctx
    	});

    	return block;
    }

    // (177:3) {#each songsTrimmed as song, index (song.ID)}
    function create_each_block(key_1, ctx) {
    	let first;
    	let songlistitem;
    	let current;

    	songlistitem = new SongListItem({
    			props: {
    				song: /*song*/ ctx[20],
    				index: /*index*/ ctx[22]
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
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const songlistitem_changes = {};
    			if (dirty & /*songsTrimmed*/ 2) songlistitem_changes.song = /*song*/ ctx[20];
    			if (dirty & /*songsTrimmed*/ 2) songlistitem_changes.index = /*index*/ ctx[22];
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
    		id: create_each_block.name,
    		type: "each",
    		source: "(177:3) {#each songsTrimmed as song, index (song.ID)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let song_list_svlt;
    	let song_list;
    	let t;
    	let song_list_progress_bar;
    	let progress_fill;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*$songListStore*/ ctx[0] !== undefined && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			song_list_svlt = element("song-list-svlt");
    			song_list = element("song-list");
    			if (if_block) if_block.c();
    			t = space();
    			song_list_progress_bar = element("song-list-progress-bar");
    			progress_fill = element("progress-fill");
    			set_custom_element_data(song_list, "class", "svelte-1q4ucqn");
    			add_location(song_list, file$6, 174, 1, 7733);
    			set_custom_element_data(progress_fill, "class", "svelte-1q4ucqn");
    			add_location(progress_fill, file$6, 182, 2, 7928);
    			set_custom_element_data(song_list_progress_bar, "class", "svelte-1q4ucqn");
    			add_location(song_list_progress_bar, file$6, 181, 1, 7901);
    			set_custom_element_data(song_list_svlt, "class", "svelte-1q4ucqn");
    			add_location(song_list_svlt, file$6, 173, 0, 7640);
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
    					if_block = create_if_block$1(ctx);
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
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const SONG_AMOUNT = 8;

    function isValidPath(event, validPaths) {
    	return event.composedPath().map(path => path.tagName).find(tag => validPaths.includes(tag)); // Return back an array of all elements clicked.
    	// Gives only the tag name of the elements.
    	// If the tag name matches the array of valid values.
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $songListStore;
    	let $selectedAlbumId;
    	let $selectedSongsStore;
    	validate_store(songListStore, "songListStore");
    	component_subscribe($$self, songListStore, $$value => $$invalidate(0, $songListStore = $$value));
    	validate_store(selectedAlbumId, "selectedAlbumId");
    	component_subscribe($$self, selectedAlbumId, $$value => $$invalidate(7, $selectedAlbumId = $$value));
    	validate_store(selectedSongsStore, "selectedSongsStore");
    	component_subscribe($$self, selectedSongsStore, $$value => $$invalidate(14, $selectedSongsStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SongList", slots, []);
    	let isSelectedAlbumIdFirstAssign = true;
    	let songsTrimmed = [];
    	let scrollAmount = 0;
    	let progressValue = 0;

    	// Keeps track of the max size of the song list element.
    	let maxSongListHeight = 0;

    	let previousScrollAmount = -1;

    	function trimSongsArray() {
    		if ($songListStore.length > 0 && previousScrollAmount !== scrollAmount) {
    			previousScrollAmount = scrollAmount;

    			// 1º Slice: Slice array from scrollAmount to end. Cuts from array songs already scrolled.
    			// 2º Slice: Keep songs from 0 to the set amount.
    			$$invalidate(1, songsTrimmed = $songListStore.slice(scrollAmount).slice(0, SONG_AMOUNT));

    			setProgress();
    		}
    	}

    	let lastSelectedSong = 0;

    	function selectSongs(e) {
    		let { ctrlKey, metaKey, shiftKey } = e;

    		e["path"].forEach(element => {
    			if (element.tagName === "SONG-LIST-ITEM") {
    				let id = Number(element.getAttribute("id"));
    				let currentSelectedSong = $songListStore.findIndex(song => song.ID === Number(element.getAttribute("id")));

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
    						let currentId = $songListStore[i].ID;

    						if (!$selectedSongsStore.find(i => i === currentId)) {
    							$selectedSongsStore.push(currentId);
    						}
    					}
    				}

    				lastSelectedSong = currentSelectedSong;
    				selectedSongsStore.set($selectedSongsStore);
    			}
    		});
    	}

    	function scrollContainer(e) {
    		$$invalidate(5, scrollAmount = scrollAmount + Math.sign(e.deltaY));

    		// Stops scrolling beyond arrays end and always keeps one element visible.
    		if (scrollAmount >= $songListStore.length - 1) {
    			$$invalidate(5, scrollAmount = $songListStore.length - 1);
    		} else if (scrollAmount < 0) {
    			$$invalidate(5, scrollAmount = 0);
    		}
    	}

    	function setProgress() {
    		progressValue = 100 / ($songListStore.length - 1) * scrollAmount | 0;
    		document.documentElement.style.setProperty("--progress-bar-fill", `${progressValue}%`);
    	}

    	let isMouseDownInScroll = false;

    	onMount(() => {
    		// Set an approximate value on how high would the song list container be to prevent
    		document.documentElement.style.setProperty("--song-list-svlt-height", `${SONG_AMOUNT * 30}px`);

    		scrollBarHandler();
    		let lastPlayedSongId = Number(localStorage.getItem("LastPlayedSongId"));

    		setTimeout(
    			() => {
    				setScrollAmountFromSong(lastPlayedSongId);
    			},
    			250
    		);
    	});

    	// Manages to "scroll" to the proper song on demand.
    	function setScrollAmountFromSong(lastPlayedSongId) {
    		let songIndex = $songListStore.findIndex(song => song.ID === lastPlayedSongId);
    		let differenceAmount = Math.floor(SONG_AMOUNT / 2);

    		if (songIndex !== -1) {
    			if (songIndex < differenceAmount) {
    				$$invalidate(5, scrollAmount = 0);
    			} else {
    				$$invalidate(5, scrollAmount = songIndex - differenceAmount);
    			}
    		}
    	}

    	// Sets the proper scrollAmount based of the percentage (in distance) of the bar clicked. 0% = top and 100% = bottom.
    	function setScrollAmount(songListProgressBar, e) {
    		let percentClick = 100 / songListProgressBar.clientHeight * e.offsetY;
    		$$invalidate(5, scrollAmount = $songListStore.length / 100 * percentClick);
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

    				// Sets the scrollAmount value with the newly calculated one.
    				$$invalidate(5, scrollAmount = ($songListStore.length - 1) / 100 * percentage);
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

    		// If the user click on the scrollbar, calls setScrollAmount.
    		songListProgressBar.addEventListener("click", evt => setScrollAmount(songListProgressBar, evt));
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
    		scrollAmount,
    		progressValue,
    		SONG_AMOUNT,
    		maxSongListHeight,
    		previousScrollAmount,
    		trimSongsArray,
    		lastSelectedSong,
    		selectSongs,
    		scrollContainer,
    		setProgress,
    		isMouseDownInScroll,
    		setScrollAmountFromSong,
    		setScrollAmount,
    		isValidPath,
    		scrollBarHandler,
    		$songListStore,
    		$selectedAlbumId,
    		$selectedSongsStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("isSelectedAlbumIdFirstAssign" in $$props) $$invalidate(4, isSelectedAlbumIdFirstAssign = $$props.isSelectedAlbumIdFirstAssign);
    		if ("songsTrimmed" in $$props) $$invalidate(1, songsTrimmed = $$props.songsTrimmed);
    		if ("scrollAmount" in $$props) $$invalidate(5, scrollAmount = $$props.scrollAmount);
    		if ("progressValue" in $$props) progressValue = $$props.progressValue;
    		if ("maxSongListHeight" in $$props) $$invalidate(6, maxSongListHeight = $$props.maxSongListHeight);
    		if ("previousScrollAmount" in $$props) previousScrollAmount = $$props.previousScrollAmount;
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
    					$$invalidate(5, scrollAmount = 0);
    					previousScrollAmount = -1;
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*scrollAmount, $songListStore, maxSongListHeight*/ 97) {
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

    		if ($$self.$$.dirty & /*$songListStore, scrollAmount*/ 33) {
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
    		scrollAmount,
    		maxSongListHeight,
    		$selectedAlbumId,
    		mousewheel_handler,
    		click_handler
    	];
    }

    class SongList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SongList",
    			options,
    			id: create_fragment$8.name
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

    /* src/components/TagEdit-Separator.svelte generated by Svelte v3.38.3 */

    const file$5 = "src/components/TagEdit-Separator.svelte";

    function create_fragment$7(ctx) {
    	let tag_edit_separator;

    	const block = {
    		c: function create() {
    			tag_edit_separator = element("tag-edit-separator");
    			set_custom_element_data(tag_edit_separator, "class", "svelte-igry7v");
    			add_location(tag_edit_separator, file$5, 0, 0, 0);
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
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props) {
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
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TagEdit_Separator",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/components/TagEdit-Editor.svelte generated by Svelte v3.38.3 */
    const file$4 = "src/components/TagEdit-Editor.svelte";

    // (38:2) {#if showUndo}
    function create_if_block_2(ctx) {
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "undoIcon svelte-rqpajj");
    			if (img.src !== (img_src_value = "./img/undo-arrow-svgrepo-com.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$4, 38, 3, 1140);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);

    			if (!mounted) {
    				dispose = listen_dev(img, "click", /*click_handler*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(38:2) {#if showUndo}",
    		ctx
    	});

    	return block;
    }

    // (44:31) 
    function create_if_block_1(ctx) {
    	let textarea;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			textarea = element("textarea");
    			attr_dev(textarea, "rows", "1");
    			attr_dev(textarea, "class", "svelte-rqpajj");
    			add_location(textarea, file$4, 44, 2, 1396);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, textarea, anchor);
    			set_input_value(textarea, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[10]),
    					listen_dev(textarea, "mouseleave", /*mouseleave_handler*/ ctx[11], false, false, false),
    					listen_dev(textarea, "mouseover", /*mouseover_handler*/ ctx[12], false, false, false),
    					listen_dev(textarea, "input", /*input_handler*/ ctx[13], false, false, false)
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
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(44:31) ",
    		ctx
    	});

    	return block;
    }

    // (42:1) {#if ['text', 'number'].includes(type)}
    function create_if_block(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[3]);
    			attr_dev(input, "class", "svelte-rqpajj");
    			add_location(input, file$4, 42, 2, 1315);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[9]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*placeholder*/ 8) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[3]);
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
    		id: create_if_block.name,
    		type: "if",
    		source: "(42:1) {#if ['text', 'number'].includes(type)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let tag_edit;
    	let tag_name;
    	let t0;
    	let t1;
    	let warning;
    	let t2;
    	let warning_style_value;
    	let t3;
    	let t4;
    	let show_if;
    	let t5;
    	let tageditseparator;
    	let current;
    	let if_block0 = /*showUndo*/ ctx[2] && create_if_block_2(ctx);

    	function select_block_type(ctx, dirty) {
    		if (show_if == null || dirty & /*type*/ 2) show_if = !!["text", "number"].includes(/*type*/ ctx[1]);
    		if (show_if) return create_if_block;
    		if (/*type*/ ctx[1] === "textarea") return create_if_block_1;
    	}

    	let current_block_type = select_block_type(ctx, -1);
    	let if_block1 = current_block_type && current_block_type(ctx);
    	tageditseparator = new TagEdit_Separator({ $$inline: true });

    	const block = {
    		c: function create() {
    			tag_edit = element("tag-edit");
    			tag_name = element("tag-name");
    			t0 = text(/*tagName*/ ctx[4]);
    			t1 = space();
    			warning = element("warning");
    			t2 = text("(❗)");
    			t3 = space();
    			if (if_block0) if_block0.c();
    			t4 = space();
    			if (if_block1) if_block1.c();
    			t5 = space();
    			create_component(tageditseparator.$$.fragment);
    			attr_dev(warning, "title", /*warningMessage*/ ctx[5]);

    			attr_dev(warning, "style", warning_style_value = /*warningMessage*/ ctx[5] === undefined
    			? "display:none"
    			: "");

    			attr_dev(warning, "class", "svelte-rqpajj");
    			add_location(warning, file$4, 35, 2, 1014);
    			set_custom_element_data(tag_name, "class", "svelte-rqpajj");
    			add_location(tag_name, file$4, 32, 1, 988);
    			set_custom_element_data(tag_edit, "id", /*id*/ ctx[7]);
    			set_custom_element_data(tag_edit, "class", "svelte-rqpajj");
    			add_location(tag_edit, file$4, 31, 0, 971);
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
    			append_dev(tag_name, t3);
    			if (if_block0) if_block0.m(tag_name, null);
    			append_dev(tag_edit, t4);
    			if (if_block1) if_block1.m(tag_edit, null);
    			append_dev(tag_edit, t5);
    			mount_component(tageditseparator, tag_edit, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*tagName*/ 16) set_data_dev(t0, /*tagName*/ ctx[4]);

    			if (!current || dirty & /*warningMessage*/ 32) {
    				attr_dev(warning, "title", /*warningMessage*/ ctx[5]);
    			}

    			if (!current || dirty & /*warningMessage*/ 32 && warning_style_value !== (warning_style_value = /*warningMessage*/ ctx[5] === undefined
    			? "display:none"
    			: "")) {
    				attr_dev(warning, "style", warning_style_value);
    			}

    			if (/*showUndo*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(tag_name, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx, dirty)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if (if_block1) if_block1.d(1);
    				if_block1 = current_block_type && current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(tag_edit, t5);
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
    			if (if_block0) if_block0.d();

    			if (if_block1) {
    				if_block1.d();
    			}

    			destroy_component(tageditseparator);
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

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TagEdit_Editor", slots, []);
    	const dispatch = createEventDispatcher();
    	let { value = "" } = $$props;
    	let { type = "text" } = $$props;
    	let { showUndo = false } = $$props;
    	let { placeholder = undefined } = $$props;
    	let { tagName } = $$props;
    	let { warningMessage = undefined } = $$props;
    	let id = nanoid(10);
    	const writable_props = ["value", "type", "showUndo", "placeholder", "tagName", "warningMessage"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TagEdit_Editor> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => dispatch("undoChange");

    	function input_input_handler() {
    		value = this.value;
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
    		if ("showUndo" in $$props) $$invalidate(2, showUndo = $$props.showUndo);
    		if ("placeholder" in $$props) $$invalidate(3, placeholder = $$props.placeholder);
    		if ("tagName" in $$props) $$invalidate(4, tagName = $$props.tagName);
    		if ("warningMessage" in $$props) $$invalidate(5, warningMessage = $$props.warningMessage);
    	};

    	$$self.$capture_state = () => ({
    		nanoid,
    		createEventDispatcher,
    		dispatch,
    		TagEditSeparator: TagEdit_Separator,
    		value,
    		type,
    		showUndo,
    		placeholder,
    		tagName,
    		warningMessage,
    		id,
    		resizeTextArea
    	});

    	$$self.$inject_state = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("type" in $$props) $$invalidate(1, type = $$props.type);
    		if ("showUndo" in $$props) $$invalidate(2, showUndo = $$props.showUndo);
    		if ("placeholder" in $$props) $$invalidate(3, placeholder = $$props.placeholder);
    		if ("tagName" in $$props) $$invalidate(4, tagName = $$props.tagName);
    		if ("warningMessage" in $$props) $$invalidate(5, warningMessage = $$props.warningMessage);
    		if ("id" in $$props) $$invalidate(7, id = $$props.id);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value, type*/ 3) {
    			{
    				if (value && value !== "-" && type === "number") {
    					if (typeof value === "string") {
    						$$invalidate(0, value = value.replace(/[^\d]/g, ""));
    					}
    				}
    			}
    		}
    	};

    	return [
    		value,
    		type,
    		showUndo,
    		placeholder,
    		tagName,
    		warningMessage,
    		dispatch,
    		id,
    		click_handler,
    		input_input_handler,
    		textarea_input_handler,
    		mouseleave_handler,
    		mouseover_handler,
    		input_handler
    	];
    }

    class TagEdit_Editor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			value: 0,
    			type: 1,
    			showUndo: 2,
    			placeholder: 3,
    			tagName: 4,
    			warningMessage: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TagEdit_Editor",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*tagName*/ ctx[4] === undefined && !("tagName" in props)) {
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

    	get showUndo() {
    		throw new Error("<TagEdit_Editor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showUndo(value) {
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

    function getEmptyTagList() {
        return {
            Album: {
                value: undefined,
                bind: undefined
            },
            AlbumArtist: {
                value: undefined,
                bind: undefined
            },
            Comment: {
                value: undefined,
                bind: undefined
            },
            Composer: {
                value: undefined,
                bind: undefined
            },
            Artist: {
                value: undefined,
                bind: undefined
            },
            Date_Day: {
                value: undefined,
                bind: undefined
            },
            Date_Month: {
                value: undefined,
                bind: undefined
            },
            Date_Year: {
                value: undefined,
                bind: undefined
            },
            DiscNumber: {
                value: undefined,
                bind: undefined
            },
            Genre: {
                value: undefined,
                bind: undefined
            },
            Rating: {
                value: undefined,
                bind: undefined
            },
            Title: {
                value: undefined,
                bind: undefined
            },
            Track: {
                value: undefined,
                bind: undefined
            }
        };
    }

    function isEmptyObject(object) {
        return Object.keys(object).length === 0;
    }

    /* src/includes/TagEdit.svelte generated by Svelte v3.38.3 */

    const { console: console_1$1 } = globals;
    const file$3 = "src/includes/TagEdit.svelte";

    function create_fragment$5(ctx) {
    	let tag_edit_svlt;
    	let component_name;
    	let t0;
    	let t1_value = /*songsToEdit*/ ctx[0].length + "";
    	let t1;
    	let t2;
    	let tagediteditor0;
    	let updating_value;
    	let t3;
    	let tagediteditor1;
    	let updating_value_1;
    	let t4;
    	let track_disc_tag_editor;
    	let tagediteditor2;
    	let updating_value_2;
    	let t5;
    	let tagediteditor3;
    	let updating_value_3;
    	let t6;
    	let tagediteditor4;
    	let updating_value_4;
    	let t7;
    	let tagediteditor5;
    	let updating_value_5;
    	let t8;
    	let tagediteditor6;
    	let updating_value_6;
    	let t9;
    	let tagediteditor7;
    	let updating_value_7;
    	let t10;
    	let tagediteditor8;
    	let updating_value_8;
    	let t11;
    	let date_tag_editor;
    	let tagediteditor9;
    	let updating_value_9;
    	let t12;
    	let tagediteditor10;
    	let updating_value_10;
    	let t13;
    	let tagediteditor11;
    	let updating_value_11;
    	let t14;
    	let star;
    	let t15;
    	let cover_art;
    	let coverart;
    	let t16;
    	let button_group;
    	let button0;
    	let t17;
    	let button0_class_value;
    	let t18;
    	let button1;
    	let t19;
    	let button1_class_value;
    	let current;
    	let mounted;
    	let dispose;

    	function tagediteditor0_value_binding(value) {
    		/*tagediteditor0_value_binding*/ ctx[10](value);
    	}

    	let tagediteditor0_props = {
    		tagName: "Title",
    		type: "text",
    		showUndo: /*tagList*/ ctx[1].Title.bind !== /*tagList*/ ctx[1].Title.value
    	};

    	if (/*tagList*/ ctx[1].Title.bind !== void 0) {
    		tagediteditor0_props.value = /*tagList*/ ctx[1].Title.bind;
    	}

    	tagediteditor0 = new TagEdit_Editor({
    			props: tagediteditor0_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(tagediteditor0, "value", tagediteditor0_value_binding));
    	tagediteditor0.$on("undoChange", /*undoChange_handler*/ ctx[11]);

    	function tagediteditor1_value_binding(value) {
    		/*tagediteditor1_value_binding*/ ctx[12](value);
    	}

    	let tagediteditor1_props = {
    		tagName: "Album",
    		type: "text",
    		showUndo: /*tagList*/ ctx[1].Album.bind !== /*tagList*/ ctx[1].Album.value
    	};

    	if (/*tagList*/ ctx[1].Album.bind !== void 0) {
    		tagediteditor1_props.value = /*tagList*/ ctx[1].Album.bind;
    	}

    	tagediteditor1 = new TagEdit_Editor({
    			props: tagediteditor1_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(tagediteditor1, "value", tagediteditor1_value_binding));
    	tagediteditor1.$on("undoChange", /*undoChange_handler_1*/ ctx[13]);

    	function tagediteditor2_value_binding(value) {
    		/*tagediteditor2_value_binding*/ ctx[14](value);
    	}

    	let tagediteditor2_props = {
    		tagName: "Track #",
    		warningMessage: /*tagList*/ ctx[1].Track.value === "."
    		? "It is not recommended to edit the track number of multiple songs at once."
    		: undefined,
    		type: "number",
    		showUndo: /*tagList*/ ctx[1].Track.bind !== /*tagList*/ ctx[1].Track.value
    	};

    	if (/*tagList*/ ctx[1].Track.bind !== void 0) {
    		tagediteditor2_props.value = /*tagList*/ ctx[1].Track.bind;
    	}

    	tagediteditor2 = new TagEdit_Editor({
    			props: tagediteditor2_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(tagediteditor2, "value", tagediteditor2_value_binding));
    	tagediteditor2.$on("undoChange", /*undoChange_handler_2*/ ctx[15]);

    	function tagediteditor3_value_binding(value) {
    		/*tagediteditor3_value_binding*/ ctx[16](value);
    	}

    	let tagediteditor3_props = {
    		tagName: "Disc #",
    		type: "number",
    		showUndo: /*tagList*/ ctx[1].DiscNumber.bind !== /*tagList*/ ctx[1].DiscNumber.value
    	};

    	if (/*tagList*/ ctx[1].DiscNumber.bind !== void 0) {
    		tagediteditor3_props.value = /*tagList*/ ctx[1].DiscNumber.bind;
    	}

    	tagediteditor3 = new TagEdit_Editor({
    			props: tagediteditor3_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(tagediteditor3, "value", tagediteditor3_value_binding));
    	tagediteditor3.$on("undoChange", /*undoChange_handler_3*/ ctx[17]);

    	function tagediteditor4_value_binding(value) {
    		/*tagediteditor4_value_binding*/ ctx[18](value);
    	}

    	let tagediteditor4_props = {
    		tagName: "Artist",
    		type: "textarea",
    		showUndo: /*tagList*/ ctx[1].Artist.bind !== /*tagList*/ ctx[1].Artist.value
    	};

    	if (/*tagList*/ ctx[1].Artist.bind !== void 0) {
    		tagediteditor4_props.value = /*tagList*/ ctx[1].Artist.bind;
    	}

    	tagediteditor4 = new TagEdit_Editor({
    			props: tagediteditor4_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(tagediteditor4, "value", tagediteditor4_value_binding));
    	tagediteditor4.$on("undoChange", /*undoChange_handler_4*/ ctx[19]);

    	function tagediteditor5_value_binding(value) {
    		/*tagediteditor5_value_binding*/ ctx[20](value);
    	}

    	let tagediteditor5_props = {
    		tagName: "Album Artist",
    		type: "textarea",
    		showUndo: /*tagList*/ ctx[1].AlbumArtist.bind !== /*tagList*/ ctx[1].AlbumArtist.value
    	};

    	if (/*tagList*/ ctx[1].AlbumArtist.bind !== void 0) {
    		tagediteditor5_props.value = /*tagList*/ ctx[1].AlbumArtist.bind;
    	}

    	tagediteditor5 = new TagEdit_Editor({
    			props: tagediteditor5_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(tagediteditor5, "value", tagediteditor5_value_binding));
    	tagediteditor5.$on("undoChange", /*undoChange_handler_5*/ ctx[21]);

    	function tagediteditor6_value_binding(value) {
    		/*tagediteditor6_value_binding*/ ctx[22](value);
    	}

    	let tagediteditor6_props = {
    		tagName: "Genre",
    		type: "text",
    		showUndo: /*tagList*/ ctx[1].Genre.bind !== /*tagList*/ ctx[1].Genre.value
    	};

    	if (/*tagList*/ ctx[1].Genre.bind !== void 0) {
    		tagediteditor6_props.value = /*tagList*/ ctx[1].Genre.bind;
    	}

    	tagediteditor6 = new TagEdit_Editor({
    			props: tagediteditor6_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(tagediteditor6, "value", tagediteditor6_value_binding));
    	tagediteditor6.$on("undoChange", /*undoChange_handler_6*/ ctx[23]);

    	function tagediteditor7_value_binding(value) {
    		/*tagediteditor7_value_binding*/ ctx[24](value);
    	}

    	let tagediteditor7_props = {
    		tagName: "Composer",
    		type: "text",
    		showUndo: /*tagList*/ ctx[1].Composer.bind !== /*tagList*/ ctx[1].Composer.value
    	};

    	if (/*tagList*/ ctx[1].Composer.bind !== void 0) {
    		tagediteditor7_props.value = /*tagList*/ ctx[1].Composer.bind;
    	}

    	tagediteditor7 = new TagEdit_Editor({
    			props: tagediteditor7_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(tagediteditor7, "value", tagediteditor7_value_binding));
    	tagediteditor7.$on("undoChange", /*undoChange_handler_7*/ ctx[25]);

    	function tagediteditor8_value_binding(value) {
    		/*tagediteditor8_value_binding*/ ctx[26](value);
    	}

    	let tagediteditor8_props = {
    		tagName: "Comment",
    		type: "textarea",
    		showUndo: /*tagList*/ ctx[1].Comment.bind !== /*tagList*/ ctx[1].Comment.value
    	};

    	if (/*tagList*/ ctx[1].Comment.bind !== void 0) {
    		tagediteditor8_props.value = /*tagList*/ ctx[1].Comment.bind;
    	}

    	tagediteditor8 = new TagEdit_Editor({
    			props: tagediteditor8_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(tagediteditor8, "value", tagediteditor8_value_binding));
    	tagediteditor8.$on("undoChange", /*undoChange_handler_8*/ ctx[27]);

    	function tagediteditor9_value_binding(value) {
    		/*tagediteditor9_value_binding*/ ctx[28](value);
    	}

    	let tagediteditor9_props = {
    		tagName: "Year",
    		type: "number",
    		showUndo: /*tagList*/ ctx[1].Date_Year.bind !== /*tagList*/ ctx[1].Date_Year.value
    	};

    	if (/*tagList*/ ctx[1].Date_Year.bind !== void 0) {
    		tagediteditor9_props.value = /*tagList*/ ctx[1].Date_Year.bind;
    	}

    	tagediteditor9 = new TagEdit_Editor({
    			props: tagediteditor9_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(tagediteditor9, "value", tagediteditor9_value_binding));
    	tagediteditor9.$on("undoChange", /*undoChange_handler_9*/ ctx[29]);

    	function tagediteditor10_value_binding(value) {
    		/*tagediteditor10_value_binding*/ ctx[30](value);
    	}

    	let tagediteditor10_props = {
    		tagName: "Month",
    		type: "number",
    		showUndo: /*tagList*/ ctx[1].Date_Month.bind !== /*tagList*/ ctx[1].Date_Month.value
    	};

    	if (/*tagList*/ ctx[1].Date_Month.bind !== void 0) {
    		tagediteditor10_props.value = /*tagList*/ ctx[1].Date_Month.bind;
    	}

    	tagediteditor10 = new TagEdit_Editor({
    			props: tagediteditor10_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(tagediteditor10, "value", tagediteditor10_value_binding));
    	tagediteditor10.$on("undoChange", /*undoChange_handler_10*/ ctx[31]);

    	function tagediteditor11_value_binding(value) {
    		/*tagediteditor11_value_binding*/ ctx[32](value);
    	}

    	let tagediteditor11_props = {
    		tagName: "Day",
    		type: "number",
    		showUndo: /*tagList*/ ctx[1].Date_Day.bind !== /*tagList*/ ctx[1].Date_Day.value
    	};

    	if (/*tagList*/ ctx[1].Date_Day.bind !== void 0) {
    		tagediteditor11_props.value = /*tagList*/ ctx[1].Date_Day.bind;
    	}

    	tagediteditor11 = new TagEdit_Editor({
    			props: tagediteditor11_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(tagediteditor11, "value", tagediteditor11_value_binding));
    	tagediteditor11.$on("undoChange", /*undoChange_handler_11*/ ctx[33]);

    	star = new Star({
    			props: {
    				songRating: Number(/*tagList*/ ctx[1].Rating.bind),
    				hook: "tag-edit-svlt",
    				klass: "tag-edit-star",
    				showUndo: /*tagList*/ ctx[1].Rating.bind !== /*tagList*/ ctx[1].Rating.value
    			},
    			$$inline: true
    		});

    	star.$on("starChange", /*setStar*/ ctx[4]);
    	star.$on("undoChange", /*undoChange_handler_12*/ ctx[34]);

    	coverart = new CoverArt({
    			props: { rootDir: /*rootDir*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			tag_edit_svlt = element("tag-edit-svlt");
    			component_name = element("component-name");
    			t0 = text("Songs Editing: ");
    			t1 = text(t1_value);
    			t2 = space();
    			create_component(tagediteditor0.$$.fragment);
    			t3 = space();
    			create_component(tagediteditor1.$$.fragment);
    			t4 = space();
    			track_disc_tag_editor = element("track-disc-tag-editor");
    			create_component(tagediteditor2.$$.fragment);
    			t5 = space();
    			create_component(tagediteditor3.$$.fragment);
    			t6 = space();
    			create_component(tagediteditor4.$$.fragment);
    			t7 = space();
    			create_component(tagediteditor5.$$.fragment);
    			t8 = space();
    			create_component(tagediteditor6.$$.fragment);
    			t9 = space();
    			create_component(tagediteditor7.$$.fragment);
    			t10 = space();
    			create_component(tagediteditor8.$$.fragment);
    			t11 = space();
    			date_tag_editor = element("date-tag-editor");
    			create_component(tagediteditor9.$$.fragment);
    			t12 = space();
    			create_component(tagediteditor10.$$.fragment);
    			t13 = space();
    			create_component(tagediteditor11.$$.fragment);
    			t14 = space();
    			create_component(star.$$.fragment);
    			t15 = space();
    			cover_art = element("cover-art");
    			create_component(coverart.$$.fragment);
    			t16 = space();
    			button_group = element("button-group");
    			button0 = element("button");
    			t17 = text("Update");
    			t18 = space();
    			button1 = element("button");
    			t19 = text("Cancel");
    			set_custom_element_data(component_name, "class", "svelte-1bsf4j");
    			add_location(component_name, file$3, 105, 1, 3385);
    			set_custom_element_data(track_disc_tag_editor, "class", "svelte-1bsf4j");
    			add_location(track_disc_tag_editor, file$3, 123, 1, 3830);
    			set_custom_element_data(date_tag_editor, "class", "svelte-1bsf4j");
    			add_location(date_tag_editor, file$3, 184, 1, 5450);
    			set_custom_element_data(cover_art, "class", "svelte-1bsf4j");
    			add_location(cover_art, file$3, 217, 1, 6351);
    			attr_dev(button0, "class", button0_class_value = "update-button " + (/*enableButtons*/ ctx[2] ? "" : "disabled") + " svelte-1bsf4j");
    			add_location(button0, file$3, 222, 2, 6421);
    			attr_dev(button1, "class", button1_class_value = "cancel-button " + (/*enableButtons*/ ctx[2] ? "" : "disabled") + " svelte-1bsf4j");
    			add_location(button1, file$3, 223, 2, 6526);
    			set_custom_element_data(button_group, "class", "svelte-1bsf4j");
    			add_location(button_group, file$3, 221, 1, 6404);
    			set_custom_element_data(tag_edit_svlt, "class", "svelte-1bsf4j");
    			add_location(tag_edit_svlt, file$3, 104, 0, 3368);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tag_edit_svlt, anchor);
    			append_dev(tag_edit_svlt, component_name);
    			append_dev(component_name, t0);
    			append_dev(component_name, t1);
    			append_dev(tag_edit_svlt, t2);
    			mount_component(tagediteditor0, tag_edit_svlt, null);
    			append_dev(tag_edit_svlt, t3);
    			mount_component(tagediteditor1, tag_edit_svlt, null);
    			append_dev(tag_edit_svlt, t4);
    			append_dev(tag_edit_svlt, track_disc_tag_editor);
    			mount_component(tagediteditor2, track_disc_tag_editor, null);
    			append_dev(track_disc_tag_editor, t5);
    			mount_component(tagediteditor3, track_disc_tag_editor, null);
    			append_dev(tag_edit_svlt, t6);
    			mount_component(tagediteditor4, tag_edit_svlt, null);
    			append_dev(tag_edit_svlt, t7);
    			mount_component(tagediteditor5, tag_edit_svlt, null);
    			append_dev(tag_edit_svlt, t8);
    			mount_component(tagediteditor6, tag_edit_svlt, null);
    			append_dev(tag_edit_svlt, t9);
    			mount_component(tagediteditor7, tag_edit_svlt, null);
    			append_dev(tag_edit_svlt, t10);
    			mount_component(tagediteditor8, tag_edit_svlt, null);
    			append_dev(tag_edit_svlt, t11);
    			append_dev(tag_edit_svlt, date_tag_editor);
    			mount_component(tagediteditor9, date_tag_editor, null);
    			append_dev(date_tag_editor, t12);
    			mount_component(tagediteditor10, date_tag_editor, null);
    			append_dev(date_tag_editor, t13);
    			mount_component(tagediteditor11, date_tag_editor, null);
    			append_dev(tag_edit_svlt, t14);
    			mount_component(star, tag_edit_svlt, null);
    			append_dev(tag_edit_svlt, t15);
    			append_dev(tag_edit_svlt, cover_art);
    			mount_component(coverart, cover_art, null);
    			append_dev(tag_edit_svlt, t16);
    			append_dev(tag_edit_svlt, button_group);
    			append_dev(button_group, button0);
    			append_dev(button0, t17);
    			append_dev(button_group, t18);
    			append_dev(button_group, button1);
    			append_dev(button1, t19);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*updateSongs*/ ctx[7], false, false, false),
    					listen_dev(button1, "click", /*undoAllChanges*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*songsToEdit*/ 1) && t1_value !== (t1_value = /*songsToEdit*/ ctx[0].length + "")) set_data_dev(t1, t1_value);
    			const tagediteditor0_changes = {};
    			if (dirty[0] & /*tagList*/ 2) tagediteditor0_changes.showUndo = /*tagList*/ ctx[1].Title.bind !== /*tagList*/ ctx[1].Title.value;

    			if (!updating_value && dirty[0] & /*tagList*/ 2) {
    				updating_value = true;
    				tagediteditor0_changes.value = /*tagList*/ ctx[1].Title.bind;
    				add_flush_callback(() => updating_value = false);
    			}

    			tagediteditor0.$set(tagediteditor0_changes);
    			const tagediteditor1_changes = {};
    			if (dirty[0] & /*tagList*/ 2) tagediteditor1_changes.showUndo = /*tagList*/ ctx[1].Album.bind !== /*tagList*/ ctx[1].Album.value;

    			if (!updating_value_1 && dirty[0] & /*tagList*/ 2) {
    				updating_value_1 = true;
    				tagediteditor1_changes.value = /*tagList*/ ctx[1].Album.bind;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			tagediteditor1.$set(tagediteditor1_changes);
    			const tagediteditor2_changes = {};

    			if (dirty[0] & /*tagList*/ 2) tagediteditor2_changes.warningMessage = /*tagList*/ ctx[1].Track.value === "."
    			? "It is not recommended to edit the track number of multiple songs at once."
    			: undefined;

    			if (dirty[0] & /*tagList*/ 2) tagediteditor2_changes.showUndo = /*tagList*/ ctx[1].Track.bind !== /*tagList*/ ctx[1].Track.value;

    			if (!updating_value_2 && dirty[0] & /*tagList*/ 2) {
    				updating_value_2 = true;
    				tagediteditor2_changes.value = /*tagList*/ ctx[1].Track.bind;
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			tagediteditor2.$set(tagediteditor2_changes);
    			const tagediteditor3_changes = {};
    			if (dirty[0] & /*tagList*/ 2) tagediteditor3_changes.showUndo = /*tagList*/ ctx[1].DiscNumber.bind !== /*tagList*/ ctx[1].DiscNumber.value;

    			if (!updating_value_3 && dirty[0] & /*tagList*/ 2) {
    				updating_value_3 = true;
    				tagediteditor3_changes.value = /*tagList*/ ctx[1].DiscNumber.bind;
    				add_flush_callback(() => updating_value_3 = false);
    			}

    			tagediteditor3.$set(tagediteditor3_changes);
    			const tagediteditor4_changes = {};
    			if (dirty[0] & /*tagList*/ 2) tagediteditor4_changes.showUndo = /*tagList*/ ctx[1].Artist.bind !== /*tagList*/ ctx[1].Artist.value;

    			if (!updating_value_4 && dirty[0] & /*tagList*/ 2) {
    				updating_value_4 = true;
    				tagediteditor4_changes.value = /*tagList*/ ctx[1].Artist.bind;
    				add_flush_callback(() => updating_value_4 = false);
    			}

    			tagediteditor4.$set(tagediteditor4_changes);
    			const tagediteditor5_changes = {};
    			if (dirty[0] & /*tagList*/ 2) tagediteditor5_changes.showUndo = /*tagList*/ ctx[1].AlbumArtist.bind !== /*tagList*/ ctx[1].AlbumArtist.value;

    			if (!updating_value_5 && dirty[0] & /*tagList*/ 2) {
    				updating_value_5 = true;
    				tagediteditor5_changes.value = /*tagList*/ ctx[1].AlbumArtist.bind;
    				add_flush_callback(() => updating_value_5 = false);
    			}

    			tagediteditor5.$set(tagediteditor5_changes);
    			const tagediteditor6_changes = {};
    			if (dirty[0] & /*tagList*/ 2) tagediteditor6_changes.showUndo = /*tagList*/ ctx[1].Genre.bind !== /*tagList*/ ctx[1].Genre.value;

    			if (!updating_value_6 && dirty[0] & /*tagList*/ 2) {
    				updating_value_6 = true;
    				tagediteditor6_changes.value = /*tagList*/ ctx[1].Genre.bind;
    				add_flush_callback(() => updating_value_6 = false);
    			}

    			tagediteditor6.$set(tagediteditor6_changes);
    			const tagediteditor7_changes = {};
    			if (dirty[0] & /*tagList*/ 2) tagediteditor7_changes.showUndo = /*tagList*/ ctx[1].Composer.bind !== /*tagList*/ ctx[1].Composer.value;

    			if (!updating_value_7 && dirty[0] & /*tagList*/ 2) {
    				updating_value_7 = true;
    				tagediteditor7_changes.value = /*tagList*/ ctx[1].Composer.bind;
    				add_flush_callback(() => updating_value_7 = false);
    			}

    			tagediteditor7.$set(tagediteditor7_changes);
    			const tagediteditor8_changes = {};
    			if (dirty[0] & /*tagList*/ 2) tagediteditor8_changes.showUndo = /*tagList*/ ctx[1].Comment.bind !== /*tagList*/ ctx[1].Comment.value;

    			if (!updating_value_8 && dirty[0] & /*tagList*/ 2) {
    				updating_value_8 = true;
    				tagediteditor8_changes.value = /*tagList*/ ctx[1].Comment.bind;
    				add_flush_callback(() => updating_value_8 = false);
    			}

    			tagediteditor8.$set(tagediteditor8_changes);
    			const tagediteditor9_changes = {};
    			if (dirty[0] & /*tagList*/ 2) tagediteditor9_changes.showUndo = /*tagList*/ ctx[1].Date_Year.bind !== /*tagList*/ ctx[1].Date_Year.value;

    			if (!updating_value_9 && dirty[0] & /*tagList*/ 2) {
    				updating_value_9 = true;
    				tagediteditor9_changes.value = /*tagList*/ ctx[1].Date_Year.bind;
    				add_flush_callback(() => updating_value_9 = false);
    			}

    			tagediteditor9.$set(tagediteditor9_changes);
    			const tagediteditor10_changes = {};
    			if (dirty[0] & /*tagList*/ 2) tagediteditor10_changes.showUndo = /*tagList*/ ctx[1].Date_Month.bind !== /*tagList*/ ctx[1].Date_Month.value;

    			if (!updating_value_10 && dirty[0] & /*tagList*/ 2) {
    				updating_value_10 = true;
    				tagediteditor10_changes.value = /*tagList*/ ctx[1].Date_Month.bind;
    				add_flush_callback(() => updating_value_10 = false);
    			}

    			tagediteditor10.$set(tagediteditor10_changes);
    			const tagediteditor11_changes = {};
    			if (dirty[0] & /*tagList*/ 2) tagediteditor11_changes.showUndo = /*tagList*/ ctx[1].Date_Day.bind !== /*tagList*/ ctx[1].Date_Day.value;

    			if (!updating_value_11 && dirty[0] & /*tagList*/ 2) {
    				updating_value_11 = true;
    				tagediteditor11_changes.value = /*tagList*/ ctx[1].Date_Day.bind;
    				add_flush_callback(() => updating_value_11 = false);
    			}

    			tagediteditor11.$set(tagediteditor11_changes);
    			const star_changes = {};
    			if (dirty[0] & /*tagList*/ 2) star_changes.songRating = Number(/*tagList*/ ctx[1].Rating.bind);
    			if (dirty[0] & /*tagList*/ 2) star_changes.showUndo = /*tagList*/ ctx[1].Rating.bind !== /*tagList*/ ctx[1].Rating.value;
    			star.$set(star_changes);
    			const coverart_changes = {};
    			if (dirty[0] & /*rootDir*/ 8) coverart_changes.rootDir = /*rootDir*/ ctx[3];
    			coverart.$set(coverart_changes);

    			if (!current || dirty[0] & /*enableButtons*/ 4 && button0_class_value !== (button0_class_value = "update-button " + (/*enableButtons*/ ctx[2] ? "" : "disabled") + " svelte-1bsf4j")) {
    				attr_dev(button0, "class", button0_class_value);
    			}

    			if (!current || dirty[0] & /*enableButtons*/ 4 && button1_class_value !== (button1_class_value = "cancel-button " + (/*enableButtons*/ ctx[2] ? "" : "disabled") + " svelte-1bsf4j")) {
    				attr_dev(button1, "class", button1_class_value);
    			}
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
    			transition_in(coverart.$$.fragment, local);
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
    			transition_out(coverart.$$.fragment, local);
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
    			destroy_component(coverart);
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

    function instance$5($$self, $$props, $$invalidate) {
    	let $songListStore;
    	let $selectedSongsStore;
    	validate_store(songListStore, "songListStore");
    	component_subscribe($$self, songListStore, $$value => $$invalidate(8, $songListStore = $$value));
    	validate_store(selectedSongsStore, "selectedSongsStore");
    	component_subscribe($$self, selectedSongsStore, $$value => $$invalidate(9, $selectedSongsStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TagEdit", slots, []);
    	
    	let songsToEdit = [];
    	let tagList = getEmptyTagList();
    	let enableButtons = false;
    	let newTags = {};
    	let rootDir = "";

    	onMount(() => {
    		document.addEventListener("keypress", ({ key }) => {
    			if (key === "Enter") {
    				if (document.activeElement.parentElement.tagName === "TAG-EDIT") {
    					updateSongs();
    				}
    			}
    		});
    	});

    	function checkNewTags() {
    		$$invalidate(2, enableButtons = false);
    		newTags = {};

    		for (let tagName in tagList) {
    			if (tagList[tagName].value !== tagList[tagName].bind) {
    				if (["Date_Year", "Date_Month", "Date_Day"].includes(tagName)) {
    					newTags.Date_Year = Number(tagList.Date_Year.bind);
    					newTags.Date_Month = Number(tagList.Date_Month.bind);
    					newTags.Date_Day = Number(tagList.Date_Day.bind);
    				} else {
    					newTags[tagName] = tagList[tagName].bind;
    				}
    			}
    		}

    		if (!isEmptyObject(newTags)) {
    			$$invalidate(2, enableButtons = true);
    		} else {
    			$$invalidate(2, enableButtons = false);
    		}
    	}

    	function getSelectedSongs(selectedSongs, songList) {
    		if (songList.length <= 0) return;

    		// If no songs selected, edit full array. Otherwise edit only selected songs.
    		selectedSongs.length === 0
    		? $$invalidate(0, songsToEdit = songList)
    		: $$invalidate(0, songsToEdit = songList.filter(song => selectedSongs.includes(song.ID)));
    	}

    	function groupSongs(songsToEdit) {
    		let firstSong = songsToEdit[0];

    		// Sets up the tag lists with all the tags from the first song.
    		for (let tagName in firstSong) {
    			if (tagList[tagName]) {
    				$$invalidate(1, tagList[tagName].value = firstSong[tagName], tagList);
    			}
    		}

    		for (let song of songsToEdit) {
    			for (let tagName in song) {
    				if (tagList[tagName] && tagList[tagName].value !== song[tagName]) {
    					$$invalidate(1, tagList[tagName].value = "-", tagList);
    				}
    			}
    		}

    		for (let tagName in tagList) {
    			$$invalidate(1, tagList[tagName].bind = tagList[tagName].value, tagList);
    		}
    	}

    	function setStar(starChangeEvent) {
    		$$invalidate(1, tagList.Rating.bind = starChangeEvent.detail.starRating, tagList);
    	}

    	function undoChange(tagName) {
    		$$invalidate(1, tagList[tagName].bind = tagList[tagName].value, tagList);
    	}

    	function undoAllChanges() {
    		for (let tagName in tagList) {
    			$$invalidate(1, tagList[tagName].bind = tagList[tagName].value, tagList);
    		}
    	}

    	function updateSongs() {
    		if (enableButtons === true) {
    			editTagsIPC(songsToEdit.map(song => song.SourceFile), newTags);
    			getTagEditProgressIPC().then(result => console.log(result));
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<TagEdit> was created with unknown prop '${key}'`);
    	});

    	function tagediteditor0_value_binding(value) {
    		if ($$self.$$.not_equal(tagList.Title.bind, value)) {
    			tagList.Title.bind = value;
    			$$invalidate(1, tagList);
    		}
    	}

    	const undoChange_handler = () => undoChange("Title");

    	function tagediteditor1_value_binding(value) {
    		if ($$self.$$.not_equal(tagList.Album.bind, value)) {
    			tagList.Album.bind = value;
    			$$invalidate(1, tagList);
    		}
    	}

    	const undoChange_handler_1 = () => undoChange("Album");

    	function tagediteditor2_value_binding(value) {
    		if ($$self.$$.not_equal(tagList.Track.bind, value)) {
    			tagList.Track.bind = value;
    			$$invalidate(1, tagList);
    		}
    	}

    	const undoChange_handler_2 = () => undoChange("Track");

    	function tagediteditor3_value_binding(value) {
    		if ($$self.$$.not_equal(tagList.DiscNumber.bind, value)) {
    			tagList.DiscNumber.bind = value;
    			$$invalidate(1, tagList);
    		}
    	}

    	const undoChange_handler_3 = () => undoChange("DiscNumber");

    	function tagediteditor4_value_binding(value) {
    		if ($$self.$$.not_equal(tagList.Artist.bind, value)) {
    			tagList.Artist.bind = value;
    			$$invalidate(1, tagList);
    		}
    	}

    	const undoChange_handler_4 = () => undoChange("Artist");

    	function tagediteditor5_value_binding(value) {
    		if ($$self.$$.not_equal(tagList.AlbumArtist.bind, value)) {
    			tagList.AlbumArtist.bind = value;
    			$$invalidate(1, tagList);
    		}
    	}

    	const undoChange_handler_5 = () => undoChange("AlbumArtist");

    	function tagediteditor6_value_binding(value) {
    		if ($$self.$$.not_equal(tagList.Genre.bind, value)) {
    			tagList.Genre.bind = value;
    			$$invalidate(1, tagList);
    		}
    	}

    	const undoChange_handler_6 = () => undoChange("Genre");

    	function tagediteditor7_value_binding(value) {
    		if ($$self.$$.not_equal(tagList.Composer.bind, value)) {
    			tagList.Composer.bind = value;
    			$$invalidate(1, tagList);
    		}
    	}

    	const undoChange_handler_7 = () => undoChange("Composer");

    	function tagediteditor8_value_binding(value) {
    		if ($$self.$$.not_equal(tagList.Comment.bind, value)) {
    			tagList.Comment.bind = value;
    			$$invalidate(1, tagList);
    		}
    	}

    	const undoChange_handler_8 = () => undoChange("Comment");

    	function tagediteditor9_value_binding(value) {
    		if ($$self.$$.not_equal(tagList.Date_Year.bind, value)) {
    			tagList.Date_Year.bind = value;
    			$$invalidate(1, tagList);
    		}
    	}

    	const undoChange_handler_9 = () => undoChange("Date_Year");

    	function tagediteditor10_value_binding(value) {
    		if ($$self.$$.not_equal(tagList.Date_Month.bind, value)) {
    			tagList.Date_Month.bind = value;
    			$$invalidate(1, tagList);
    		}
    	}

    	const undoChange_handler_10 = () => undoChange("Date_Month");

    	function tagediteditor11_value_binding(value) {
    		if ($$self.$$.not_equal(tagList.Date_Day.bind, value)) {
    			tagList.Date_Day.bind = value;
    			$$invalidate(1, tagList);
    		}
    	}

    	const undoChange_handler_11 = () => undoChange("Date_Day");
    	const undoChange_handler_12 = () => undoChange("Rating");

    	$$self.$capture_state = () => ({
    		onMount,
    		CoverArt,
    		Star,
    		TagEditEditor: TagEdit_Editor,
    		getEmptyTagList,
    		isEmptyObject,
    		editTagsIPC,
    		getTagEditProgressIPC,
    		selectedSongsStore,
    		songListStore,
    		songsToEdit,
    		tagList,
    		enableButtons,
    		newTags,
    		rootDir,
    		checkNewTags,
    		getSelectedSongs,
    		groupSongs,
    		setStar,
    		undoChange,
    		undoAllChanges,
    		updateSongs,
    		$songListStore,
    		$selectedSongsStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("songsToEdit" in $$props) $$invalidate(0, songsToEdit = $$props.songsToEdit);
    		if ("tagList" in $$props) $$invalidate(1, tagList = $$props.tagList);
    		if ("enableButtons" in $$props) $$invalidate(2, enableButtons = $$props.enableButtons);
    		if ("newTags" in $$props) newTags = $$props.newTags;
    		if ("rootDir" in $$props) $$invalidate(3, rootDir = $$props.rootDir);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*$songListStore*/ 256) {
    			{
    				if ($songListStore.length > 0) {
    					$$invalidate(3, rootDir = $songListStore[0].SourceFile.split("/").slice(0, -1).join("/"));
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*$selectedSongsStore, $songListStore*/ 768) {
    			getSelectedSongs($selectedSongsStore, $songListStore);
    		}

    		if ($$self.$$.dirty[0] & /*songsToEdit*/ 1) {
    			if (songsToEdit.length !== 0) groupSongs(songsToEdit);
    		}

    		if ($$self.$$.dirty[0] & /*tagList, songsToEdit*/ 3) {
    			{
    				if (songsToEdit.length !== 0) checkNewTags();
    			}
    		}
    	};

    	return [
    		songsToEdit,
    		tagList,
    		enableButtons,
    		rootDir,
    		setStar,
    		undoChange,
    		undoAllChanges,
    		updateSongs,
    		$songListStore,
    		$selectedSongsStore,
    		tagediteditor0_value_binding,
    		undoChange_handler,
    		tagediteditor1_value_binding,
    		undoChange_handler_1,
    		tagediteditor2_value_binding,
    		undoChange_handler_2,
    		tagediteditor3_value_binding,
    		undoChange_handler_3,
    		tagediteditor4_value_binding,
    		undoChange_handler_4,
    		tagediteditor5_value_binding,
    		undoChange_handler_5,
    		tagediteditor6_value_binding,
    		undoChange_handler_6,
    		tagediteditor7_value_binding,
    		undoChange_handler_7,
    		tagediteditor8_value_binding,
    		undoChange_handler_8,
    		tagediteditor9_value_binding,
    		undoChange_handler_9,
    		tagediteditor10_value_binding,
    		undoChange_handler_10,
    		tagediteditor11_value_binding,
    		undoChange_handler_11,
    		undoChange_handler_12
    	];
    }

    class TagEdit extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {}, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TagEdit",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/controllers/ConfigController.svelte generated by Svelte v3.38.3 */

    function create_fragment$4(ctx) {
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ConfigController",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/controllers/PlayerController.svelte generated by Svelte v3.38.3 */

    function create_fragment$3(ctx) {
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
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $selectedGroupByStore;
    	let $selectedGroupByValueStore;
    	let $dbVersion;
    	let $selectedAlbumId;
    	let $songListStore;
    	let $albumListStore;
    	let $elementMap;
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
    	validate_store(elementMap, "elementMap");
    	component_subscribe($$self, elementMap, $$value => $$invalidate(8, $elementMap = $$value));
    	validate_store(selectedSongsStore, "selectedSongsStore");
    	component_subscribe($$self, selectedSongsStore, $$value => $$invalidate(9, $selectedSongsStore = $$value));
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
    		document.addEventListener("contextmenu", evt => handleClickEvent(evt));
    		loadPreviousState();
    	});

    	function loadPreviousState() {
    		let lastPlayedAlbumId = localStorage.getItem("LastPlayedAlbumId");
    		let lastPlayedSongId = Number(localStorage.getItem("LastPlayedSongId"));
    		getAlbumColors(lastPlayedAlbumId);
    		set_store_value(selectedAlbumId, $selectedAlbumId = lastPlayedAlbumId, $selectedAlbumId);

    		getAlbumIPC(lastPlayedAlbumId).then(result => {
    			set_store_value(songListStore, $songListStore = result.Songs, $songListStore);
    			setNewPlayback(lastPlayedAlbumId, $songListStore, lastPlayedSongId, false);
    		});
    	}

    	function handleClickEvent(evt) {
    		set_store_value(elementMap, $elementMap = new Map(), $elementMap);

    		evt.composedPath().forEach(element => {
    			$elementMap.set(element.tagName, element);
    		});

    		const ALBUM_ELEMENT = $elementMap.get("ALBUM");
    		const SONG_LIST_ITEM_ELEMENT = $elementMap.get("SONG-LIST-ITEM");

    		// const GROUPING_SVLT = $elementMap.get('GROUPING-SVLT')
    		// const SONG_LIST_ITEM_ELEMENT = $elementMap.get('SONG-LIST-ITEM')
    		// const ART_GRID_SVLT_SVLT = $elementMap.get('ART-GRID-SVLT')
    		// const SONG_LIST_SVLT = $elementMap.get('SONG-LIST-SVLT')
    		// const TAG_EDIT_SVLT = $elementMap.get('TAG-EDIT-SVLT')
    		if (ALBUM_ELEMENT) {
    			const ALBUM_Id = ALBUM_ELEMENT.getAttribute("id");

    			getAlbumIPC(ALBUM_Id).then(result => {
    				if (evt.type === "dblclick") {
    					setNewPlayback(ALBUM_Id, result.Songs, undefined, true);
    				} else if (evt.type === "click") {
    					// Prevents resetting array if album unchanged.
    					if ($selectedAlbumId !== ALBUM_Id) {
    						set_store_value(selectedAlbumId, $selectedAlbumId = ALBUM_Id, $selectedAlbumId);
    						set_store_value(songListStore, $songListStore = result.Songs, $songListStore);
    					}
    				}
    			});
    		}

    		if (SONG_LIST_ITEM_ELEMENT) {
    			const SONG_ID = Number(SONG_LIST_ITEM_ELEMENT.getAttribute("id"));

    			if (evt.type === "dblclick") {
    				getAlbumIPC($selectedAlbumId).then(result => {
    					setNewPlayback($selectedAlbumId, result.Songs, SONG_ID, true);
    				});
    			}

    			if (evt.type === "contextmenu") {
    				if (!$selectedSongsStore.includes(SONG_ID)) {
    					set_store_value(selectedSongsStore, $selectedSongsStore = [SONG_ID], $selectedSongsStore);
    				}
    			}
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
    		elementMap,
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
    		$elementMap,
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
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PlayerController",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/includes/BackgroundArt.svelte generated by Svelte v3.38.3 */

    const file$2 = "src/includes/BackgroundArt.svelte";

    function create_fragment$2(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = "./img/bg.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-ufzy90");
    			add_location(img, file$2, 0, 0, 0);
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
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
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
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BackgroundArt",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/includes/SongListBackground.svelte generated by Svelte v3.38.3 */
    const file$1 = "src/includes/SongListBackground.svelte";

    function create_fragment$1(ctx) {
    	let song_list_background_svlt;

    	const block = {
    		c: function create() {
    			song_list_background_svlt = element("song-list-background-svlt");
    			set_custom_element_data(song_list_background_svlt, "class", "svelte-1a8u4oc");
    			add_location(song_list_background_svlt, file$1, 38, 0, 1448);
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
    		id: create_fragment$1.name,
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

    function instance$1($$self, $$props, $$invalidate) {
    	let $albumCoverArtMapStore;
    	let $selectedAlbumId;
    	validate_store(albumCoverArtMapStore, "albumCoverArtMapStore");
    	component_subscribe($$self, albumCoverArtMapStore, $$value => $$invalidate(2, $albumCoverArtMapStore = $$value));
    	validate_store(selectedAlbumId, "selectedAlbumId");
    	component_subscribe($$self, selectedAlbumId, $$value => $$invalidate(3, $selectedAlbumId = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SongListBackground", slots, []);
    	let previousCoverArtVersion = undefined;
    	let previousCoverArtId = undefined;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SongListBackground> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		albumCoverArtMapStore,
    		selectedAlbumId,
    		previousCoverArtVersion,
    		previousCoverArtId,
    		loadCover,
    		$albumCoverArtMapStore,
    		$selectedAlbumId
    	});

    	$$self.$inject_state = $$props => {
    		if ("previousCoverArtVersion" in $$props) $$invalidate(0, previousCoverArtVersion = $$props.previousCoverArtVersion);
    		if ("previousCoverArtId" in $$props) $$invalidate(1, previousCoverArtId = $$props.previousCoverArtId);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$albumCoverArtMapStore, $selectedAlbumId, previousCoverArtId, previousCoverArtVersion*/ 15) {
    			{
    				// Loads cover if Cover Art map (If image updated) or Selected Album changes.
    				// console.log($selectedAlbumId)
    				// Get Cover Art from Map.
    				let coverArt = $albumCoverArtMapStore.get($selectedAlbumId);

    				// console.log(coverArt)
    				// If Found
    				if (coverArt) {
    					// Checks if the previous id changed.
    					if (previousCoverArtId !== $selectedAlbumId) {
    						// If changed it updates both id and version.
    						$$invalidate(1, previousCoverArtId = $selectedAlbumId);

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
    		previousCoverArtId,
    		$albumCoverArtMapStore,
    		$selectedAlbumId
    	];
    }

    class SongListBackground extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SongListBackground",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    function handleContextMenuEvent(e) {
        e.preventDefault();
        const pathsName = e.composedPath().map((path) => path.tagName);
        if (pathsName.includes('ALBUM')) {
            let albumElement = e.composedPath().find((path) => path.tagName === 'ALBUM');
            let albumId = albumElement.getAttribute('id');
            showContextMenuIPC('AlbumContextMenu', {
                albumId
            });
        }
        if (pathsName.includes('SONG-LIST')) {
            let albumId;
            let songs;
            selectedAlbumId.subscribe((_) => (albumId = _))();
            selectedSongsStore.subscribe((_) => (songs = _))();
            showContextMenuIPC('SongContextMenu', {
                albumId,
                songs
            });
        }
    }

    /* src/App.svelte generated by Svelte v3.38.3 */

    const { console: console_1, document: document_1 } = globals;
    const file = "src/App.svelte";

    function create_fragment(ctx) {
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
    			create_component(songlistbackground.$$.fragment);
    			attr_dev(main, "class", "svelte-1fro297");
    			add_location(main, file, 39, 0, 1539);
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
    			destroy_component(songlistbackground);
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

    function instance($$self, $$props, $$invalidate) {
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

    		window.addEventListener("contextmenu", e => handleContextMenuEvent(e));
    	});

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
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
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
    		getTasksToSyncIPC,
    		showContextMenuIPC,
    		syncDbVersionIPC,
    		albumListStore,
    		appTitle,
    		handleContextMenuEvent,
    		getNewDbChangesProgress,
    		$appTitle
    	});

    	return [$appTitle];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
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
