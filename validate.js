import { funcs } from './funcs.js'

export const Vald = funcs.makeLazy({    
   // builds a custom number value validator from the provided input parmeters
   // default behavior is 'less than', but can be changed by providing a tuple
   // instead of a number, where the 1st value is the number and the 2nd value 
   // is the string form of the desired sign
   // i.e  'less than or equal to 360'  -->  [ 360, '<=' ]
   //      just using 360 alone would be equivalent to 'less than 360'
   get _build_num_validator() {
      return (...args)=> {    

         if (Array.isArray(args[0]) && args[0].length === 3) {
            const aset = args.map(
               argset=> this._build_num_validator(...argset)
            );
            return (val)=> aset.map( f=> f(val) ).includes(true) 
         }   

         const type = (typeof args.at(-1) === 'string') ?
              args.pop()
            : 'decimal';
 
         const [ min, max ] = args.map(
            n => isNaN(parseFloat(n))?parseFloat(n):n
         );

         const compare = {
            '>':  v=>v>_vald.min,
            '>=': v=>v>=_vald.min,
            '<':  v=>v<_vald.max,
            '<=': v=>v<=_vald.max
         }

         const _vald = {
            minComp: compare[ Array.isArray(min) ? min[1] : '>=' ],
            maxComp: compare[ Array.isArray(max) ? max[1] : '<=' ],

            // the actual function that determines if the number 'val' is 
            // in the specified range
            bounds: (val)=> _vald.minComp(val) && _vald.maxComp(val),
            ...((!!min.bind) ?
                 { get min() { return min.call(this) } }
               : { min: Array.isArray(min) ? min[0] : min }),
            ...((!!max.bind) ?
               { get max() { return max.call(this) } }
               : { max: Array.isArray(max) ? max[0] : max }), 
         }    

         return (type ?? 'decimal').includes('int') ?
              (v, val = parseFloat(v))=>
                 Number.isInteger(val) && _vald.bounds(val)
            : (v, val = parseFloat(v))=>
                  Number.isFinite(val) && _vald.bounds(val) 
      }
   },


   // builds a custom string value validator based on the options indicated
   // in the parameter list below
   get _build_str_validator() {

      return ({ charsAllowed, charsNotAllowed, minLength, maxLength,
                cantInclude,  mustInclude,     test,      allOrAny='all' })=> { 

         const conditions = [
            (s=> typeof s === 'string'),
            (minLength !== undefined ?
                 (s=> s?.length >= minLength)
               : (s=> s?.length>0)),
            (maxLength ?
                 (s=> s?.length <= maxLength)
               : (s=> true))
         ];

         if (typeof charsAllowed === 'string' && charsAllowed?.length) {
            conditions.push(((r1 = RegExp('[^'+ charsAllowed +']','g'))=>
               (s)=>!r1.test(s))()
            )
         }
         if (typeof charsNotAllowed === 'string' && charsNotAllowed?.length) {
            conditions.push(((r2 = RegExp('[' + charsNotAllowed +']','g'))=>
               (s)=>!r2.test(s))()
            ) 
         }
         if (typeof cantInclude === 'string' || Array.isArray(cantInclude)) {
            conditions.push(
               s=> !([].concat(notAllowed).map(
                  z=> s.indexOf(z) === -1
               )).includes(true)
            ) 
         }
         if (typeof mustInclude === 'string' || Array.isArray(mustInclude)) {
            conditions.push(
               s=> !([].concat(mustInclude).map(
                  substr=> s.includes(substr)
               ).includes(false))
            ) 
         }
         if (test instanceof RegExp) {
            conditions.push(s=> test.test(s)) 
         }
         else if (typeof test === 'function') {
            conditions.push(test)
         }

         if (allOrAny === 'all') {
            return (str)=> !(conditions.map(c => c(str)).includes(false)) 
         }
         else {
            return (str)=> conditions.map(c => c(str)).includes(true) 
         }
      }
   },  

   // here we define a number of oft-needed validators for common use cases
   get _0_to_100() {
      return this._build_num_validator( 0, 100 )
   }, 
   get _0_to_255() {
      return this._build_num_validator( 0, 255 )
   }, 
   get _0_to_1() {
      return this._build_num_validator( 0, [1,  '<=']  )
   },
   get hue() {
      return this._build_num_validator( 0, [360, '<=' ] )
   },
   get hex() {
      return this._build_str_validator({
         test: /^#?([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/ ,
         minLength: 3,
         maxLength: 7
      })
   },  
   get string() {
      return this._build_str_validator({ minLength: 1 })
   }, 
   get boolean() {
      return function(val) {
         return val === true || val === false
      }
   },
   get month() {
      return this._build_num_validator( 1, 12, 'integer' )
   },
   get day() {
      return this._build_num_validator( 1, 31, 'integer' )
   },
   get year() {
      return this._build_num_validator(
         [ 1900, 3000, 'integer'],
         [ 1,    99,   'integer']
      )
   },
   get hours() {
      return this._build_num_validator( 0, 24 )
   },
   get seconds() {
      return this._build_num_validator( 0, 60 )
   },
   get number() {
      return this._build_num_validator( 0, 99999999999999 )
   },
   get percentage() {
      return this._0_to_100
   }, 
   get rgb() {
      return this._0_to_255
   },
   get opacity() {
      return this._0_to_1 
   },
   get name() {
      return this._build_str_validator({
         minLength: 1,
         charsAllowed: 'a-zA-Z0-9_$:\-',
         test(str) { 
            return   !!str
                  && (/[a-zA-Z]/).test(str[0])
                  && !!(str.replace(/[^a-zA-Z]/g,'').length)
         }
      })
   },
   get nameStrict(){
      return this._build_str_validator({
         minLength: 2,
         charsAllowed: 'a-zA-Z0-9$_',
         test(str) {    
            return   !!str
                  && (/[a-zA-Z]/).test(str[0])
                  && !!(str.replace(/[^a-zA-Z]/g,'').length)
         }
      })
   }, 
})