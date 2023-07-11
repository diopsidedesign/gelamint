








export function Behavior(host, defs, active = false) {

   this.active = active;

   const behaviors = Object.entries(defs)
      .filter( entry => entry[0] != 'callbacks')
      .map( entry => {
         this[entry[0]] = entry[1];
         return entry
      }); 

   this.callbacks = {
      enable: defs.callbacks.enable ? [].concat(defs.callbacks.enable) : [],
      disable: defs.callbacks.disable ? [].concat(defs.callbacks.disable) : []
   } 

   this.enable =  () => { this.active = true;  toggle() };
   this.disable = () => { this.active = false; toggle() };

   const toggle = () => {  
      const perform = this.active ? host.addEventListener : host.removeEventListener
      behaviors.forEach( behavior => perform.call(host, ...behavior));
      const eOrD = this.active === true ? 'enable' : 'disable';
      if (eOrD in this.callbacks && this.callbacks[eOrD].length)  
         [].concat(this.callbacks[eOrD]).forEach( callback => callback() )   
   } 
}








export function FuncBank() { 

   const funcs = {},
         has     = funcType   => (funcType in funcs),
         remove  = (type, func) => funcs[type] = funcs[type].filter( fn => fn != func );

   this.register = (funcType, func, opts) => {  
      if (funcs[funcType] === undefined) 
         funcs[funcType] = [];
      let _func = func
      if (opts && typeof opts === 'object' && opts.once === true) {
         _func = () => { func(); setTimeout( () => { remove(funcType, _func) } ) }
      }
      if (!funcs[funcType].includes(_func)) 
         funcs[funcType].push(_func); 
   }  

   this.perform = function( funcName ) { 
      if (has(funcName))  
         funcs[funcName].forEach( action => action(this) )  
   }   
}