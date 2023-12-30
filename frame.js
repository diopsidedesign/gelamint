import { Gel } from "./gel.js"

Gel.mint('gel-frame',(numClones = 0)=> ({

   stylesUrl:
      `./src/gel_frame.css`,     

   template: `   
      <gel-strip class="window-controls gel-frame-handle" name="controls"
         buttons="gelframe close maximize:restore main:float dash:float spacer pin layers lock"> 
      </gel-strip>    

      <div class="gel-content-frame">  
         <div class="gel-content-frame-wrapper">
            <slot></slot>   
         </div>
      </div>  

      <gel-icon resize
         class="gel-frame-resize"
         title="Resize Window"> 
      </gel-icon>`,  

   bindAttributes: [
      'focused',
      'locked',
      'fullscreen',
      'pinned',
      'all-controls'
   ] ,

   bindStyles: {
      zOrder:      'z-index',
      translation: 'translate',
      size:        'size'
   },

   attrBehaviors() { 

      let click = {}
     
      const buildTrackingFunc = (prop, interruptWhen, onInterrupt ) => {       
        
         const setClick = event => {  
            let tup = this.style[prop];  
            if (tup === undefined ||  !(Number.isFinite(tup?.at(0)) && Number.isFinite(tup?.at(1)))) {
               if (prop === 'size') {
                  tup = [ Math.max(100, this.offsetWidth ?? 100),
                          Math.max(200, this.offsetHeight ?? 200) ];
               } else if (prop === 'translation') {
                  tup = [ this.x ?? 0, this.y ?? 0  ];
               }
            }  
            click[prop] = { 
               limits: prop === 'size' ?
                  {
                     min: Gel.xy(50,20),
                     max: this.constructor.viewportSize 
                  } :
                  { // prop === 'translation'
                     min: Gel.xy(-1000000,-1000000),
                     max: Gel.xy(1000000,1000000)
                  },
               origin: Gel.xy(event),
               offset: Gel.xy(event).minus(...tup) 
            }
         } 

         const clamp = (val, min, max) => Math.min(Math.max(val, min),max)

         const track = e => {    
            this.style[prop] = [  
               clamp(
                  Math.round(e.x - click[prop].offset.x),
                  click[prop].limits.min.x,
                  click[prop].limits.max.x
               ),
               clamp(
                  Math.round(e.y - click[prop].offset.y),
                  click[prop].limits.min.y,
                  click[prop].limits.max.y
               )
            ]
         }

         const release = e => {        
           this.setAttribute(prop, this.style[prop]?.toString() ?? '');  
            if (this.offScreen) {
               if (this.hasAttribute('translation')) this.removeAttribute('translation');
               this.emitWindowEvent({ type: 'close', attrs: this.readAllAttrs()})
            }
         } 

         return function(event) {      
            setClick(event);  
            Gel.trace(event, {
               track, release, interruptWhen, onInterrupt, 
               eventOptions: {
                  pointerdown: {
                     preventDefault: false, 
                     stopPropagation: false
                  }
               } 
            })  
         } 
      } 
       
      return ({ 

         focusable: {
            pointerdown(newVal, oldVal) { 
               if (!this.hasAttribute('focused')) {
                  this.setAttribute('focused','')   
               }
               this.emitWindowEvent({ type: 'focus' });  
            }
         }, 

         resizable: [
            [ '.gel-frame-resize' , 'pointerdown', buildTrackingFunc('size') ]
         ],

         draggable: [
            [ 'gel-strip[name="controls"]' , {  
               pointerdown: buildTrackingFunc('translation',
                  e => (this.fullscreen === true && Gel.xy(click.translation.origin).distTo(e) > 40) ,
                  e => {    
                     this.fullscreen = false;    
                     
                     click.translation.offset = Gel.xy(
                        this.style.size[0] * (e.x / this.constructor.viewportSize.x),
                        e.y - (click.translation.origin.y ?? 0)
                     ); 
                      //this.adjustWindowSize(); 
                  }
               ),  
               'double-click': (e)=>{ 
                  if ( !this.hasAttribute('size')){
                     this.style.size = [this.clientWidth, this.clientHeight];
                     this.setAttribute('size',`${this.clientWidth},${this.clientHeight}`);
                  }
                  this.fullscreen = !this.fullscreen
               }
            }
            ]
         ]
      })
   },  

   listeners() { 
      return [
         [ this, 'gel-button-command', e=> {

            switch (e.detail.name) {

               case 'lock': 
                  this.locked = !this.locked;
                  break;

               case 'pin': 
                  this.pinned = !this.pinned;
                  break; 

               case 'gelframe':
                  this.allControls = !this.allControls;
                  break;

               case 'close':
                  this.closeSelf()
                  break;

               case 'maximize:restore': {
                  this.fullscreen = (this.slot!=='over')
                                 || (this.slot==='over' && !this.fullscreen);            
                  this.slot = 'over' 
                  break;
               }

               case 'main:float':
               case 'dash:float': {
                  if (this.fullscreen === true) {
                     this.fullscreen = false;  
                  }
                  const dock = e.detail.name.substring(0, e.detail.name.indexOf(':') );  
                  if (this.slot === 'over') {
                     this.style.translation = this.attrToNumList('translation') ?? [0,0]; 
                  }
                  this.slot = (this.slot === dock) ? 'over' : dock; 
                  this.emitWindowEvent({
                     type: 'dock',
                     state: (this.slot === dock) ? 'docked' : 'floated',
                     dock
                  });   
                  this.blur()
                  getSelection().empty() // band-aid for a strange bug where all text content of a frame is highlighted when slotted into the dash
                  break;
               }

               case 'layers': {
                  this.removeAttribute('uid');
                  this.disappear()
                  const spawn = this.cloneNode(true);
                  this.appear()
                  this.setAttribute('uid', this.uid);
                  numClones += 1; 
                  spawn.setAttribute(
                     'name',
                     `${this.name.replace(/-clone-.+$/g,'')}-clone-${numClones}`
                  )  
                  spawn.setAttribute('clone','');  
                  this.emitWindowEvent({
                     type: 'focus',
                     frame: spawn
                  })
                  this.parentElement.insertBefore(spawn, this) 
                  break;
               }
            }
         }]
      ]
   },

   afterConnect(){  
      this.emitWindowEvent({
         type: 'announce'
      })
      this.appear()
      this.style.translation = [0,0];
   },
     
   emitWindowEvent(detail = {}) {  
      if (!('frame' in detail)) {
         detail['frame'] = this   
      }
      this.dispatchEvent(
         new CustomEvent('windowAction', {
            composed: true,
            bubbles: true,
            detail
         })
      ) 
   },  
    
   closeSelf() {
      this.classList.remove('opaque');

      this.emitWindowEvent({
         type: 'close',
         attrs: this.readAllAttrs()
      }); 
      // this.constructor.classStyles.getPropertyValue('--gel-frame-fade-time') 
    
      setTimeout(()=> this.remove(), 0); 
   },

}))