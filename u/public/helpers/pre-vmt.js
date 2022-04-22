/** NOTE: THIS FILE SHOULD BE LOADED BEFORE vmt.js */

/**
 * vmt_module is a global javascript object with attributes that are generated by emscripten-code (vmt.js)
 * all attributes of vmt_module will be overwritten by vmt.js except those that are explicitly defined here.
 * refer to https://emscripten.org/docs/api_reference/module.html?highlight=module for more information about
 * this object. Note that vmt_module is refered as Module in the above emscritpen documentation. 
 */
 var vmt_module = {

    "print" : (text) => console.log(`[WASM] ${text}`),
    
    "printErr" : (text) => console.error(`[WASM] ${text}`),
    
    "locateFile" : (path, prefix) => {
        
        if(path.endsWith(".data")) return `/vmt/${path}`;

        return prefix + path;
    },

    "onRuntimeInitialized" : undefined,

    "onAbort" : undefined,
    
    "preInit" : undefined,

    "preRun" : undefined,
};