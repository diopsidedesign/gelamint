import { GelSheet }  from './sheet.js'
import { funcs }     from './funcs.js' 
import { 
   COLORCONF,
   snapshot,
   getRandomHslColorStr,
   isValidColor,
   convert,
   toOpaqueColor,
   parseColorFromGradientStr 
} from './color.js'

export { atomizeSheetColors } 
export { Controlor } 

// generate the css necessary to link one color variable to another
const getColorLinkCss = funcs.memoize()(
   function colorLinkCss(id, target=id ) { 
      return [ 
         generateRelativePropDefs( id), 
         generateAllShadesCss(id, id) 
      ].join('\n')
   }
);  

// GelColor automatically generates a number of different shades for 
// each color it identifies in the master stylesheet
//
// This is the function used to generate the css text for a single shade
//  css custom property
function generateShadeCss(target, plusOrMinus, index) {
   return `hsl(
      var(${ target }-h) 
      var(${ target }-s) 
      calc((clamp(
         var(--num-shades),
         var(${ target }-l-dec),
         (100 - var(--num-shades))
      ) * 1%) ${ plusOrMinus } (var(${ target }-l-step) *
      (var(${ target }-l-factor)*${ index+1 })) * 1 ) 
      / var(${ target }-alpha) );`
} 

// generate the css to link the atomic color values of one css variable
// to those of another
function getColorValuesLinkCss(id, target=id) {
   return COLORCONF.stateProps.map(
      (prop)=>`${id}-${prop}: var(${target}-${prop});`,``
   ).join('\n')
} 

// 'out' means making a dark color darker,  or making a light color lighter
// 'in'  means making a dark color lighter, or making a light color darker
const generateAllShadesCss = funcs.memoize()( function(id, target=id) { 

   return (Array(COLORCONF.shades.numShades).fill().map((_,i)=> 

      `${id}-shade-in-${ i+1}: ${target===id ?
           generateShadeCss(target,'-', i)
         : `var(${target}-shade-in-${ i + 1});`}`

      +'\n'+

      `${id}-shade-out-${i+1}: ${target===id ?
           generateShadeCss(target,'+', i)
         : `var(${target}-shade-out-${i + 1});`}`

   ).join('\n').toString()); 
});  

// Generates the [name-here]-contrast css variable color definition as well
// as necessary intermediate css variable definitions
// these enable automatic light/dark contrast switching of foreground colors 
// based on their background color
const generateRelativePropDefs = funcs.memoize()(
   function( id, target=id) {      
      return ( 
`${id}-gray: calc((
   (( var(${target}-alpha) * var(${target}-r) +
      ((1 - var(${target}-alpha)) * var(--active-bgcolor-r))) * 0.299
   ) +
   (( var(${target}-alpha) * var(${target}-g) +
      ((1 - var(${target}-alpha)) * var(--active-bgcolor-g))) * 0.587
   ) +
   (( var(${target}-alpha) * var(${target}-b) +
      ((1 - var(${target}-alpha)) * var(--active-bgcolor-b))) * 0.114
   )
) - 128);\n`+
`${id}-l-factor: calc(
   var(${target}-gray) / max(
      var(${target}-gray),
      calc(-1 * var(${target}-gray))
   )
);\n` +
`${id}-l-step: calc(clamp(1, ((max( (2 * clamp(
   var(--num-shades),
   var(${target}-l-dec),
   (100 - var(--num-shades))
)), (100 * var(${target}-l-factor))) - clamp(
   var(--num-shades),
   var(${target}-l-dec),
   (100 - var(--num-shades))
)) / var(--num-shades)), ( var(--shade-range) / var(--num-shades))) * 1% );\n`+
`${id}-contrast-l: calc(100% - ((((128 + (
   var(${target}-l-factor) * 128
)) / 255) * 100) * 1%));\n`+
`${id}-contrast: hsl(
   var(${target}-h)
   var(${target}-s)
   var(${target}-contrast-l)
   / 1
);`) 
   }
);  

// for a given color state object (Result of the snapshot method)
// generate the corresponding css to implement the changes
// 
// i.e  if your original css color variable was named '--myvar'
//      and the color state object had values for r, g, b, h, s, l-dec, hex
//      this would generate property defs for:
//       --myvar-r, --myvar-g, --myvar-b
//       --myvar-h, --myvar-s, --myvar-l-dec,
//       --myvar-hex, --myvar-l, --myvar (redefined)
function generateColorComponentValuesCss(colorStateObj, customPropName) { 
   return (cfg=> Object.entries(colorStateObj)
      .filter(([prop,])=> cfg.stateProps.includes(prop))
      .concat([
         [ `l`, `calc(var(${customPropName}-l-dec) * 1%)`],
         [ ``, `hsl(
            var(${customPropName}-h)
            var(${customPropName}-s)
            var(${customPropName}-l)
            / var(${customPropName}-alpha)
         )`]
         ])
      .map(   ([prop, val])=> `${customPropName}${
         prop.length ? '-':''}${prop}: ${Number.isFinite(val) ?
         funcs.round(val, cfg.roundPrecision).toString()
         +(cfg.symbols[prop] ?? ''):val};`
      ).join('\n'))(COLORCONF)
} 








// atomizing colors

// When GelColor 'atomizes' a color, it adds a number of new CSS custom prop
// definitions that allow more design flexibility when working with the 
// color. If you originally define a color on your master stylesheet called
// '--myvar' and set its value to a red hex color: '#FF0000', GelColor can 
// detect and atomize this color, giving the designer access to things like
// the color's component parts in different color formats:
//  --myvar-r: 255;
//  --myvar-g: 0;
//  --myvar-b: 0;
//  --myvar-h: 180;
//  --myvar-s: 100;
//  --myvar-l: 50;
//  --myvar-hex: #ff0000;
// It also can generate a configurable number of light/dark shades
//  --myvar-shade-light-1: <<def here>>;
//  --myvar-shade-dark-1: <<def here>>;
// It also generates a special variable called 'contrast':
//  --myvar-contrast: <<def here>>;
// If the -contrast variable is used for foreground text being displayed over
// a background of --myvar, it will always, automatically choose the 
// appropriate light or dark text color for maximum readability and contrast

// to change the number of light/dark shade variables generated, change the '4'
// value below on '--num-shades' to a different number 

// to change the total lightness range covered by set of light / dark shades, 
// change the value of '--shade-range' below to something other than 25


// This function searches a provided stylesheet 'sheet' for color definitions
// and if they are found, expands the color definitions with atomized versions
// but without affecting the original css definition

function atomizeSheetColors(sheet) {
   let newRulesTxt = [];
   const moddedColors = [];
   sheet.insertRule(`:root {
      --shade-range: 25;
      --num-shades: 4;
      --active-bgcolor-r: var(--gel-background-r);
      --active-bgcolor-g: var(--gel-background-g);
      --active-bgcolor-b: var(--gel-background-b);
      --active-bgcolor: var(--gel-background);
   }`)
   for (let i = 0; i < sheet.rules.length; i++) {
      const rule = sheet.rules[i];
      if (rule.selectorText === ':root' || rule.selectorText === ':host') {
         for (const index of Object.keys(rule.style)) {
            const [ prop, val ] = [
               rule.style[index],
               rule.style.getPropertyValue(rule.style[index])
            ];
            if (prop.startsWith('--') && isValidColor(val)) {
               moddedColors.push([ rule.selectorText, prop ]);
               newRulesTxt.push([ rule.selectorText+ ' { ',
                  generateColorComponentValuesCss((colStateInit=>
                     ({ ...colStateInit,
                        alpha: 1,
                       'l-dec': colStateInit.l,
                       [prop]: `hsl(
                           var(${prop}-h)
                           var(${prop}-s)
                           var(${prop}-l)
                           / var(${prop}-alpha)
                        )`,
                     }) )( snapshot(...convert(val)) ),
                     prop
                  ),
                  '}'
               ].join('\n')+'\n');
            }
         }
      } 
   }
   if (newRulesTxt.length) {  
      newRulesTxt.forEach(
         ruleTxt=> sheet.insertRule(ruleTxt, sheet.rules.length)
      ); 
   }
   if (moddedColors.length)  {
      moddedColors.forEach(
         ([selector, prop])=> sheet.insertRule(
              selector
            + ' {\n'
            + getColorLinkCss(prop)
            + '\n}\n', sheet.rules.length
         )
      );    
   }
} 

// for a given style sheet 'sheet', find the style rule that affects
// the css property 'propName'
// returns a tuple of the format : [rule, ruleIndex]
function findColorValuesRule(propName, sheet) { 
   for (let i = 0; i < sheet.rules.length; i++) {
      const rule = sheet.rules[i];
      const styleProps = Object.keys(rule.style).map(key=> rule.style[key]);
      if (styleProps.includes(propName+'-h')) {
         return [ rule, i ]
      }
   }
   return [ null, -1 ]
} 



// This class is for creating *observable* colors connected to 
// specific css custom properties (variables)
// if you want a color that other objects can observe, and a color
// that will automatically update its corresponding css when any aspect
// of it is changed, you can use this class

// This developer primarily uses it to implement the active color in a color
// picker where you need the same set of ui elements to take on the value of 
// a number of different css variable colors depending on what's clicked, but
// you also want all occurrences of the clicked variable color to change along
// with the UI elements

// for instances of this Color class, the true state is all captured entirely 
// within the sealed '#hsl' variable as well as the '#alpha' variable for 
// transparency. all other representations of the color, such as hex, rgb, etc.,
// are realized by  accessor properties that query the necessary (likely cached) 
// conversion on-demand
class Controlor {
      
   static COLORCONF = COLORCONF;
   static getRandomHslColorStr = getRandomHslColorStr;
   static isValidColor = isValidColor;
   static convert = convert; 
   static toOpaqueColor = toOpaqueColor;
   static parseColorFromGradientStr = parseColorFromGradientStr;

   
   #hsl = Object.seal([0,0,0]);     
   #alpha = 1;   
   #observers = new Set();

   #hostSheet; 
   #identifier;
   #target;
   #styles;
   #last; 
   #rafWait;
 
   constructor(nameOrVal, initVal = ``) {   

      let computedVal = initVal;

      if (  !nameOrVal
         || (initVal && typeof initVal !== 'string')
         || (!nameOrVal.startsWith('--') && !isValidColor(initVal))) { 
         throw new Error(`Color Init: null or wrong type`);  
      }

      if (initVal.startsWith('--')) {
         computedVal = document.styleSheets[0].getPropertyValue(initVal) 
      }

      this.#identifier = nameOrVal; 
      this.#target     = initVal;
      this.initArgs    = {
         computedValue: computedVal,
         target:        initVal,
         colorSpace:    computedVal.startsWith('#') ?
              'hex'
            : initVal.split('(')[0].trim()
      }   

      // give our observable color expanded/atomized color definitions
      this.#styles = new GelSheet(`:root {
         ${nameOrVal+'-l'}: calc(var(${nameOrVal}-l-dec) * 1%);
         ${nameOrVal}: hsl(
            var(${nameOrVal}-h)
            var(${nameOrVal}-s)
            var(${nameOrVal}-l)
            / var(${nameOrVal}-alpha)
         );
         ${generateRelativePropDefs(nameOrVal)}
         ${generateAllShadesCss(nameOrVal, nameOrVal)}
      }`).applyTo(document);

      if (isValidColor(computedVal)) {
         this.hsl = convert(computedVal, 'hsl')
      }
      // triggering the hsl setter above will also write our 
      // first set of atomic css property values to #styles
   } 
  
   #writeStatePropValsToCss(keyValDict) {   

      const writeProps = Object.entries(keyValDict)
         .filter(([prop, ])=> COLORCONF.stateProps.includes(prop))
         .map(([prop, val])=> [
            this.#identifier+'-'+prop,
            ( Number.isFinite(val) ?
                 Conv.round(val, COLORCONF.roundPrecision)
               : val
             ).toString() + (COLORCONF.symbols[prop] ?? '')
         ]);

      if (this.firstWrite !== true) {
         this.firstWrite = true;
         this.#styles.insertRule(`:root {
            ${writeProps.map(([prop, val])=> `${prop}: ${val};`).join('\n')}
         }`);
      }
      else {
         writeProps.forEach(
            ([prop, val])=> this.#styles.updateStyleRule(prop, val, ':root')
         ) 
         // methinks the updateStyleRule method should be modified so that it
         // can both write new values + rules as well as modify existing ones,
         // so that these types of conditionals aren't necessary
      }
   }

   // compares provided array of nums 'hsla' to that cached in '#last'
   // and returns a boolean indicating whether any element at all has changed
   // in the array
   #isDifferentThanLast(hsla){
      return ( this.#last==null
            || this.#last.map((v,i)=> v === hsla[i]).includes(false)
      )
   } 

   // caches transmitted updates so we can compare with the newest queued update 
   // and ensure that its different (so we won't repeatedly emit notifications 
   // with redunant data)
   #saveOutgoingUpdate(data) {
      this.#last = this.#last ?
           ['h','s','l','alpha'].map((v,i)=> data[v] ?? this.#last[i])
         : Object.seal([data.h, data.s, data.l, data.alpha]);
         // ^ init if undefined
   } 

   // snapshot - this method is triggered anytime a change in value
   // has been committed to our color - usually via accessor properties
   // 
   // It is rate limited to each browser repaint frame.
   // It calls the correct functions to capture and cache the color's complete
   // state, calls the function to write the corresponding css,
   // and calls the function to notify observers if relevant
   snapshot() {    
      if (this.#rafWait == null) {  
         this.#rafWait  = requestAnimationFrame(()=> {        
            // note that 'snapshot' below is referring to the identically named
            // method outside this class prototype definition (in other words,
            // not THIS snapshot method, that other one...)
            const updated = { ...snapshot(...this.hsl), alpha: this.alpha };     
            updated['l-dec'] = updated.l
            this.#writeStatePropValsToCss(updated);
            if (this.#isDifferentThanLast(
               [updated.h, updated.s, updated.l, updated.alpha]
            )) {
               this.notify(updated);
            }
            this.#rafWait = null
         })
      } 
   } 

   notify(data) {
      this.#saveOutgoingUpdate(data);
      this.#observers.forEach(f=> f(data));
   }

   unsubscribe(f) {
      this.#observers.delete(f)
   }

   subscribe(f) { 
      this.#observers.add(f)    
      this.snapshot() 
   }

   link(colorName)   {
      this.#target = colorName;
      return getColorLinkCss(this.name, colorName, ':root');
   } 
   set hsl(hsl)      {
      if (!Array.isArray(hsl)) {
         hsl = convert(hsl);
      }
      [this.h, this.s, this.l] = [...hsl.flat()];
   }  
   get target()      { return this.#target }
   get linkCss()     { return this.link(this.name) }     
   set alpha(a)      { this.#alpha  = a; this.snapshot() }  
   set h(h)          { this.#hsl[0] = h; this.snapshot() }
   set s(s)          { this.#hsl[1] = s; this.snapshot() }
   set l(l)          { this.#hsl[2] = l; this.snapshot() }   
   set hex(hex)      { this.hsl = convert(hex) }  
   set rgb(rgb)      { this.hsl = convert(rgbStr(rgb)) }   
   set r(r)          { this.hsl = convert(rgbStr( [r,    this.g, this.b])) }
   set g(g)          { this.hsl = convert(rgbStr( [this.r,    g, this.b])) }
   set b(b)          { this.hsl = convert(rgbStr( [this.r, this.g,    b])) }   
   get hsl()         { return [...this.#hsl] } 
   get h()           { return this.#hsl[0] }
   get s()           { return this.#hsl[1] }
   get l()           { return this.#hsl[2] }  
   get alpha()       { return this.#alpha } 
   get rgb()         { return convert(this.hsl, 'rgb' ) }  
   get hex()         { return convert(this.hsl, 'hex') }  
   get r()           { return this.rgb[0] } 
   get g()           { return this.rgb[1] } 
   get b()           { return this.rgb[2] }     
   get name()        { return this.#identifier }   
   get initVal()     { return this.initArgs.value } 
   get lightOrDark() { return isLightOrDark(...this.rgb) }     
} 