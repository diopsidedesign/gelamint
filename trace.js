import { funcs }  from './funcs.js'
import { XY }     from './xy.js' 

export const trace = (function(){

   // stores info from last pointerup event so we can compare
   // with newest and see if a double click event is warranted
   let lastPtrUp = null

   // aka 'budge threshold' i.e how many pixels can you move the mouse
   // before the function will actually start to respond with changes
   // this sets the default value, any value can be set at call time using
   // the corresponding eventOptions property
   const POINTER_TRACK_THRESHOLD = 6

   // maximum number of milliseconds between two successive pointerup events
   // for that sequence of pointerups to be interpreted as a double click
   const DBL_CLICK_MS = 278

   return function(event, options) {    
    
      if (event.pointerType === 'mouse' && event.button === 2) 
         return false   // ignore right click

      const opts = options.eventOptions ?? {}

      // composedPath can ID event targets across shadow boundaries
      const target = event.composedPath ? event.composedPath()[0] : event.target
    
      const budgeAmt = options.budgeThreshold ?? POINTER_TRACK_THRESHOLD

      // interrupts - 
      // achieved by setting two properties on the event options object
      // 'interruptWhen' - function that returns a boolean indicating whether
      //                    the pointer tracking should be interruped
      // 'onInterrupt' - if interruptWhen is set and evaluates to true, this
      //                 function is called 
      // this enables functionality such as - doing a certain thing after
      // something has been dragged X number of pixels. Interrupts could 
      // also be totally unrelated to event input
      //                                          default fallback value   
      const interrupt = options.interruptWhen ?? (()=>false)
      
      // if click origin isnt provided, deduce it from the triggering event
      let origin = options.origin ?? XY(event)
      
      // shouldnt need this - evaluate whether to remove  
      if (  options.origin !== undefined
         && !(Object.getOwnPropertyNames(options.origin).includes('distTo'))) {
         origin = XY(origin)  
      }

      let budged = false

      let lastPos = {
         x: event.x,
         y: event.y
      }
      
      // here we call stopPropagation and preventDefault on the originating event,
      // unless the user has explicitly indicated in the eventOptions object
      // 'pointerdown' property that we should not do so
      if (opts.pointerdown?.stopPropagation !== false && event.cancelable) {
         try { event.stopPropagation() }
         catch(err) { console.warn(err) }
      }
      if (opts.pointerdown?.preventDefault  !== false && event.cancelable) {
         try { event.preventDefault() }
         catch(err) { console.warn(err) }
      } 

      // should we capture non mouse events too? evaluate
      if (event.pointerType === 'mouse') { 
         target.setPointerCapture(event.pointerId) 
      }       

      // called rapidly (with each browser repaint frame)
      // as the pointer is moved/tracks
      const rafThrottledTrack = funcs.rafThrottle((e) => { 
         // if we've exceeded the minimum movement threshold
         if (options.simple === true || budged === true) { 

            // if there's no interrupt or if there is an interrupt,
            // but its condition isnt satisfied
            if (   options.simple === true
               || (options.simple !== true && !(interrupt(e) === true))) {

               // if custom track function was provided run it,
               // feeding in event parameters as args
               if (options.track !== undefined) {
                  options.track(e, { lastPos, origin })
               }
            }
            // call the provided interrupt function, as the 'interruptWhen'
            // condition has been satisfied
            else {
               options.onInterrupt(e)
            }
         }
         else if (budged !== true && origin.distTo(lastPos) > budgeAmt) {
            // this is run once, as soon as the budge threshold amount is exceeded
            ;[ budged, lastPtrUp ] = [ true, null ]; 
         }  
      }) 

      // we want to capture position in as many frames as possible,
      // so we leave that part out of the rafThrottled tracking function
      // always getting the most recent mouse movements
      const track =  e => {  
         if (opts.pointermove?.preventDefault !== false) {
            e.preventDefault()  
         }
         lastPos.x = e.x 
         lastPos.y = e.y 
         rafThrottledTrack(e);
      }  

      const release = (e) => {      
         // if right time between pointerups for a double click
         // , emit the event and reset timer
         if (  lastPtrUp > 0
            && (e.timeStamp - lastPtrUp) < DBL_CLICK_MS
            && budged !== true) {
            target.dispatchEvent(new Event('double-click', {
               composed: false,
               bubbles: false
            })) 
            lastPtrUp = null   
         }
         else {
            lastPtrUp = e.timeStamp
         }  
         ;['pointerup', 'contextmenu'].forEach(
            type => target.removeEventListener(type, release)
         )    
         target.removeEventListener('pointermove', track )   
         if (options.release)
            options.release(e)  // call custom user release function if provided
      }     
      // if lastPtrUp already is defined and not null, keep it at its current
      // value, but if is undefined, explicitly define it as null
      lastPtrUp = !!lastPtrUp ? lastPtrUp : null
      
      // call custom user start function if provided
      if (options.start)
         options.start(event) 
     
      ;['pointerup', 'contextmenu'].forEach(
         type => target.addEventListener(type, release)
      )  
      target.addEventListener('pointermove', track) 
   }  
})()
