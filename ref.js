export {
   HTMLTAGS,
   SVGTAGS, 
   DOMEVENTNAMES,
   MIMETYPES,
   CSSAPPEARANCERESET
}

// a useful chunk of CSS that removes all user-agent default styles
   // from html elements (mostly from input elements)
const CSSAPPEARANCERESET = `    /*margin:  0;*/
   padding: 0;
   box-sizing:  border-box;
   position:      relative; 
   border:     none;
   outline:    none;
   box-shadow: none; 
   background: none;
   appearance: none;
   -webkit-appearance: none;
   color:         inherit;
   font-family:   inherit;
   font-weight:   inherit;`

const HTMLTAGS = Object.defineProperty(
   new Set([
      "html","base","head","link","meta","script","style","title","body",
      "address", "hgroup", "figcaption", "bdo","br", "small", "map",
      "article","aside","footer","header","h1","h2","h3","h4","h5","h6",
      "track", "canvas", "tfoot","th", "legend","meter", "dialog","slot",
      "main","nav","section","blockquote","cite","dd","dt","dl","div",
      "font","frame", "param","plaintext","rb","rtc","spacer","strike",
      "figure","hr","li","ol","ul","menu","p","pre","a","abbr","b","bdi", 
      "code","data","dfn","em","i","kbd","mark","q","rp","ruby","rt","s",
      "samp","span","strong","sub","sup","time","u","var","wbr","area","audio",
      "img","video","embed","iframe","object","picture","source","portal",
      "svg","noscript","del","ins","caption","col","colgroup","table","tbody",
      "tr","td","thead","button","datalist","option","fieldset","label","form",
      "input","optgroup","select","output","progress","textarea","details",
      "summary","template","acronym","applet","bgsound","big","blink","center", 
      "dir","frameset","image","keygen","marquee","menuitem","nobr","noembed",
      "noframes","tt","xmp"
   ]),
   // given the object 'owner', determine which native element interface it 
   // represents and return the tag name of the associated html tag
   'constructorToHtmlTagName',
   {
      value: function(
         owner,
         tagOutliers=({
            anchor:   'a',
            paragraph:'p',
            ulist:    'ul',
            olist:    'ol',
            dlist:    'dl',
            image:    'img'
         })) { 
         const substr = owner.toString()
            .replace(/^.*HTML|Element.*$/g,'')
            .toLowerCase();
         if (this.has(substr)) {
            return substr 
         }
         if (substr in tagOutliers) {
            return tagOutliers[substr] 
         }
         return undefined
      }
   }
) 

const SVGTAGS = new Set([
   'hatch','hatchpath','line','marker','mask','metadata',
   'mpath','pattern','polygon','polyline','set','stop','switch','textPath',
   'view','feBlend','feColorMatrix','feComponentTransfer','feComposite',
   'feConvolveMatrix','feDiffuseLighting','feDisplacementMap','feDistantLight',
   'feDropShadow','feFlood','feFuncA','feFuncB','feFuncG','feFuncR',
   'feGaussianBlur','feImage','feMerge','feMergeNode','feMorphology',
   'feOffset','fePointLight','feSpecularLighting','feSpotLight','feTile',
   'feTurbulence','clipPath','desc','foreignObject','filter','svg','path',
   'text','rect','circle','ellipse','symbol','use','g','defs'
]) 

const DOMEVENTNAMES = new Set([
   "onBlur",       "onCancel",      "onChange",       "onClick",
   "onClose",      "onContextmenu", "onCopy",         "onCut",
   "onDblclick",   "onDrag",        "onDragend",      "onDragenter",
   "onDragexit",   "onDragleave",   "onDoubleclick",  "onDragover",
   "onDragstart",  "onDrop",        "onEmptied",      "onEnded",
   "onError",      "onFocus",       "onHashchange",   "onInput",
   "onInvalid",    "onKeydown",     "onKeypress",     "onKeyup",
   "onLoad",       "onMessage",     "onMousedown",    "onMouseenter",
   "onMouseleave", "onMousemove",   "onMouseout",     "onMouseover",
   "onMouseup",    "onMousewheel",  "onOffline",      "onOnline",
   "onPagehide",   "onPageshow",    "onPaste",        "onPause",
   "onPointerdown","onPointerenter","onPointerleave", "onPointerstart",
   "onPointerend", "onPointermove", "onPointerout",   "onPointerover",
   "onPointerup",  "onReset",       "onResize",       "onScroll",
   "onSearch",     "onSelect",      "onShow",         "onPopstate",
   "onProgress",   "onSort",        "onStalled",      "onStorage",
   "onSubmit",     "onSuspend",     "onToggle",       "onUnload",
   "onWaiting",    "onWheel"
])

const MIMETYPES = { 
   '.css'  : 'text/css',
   '.js'   : 'text/javascript',
   '.ts'   : 'text/plain', 
   '.mjs'  : 'text/javascript',
   '.json' : 'application/json',
   '.html' : 'text/html',
   '.htm'  : 'text/html',
   '.svg'  : 'image/svg+xml',
   '.tiff' : 'image/tiff',
   '.txt'  : 'text/plain',
   '.csv'  : 'text/csv',
   '.mid'  : 'audio/midi',
   '.mp3'  : 'audio/mpeg',
   '.mp4'  : 'video/mp4',
   '.mpeg' : 'video/mpeg',
   '.pdf'  : '/application/pdf',
   '.ttf'  : 'font/ttf',
   '.woff2': 'font/woff2',
   '.zip'  : 'application/zip'
} 