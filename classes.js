import { funcs } from './funcs.js'
import { is }    from './is.js' 

export {
   AttrObserver,
   Behavior,
   BehaviorList, 
   FlexRef,
   Hook,
   HookBank,  
   Listener,
   Subscription 
}


class AttrObserver {

   #ready = false

   // for storing updates passed to the 'processAttrChanges' method via a 
   // component's 'attributeChangedCallback' method before this AttrObserver 
   // instance is set to ready. Once ready is set to true, AttrObserver looks 
   // for any stored 'stagedData' propreties and processes these queued updates
   #stagedData = {}

   get ready() {
      return this.#ready
   }
   set ready(bool) {
      this.#activate(bool)
   } 

   #activate(bool) {   
      if (bool === true || bool === undefined) {  
         // if no value passed in, assumed intent is to activate
         this.#ready = bool ?? true 

         const chgs = Object.entries(this.#stagedData); 
         while (chgs.length) {
            this.processAttrChanges(...(chgs.pop().at(1)));
         }
 
         this.#stagedData ={};
      }  
      return this
   } 

   disable() {
      if (this.ready) {
         this.onDisable.forEach( f=> f() );
         this.ready = false;
      } 
   }

   constructor(){
      // call count for 'processAttrChanges'
      this.count = -1; 

      this.behaviors = [];

      this.onDisable = []; 
   }
   
   // add user attributeBehavior definitions
   // If a behavior key starts with '_not', it will be interpreted
   // negatively- e.g, the corresponding behaviors will be enabled
   // when the attribute is NOT present, and disabled when it IS
   // present
   addBehaviors(host, attributeBehaviorDefs) {

      const defs = attributeBehaviorDefs
      
      Object.entries(defs).forEach(([_attr, bDef])=> {    

         const neg = _attr.startsWith('not_')

         const attr = neg ? _attr.replace('not_','') : _attr;

         if (this[attr] === undefined) {
            this[attr] = {};  
         }

         const bhvr = new Behavior(
            host,
            is.obj(bDef) ?
                 Object.entries(bDef).map(entry=> [ host, ...entry, {} ])
               : bDef
         );

         Object.assign( this[attr], neg ?
            {
               onadd:    ()=>bhvr.disable(),
               onremove: ()=>bhvr.enable()
            }:{
               onadd:   ()=> bhvr.enable(),
               onremove:()=> bhvr.disable()
            });

         if ( (!neg && host.hasAttribute(attr))
            || (neg && !(host.hasAttribute(attr)))) {
            bhvr.enable();
         }

         host.behaviors?.push(bhvr);

         this.onDisable.push(()=> bhvr.disable())
      }) 
   }

   addObservers(host, attributeObserverDefs) {

      const defs = attributeObserverDefs
  
      const deleter = [];

      // for each attr on defs, create a new property
      // 'attr' on this (a blank object). observer resposnes
      // can be keyed as 'onAdd', 'onRemove', or 'onChange'.
      //
      // if the def provided is a function and not a set of functions 
      // as properties of an object, that function will be interepted
      // as an 'onChange' response
      Object.entries(defs).forEach(([attr, obsDefs])=> { 

         if (this[attr]===undefined) {
            this[attr] = {};
         }

         Object.assign(this[attr], typeof obsDefs==='function' ? 
              funcs.recursiveRebind({ onchange: obsDefs }, host)  
            : funcs.recursiveRebind(            obsDefs,   host)) 
      })
   } 
 
   processAttrChanges(...args) { 
      if (!this.ready) {
         // store the arguments that were passed to this
         // function call for later evaluation
         this.#stagedData[args?.at?.call(args, 0)] = args;
      }
      else {  
         const [attr, oldVal, newVal, force] = args;

         if ((force===true) || ((newVal!==oldVal) && (this[attr]!=null))) { 

            const responses = this[attr]  

            if ('onadd' in responses && oldVal==null) {
               responses.onadd(newVal) 
            }
            else if ('onremove' in responses && newVal==null) {
               responses.onremove(attr) 
            }
            if ('onchange' in responses) {
               responses.onchange(newVal, oldVal)  
            }
         } 
      } 
   } 
} 


class Behavior { 

   // where we keep track of Listener instances
   #listeners = new Set();

   #isEnabled = false;

   get isEnabled() {
      return this.#isEnabled
   }; 
   
   // adds a new listener to the Behavior object 
   #commit(args) {  
      const host = this.host.shadowRoot ?? this.host;
      this.#listeners.add(new Listener(is.str(args[0]) ?
         (head=> args.with(0, ()=> host.querySelector(head)))(args[0])
         : args)
      )
   }; 
   
   #normalizeNewListenerArgs(entry) { 
                           // "is entry of the form..." ?
      const valdtr = (types)=> is.argsLike(entry, types);   

      // arguments to this function are passed as a list
      // with arguments in this order
      // 1st - type: String/DOM node - Host to the listener (a string is 
      //                               interpreted  as a query string that 
      //                               should resolve to a dom node)
      // 2nd - type: String          - Name of the event to listen for
      // 3rd - type: Function        - Handler that responds to event
      // 4th - type: Object          - event configuration object

      // If the first argument is omitted, it is assumed to be 'this'
      // which is typically the current component
      // (3rd conditional statement below)

      // If the last options argument is omitted, it is assumed to be an empty
      // object (2nd conditional statement below)

      // If the user provides an object in lieu of a function + event target,
      // the object is interpreted to be key value pairs where the key 
      // represents the string event name, and the value is a function
      // representing the handler (last conditional statement below). This 
      // provides an alternative syntax for associating multiple events to 
      // one host - especially when those events each need the same config 
      // passed in 
      
      // The end result of each conditional is a call to the 'commit' function
      // with arguments in the correct order

      if (valdtr(['str|dom','str','func','obj'])) {  
         this.#commit(entry);
      }
      else if (valdtr(['str|dom','str','func'])) { 
         this.#commit([...entry, {}]);
      }
      else if (valdtr(['str', 'func'])) {
         this.#commit([ this.host, entry[0], entry[1], {} ]) 
      }
      else if (valdtr(['str|dom','obj','obj']) || valdtr(['str|dom','obj']))  {
         const [ host, handlers, opts ] = entry
         Object.entries(handlers)
            .map(args => [
               host,
               ...args,
               (opts && args[0] in opts ?
                    opts[args[0]]
                  : (opts ?? {})
               )
            ])
            .forEach(args=> this.#commit(args))  
      }
   }; 

    constructor(host, arr) {       
 
      this.host = host;

      // some simple type checking 
      if (!(is.entries(arr))) { 
         if (is.entries([arr])) arr = [arr];
         else { throw new Error('invalid listener init args') }
      }  
      [...arr].forEach((entry)=> this.#normalizeNewListenerArgs(entry)) 
   }

   enable()  {  
      this.disable();
      if (!this.#isEnabled)
         this.#listeners.forEach(listener=> listener.activate());
      this.#isEnabled = true
      return this
   }

   disable() {
      this.#listeners.forEach(listener=> listener.deactivate())
      this.#isEnabled = false; 
      return this
   }
}


// for defining class-level behaviors on a custom element, before
// a 'this' reference is available to bind the event handlers
class BehaviorList {

   unpack = (cxt)=> {
      this.list = this.list.map(item=>
         is.func(item) ?
              item.call(cxt ?? this)
            : item
      )
   }

   constructor(list=[]) {
      this.list = list;
   } 

   at(index) {
      return this.list.at(index)
   }

   push(item) {
      this.list.push(item)
   }

   enable() {
      return this.list.forEach(f=> f.enable())
   }

   disable() {
      return this.list.forEach(f=> f.disable())
   }  
} 


class FlexRef {
 
   static #time = 1000;

   static #timedRef = ()=> ({
      resolve: ()=>{},
      orig:    null,
      cached:  null,
      timer:   0
   });

   constructor(args) {
      // if only a single argument is passed: target===host
      [this.target, this.host] = [args[1] ?? args[0], args[0]];  
   }
 
   get hostRef() { 
      return this._host
   }
   
   get targetRef(){ 
      return this._target
   }
   
   get target() {
      return this._target.resolve()
   }
   
   get host() {
      return this._host.resolve()
   } 
   
   set host(ref)  {
      this.#set( 'host',   ref)
   }
   
   set target(ref){
      this.#set( 'target', ref)
   };  
 
   #get(ident) {

      ident = '_'+ident;

      if (this[ident] == null) {
         this[ident] = FlexRef.#timedRef();
      }

      const curr = this[ident];

      if (curr.resolve == null) {
         return null 
      }

      clearTimeout(curr.timer);
      curr.timer = setTimeout(()=> {
            curr.cached = null
         }, FlexRef.#time);

      if ( curr.cached==null ) {
         curr.cached = curr.resolve();
      }

      return curr.cached
            ??
          this[{_target: '_host', _host: '_target'}[ident]].resolve()
   };
 
   #set(ident, ref) {

      ident = '_'+ident;

      if (this[ident] == null) {
         this[ident] = FlexRef.#timedRef();
      }

      const curr = this[ident];  

      curr.orig = ref;

      if (is.func(ref)) {
         curr.resolve = ref; 
      }
      else if (is.dom(ref)) {
         curr.resolve = ()=> ref;
      }
      else if (is.str(ref)) {
         curr.resolve = (h=ident=='_target'?this.host:document)=>
            (h.shadowRoot ?? h).querySelector(ref); 
      }
      else if (is.wrf(ref)) {
         curr.resolve = ()=> ref.deref(); 
      }
      else {
         curr.resolve = ()=> ref; 
      }
   }
}  


class Hook {

   static hookCount = 0; 

   run = (...args)=> { 
      this.subs.forEach(sub=> sub.call(this, ...args));
      ++this.runCount; 
      if(this.evergreen !== true) {
         this.subs.clear();       
      }
   } 
   // by default, added functions will run once
   // if evergreen is set to true, they will run repeatedly
   constructor(name, evergreen=false) {
      this.runCount = 0;
      this.name = name ?? `AnonymousHook_${++Hook.hookCount}`;
      this.subs = new Set(); 
      this.remove = this.delete; 
      this.evergreen = evergreen;
   }

   get size()   {
      return this.subs.size
   } 

   add(...args) {
      return this.subs.add(...args)
   } 

   delete(item) {
      return this.subs.delete(item)
   } 

   clear()      {
      return this.subs.clear()
   }
}


class HookBank {

   constructor(hostName, hooksConf, hooks=new Map()) {
      this.hostName = hostName; 
 
      Object.defineProperty(this, 'hooks', { get: ()=> hooks }) 

      hooksConf.forEach((newHook)=> { 
         this.hooks.set(
            newHook.name,
            new Hook(newHook.name, newHook.evergreen, hostName)
         )
         Object.defineProperty(
            this,
            newHook.name,
            {
               get: ()=> this.hooks.get(newHook.name)
            }
         ) 
      }) 
   }

   get list() {
      return Array.from(this.hooks.values())
   }

   get size() {
      return this.hooks.size
   } 

   get indices() {
      return Array(this.hooks.size).fill().map((_,i)=>i)
   }

   get totalObservers() {
      return this.list.reduce((p, [_,c])=> p + c.size, 0)
   } 

   register(opts) {
      return this.hooks.set(opts.name, new Hook(opts))
   }

   has(key) {
      return this.hooks.has(key)
   }

   clear() {
      return this.list.forEach(hook=> hook.clear())
   }

   run(key, ...args) {
      if (this.hooks.has(key)) {
         this.hooks.get(key).run.call(this.hooks.get(key),...args)
      }
   } 
} 
  
 
class Listener {

   #active = false;
   #initArgs;
   #host;

   constructor([host, ...entry]) { 
      this.#host = host 
      this.#initArgs  = entry  
   }

   get initArgs() {
      return this.#initArgs
   }

   get active() {
      return this.#active
   }  

   get host() {
      return this.#host?.bind ? this.#host() : this.#host
   }

   activate() {   
      if(this.active===false) {
         try {
            this.host?.addEventListener(...this.#initArgs);        
            this.#active = true;
         }
         catch (err) {
            console.warn(err) 
         }   
      }
   }

   deactivate() {
      if (this.active===true) {
         try { 
            this.host?.removeEventListener(...this.#initArgs)
            this.#active = false;
         }
         catch (err) {
            console.warn(err)
         }
      } 
   }
} 
 
 
class Subscription { 

   #conn
   #disconn
   #host
   
   constructor(name, _host, callback, opts) {    

      this.retries  = 0; 
      this.name     = name
      this.host     = _host;
      this.callback = callback  
      this.opts     = opts
 
      if (this.host != null) { 
         ;[this.#conn, this.#disconn] = this.host.addWatcher ?
            ['addWatcher','removeWatcher'] : ['subscribe','unsubscribe']; 
      } 
      
      this.start() 
   }

   set host(h) {
      if (typeof h === 'string' || (!(h.subscribe) && !(h.addWatcher))) {
         console.warn(h, { sub: this }) 
      }
      this.#host = h  
      ;[ this.#conn, this.#disconn ] = this.host.addWatcher ?
           ['addWatcher','removeWatcher']
         : ['subscribe','unsubscribe']; 
   } 

   get host() {
      return this.#host
   }  

   get(prop) { 
      return Reflect.get(this.host, prop) 
   }

   set(prop, val) { 
      return Reflect.set(this.host, prop, val) 
   }

   start(s) { 
      try {
         this.host[this.#conn](this.callback)
      }    
      catch (err) {  
         clearTimeout(this.timer)
         this.timer = setTimeout(()=> { 
            if (++this.retries < 5) {
               this.start(s)
            }
            else {
               this.retries = 0; 
            }
         }, 220 * (1 + this.retries)) 
      }
   }

   end() {
      this.host[this.#disconn]?.call(this.host, this.callback) 
   }

   changeTarget(s) { 
      if (s && s !== this.host) {
         this.end(); 
         this.host = s;
         this.start()    
         return true
      }
      else {
         return false    
      } 
   } 
}


 