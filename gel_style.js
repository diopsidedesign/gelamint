
import { mimic, addMethodsToObj } from './gel_util.js' 
import { buttonStyleText } from '../../node_modules/gelicons/gelicons.js'

 



export const css = {
   resets : {
      block:` margin: 0; padding: 0; box-sizing: border-box;
              position: relative; width: 100%; height: 100%;`,
      userAgent:`border: none; appearance: none; outline: none;
              -webkit-appearance: none; box-shadow: none; 
              background: none; color: inherit; font-family: inherit;
              font-size: inherit; font-weight: inherit; `,
      thumb: null, dialog: null, input: null
   },
   common: {
      base:`
         :host                       { --gel-font-mono: 'MonoLisa Web', monospace;          }
         h1,h2,h3,h4                 { margin:0; padding: 0;                                }   
         .transparent                { opacity: 0;                                          }
         .invisible                  { visibility: hidden;                                  }
         .opaque                     { opacity: 1!important;                                }     
         .visible                    { visibility: visible!important;                       }   
         :host(:not(:defined)) svg   { visibility: hidden!important;                        } 
         :host(:defined)       svg   { visibility: visible;                                 } 
         :host([color-mode="dark"])  { --gel-ui-foreground: var(--gel-ui-foreground-light); }
         :host([color-mode="light"]) { --gel-ui-foreground: var(--gel-ui-foreground-dark);  }
         .gel-responsive-text        { font-family: var(--gel-font-mono);                   }
         button                      { display: block;                                      }
         svg               { display: block; width: 100%; height: 100%; fill-rule: evenodd; }  
         ${buttonStyleText}
         button.gel-button  { fill: var(--gel-ui-foreground); }
         `,
      scrollbar: `
         ::-webkit-scrollbar {

            width:  var(--gel-ui-scrollbar-width);  
            background-color: var(--gel-ui-background-darker-2); 
         } 
         ::-webkit-scrollbar:horizontal { height: var(--gel-ui-scrollbar-width); }
         ::-webkit-scrollbar:vertical   { width:  var(--gel-ui-scrollbar-width); } 
         ::-webkit-scrollbar-track { 
            
            border-left:1px solid rgba(0,0,0,.2);    
            background-color: var(--gel-ui-background-lighter-2); 
         } 
         ::-webkit-scrollbar-corner {
            pointer-events: none;
            background-color: var(--gel-ui-background-lighter-2);
         } 
         ::-webkit-scrollbar-thumb {  
            transition: background-color 200ms ease-in-out;
            border:1px solid rgba(0,0,0,.2);  
            background-color: var(--gel-ui-background-darker-2); 
            border-radius:   8px;
         } 
         ::-webkit-scrollbar-thumb:hover {
            background-color: var(--gel-ui-background-darker-1);  
         }`
         ,
      inputReset: null,
   }
}
css.resets.thumb  =`${css.resets.userAgent}\npadding: 0; margin: 0; background: transparent; box-sizing: border-box;`,
css.resets.dialog = `${css.resets.block}\n${css.resets.userAgent}`,
css.resets.input = `
   label, button, select, option,
   input[type=text],         input[type=text]:active,
   input[type=text]:hover,   input[type=text]:focus, 
   input[type=range]:active, input[type=range]:hover,
   input[type=range]:focus,  input[type=range] { 
      color: var(--gel-ui-foreground);
      ${css.resets.block}\n${css.resets.userAgent}\nuser-select: none; }
   input[type=range]::-webkit-slider-thumb { ${css.resets.thumb} }
   input[type=range]::-moz-range-thumb     { ${css.resets.thumb} } 
   input[type=number] { -moz-appearance: textfield; } 
   input::-webkit-outer-spin-button,
   input::-webkit-inner-spin-button {
      -webkit-appearance: none; margin: 0; }`
css.common.inputReset = css.resets.input

 










export function Sheet(id, init) {  

   const sheet = new CSSStyleSheet();

   if (typeof init === 'string' && init.length)
      sheet.replace(init).then();
 
   addMethodsToObj(sheet, {
      update(content) { this.replaceSync(content) },
      update_async(content, callback) {
         this.replace(content).then( update => callback?.call(this, update) )
      }, 
      stringifyDictAsCssRules(propVals, selector = ':root') {
      return  (Array.isArray(propVals) ? propVals : Object.entries(propVals))
         .map(([prop,val]) => {
            if (!prop.startsWith('_')) return `${prop}: ${val};`
         }).join('\n')  
      }
   });  
   
   mimic({ 
      identifier: id,
      initedWith: init
   }, sheet, true);
    
   return sheet
}  
   






export function Sheets(host, init = {}, apply) {  
   const sheets = { ...init }; 
   this.has = name => name ? (name in sheets) : Object.keys(sheets);
   this.get = name => this.has(name) ? sheets[name] : null; 
   this.add = (name, sheetContent, apply) => {  
      sheets[name] = sheetContent instanceof CSSStyleSheet ? sheetContent : new Sheet(name, sheetContent)
      if (apply === true) this.applySheet(sheets[name])  
   }
   this.applySheet = newSheet => {  
      let _host = host?.shadowRoot ?? document 
      _host.adoptedStyleSheets = [ ..._host.adoptedStyleSheets, newSheet ];      
   }
   this.make = function(name, content, apply) {
      new Sheet(name + (content && typeof content==='string'
         ? content.substring(0,99).replace(/\s/g,'').substring(0,30) : ''), content);
   }
   if (apply) 
      Object.entries(sheets).forEach( e => this.applySheet(e[1]));
}





export const sharedSheets = new Sheets({}, Object.entries(css.common).reduce(
      (acc, curr) => ({ [curr[0]] : new Sheet(curr[0], curr[1]), ...acc }), {})) 





export function findCSSCustomProps(host) { 
  return  (host instanceof CSSStyleSheet ? [host] : [...host.styleSheets])
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
   []); 
} 


 
