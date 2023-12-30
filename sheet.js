import { atomizeSheetColors } from './controlor.js'
import { MicroQueue }         from './list.js' 

export { GelSheet }

// Adds the provided constructable style sheet 'sheet' to the element
// 'el's list of adopted styleSheets
function applySheetTo(sheet, el) {
   const host = el.shadowRoot ?? el;
   if (host.adoptedStyleSheets) {
      host.adoptedStyleSheets = [ sheet, ...host.adoptedStyleSheets ];
   }
   return sheet;
}

// strips all non alpha numeric chars and converts to lowercase
const toLowerCaseAlphaNumeric = (str)=>
   str.trim().replace(/[^a-zA-Z0-9]/,'').toLowerCase();

// a very rough string comparison func
const looseStrEquals = (str1, str2)=>
   toLowerCaseAlphaNumeric(str1) === toLowerCaseAlphaNumeric(str2);

// For a given CSS Style Rule, get all defined style properties and
// their values in array entry form
const getStyleEntries = (rule)=> Object.keys(rule.style).map(
   index=> [
      rule.style[index],
      rule.style.getPropertyValue(rule.style[index])
   ]
)

// For a given CSS style rule, get all defined style properties and their
// values as an object
const getStyleObj = (rule)=>
   Object.fromEntries(rule ? getStyleEntries(rule) : [[]])

// convert a css style property object to properly formatted css rule text
const stringifyRules = (rulesDict, selector)=> (source=> !(source.length) ?
     ''
   : source.reduce(
        (acc, [prop, val])=> acc +`\n    ${prop}: ${val};`,
          selector?.length ? (selector+' {'):''
     ) + (selector?.length ? '\n}':'')
   )(
   Array.isArray(rulesDict) ? rulesDict : Object.entries(rulesDict) // source
);
  
const pipes = {
   toNumPattern: /[^0-9\.\,-]/ig,

   stripNonNumeric(val) {
      return val?.toString()?.replace(pipes.toNumPattern, '')
   },
   toTuple(val) {
      return pipes.stripNonNumeric(val)?.split(',')?.map(
         tkn=> parseFloat(tkn)
      )
   },
   toNumber(val) {
      return parseFloat(pipes.stripNonNumeric(val))
   },
   toPx(val) {
      return `${val}px`
   },
   toRem(val){
      return `${val}rem`
   }
} 

const stylePipes = {
   'generic': (prop)=> [ prop, ((z)=> z), ((z)=> z) ],   
   width:       [ 'width',       pipes.toPx, pipes.toNumber ],
   'max-width': [ 'max-width',   pipes.toPx, pipes.toNumber ],
   'min-width': [ 'min-width',   pipes.toPx, pipes.toNumber ],
   height:      [ 'height',      pipes.toPx, pipes.toNumber ],
   'max-height':[ 'max-height',  pipes.toPx, pipes.toNumber ],
   'min-height':[ 'min-height',  pipes.toPx, pipes.toNumber ],
   top:         ['top',          pipes.toPx, pipes.toNumber ],
   left:        ['left',         pipes.toPx, pipes.toNumber ],
   right:       ['right' ,       pipes.toPx, pipes.toNumber ],
   bottom:      ['bottom',       pipes.toPx, pipes.toNumber ],
   translate:   [
      'transform',
      ([x,y])=> `translate(${x}px,${y}px)`,
      pipes.toTuple
   ],
   translateX:  [ 'transform', (x)=> `translateX(${x}px)`, pipes.toNumber ],
   translateY:  [ 'transform', (y)=> `translateY(${y}px)`, pipes.toNumber ],    
   rotate:      [ 'transform', (ang)=> `rotate(${ang}deg)`, pipes.toNumber ],
   size: {
      width:  ['', 'width',  pipes.toPx, pipes.toNumber ],
      height: ['', 'height', pipes.toPx, pipes.toNumber ]
   },
   'z-index' :  [ 'z-index',  ((z)=> z), pipes.toNumber ],
   'fontSize':  [ 'font-size', pipes.toRem, pipes.toNumber ] 
} 

// BufferSheet - a separate style sheet instance that we use to 
// pre process rule text before copying to the destination stylesheet.
// Easiest way to ensure that malformatted or 
// blank rules are excluded from the final sheet markup
class BufferSheet {
   constructor(sheet=new CSSStyleSheet()) {
      this.sheet = sheet
   }
   processRuleText(content) {
      this.sheet.replaceSync(content);
      return [...this.sheet.rules]; 
   }
} 

class GelSheet extends CSSStyleSheet {  

   /*
   "docSheets" are what we call the main stylesheet(s) that the user
   imports in the header of their html file that starts the app 
   
   here we iterate through each adopted stylesheet that is on our 'document'
   object and call the upgradeToGelSheet method on each one - in order to 
   give them the instance fields and prototype methods that turn them from  
   a vanilla CSSStyleSheet into a slightly more advanced GelSheet
   (necessary because these stylesheets are imported before the gelamint 
   library is)
   */
   
   static upgradeDocSheets(dontChangeColors) {  
      const docSheets = [...document.styleSheets];
      for (const sheet of docSheets) {
         const upgraded = this.upgradeToGelSheet(sheet); 
         if (dontChangeColors !== true) {
            requestAnimationFrame(()=> atomizeSheetColors(upgraded)); 
         }
         if (!this.docSheet) {
            this.docSheet = upgraded; 
         }
      }
      return this.docSheet
   }   
 
   static upgradeToGelSheet(CSSStyleSheetInstance) { 

      const sht = CSSStyleSheetInstance;

      Object.setPrototypeOf(sht, GelSheet.prototype);

      // add missing instance fields
      sht.sections    = {};
      sht.raf         = null;
      sht.latest      = new Map();
      sht.toUpdate    = new Set();
      sht.updateQueue = new MicroQueue();
      sht.buffer      = new BufferSheet();

      return sht
   }

   // creates a new GelSheet that is an exact clone of all the style rules
   // in sheet 'sheet'
   static cloneSheet(sheet) {
      let newSheetTxt = ``;
      for (let i = 0; i < sheet.rules.length; i++) {
         newSheetTxt += (`\n`+sheet.rules[i].cssText);   
      }
      return new GelSheet(newSheetTxt)
   } 
   
   sections    = {};  
   raf         = null;   
   toUpdate    = new Set();
   latest      = new Map();
   updateQueue = new MicroQueue();
   buffer      = new BufferSheet();

   constructor(initContent = '') {
      super(); //<-- calls the vanilla CSSStyleSheet constructor
      if (initContent.length) {
         this.appendNewRules(initContent) 
      }
   }

   // -- sectionContent 
   // A method that populates the 'this.sections' object with blocks of
   // text representing each section of the styleSheet it identifies

   // A user can divide their stylesheets up into sections by adding a blank
   // css rule with a 'rules-section' attribute selector. Any rules following 
   // these markers will be assigned to the section indicated by the 
   // rules-section attribute value, until a new marker is encountered.

   // This is useful if we want to clone certain groups of style rules in 
   // a sheet but not the entire sheet
   sectionContent() { 
      let currSectionName = '';
      for (let i=0; i<this.rules.length; i++) {
         const rule = this.rules[i];
         if (rule.selectorText?.includes('rules-section=')) {  
            const ind1 = rule.selectorText.indexOf('"'); 
            currSectionName = rule.selectorText.substring(
               ind1 + 1,
               rule.selectorText.indexOf('"', ind1 + 1)
            ); 
            this.sections[currSectionName] =
               `\n\ndiv[rules-section="${currSectionName}"] {}\n\n`;
         }
         else if (rule.cssText) {
            this.sections[currSectionName] += (`\n\n`+rule.cssText);
         }
      }  
   }   

   // Style Pipes section

   // style pipes are css bindings that make it easier to rapidly update 
   // certain css styles without worrying about formatting proper css 
   // rule strings

   // function called by Gel.mint initialization script to init a custom 
   // component's style bindings (if present on the Gel.mint config object)
   // It accounts for the various formats/syntaxes that can be used to define 
   // style pipes, and calls the correct binding function based on whether its
   // a rule that binds multiple style properties at once, or just a single
   // style property
   initStylePipes(hostObj, name, def) { 
      
         if (typeof def === 'string') {
            let stylePipeDef;
            if (def.startsWith('--')) {
               stylePipeDef = [ def , ((z)=> z), ((z)=> z) ];
            }
            else if (stylePipes[def]) {
               stylePipeDef = stylePipes[def];
            }
            if (Array.isArray(stylePipeDef)) {
               this.bindStylePipe(hostObj, name, [ '', ...stylePipeDef, ])
            }
            else if (stylePipeDef.constructor?.name === 'Object') {
               this.bindMultiStylePipe(hostObj, name, stylePipeDef)
            }
         }
         else if (Array.isArray(def)) {
            const [ selector, stylePropAlias, callback ] = def; 
            let stylePipeDef;
            if (stylePropAlias.startsWith('--')) {
               stylePipeDef = [ stylePropAlias, ((z)=> z), ((z)=> z) ];
            }
            else if (stylePipes[stylePropAlias]) {
               stylePipeDef = stylePipes[stylePropAlias];
            }
            if (Array.isArray(stylePipeDef)) {
               this.bindStylePipe(
                  hostObj,
                  name,
                  [ selector, ...stylePipeDef, callback ]
               )
            }
            else if (stylePipeDef.constructor?.name === 'Object') {
               this.bindMultiStylePipe(hostObj, name, stylePipeDef, callback)
            }
         } 
   } 

   bindStylePipe(hostObj, propName, pipeDef) { 

      let [selector='', styleProp, setterPipe, getterPipe, callback] = pipeDef;

      selector = (`:host `+ selector).trim();

      Object.defineProperty(hostObj, propName, {
         get: ()=> getterPipe(
            this.getPropertyValue(styleProp, selector)
         ),
         set: (val)=> {
            const newVal = setterPipe(val); 
            this.updateStyleRule(styleProp, newVal, selector)
            if (callback && typeof callback === 'function') {
               callback(newVal);
            }
         }
      })
   }

   bindMultiStylePipe(hostObj, propName, multiPipeDef, callback) {
      const def = multiPipeDef;
      Object.defineProperty(hostObj, propName, {
         set: (arr)=> {
            Object.entries(def).forEach((entry, i)=> { 
               const [ name, [ sel, sProp, sPipe,,]] = entry; 
               const newVal = sPipe(arr.at(i));
               this.updateStyleRule(sProp, newVal, (`:host `+(sel??'')).trim())
               if (callback && typeof callback === 'function') {
                  callback(newVal);
               }
            })
         },
         get: ()=> {
            const arr = [];
            Object.entries(def).forEach(entry=> {
               const [ name, [ sel, sProp, _, gPipe =((x)=>x)] ] = entry; 
               arr.push( gPipe( 
                  this.getPropertyValue(sProp, (`:host `+(sel??'')).trim())
               ) )
            })
            return arr;
         }
      }) 
   }

   applyTo(el) { 
      return applySheetTo(this, el); 
   }

   // create and return a new GelSheet instance by cloning the indicated 
   // rule sections from this own sheet
   newSheetFromOwnSections(...args) { 
      if (Object.keys(this.sections).length===0) {
         this.sectionContent();
      }
      if (  args.length === 1
         && args[0].constructor?.name === 'Object'
         && 'exclude' in args[0]) {  
         const conf = args[0]; 
         args = Object.keys(this.sections).filter(
            prop=> !(conf.exclude.includes(prop))
         ) 
      }  
      let cssTxt = ``; 
      args.forEach(sectionName=> {
         if (this.sections[sectionName]) {
            cssTxt += (`\n`+this.sections[sectionName])
         }
      }); 
      return new this.constructor(cssTxt)
   }   
   
   // add rules to this stylesheet after running those rules through a test
   // buffer sheet first and then only copying the resulting valid rules
   appendNewRules(css) {    
      this.buffer.processRuleText(typeof css==='string' ?
           css
         : stringifyRules(css)
      ).forEach(
         rule=>  this.insertRule(rule.cssText, this.rules.length)
      );
      return this.rules.length    
   } 

   indexOfStyleRule(styleProp, optionalSelector) {
      return styleProp.length ?
           this.findRule(styleProp, optionalSelector).at(1)
         : -1
   }
 
   // returns a tuple containing both a reference and numerical index to the 
   // css style rule that affects the style propertyindicated by 'sProp'
   // if 'slctr' string is provided, it will only return rules whose selector
   // matches 'slctr'
   findRule(sProp, slctr) {   
      for (let i = 0; i < this.rules.length; i++) { 
         const rule = this.rules[i];
         for (const prop of [ ...rule.style ]) {
            if (  looseStrEquals(prop, sProp)
               &&  (slctr === undefined
                || (slctr && looseStrEquals(slctr, rule.selectorText)))) {
               return [ rule, i ];
            }
         }
      } 
      return [ null, -1 ]
   }

   // read the current value of a style property defined on this stylesheet
   // can narrow down the rule with 'slctr' like above
   getPropertyValue(prop, slctr) {
      const found = this.findRule(prop, slctr);
      if (found.at(0) != null) {
         return found.at(0).style.getPropertyValue(prop)
      }
      return null
   }

   // list all style properties affected by this StyleSheet
   listProperties() {
      let props = [];
      for (let i=0;i<this.rules.length;i++) { 
         props = props.concat([...this.rules[i].style])
      }
      return props
   }
   
   // Probably the most important method + used in the class
   // This is the method used to surgically add/update a style property's 
   // value in a stylesheet. It makes sure to throttle all updates so that 
   // they are not occurring quicker than the browser can repaint - if they 
   // are, it caches updates in a queue so they can all be applied at the 
   // next repaint frame.
   updateStyleRule(prop, content, selector='') { 
      content = content.toString();
      if (prop?.length && content?.length) {
         const key = selector +'_'+ prop;
         this.latest.set(key, content);
         if (!(this.toUpdate.has(key))) {
            this.toUpdate.add(key); 
            this.updateQueue.add(
               [  prop,
                  content,
                  selector,
                  ...this.findRule(prop, selector)  ]
            )
         } 
         if (this.raf === null && this.updateQueue.size) {   
            this.raf = requestAnimationFrame(()=> { 
               while (this.updateQueue.size) { 
                  const args = this.updateQueue.remove();
                  const _key = (args.at(2) ?? '')+'_'+args.at(0);  
                  this.toUpdate.delete(_key); 
                  if (args.at(4) !== -1) {
                     this.update(...args); 
                  }
                  else if (args.at(2).length) {
                     this.appendNewRules( args.at(2) + ' {\n'
                        + `    ${args.at(0)}: ${
                           this.latest.get(_key) ?? args.at(1)};\n}\n`);
                  }
               }
               this.raf = null; 
            }); 
         }
      } 
   }  

   // the internal update method called by 'updateStyleRule'
   // this performs the actual deleting/writing of style rules
   update(prop, val, selector, rule, index) {   
      this.deleteRule(index);      
      this.insertRule(`${rule.selectorText} {
         ${getStyleEntries(rule) 
            .map(([_prop, _val])=> [
               _prop,
               this.latest.get(selector+'_'+_prop)
                  ??
               (_prop === prop ? val : _val)
            ])
            .map(([p,v])=> `${p}: ${v};`).join('\n')}
      }`, index);   
   }  
}
 