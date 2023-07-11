import { fill, writeAttrs, addElRefs, isElemOrWindow, defineAttrAccessor } from './gel_dom.js'
import { filterPropsFromObj, addMethodsToObj, mimic } from './gel_util.js'
import { reserved, htmlTags } from './gel_conf.js'
import { applyListeners } from './gel_listen.js'
import { blueprints } from './gel_mint.js'







export function el(tagName, elDef = {}, opts) {    

   let outputPipe = null;

   if (opts && typeof opts === 'object') {
      if ('assignRefs' in opts) {
         outputPipe = el => { 
            Object.entries(opts.assignRefs).forEach( entry => Reflect.set(entry[1], entry[0], el))
            return el
         }
      }
   }

   if (blueprints && Object.keys(blueprints).includes(tagName) ) {  
      return outputPipe( new blueprints[tagName]({
         listeners: elDef.listeners,  
         renderProps: filterPropsFromObj(elDef, ([prop,val]) => !(reserved.has(prop)) ) 
      }))
   } 

   const newEl = ['svg','circle','circ','text','path','g','rect','ellipse']
      .includes(tagName) ? document.createElementNS('http://www.w3.org/2000/svg', tagName) :
         htmlTags.includes(tagName) ? document.createElement(tagName) : tagName;

   if (!newEl)  
      throw new Error('Problem with creating element - output is undefined?') 

   if (tagName == 'svg') {
      if (elDef && !elDef.xmlns) elDef['xmlns'] = 'http://www.w3.org/2000/svg';
      if (elDef && !elDef.preserveAspectRatio) elDef['preserveAspectRatio'] = 'xMidYMid meet' 
   }  
   return adorn(newEl, elDef, outputPipe) 
} 







export function adorn(el, opts, callback) { 

   if (isElemOrWindow(el) && typeof opts === 'string') {
      defineAttrAccessor(el, opts);
      return callback === true ? Reflect.get(el, opts) : null
   } 

   if (opts?.props)
      mimic(opts.props, el, true)

   if (opts?.contents)
      fill(el, opts.contents)  
  
   if (opts?.attrProps)
      opts.attrProps.forEach( attr =>  defineAttrAccessor(el, attr))

   if (opts && isElemOrWindow(el)) {
      writeAttrs(el, opts, { ignore: reserved })
      if (opts?.listeners) 
         applyListeners.call(el, opts.listeners)
   }   

   if (opts?.methods) 
      addMethodsToObj.call(this, el, opts.methods)
   
   if (callback) 
      return callback(el) 

   return el
}