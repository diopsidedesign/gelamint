import { adorn } from './gel_el.js'




export class BoundTextInput {    
 
   constructor(elem, opts, wait) {    
      
      this._value = this._valueBeforeFocused = opts.init ?? ''; 

      this.text = (elem.localName === 'input' ) ?
                     elem : elem.querySelector('input[type=text]'); 
         
      this.callback      = opts.newValCallback ?? ((val) => { console.log(val) }); 
      this.validator     = opts.validate       ?? ((val) => val.length ? val : false)  
      this.isDifferent   = opts.detectChgFunc  ?? ((val) => val !== this.value);
      this.text.addEventListener('focus', () => {  
         this._valueBeforeFocused = this.text.value    
         this.text.removeAttribute('reset')
      }); 

      this.onTextInput = this._onTextInput.bind(this);
      ['keydown','blur'].forEach( etype => this.text.addEventListener(etype, this.onTextInput)); 

      if (wait !== true) {
         this.value = this._value; 
         this.respond = true; 
      } 
   }

   _onTextInput(event) {     
      if ((event.type === 'keydown' && event.key === 'Enter') ||
          (event.type !== 'keydown')) {  
         const val = this.validator(this.text.value);   
         if (this.isDifferent(val)) { 
            if (val !== false) {   
               this.respond = true
               this.value = val  
            } else {    
               this.text.setAttribute('reset','') 
               this._value = this.text.value = this._valueBeforeFocused
               this._valueBeforeFocused = ''
            } 
         }  
      }
   }
   get value()    { return this._value } 
   set value(val) {
      this._value = this.text.value = val;
      this.finalizeUpdate(val)
   } 
   finalizeUpdate(val) {
      if (this.respond) {      
         this.callback(val)   
      } 
      this._valueBeforeFocused = '' 
      this.respond = true 
   }
} 



export class BoundTextAndSliderInput extends BoundTextInput {    
 
   constructor(elem, opts) {  
      super(elem, opts, true); 
   
      this.slider = elem.querySelector('input[type=range]'); 
      this.relatedInputs = opts.relatedInputs  ?? null 
      this.groupId = opts.groupId ?? null 
      Object.entries({
         focus: () => { this.relatedInputs.vals = [] },
         blur:  () => document.addEventListener('pointerup',
                  () => { this.relatedInputs.vals = [] }, { once: true }),
         input: () => { 
            if (this.relatedInputs !== undefined && this.relatedInputs.vals.length < 2) { 
               this.relatedInputs.vals = this.relatedInputs.fetch(); 
            } 
            this.value = parseFloat(this.slider.value) 
         }
      }).forEach( event => {
         if (this.relatedInputs !== null || event[0] === 'input') {
            this.slider.addEventListener(...event)
         }
      }) 
      this.value = this._value; 
      this.respond = true; 
   }
 
   get value() { return this._value } 
   set value(val) {  
      this._value = val;
      const rounded = Math.round(val); 
      this.slider.value= val;
      this.text.value = rounded;
      this.finalizeUpdate(val) 
   }
} 




export function BoundTextInput2(el, opts, wait) {      

   const commit = (val) => {
      el.value = val;
      if (el.respond && val.length > 0)       
         el.callback(val)    
      el._valueBeforeFocused = '' 
      el.respond = true 
   }

   const reset = () => {
      el.setAttribute('reset','')  
      commit(this._valueBeforeFocused)
      el._valueBeforeFocused = ''
   }

   const _onTextInput = (event) => {      
      if ((event.type === 'keydown' && event.key === 'Enter') ||
          (event.type !== 'keydown')) {  
         const val = el.validator(el.value);   
         if (el.isDifferent(val)) { 
            if (val !== false) {   
               el.respond = true 
               commit(val)
            } else {    
               reset()
            } 
         }
         else if (val === false) { reset() } 
      }
   }
 
   return adorn(el, { 
      props: {
         _value:      opts.init           ?? '',
         validator:   opts.validate       ?? ((val) => val.length > 0 ? val : false),
         callback:    opts.newValCallback ?? (()=>{}),
         isDifferent: opts.detectChgFunc  ?? ((val) => val.length > 0 && val !== el.value ),
         _valueBeforeFocused: '',
      }, 
      listeners: { 
         focus() { 
            el._valueBeforeFocused = el.value    
            el.removeAttribute('reset') 
         },
         keydown: e => _onTextInput(e),
         blur:    e => _onTextInput(e)
      }, 
   })  
}  
