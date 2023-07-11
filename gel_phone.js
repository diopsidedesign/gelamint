import { filterPropsFromObj } from './gel_util.js'

export const gelephone = new function(){

   const subscriptions = new WeakMap()

   this.unsubscribe = (publisher) => subscriptions.get(publisher).unsub() 

   this.register = (publisher, getProps, callback, disconnect) => {
      if (!subscriptions.has(publisher)) {
         subscriptions.set( publisher, {
            unsub: () => {
               let z = subscriptions.get(publisher)
               delete z.customers 
               publisher.unsubscribe(z.subFunc)
            },
            customers: [],
            subFunc: update => {
               let z = subscriptions.get(publisher)
               z.customers.forEach( custFunc => custFunc(update) )
            }
         })    
         publisher.subscribe(subscriptions.get(publisher).subFunc)
      }  
      const fresh = (update) => { 
         const tailorMadeUpdate = filterPropsFromObj( update,
            typeof getProps === 'function' ? getProps : entry => getProps.includes(entry[0]) )
         if (Object.keys(tailorMadeUpdate).length > 0) {
            callback(tailorMadeUpdate);
         }
      }
      subscriptions.get(publisher).customers.push(fresh);
      return function() {
         const z = subscriptions.get(publisher)
         z.customers = z.customers.filter(item => item != callback)
      }
   }
}