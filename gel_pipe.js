

const directPipe = prop => (x=>`${prop}:${x};`)


const roundPipe = (x=>Math.round(parseFloat(x)))


function defineSelector(el) { 
   if (!(el.id) && el.classList.length === 0)  
      el.id = 'id_'+(Date.now().toString().slice(-4))+(Math.floor(Math.random()*100))  
   Object.defineProperty(el, 'hostSelector', {
      configurable: true,
      enumerable: true, 
      value: el.localName + (el.id ?
         `#${el.id}` : (el.getAttribute('class') ?
            ('.'+el.getAttribute('class').split(' ').join('.'))
         : ''))
   }); 
   return el
}


export function initStylePipe(init) { 

   let [propName, def] = init; 
   
   if (Array.isArray(def)) {
      def = {
         select: typeof def[0] === 'string' ? def[0] : '',
         pipe: typeof def[1] === 'string' ? directPipe(def[1]) : def[1],
         ...(def[2] && typeof def[2] === 'object' ? def[2] : {})
      }
   }  
   def['name'] = propName;
   def['argPipe'] = (x=>x) 
   if (propName === 'translate' || propName === 'size' || propName === 'rotation')  
      def.argPipe = roundPipe
   else if (def.pipe && typeof def.pipe === 'function') {
      const test = def.pipe(1)
      if (test.includes('px') || test.includes('em') || test.includes('deg'))
         def.argPipe = roundPipe
   } else if (def.prop && typeof def.prop === 'string') {
      const _prop = def.prop.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')
      if (_prop.includes('width') || _prop.includes('height')) {
         def.argPipe = roundPipe
      }
   }  
   if (!def.pipe && def.prop) { 
      def['pipe'] = directPipe(def.prop)
   } 
   if (def.host && typeof def.host === 'string')
      def.host = this.shadowRoot.querySelector(def.host)
   def['also'] = def.also ?? [] 

   _initStylePipe.call(this, def)  
}









 
function _initStylePipe(def) {   
 
   if (def.name && !(this.sheets.has(def.name)))  
      this.sheets.add(def.name, '', true) ;  
   const targetSheet = this.sheets.get(def.name),
         self = def.host ?? this;  
   let extrasAreChildren = true;

    if (self.hostSelector == null) { 
      extrasAreChildren = false;
      defineSelector(self); 
    }  
  
   Object.defineProperty(self.style, def.name, { 
      configurable: true,
      enumerable: true,
      get: function() {
         return self.style[`_g_${def.name}`]
      }, 
      set: function(newVal) {         
         const vald = self.style[`_g_${def.name}`]?.toString();  
         newVal = Array.isArray(newVal) ? newVal.map(def.argPipe) : def.argPipe(newVal); 
         if (vald === undefined || (vald !== undefined && vald !== newVal.toString())) {  
            self.style[`_g_${def.name}`] = newVal;      
            targetSheet.update_async([
               self.hostSelector +' '+ (def.select ?? '')+` {\n`+ '    '+def.pipe(newVal) + `\n}`]
               .concat( def.also.map( entry =>
                  !(entry[0] == null || entry[1] == null) ? (extrasAreChildren ? self.hostSelector : '')+' '+ entry[0] +` {\n`+ '    '+ entry[1](newVal, def.pipe) + `\n}` : '')
               ).join('\n'),()=>{});    
         }
      }
   }) 
}    

 


 