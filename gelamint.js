// gelamint 0.1 
import { GelSheet } from './gelsheet.js'
import * as Settings from './gelconf.js'

const windowFadeTime = Settings.windowFadeTime

export { windowFadeTime }






 









// Gelamint - A handy base web-component class that all others can inherit from
// uses constructable stylesheets API for style scoping and shadow DOM for templating
export class Gelamint extends HTMLElement {  



   static dashSepToCamelCase(str) {
      return str.split('-').reduce( (a, b)=> a + b.charAt(0).toUpperCase() + b.slice(1) ).replace(/[^a-zA-Z0-9]/g,'') 
   }



   static #gelForms = {}




   static imitate(objFrom, objTo = this) { 
      Object.entries(objFrom).forEach(([prop,val]) => {  
         if (!Settings.gelamintReserved.includes(prop)) {
            const descCopy = { ...Object.getOwnPropertyDescriptor(objFrom, prop) } 
            if (typeof val === 'function') { 
               descCopy.value = val.bind ? val.bind(objTo) : val
            }
            Object.defineProperty(objTo, prop, descCopy ) 
         } 
      }) 
   }







   static makeCustomEl(elName, config, context, getNew) { 
      if (customElements.get(elName) === undefined) {
         const classDef = Gelamint.#gelForms[elName]
                        = Gelamint.#createDerivedClassDef(
            config,
            context
         )
         customElements.define(elName, classDef)
         return getNew === true ? new classDef() : classDef
      }  
      return Gelamint.#gelForms[elName]
   }

   static #createDerivedClassDef(config, context) {  

      return class extends this {
             
            static { 
               if ('static' in config) {
                  Gelamint.imitate.bind(this)(config.static); 
                   if (config.static.oninit) {
                     config.static.oninit.bind ?
                        config.static.oninit.bind(this)()
                        : (config.static.oninit() ?? config.static.oninit)
                  }
               } 
            }

            static get boundStyles()        { return [].concat(config.boundStyles ?? []) } 
            static get observedAttributes() { return Object.keys(config.attrObservers ?? []) }

            get us()   { return this.constructor } 

            constructor() { super(); 

               this.imitate = Gelamint.imitate.bind(this);

               [this.styles, this.template] = [config.styles, config.template] 

               this.render() 

               if (config.attrObservers) {
                  Object.entries(config.attrObservers).forEach( ([attr, respDefs]) => {
                     if (typeof respDefs === 'function') {
                        config.attrObservers[attr] = { onchange() { respDefs.bind(this)() } }
                     } else {
                        Object.entries(respDefs).forEach( ([respType, func]) => { 
                           config.attrObservers[attr][respType] = func.bind(this)
                        })
                     } 
                  })
               }
               if (config.listeners && typeof config.listeners === 'object') {
                  this.addListener(config.listeners)
               } 

               const propList = Object.keys(config),
                     eventNames = Settings.eventNames 

               propList.filter( key => eventNames.includes(key))
                       .forEach( eventName => {
                  const opts = {
                     passive: 'onscrollonwheel'.includes(eventName),
                     once: eventName === 'onpointerup',
                     useCapture: false
                  }
                  this.addEventListener(eventName.slice(2), config[eventName].bind(this), opts);
               }); 

               propList.filter(  prop =>
                  !eventNames.includes(prop) && !Settings.gelamintReserved.includes(prop))
                       .forEach( prop => {  
                        const z = {...Object.getOwnPropertyDescriptor(config, prop)};
                        if (typeof z.value === 'function') {
                           z.value = z.value.bind(this)
                        }
                        Object.defineProperty( this, prop, z) 
               })

               if (config.oninit) { config.oninit.bind(this)() }
            }

            
            
            connectedCallback() {
               
               if (config.elRefs) {
                  const refList = (Array.isArray(config.elRefs)) ?
                     config.elRefs.map( sel => [Gelamint.dashSepToCamelCase(sel), sel] )
                     : Object.entries(config.elRefs); 
                  
                  refList.forEach(([identifier, selector]) => { 
                     this[identifier] = this.shadowRoot.querySelector(selector)
                  })
               }
            
               const slots = this.getSlotNodes()
               if (slots?.length > 0){
                  this.slotNodes = slots
               }
            
               if (config.onload) {
                  config.onload.bind ? config.onload.bind(this)() : config.onload()
               }
            
               this.us.staticmethod ? this.us.staticmethod() : null;
            }

            attributeChangedCallback(prop, oldVal, newVal) { 
               if (prop in config.attrObservers) {
                  const attr = config.attrObservers[prop]
                  if ('onadd' in attr && oldVal === null) {   
                     attr.onadd(newVal)
                  }
                  else if ('onremove' in attr && newVal === null) {   
                     attr.onremove(`attr: ${prop} removed`)
                  }
                  if ('onchange' in attr) { 
                     attr.onchange(oldVal, newVal)
                  }
               }           
            } 
      } 
   }





   static get boundStyles() { return [] }

   static defaultCss = getDefaultCss()

   static throttle(func, time) { 
      let throttled = false,
         savedState = [];
    
      function throttler() { 
         if (throttled) 
            return savedState = [this, arguments] 
         throttled = true  
         func.apply(this, arguments)  
         setTimeout( function() {
            throttled = false 
            if (savedState[1]) {  
               throttler.apply(...savedState) 
               savedState = [] 
            }
         }, time) 
      } 
      return throttler  
   }

   static svg = {
      textClass: 'tl-responsive-text',
      tags: ['svg','circle','text','path','g','rect','ellipse'],
      attrs: {
         default:{
            'height':'100%',  'width': '100%',
            'version':'1.1',  'preserveAspectRatio':'xMidYMid meet',
            'xmlns':'http://www.w3.org/2000/svg',  'stroke-linejoin':'round',
            'xml:space':'preserve',  'stroke-miterlimit':'2',
            'fill-rule':'evenodd',  'clip-rule':'evenodd' 
         },
         text: {
            'x':'50%',  'y':'50%',  'font-size':'100px',
            'dominant-baseline':'middle',  'text-anchor':'middle'
         }  
      },
      txtMeasureContainerStyle: (font) => `
         font-family: ${font};  font-size: 100px!important;
         position: absolute!important;  top: -10000%;  left:-10000%;`,
   }  

   static setElAttrs(el, attrDict) {
      Object.entries(attrDict).forEach(([key,val]) => el.setAttribute(key, val)) 
   }

   static makeElement(tag, innerContent, initAttrs ) {    
      const newEl = Gelamint.svg.tags.includes(tag) ?
         document.createElementNS('http://www.w3.org/2000/svg', tag) :
         document.createElement(tag) 
      newEl.innerHTML = innerContent ?? '';
      if (initAttrs) {
         Gelamint.setElAttrs(newEl, (tag === 'svg' ?
            { ...Gelamint.svg.attrs.default, ...initAttrs } :
            initAttrs));
      }
      return newEl
   }   

   static observeOnOffScreen(leftCallback, returnedCallback) {
      return new IntersectionObserver( entries => {    
         if (entries[0].intersectionRatio <= 0) leftCallback(); 
         else                                   returnedCallback(); 
      })
   } 

   static buildSvgTextNode(text, fontFamily, attrs) {  
      const svg = Gelamint.makeElement('svg',
            Gelamint.makeElement('text', text, Gelamint.svg.attrs.text).outerHTML,
            {  'class': Gelamint.svg.textClass  } 
         ),
         container = Gelamint.makeElement('div',
            text,
            {  'style': Gelamint.svg.txtMeasureContainerStyle(fontFamily)  }
         ) 
      document.lastChild.appendChild(container);
      svg.setAttribute('viewBox', `0 0 ${container.offsetWidth + 20} 100`) ;
      container.remove(); 
      
      if (arguments.length >2) {  Gelamint.setElAttrs(svg, attrs)  }

      return svg
    } 

    static styleAliases = {
      size : {
         width: w => `${w[0]}px`,
         height: h => `${h[1]}px`
      }, 
      position: {
         transform : vals => `translate3d(${vals[0]}px, ${vals[1]}px, 0px)` 
      },
      rotation: {
         transform: val => `rotate(${val}deg)`
      }
   }

   static observeWindowResize(callback) {
      return new ResizeObserver( entries => {
         Object.entries(entries).forEach( entry => {
            if ('contentBoxSize' in entry ) {
               callback(entry.contentBoxSize)
            }
         })
      })
   }

   static checkCss(str) { 
      if (str.trim().slice(-1) !== '}') {
         if (str.indexOf('{') === -1) {
            return `:host {\n${str}\n}\n`
         }
      }
      return str
   }
   

   #template;
   #uniqueId; 
   #sheets;
   #observers = {temp:{}};

   attr = {
      // a person can only type the word 'attribute' out so many times...
      get: attr        => this.getAttribute(attr), 
      set: (attr, val) => this.setAttribute(attr, val ?? ''), 
      has: attr        => this.hasAttribute(attr),

      setIfNot: (attr, val) => !this.hasAttribute(attr) ? this.setAttribute(attr, val ?? '') : null,

      remove: (...attrs) => attrs.forEach( attr => this.removeAttribute(attr)), 

      setMany: attrDict => Object.entries(attrDict).forEach(
         ([key,val]) => el.setAttribute(key, val)),

      toggle: (attr, condition = this.attr.has(attr)) => condition ?
         this.attr.remove(attr) : this.attr.set(attr,''),

      readOr: (attr, fb) => this.attr.has(attr) ? this.attr.get(attr) : fb,

      readAll: (target = this) => target.getAttributeNames().reduce(
         (obj,name) => ({ ...obj, [name]: target.getAttribute(name) }), {}),

      toList:  attr => this.attr.get(attr)?.match(/[^\s,]+/g) || [],

      toListN: attr => this.attr.has(attr) ?
         this.attr.toList(attr).map( s => parseInt(s))
         : null 
   } 
   class = {
      toggle: (cls, condition = !this.classList.contains(cls)) => condition ?
         this.classList.add(cls) : this.classList.remove(cls),  
      add:    cls => this.classList.add(cls), 
      remove: cls => this.classList.remove(cls), 
      has:    cls => this.classList.contains(cls),
   }

   constructor() {
      super();

      this.#sheets = {
         default: this.makeSheet('default', Gelamint.defaultCss)
      }  
      if (this.attr.has('uid')) { 
         // if not, uniqueId will be set after first triggering its 'get' accessor   
         this.uniqueId = this.attr.get('uid')
      }
      this.hostSelector = `:host([uid="${this.uniqueId}"])` // for scoping style rules
      const us = this.constructor;
      // init the shadow DOM, immediately applying the default CSS stylings to it 
      this.attachShadow({ mode: 'open' }).adoptedStyleSheets = [ this.#sheets.default ]; 
      if (us.boundStyles.length) {
         us.boundStyles.forEach( style => this.initStyleRelay(style) )
      } 
   } 
   
   get name() {
      return this.attr.readOr('name', this.uniqueId)
   }

   get uniqueId() {
      if (!this.#uniqueId) {
         this.#uniqueId = this.tagName
            .toLowerCase().replace('-','') 
           + (Date.now().toString().slice(-4)) 
           + (Math.floor(Math.random() * 100)); 
         this.setAttribute('uid', this.#uniqueId);
      } 
      return this.#uniqueId
   }
   set uniqueId(val) {  this.#uniqueId = val  }

   get template() {
      return this.#template.lastRender ??
             this.#template.generate(
               this.#template.fallbacks ?? null)
   } 

   // can pass template content as :
   // - a simple string, which will render identically every time its stamped
   // - a function, to interpolate new values into template content w/ each stamping
   // - an obj, w/ content: as the generating function and other misc options
   set template(contentGen) {
      
      if (typeof contentGen === 'function') {
         this.#template = { 
            generate: contentGen,
            fallbacks: null,
            lastRender: ''
         } 
      } else if (typeof contentGen === 'object' && 'content' in contentGen){
         this.#template = { 
            generate: contentGen.content,
            fallbacks: contentGen.fallbacks,
            lastRender: ''
         } 
      } else {
         this.#template = { 
            generate: () => contentGen,
            staticTemplate: true,
            fallbacks: null,
            lastRender: ''
         }  
      } 
   }

   get lastRender() { return this.#template.lastRender }
   set styleSheet(sheet) { 
      this.#sheets['main'] = sheet; 
      this.#applyStyleSheet(this.#sheets.main);
   } 
   get styleSheet() { return this.#sheets.main }
   get styles()     { return this.styleSheet }
   set styles(str)  {
      this.styleSheet = this.makeSheet('main', Gelamint.checkCss(str))
   } 



  // get slotNodes()  { return this.getSlotNodes() } 

   emitCustomEvent(name, detail) {
      this.shadowRoot.dispatchEvent(
         new CustomEvent(name, 
         {
            composed:true,
            bubbles:true,
            detail: detail ?? this.name
         }))
   } 

   getElement(strOrEl) { 
      if (strOrEl instanceof Window || strOrEl instanceof HTMLElement) {
         return strOrEl
      }
      const search = this.shadowRoot.querySelector(strOrEl) 
      if (search) {
         return search
      }
      for (const tmpl of this.getElements('template') ) {
         const search2 = tmpl.content.querySelector(strOrEl)
         if (search2 != null) return search2
      }
      return null
   }
   getElements(selector) {
      return this.shadowRoot.querySelectorAll(selector)
   } 

   #initObserver(target, observer) {
      target = target.startsWith ? this.shadowRoot.querySelector(target) : target
      this.#observers[target.localName+'_'+target.id] = {
         target: target ,
         observer: observer
      } 
      observer.observe(target)
      this.#observers.temp = {}
   } 

   timer = 0;


   // One stop shop for adding event listeners and observers

   // if an object is passed in, it will use the keys of the obj
   // for the event types, and their values as the associated functions
   // if no string selector is passed in with the object, the listeners
   // will be applied to 'this'

   // if only 1 argument is passed and its a function, its applied as a 'click'
   // listener to this.
   // If a string or strings are included w a function, 
   // it tries to identify which would be an eventType and which would be a 
   // element selector, and applies the listeners appropriately
   addListener(...args) {    

      if (args.indexOf(true) === -1) {

         const objInd = args.length === 4 ? -1
         : args.findIndex( a => typeof a === 'object' && !Array.isArray(a)); 
         
         if (objInd >= 0 && args[3] !== true) { 

            const obj = args.splice(objInd)[0];
           
           return Object.entries(obj)
               .filter( entry => entry[0] !== 'children')
               .map( ([eType, eFunc]) => [
                  (
                     eType in Settings.ownedEvents ?
                        Settings.ownedEvents[eType]
                        : (args.length===1) ?
                              this.getElement(args[0])
                              : this
                  ),
                  eType,
                  eFunc.bind ? eFunc.bind(this) : eFunc,
                  true
               ]) 
               .concat(obj.children ? obj.children.map( z => [...z,true]) : []) 
               .forEach( argGroup => this.addListener(...argGroup))  
         } 
      } 
      let selector, eventType, func;

      if (args[3] === true || (args.length === 2 && args[1] === true && Array.isArray(args[0]))) { 
         [ selector, eventType, func ] = args[0]?.map ? args[0].concat([]) : args.slice(0,-1) 
      } else {
         func = args.splice(args.findIndex(a => typeof a==='function'), 1)[0];
         selector = ( selInd => selInd >= 0 ? args.splice(selInd, 1)[0] : this)(
            args.findIndex(str => (
                  str instanceof HTMLElement
               || str instanceof Window
               || (str.startsWith && str.replace(/[^A-Za-z0-9]/g,'').length!==str.length)))
            ); 
         eventType = args.length === 1 ? args[0] : 'click';
      } 
  
      if (['screenLeave','screenReturn','resize'].includes(eventType)) {   
         this.#observers.temp[eventType] = func
         if (eventType.includes('screen')) { 
            clearTimeout(this.timer); this.timer = setTimeout(
               (funcs = Object.fromEntries(
                  Object.entries(this.#observers.temp)
                     .filter(([name,_]) =>
                        (['screenLeave','screenReturn'].includes(name))))
               ) => { 
               this.#initObserver(this.getElement(selector),
                  Gelamint.observeOnOffScreen(
                     funcs.screenLeave ?? (()=>{}),
                     funcs.screenReturn ?? (()=>{}) )
            )}, 20)
         }
         else {
            this.#initObserver(this, Gelamint.observeWindowResize(func)); 
         }
      }  
      else { 
         this.getElement(selector).addEventListener(eventType, func)
      }
   }
 
   makeSheet(name, content) {    
      const ident = (this.localName + '_')    
         + (this.title ? this.title + '_' : ``) 
         + (name ?? this.uniqueId);

      if (GelSheet.cache[ident] && GelSheet.cache[ident].noCache === false) { 
         return GelSheet.cache[ident]
      }
      return new GelSheet(ident, content)  
   }

   // append the passed CSSStyleSheet to the 
   // read-only adoptedStyleSheets array
   #applyStyleSheet(newSheet) { 
      this.shadowRoot.adoptedStyleSheets = [
         ...this.shadowRoot.adoptedStyleSheets,
         newSheet
      ]
   } 

   

   // this function initalizes getters and setters for the style property
   // name passed in that intercept operations on that particular style and apply
   // them to the components constructable stylesheet instead of directly to the
   // element in the DOM 
   // i.e - if you call with "color", any time you read or modify
   // 'this.style.color' - those operations will be overwritten as defined below

   // TODO needs work to be more versatile for different types of styles and allow
   // diff types of configuration options
   #initRelayProp(propDef) { 

      const self = this,
         aliases = Gelamint.styleAliases,
            prop = propDef.prop,
            opts = propDef.options,
         targets = prop in aliases ? Object.keys(aliases[prop]) : [].concat(prop);
     
      if (prop && (opts?.isolate !== false) && !(prop in this.#sheets)) { 
         this.#sheets[prop] = this.makeSheet(prop, { noCache: true}) 
         this.#applyStyleSheet(this.#sheets[prop])
      }  

      const targetSheet = this.#sheets[prop] //?? this.styles
 
      Object.defineProperty(self.style, prop, { 
         configurable: true,
         enumerable: false,
         get: function() {
            return self.style[`_${prop}`]
         },

         set: function(newVal) {    

            if (!Array.isArray(newVal) && typeof newVal === 'object') {
               newVal = newVal.value ??  Object.values(newVal)[0] 
            }    
            const out = prop in aliases ? 
               targets.map( (t) => ({ [t] : (aliases[prop][t])(newVal) }) ) :
               targets.map( (t) => ({ [t] :  newVal  }) );

            if (self.style[`_${prop}`]?.toString() !== newVal.toString()) {
      
               self.style[`_${prop}`] = newVal; 
               if (opts?.isolate !== false) { 
                  targetSheet.replaceSync(
                     GelSheet.stringifyAsRule( out.flat(), self.hostSelector )
                  );  
               } else {
                  let oldAt = targetSheet.indexOfRule(prop); 
                  targetSheet.insertRule(
                     GelSheet.stringifyAsRule( out, self.hostSelector ),
                     oldAt + 1
                  );
               } 
            }  
         }
      }) 
   }
   
   // the consumer-facing function that initializes creation
   // of customized style property accessors (above)
   initStyleRelay(initProps) { 
      if (typeof initProps === 'string') {
         initProps = {  prop: initProps  } 
      }
      if (Array.isArray(initProps))  {
         initProps = initProps.map( item =>
            (typeof item === 'string' ? {  prop: item  } : item ))
      }
      [].concat(initProps).forEach( propDef => this.#initRelayProp(propDef)) 
   }

   // deletes style rules that match the given selector and style property.
   // pretty inefficient, so if you're constantly updating a certain rule its
   // better to use a relay and the 'isolate' option to keep it in its own sheet, and 
   // then replace the entire sheet at once
   deleteStyleRules(props, selectors = this.hostSelector, precise = false) {
      return this.styles.deleteRules(props, selectors, precise)
   }
   
   getSlotNodes(name) {
      return this.shadowRoot.querySelector(
            name ? `slot[name="${name}"]` : 'slot')
         ?.assignedElements()
   } 

   // generate a new document fragment w/ updated content
   // from params if needed
   #stampTemplate(_params) {
      const newT = document.createElement('template'),
         params = this.#template.fallbacks ?
            this.#template.fallbacks
               .map((param,ind) => _params[ind] ?? param)
               .map((param) => typeof param === 'function' ? param() : param)
            : []; 

      newT.innerHTML = this.#template.lastRender = this.#template.generate(params);
      
      return newT.content.cloneNode(true) 
   }

   defineCustomChildElement(elemName, config) { 
      Gelamint.makeCustomEl(elemName, config, this)
   }


   render(vals) {
      if (typeof vals === 'string' && this.#template.staticTemplate) {
         this.template = vals;
      }
      this.shadowRoot.replaceChildren(
         this.#stampTemplate(vals)
      );
      return this.shadowRoot
   }  

   disconnectedCallback() {  
      Object.entries(this.#observers).forEach(([_, obs]) => { 
         if (obs.observer) obs.observer.disconnect(obs.target)
      }) 
      this.#observers = { temp: {} } 
   }
}

 
 

// its only a function so we can stick it down here
function getDefaultCss() { return `

   html        {  box-sizing: border-box;         } 
   h1,h2,h3,h4 {  margin:0;   padding: 0;         } 
   .opaque     {  opacity: 1!important;           }    
   .visible    {  visibility: visible!important;  } 


   :host(.no-transitions)  div,
   :host(.window-resizing) div, 
   :host(.window-resizing) button, 
   :host(.window-resizing) button * { 
      transition: none!important;
   } 

   label, button,
   input[type=text],         input[type=text]:active,
   input[type=text]:hover,   input[type=text]:focus, 
   input[type=range]:active, input[type=range]:hover,
   input[type=range]:focus,  input[type=range] {
      padding: 0;  margin: 0;
      -webkit-appearance: none;  
      border: none;  outline: none;
      appearance: none; 
      box-sizing: border-box; 
      user-select: none;
      background: transparent;    
      color: inherit;
      font-family: inherit;
   }

   input[type=range]::-webkit-slider-thumb {
      padding: 0;  margin:  0;
      background: transparent;  
      -webkit-appearance: none;  
      border: none;  outline: none;
      appearance: none; 
      box-sizing: border-box;
   }

   input[type=range]::-moz-range-thumb {
      padding: 0;  margin:  0;
      -webkit-appearance: none;  
      border: none;  outline: none;
      appearance: none; 
      box-sizing: border-box;
   } 

   input[type=number] {
      -moz-appearance: textfield;
   } 

   input::-webkit-outer-spin-button,
   input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0; 
   }   
 
   button {
      cursor: pointer;
   }  

   @keyframes shake {
      0%   {  transform: translateX(0);        }
      25%  {  transform: translateX(0.3rem);   }
      75%  {  transform: translateX(-0.3rem);  }
      100% {  transform: translateX(0);        }
   }` 
}



