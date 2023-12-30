import { Vald }       from './validate.js'
import { funcs }      from './funcs.js'
import { Descriptor } from './descriptor.js'
import { Hook }       from './classes.js'
import { Behavior }   from './classes.js'
import { FlexRef }    from './classes.js' 

export {
   MutationRelay,
   PubSubRelay,
   IntersectionRelay,
   ResizeRelay,
   AttrRelay,
   PropRelay,
   InputRelay
}

const Relay = (function(){

   const Keys = {
      value:      Symbol('Relay: value'),
      lastValue:  Symbol('Relay: lastValue'),
      valueType:  Symbol('Relay: valueType'),
      generate:   Symbol('Relay: generate'),
      coordinate: Symbol('Relay: coordinate'),
      observer:   Symbol('Relay: observer'),
      behavior:   Symbol('Relay: behavior'),
      options:    Symbol('Relay: options'),
      callback:   Symbol('Relay: callback'),
      defaults:   Symbol('Relay: defaults'), 
      active:     Symbol('Relay: active'),
      init:       Symbol('Relay: init'),
      count:      Symbol('Relay: count'),
      stream:     Symbol('Relay: stream'),
      blank:      Symbol('Relay: blank'),
      accessors:  Symbol('Relay: accessors'),
      ref:        Symbol('Relay: ref'),
      get:        Symbol('Relay: get'),
      set:        Symbol('Relay: set')
   }

   const valueTypes =  (function() {  
      // change detection functions for number and string values
      // if the return conditions are satisfied 
      const chgd = {
         num(newVal, val){ 
            val = val ?? this.value;  
            return (Math.round(parseFloat(newVal))
                !== Math.round(parseFloat(val))
            )
         },
         str(newVal, val){ 
            val = val ?? this.value;
            return    val?.toString()?.toLowerCase()
                !==newVal?.toString().toLowerCase()
         }
      }  

      const rgb = [ chgd.num, Vald.rgb ],
            prc = [ chgd.num, Vald.percentage ];

      // different preset value types for relays  
      // consists of a tuple: ["change detection function","validator function"]
      return ({
         red: rgb,
         green: rgb,
         blue: rgb,
         cyan: prc,
         magenta: prc,
         yellow: prc,
         k_black: prc,
         saturation: prc,
         lightness: prc,
         hue: [ chgd.num, Vald.hue ], 
         hex: [ chgd.str, Vald.hex ],
         string: [ chgd.str, s=> typeof s === 'string' ],
         attribute: [ chgd.str, (v=>Vald.boolean(v) || Vald.nameStrict(v)) ], 
         class: [ chgd.str, (v=>Vald.boolean(v)) ]
      })
   })()

   return class _Relay  {    

      // blank getter setters for establishing default behavior
      static get [Keys.blank]() {
         return [ ()=>{}, ()=>{} ]
      }
      
      static get keys() {
         return Keys
      } 

      // call gelamint's new and improved version of 'getOwnPropertyDescriptor'
      static Describe(obj, prop) {
         return new Descriptor(obj, prop)
      } 

      // determines when a relay value has changed enough to be considered 'dirty'
      detectChange = ()=> true; 

      // determines when a relay has a valid vs invalid value
      validate = ()=> true; 

      // need to update this terminology - 'stream' is from an old version
      // getter for the field we use to store the Hook instance 
      get stream() {
         return this[Keys.stream]
      };

      // getter/setter tuple
      // initialize both w functions that return blank objects ()=>{}
      [Keys.accessors] = _Relay[Keys.blank]; 

      // tracks number of times relay has been toggled on/off
      [Keys.count] = -1;    

      // caches previous valid value 
      [Keys.lastValue] = null;
      get lastValue() {
         return this[Keys.lastValue] 
      };
      set lastValue(v) {
         return this[Keys.lastValue] = v
      } 

      // the actual value of the relay
      [Keys.value] = null;
      get value() {
         return this[Keys.value]
      };
      set value(v) {
         return this[Keys.value] = v
      }   

      // so we can toggle the relay on / off
      [Keys.active] = false;
      get active() {
         return this[Keys.active]
      };
      set active(v) {
         return this[Keys.active] = v
      }

      // determines how validation and change detection are handled
      [Keys.valueType] = 'string';
      get valueType() {
         return this[Keys.valueType]
      };
      set valueType(v) { 
         if (v in valueTypes) {
            [ this.detectChange, this.validate ] = valueTypes[v].map(
               f=> f.bind(this)
            ); 
            this[Keys.valueType] = v;
         } 
      }   

      // another layer of abstraction over the getter/setter if needed
      get() {
         return this[Keys.get]()
      } 
      set(v) {
         return this[Keys.set](v)
      }  
      get [Keys.get]() {
         return this[Keys.accessors][0]
      }
      get [Keys.set]() {
         return this[Keys.accessors][1]
      } 
       
      get [Keys.defaults]() {
         return [ ()=>{}, (v)=> this.updateValue(v) ]
      }  

      // element within the host element DOM subtree that actually contains 
      // the relay (if needed) can be same as host
      get target() {
         return this[Keys.ref].target ?? this[Keys.ref].host
      }  

      // host element containing the relay
      get host() {
         return this[Keys.ref].host
      }   
    
      // update value of the relay, running the detect change and
      // validation functions on the provided value. if it passes the checks,
      // emit updates /  trigger callbacks
      updateValue(inputVal) {   
         if (inputVal !== undefined) {  
            if (this.validate(inputVal)) {   
               if (this.detectChange(inputVal)) {     
                  this.value = inputVal;  
                  this[Keys.stream].run(this.value) 
                  return true
               }
               else {
                  return null           
               }
            } 
            else { 
               this.value = this.lastValue;  
               this[Keys.stream].run(this.value) 
               if (  this.origDescriptor.set!=null
                  &&(this.target.value !== this.value)) {
                  this.origDescriptor.set?.call(this.target, this.value)
               }
               this.host.tempSetAttr('reset', 440, this.target) 
               return false
            }
         }  
         return false
      }  

      // in case we need to clone the relay
      get description() {
         return ({
            configurable:  true,
            enumerable:    true,
            get: this[Keys.get],
            set: this[Keys.set]
         })
      } 

      // shortcut function for quick validation of values
      verify(val, compare) { 
         return val!=null
             && this.validate(val)
             && this.detectChange(val, compare)
      }

      // for keeping track of observers (watchers)
      watcherQueue = [];

      addWatcher(func, opts) {
         if (!this.active) {
            return this.watcherQueue.push([func, opts]) 
         }
         return this[Keys.stream].add(func)
      }
      removeWatcher(func) {
         this[Keys.stream].remove(func)
      }
    
      enable()  {  
         this[Keys.accessors] = this[Keys.defaults]
         if (this.onEnable != null) {
            this.onEnable() 
         }
         if (this[Keys.init] && !(++this[Keys.count])) {
            this.set(this[Keys.init]())
            this.lastValue = this.value;
         }
         this.active = true;
         while(this.watcherQueue.length) {
            this.addWatcher.apply(this, this.watcherQueue.pop()) 
         }
      }

      disable()   {
         if (this.active === false) {
            return;
         }
         if (this.onDisable != null) {
            this.onDisable()
         }
         this[Keys.accessors] = _Relay[Keys.blank];
         this.active = false;
      } 
    
      constructor(host, config, descriptor) {     

         this.relayType    = this.constructor.name; 

         this[Keys.stream] = new Hook(
            this.constructor.name,
            true,
            (host.uid ?? host.localName ?? host.name)
         ); 

         if (config.valueType) {
            this.valueType = config.valueType 
         }
         if (config.name) {
            this.name = config.name;
         }

         // can set these directly instead of valueType if you want
         if (config.detectChange) {
            this.detectChange = config.detectChange
         }
         if (config.validate) {
            this.validate = config.validate  
         }

         // adds the callback function to the Hook instance created above
         if (config.callback) {
            this.addWatcher(config.callback.bind(this))  
         }

         this.origDescriptor = descriptor ?? this.description;
         this[Keys.ref] = new FlexRef([ host, config.target ?? host ])      
         this[Keys.accessors] = this[Keys.defaults]; 
      }
   }

})()

const Keys = Relay.keys  

// Relay for HTML Input Elements
class InputRelay extends Relay {  
   
   // overriding the getter/setter defaults on the parent class prototype
   get [Keys.defaults]() { 
      return [
         // default getter
         ()=> this.fullPrecision ?? this.origDescriptor.get.call(this.target),

         // default setter
         (value)=> {  
            const v =  value  
            if (this.updateValue(v)) { 
               // for numerical values, we save a full precision, unrounded 
               // copy of the value under the variable this.fullPrecision
               if (this.isNumeric) {
                  this.fullPrecision = v;
               }
               this.origDescriptor.set.call(
                  this.target,
                  this.isNumeric ?
                       round(v, this.displayRound ?? 0)
                     : v
               ) 
            }
         }
      ]
   };  
  
   get [Keys.generate]() {      
      
      return new Behavior(this.target, [

         // Input Event handler
         [
            this.target,
            this.type==='text' ?'change':'input',
            (e)=>{ 
               e.stopPropagation(); 
               const t = e.target 
               this.set(t.valueAsNumber ?
                  round(t.valueAsNumber, this.round) :
                 (!isNaN(parseFloat(t.value)) ?
                     round(parseFloat(t.value), this.round) : t.value))
            },
            { capture: true }
         ],   
         // Focus Event Handler
         [
            this.target,
            'focus',
            e=> { 
               const et = e.target;
               const vz = this.isNumeric && et.valueAsNumber!=null ?
                    et.valueAsNumber
                  : et.value;
               const upd = this.validate(vz) ?
                    vz
                  : this.lastValue;
               this.lastValue = upd;
            },
            {}
         ],
         // prevents unintended drag-drop behavior on an input
         [
            this.target,
            'dragstart',
            e=> e.preventDefault(),
            { capture: true }
         ]  
      ]) 
   }   

   // immediately commit value to the input relay, skipping validation
   directWrite(val) {    
      const v = val 
      if (this.value !== v) {
         this.origDescriptor.set.call(this.target, v)
      }
   }
 
   onDisable = ()=> {  
      this[Keys.behavior].disable()
      Object.defineProperty(this.target, 'value', this.origDescriptor)   
   }

   onEnable = ()=> {  
      Object.defineProperty(this.target, 'value', this.description)
      this[Keys.behavior].enable() 
   }
  
   constructor(host, config) {   

      const target = is.func(config.target) ?
           config.target()
         : config.target; 

      if (is.func(config.owner)) {
         config.owner = config.owner()
      }
 
      if (config.owner && config.prop) {    
         // callback triggered when external changes are being relayed to 
         // the input from outsied
         config.callback = val=> {  
            let v = val;
            if (this.isNumeric) {
               v = parseFloat(v)
            }
            const curr = Reflect.get(config.owner, config.prop)
            if (this.verify(v, curr)) {
               if (v!==curr) {
                  Reflect.set(config.owner, config.prop, v)
               }
            }
         }  
         config.init = config.init ?? Reflect.get(config.owner, config.prop);
      }
 
      super(host, config, Relay.Describe(target, 'value'));    

      this.prop = config.prop;

      // check if any of the following attributes exist on our target element,
      // and if they do, read their values and create a new property on this 
      // relay to store that attribute and its value
      ;[
         'max',
         'min',
         'step',
         'display-round',
         'round',
         'type',
         'value-type'].forEach(opt=> {
         if (this.target.hasAttribute(opt)) { 
            let attrval = this.target.getAttribute(opt)  
            if (  !(opt.includes('type'))
               && !(opt==='step' && attrval==='any')) {
               attrval = parseInt(attrval)  
            }
            Reflect.set(this, funcs.toCamelCase(opt), attrval)
         }
      })  
   
      // set the appropriate boolean if this seems like a numeric input
      if (( this.type==='range' && this.valueType.toString().length === 1)
        || (this.type==='text' && !(['string','hex'].includes(this.valueType)))
         ) {
            this.isNumeric = true    
      }  

      this[Keys.init] = (()=>
         config.init ?? this.target.value ?? this.target.defaultValue
      ); 

      this[Keys.behavior] = this[Keys.generate];
      
      this.enable()    
   } 
 } 
 
class AttrRelay extends Relay { 

   get [Keys.defaults]() {

      return [
         // default attribute relay getter

         // if attr is present, but length of its value is 0, return true
         // if attr is present, and length of its value is > 0, return value
         // if attr is not present, return false
         ()=> (attr=> typeof attr==='string' && !attr.length ?
                 true
               : (!!attr ? attr : false)
              )(this.host.getAttribute(this.attr)),

         // default attribute relay setter
         (val)=> {    
            // If incoming value is null or any of these strings below, remove
            // the attribute. else if incoming value is not equal to null, and 
            // not equal to false, set the attribute on the relay
            if (  val == null
               || ['!','false','none','undefined','null'].includes('' + val)) {
               this.host.removeAttribute(this.attr)  
            }
            else if (val === true || val !== true) {
               this.host.setAttribute(
                  this.attr,
                  (val===true || !val) ? '' : val
               )
            }
         }
      ]  
   } 

   constructor(host, config) {       

      config.valueType = 'attribute' // <<- for validation / type checks

      super(host, config);   

      this.attr = config.attr      

      // add a bound property to the host object
      this.onEnable = ()=> Object.defineProperty(
         this.host,
         funcs.toCamelCase(this.attr),
         this.description
      )  

      this[Keys.init] = (c = this.host.getAttribute(this.attr)
                          ?? this.host.host?.getAttribute(this.attr)
                          ?? this.host.hasAttribute(this.attr))=> { 
         if (c !== undefined) {
            if (c===null) {
               return false 
            }
            if (c.toString()==='true' || c.length===0) {
               return true  
            }
            return c
         }
         else {
            return false
         }
      }  
      this.enable()   
   }    
}
 
class PropRelay extends Relay  {      
   get [Keys.defaults] ()  {
      return [
         ()=> this.value,           // default getter
         (v)=> this.updateValue(v)  // default setter
      ]
   }  
   // override the property definition with our own modified definition
   onEnable  = ()=> Object.defineProperty(
      this.target,
      this.identifier,
      this.description
   );

   // restore the original definition via a copy of its original property 
   // descriptor
   onDisable = ()=> Object.defineProperty(
      this.target,
      this.identifier,
      this.origDescriptor
   ); 

   constructor(host, config) {   
      super(
         host,
         config,
         Relay.Describe(config.target, config.prop ?? config.property)
      );  
      this.identifier = config.prop ?? config.property 
      this[Keys.init] = ()=>
         Reflect.get(config.target, config.prop ?? config.property);
      this.enable()      
   } 
} 
  
class PubSubRelay extends Relay {       
   constructor(host, config) {    
      super(host, config);    
      [this.onEnable, this.onDisable] = (processor=> 
         [ ()=> this.target.subscribe(processor),
           ()=> this.target.unsubscribe(processor) ]
      )((note)=> this.stream.transmit(note));
      this.enable()
   } 
} 

class IntersectionRelay extends Relay {  
 
   static [Keys.callback](opts)  {
      return function(entries) { 
         entries.forEach((entry)=> { 
            if (entry.isIntersecting && !!opts?.inCallback?.bind) {
               opts.inCallback(entry)   
            }
            else if (!!opts?.outCallback?.bind) {
               opts.outCallback(entry) 
            }
        });
      }
   } 

   static [Keys.defaults](host) {
      return ({
         root: host ?? document,
         rootMargin: '0 0 0 0',
         threshold: 0
      }) 
   }

   static [Keys.observer]() {
      return new IntersectionObserver(
         this.callback
            ??
         IntersectionRelay[Keys.callback]({
            inCallback: this.inFunc,
            outCallback: this.outFunc
         })
      ) 
   } 

   ;[Keys.observer] = null;

   onEnable = ()=> {
      if (this[Keys.observer] == null) {
         this[Keys.observer] = IntersectionRelay[Keys.observer].call(this)
      }
      this[Keys.observer].observe(
         this.target,
         this[Keys.defaults] ?? IntersectionRelay[Keys.defaults]
      )
   }

   onDisable = ()=> this[Keys.observer].disconnect()
   

   constructor(host, config) {       
      super(host, config);    
      [ this.inFunc, this.outFunc ] = [ config.onEnter, config.onLeave ]; 
      this.enable() 
   }   
}
 
class MutationRelay extends Relay {  
 
   static get [Keys.options]() {
      return {
         attributes: true,
         childList: true,
         subtree: true
      }
   }  

   static [Keys.observer]() {
      return new MutationObserver(this.callback)
   }

   static [Keys.callback](opts) {
                                     // placeholder 
      return function(chgs, obsrvr) { console.log(chgs) }
   }  

   ;[Keys.options]  = MutationRelay[Keys.options];

   ;[Keys.observer] = null;

   ;[Keys.callback] = MutationRelay[Keys.callback]();

   onEnable = ()=> {
      if (this[Keys.observer] == null) {
         this[Keys.observer] = MutationRelay[Keys.observer].call(this)
      }
      this[Keys.observer].observe(
         this.target,
         this[Keys.options]
      )
   }

   onDisable = ()=> this[Keys.observer].disconnect() 

   constructor(host, config) {       
      super(host, config);  
      if (config.options) {
         this[Keys.defaults] = config.options
      }
      if (config.callback) {
         this.callback = this[Keys.callback] = config.callback.bind(this)
      }
      this.enable() 
   }   
}

class ResizeRelay extends Relay {   
 
   static [Keys.callback](opts) {
      return function(entries) {  }
   }  
   static [Keys.observer]() {
      return new ResizeObserver(this.callback ?? ResizeRelay[Keys.callback]())
   } 

   ;[Keys.observer] = null;

   onEnable = ()=> {
      if (this[Keys.observer] == null) {
         this[Keys.observer] = ResizeRelay[Keys.observer].call(this)
      }
      this[Keys.observer].observe(this.target)
   }

   onDisable = ()=> {
      this[Keys.observer].disconnect()
   } 
   
   constructor(host, config) {       
      super(host, config);    
      if (config.callback) {
         this.callback = config.callback
      }
      this[Keys.init] = null; 
      this.enable() 
   }   
}

