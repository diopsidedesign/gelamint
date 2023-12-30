import { Gel } from "./gel.js"

Gel.mint('gel-tabs', {

   stylesUrl: `./src/gel_tabs.css`,   

   bindElements: { tabRow: '#gel-tabs-row' },

   bindAttributes: [ 'active-tab' ],  

   template:` 
      <div class="outer-content-wrapper"> 
         <div id="gel-tabs-row" gel-content="1"></div>   
         <div id="gel-tabs-window"> 
            <div part="viewport" id="gel-tab-viewport"> 
               <div id="gel-tab-viewport-inner" gel-content="2"></div>  
            </div>  
            <slot></slot>  
         </div>
      </div>`,
 
   attrObservers: {
      'active-tab'(newVal, oldVal) {    
         this.tabRow.querySelectorAll('.gel-tab-tab').forEach(node=> { 
            this.toggleAttr.call( node, 'active',
               node.getAttribute('name')===newVal
            )
         }) 
         const tabElem = this.plates.find(tab=>
            tab.getAttribute('name')===newVal
         );  
         if (tabElem != null) {
            this.render({
               content: tabElem.content,
               container: 2
            })     
         }
      } 
   }, 
  
   listeners() {
      return [
         [ '#gel-tabs-row', 'click', e=> { 
            // traverse upwards to find the proper click target
            // in case e.target is some deeper sub element
            const actualTarget = this.lookUpFor( e.target,
               node=> node.hasAttribute('name') && node.classList.contains('gel-tab-tab')
            )
            if (actualTarget != null) {
               this.setAttribute(
                  'active-tab',
                  actualTarget.getAttribute('name')
               )
            } 
         }]
      ]
   },   

   onConstruct(){
      this.plates = new Gel.Plates(null, 'name') 
   },
 
   afterConnect() {     

      this.plates.absorbSlot(this.getSlot('default')); 

      this.defaultTab = this.plates
         .find(tabTmpl=> tabTmpl.hasAttribute('default'))
         ?.getAttribute('name'); 

      this.renderTabRow();

      if (this.defaultTab != null) {  
         this.activeTab = this.defaultTab 
      }
   },
   
   renderTabRow() {
      const tabRadi = parseInt(this.classStyles.getPropertyValue('--gel-tab-row-height')) / 2;
      this.render({
         container: 1,
         content: Gel.g.for(this.plates.list)
                       .of((ltTab, _, tabName=ltTab.getAttribute('name'))=> `  
         <div class="gel-tab-tab" name="${tabName}" >
            <div class="tab-title-wrapper">
               <gel-text letter-spacing="11">${tabName}</gel-text> 
            </div> 
            <div class="gel-tab-tab-inner" >
               ${['left','right'].map(side=> `    
               <div class="tabwrap ${side}" >    
                  <svg class="inset" viewBox="0 0 ${tabRadi} ${tabRadi+1}"
                       preserveAspectRatio="xMaxYMax meet" >   
                     <mask id="mask${tabName}">  
                        <rect
                           width="${tabRadi+2}"
                           height="${tabRadi}"
                           x="${tabRadi/2}"
                           y="${tabRadi/2}" />   
                        <circle  cx="${(tabRadi/2) - 1}"
                                 cy="${tabRadi/2}"
                                 r ="${tabRadi/2}" />
                     </mask>   
                     <rect mask="url(#mask${tabName})"
                           width="${tabRadi+2}"
                           height="${tabRadi}"
                           x="${tabRadi/2}"
                           y="${tabRadi/2}" />
                  </svg> 
                  <svg class="bottom box" preserveAspectRatio="none"
                       viewBox="0 0 ${tabRadi} ${tabRadi+6}" >
                     <rect width="100%" height="100%"/>
                  </svg>   
                  <svg class="top box" viewBox="0 0 ${tabRadi+1} ${tabRadi+1}"
                     preserveAspectRatio="xMinYMin" >  
                     <path d="M0,
                        ${tabRadi}C0,
                        ${tabRadi * 0.44} ${tabRadi * 0.44},
                        0 ${tabRadi},
                        0L${tabRadi*100},
                        0L${tabRadi*100},
                        ${tabRadi*100}L0,
                        ${tabRadi*100}L0,
                        ${tabRadi}Z"/>
                  </svg> 
               </div>`).join(  `<div class=" backdrop"></div>`  )}  
            </div> 
         </div>  `)
      }) 
   }
}) 