export {
   MicroQueue,
   StackingList,
   RevolvingList
}

class MicroQueue {

   head = 0;
   tail = 0;
 
   *[Symbol.iterator]() {   
      let ind = this.head - 1;
      while(++ind < this.tail) {
         yield this[ind];
      }
      return  
   }

   get size() {
      return this.tail - this.head 
   }  

   get copy() {
      return [...this]
   }   

   add = (newItem)=> {
      this[this.tail] = newItem;
      this.tail++;
   }  

   remove() {
      const toRemove = this[this.head]
      if (toRemove) {
         delete this[this.head];
         this.head++;
      }
      return toRemove ?? null
   }
} 


// generic data node class for various Linked List data structures
class Nodule {    

   #next = null; 
   #prev = null; 
   #data = null; 

   constructor(data) {
      this.#data = data
   } 

   get data() {
      return this.#data
   }

   get next() {
      return this.#next
   }

   get prev() {
      return this.#prev
   }

   set next(val) {
      this.#next = val
   }  

   set prev(val) {
      this.#prev = val
   } 
}
 

// A linked list base class that covers all the features one would
// normally expect from a native javascript data structure while still
// remaining as generic as possible to be suitable for any type of LL implementation
class ProtoList {  

   static Node(data) {
      return new Nodule(data)
   }
  
   // the start marker for our iterator
   get #start() {
      return [0, { next: this.head }]
   }

   // the instance field that stores a reference to the currently
   // selected node of the linked list
   currentNode = null; 

   #key;
   #head;
   #size;
   #tail;

   get size() {
      return this.#size
   };

   set size(val) {
      this.#size = val
   }   

   get key() {
      return this.#key
   };

   set key(val) {
      this.#key  = val
   }  

   get head() {
      return this.#head
   };

   set head(val) {
      this.#head = val
   } 
   // not every LL will need or utilize tail, but that's OK
   get tail() {
      return this.#tail
   };
   
   set tail(val) {
      this.#tail = val
   }   

   // link to the data contained in the node that is after the current node
   get next() {
      return this.currentNode?.next?.data ?? null
   }

   // link to the data contained in the node that is before the current node
   get prev() {
      return this.currentNode?.prev?.data ?? null
   }

   // returns data contained in the 'currentNode' node reference
   get current() {
      return this.currentNode?.data ?? null
   }

   // returns index of whatever node is marked as 'currentNode' in the linked
   //  list
   get currentIndex() {
      return this.indexOf(this.currentNode?.data[this.key])
   } 

   // returns all the keys of the Linked List in an array 
   // (similar to native JS Map method 'keys()')
   get keys() {
      return [...this].map(([data,i,_])=> data[this.key])
   } 

   // returns all the values of the Linked List in an array 
   // (similar TO native JS Map method 'values()')
   get values() {
      return [...this].map(([data,i,_])=> data)
   }

   // returns an array of key-value entries representing all the data in 
   // the linked list (similar to native JS Map method 'entries()')
   get entries() {
      return [...this].map(([data,i,_])=> [ data[this.key], data ])
   }

   // an iterator written so that it can advance through the list either 
   // forward or backward if provided index is 0 or 1, iterator advances 
   // from the beginning to the end of the list if provided index is > 1, 
   // list will start at end and iterate backwards
   *[Symbol.iterator]([index, node] = this.#start) {  
      const [ cond, incr ] = index > 1 ?
           [ z=> z >= 0,        -1 ]
         : [ z=> z < this.size,  1 ];
      while (cond(index)) {
         node = node?.next;
         yield [node?.data, index, node];
         index += incr
      } 
      return 
   }    

   constructor(keyProp) {
      // the 'keyProp' string indicates which property on a 
      // Node/Nodule's contained data object that the linked 
      // list should use as a key for that node
      this.key  = keyProp  

      // standard linked list state initialization
      this.size = 0;    
      [ this.head, this.tail ] = [ null, null ];  
   }   

   // general purpose 'get' function for nodes
   // will fetch a node from a index (number), key (string), or reference
   getNode(keyOrIndex) {
      return this.getNodeAt(this.indexOf(keyOrIndex))
   }

   // fetches a node from a provided numerical index
   // if 'alsoGetNextBool' is provided as true, a tuple is returned containing
   // the queried node as well as the node referenced by its 'next' property
   getNodeAt(index, alsoGetNextBool) { 
      index = this.indexOf(index)
      for (let [data, i, node] of this) {
         if (i === index) {
            return alsoGetNextBool === true ? [node, node.next] : node;
         }
      }
      return null 
   }  

   // simply calls 'activateNode' on the 'currentNode' property
   activate(keyOrIndexOrNode) {  
      return this.activateNode('currentNode', keyOrIndexOrNode)
   } 

   // written generically with 'nodePropKey' in case we want to add
   // additional markers to the list beyond "current" at some point in the 
   // future 'keyOrIndexOrNode' can be a node reference, numerical index, 
   // or string key
   activateNode(nodePropKey, keyOrIndexOrNode) {
      if (  typeof keyOrIndexOrNode === 'object'
         && keyOrIndexOrNode[this.key] != null) {
         keyOrIndexOrNode = keyOrIndexOrNode[this.key]
      }
      if (keyOrIndexOrNode instanceof Nodule) {
         this[nodePropKey] = keyOrIndexOrNode; 
      }
      else if (this.has(keyOrIndexOrNode)) {
         this[nodePropKey] = this.getNodeAt(this.indexOf(keyOrIndexOrNode))  
      }
      else {
         this[nodePropKey] = this.getNodeAt(0)  
      }
      return this[nodePropKey].data
   }

   // like 'getNode', except this method returns the contained data
   // in the node (if it is found), if there is no contained data or the 
   // node is not found, returns null
   get(key) { 
      const search = this.getNodeAt(key)
      if (search) {
         return search.data  
      }
      else {
         return null
      }
   }  

   isValidIndex(i) {
      return Number.isInteger(i) && i >= 0 && i < this.size
   } 

   getKeyAtIndex(i) {
      return Reflect.get(this.getNodeAt(i).data, this.key)
   }   

   // use this method to change the data that a node holds
   set(key, newVal) { 
      return this.has(key) ?
           Reflect.set(this.getNode(key), 'data', newVal) : false 
   } 
  
   has(key) {
      return this.indexOf(key) > -1
   } 
   
   // key can be object, if so it will attempt to read property
   // 'keyProp' on the object otherwise key should be number 
   indexOf(key) {
      if (key && typeof key === 'object' && this.key in key) 
         key = key[this.key]  
      if (typeof key === 'number') 
         return this.isValidIndex(key) ? key : -1  
      for (let [data, i, node] of this) {
         if (data && key === data[this.key] )
            return i;
      } 
      return -1
   }  
}
  
// Stacking list is a linked list where nodes can only be appended to the head
// of the list, but can be removed from any point in the list.

// Originally written to implement z-stacking of windows in the gel-view window 
// manager clicking on a window to focus it 'promotes' it to the front of the 
// linked list essentially removing it from the list and adding it again to the 
// front 
class StackingList extends ProtoList {   
 
   constructor(keyProp, ...args) {
      super(keyProp);
      this.size = 0
      this.head = null   
      if (args !== undefined) { 
        this.add(...args.flat()) 
     }
     //this.activate(0)
   }
   
   // add new node to the head of the list
   add(...args) {    
      args.forEach( data => {
         const newNode = ProtoList.Node(data)   
         newNode.next = this.head ;
         [this.head, this.size] = [newNode, this.size + 1]   
      })  
   }  
  
   // delete nodes matching the key(s) in argument list '...args'
   delete(...args) { 
      const deleted = [];  
      args.forEach( kOrI => { 
         try {
            if (this.has(kOrI)) {
               deleted.push(this.remove(this.indexOf(kOrI)))
            }
         }
         catch(err) {
            throw new Error('Error: item not found in list', err)
         } 
      }) 
      return deleted.length >= 1 ? deleted : null 
   }
   
   // moves a node from any point in the list to the front/head of the list
   // activates the node
   promote(keyOrIndex) { 
      const index = this.indexOf(keyOrIndex);  
      if (this.size > 1 && index > 0) { 
         const prev = this.getNodeAt(index - 1);
         const promoted = prev.next;  
         prev.next = this.size === 2 ?
              null
            : prev.next.next;
         promoted.next = this.head;
         this.head = promoted;  
         this.activate(promoted);
         return promoted.data
      } 
   }

   // remove a node from index
   remove(index) {   
      let dontLoseMe;
      if (!this.isValidIndex(index)) {
         throw new Error( 'cannot delete, ' +
            (this.size===0 ? 'list empty' : 'invalid index'));
      }  
      if (index === 0 || this.size === 1) {   
         dontLoseMe = this.head.data;
         [this.head, this.size] = [
            this.size===1 ? null : this.head.next,
            this.size - 1
         ];
         return dontLoseMe
      }  
      const prev = this.getNodeAt(index - 1);
      [ dontLoseMe, prev.next ] = [ prev.next.data, prev.next.next ]; 
      this.size -= 1;
      return dontLoseMe 
   } 
} 


// Revolving list is a fairly standard Circular Doubly Linked List
// built on top of the protolist base class

// Useful for collections of displayable, selectable things
const RevolvingList = (function(){

   function init(data) { 
      const node = ProtoList.Node(data);    
      [ node.next,
        node.prev,  
        this.head,
        this.tail ] = [ node, node, node, node ];  
      this.size += 1
      this.activate(0) 
      return data
   }

   function reset() {  
      if (this.size === 1) { 
         this.size = 0;  
         this.head = this.tail = null 
      }
   }

   // link node0 to node1, if node2 is provided, link that to node1
   function link(node0, node1, node2) { 
      [node0.next, node1.prev] = [node1, node0]; 
      return node2!==undefined ?
           link.call(this, node1, node2)  :  this
   }  

   function addNewNode(dataIn, beforeNode, afterNode) {
      const newNode = ProtoList.Node(dataIn);   
      link.call(this, beforeNode, newNode, afterNode);
      this.size += 1; 
      return newNode
   }

   function deleteHead() {    
      if (this.size <= 1) {
         return reset.call(this)
      }
      this.head = this.head.next 
      link.call(this, this.tail, this.head)
      this.size -= 1 
   }

   function deleteTail() {    
      if (this.size <= 1) {
         return reset.call(this)
      }
      const newTail = this.tail.prev 
      link.call(this, newTail, this.head)
      this.tail = newTail
      this.size -= 1
   }

   function deleteNode(index) {    
      index = this.indexOf(index);  
      if (isNaN(index) || index === null || this.size === 0 || index < 0) {
         throw new Error( 'cannot delete, ' +
            (this.size ===0 ? 'list empty' : 'invalid index'));
      } 
      if (index === 0) {
         return deleteHead.call(this)
      }
      if (this.size <=1) { 
         return reset.call(this)     
      }
      if (index >= (this.size - 1)) {
         return deleteTail.call(this)
      } 
      const [prev, curr] = this.getNodeAt(index-1, true);  
      link.call(this, prev, curr.next)
      this.size -= 1     
   };

   return class RevolvingList extends ProtoList {  
 
      add(data, hOrT='tail') {    
         if (this.size === 0) {
            return init.call(this, data);
         }
         const newNode = addNewNode.call(this, data, this.tail, this.head); 
         if (hOrT=='head') {
            this.head = newNode  
         }
         else {
            this.tail = newNode   
         }
         return data
      }

      delete(keyOrIndex) {
         if (this.has(keyOrIndex)) {
            deleteNode.call(this, keyOrIndex) 
         }
      } 
    
      insert(index, data) {  
         if (this.size === 0) {
            return init.call(this, data)
         }
         if (!this.isValidIndex(Math.max(index - 1, 0))) {
            throw new Error('invalid index')  
         }
         if (index === 0) {
            return this.add(data,'head')
         }
         if (index >= this.size) {
            return this.add(data,'tail');
         }
         addNewNode.call(
            this,
            data,
            ...this.getNodeAt(index-1, true)
         ) 
      }  

      moveNode(fromIndex, toIndex) {
         if (fromIndex === toIndex) {
            return
         }
         const fromNode = this.getNodeAt(fromIndex);
         if (!fromNode) {
            return
         }
         link.call(this, fromNode.prev, fromNode.next);
         const toNode = this.getNodeAt(toIndex);
         if (!toNode) {
            return
         }
         link.call(this, toNode.prev, fromNode, toNode);
         if (fromNode === this.head) {
            this.head = fromNode.next 
         }
         if (fromNode === this.tail) {
            this.tail = fromNode.prev;  
         }
      } 
   }
})()

