import { filterPropsFromObj } from './gel_util.js'

 
function toCamelCase(str) {  
   return str.replace(/^[^a-zA-Z]*/,'').split(/[^a-zA-Z0-9]/g).map(
      (w,i) => w.charAt(0)[i === 0 ? 'toLowerCase':'toUpperCase']() + w.slice(1)
   ).join('') 
}

 
export function readAttrs(el){
   return el.getAttributeNames().reduce(
      (obj, name) => ({ ...obj, [name]: el.getAttribute(name) })
   ,{})
}
 

export function writeAttrs(el, attrDict, opts) {  

   if (el !== undefined && attrDict !== undefined) {
      let target = attrDict;

      if (el && attrDict && (opts && 'ignore' in opts)) 
         target = filterPropsFromObj(attrDict, ([prop,val]) => !(opts.ignore.has(prop)) );     
         
      Object.entries(target).forEach( ([prop,val]) => {  
         if (typeof val === 'function') {
            if (val.bind ? val.call(el) : val())
               el.setAttribute(prop, '')
         }
         else if (!['false', 'undefined', 'null', '!'].includes(val+'')) 
            el.setAttribute(prop,  val)   
      });
      return el
   } 
  
} 


export function isElemOrWindow(obj) {
   return (obj instanceof Element
        || obj instanceof DocumentFragment 
        || obj instanceof Window)
} 


export function parseSelector(selStr) { 
   const info = { localName: null, id: null, classList: [] }
   selStr.split(/(?=[\.\#\s].)/g).forEach( part => {
      if (part.startsWith('.')) info.classList.push(part.slice(1))
      if (part.startsWith('#')) info.id = part.slice(1);
      else info.localName = part;
   })
   return info 
}





export function addElRefs(refArrOrDict){  
   (Array.isArray(refArrOrDict) ?
      refArrOrDict.map( sel => [ toCamelCase(sel), sel ] )
      : Object.entries(refArrOrDict ?? {}))
         .forEach(([identifier, selector]) => { 
            Object.defineProperty(this, identifier, {
               configurable: true, enumerable: true,
               get: function() { return (this.shadowRoot ?? this).querySelector(selector) }
            }) 
         }) 
} 


export function getHost(of) {  
   const
      parent = el => !el ? null :
         ((el.parentElement || el.offsetParent) ?
         (el.parentElement ?? el.offsetParent) : null),
      hsearch = (el, name) => {
         if (!el) return null;
         if (parent(el)?.localName === name) return parent(el) 
         return hsearch(parent(el), name) 
      }  
   return hsearch(of, 'gel-box') || hsearch(of, 'body') 
} 
 

const attrCache = new WeakMap()


export function defineAttrAccessor(onObj, attr, getFirstValBack) { 

   if (!attrCache.has(onObj))  
      attrCache.set(onObj, {})  

   let cached = attrCache.get(onObj)

   Object.defineProperty(onObj, toCamelCase(attr), {
      configurable: true,
      enumerable: true,
      get: function() {
         if (cached[attr] === undefined) {
            cached[attr] = onObj.getAttribute(attr);
            attrCache.set(onObj, cached)
         }
         if      (cached[attr] ===  '')  return true
         else if (cached[attr] === null) return false
         else return cached[attr]
      },
      set: function(val) { 
         if (val == null || ['!','false','none','undefined','null'].includes('' + val)) { 
            onObj.removeAttribute(attr);
            cached[attr] = null;
            attrCache.set(onObj, cached);   
         } 
         else if ((val === true && cached[attr] == null) || val !== true){ 
            const v = (val===true || !val) ? '' : val
            onObj.setAttribute(attr, v) ;
            cached[attr] = val;
            attrCache.set(onObj, cached);    
         } 
      }
   });
   if (getFirstValBack === true) 
      return Reflect.get(onObj, attr) 
} 
 

export function defineClassAccessor(onObj, cls) {
   Object.defineProperty(onObj, toCamelCase(cls), {
      configurable: true, enumerable: true,
      get: function() { return this.classList.contains(cls) },
      set: function(val) {
         if (!val &&  this.classList.contains(cls)) this.classList.remove(cls)
         if  (val && !this.classList.contains(cls)) this.classList.add(cls)
      }
   })
}  
 

export function fill(el, contents) {  
   [].concat(contents).forEach( content => { 
      if (typeof content === 'function') {
         content = content.bind ? content.call(el) : content();
         if (Array.isArray(content))
            return fill(el, content) 
      } 
      else if (isElemOrWindow(content)) 
         (el.content ?? el).appendChild(content) 
      else if (!Array.isArray(content) && content?.length)   
         el.innerHTML = content;      
   })
   return el
} 


export function getElement(strOrEl) {  
   if (isElemOrWindow(strOrEl))
      return strOrEl  
   if (typeof strOrEl === 'string') { 
      const search = (this.shadowRoot ?? this).querySelector(strOrEl)   
      if (search) return search 
      for (const tmpl of (this.shadowRoot ?? this).querySelectorAll('template') ) {
         search = tmpl.content.querySelector(strOrEl) 
         if (search) return search
      }
      if (strOrEl in this && isElemOrWindow(Reflect.get(this, strOrEl)))  
         return strOrEl
      return null 
   } 
   return strOrEl
}  

