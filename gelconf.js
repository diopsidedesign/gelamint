export const windowFadeTime = 200  

// enough for testing 
export const eventNames = [
   'hashchange',
   'onpointerdown',
   'onpointerup',
   'onpointermove',
   'onpointerenter',
   'onpointerleave',
   'onwheel'
]
export const ownedEvents = {
   hashchange : window,
   resize: window 
}
export const gelamintReserved = [
   'onload',
   'elRefs',
   'observedAttributes',
   'observedAttrs',
   'attrObservers',
   'boundStyles',
   'oninit',
   'styles',
   'template',
   'listeners'
]