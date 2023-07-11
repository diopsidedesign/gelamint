import Coord from '../../node_modules/coordlet/coordlet.js'
import { CONF } from './gel_conf.js'  



const clicks = new WeakMap()





export function track(options) {   

   if (  options.event.pointerType === 'mouse'
      && options.event.button      === 2) 
      return false   

   const cancelTypes = ['pointerup', 'contextmenu'], 
         muteEvent   = e => { e.preventDefault(); e.stopPropagation(); },
         event       = options.event,
         target      = event.srcElement,
         interrupt   = options.interruptWhen ?? (()=>false),
         unmuzzle    = e => { 
            clickState.timer = null;
            target.removeEventListener('dblclick', muteEvent);/* console.log('unmuzzled');*/
         };
   
   event.preventDefault(); 

   target.setPointerCapture(event.pointerId);   

   let clickState = clicks.get(target);
 

   const _trackFunc =  e => { 
      e.preventDefault();
      if (clickState?.budged === true) { 
         if (!(interrupt(e) === true))  {
            if (options.track)
               options.track(e); 
         }
         else options.onInterrupt(e)  
      } else if ( !clickState?.budged
         && Coord(e).distanceTo(Coord(clickState?.origin)) > CONF.POINTER_TRACK_THRESHOLD) {
         clickState.budged = true;
         clickState.lastPointerUp = 0; 
      } 
   } 

   const _releaseFunc = (e) => {   
      e.preventDefault();
      e.stopPropagation();
      if (  clickState?.lastPointerUp != 0
         && (e.timeStamp - clickState?.lastPointerUp) < CONF.DBL_CLICK_MS
         && clickState.budged !== true) {
            target.dispatchEvent(new Event('double-click', { bubbles: false, composed: false })); 
            clickState.lastPointerUp = 0;   
      } else  {
         clickState['lastPointerUp'] = e.timeStamp;  
      }
      clearTimeout(clickState.timer);
      clickState.timer = setTimeout( () => unmuzzle() , CONF.DBL_CLICK_MS + 10);
      target.removeEventListener('pointermove', _trackFunc );  
      cancelTypes.forEach(type => target.removeEventListener(type, _releaseFunc));    
      if (options.release)
         options.release(e); 
   }   

   clicks.set(target, { 
      timer: clickState?.timer ?? null,   
      lastPointerUp: clickState?.lastPointerUp ?? null,
      origin: Coord(event), 
      budged: false, 
   }) 

   clickState = clicks.get(target);

   if (clickState?.timer == null)  
      target.addEventListener('dblclick', muteEvent );  

   if (options.start)
      options.start(event);   

   cancelTypes.forEach(type => target.addEventListener(type, _releaseFunc   ));
 
   target.addEventListener('pointermove',  _trackFunc ); 
} 