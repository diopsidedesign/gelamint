// gelamint 0.1

// GelSheet - A wrapper class around the DOM native 'CSSStyleSheets' interface that makes
// it easier + more semantic to manipulate / remove style rules
// caches generated sheets  
export class GelSheet extends CSSStyleSheet {

   static cache = {}  

   static shorthandProps = [
      'background','font','margin','border','transition',
      'animation','transform','padding','list-style','border-radius'
   ]

   // Lists all style properties affected by a CSSStyleSheet Rule
   static getAllStylesInRule(rule) { 
      return Object.values(
         Array(rule.styleMap.size).fill()
         .map( (_,i) => rule.style[i] )
      )
   } 

   // Removes the css for the indicated property from a larger block of css rule txt
   static removeStyleFromRuleText(rTxt, prop, i=rTxt.indexOf(prop)) { 
      return rTxt.replace(rTxt.substring(i, (rTxt.indexOf(';', i+1))+1) ,'')
   }

   // for converting between DOM/JS and HTML style property identifiers
   static camelCaseToDashSep(str) {
      return str?.toLowerCase() !== str ?
         str.replace(/[A-Z]/g, match => ("-"+match.toLowerCase()))
         : str
   }

   // Converts groups of style property + value declarations into a single
   // block of CSS rule text for the provided selector
   static stringifyAsRule(rules, selector, childSel = "") { 
      return selector+' '+childSel+`{` +
         rules.map( obj => Object.entries(obj).flat())
            .map( ([prop,val]) => GelSheet.camelCaseToDashSep(prop) +
               ' : '+val+';')
            .join('\n')
         +' }' 
   } 

   constructor(sheetName, initObjOrTxt) { super(); 
      this.noCache = initObjOrTxt.noCache === true  
      this.identifier = sheetName; 
      if (sheetName !== undefined) { 
         // dont want to override existing sheets if for some reason
         // duplicate names are passed, so we + an incrementing # to the end
         if (GelSheet.cache[sheetName] !== undefined   
            && GelSheet.cache[sheetName].noCache === false) {
            this.identifier = sheetName + '_' +
               (Object.keys(GelSheet.cache)
                  .filter( key => key.includes(sheetName)).length  + 1)
         }
         GelSheet.cache[this.identifier] = this
      }
      //
      if (typeof initObjOrTxt === 'str'
         || 'content' in initObjOrTxt) {
         // if str content was passed to constructor, 
         // apply it to the new css sheet
         this.replaceSync(initRuleTxt) //CSSStyleSheet api
      }
   }

   // gets all rules in this sheet that exactly match the provided
   // selector
   getRuleGroup(selector) {   
      return ( matches => matches.length === 1 ? matches[0] : matches)(
         Array.from(this.rules).filter(
            rule => rule.selectorText === selector
      ))
   }

   // If found, returns the value of the style property associated 
   // w/ the rule for the provided selector
   getPropVal(prop, selector = ':host') { 
      const ruleGroup = this.getRuleGroup(selector); 
      if (ruleGroup && GelSheet.getAllStylesInRule(ruleGroup).includes(prop)) 
         return ruleGroup.style[prop]  
      return null
   } 

   // finds the first index of the CSSrule that is applied
   // to the provided selector and contains the provided prop 
   indexOfRule(prop, selector) {
      return Array.from(this.rules).findIndex( rule => (
            rule.selectorText === selector && (
               GelSheet.getAllStylesInRule(rule).map( rType => (
                  GelSheet.shorthandProps.includes(prop) ?
                     (rType.includes(prop)) 
                     : (rType === prop)) 
               ).includes(true)
      )))
   } 

   // props and selectors - str or str[], precise - boolean
   // if precise is false it deletes the *entire* cssrule that contains
   // the provided style prop(s) and is under the provided selector
   // if true, it removes the rule but immediately restores a new version
   // of it without the style property indicated
   deleteRules(props, selectors, precise = false) {
      [].concat(props).forEach( prop => {
         [].concat(selectors).forEach( selector => {  
            for (let index = this.indexOfRule(prop, selector);
                  index !== -1;
                  index = this.indexOfRule(prop, selector)) { 
               if (precise === true) {
                  this.insertRule(   //CSSStyleSheet api
                     GelSheet.removeStyleFromRuleText(
                        this.rules[index].cssText, prop),
                     index + 1) 
               }
               this.deleteRule(index);   //CSSStyleSheet api
            } 
         })
      }) 
   } 
}








// Gelamint - A handy base web-component class that all others can inherit from
// uses constructable stylesheets API for style scoping and shadow DOM for templating
export class Gelamint extends HTMLElement {  

   static defaultCss = getDefaultCss()

   #template;
   #uniqueId;

   #sheets = {
      default: this.makeSheet('default', Gelamint.defaultCss)
   }

   attr = {
      // a person can only type the word 'attribute' out so many times...
      get: attr => this.getAttribute(attr),

      set: (attr, val) => this.setAttribute(attr, val),

      has: attr => this.hasAttribute(attr),

      remove: attr => this.removeAttribute(attr), 

      setMany: attrDict => Object.entries(attrDict).forEach(
         ([key,val]) => el.setAttribute(key, val)),

      toggle: attr => this.attr.has(attr) ?
         this.attr.remove(attr) : this.attr.set(attr,''),

      readOr: (attr, fb) => this.attr.has(attr) ? this.attr.get(attr) : fb,

      readAll: (target = this) => target.getAttributeNames().reduce(
         (obj,name) => ({ ...obj, [name]: target.getAttribute(name) }), {}),

      toList:  attr => this.attr.get(attr)?.match(/[^\s,]+/g) || [],

      toListN: attr => this.attr.has(attr) ?
         this.attr.toList(attr).map( s => parseInt(s))
         : null 
   } 

   constructor() {
      super();
      if (this.attr.has('uid')) { 
         // if not, uniqueId will be set after first triggering its 'get' accessor   
         this.uniqueId = this.attr.get('uid')
      }
      this.hostSelector = `:host([uid="${this.uniqueId}"])` // for scoping style rules

      // init the shadow DOM, immediately applying the default CSS stylings to it
      this.attachShadow({ mode: 'open' }).adoptedStyleSheets = [ this.#sheets.default ]; 
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

   set styleSheet(sheet) { 
      this.#sheets['main'] = sheet; 
      this.#applyStyleSheet(this.#sheets.main);
   } 
   get styleSheet() { return this.#sheets.main }
   get styles()     { return this.styleSheet }
   set styles(str)  { this.styleSheet = this.makeSheet('main', str) }

   get slotNodes()  { return this.getSlotNodes() } 

   makeSheet(name, content) {   

      const ident = (this.localName + '_')    
         + (this.title ? this.title + '_' : ``) 
         + (name ?? this.uniqueId)

      if (GelSheet.cache[ident] && GelSheet.cache[ident].noCache === false) {
         console.log('using cached Stylesheet for: "'+ident+'"');
         return GelSheet.cache[ident]
      }
      return new GelSheet(ident, content)  
   }

   #applyStyleSheet(newSheet) {
      this.shadowRoot.adoptedStyleSheets = [
         ...this.shadowRoot.adoptedStyleSheets,
         newSheet
      ]
   } 

   static styleAliases = {
      size : {
         width: w => `${w[0]}px`,
         height: h => `${h[1]}px`
      }, 
      position: {
         transform : vals => `translate3d(${vals[0]}px, ${vals[1]}px, 0px)` 
      }
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
         aliases = TlComponent.styleAliases,
            prop = propDef.prop,
            opts = propDef.options,
         targets = prop in aliases ? Object.keys(aliases[prop]) : [].concat(prop);
     
      if (prop && opts?.isolate && !(prop in this.#sheets)) { 
         this.#sheets[prop] = this.makeSheet(prop, { noCache: true}) 
         this.#applyStyleSheet(this.#sheets[prop])
      }  

      const targetSheet = this.#sheets[prop] //?? this.styles
 
      Object.defineProperty(self.style, prop, { 

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

            self.style[`_${prop}`] = newVal;

            if (opts?.isolate) { 
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
         .assignedElements()
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


   render(vals) {
      if (typeof vals === 'string' && this.#template.staticTemplate) {
         this.template = vals;
      }
      this.shadowRoot.replaceChildren(
         this.#stampTemplate(vals)
      );
      return this.shadowRoot
   }  
}

 
 

// its only a function so we can stick it down here
function getDefaultCss() { return `

   html        {  box-sizing: border-box;         } 
   h1,h2,h3,h4 {  margin:0;   padding: 0;         } 
   .opaque     {  opacity: 1!important;           }    
   .visible    {  visibility: visible!important;  } 

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



 
 