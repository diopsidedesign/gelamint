import * as REF from './ref.js'

// Gelamint's 'junk drawer'; general-purpose functions
// that are used in many other places or just don't fit in 
// anywhere else
export const funcs = {

   // fetches remote content using the native 'fetch' method, caching results
   cachedFetch: (function(){

      const memos = new Map() 

      return function(url, type) {
         let content = ``
         return new Promise(async done => {
            const fileExtension = url.replace(/^.*\.(?!\.$)/g,'') 
            if (done && url?.length) {         
               if (memos.has(url)) {
                  done(memos.get(url)) 
               }
               else {
                  const resp = await fetch(url, {
                     cache:   "no-cache",
                     headers: {
                        "Content-Type": REF.MIMETYPES['.'+fileExtension] ?? 'text/plain'
                     } 
                  }) 
                  if (fileExtension === 'json' && type!=='text') {
                     content = await resp.json();
                  } 
                  else {
                     content = await resp.text(); 
                  }
                  memos.set(url, content);
                  done(memos.get(url)) 
               }
            }
         })
      }
   })(),

   capitalize(str) {
      return str[0].toUpperCase() + str.slice(1)
   },

   debounce(f, t=100, id) {
      return function(...args) {
         clearTimeout(id);
         id = setTimeout(()=> f.apply(this, args), t)
      }
   },

   // if 'toObj' is a function evaluate it using the provided 'this'
   // if the result is still a function, call this same 
   // function again on the result. if the result is not a function,
   // return it
   evalTilNotFunc(_this , toObj, ...args) { 
      if (!!toObj?.bind) {
         return funcs.evalTilNotFunc(_this, toObj.call(_this, ...args))
      }
      return toObj
   },
 
   extend(obj, defs, opts={}) {      

      const ignore = opts.ignore ?
           [...opts.ignore]
         : [];

      const entries = Array.isArray(defs) ?
           defs
         : Object.entries(Object.getOwnPropertyDescriptors(defs));

      entries.forEach(([prop, desc])=> {
         if (!(ignore.length) || (ignore.length && !(ignore.includes(prop)))) {
            Object.defineProperty(obj, prop, funcs.recursiveRebind(desc, obj, true))
         }
      }) 

      return obj
   },

   // make a copy of an object but without certain properties
   // indicated via the filter function
   filterPropsFromObj(obj, filter) { 
      return Object.fromEntries(Object.entries(obj).filter(filter))
   }, 

   // coerces data to a string and returns a simple hash for the string
   // (I originally got this from a very helpful comment on stack overflow,
   // but unfortunately now I cannot locate the source :( )
   hash(any, str=String(any)) {
      return (h=>h^h>>>9)(
         [...str].reduce( (a,_,i)=> Math.imul( a^str.charCodeAt(i++), 9**9 ),9)
      )
   },  

   // A general purpose function for inserting content into the DOM subtree 
   // of an element (this) 'contents' can be a list or single item
   // for each item 'content':
   // - if it is a function, it is evaluated and insertContent is then called 
   //   on the result
   // - if it is an event target / dom node, it is appended
   // - if it is a string, interpret it as markup and set elements innerHTML 
   //   to the string
   insertContent(contents) {   
      [contents].flat().forEach( content => {  
         if (typeof content === 'function') {
            content = funcs.evalTilNotFunc(this, content)
            if (Array.isArray(content)) {
               return funcs.insertContent.call(this, content) 
            }
         } 
         if (content instanceof EventTarget ) {
            (this.content ?? this).appendChild(content)   
         }
         else if (!Array.isArray(content) && content?.length) {
            this.innerHTML = (this.innerHTML ?? '') + content; 
         }
      })
      return this
   },

   isLetter(char) {
      return char.toLowerCase() !== char.toUpperCase()
   },

   // 'g' is an object whose properties are functions that help manipulate
   // template markup in our web components
   // The ambiguous name is chosen for brevity and because the properties
   // that follow it usually provide enough context to explain the use in context

   //  Example - template looping:  `
   //      <div class="loop-container">
   //        ${ Gel.g.for([1,2,3,4,5]).of(num=> `<span>${num}</span>`)}
   //      </div>
   //  `
   // is evaluated to `
   //      <div class="loop-container">
   //         <span>1</span>
   //         <span>2</span>
   //         <span>3</span>
   //         <span>4</span>
   //         <span>5</span>
   //      </div>
   // `
   // Example - conditional markup:  `
   //     ${Gel.if(myBool, `<span>myBool is true</span>`)}
   // `
   // will only display the content 'myBool is true' if the variable
   // myBool evaluates to true. If not, no markup is parsed.
   g: {
      // for generating markup by iterating over sets/lists
      for(list) { 
         return Object.seal(Object.create(null, {
            of : {
               value: (
                  (data)=> (callback)=> data.reduce(
                     (acc, curr, i)=> acc + callback(curr, i),``
                  )
               )(list)
            }
         }))
      }, 
      // for wrapping html markup in a tag
      tag(tag, attrs, spacing, contents=``) { 
         const spacer = spacing ?
              (' '.repeat(spacing*3))
            : '';
         return Object.entries(attrs).reduce((prev, [prop,val])=> {
            const dl = (typeof val==='number' ? '' : '"')
            return prev +
               ('\n    '+ spacer + funcs.toDashSep(prop) +` = ${dl + val + dl}`)
            },
            `<`+tag
         ) +`>` + contents + `\n`+ spacer +`<\/${tag}>`
      }, 
      // for conditionally showing markup - if pred is false, blank is returned.
      // if you want this to work like an if/else, provide some value for blank
      // other than ''
      // Default behavior returns nothing when pred is false
      if(pred, select, blank = ``) { 
         return !!pred ?
              select
            : blank
      }
   },

   // general purpose DOM element creator function
   makeEl(tagName, opts) {   
      const el = REF.SVGTAGS.has(tagName) ?
           document.createElementNS('http://www.w3.org/2000/svg', tagName)
         : (REF.HTMLTAGS.has(tagName) ?
                 document.createElement(tagName)
               : (typeof tagName=='string' ?
                       document.createTextNode(tagName)
                     : tagName)
            ); 
      if (opts) { 
         if (opts.contents) {
            funcs.insertContent.call(el, opts.contents) 
         }
         if (opts.listeners) {
            Object.entries(opts.listeners).forEach(
               ([evType,evFunc])=> el.addEventListener(evType, evFunc)
            ) 
         }
         funcs.writeAttrs.call(el, opts, { ignore: [
            'contents','listeners','render'
         ] })
      } 
      return el
   },

   // converts all accessor properties in an object to lazy accessors
   makeLazy: (function(){

      const cache = new Map() 

      return function _makeLazy(init) {
         const clone = {}
         Object.getOwnPropertyNames(init)
            .concat(Object.getOwnPropertySymbols(init))
            .map((prop)=> [ prop, Object.getOwnPropertyDescriptor(init, prop)])
            .forEach(([prop, descr])=> { 
               if (  typeof descr.value === 'object'
                  && descr.value.constructor.name === 'Object') {
                  Object.defineProperty(clone, prop, {
                     value: _makeLazy( descr.value )  
                  })
               }
               else if (!!descr.get?.bind) {
                  Object.defineProperty(clone, prop, {
                     get: function() {
                        if (!cache.has(prop)) {
                           cache.set(prop, descr.get.call(init))
                        }
                        return cache.get(prop)
                     }
                  })
               }
               else {
                  clone[prop] = init[prop]
               }
            }) 
         return clone
      } 
   })(),
 
   memoize: ( function(){   
      const defaultKeyFunc = (...a)=> JSON.stringify(a)
      return (makeKeyFunc = defaultKeyFunc,
              cache       = new Map())=> {     
         const add = (k,v)=> {
            cache.set(k,v);
            return v
         };
         if (typeof makeKeyFunc !== 'function') {
            makeKeyFunc = defaultKeyFunc; 
         }
         return (func)=>
            function(...args) {    
               const key = makeKeyFunc(args) 
               return cache.has(key) ?
                    cache.get(key)
                  : add(key, func(...args)) 
            } 
      }
   })(),
 
   rand(a,b) {
      if (b==null) {
         return Math.random()*a
      }
      return Math.random()*(b-a) + a 
   },
 
   rafThrottle(func, raf, data){
      return function (...args) {
         data = [this, args];
         if (raf == null) {
            raf = requestAnimationFrame(()=> {
               func.apply(...data);
               raf = null;
            })
         }
      }
   },

   // iterates through each property of an object 'fromObj' - if property,
   // is a function, binds that function to the provided 'toObj' reference. 
   recursiveRebind: ( function(){ 

      // used to prevent recursion infinite loops that might arise
      // from circular references
      const recursGuard = new WeakSet() 

      const newo = {}

      return function bindLvl(fromObj, toObj, shallow) {   

         Object.entries(fromObj).forEach(([prop,val])=> {

            if (val?.constructor?.name!=='Object') {
               newo[prop] = (typeof val==='function') ?
                    val.bind(toObj)
                  : val;  
            }
            else if ( shallow !== true
                 && !(recursGuard.has(val))
                 && (Array.isArray(val) || val.constructor?.name === 'Object')
            ) {
               recursGuard.add(val)
               bindLvl(val, toObj)
            }
         }) 
         return newo
      } 
   })(),
 
   round(val, decPlcs) {
      if (Array.isArray(val)) {
         return val.map(v => funcs.round(v, decPlcs))
      }
      else {
         return Math.round(val * 10**decPlcs) / 10**decPlcs
      } 
   },

   // in: whatever -> out: template element
   templify(contents, attrs) {
      if (contents instanceof HTMLTemplateElement) {
         return attrs ?
              funcs.writeAttrs.call(contents, attrs)
            : contents
      }
      const d = document.createElement('template') 
      funcs.insertContent.call(d, contents) 
      if (attrs) {
         funcs.writeAttrs.call(d, attrs) 
      }
      return d
   },
 
   throttle(func, time, throttld=false, state=[]) {
      return function throttlr(...args) { 
         if (throttld) {
            return state = [this, args];
         }
         throttld = true;
         func.apply(this, args);  
         setTimeout(()=> {
            throttld = false;
            if (state[1]) {
               throttlr.apply(...state);
               state = []
            }
         }, time) 
      } 
   }, 
 
   // i.e "im-dash-separated" --> "imDashSeparated"
   toCamelCase(str) {
      return (
            !(str[0].toLowerCase() !== str[0].toUpperCase()) ?
              str.replace(/^[^a-zA-Z]*/,'')
            : str
         ).split(/[^a-zA-Z0-9]/g)
          .map((w,i) => w.charAt(0)[i === 0 ?
            'toLowerCase':'toUpperCase'
            ]() + w.slice(1)
          )
          .join('')
   },
 
   // i.e  "myCamelString" --> "my-camel-string"
   toDashSep(str){
      return str.replace(/[A-Z]/g, (z)=>`-`+z.toLowerCase())
   }, 

   STR: {
      abc: 'abcdefghijklmnopqrstuvwxyz'
   },

   // appends some chars to a string that helps ensure its uniqueness
   uniquify(s, n=4) {
      return `${s}_${Date.now().toString().slice(-(n-2))}${
         ''+ randChar(Math.max(1, n-2), STR.abc)}`
   },

   // Write all properties and their values in 'attrDict' as
   // attributes to this element
   writeAttrs: (function(){

      const falseyStrings  = ['false', 'undefined', 'null', '!'];

      return function (attrDict, opts = { ignore:[] }) {     
         Object.entries(attrDict).forEach( ([prop, val]) => {  
            if (!(opts.ignore.includes(prop))) {
               if (typeof val === 'function' && val.call(this)) {
                  this.setAttribute(prop, '') 
               }
               else if (!(falseyStrings.includes( val + '' ))) {
                  this.setAttribute(prop, val)   
               }
            } 
         }) 
         return this
      }
   })()
}
 
 
