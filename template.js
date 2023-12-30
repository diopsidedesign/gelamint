import { funcs } from './funcs.js'

export { GelPlate, GelPlates }

class GelPlate {
  
   #tmpl = document.createElement('template')

   get tmpl() {
      return this.#tmpl
   }

   get setAttribute() {
      return this.tmpl.setAttribute
   }

   get getAttribute() {
      return this.tmpl.getAttribute
   }

   get hasAttribute() {
      return this.tmpl.hasAttribute
   }

   get removeAttribute() {
      return this.tmpl.removeAttribute
   }

   get content() {
      return this.tmpl.content
   }

   get copy() {
      return this.tmpl.content.cloneNode(true)
   }

   get innerHTML() {
      return this.tmpl.content.innerHTML
   }

   set innerHTML(content) {
      if (!content.length) {
         return;
      }
      this.#tmpl.innerHTML = content 
   }  

   constructor(init, options) { 

      if (init && !(typeof init === 'function')) {
         let str = init
         init = ()=> str 
      } 

      this.generate  = (...args)=> init(...args) 

      this.innerHTML = init ?
           this.generate()
         : '';

      if (options?.constructor?.name === 'Object') {
         writeAttrs.call(this, options)
      }
   }
} 

// a template element that itself manages a collection of templates
class GelPlates extends GelPlate {

   static templify(contents, opts) {
      return funcs.templify(contents, opts)
   }

   constructor(initContent=null, keyProp='name') {
      super()  
      this.keyProp = keyProp  
      if (initContent instanceof Element && initContent.localName === 'slot') {
         this.absorbSlot(initContent)
      }
      else if (initContent) {
         funcs.insertContent.call(this, initContent)   
      }
   } 

   get list() {
      return Array.from(this.content.querySelectorAll('template') ?? [])
   } 

   get size() {
      return this.content.querySelectorAll('template')?.length ?? 0
   }

   find(callback) {
      return this.list.find(callback)
   }

   filter(callback) {
      return this.list.filter(callback)
   }

   map(callback) {
      return this.list.map(callback)
   } 

   has(key) {
      return this.get(key) != null
   }  

   get(key) {
      return this.content.querySelector(`template[${this.keyProp}="${key}"]`)
   } 

   add(content) {
      this.content.appendChild(GelPlates.templify(content))
   } 

   remove(key) {
      this.get(key)?.remove()
   }

   // this method takes all of the template elements assigned to a particular 
   // slot, and clones them over into our GelPlates instance, removing the 
   // original template elements in the transcluded light DOM

   // This provides a way for components to select from a number of different
   // templates provided by the user via slotting template element markup
   absorbSlot(slotEl) {
      slotEl.assignedElements().forEach(el=> {
         if (el.localName === 'template') {
            this.add(el.cloneNode(true))
         }
         el.remove()
      })
   } 
 
   // replace a template entry that matches string key
   // with a new entry 'newval'
   replace(key, newval) {
      const old = this.get(key)
      this.content.insertBefore(newval, old)
      requestAnimationFrame(()=> old.remove());
   }

   // search the indicated template for a template w/ attr 'attr' of value 'val'
   search(hostTmpl, attr, val) {    
      if (!(hostTmpl instanceof HTMLTemplateElement)) {
         hostTmpl = this.get(hostTmpl); 
      }
      if (!hostTmpl) {
         return null
      }
      return Array.from(
         hostTmpl.content.querySelectorAll(`[${attr}="${val}"]`)
      )
   }
}
