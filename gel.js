// gelamint 0.1.2
import { mint, _fetch, sharedSheets } from './gel_mint.js'
import { el, adorn }     from './gel_el.js' 
import { Plates, plate } from './gel_plate.js'
import { track }         from './gel_track.js'
import { Behavior }      from './gel_act.js'
import { mimic, debounce, throttle, Courier } from './gel_util.js'


mint('gel-logo', {
   styles: ` 
      :host                    { display: block }
      svg path.Gel-Logo-Left   { fill: var(--gel-ui-accent-light); }
      svg path.Gel-Logo-Top    { fill: var(--gel-ui-accent-dark); }
      svg path.Gel-Logo-Bottom { fill: var(--gel-ui-foreground); }
      `,
   template: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"> 
         <circle class="Gel-Logo-Bg" cx="32" cy="32" r="28" fill-opacity="0"/>
         <path class = "Gel-Logo-Left" 
            d="M25 32c-10.7 12.7-8.4 24.6-.7 27l4.2.8S28 61 25 61c-7 0-22.7-8.5-23-28v-2c1.5-32 36.6-15.1 23 1Z"/>
         <path class = "Gel-Logo-Top"
            d="M35.6 25.9C31.2 13.5 24.3 9.8 18 9.8c-4 0-6.8 3.4-6.8 3.4S11 8 21 4a30 30 0 0 1 26 2c27.7 16-4.2 39.8-11.4 19.9Z"/>
         <path class = "Gel-Logo-Bottom"
            d="M35.3 38.5c16.4 2.9 25.6-5 24-13a29 29 0 0 0-.9-2.8c1 .2 3.4 2.8 3.6 8.3.3 10.8-5.3 21-14 26.5-26.6 16.6-33.5-22.8-12.7-19Z"/>
      </svg>`
});
 
export default ({
   mint,
   el,
   adorn,
   plate,
   track,
   debounce,
   throttle,
   Plates,
   Behavior,
   Courier,
   sharedSheets,
   fetch: _fetch
})
 