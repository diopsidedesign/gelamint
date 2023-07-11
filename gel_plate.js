import { el } from './gel_el.js'

export function plate(tmplStr, elOpts) {
   return el('template', { contents: tmplStr, ...elOpts })
}

export function Plates(defaultEl, props, initContent, keyProp = 'name') {  
   return new plate(
      [].concat(initContent ?? []).map(c => {
         const clone = c?.cloneNode(true);
         c?.remove();
         return clone
      }), {
         ...props, 
         
         props: {
             get size() {
               return this.content.querySelectorAll('template')?.length
            },
         },

         methods: { 
            get(name)    {
               return this.content.querySelector(`template[${keyProp}="${name}"]`)
            }, 
            exists(name) {
               return this.get(name) != null
            },    
            getContents(name) {
               return this.getOrig(name).content
            },
            replace(name, newval) {
               const old = this.get(name)
               this.content.insertBefore(newval, old)
               old.remove();
            },
            remove( key) {
               return this.get(name)?.remove()
            }, 
            forEachTemplate(host,prop,val,result) { 
               this.searchTemplate(host, prop, val)?.forEach(result)
            }, 
            searchTemplate(host, prop, val) {   

               if (!(host instanceof HTMLTemplateElement))
                  host = this.get(host); 
               if (host && host.content)
                  return this.filterBySelector(host, val==null ? prop : `${defaultEl}[${prop}="${val}"]` )  
            },
            filterBySelector(host,filterFunc) {
              return Array.from( host.content.querySelectorAll( filterFunc )) ?? null
            },
            add(content, attrs) {
               this.content.appendChild(content instanceof HTMLTemplateElement ? content : plate(content, attrs))
            } 
         }
      })  
}