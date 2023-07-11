import { readAttrs, addElRefs, defineClassAccessor, defineAttrAccessor,
         parseSelector, getHost, getElement, isElemOrWindow } from './gel_dom.js'
import { applyListeners, observers, prepAttrDefs, buildCommandResponder } from './gel_listen.js'  
import { Flag, Courier, mimic, uniquify, segregate } from './gel_util.js' 
import { sharedSheets, Sheets } from './gel_style.js'
import { initStylePipe } from './gel_pipe.js'
import { gelephone } from './gel_phone.js' 
import { plate } from './gel_plate.js'
import { FuncBank } from './gel_act.js'   

const blueprints = {},
          _fetch = (new Courier()).fetch,
           hooks = new WeakMap(),
        initFlag = new Flag();

export { blueprints, sharedSheets }
export { _fetch }  
 
let initAllComplete = false
 
const replaceStyles = (conf) => new Promise(success => { 
   _fetch(conf.stylesUrl).then( results => {
      conf['styles'] =  results 
      success(conf.styles)
   })
})

const finish = (name, conf) => { 
   blueprints[name] = createGelBlueprint( conf )
   customElements.define(name, blueprints[name]); 
   return blueprints[name]
}  






export async function mint(elName, config) { 
 
   if ( customElements.get(elName) === undefined ) {   

      if (typeof config === 'function') {
         config = config()
      }
      if (config.offspring) {
         for (const entry of Object.entries(config.offspring)){
            await mint.call(this,...entry);     
         }
      }
      return new Promise( async success => {  
         if (config.stylesUrl) 
            await replaceStyles(config).then( () => success(finish(elName, config)) ) 
         else success(finish(elName, config))  
      })
   }  
   else return new Promise( g => g(blueprints[elName])) 
} 


//Gel['mint'] = mint






 


function runHooks(hookCategory) {
   hooks.get(this)[hookCategory].forEach( h => h() )
}

function addHooks(hookType, funcOrFuncs) {    
   const curr = hooks.get(this)
   curr[hookType] = curr[hookType].concat(funcOrFuncs)  
}
 
function evalToObj(funcOrObj, ...args) { 
   if (typeof funcOrObj === 'function')
      return evalToObj.call(this, (funcOrObj.bind ?
         funcOrObj.call(this, ...args) : funcOrObj(...args)))
   return funcOrObj
} 





function createGelBlueprint(config) { 

   ['attrBehaviors','attrObservers'].forEach( type => {
      if (type in config && typeof config[type] === 'function') {
         if (config.observedAttributes === undefined) 
            config.observedAttributes = [];
         config.observedAttributes = config.observedAttributes.concat(Object.keys(config[type]()))
      }
   }); 



   return class extends HTMLElement {     

      static observedAttributeList = Array.from( new Set(
            (config.observedAttributes ?? [])
            .concat(Object.keys(config.attrObservers ?? {}))
            .concat(Object.keys(config.attrBehaviors ?? {}))
            .map( prop => prop.startsWith('not_') ? prop.replace('not_','') : prop)
      ))

      static get observedAttributes() {
         return this.observedAttributeList
      }

      #template 
      #uid  
      #host

      actions = new FuncBank();

      renderCount = 0; 
      lastRender = null

      initComplete = false;
         
      slots = {} 

      attr = {
         get: (a, el=this) => el.getAttribute(a)   , 
         set: (a, val, el=this) => el.setAttribute(a, val ?? '')  , 
         has: (a, el=this) => el.hasAttribute(a), 

         remove: (...a_s) => a_s.forEach( a => this.removeAttribute(a) ) ,  

         setIfNot: (a, val, el=this) =>
            !el.hasAttribute(a) ? el.setAttribute(a, val ?? '') : null,  

         toggle: (a, condition=!this.attr.has(a), el=this) =>
            condition === true ? el.setAttribute(a,'') : el.removeAttribute(a),  

         readOr: (a, fallback, el=this) => el.hasAttribute(a) ? el.getAttribute(a) : fallback, 

         readAll: (el=this) => readAttrs(el), 

         toList: (a, el=this) => el.getAttribute(a)?.match(/[^\s,]+/g) || [], 

         toNumList: (a, el=this) =>
            el.hasAttribute(a) ? this.attr.toList(a).map( s => parseInt(s)) : null 
      } 
      class = {
         add:    (c, el=this) => [].concat(c).forEach( cls => el.classList.add(cls) ),
         remove: (c, el=this) => [].concat(c).forEach( cls => el.classList.remove(cls)), 
         has:    (c, el=this) => el.classList.contains(cls) ,
         toggle: (cls, condition = !this.classList.contains(cls), el = this) =>
            condition === true ? this.classList.add(cls) : this.classList.remove(cls),   
      }

      

      get uid() {
         if (!this.#uid) this.#uid = uniquify(this.localName);
         return this.#uid
      } 
      get us() { return this.constructor } 

      constructor(opts) {   
         
         if (!initAllComplete) 
            initFlag.standby(); 

         super();        

         this.attr.set('uid', this.uid)   

         hooks.set(this, { init: [], disconnect: [], post: [] });

         observers.set(this, { temp: {} } ) 

         addHooks.call(this, 'disconnect', () => config.ondisconnect?.call(this) )   
         
         this.attachShadow({ mode:'open' }); 

         this.sheets = new Sheets(this, {
            default: sharedSheets.get('base') 
         }, true); 
                
         this.hostSelector = `:host([uid="${this.#uid}"])`; 
       
         if (config.elRefs !== undefined) 
            addElRefs.call(this, config.elRefs ) 

         if (this.stylePipes) {
            const [hosted, _self] = segregate(
               Object.entries(this.stylePipes),
               entry => !(Array.isArray(entry[1]) && 'host' in entry[1] ) 
            ) 
            if (_self.length)
               _self.forEach( pipe => initStylePipe.call(this, pipe)); 
            if (hosted.length) {
               addHooks.call(this, 'init', () => hosted.forEach( pipe => initStylePipe.call(this, pipe)))
            }
         }

         if (  config.children        !== undefined
            || config.commandResponses!== undefined 
            || config.listeners       !== undefined
            || opts?.listeners        !== undefined) {  
            this.actions.register('afterRender', () => {
               if (this.origListenerConfig === undefined) {
                  this.origListenerConfig = Object.freeze({
                     ...(config.commandResponses ? buildCommandResponder.call(this, evalToObj.call(this, config.commandResponses)) : {}),
                     ...(config.children  ? { children: evalToObj.call(this, config.children) } : {}),
                     ...(config.listeners ? evalToObj.call(this, config.listeners) : {} ),
                     ...(opts?.listeners  ? evalToObj.call(this, opts.listeners) : {})
                  }) 
               }  
               applyListeners.call(this, this.origListenerConfig )
            })
         }  

         if (opts) {
            if (opts?.renderProps) {
               this.renderProps = Object.freeze(opts.renderProps)
            }
            let extraProps = Object.keys(opts?.renderProps); 
            if (extraProps.includes('class')) 
               addHooks.call(this, 'post', () => this.class.add(opts.renderProps.class)) 
            if (extraProps.includes('id'))  
               addHooks.call(this, 'post', () => this.attr.set('id', opts.renderProps.id))
            extraProps = extraProps.filter( p => p !== 'id' && p !== 'class'); 
            if (extraProps.length) {
               addHooks.call(this, 'post', () => extraProps.forEach( p => {
                  if (!this.attr.has(p) && ['string','number','boolean'].includes(typeof opts.renderProps[p])) {
                     this.attr.set(p, opts.renderProps[p])
                  }
               }))
            } 
         }
         
         if (config.template) 
            this.template = config.template    
  
         if (config.sharedStyleSheets) {
            [].concat(config.sharedStyleSheets).forEach( sheetName => { 
               if (sharedSheets.has(sheetName)) this.sheets.add(sheetName, sharedSheets.get(sheetName), true)
            })
         }
 

         if (config.styles) {
            this.styles = config.styles    
         }

         Object.entries(config.actions ?? {}).forEach(
            ([actName,actFunc]) => this.actions.register(actName, actFunc.bind(this)));
      
         config.classProps?.forEach( cProp => defineClassAccessor(this, cProp)) 
         config.attrProps?.forEach(  aProp => defineAttrAccessor(this, aProp)) 

         mimic(config, this, true); 

         if ( this.#template !== undefined ) 
            this.render(null, null, opts?.renderProps ?? null)  

         addHooks.call(this, 'init', [  
            () => { if (this.hasSlots()) this.initSlots() },
            () => config.oninit?.call(this),  
            () => {
               const curr = observers.get(this)
               if (!curr.attrs) curr['attrs'] = {};
               ['observers','behaviors'].forEach( x => {
                  const propName = ('attr' + x[0].toUpperCase() + x.slice(1));
                  if (propName in config)
                     Object.assign(curr.attrs, prepAttrDefs.call(this, evalToObj.call(this, config[propName]), x)) 
               }) 
            },
            () => config.afterInit?.call(this),
            () => {
               if (config.waitFor === undefined)
                  config.onload?.call(this)
               else if (config.onload !== undefined) {
                  this.waitOn(config.waitFor).then(()=>{
                     config.onload?.call(this)
                  })
               }
            }
         ]);

         if (config.subscriptions !== undefined) { 
            if (typeof config.subscriptions === 'function') 
               config.subscriptions = config.subscriptions.call(this) 
            config.subscriptions.forEach( ([publ, props, func]) => { 
               let discoHook = gelephone.register(publ, props, func.bind(this) ) 
               addHooks.call(this, 'disconnect', discoHook)
            })
         } 

         if (opts?.extraHooks) 
            addHooks.call(this, 'post', opts.extraHooks[0]); 
      }    
         
      connectedCallback() { 
         addHooks.call(this, 'post', () => {  
            this.initComplete = true;
            if (this.lastAttemptedChanges !== undefined) {
               Object.entries(this.lastAttemptedChanges).forEach( entry => {
                  this.attributeChangedCallback(...this.lastAttemptedChanges[entry[0]]);   
               }) 
            }   
            setTimeout( () => this.dispatchEvent(
               new CustomEvent('gel-ready',
                  { bubbles: true, composed: true, detail: this })))
         })   
         addHooks.call(this, 'init',() => runHooks.call(this, 'post') );
         if (config.actions?.afterAllInit) {
            addHooks.call(this, 'post', async () => {
               await initFlag.whenReady( () => { 
                  initAllComplete = true;  
                  this.actions.perform.call(this, 'afterAllInit')
               })
            })
         }
         runHooks.call(this, 'init')   
      } 

      attributeChangedCallback(prop, oldVal, newVal, manualFlag) {  
         if (observers.has(this)) {  
            if (this.initComplete !== true) {
               if (this.lastAttemptedChanges === undefined) 
                  this.lastAttemptedChanges = {} 
               this.lastAttemptedChanges[prop] = [ prop, oldVal, newVal, true ];
            }
            else {
               if (this.lastAttemptedChanges !== undefined && manualFlag === true)  
                  this.lastAttemptedChanges[prop] = undefined; 
               const obs = observers.get(this).attrs
               if (prop in obs) {
                  const attr = obs[prop]
                  if      ('onadd'    in attr && oldVal == null)  attr.onadd(newVal) 
                  else if ('onremove' in attr && newVal == null)  attr.onremove(`attr: ${prop} removed`) 
                  if      ('onchange' in attr)                    attr.onchange(newVal, oldVal) 
               }  
            }
         }                      
      }  

      disconnectedCallback() {    
         if (observers.has(this)) {
            const obs = observers.get(this)
            Object.entries(obs).forEach(([_, obs]) => { 
               if (obs.observer) obs.observer.disconnect(obs.target)
            })  
         }        
         runHooks.call(this, 'disconnect') 
      }  
 
      waitOn(list) {
         list = list.map( z => parseSelector(z) )
         let callback;
         const waitFunc = e => {
            let idSearch, classSearch
            if (e.detail.id) 
               idSearch = list.find( item => item.id === e.detail.id ); 
            if (idSearch == null && e.detail.classList.length > 0)  
               classSearch = list.find( item => item.classList.join('.') === e.detail.classList.join('.'))  
            if (idSearch != null || classSearch != null)  
               list = list.filter( l => l !== (idSearch ?? classSearch)); 
            if (list.length < 1) { 
               callback();
               this.removeEventListener('gel-ready', waitFunc);
            }
         }
         return new Promise( success => {
            callback = success;
            this.addEventListener('gel-ready', waitFunc)  
         }) 
      }

      get host() {
         if (!this.#host) {
            this.#host = getHost(this)
         }
         return this.#host
      }

      get viewportSize() {
         const rect = this.host.getBoundingClientRect();  
         return { x: rect.width, y: rect.height }
      }

      get stylePipes() {
         return config.stylePipes ?? []}   
 
      get styleSheet() {
         return this.sheets.get('main') ?? (this.sheets.get('remote') ?? this.sheets.get('default'))
      } 

      get styles() {
         return this.styleSheet
      } 
 
      set styles(str)  {
         let _str = (typeof str === 'function') ? (str.bind ? str.call(this) : str()) : str;
         if (_str.trim && _str.trim().slice(-1) !== '}' && _str.indexOf('{') === -1) { 
            _str = `:host {\n${_str}\n}\n` 
         }  
         this.sheets.add('main', _str , true);   
      }
 
      get name()  {
         return this.attr.readOr('name', this.uniqueId)
      }

      get template() {
         return this.#template
      }  
 
      set template(content) { 
         this.#template = content 
      }
 
      get defaultSlot() {
         return this.shadowRoot.querySelector('slot:not([name])')
      }
 
      get allSlots() {
         return Array.from((this.shadowRoot ?? this).querySelectorAll('slot'))
      } 

      applyListeners(listenerDefs) { 
         applyListeners.call(this, listenerDefs); 
      } 

      removeListeners(listenerDefs) {
         applyListeners.call(this, listenerDefs, { remove: true }) 
      }
     
      hasSlots() {
         return this.allSlots?.length > 0
      } 

      updateAttr(attr, value, el = this) {  
         if (el.getAttribute(attr) != value)
            el.setAttribute(attr, value);
      }
 
      initSlots() {   

         const host  = this.shadowRoot ?? this; 
         const getSlot = (sName) => host.querySelector(
            sName === 'default' ? 'slot:not([name])' : `slot[name="${sName}"]`); 

         this.slotNames = Array.from(host.querySelectorAll('slot'))?.map(slotEl => {
            const slotName = slotEl.getAttribute('name') || 'default',
                      slot = getSlot(slotName); 
            Object.defineProperty( this.slots, slotName, {
               configurable: true, enumerable: true,
               get: function() {
                  if (slot.assignedElements().length)  
                     return Array.from(slot.assignedElements())  
                  if (slot.assignedNodes().length)  
                     return Array.from(slot.assignedNodes()) 
                  return [] 
               }
            })
            return slotName
         });
         this.slotTypes = Array.from(new Set(
            Array.from(host.querySelectorAll('slot[type]')).map( node => node.getAttribute('type'))
         ));
         const self = this;
         if (this.slotTypes.length) {
            this.slots['type'] = {}
            this.slotTypes.forEach( typeValue =>  
               Object.defineProperty(this.slots.type, typeValue, {
                  configurable: true, enumerable: true,
                  get: function(){ 
                     return Array.from(
                        host.querySelectorAll(`slot[type="${typeValue}"]`))
                           .map( slot => slot.getAttribute('name') ) 
                  },
               })
             ); 
         } 
      }       

      getElement(strOrEl) {  
         return getElement.call(this, strOrEl); 
      }

      getElements(selector) {
         return Array.isArray(selector) ?
            selector.map(item => this.getElement(item)) :
            (this.shadowRoot ?? this).querySelectorAll(selector)
      } 

      getRenderContainer(id) {
         return (this.shadowRoot ?? this).querySelector(`[gel-content="${id}"]`)
      }

      render(content, container, opts, ...args) {

         if (content == null && this.#template !== undefined)
            content = this.#template

         if (typeof content === 'function') 
            content = content.bind ? content.call(this, this.renderProps ?? args) : content(this.renderProps ?? args)

         if (content != null) { 

            content = (typeof content === 'string') ?
               plate(content,{'test-attr':''}).content : (content.content ?? content);
          
            let host 

            if (typeof container === 'string' && this.getRenderContainer(container))
               host = this.getRenderContainer(container)
            else 
               host = container && isElemOrWindow(container) && this.renderCount > 0 ? container : (this.shadowRoot ?? this)
            
            let func = host.replaceChildren,
               final = (el) => el.cloneNode(true);

            if (opts) {
               if ('noClone' in opts)  final = (el=>el)
               if ('append' in opts)   func  = host.appendChild
            }

            if (content) {
               func.call(host, final(content))
               this.renderCount += 1
            } 
            setTimeout( () => this.actions.perform.call(this, 'afterRender')); 
         }
         return this.shadowRoot ?? this
      } 
   } 
}  