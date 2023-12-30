import { Gel } from "./gel.js"

Gel.mint('gel-text', {

   styles: `
      :host {    
         max-height:        50px;
         position:      relative;
         width:             100%;
         user-select:       none;
         display:           flex; 
         flex-flow:       column; 
         justify-content: center; 
         text-align:      center;
         transition: opacity 100ms ease-in;
         fill: var(--gel-ui-text-color); 
      }  
      div.hidden, svg, svg text { 
         font-family:   var(--gel-font-mono)!important;
         font-size:     100px!important;
      } 
      div.hidden {  
         width: min-content;
         top:       -10000%;
         left:      -10000%;
         position: absolute;
         opacity:         0;
      }  
      svg { 
         padding:         2px;
         fill:        inherit;
         width:          100%; 
         display:       block;
         position:   relative; 
      }`,
 
   template(text = this.textContent || ' ') {
      const spacing = this.getAttribute?.call(this,'letter-spacing') || 0
      return ` 
         <div class = "hidden"> 
            <slot>${ text }</slot>
         </div> 
         <svg part="svg" class= "squishy-text"
              xmlns   = "http://www.w3.org/2000/svg"
              viewBox = "0 0 120 100"
              preserveAspectRatio = "xMidYMid meet">
              <text letter-spacing = "${parseInt(spacing)}px"
                    class       = "squishy-text"
                    x = "50%" y = "50%"
                    paint-order = "stroke"
                    font-size   = "100px"  
                    text-anchor = "middle"
              dominant-baseline = "middle" ></text>
         </svg>`
   }, 

   bindElements: {
      sizingBox: 'div.hidden', 
      svg: 'svg',
      txtSlot: 'slot',
      svgText: 'svg text' 
   },
   
   eventDefaultsPrevented: [ 'dragstart' ],  

   get value() {
      if (this.txtSlot != null) {
         return this.txtSlot.textContent
      }
   }, 
   
   set value(val) {
      if ((Math.round(parseFloat(this.value)) !== Math.round(parseFloat(val)))) {
         this.queueUpdate(val)
      }
   },   
 
   afterFirstContent() {   
      if (this.textContent.length) {
         this.queueUpdate(this.textContent)  
      }
      this.textContent = '' 
   }, 

   queueUpdate(newVal) {
      this.lastUpdate = newVal
      if (this.raf == null) { 
         this.txtSlot.textContent = this.lastUpdate 
         this.raf = requestAnimationFrame(()=> { 
            this.instanceStyles.replaceSync(
               `svg { min-width: ${Math.round(newVal.length*9)}px; }`
            );
            this.svg?.setAttribute(
               'viewBox',
               `0 0 ${ this.sizingBox.offsetWidth + 160} 100`
            ) 
            this.svgText.textContent = this.lastUpdate  
            if (this.classList.contains('hidden')) {
               this.classList.remove('hidden') 
            }
            this.raf = null;  
         })   
      }
   } 
})