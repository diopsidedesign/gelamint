// GelSheet - A wrapper class around the DOM native 'CSSStyleSheets' interface that makes
// it easier + more semantic to manipulate / remove style rules
// caches generated sheets  
export class GelSheet extends CSSStyleSheet {

   static cache = {}  

   static shorthandProps = [
      'background','font','margin','border','transition',
      'animation','transform','padding','list-style','border-radius'
   ]

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

   // from:  https://css-tricks.com/how-to-get-all-custom-properties-on-a-page-in-javascript/
   static findCSSCustomProps(host) {
      return  [...host.styleSheets]
         .filter( (styleSheet) => (
            !styleSheet.href ||
            (styleSheet.href.indexOf(window.location.origin) === 0))
         )
         .reduce( (finalArr, sheet) =>
            finalArr.concat([...sheet.cssRules]
               .filter( (rule) => (rule.type === 1))
               .reduce( (propValArr, rule) => {
                  const props = [...rule.style]
                     .map((prop) => [
                        prop.trim(),
                        rule.style.getPropertyValue(prop).trim()
                     ])
                     .filter(([prop]) => prop.indexOf("--") === 0); 
                     return [...propValArr, ...props];
                  },
               [])
            ),
         [])
   } 

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
 
      this.noCache = initObjOrTxt?.noCache === true  
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
      if (typeof initObjOrTxt === 'function') {
         initObjOrTxt = initObjOrTxt()
      }
      if (typeof initObjOrTxt === 'string'
         || (typeof initObjOrTxt === 'object'
             && 'content' in initObjOrTxt)) {
         // if str content was passed to constructor, 
         // apply it to the new css sheet
         this.replaceSync(initObjOrTxt.content ?? initObjOrTxt) //CSSStyleSheet api
      }

      
   }

   // gets all rules in this sheet that exactly match the provided
   // selector
   getRuleGroup(selector) {   
      return (
         matches => matches.length === 1 ? matches[0] : matches
         )(
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
