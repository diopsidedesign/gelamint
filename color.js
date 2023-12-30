import { funcs } from './funcs.js'
 
export {
   COLORCONF,
   getRandomHslColorStr,
   isValidColor,
   convert,
   toOpaqueColor,
   parseColorFromGradientStr,
   snapshot
}

const stateCache = new Map();
 
let colorCount = 0;    
 
const Rgx = {
   color: { // for color-related text parsing
      parse: /(?<=#)(?=[0-9a-f])|[^a-z0-9\.\#]+(?=[a-z0-9#\.]*)/ig,
      prefix: /^o?k?lab$|^o?k?lch$|^rgba?$|^hs[lv]a?$|^cmyk$|^hex$|^#$/i,
      validateHex: /^#?([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/i ,  
      hexFull: /^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i,    
      hexShorthand: /^([0-9a-f])([0-9a-f])([0-9a-f])/i,  
   }
} 
 
const Conv = {   

   round: funcs.round,
   rand:  funcs.rand,   

   isHexStr: (str) => (
         typeof str === 'string'
      && str.startsWith('#')
      && (str.length === 7 || str.length === 4)
      && str.replace(/[^0-9a-fA-F#]/g,'').length === str.length
   ),

   getMaxMinDiff: (threeVals) => { 
      const max = Math.max(...threeVals)
      const min = Math.min(...threeVals)
      return [ max, min, (max - min) ]  
   },   
 
   normalizeHue: (r, g, b, max, diff) => { 
      if (max === r) {
         return (( (g - b)/diff +  (g<b ? 6 : 0)) / 6)
      }
      if (max === g) {
         return ((b-r) / diff+2)/6
      }
      return ((r-g) / diff+4)/6 
   },
 
   fns: {   
      cmyk2hex: (cmyk) => Conv.fns.rgb2hex(Conv.fns.cmyk2rgb(cmyk)),
      cmyk2hsl: (cmyk) => Conv.fns.rgb2hsl(Conv.fns.cmyk2rgb(cmyk)),
      cmyk2hsv: (cmyk) => Conv.fns.rgb2hsv(Conv.fns.cmyk2rgb(cmyk)),

      cmyk2rgb: (cmyk) =>
         [ ...cmyk.slice(0, -1).map(v=> ((1-v) * (1-cmyk[3]))) ],

      hex2cmyk: (hex ) => Conv.fns.rgb2cmyk(Conv.fns.hex2rgb(hex)),
      hex2hsl: (hex)   => Conv.fns.rgb2hsl(Conv.fns.hex2rgb(hex)) ,
      hex2hsv: (hex)   => Conv.fns.rgb2hsv(Conv.fns.hex2rgb(hex)) ,

      hex2rgb: (hex)   => {   

         const ptn = hex.length > 5 ?
              Rgx.color.hexFull
            : Rgx.color.hexShorthand;

         return hex.match(ptn).slice(1).map(e=> {
            if (hex.length > 5) {
               return (parseInt(e, 16) / 255)
            }
            else {
               return ((0x11 * parseInt(e, 16)) / 255)
            } 
         })
      },

      hsl2cmyk: (hsl) => Conv.fns.rgb2cmyk(Conv.fns.hsl2rgb(hsl)),
      hsl2hex:  (hsl) => Conv.fns.rgb2hex( Conv.fns.hsl2rgb(hsl)),

      hsl2hsv:  (hsl) => {  
         const [h,s,l] = hsl
         const v = s*Math.min(l,1-l)+l
         if (v===0) {
            return [h, 0, v]
         } 
         return [h, (2 - 2*l/v), v] 
      }, 
 
      hsl2rgb: (hsl) => {     
         const [h,s,l] = hsl
         const fofN = (n) => (( n +( h*360 )/ 30) % 12)
         const f = (n, k = fofN(n)) => (
            l - ( s*Math.min(l, 1-l) * Math.max(Math.min(k-3, 9-k, 1), -1))
         );
         return  [f(0), f(8), f(4)] 
      }, 

      hsv2cmyk: (hsv) => Conv.fns.rgb2cmyk(
         Conv.fns.hsl2rgb(Conv.fns.hsv2hsl(hsv))
      ),
      hsv2hex: (hsv)  => Conv.fns.rgb2hex(
         Conv.fns.hsl2rgb(Conv.fns.hsv2hsl(hsv))
      ),

      hsv2hsl: (hsv)  => {    
         const [h,s,v] = hsv
         const l = (2-s) * v/2 

         if (l === 0) {
            return [h, s, l]
         }
         if (l === 1) {
            return [h, 0, l]
         }
         return [
            h, 
            ( s*v / ( l<0.5 ? 2*l : (2-2*l) )),
            l
         ] 
      }, 

      hsv2rgb: (hsv) => Conv.fns.hsl2rgb(Conv.fns.hsv2hsl(hsv)),

      rgb2cmyk: (rgb) => {  
         const k = 1 - Math.max(...rgb)
         return [ ...rgb.map( v => ((1-v-k)/(1-k)) ),  k] 
      },

      rgb2hex: (rgbd) => {         
         const [r,g,b] = Conv.normalize('rgb', rgbd, 255).map(
            (num) => Math.round(num)
         ); 
         return  '#'+(0x1000000+(r<<16)|(g<<8)|(b<<0)).toString(16).slice(1)
      }, 

      rgb2hsl: (rgb) => {
         const [max, min, diff] = Conv.getMaxMinDiff(rgb)
         const l = (max + min) / 2

         if (max === min) {
            return [0, 0, l]
         }
         const h = Conv.normalizeHue(...rgb, max, diff)

         if ((max + min) / 2 > 0.5) {
            return [h, diff / (2-max-min), l]
         } 
        return [h, (diff / (max+min)), l] 
      },

      rgb2hsv: (rgb) => {   
         const [max, min, diff] = Conv.getMaxMinDiff(rgb)
         let h;
         if (max === min) {
            h = 0
         }
         else {
            h = Conv.normalizeHue(...rgb, max, diff)
         }
         return [ h, (max === 0) ? 0 : (diff/max), max ]  
      }
   },

   // simplifies some math in the 'normalize' function below
   adjustHueFactor: (factor) =>
      (factor < 1 ? .277777 : 3.6) * factor,
 
   normalize: (toMode, values, factor) => {    
      if (typeof values === 'string' || values.length === 1) {
         return values.toString() 
      }
      const normFactors = Array(values.length).fill(factor); 
      if (toMode.includes('h')) {
         normFactors[0] = Conv.adjustHueFactor(factor) 
      }
      return values.map((val, i) => (val * normFactors[i]))
   }, 

   // breaks a string 'input' up into its different meaningful parts 
   // i.e  parse('#39B54A')        => ['hex','39b54a']
   //      parse('rgb(20,105,200') => ['rgb', 20, 105, 200]
   parse: (input)=> {    
      const matches = input.split(Rgx.color.parse).filter( s => s ).slice(0,5)
      if (matches.length) {
         return [
            matches[0].replace('#','hex'),
            ...(Conv.isHexStr(input) ? 
                 [matches[1]] 
               : matches.slice(1).map( s => parseFloat(s))
            )
         ];
      }
      return false
   }
} 
 
const COLORCONF = Object.seal({  

   stateProps: [ 'r','g','b','h','s','l-dec','alpha','hex'], 

   varProps:   [ 'h','s','l','r','g','b','hs','gray','alpha',
                 'l-factor','l-shade','l-dec' ], 
   names: {
      h: 'Hue', s: 'Saturation', l: 'Lightness',
      r: 'Red', g: 'Green', b: 'Blue',
      c: 'Cyan', m: 'Magenta', y: 'Yellow', k: 'K_Black',
      a: 'Alpha', v: 'Value', x: 'Hex' 
   }, 
   symbols: {
      h: 'deg', s:'%', l:'%', r:'',
      g:'', b:'', v:'%', c:'%',
      m:'%', y:'%', k:'%',
      hsl:  ['deg', '%', '%'],
      rgb:  ['','',''],
      cmyk: ['%','%','%','%']
   },
   sets: {
      h: 'hsl', s: 'hsl', l: 'hsl',
      r: 'rgb', g: 'rgb', b: 'rgb',
      c: 'cmyk',m: 'cmyk',y: 'cmyk', k: 'cmyk',
      a: '', v: 'hsv', x: 'hex',  
   },

   modes: new Set([
      'rgb','hex','hsla',
      'hsl','hsv','cmyk',
      '#','rgba','lab',
      'lch','LAB','LCh'
   ]), 

   roundPrecision: 3, 
   shades: {
      numShades: 4,
      shadeRange: 16,
      shadeDesaturate: 2.85,
      propTokens: [
         'var(--num-shades)',
         'var(--shade-range)',
         'var(--shade-desaturate)'
      ]
   },  

   rgbWts: {
      r: 0.299, g: 0.587, b: 0.114
   }, 

   max:     { 
      rgb: 255, rgba: 255, hsl: 100,
      hex: 1, cmyk: 100, hsv: 100, 
      h: 360, s: 100, l: 100,
      r: 255, g: 255, b: 255,
      hex: 1, alpha: 1, v: 100, 
      c: 100, m: 100, y: 100, k: 100, 
   } 
})  

// [ 20, 110, 90, 0.5 ] --> 'rgb(20 110 90 / 0.5)'
function rgbStr([r,g,b,a]) {
   return `rgb(${r} ${g} ${b}` + (!!a ? ` / ${a}`:``)+')'
}

// [ 310, 80, 50, 0.5 ] --> 'hsl(310 80 50 / 0.5)'
function hslStr([h,s,l,a]) {
   return `hsl(
      ${h + COLORCONF.symbols.h} 
      ${s + COLORCONF.symbols.s} 
      ${l + COLORCONF.symbols.l}
   ` + (!!a ? ` / ${a}`:``)+')'
}

function validateHex(hexStr) {
   return typeof hexStr === 'string' 
       && hexStr.length>2
       && Rgx.color.validateHex.test(hexStr.toLowerCase()) 
} 

// can constrain ranges of h,s, and l by passing in an object
// w/ their ranges defined
// i.e passing in  { h: { min: 100, max:200 } }
// for arg will constrain randomized hue values to being between 100 and 200
function getRandomHslColorStr(arg) {
   const dat = {
      h: { min: arg?.h?.min ?? 0, max: arg?.h?.max ?? 360 },
      s: { min: arg?.s?.min ?? 0, max: arg?.s?.max ?? 100 },
      l: { min: arg?.l?.min ?? 0, max: arg?.l?.max ?? 100 }
   }
   return hslStr(['h','s','l'].map(arg=>  
      Math.floor(Math.random() * (dat[arg].max-dat[arg].min)) + dat[arg].min 
    ).concat(1))
}  

// extracts the color value from a CSS linear-gradient definition string
function parseColorFromGradientStr(gradStr) {
   return gradStr
      .split(/(?=rgb)/g)
      .map(tkn=> tkn.replace(/(?<=\)).*$|\s/g,''))
      .at(1)
}
 
// calculates a gamma-corrected greyscale representation of the 
// rgb color [r,g,b] and returns string 'light' or 'dark' depending
// on where that value falls on the range 0-255 
function isLightOrDark(r,g,b) {  
   return ( Math.min( 255, Math.pow(
      (Math.pow(( r / 255), 2.2) * 0.2126)  +
      (Math.pow(( g / 255), 2.2) * 0.7152)  + 
      (Math.pow(( b / 255), 2.2) * 0.0722), 
      0.4545 ) * 255 )
   ) < 128 ? 'dark' : 'light'
} 

// Returns a boolean indicating whether the input string '_in'
// is a valid CSS color definition string
function isValidColor(_in, input=_in?.trim()) { 

   if (!input || input?.length < 4) {
      return false  
   }

   if (input.includes('px')||input.includes('em')) {
      return false
   }

   const parsed = Conv.parse(input);   

   if (  parsed === false
      || parsed.length === 1
      || !(COLORCONF.modes.has(parsed[0]))) {
      return false   
   }

   if (Conv.isHexStr(input)) {
      return Rgx.color.validateHex.test('#'+parsed[1]) 
   }

   const max = [...parsed[0]].map(x=> COLORCONF.max[x]) ; 

   return (
      !( parsed.slice(1).map(
              (m,i)=> isNaN(parseFloat(m))||m > max[i]||m < 0
         ).includes(true)
       ) && parsed.length > 3
   )    
};


// Takes a provided string 'colorVal' and an indicated color format
// string identifier '_toMode' and converts the color to the indicated 
// format. Output is either a CSS color string or an array of numerical
// values representing the color
const convert = funcs.memoize((cV, _to)=> JSON.stringify([cV, _to]))(
   function(colorVal, _toMode) {   
     
      const numeric = Array.isArray(colorVal);

      const to = _toMode?.trim()?.toLowerCase() ?? 'hsl';

      const colorIn = numeric ?
           colorVal.flat()
         : colorVal?.trim().toLowerCase().replace(/  +/g, ' ');
 
      // basic error handling block
      if (!Rgx.color.prefix.test(to)) {
         throw new Error(
            `Specified target mode '${to}' invalid or not supported.`
         ) 
      }
      if (!numeric  && !isValidColor(colorIn)) {
         throw new Error(
            `Cannot convert '${colorIn}': input is not a valid color string`
         ) 
      }
      if (numeric && colorIn.map(
            (n, i) => (n>=0 && n<=(i===0 ? 360:100))).includes(false)
         ) {
         throw new Error(
            `Cannot convert '${colorIn}': invalid range`
         )   
      }
      if (  (numeric && to==='hsl') ||
           (!numeric && colorIn.startsWith(to) ||
          (to=='hex' && Conv.isHexStr(colorIn))))  {   
         return (to=='hex' || numeric) ?
              colorIn
            : Conv.parse(colorIn).slice(1);
      }   

      const initVals = numeric  ?
           ['hsl', ...colorIn]
         : Conv.parse(colorIn);

      const from = initVals[0].replace('a','');  

      if (numeric) {
         // find and return the relevant cached value from the state cache if
         // it exists
         const cached = stateCache.get(
            JSON.stringify([...colorIn].map(n=> Conv.round(n, 1)))
         );
         if (cached && ['hex','rgb','rgba','hsla','hsl'].includes(to)) { 
            if (to==='hex') {
               return cached.hex
            }
            else { 
               return [...to].map(l=> cached[l])
            }
         } 
      } 

      const converted = Conv.fns[from+'2'+to](
         Conv.normalize(
            from,
            initVals.slice(1),
            1 / COLORCONF.max[from]
         )
      );

      return to=='hex' ?
         converted
         : Conv.round(
            Conv.normalize(
               to,
               converted,
               COLORCONF.max[to]
            ),
            COLORCONF.roundPrecision
           )  
}); 

// for a foreground color with a given alpha value over a certain background 
// color, calculates the equivalent opaque RGB color of that blend
const toOpaqueColor = funcs.memoize()(
   function(fgRgb, alpha, bgRgb) {
      return fgRgb.map(
            (fgVal, i)=> (alpha * fgVal) + ((1-alpha) * bgRgb[i])
         ).map(
            n=> Math.round(n)
         )
   }
);  

// internal method that caches all possible conversion values for a color
// so further conversions can just query previously cached results
const snapshot = funcs.memoize(
      args=> JSON.stringify(args.map(
            n=> Conv.round(parseFloat(n), 1)
      )), stateCache
   )(
   (...hsl)=> ((_rgb = convert(hsl, 'rgb'),
                _hex = convert(hsl, 'hex'))=> ({
      h:  hsl[0], s:  hsl[1], l:  hsl[2],
      r: _rgb[0], g: _rgb[1], b: _rgb[2],
      hex: _hex
   })
)());

