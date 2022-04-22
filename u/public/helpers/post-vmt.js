/** NOTE: THIS FILE SHOULD BE LOADED AFTER vmt.js */

/**
 * we need routines that can properly allocate and destroy memory when passing
 * data structures that are not native to WASM such as strings, array buffers etc. 
 */

const _freeArray = (heapBytes) => {
    try {
        vmt_module._free(heapBytes.byteOffset)
    } catch (e) {
        console.error("_freeArray err = ", e);
    }
}

const _freeString = (buffer) => {
    try {
      vmt_module._free(buffer)
    } catch (e) {
      console.error("_freeString  err = ", e);
    }
}

const _arrayToHeap = (typedArray) => {
    try {
      let numBytes = typedArray.length * typedArray.BYTES_PER_ELEMENT
      let ptr = vmt_module._malloc(numBytes)
      heapBytes = vmt_module.HEAPU8.subarray(ptr, ptr + numBytes)
      heapBytes.set(typedArray)
      return heapBytes
    } catch (e) {
      console.error("_arrayToHeap  err = ", e);
      return undefined;
    }
}

const _stringToHeap = (str) => {
    try {
      let length = vmt_module.lengthBytesUTF8(str)
      let buffer = vmt_module._malloc(length + 1)
      vmt_module.stringToUTF8(str, buffer, length + 1)
      return buffer
    } catch (e) {
      console.error("_stringToHeap  err = ", e);
      return undefined;
    }
}

let counter =0;
/** READY STATE TRIGGER EVENT */
var ready_state_interval = setInterval(()=>{
  counter++
  console.log(counter , 'it loading time limit if it more then ' +120*1000/50 + ' it reloads page')
  if(counter > 120*1000/50){
    window.location.reload();
  }
  try {
    if(vmt_module._isVmtReady()){
      document.dispatchEvent(new CustomEvent('vmt_is_ready'));
      clearInterval(ready_state_interval);
    }
  } catch (err) {
    console.debug("vmt is not ready yet");
  }
},50);

