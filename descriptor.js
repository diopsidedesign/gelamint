import * as REF from './ref.js'

export const Descriptor = (function(){
  
   const elCache = new function(dwellTime = 100000) { 
      const map = new Map();
      const timers = new Map();
      return ({
         set(key, value) {
            if (timers.has(key)) {
               clearTimeout(timers.get(key))
            }
            timers.set(key, setTimeout(()=> map.delete(key) , dwellTime))
            return map.set(key, value)
         },
         has: (key)=> map.has(key),
         get: (key)=> map.get(key)
      }) 
   }

   // properly resolves the value of a getter accessor property
   // referenced by a property metadata object
   function evaluate(desc) {  
      if (!!desc.get?.bind) {
         return Reflect.get(desc.propertyOwner, desc.propertyKey)  
      }
      if (!!desc.value?.bind) {
         try {
            return desc.value.call(desc.propertyOwner)
         }
         catch(_) {
            try {
               return new desc.value()
            }
            catch(__) {
               try {
                  return Reflect.get(desc, 'value')()
               }
               catch(___) {
                  return Reflect.get(desc, 'value')
               }
            }
         }
      }
      return Reflect.get(desc.propertyOwner, desc.propertyKey) 
   }

   // this function determines whether the owner of the property in question
   // is a native html element, if so, it configures a getter for the property
   // that will work even outside the context of an instance of that element 
   // otherwise it just configures a standard getter that reads the property

   // So we can probe the prototypes of html elements fully without worrying
   // about creating instances of each one
   function defineEvaluator(desc) {  
    
      const obj = desc.propertyOwner

      // boolean indicating whether the host object is some sort of HTMLElement
      const nativeEl = obj ?
           obj.toString().includes('lement')
         : false;

      return Object.defineProperty(

         nativeEl ? Object.defineProperty(desc, 'relatedHtmlTag', {
            // if owner of the property is a native element,
            // add the 'relatedHtmlTag' property to the descriptor object with 
            // a value equal to the localname / tag-name of the associated html 
            // element
            value: REF.HTMLTAGS.constructorToHtmlTagName(obj,desc)
         }) : desc, // otherwise use the descriptor object as-is

         // name of the property that stores the result of the evaluator
         'evaluated', { 

         get: nativeEl ?
            // use this getter function when owner is an HTML element with a
            // native prototype
            function() {  
               if (!(elCache.has(desc.relatedHtmlTag))) {
                  elCache.set(
                     desc.relatedHtmlTag,
                     document.createElement(desc.relatedHtmlTag)
                  )
               }
               return Reflect.get(
                  elCache.get(desc.relatedHtmlTag),
                  desc.propertyKey
               )
            } : 
            // otherwise use this getter which utilizes our evaluate function 
            function() {   
               return evaluate(desc, desc.propertyKey)
            },
            enumerable: true
         }
      )
   }

   // Main constructor function for creating Descriptor objects 
   return function(obj, prop) {  

      const desc = 
         // does the object instance itself own the property?
         Object.getOwnPropertyDescriptor(obj, prop) 

         // does the object's prototype own the property? (i.e class properties)
          ?? Object.getOwnPropertyDescriptor(obj.constructor.prototype, prop) 
         
         // does the object's constructor own the property? (static property)
          ?? Object.getOwnPropertyDescriptor(obj.constructor, prop);

      return desc ?
         // if the property and owner was property identified, create and return 
         // a descriptor object with the 'evaluated' accessor property defined 
         defineEvaluator( Object.assign( desc, {
            propertyKey: prop, 
            propertyOwner: obj.constructor?.name === 'Object' ? obj
            : [ obj, obj.constructor, obj.constructor.prototype ]
               .filter( ref=> !!ref)
               .find(   ref=> Object.getOwnPropertyNames(ref).concat(
                           Object.getOwnPropertySymbols(ref)
                        ).includes(prop)), 
            propertyType:  !!(desc.get?.bind) ? 'accessor':'data',
            isNative: (/\{\s*\[native code\]\s*\}/).test(
               !!(desc.get?.bind) ? desc.get : desc.value
            ) 
         }))
      :
      {} // if the owner of the property or property itself cant be identified,
         // return a blank object (this is preferable because usage of Descriptor
         // is never critical and its almost always used for testing / debugging)
   }  
})()