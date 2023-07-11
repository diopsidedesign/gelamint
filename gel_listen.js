import Coord from '../../node_modules/coordlet/coordlet.js'
import { getHost, getElement } from './gel_dom.js'



export const observers = new WeakMap()


 


 

const getObserver = {  
   onOffScreen: (leftCallback, returnedCallback) =>  new IntersectionObserver( entries => {    
         if (entries[0].intersectionRatio <= 0) leftCallback(); 
         else returnedCallback(); 
      })
   ,
   windowResize: (callback) => new ResizeObserver( entries => { 
      if ('contentBoxSize' in entries[0] ) { 
         callback(entries[0].contentBoxSize);
      } 
   })
}










function initObs(target, observer) {      
   if (target.localName === undefined) target = this;
   const obs = observers.get(this); 
   obs[ target.localName+'_'+(target.id ?? 'observation')] = { target, observer } 
   observer.observe(target);
   obs.temp = {}
} 




let timer = 0

function addListener(el, eventType, func, opts) {    

   if (['screenLeave','screenReturn','resize'].includes(eventType)) {   
      const obs = observers.get(this)
      obs.temp[eventType] = func
      if (eventType.includes('screen')) { 
         clearTimeout(timer)
         timer = setTimeout(
            (funcs = Object.fromEntries(Object.entries(obs.temp).filter(
               ([name,_]) => ['screenLeave','screenReturn'].includes(name) ))
            ) =>
               initObs.call(
                  this,
                  getElement.call(this, el), 
                  getObserver.onOffScreen(
                     ...['screenLeave','screenReturn'].map( t =>
                        funcs[t] ? (funcs[t].bind ? funcs[t].bind(this) : funcs[t]) : (()=>{}))
                  )
               ), 20 ) 
      }
      else { 
         initObs.call(this, getElement.call(this, el), getObserver.windowResize(func));  
      }
   }   
   else {        
      if (eventType === 'scroll' || eventType === 'wheel')
         opts = { passive: true }
      const evtHost = getElement.call(this, el); 
      evtHost.addEventListener(eventType, func, opts ?? null)     
      return ( () => evtHost.removeEventListener(eventType, func));
   }
} 

export function prepareListenerDict(listenerDefs, selOrThis) { 
   return Object.entries(listenerDefs)  
      .filter( entry =>   entry[0] !== 'children' && entry[0] !== 'options')
      .map( entry => [ entry[0] === 'hashchange' ? window : selOrThis, ...entry ]) 
      .concat(listenerDefs.children ? listenerDefs.children.map( c =>
         (typeof c[1] == 'object') ? prepareListenerDict(c[1], c[0]) : [c]
      ).flat() : []) 
} 

export function applyListeners(defs, opts) { 
   const removeFlag = opts?.remove === true
   return prepareListenerDict(defs, this).forEach( listener => removeFlag ?
         getElement.call(this, listener[0]).removeEventListener(listener[1], listener[2])
         : addListener.call(this,...listener.concat(defs.options ?? []).flat())  
   ) 
} 












export function buildCommandResponder(defs, rspTable = {}) { 

   const detail = e => Reflect.get(e.detail, defs.commandDetail),
         event  = defs.commandEvent 

   Object.entries(defs)
      .filter( ([command, func]) => command !== 'commandDetail' && command !== 'commandEvent')
      .map( ([command, func]) => [ command, func?.bind ? func.bind(this) : func ])
      .forEach( ([command, func]) => 
         command.includes(',') ?
            command.replace(/\s/g,'').split(',')
               .forEach( c => rspTable[c] = func)
            : rspTable[command] = func 
   );

   return ({ 
      [event] : function(evt) {
         evt.stopPropagation();
         evt.preventDefault();
         const rcase = detail(evt) ?? detail;
         if      ('_beforeAll'  in rspTable) rspTable._beforeAll(evt) 
         if      (rcase         in rspTable) rspTable[rcase](evt) 
         else if ('_unhandled'  in rspTable) rspTable.unhandled(evt)
         if      ('_afterAll'   in rspTable) rspTable._afterAll(evt) 
      }
   })
} 




export function prepAttrDefs(defs, type, newDefs = {}) {

   if (type == 'behaviors') {
      Object.entries(defs).forEach(([attr, behaviors]) => {  
         const params =  Array.isArray(behaviors) && !(Array.isArray(behaviors[0])) ?
            { children: [ behaviors ] }
            : behaviors, 
            apply  = () => { this.applyListeners(params)  },
            remove = () => { this.removeListeners(params) }; 
         if (attr.startsWith('not_')) {
            attr = attr.replace('not_','')
            newDefs[attr] = { onadd: remove, onremove: apply }
            if (!this.hasAttribute(attr)) this.applyListeners(params)
         }
         else{ newDefs[attr] = { onadd: apply, onremove: remove } } 
      });  
   }

   else {
      Object.entries(defs).forEach( ([attr, respDefs]) =>   
         newDefs[attr] = (typeof respDefs === 'function' ?
            { onchange: respDefs.bind ? respDefs.bind(this) : respDefs }
            : { ...Object.fromEntries(
               Object.entries(respDefs)
                  .map( entry => [entry[0], entry[1].bind ? entry[1].bind(this) : entry[1] ]))
               })
      ) 
   }
   return newDefs
}
 