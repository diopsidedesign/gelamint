import * as REF          from './ref.js'
import { mint }          from './mint.js'
import { GelSheet }      from './sheet.js'
import { Controlor }     from './controlor.js'
import { GelPlates }     from './template.js'
import { funcs }         from './funcs.js'
import { is }            from './is.js'
import { StackingList }  from './list.js'
import { RevolvingList } from './list.js'
import { trace }         from './trace.js'
import { XY }            from './xy.js'


export const Gel = {
   mint,
   Color: Controlor, 
   Plates: GelPlates,
   Sheet: GelSheet, 
   fetch: funcs.cachedFetch,
   xy: XY,  
   CssAppearanceReset: REF.CSSAPPEARANCERESET, 
   StackingList,
   RevolvingList,  
   writeAttrs: funcs.writeAttrs,
   mimeTypes: REF.MIMETYPES,
   templify: funcs.templify, 
   throttle: funcs.throttle, 
   debounce: funcs.debounce, 
   makeEl: funcs.makeEl, 
   trace: trace,
   hash: funcs.hash,
   is,
   g: funcs.g,
} 




