/**
 * Tests for Backbone.events (based on Backbone.js 1.2.3).
 *
 * @module events is a typesafe conversion of Backbones Events object.
 *
 * (c) 2010-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Backbone may be freely distributed under the MIT license.
 * @see http://backbonejs.org for all details and documentation.
 *
 * Also slightly modified as a part of distributed-js project. (c) Zenome
 */

import { assert } from "chai";

if (process.version === "v10.0.0") {
  console.log("YOU MUST UPDATE YOUR NODE FROM 10.0.0 TO RUN TESTS.");
}

import * as _ from "lodash";
import { Event, EventDispatcher } from "../../src/utils/events";

class Events extends EventDispatcher {
    public counter?: number;
    public counterA?: number;
    public counterB?: number;
}

describe("Events", function() {
    it("on and trigger", function() {
        const obj = new Events();
        obj.counter = 0;

        obj.on("event", function() { obj.counter += 1; });
        obj.trigger("event");
        assert.equal(obj.counter, 1, "counter should be incremented.");

        obj.trigger("event");
        obj.trigger("event");
        obj.trigger("event");
        obj.trigger("event");
        assert.equal(obj.counter, 5, "counter should be incremented five times.");
    });

    it("emit is alias for trigger", function() {
        const obj = new Events();
        obj.counter = 0;

        obj.on("event", function() { obj.counter += 1; });
        obj.emit("event");
        assert.equal(obj.counter, 1, "counter should be incremented.");

        obj.emit("event");
        obj.emit("event");
        obj.emit("event");
        obj.emit("event");
        assert.equal(obj.counter, 5, "counter should be incremented five times.");
    });


    it("binding and triggering multiple events", function() {
        const obj = new Events();
        obj.counter = 0;

        obj.on("a b c", function() { obj.counter += 1; });

        obj.trigger("a");
        assert.equal(obj.counter, 1);

        obj.trigger("a b");
        assert.equal(obj.counter, 3);

        obj.trigger("c");
        assert.equal(obj.counter, 4);

        obj.off("a c");
        obj.trigger("a b c");
        assert.equal(obj.counter, 5);
    });

    it("binding and triggering with event maps", function() {
        const obj = new Events();
        obj.counter = 0;

        const increment = function() { this.counter += 1; };

        obj.on({ a: increment, b: increment, c: increment }, obj);

        obj.trigger("a");
        assert.equal(obj.counter, 1);

        obj.trigger("a b");
        assert.equal(obj.counter, 3);

        obj.trigger("c");
        assert.equal(obj.counter, 4);

        obj.off({ a: increment, c: increment }, obj);
        obj.trigger("a b c");
        assert.equal(obj.counter, 5);
    });

    it("binding and triggering multiple event names with event maps", function() {
        const obj = new Events();
        obj.counter = 0;

        const increment = function() { this.counter += 1; };

        obj.on({ "a b c": increment });

        obj.trigger("a");
        assert.equal(obj.counter, 1);

        obj.trigger("a b");
        assert.equal(obj.counter, 3);

        obj.trigger("c");
        assert.equal(obj.counter, 4);

        obj.off({ "a c": increment });
        obj.trigger("a b c");
        assert.equal(obj.counter, 5);
    });

    it("binding and trigger with event maps context", function() {
        const obj = new Events();
        obj.counter = 0;
        const context = {};

        obj.on({
            a: function handler() {
                assert.strictEqual(this, context, "defaults `context` to `callback` param");
            }
        }, context).trigger("a");

        obj.off().on({
            a: function handler() {
                assert.strictEqual(this, context, "will not override explicit `context` param");
            }
        }, context).trigger("a");
    });

    it("listenTo and stopListening", function() {
        const a = new Events();
        const b = new Events();

        a.listenTo(b, "all", function() { assert(true); });
        b.trigger("anything");

        a.listenTo(b, "all", function() { assert(false); });
        a.stopListening();
        b.trigger("anything");
    });

    it("listenTo and stopListening with event maps", function() {
        const a = new Events();
        const b = new Events();
        const cb = function() { assert(true); };

        a.listenTo(b, {event: cb});
        b.trigger("event");

        a.listenTo(b, {event2: cb});
        b.on("event2", cb);
        a.stopListening(b, {event2: cb});
        b.trigger("event event2");

        a.stopListening();
        b.trigger("event event2");
    });

    it("stopListening with omitted args", function() {
        const a = new Events();
        const b = new Events();
        const cb = function() { assert(true); };
        a.listenTo(b, "event", cb);
        b.on("event", cb);
        a.listenTo(b, "event2", cb);
        a.stopListening(null, {event: cb});
        b.trigger("event event2");
        b.off();
        a.listenTo(b, "event event2", cb);
        a.stopListening(null, "event");
        a.stopListening();
        b.trigger("event2");
    });

    it("listenToOnce", function() {
        // Same as the previous test, but we use once rather than having to explicitly unbind
        const obj = new Events();
        obj.counterA = 0;
        obj.counterB = 0;

        const incrA = function() {
            obj.counterA += 1;
            obj.trigger("event");
        };
        const incrB = function() {
            obj.counterB += 1;
        };
        obj.listenToOnce(obj, "event", incrA);
        obj.listenToOnce(obj, "event", incrB);
        obj.trigger("event");
        assert.equal(obj.counterA, 1, "counterA should have only been incremented once.");
        assert.equal(obj.counterB, 1, "counterB should have only been incremented once.");
    });

    it("listenToOnce and stopListening", function() {
        const a = new Events();
        const b = new Events();
        a.listenToOnce(b, "all", function() { assert(true); });
        b.trigger("anything");
        b.trigger("anything");
        a.listenToOnce(b, "all", function() { assert(false); });
        a.stopListening();
        b.trigger("anything");
    });

    it("listenTo, listenToOnce and stopListening", function() {
        const a = new Events();
        const b = new Events();
        a.listenToOnce(b, "all", function() { assert(true); });
        b.trigger("anything");
        b.trigger("anything");
        a.listenTo(b, "all", function() { assert(false); });
        a.stopListening();
        b.trigger("anything");
    });

    it("listenTo and stopListening with event maps", function() {
        const a = new Events();
        const b = new Events();
        a.listenTo(b, {
            change: function handler() {
                assert(true);
            }
        });
        b.trigger("change");
        a.listenTo(b, {
            change: function handler() {
                assert(false);
            }
        });
        a.stopListening();
        b.trigger("change");
    });

    it("listenTo yourself", function() {
        const e = new Events();
        e.listenTo(e, "foo", function() { assert(true); });
        e.trigger("foo");
    });

    it("listenTo yourself cleans yourself up with stopListening", function() {
        const e = new Events();
        e.listenTo(e, "foo", function() { assert(true); });
        e.trigger("foo");

        e.listenTo(e, "foo", function() { assert(false); });
        e.stopListening();
        e.trigger("foo");
    });

    it("stopListening cleans up references", function() {
        const a: any = new Events();
        const b: any = new Events();
        const fn = function() { return; };
        b.on("event", fn);

        a.listenTo(b, "event", fn).stopListening();
        assert.equal(_.size(a._listeningTo), 0);
        assert.equal(_.size(b._events.event), 1);
        assert.equal(_.size(b._listeners), 0);

        a.listenTo(b, "event", fn).stopListening(b);
        assert.equal(_.size(a._listeningTo), 0);
        assert.equal(_.size(b._events.event), 1);
        assert.equal(_.size(b._listeners), 0);

        a.listenTo(b, "event", fn).stopListening(b, "event");
        assert.equal(_.size(a._listeningTo), 0);
        assert.equal(_.size(b._events.event), 1);
        assert.equal(_.size(b._listeners), 0);

        a.listenTo(b, "event", fn).stopListening(b, "event", fn);
        assert.equal(_.size(a._listeningTo), 0);
        assert.equal(_.size(b._events.event), 1);
        assert.equal(_.size(b._listeners), 0);
    });

    it("stopListening cleans up references from listenToOnce", function() {
        const a: any = new Events();
        const b: any = new Events();
        const fn = function() { return; };
        b.on("event", fn);

        a.listenToOnce(b, "event", fn).stopListening();
        assert.equal(_.size(a._listeningTo), 0);
        assert.equal(_.size(b._events.event), 1);
        assert.equal(_.size(b._listeners), 0);

        a.listenToOnce(b, "event", fn).stopListening(b);
        assert.equal(_.size(a._listeningTo), 0);
        assert.equal(_.size(b._events.event), 1);
        assert.equal(_.size(b._listeners), 0);

        a.listenToOnce(b, "event", fn).stopListening(b, "event");
        assert.equal(_.size(a._listeningTo), 0);
        assert.equal(_.size(b._events.event), 1);
        assert.equal(_.size(b._listeners), 0);

        a.listenToOnce(b, "event", fn).stopListening(b, "event", fn);
        assert.equal(_.size(a._listeningTo), 0);
        assert.equal(_.size(b._events.event), 1);
        assert.equal(_.size(b._listeners), 0);
    });

    it("listenTo and off cleaning up references", function() {
        const a: any = new Events();
        const b: any = new Events();
        const fn = function() { return; };

        a.listenTo(b, "event", fn);
        b.off();
        assert.equal(_.size(a._listeningTo), 0);
        assert.equal(_.size(b._listeners), 0);

        a.listenTo(b, "event", fn);
        b.off("event");
        assert.equal(_.size(a._listeningTo), 0);
        assert.equal(_.size(b._listeners), 0);

        a.listenTo(b, "event", fn);
        b.off(null, fn);
        assert.equal(_.size(a._listeningTo), 0);
        assert.equal(_.size(b._listeners), 0);

        a.listenTo(b, "event", fn);
        b.off(null, null, a);
        assert.equal(_.size(a._listeningTo), 0);
        assert.equal(_.size(b._listeners), 0);
    });

    it("listenTo and stopListening cleaning up references", function() {
        const a = new Events();
        const b = new Events();

        a.listenTo(b, "all", function() { assert(true); });
        b.trigger("anything");

        a.listenTo(b, "other", function() { assert(false); });
        a.stopListening(b, "other");
        a.stopListening(b, "all");

        assert.equal(_.size((a as any)._listeningTo), 0);
    });

    it("listenToOnce without context cleans up references after the event has fired", function() {
        const a = new Events();
        const b = new Events();
        a.listenToOnce(b, "all", function() { assert(true); });
        b.trigger("anything");
        assert.equal(_.size((a as any)._listeningTo), 0);
    });

    it("listenToOnce with event maps cleans up references", function() {
        const a = new Events();
        const b = new Events();
        a.listenToOnce(b, {
            one: function handler() { assert(true); },
            two: function handler() { assert(false); }
        });
        b.trigger("one");
        assert.equal(_.size((a as any)._listeningTo), 1);
    });

    it("listenToOnce with event maps binds the correct `this`", function() {
        const a = new Events();
        const b = new Events();
        a.listenToOnce(b, {
            one: function handler() { assert(this === a); },
            two: function handler() { assert(false); }
        });
        b.trigger("one");
    });

    it("listenTo with empty callback does not throw an error", function() {
        const e = new Events();
        e.listenTo(e, "foo", null);
        e.trigger("foo");
        assert(true);
    });

    it("trigger all for each event", function() {
        let a: boolean;
        let b: boolean;
        const obj = new Events();
        obj.counter = 0;
        obj.on("all", function(event) {
            obj.counter++;
            if (event === "a") { a = true; }
            if (event === "b") { b = true; }
        }).trigger("a b");
        assert(a);
        assert(b);
        assert.equal(obj.counter, 2);
    });

    it("on, then unbind all functions", function() {
        const obj = new Events();
        obj.counter = 0;
        const callback = function() { obj.counter += 1; };

        obj.on("event", callback);
        obj.trigger("event");
        obj.off("event");
        obj.trigger("event");
        assert.equal(obj.counter, 1, "counter should have only been incremented once.");
    });

    it("bind two callbacks, unbind only one", function() {
        const obj = new Events();
        obj.counterA = 0;
        obj.counterB = 0;
        const callback = function() { obj.counterA += 1; };
        obj.on("event", callback);
        obj.on("event", function() { obj.counterB += 1; });
        obj.trigger("event");
        obj.off("event", callback);
        obj.trigger("event");
        assert.equal(obj.counterA, 1, "counterA should have only been incremented once.");
        assert.equal(obj.counterB, 2, "counterB should have been incremented twice.");
    });

    it("unbind a callback in the midst of it firing", function() {
        const obj = new Events();
        obj.counter = 0;
        const callback = function() {
            obj.counter += 1;
            obj.off("event", callback);
        };
        obj.on("event", callback);
        obj.trigger("event");
        obj.trigger("event");
        obj.trigger("event");
        assert.equal(obj.counter, 1, "the callback should have been unbound.");
    });

    it("two binds that unbind themeselves", function() {
        const obj = new Events();
        obj.counterA = 0;
        obj.counterB = 0;
        const incrA = function() {
            obj.counterA += 1;
            obj.off("event", incrA);
        };
        const incrB = function() {
            obj.counterB += 1;
            obj.off("event", incrB);
        };
        obj.on("event", incrA);
        obj.on("event", incrB);
        obj.trigger("event");
        obj.trigger("event");
        obj.trigger("event");
        assert.equal(obj.counterA, 1, "counterA should have only been incremented once.");
        assert.equal(obj.counterB, 1, "counterB should have only been incremented once.");
    });

    it("bind a callback with a supplied context", function() {
        class TestClass {
            public assertTrue() {
                assert(true, "`this` was bound to the callback");
            }
        }

        const obj = new Events();
        obj.on("event", function() { this.assertTrue(); }, (new TestClass()));
        obj.trigger("event");
    });

    it("nested trigger with unbind", function() {
        const obj = new Events();
        obj.counter = 0;
        const incr1 = function() {
            obj.counter += 1;
            obj.off("event", incr1);
            obj.trigger("event");
        };
        const incr2 = function() { obj.counter += 1; };
        obj.on("event", incr1);
        obj.on("event", incr2);
        obj.trigger("event");
        assert.equal(obj.counter, 3, "counter should have been incremented three times");
    });

    it("callback list is not altered during trigger", function() {
        let counter = 0;
        const obj = new Events();
        const incr = function() { counter++; };
        const incrOn = function() { obj.on("event all", incr); };
        const incrOff = function() { obj.off("event all", incr); };

        obj.on("event all", incrOn).trigger("event");
        assert.equal(counter, 0, "on does not alter callback list");

        obj.off().on("event", incrOff).on("event all", incr).trigger("event");
        assert.equal(counter, 2, "off does not alter callback list");
    });

    it("#1282 - `all` callback list is retrieved after each event.", function() {
        let counter = 0;
        const obj = new Events();
        const incr = function() { counter++; };

        obj.on("x", function() { obj.on("y", incr).on("all", incr); }).trigger("x y");

        assert.strictEqual(counter, 2);
    });

    it("if no callback is provided, `on` is a noop", function() {
        (new Events() as any).on("test").trigger("test");
    });

    it("if callback is truthy but not a function, `on` should throw an error just like jQuery", function() {
        const view = (new Events() as any).on("test", "noop");
        assert.throws(function() { view.trigger("test"); });
    });

    it("remove all events for a specific context", function() {
        const obj = new Events();
        obj.on("x y all", function() { assert(true); });
        obj.on("x y all", function() { assert(false); }, obj);
        obj.off(null, null, obj);
        obj.trigger("x y");
    });

    it("remove all events for a specific callback", function() {
        const obj = new Events();
        const success = function() { assert(true); };
        const fail = function() { assert(false); };
        obj.on("x y all", success);
        obj.on("x y all", fail);
        obj.off(null, fail);
        obj.trigger("x y");
    });

    it("#1310 - off does not skip consecutive events", function() {
        const obj = new Events();
        obj.on("event", function() { assert(false); }, obj);
        obj.on("event", function() { assert(false); }, obj);
        obj.off(null, null, obj);
        obj.trigger("event");
    });

    it("once", function() {
        // Same as the previous test, but we use once rather than having to explicitly unbind
        const obj = new Events();
        obj.counterA = 0;
        obj.counterB = 0;

        const incrA = function() { obj.counterA += 1; obj.trigger("event"); };
        const incrB = function() { obj.counterB += 1; };
        obj.once("event", incrA);
        obj.once("event", incrB);
        obj.trigger("event");
        assert.equal(obj.counterA, 1, "counterA should have only been incremented once.");
        assert.equal(obj.counterB, 1, "counterB should have only been incremented once.");
    });

    it("once variant one", function() {
        let count = 0;
        const f = function() { count += 1; };

        const a = (new Events()).once("event", f);
        const b = (new Events()).on("event", f);

        a.trigger("event");
        b.trigger("event");
        b.trigger("event");

        assert.equal(count, 3);
    });

    it("once variant two", function() {
        let count = 0;
        const obj = new Events();
        const f = function() { count += 1; };

        obj.once("event", f)
           .on("event", f)
           .trigger("event")
           .trigger("event");

        assert.equal(count, 3);
    });

    it("once with off", function() {
        const obj = new Events();
        const f = function() { assert(false); };

        obj.once("event", f);
        obj.off("event", f);
        obj.trigger("event");
    });

    it("once with event maps", function() {
        const obj = new Events();
        obj.counter = 0;

        const increment = function() { this.counter += 1; };

        obj.once({ a: increment, b: increment, c: increment }, obj);

        obj.trigger("a");
        assert.equal(obj.counter, 1);

        obj.trigger("a b");
        assert.equal(obj.counter, 2);

        obj.trigger("c");
        assert.equal(obj.counter, 3);

        obj.trigger("a b c");
        assert.equal(obj.counter, 3);
    });

    it("once with off only by context", function() {
        const context = {};
        const obj = new Events();
        obj.once("event", function() { assert(false); }, context);
        obj.off(null, null, context);
        obj.trigger("event");
    });

    it("once with asynchronous events", function(done) {
        const func = _.debounce(function() { assert(true); done(); }, 50);

        const obj = (new Events()).once("async", func);
        obj.trigger("async");
        obj.trigger("async");
    });

    it("once with multiple events.", function() {
        let count = 0;
        const obj = new Events();
        obj.once("x y", function() { count += 1; });
        obj.trigger("x y");
        assert.equal(count, 2);
    });

    it("Off during iteration with once.", function() {
        let count = 0;
        const obj = new Events();
        const f = function() { this.off("event", f); };
        obj.on("event", f);
        obj.once("event", function() { return; });
        obj.on("event", function() { count += 1; });

        obj.trigger("event");
        obj.trigger("event");
        assert.equal(count, 2);
    });

    it("`once` on `all` should work as expected", function() {
        let count = 0;
        const obj = new Events();
        obj.once("all", function() { count += 1; obj.trigger("all"); });
        obj.trigger("all");

        assert.equal(count, 1);
    });

    it("once without a callback is a noop", function() {
        (new Events() as any).once("event").trigger("event");
    });

    it("listenToOnce without a callback is a noop", function() {
        const obj = new Events();
        (obj as any).listenToOnce(obj, "event").trigger("event");
    });

    it("event functions are chainable", function() {
        const obj = new Events();
        const obj2 = new Events();
        const fn = function() { return; };

        assert.equal(obj, obj.trigger("noeventssetyet"));
        assert.equal(obj, obj.off("noeventssetyet"));
        assert.equal(obj, obj.stopListening(null, "noeventssetyet"));
        assert.equal(obj, obj.on("a", fn));
        assert.equal(obj, obj.once("c", fn));
        assert.equal(obj, obj.trigger("a"));
        assert.equal(obj, obj.listenTo(obj2, "a", fn));
        assert.equal(obj, obj.listenToOnce(obj2, "b", fn));
        assert.equal(obj, obj.off("a c"));
        assert.equal(obj, obj.stopListening(obj2, "a"));
        assert.equal(obj, obj.stopListening());
    });

    it("#3448 - listenToOnce with space-separated events", function() {
        const one = new Events();
        const two = new Events();
        let count = 1;
        one.listenToOnce(two, "x y", function(n) { assert(n === count++); });
        two.trigger("x", 1);
        two.trigger("x", 1);
        two.trigger("y", 2);
        two.trigger("y", 2);
    });

});

describe("Events (customized)", function() {
    it("accepts event objects", function() {
        let count = 0;
        const events = new Events();
        const event = new Event("myEvent");
        events.on("myEvent", function(e) { assert(e instanceof Event); count += 1; });
        events.trigger(event);
        assert.equal(count, 1);
    });

    it("stops propagation", function() {
        let count = 0;
        const events = new Events();
        const event = new Event("myEvent");
        events.on("myEvent", function(e) { count++; e.stopPropagation(); });
        events.on("myEvent", function(e) { count++; assert(false); });
        events.trigger(event);
        assert.equal(count, 1);
    });

    it("sorts handlers by priority", function() {
        let count = 0;
        const events = new Events();
        events.on("myEvent", function(e) { assert.equal(count, 1); count++; }, void 0, 0);
        events.on("myEvent", function(e) { assert.equal(count, 0); count++; }, void 0, 100);
        events.trigger("myEvent");
        assert.equal(count, 2);
    });
});