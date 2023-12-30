import { Gel } from "./gel.js"
import './icons.js'
import './frame.js' 
import './text.js'
import './tabs.js' 


Gel.mint('gel-view', {  

   stylesUrl:
      './src/gel_view.css', 
 
   template:     
      `<div id="gel-dash">
         <div class="inner-wrapper"> 
            <section id="gel-dash-top">
               <slot name="dash-top" type="accessory"></slot>
               <nav></nav>
            </section>
            <footer id="gel-dash-footer">
               <slot name="dash-footer" type="accessory"></slot>
            </footer>
            <slot name="dash" type="frame"></slot> 
         </div> 
      </div>

      <div id="gel-dash-handle"> 
         <gel-btn menu></gel-btn>
         <div class="inner-wrapper"></div>
      </div>

      <div id="gel-main">  
         <div class="inner-wrapper"> 
            <slot name="main" type="frame"></slot>  
         </div> 
      </div>

      <slot name="over" type="frame"></slot>  

      <slot default></slot>`,     

   bindElements: { dash: '#gel-dash' },

   bindAttributes:
      [ 'active-page','full-dash'],

   dontCacheAttrs:
      [ 'class', 'uid', 'id', 'style', 'fullscreen', 'focused', 'color-mode', 'gel-pipe'],

   bindStyles() {
      return {
         dashWidth: [ '#gel-dash', 'width' ],
         dashMin:   [ '#gel-dash > .inner-wrapper', 'min-width' ],
         innerDashX:[ '#gel-dash > .inner-wrapper', 'translateX'], 
         dashZ:     [ '#gel-dash', 'z-index',
            (z)=> {
               z = parseInt(z);
               this.setStylePropertyValue('z-index', z+2, 'gel-btn[menu]');
               this.setStylePropertyValue('z-index', z+1, '#gel-dash-handle');
            }] 
      }
   }, 
 
   onConstruct() {   
      this.getNames       = el => el.getAttribute('name')
      this.lastPage       = ''
      this.stagedContent  = new DocumentFragment() 
      this.SNAP_TOLERANCE = this.readAttrOr('snap-tolerance', 80)  
      this.origWidth      = parseInt(this.readAttrOr('min-dash-width', 280)); 
   },
 
   onConnect() {       
      
      this.style.dashMin = this.origWidth;   
      this.MINMAINWIDTH  = 210;  
      this.dash.name     = 'dash-area';
 
      const nav = this.shadowRoot.querySelector('nav');

      this.gelNav = Object.defineProperties(
         nav,
         (function(renderFrag = new DocumentFragment()) {

            const renderAndSort = Gel.debounce(()=> {  
               if (nav.homeLink) {
                  nav._list().insertBefore(nav.homeLink, nav._list().firstChild)  
               }
               nav._list().appendChild(renderFrag);
               requestAnimationFrame(()=> renderFrag.replaceChildren())
            });

            nav.appendChild(document.createElement('ul'));

            return ({
               _list : {
                  value: function() {
                     return nav.querySelector('ul')
                  }
               },
               makeLink:{
                  value: function(hashName) {
                     return Gel.makeEl('li', { 
                        contents: `<a href="#${hashName=='home'?'':hashName}">${hashName}</a>`, 
                        ...(hashName == 'home' ?  {'home-link':''}  : {}),
                        class: "gel-page-link",
                        page: hashName,
                        listeners: { pointerdown: e=> e.stopPropagation() }
                     })
                  }
               },
               addLink: {
                  value: function(_li) {
                     const li = nav.makeLink(_li);
                     if (!li.hasAttribute('home-link')) {
                        renderFrag.appendChild(li);
                     }
                     else {
                        nav.homeLink = li ;
                     }
                     renderAndSort(); 
                  }
               }
            })
         })()
      );
 
      this.toggleDash( 'close' ); 

      let homePageStr = `<gel-frame name="home" slot="main" class="center-content"> 
               <ul class="gel-tiles">`

      this.windowTemplates = new Gel.Plates(
         !(this.slots.default.length) ? [] : this.slots.default.map( _tmpl => {      

            const tEl   = 'gel-frame'
            const tName = _tmpl.hasAttribute('default') ? 'home' : _tmpl.getAttribute('name')

            let tmpl = _tmpl

            if (_tmpl.localName!=='template') {
               tmpl = Gel.writeAttrs.call(
                  document.createElement('template'),
                  this.readAllAttrs(_tmpl)
               )
               tmpl.content.appendChild(_tmpl.cloneNode(true))
               requestAnimationFrame(()=> _tmpl.remove())
            }     
            if (tmpl.content.querySelector(tEl)==null) {  
               // if element was not one of the indicated host elements, place it within one
               const s = tmpl.innerHTML
               tmpl.innerHTML =`
                  <${tEl} ${tName.length ? `name="${tName}"` : ''}>                    
                     ${s}
                  </${tEl}>`
            } 
            const cQuery = tmpl.content.querySelectorAll.bind(tmpl.content)
            // give a unique name attribute to any gel-frames who were not provided one
            cQuery( tEl+':not([name])').forEach((fr,i) => fr.setAttribute('name', tName+'_frame_'+(i+1)) ) ;
            // assign slot='main' to any gel-frames who were not designated to a slot
            cQuery( tEl+':not([slot])').forEach((fr)   => fr.setAttribute('slot', 'main')) 
            // add link to nav menu
            this.gelNav.addLink(tName); 

            homePageStr += `<a href="#${tName}"><li>${tName}</li></a>`

            return tmpl 
         }).filter(z=> !!z)
      ) 
      homePageStr += `</ul></gel-frame>`;
   
      const homePage = Gel.makeEl( 'template', {
            contents: homePageStr,
            name: 'home',
            default: ''
         }
      )
      this.windowTemplates.add(homePage);

      //this.instanceStyles.updateStyleRule(background-image: linear-gradient(to top, rgb(0 0 0 / .3) 0%, rgb(0 0 0 / .7) 100%), var(--background-path);
      
      //setTimeout(()=>{
      //   Gel.Sheet.docSheet.updateStyleRule('--background-path', `url("./assets/bg3.jpg")`,'gel-view')
     //    this.instanceStyles.updateStyleRule('background-image', 'linear-gradient(to top, rgb(0 0 0 / .3) 0%, rgb(0 0 0 / .7) 100%), var(--background-path);','gel-view');
     // })
 
      // stacking list data structure used for window z ordering
      // dash element is added so it can be considered in stacking context like any other gel-frame/window
      this.windows = new Gel.StackingList(
         'name', [this.dash].concat(this.slots.over)
      ); 

      // initialize the top of the stacking list (maybe unnecessary /// could remove)
      this.windows.activate(0);

      // read current url hash    
      this.activePage = this.getPageHash();  

      // init window focus (most likely will focus dash)
      this.focusWindow(this.windows.get(0));

      this.replaceClass.call(document.body, 'invisible','visible');
      this.replaceClass.call(document.body, 'transparent','opaque');  
   },
 
   // watches active-page attr for changes
   // when page changes, determines which gel-frames need to be removed (i.e those currently loaded but not included in new page)
   // and which gel-frames need to be added (those included in the new page which are not yet loaded)
   // new content is appended to the staged content document fragment and then 
   // finally appended to the element itself ('this.appendChild') 
   attrObservers: {  
      'active-page'(newVal, oldVal) {         
         if (this.lastPage === newVal)
            return;
         this.lastPage = newVal;
       /*  const dashCtrls = Array.from(this.dashSlot.children)
            .filter(el=> {
               const n = el.getAttribute('name');
               return n.includes('gel') && n.includes("controls")
            });
         if (dashCtrls.length)
            dashCtrls.forEach(ctrlEl=> ctrlEl.remove());*/
         this.stagedContent.replaceChildren();//clear doc frag
         for (const slotName of this.slots.type.frame) {
               const open = this.slots[slotName].map( this.getNames );
               const _new = this.windowTemplates
                  .search( newVal, 'slot', slotName )
                  ?.map( this.getNames )
                  ?.filter( name => !open.includes(name));
               open.forEach( name => { 
                  this.slots[slotName].filter( f => f.getAttribute('name') == name)
                     .forEach( found => !(found.hasAttribute('locked')) ? found.closeSelf?.call(found) : null);  
               }); 
            if (_new?.length) { 
               this.stagedContent.appendChild(
                  _new.reduce( (docFrag, newFrame) => { 
                     this.windowTemplates
                        .search(newVal, 'name', newFrame)
                        .forEach( result => docFrag.appendChild(result.cloneNode(true))); 
                     return docFrag
                  }, new DocumentFragment()) )   } }
         if (this.stagedContent.children?.length) 
            this.appendChild(this.stagedContent);  
      } 
   }, 
 
   // resize observer so that if window is zoomed in such that open dash covers entire view area, 
   // dash will automatically close to allow proper resizing
   observers(count = 0) {  

      const bouncedTimer = Gel.debounce(() => {  
         this.classList.remove('window-resizing');  
         if (  this.style.dashWidth > this.offsetWidth
            && this.hasAttribute('dash-open')) {
            this.toggleDash('close') 
         }
      })

      return ({
         resize: {
            observe: this,
            throttle: 100,
            callback: function(e) { 
               if (!this.classList.contains('window-resizing')) {
                  this.classList.add('window-resizing')   
               }                  
               if (  (this.style.dashMin != null)
                  && (this.style.dashMin > 50)
                  && (this.style.dashMin >= this.offsetWidth)) {
                  this.style.dashMin = this.offsetWidth 
                  this.shrunkFrom    = true
               }
               else if (this.shrunkFrom === true
                     && this.offsetWidth > this.style.dashMin) {
                  this.style.dashMin = this.origWidth 
               }
               bouncedTimer();
            }  
         }
      })
   } , 

   // listens and repsonds to window-related events emitted by child gel-frames
   listeners() {     

      const focusBounce = Gel.debounce(()=> {
         this.dashClicked = false
      }, 200);

      return [ 

         [ 'slot[name="over"]', 'slotchange', this.overSlotChange.bind(this) ],

         [ this, 'windowAction', e=> { 
            switch (e.detail.type) {
               case 'focus': 
                  this.focusWindow(e.detail.frame)
                  break;
               case 'dash':  
                  if (!this.hasAttribute('dash-open')) this.toggleDash('open')
                  break;
               case 'announce': {
                  const frame = e.detail.frame;

                  if (this.windowTemplates.has(frame.name)) {  
                     const stored = this.windowTemplates.get(frame.name)
                     const newA   = Object.keys(this.readAllAttrs(frame));
                 
                     Object.keys(this.readAllAttrs(stored))
                        .filter( w => !(newA.includes(w)))
                        .forEach( attr =>{  frame.setAttribute(attr, stored.getAttribute(attr))})
                  } 
                  break;
               }
               case 'close': {
                  const frame = e.detail.frame
                  if (  !frame.hasAttribute('clone')
                     && !this.windowTemplates.has(frame.name)) { 
                     this.windowTemplates.add(
                        Gel.makeEl('template' , {
                           contents: frame.cloneNode(true),
                           page: '', 
                           place: frame.slot,
                           name: frame.name ?? frame.uid
                        })
                     ) 
                  }
                  if (this.windowTemplates.has(frame.name)) {
                     Gel.writeAttrs.call(
                        this.windowTemplates.get(frame.name),
                        e.detail.attrs,
                        { ignore: this.dontCacheAttrs }
                     )   
                  }
                  break;
               }
            }
         }],
         
         [ 'gel-btn[menu]', 'click', e=> {
            this.toggleDash(this.style.dashWidth > 0 ? 'close' : 'open')
         }],

         [ window, 'hashchange', e=> { 
            if (this.activePage !== this.getPageHash()) {
               this.activePage = this.getPageHash()
            }
         }],

         [ '#gel-dash', 'pointerdown', e=> {   
            this.dashClicked = true;
            if (!this.dash.hasAttribute('focused')) {
               this.dash.setAttribute('focused','') 
            }
            focusBounce();
            this.focusWindow(this.dash);
         }], 

         [ '#gel-dash-handle', 'pointerdown', e=> {
            this.startDashMove(e)
         }] 
      ]  
   },

   get dashSlot() {
      return this.shadowRoot.querySelector('slot[name="dash"]')
   },

   addToDashAsGelFrame(markupTxt, frameName) {
      if (!this.dashInsertedCount) {
         this.dashInsertedCount = 0;
      }
      const tmpl = document.createElement('template');
      const frame = frameName ?? `dynamic_dash_frame_${++this.dashInsertedCount}`
      tmpl.innerHTML = `<gel-frame name="${frame}" slot="dash">${markupTxt}</gel-frame>`;  
      this.appendChild(tmpl.content.cloneNode(true)); 
      return this.querySelector(`gel-frame[name="${frame}"]`).children[0] 
   },
 
   getPageHash() {
      return window.location.hash.substring(1) || 'home'    
   },
   
   toggleDash(state) {   
      this.toggleAttr('dash-open', state=='open');  
      if (state == 'open') {
         this.style.dashWidth  = this.style.dashMin; 
         this.style.innerDashX = 0;
      } else {
         this.style.dashWidth  = 0; 
         this.style.innerDashX = this.origWidth*-1;
      }   
   },  
 
   focusWindow( gelFrame ) {         
      if (!gelFrame) {
         return;
      }
      if (this.dashClicked === undefined) {
         this.dashClicked = false; 
      }
      const topZ  = 25 + (this.windows.size * 3);
      const da    = 'dash-area';
      const lastHead = this.windows.get(0)?.name;

      if (this.dashClicked===false || gelFrame.name===da) {
         this.windows.promote(gelFrame.name) 
      }
      else if (this.dashClicked===true && gelFrame.name!==da && lastHead!==da) { 
         gelFrame = this.windows.promote(da);  
      }
      for (let [win, i, _] of this.windows) {     
         if (win!==gelFrame && win.hasAttribute('focused')) {
            win.removeAttribute('focused');
         }
         Reflect.set(
            (win.name===da ? this.style : win.style),
            (win.name===da ? 'dashZ'    : 'zOrder'),
            i==0           ? topZ+3     : topZ-(i*3)
         ) 
      }    
   },   
  
   overSlotChange(e) {       
      const names    = this.slots.over.map( this.getNames );
      const newWins  = this.slots.over.filter( n => this.windows.indexOf(n.getAttribute('name')) === -1); 
      const deleteUs = this.windows.keys.filter( n => n !== 'dash-area' && !names.includes(n) );        
      if (deleteUs.length) {
         this.windows.delete(...deleteUs)  
      }
      newWins.forEach( win => {
         this.windows.add(win);
         ['resizable','draggable','focusable'].forEach( attr => win.setAttribute(attr,''));
      })
      this.focusWindow(this.dashClicked ? this.dash : this.windows.get(0)) 
   }, 
  
   startDashMove(event) { 
      this.classList.add('no-transitions'); 
      
      const [s, tol, screen]  = [this.style, this.SNAP_TOLERANCE, this.constructor.viewportSize],  
            [mainmin, offset] = [screen.x - this.MINDASHTOLERANCE, event.x - s.dashWidth];
  
      Gel.trace(event,  { 
         budgeThreshold: 0, 
         track: evt => {      
            const xPos = evt.x - offset 
            if (xPos < screen.x && xPos >= 0 && xPos!==s.dashWidth) {
               this.style.dashWidth = xPos;
               this.style.innerDashX = Math.round(Math.max(-s.dashMin, Math.min( 0, xPos-s.dashMin)));
               this.toggleAttr('dash-open', xPos > 0) ;  
            } 
         },
         release: (event) => {       
            const dx = s.dashWidth
            this.classList.remove('no-transitions')  
            if (dx > (screen.x - tol/1.5)) {
               this.fullDash = true 
               s.dashWidth   = screen.x;
            } else {
               if      (this.fullDash)  this.fullDash = false;
               if      (dx > mainmin)   s.dashWidth   = mainmin
               else if (dx < s.dashMin-tol)  requestAnimationFrame(()=> this.toggleDash('close'))
               else if (dx < s.dashMin+tol)  requestAnimationFrame(()=> this.toggleDash('open')) 
            }   
         }
      }); 
   },     
})