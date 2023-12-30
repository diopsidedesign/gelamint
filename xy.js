export const XY = (function(){

   function isNum(Z)   {
      return (typeof Z == 'number' && Number.isFinite(Z))
   } 

   function isNums(a,b) {
      return (isNum(a) && isNum(b) ? [a,b] : undefined)
   } 

   function distTo(xy1, xy2) {
      return (minus(xy1, xy2).sqr.sum)**0.5
   }

   function powr(xy1, xy2) {
      return XY(xy1[0]**xy2[0], xy1[1]**xy2[1])
   }

   function divd(xy1, xy2) {
      return XY(xy1[0]/ xy2[0], xy1[1]/ xy2[1])
   }

   function minus(xy1, xy2) { 
      return XY(xy1[0]- xy2[0], xy1[1]- xy2[1]) 
   }

   function min(xy1, xy2) {
      return XY(Math.min(xy1[0], xy2[0]), Math.min(xy1[1], xy2[1]))
   }

   function max(xy1, xy2) {
      return XY(Math.max(xy1[0], xy2[0]), Math.max(xy1[1], xy2[1]))
   }

   const xyProto = {

      toString() {
         return `${this.x}, ${this.y}`
      },

      toArr() {
         return [...this]
      },

      get x() {
         return this.xy[0]
      },

      get y() {
         return this.xy[1]
      }, 

      get sum() {
         return this.xy[0] + this.xy[1]
      },

      get sqr() {
         return powr(this.xy, readXY(2) )
      },  

      distTo(x,y) {
         return distTo(this.xy, readXY(x,y))
      },

      powr(x,y) {
         return powr(this.xy, readXY(x,y))
      },

      minus(x,y) {
         return minus(this.xy, readXY(x,y))
      },

      divd(x,y) {
         return divd(this.xy, readXY(x,y))
      },
      
      min(x,y) {
         return min(this.xy, readXY(x,y))
      },
      
      max(x,y) {
         return max(this.xy, readXY(x,y))
      },
      
      * [Symbol.iterator]() {
         yield this.xy[0]
         yield this.xy[1]
         return
      }
   } 

   function readXY(a,b){ 
      return (
            isNums(a,b)
         ?? isNums(a,a)
         ?? isNums(a.x,a.y)
         ?? isNums(a.offsetWidth, a.offsetHeight)
         ?? isNums(a.width, a.height)
         ?? isNums(a[0],a[1])
         ?? ( [(a ?? NaN), (b ?? NaN)] )
      )   
   } 

   return function(x,y) {
      return Object.defineProperty(
         Object.create(xyProto),
         'xy',
         {
            enumerable: true,
            value: Object.seal(readXY(x,y))
         }
      ) 
   } 
})() 