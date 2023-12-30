
export const is = (function(){

   // 'Types' is a dict of definitions, referenced by the 'is' library below 
   // build from an object with empty prototype
   const Types = Object.assign( Object.create(null, { 
      // supporting methods for our type defs
      size: {
         get: function() {
            return Object.keys(this).length
         }
      }, 
      findBy: {
         value: function(p,v) {
            return Object.entries(this).find(
               ([,defObj])=> defObj[p]===v
            )?.at(1) ?? null
         }
      },
      validators: {
         get: function() {
            Object.entries(this).map(
               ([typename,{x,y,z,q,valdtr}])=> [typename, valdtr]
            )
         }
      },
      typeOf: {
         get: function() {
            return obj=> this.validators.find(
               ([ , val])=> val(obj) === true
            ).at(0)
         }
      },
      descriptions:{
         get: function() {
            return Object.entries(this).map(
               ([typeName, { name, abbrev, char, constr, valdtr}])=>
                  [ typeName, name, abbrev, char ]
            )
         }
      }
   }),
   // type definitions
   // should be in the form
   // [abbrev] :  {
   //     name: string, 
   //     abbrev: string,
   //     char: single character string,
   //     constr: reference,
   //     valdtr: function
   // }
   {  
      nul: {
         name:    'null',
         abbrev:  'nul',
         char:    '∅',
         constr:  null,
         valdtr:  _ => typeof _==='object' && !_
      }, 
      obj: {
         name:    'object',
         abbrev:  'obj',
         char:    'O',
         constr:  Object,
         valdtr:  _ => typeof _==='object' && _?.constructor?.name === 'Object'
      },
      num: {
         name:    'number',
         abbrev:  'num',
         char:    '№',
         constr:  Number,
         valdtr:  _ => typeof _==='number' && Number.isFinite(_)
      }, 
      int: {
         name:    'integer',
         abbrev:  'int',
         char:    'ℤ',
         constr:  Number,
         valdtr:  _ => Number.isInteger(_) && !(isNaN(_))
      },
      arr: {
         name:    'Array',
         abbrev:  'arr',
         char:    '₳',
         constr:  Array,
         valdtr:  _ => Array.isArray(_)
      },
      undf: {
         name:    'undefined',
         abbrev:  'undf',
         char:    '⁇',
         constr:  null,
         valdtr:  _ => typeof _ === 'undefined'
      }, 
      inf: {
         name:    'Infinity',
         abbrev:  'inf',
         char:    '∞',
         constr:  Object(Infinity),
         valdtr:  _ => _ === Infinity
      },
      bool: {
         name:    'boolean',
         abbrev:  'bool',
         char:    '◐',
         constr:  Boolean, 
         valdtr:  _ => typeof _ === 'boolean'
      }, 
      bigN: {
         name:    'bigint',
         abbrev:  'bigN',
         char:    'N',
         constr:  BigInt,
         valdtr:  _ => typeof _ === 'bigint'
      },
      str: {
         name:    'string',
         abbrev:  'str',
         char:    's',
         constr:  String,
         valdtr:  _ => typeof _ === 'string'
      },
      symb: {
         name:    'symbol',
         abbrev:  'symb',
         char:    '§',
         constr:  Symbol,
         valdtr:  _ => typeof _ === 'symbol'
      }, 
      func: {
         name:    'function',
         abbrev:  'func',
         char:    'ƒ',
         constr:  Function,
         valdtr:  _ => typeof _ === 'function'
      }, 
      rgx: {
         name:    'RegExp',
         abbrev:  'rgx',
         char:    'ℝ',
         constr:  RegExp,
         valdtr:  _ => _ instanceof RegExp  
      }, 
      evt: {
         name:    'Event',
         abbrev:  'evt',
         char:    'ℯ',
         constr:  Event,
         valdtr:  _ => _ instanceof Event 
      },
      err: {
         name:    'Error',
         abbrev:  'err',
         char:    '∃',
         constr:  Error,
         valdtr:  _ => _ instanceof Error
      },
      map: {
         name:    'Map',
         abbrev:  'map',
         char:    '∭',
         constr:  Map,
         valdtr:  _ => _ instanceof Map 
      }, 
      wmp: {
         name:    'WeakMap',
         abbrev:  'wmp',
         char:    '∰',
         constr:  WeakMap,
         valdtr:  _ => _ instanceof WeakMap
      },
      set: {
         name:    'Set',
         abbrev:  'set',
         char:    '∬',
         constr:  Set,
         valdtr:  _ => _ instanceof Set
      },
      wst: {
         name:    'WeakSet',
         abbrev:  'wst',
         char:    '∯',
         constr:  WeakSet,
         valdtr:  _ => _ instanceof WeakSet
      },
      prm: {
         name:    'Promise',
         abbrev:  'prm',
         char:    '⅌',
         constr:  Promise,
         valdtr:  _ => _ instanceof Promise
      },
      prx: {
         name:    'Proxy',
         abbrev:  'prx',
         char:    'ℙ',
         constr:  Proxy,
         valdtr:  _ => undefined
      },
      // need to determine a way to detect proxy objects
      wrf: {
         name:    'WeakRef',
         abbrev:  'wrf',
         char:    '⍵',
         constr:  WeakRef,
         valdtr:  _ => _ instanceof WeakRef
      }, 
      wrk: {
         name:    'Worker',
         abbrev:  'wrk',
         char:    '⚒',
         constr:  Worker,
         valdtr:  _ => _ instanceof Worker
      },
      dom: {
         name:    'DomNode',
         abbrev:  'dom',
         char:    'd',
         constr:  Node,
         valdtr:  _=> _ instanceof EventTarget || _ instanceof DocumentFragment
      },
      elem: {
         name:    'Element',
         abbrev:  'elem',
         char:    'ℰ',
         constr:  Element,
         valdtr:  _=> _.constructor?.name.includes('lement')
                     && _ instanceof Element
      } 
   } )

   // 'is' is the library containing the type checking methods

   //                          so we can start from empty prototype object
   return Object.assign(Object.create(null, Object.getOwnPropertyDescriptors({

      // internal method used by 'argsLike' to check the type
      // of an invidual list item
      checkArgType(val, tStr) {
         if (['*','?'].includes(tStr)) {
            return true  
         }
         if (tStr.indexOf('|') > 0) {
            return tStr.replace(' ','').split('|').map(
                  (typ) => typ in Types && is[typ](val)
               ).includes(true) 
         }
         else {
            return is[tStr](val) 
         }
      },  

      // this is the method used to check the type shape of a list of arguments
      // can be partially applied to build a quick shortcut validator for a given
      // object or function.
      // args - the list of values/objects to check type of
      // argTypes - an array/list of string type abbreviations
      argsLike(args, argTypes) { 
         if (argTypes === undefined && is.arr(args)) {
            return (args)=> is.argsLike(args, argTypes)  
         }
         if (is.num(argTypes)) {
            return argTypes === args.length
         }
         if (!(is.arr(args))) {
            args = [args].flat()   
         }
         if (!(is.arr(argTypes))) {
            argTypes = is.str(argTypes) && argTypes.indexOf(',') > 0 ?
                 argTypes.replace(/\s/g,'').split(',')
               : Array(args.length).fill().map(()=> argTypes);
         }

         return ( args.length >= ( argTypes.length - (
                     (arr, n)=> {
                        while (arr.pop()=='?')
                           n++;
                        return n
                     })([...argTypes], 0)
                  )
                    && args.length <= argTypes.length
               ) && !(
                  args.map((val, i)=>
                     is.checkArgType(val, argTypes[i])
                  ).includes(false)
               ) 
      }, 

      // alias property for registerNewValidator method
      get addNew() {
         return this.registerNewValidator
      },

      // alias property for Types.typeOf method
      get typeOf() {
         return Types.typeOf
      },

      // add a new type validator named 'type' with validator func 'func'
      // to the is object
      registerNewValidator(type, func) {
         if (!(type in is)) {
            Object.defineProperty(is, type, {
               value:      func,
               enumerable: true
            })
         }
      },  

      // searches all the string fields of each type definition
      // for a property equal to keyOrObj
      hasType(keyOrObj) {
         return this.descriptions.filter(
               (strProps)=> strProps.includes(keyOrObj)
            ).length > 0 
      },  
      
      // method that determines type of items of array
      // ex. is.arrOf.str(arr)  - true if arr is array containing only strings
      //     is.arrOf.arr(arr)  - true if arr is array containing only arrays
      arrOf: new Proxy({}, {
         get(_, typ) { 
            if (!is.arr(_)) {
               return (()=> false)
            }
            return (typ in is) ?
                 ((arr)=> !(arr.map(val=> is[typ](val))).includes(false))
               : undefined 
         }
      }), 

      // Checks the type of 'value' to see if it matches any of the types
      // indicated by one or more string type abbreviations in '...types'
      like(value, ...types) { 
         for (const tStr of types) {
            if (this.checkArgType(value, tStr)) {
               return true
            }
         }
         return false
      },
      
      // takes a function as input and returns a version of the function that
      // validates the arguments passed to it using the 'argsLike' function above
      //
      validateArgs(argTypes) {
         return (func)=> function(...args) {
            if ( is.arr(argTypes) &&
               !(is.arr(argTypes[0]) || is.str(argTypes[0]))) {
               argTypes = [ argTypes ] 
            }
            const tests = argTypes.map((typeSet)=> is.argsLike(args, typeSet))
            if (!(tests.includes(true))) {
               return console.error('Arguments ', args,' failed validation')
            }
            return func.apply(this, args)
         }
      }
      })),

      // here we finally combine the Types properties above into the is object
      // so that type methods and definitions are ultimately all contained in
      // the same 'is' object
      Object.entries(Types)
         .concat(([
               ['htmlTag' ,   (s)=> REF.HTMLTAGS.has(s)  ],
               ['svgTag' ,    (s)=> REF.SVGTAGS.has(s)  ],
               ['eventName' , (s)=> REF.DOMEVENTNAMES.has(s)  ],
               ['entries' ,   (s)=> is.arr(s) && !(
                  s.map((item)=> is.arr(item)).includes(false))
               ]
            ]).map(entry=> [ entry[0], { valdtr: entry[1] } ])

      ).reduce((acc, [abbrev, defObj])=> ({
         ...acc, 
         [abbrev] : defObj.valdtr
      }) ,{})
   )

})()


 

