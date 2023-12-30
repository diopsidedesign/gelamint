import * as REF         from './ref.js'
import { GelPlates }    from './template.js'
import { GelSheet }     from './sheet.js'
import { HookBank,
         AttrObserver,
         BehaviorList } from './classes.js'

export const gel = (function(){

   // localname of the element to search for as host in 'getHost'
   const HOSTELNAME = 'gel-view'

   // total number of all created gelamint instances
   let totalGels = 0

   // the number of instances of each class that have been created
   const instanceCts = {}
    
   // config object for initializing hooks on custom elements
   const HOOKCONF = Object.freeze([
      { name: 'onConstruct'      }, 
      { name: 'onConnect'        },
      { name: 'onDisconnect'     },
      { name: 'beforeDisconnect' },
      { name: 'afterConnect'     },
      { name: 'afterFirstContent'},
      { name: 'afterAllConnect'  },
      { name: 'afterRender',  evergreen: true },
      { name: 'beforeRender', evergreen: true }
   ])

   // RESERVED - reserved property names for the Gel.mint config object 
   const RESERVED = new Set([   
      '_tagName',         '_styles',           '_sheets', 
      'styles',           'stylesUrl',         'listeners',   
      'template',         'templateUrl',       'beforeRender',
      'contents',         'bindAttributes',    'afterConnect',
      'bindElements',     'onConstruct',       'afterRender',
      'afterFirstContent','onConnect',         'observers',
      'beforeDisconnect', 'attrBehaviors',     'eventDefaultsPrevented',  
      'onDisconnect',     'observedAttributes','subscriptions',
      'attrObservers',    'publishers'
   ])

   function getHostElement(el, name) { 
      if (el == null) {
         return null 
      }
      const parEl = el?.parentElement
                 ?? el?.offsetParent
                 ?? null; 
      if (parEl?.localName === name) {
         return parEl
      }
      return getHostElement(parEl, name)
   }   

   function generateUid(seed) {
      totalGels += 1;
      if (instanceCts[seed] === undefined) {
         instanceCts[seed] = 0
      }
      instanceCts[seed] += 1 
      return seed.replace(/[^a-z0-9]/ig,'') + instanceCts[seed] 
   }
  
   return class extends HTMLElement {  

      // allows instances of a class to access the static styles
      // of other dynamically generated class definitions 
      static styleCatalog = new Map()
 
      static reserved = new Set([ ...RESERVED, ...REF.DOMEVENTNAMES ]);

      // the common stylesheet shared by all gel instances 
      static commonStyles = GelSheet.upgradeDocSheets()
         .newSheetFromOwnSections({ exclude: [ 'root', 'declarations' ] }); 
  
      static get viewportSize() {
         if (gel.viewport == null) {  
            gel.viewport = { x: window.innerWidth, y: window.innerHeight }  
            setTimeout(()=> gel.viewport = null, 2000) 
         } 
         return gel.viewport
      }  
 
      #host
      #uid
      #template
      #sheet
      #behaviors
      #attrObs
      #scratch

      get host() {
         if (this.#host == null) {
            this.#host = getHostElement(this, HOSTELNAME)  
         }
         return this.#host
      }  

      get uid() {
         if (!this.#uid) {
            this.#uid = generateUid(this.localName);
         }
         return this.#uid
      }  

      set template(t) { 
         // read-only after initial set
         if (!this.#template) {
            this.#template = t; 
         }
      }

      get template() {
         return this.#template ?? null
      }     

      get instanceStyles() {
         if (!this.#sheet) {
            this.#sheet = new GelSheet();
         }
         return this.#sheet
      }

      get behaviors() {
         if (!this.#behaviors) {
            this.#behaviors = new BehaviorList()
         }
         return this.#behaviors
      }

      get attrObs() {
         if (!this.#attrObs) {
            this.#attrObs = new AttrObserver()
         }
         return this.#attrObs
      } 

      get scratch() {
         if (!this.#scratch) {
            this.#scratch = document.createElement('template');
         }
         return this.#scratch 
      } 
 
      get name() {
         return this.readAttrOr('name', this.uid)
      } 
 
      get allSlots() {
         return Array.from((this.shadowRoot ?? this).querySelectorAll('slot'))
      } 
 
      get classStyles() {
         return this.constructor.classStyles
      }
    
      slots  = {}; 
      pubs   = {}; 
      subs   = {}; 
      relays = {}; 

      constructor(opts) {

         super().attachShadow({ mode:'open' });

         this.setAttribute('uid', this.uid); 
 
         this.constructor.commonStyles.applyTo(this);
 
         this.hooks = new HookBank(this.uid, HOOKCONF);  
      }   
 
      toggleAttr(a, cond) { 
         if ((cond !== undefined ? cond : !this.hasAttribute(a)) === true) {
            this.setAttribute(a,'')
         }
         else {
            this.removeAttribute(a)
         }
      }   
 
      readAttrOr(a, fb) { 
         if (this.hasAttribute(a)) {
            return this.getAttribute(a)
         }
         return fb  
      } 
 
      readAllAttrs(el=this) {
         return el.getAttributeNames().reduce(
            (previousProps, currProp) => ({
               ...previousProps,
               [currProp]: el.getAttribute(currProp)
            }), {})
      } 

      replaceClass(oldClass, newClass) {
         this.classList.add(newClass);
         if (this.classList.contains(oldClass)) {
            requestAnimationFrame(()=> this.classList.remove(oldClass)); 
         } 
      } 

      hasSlots() {
         return this.allSlots?.length > 0
      } 

      getSlot(name) {
         return this.shadowRoot.querySelector(name === 'default' ?
            'slot:not([name])' : `slot[name="${name}"]`)
      } 

      getElement(strOrEl) {
         if (strOrEl instanceof EventTarget) {
            return strOrEl // that was easy
         }
         if (typeof strOrEl === 'string') { 
            const  search = (this.shadowRoot ?? this).querySelector(strOrEl)   
            if (search) {
               return search 
            }      
            const propRead = Reflect.get(this, strOrEl)
            if (strOrEl in this && propRead instanceof EventTarget) {
               return propRead
            }
         } 
         return null 
      }
    
      getElements(selector) {
         if (Array.isArray(selector)) {
            return selector.map(item => this.getElement(item))
         }
         else {
            return (this.shadowRoot??this).querySelectorAll(selector)
         }
      }    

      getHost(str = 'gel-view') {
         return getHostElement(this, str)
      }
 
      setStylePropertyValue(styleProp, newValue, selector) {
         return this.instanceStyles.updateStyleRule(styleProp, newValue, selector)
      }
 
      cloneShadowRoot(attrs)   {
         const tmpl = GelPlates.templify(this.shadowRoot.innerHTML);
         if (attrs?.constructor?.name === 'Object') {
            Object.entries(attrs).forEach(
               ([attr, attrValue])=> tmpl.setAttribute(attr, attrValue)
            )
         }
         return tmpl
      } 
      
      // traverse upward from this element until the provided search condition 
      // is met, returning node that satisfies condition 
      lookUpFor(el = this, condition = (node=> node.localName===HOSTELNAME)) {
         let startNode = el;  
         while (startNode && !condition(startNode)) {
            startNode = startNode.parentElement   
         }
         return startNode
      }
 
      templify(content) {
         this.scratch.innerHTML = content; 
         return this.scratch.content.cloneNode(true)
      } 
 
      addExitHook(callback) {
         this.hooks.beforeDisconnect.add(callback)
      } 

      // identifies any named slots and if found, create shortcut properties for
      // accessing their assigned elements. does the same for the default slot. 
      // if any slots are found with a 'type' attribute, also creates shortcut
      // properties for accessing assigned elements by type
      initSlots() {  

         this.slotNames = Array.from(this.shadowRoot.querySelectorAll('slot'))
            ?.map( slotEl => {
               const slotName = slotEl.getAttribute('name') || 'default'
               const slot     = this.getSlot(slotName);  
               Object.defineProperty(this.slots, slotName, {
                  configurable: true,
                  enumerable: true, 
                  get: function() {
                     if (slot.assignedElements().length)  
                        return Array.from(slot.assignedElements())  
                     if (slot.assignedNodes().length)  
                        return Array.from(slot.assignedNodes()) 
                     return [] 
                  }
               }) 
               return slotName
            }
         );

         this.slotTypes = Array.from(new Set(
            Array.from(this.shadowRoot.querySelectorAll('slot[type]'))
               .map( node => node.getAttribute('type'))
         )); 

         if (this.slotTypes.length) {
            Object.defineProperty(this.slots, 'type', { value: {} }); 
            const self = this
            this.slotTypes.forEach( typeValue =>  
               Object.defineProperty(this.slots.type, typeValue, {
                  configurable: true,
                  enumerable: true,
                  get: function(){ 
                     return Array.from(
                        self.shadowRoot.querySelectorAll(
                           `slot[type="${typeValue}"]`
                        )
                     ).map( slot => slot.getAttribute('name')) 
                  }
               })
             ) 
         } 
      }   

      // method used to commit content and markup changes to the
      // element's shadowRoot or standard DOM subtree
      render(options) {    
         if (this.hooks.beforeRender.size > 0) {
            this.hooks.beforeRender.run.call(this) 
         }
         this.#replaceContent(options?.constructor?.name === 'Object' ?
               options
            : {
               content: options,
               container: null,
               opts: {}
            }); 
         this.renderCount += 1       
         this.hooks.afterRender.run.call(this)
         return this.shadowRoot ?? this
      }

      // inserts or replaces content in the component's shadowRoot 
      // When a container reference is provided, only content within that
      // referenced container will be replaced   
      #replaceContent({ content, container, opts={} }) {  

         const target = this.shadowRoot ?? this
         const query  = `[gel-content="${container}"]`

         if (!(content instanceof EventTarget)) {
            content = GelPlates.templify(
               typeof content==='string' ?
                    content
                  : this.template()
            );   
         }
         if (opts?.noClone!==true) {
            content = (content.content ?? content).cloneNode(true); 
         }

         if (  (this.renderCount !== 0)
            && (container != null)
            && (target.querySelector(query) != null)) {
            container = target.querySelector(query);
         }
         else {
            container = target 
         }

         container.replaceChildren( content )   
      }

      attributeChangedCallback(...args) {   
         this.attrObs.processAttrChanges(...args) 
      }    

      disconnectedCallback() { 
         this.hooks.beforeDisconnect.run.call(this) 
         this.attrObs.ready = false  
         setTimeout(()=> { this.hooks.onDisconnect.run.call(this) }) 
      }    

      disappear(){
         this.classList.remove('visible')
         this.classList.remove('opaque')
      }

      appear() {
         this.classList.add('visible')
         this.classList.add('opaque')
      }   
   }  
})()
