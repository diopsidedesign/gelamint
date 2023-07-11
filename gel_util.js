import { reserved } from './gel_conf.js'


export function filterPropsFromObj(obj, filterFunc) {
   return Object.fromEntries(Object.entries(obj).filter(filterFunc))
}


export function addMethodsToObj(el, defs) { 
   defs = typeof defs === 'function' ? (defs.bind ? defs.bind(el)() : defs()) : defs;
   Object.entries(defs)
      .forEach(([mName, func]) => {
         Object.defineProperty(el, mName, clonePropDescForNewObject(defs, el, mName)) 
      });
}


function clonePropDescForNewObject(fromObj, toObj, prop) {  
   let fromPropDesc = Object.getOwnPropertyDescriptor(fromObj, prop),
            newDesc = {}; 
   if (!('set' in fromPropDesc) && !('get' in fromPropDesc)) {
      newDesc = {
         writable:     true,
         enumerable:   true,
         configurable: true,
         value: typeof fromPropDesc.value === 'function' ?
            fromPropDesc.value.bind(toObj) : fromPropDesc.value
      }
   } else if ('get' in fromPropDesc) {
      newDesc = {
         enumerable:   true,
         configurable: true,
         get: fromPropDesc.get.bind ? fromPropDesc.get.bind(toObj) : fromPropDesc.get
      }
      if ('set' in fromPropDesc && fromPropDesc.set !== undefined) 
         newDesc['set'] = fromPropDesc.set.bind ? fromPropDesc.set.bind(toObj) : fromPropDesc.set; 
   } 
   return newDesc
} 


export function mimic(objFrom, objTo, ignore) {    
   if (ignore === true) ignore = reserved;
   if (objFrom && objTo) {
      Object.keys(objFrom)
         .concat(Object.getOwnPropertyNames(objFrom))
         .filter( prop => !(ignore.has ? ignore.has(prop) : ignore.includes(prop)))
         .forEach( prop => {     
            Object.defineProperty(objTo, prop, clonePropDescForNewObject(objFrom, objTo, prop));
         }) 
   } 
} 


export function Courier() { 
   const cache = new Map();
   this.fetch = async (url, asText) => new Promise( callback => {
      if (callback && url?.length) {         
         if (cache.has(url)) callback(cache.get(url)) 
         else {
            fetch(url).then( async content => {
               if (asText !== false)
                  content = await content.text() 
               cache.set(url, content);
               callback(content)
            })
         }
      }
   })  
} 


export function Flag(lock = null, queue = [], changed = false) {    
   this.addLock = l => lock = l;
   this.whenReady = todo => queue.push(todo);
   this.standby = debounce( async () => {
      if (lock) await lock.then(x => queue.forEach(f => f()));
      else queue.forEach(f => f());
   }, 35) 
}


export const debounce = (func, delay = 300, timer) => function(...args) {
   clearTimeout(timer)
   timer = setTimeout( () => func.apply(this, args), delay)
}


export const throttle = (
   func, time,
   isThrottled=false,
   state=[] ) => function throttlr() { 
      if (isThrottled) return state = [this, arguments];
      isThrottled = true;
      func.apply(this, arguments);  
      setTimeout( function() {
         isThrottled = false;
         if (state[1]) { throttlr.apply(...state); state = []; }
      }, time) 
   }

export const uniquify = (str) => str.toLowerCase().replace('-','') 
  + '_' + (Date.now().toString().slice(-4)) + (Math.floor(Math.random() * 100));

export const segregate = (arr, filterCond, a=[], b=[]) => {
   arr.forEach( item => filterCond(item) ? a.push(item) : b.push(item) ) 
   return [a,b] 
}