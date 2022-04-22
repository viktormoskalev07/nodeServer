class VmtHelper{
    
    constructor(){
    }

    registerCanvases(base_canvas_id, display_canvas_id){
        /**
         * base_canvas_id is the id of canvas which the video or image in written to
         * while the display_canvas_id is the id of canvas to which you would like to 
         * write the resulting image
         */
        try {
            this.base_canvas = document.getElementById(base_canvas_id);
            this.base_ctx = this.base_canvas.getContext("2d");
        } catch (error) {
            console.log("no such base canvas found");
            return false;
        }

        try {
            this.display_canvas = document.getElementById(display_canvas_id);
            this.display_ctx = this.display_canvas.getContext("2d");
        } catch (err) {
            console.log("no such display canvas found");
            return false;
        }

        return true;
    }

    setLive(bool){
        this.isLive = bool;
    }

    cycleForLive(){
        let width = this.base_canvas.width
        let height = this.base_canvas.height

        let image_data = this.base_ctx.getImageData(0, 0, width, height);
        let wasm_input_buffer = _arrayToHeap(image_data.data);

        if(wasm_input_buffer === undefined){
            console.warn("frame is skipping");
            return;
        }

        vmt_module._landmarkDetectionFullLifeCycle(
            width, 
            height, 
            wasm_input_buffer.byteOffset, 
            wasm_input_buffer.byteOffset
        );
        
        try {
            image_data.data.set(wasm_input_buffer);
            this.display_canvas.width = width;
            this.display_canvas.height = height;
            this.display_ctx.clearRect(0, 0, width, height);
            this.display_ctx.putImageData(image_data, 0, 0);
        } catch (err) {
            console.warn("unable to set image to display canvas")
            return;
        }
        
        _freeArray(wasm_input_buffer);       
    }

    cycleForSingleImage(render_only=false){
        if(this.isLive === true) return;

        
        let width = this.base_canvas.width
        let height = this.base_canvas.height
        
        let image_data = this.base_ctx.getImageData(0, 0, width, height);
        let wasm_input_buffer = _arrayToHeap(image_data.data);
        
        if(wasm_input_buffer === undefined){
            console.warn("frame is skipping");
            return;
        }
        
        // get detection
        let detected = true;
        if(!render_only){
            vmt_module._setMaxIterations(15);
            detected = vmt_module._landmarkDetection(
                width, 
                height, 
                wasm_input_buffer.byteOffset
            );
        }

        if(detected){
            vmt_module._renderMakeup(
                width, 
                height, 
                wasm_input_buffer.byteOffset
            );

            try {
                image_data.data.set(wasm_input_buffer);
                this.display_canvas.width = width;
                this.display_canvas.height = height;
                this.display_ctx.clearRect(0, 0, width, height);
                this.display_ctx.putImageData(image_data, 0, 0);
            } catch (err) {
                console.warn("unable to set image to display canvas")
                return;
            }
        }

        _freeArray(wasm_input_buffer); 
    }

    clearMakeup(){
        vmt_module._resetAllMakeup();
        this.cycleForSingleImage(true);
    }

    /** FOUNDATION */

    applyFoundation(r, g, b, a, mask = undefined){
        if(mask){
            let strPtr = _stringToHeap(mask);
            vmt_module._setPerfector(strPtr, r, g, b, a);
            _freeString(strPtr);
        }
        else{
            vmt_module._setFoundation(r, g, b, a);
        }
        this.cycleForSingleImage(true);
    }

    removeFoundation(){
        vmt_module._resetFoundation();
        this.cycleForSingleImage(true);
    }

    /** PERFECTOR */

    applyPerfector(r, g, b, a, mask){
        let strPtr = _stringToHeap(mask);
        vmt_module._setPerfector(strPtr, r, g, b, a);
        _freeString(strPtr);
        this.cycleForSingleImage(true);
    }

    removePerfector(){
        vmt_module._resetFoundation();
        this.cycleForSingleImage(true);
    }

    /** BLENDER */

    applyBlender(r, g, b, a){
        vmt_module._setBlender(r, g, b, a);
        this.cycleForSingleImage(true);
    }

    removeBlender(){
        vmt_module._resetBlender();
        this.cycleForSingleImage(true);
    }


    /** BLUSH */

    applyBlush(r, g, b, a, mask, shmr_mask=null, shmr_intensity=null){
        if(shmr_mask && shmr_intensity){
            let strPtr0 = _stringToHeap(shmr_mask);
            vmt_module._setBlushShimmerEffect(strPtr0, shmr_intensity);
            _freeString(strPtr0);
        } 
        let strPtr1 = _stringToHeap(mask);
        vmt_module._setBlush(strPtr1, r, g, b, a);
        _freeString(strPtr1);
        this.cycleForSingleImage(true);
    }

    removeBlush(){
        vmt_module._resetBlush();
        this.cycleForSingleImage(true);
    }

    /** LIPSTICK */

    applyLipstick(r, g, b, a, fnsh_intensity, fnsh_type, gltr_mask=null, gltr_intensity=null, shmr_mask=null, shmr_intensity=null){
        if(gltr_mask && gltr_intensity){
            let strPtr0 = _stringToHeap(gltr_mask);
            vmt_module._setLipGlitterEffect(strPtr0, gltr_intensity);
            _freeString(strPtr0);
        } 
        if(shmr_mask && shmr_intensity){
            let strPtr1 = _stringToHeap(shmr_mask);
            vmt_module._setLipShimmerEffect(strPtr1, shmr_intensity);
            _freeString(strPtr1);
        }
        vmt_module._setLipstick(r, g, b, a, fnsh_intensity, fnsh_type);
        this.cycleForSingleImage(true);
    }

    removeLipstick(){
        vmt_module._resetLipstick();
        this.cycleForSingleImage(true);
    }

    /** LIPLINER */

    applyLipliner(r, g, b, a, mask){
        let strPtr = _stringToHeap(mask);
        vmt_module._setLipliner(strPtr, r, g, b, a);
        _freeString(strPtr);
        this.cycleForSingleImage(true);
    }

    removeLipliner(){
        vmt_module._resetLipliner();
        this.cycleForSingleImage(true);
    }

    /** HIGHLIGHTER */

    applyHighlighter(r, g, b, a, mask, shmr_mask=null, shmr_intensity=null){
        if(shmr_mask && shmr_intensity){
            let strPtr0 = _stringToHeap(shmr_mask);
            vmt_module._setHighlighterShimmerEffect(strPtr0, shmr_intensity);
            _freeString(strPtr0);
        } 
        let strPtr1 = _stringToHeap(mask);
        vmt_module._setHighlighter(strPtr1, r, g, b, a);
        _freeString(strPtr1);
        this.cycleForSingleImage(true);
    }

    removeHighlighter(){
        vmt_module._resetHighlighter();
        this.cycleForSingleImage(true);
    }

    /** CONTOUR */

    applyContour(r, g, b, a, mask){
        let strPtr = _stringToHeap(mask);
        vmt_module._setContour(strPtr, r, g, b, a);
        _freeString(strPtr);
        this.cycleForSingleImage(true);
    }

    removeContour(){
        vmt_module._resetContour();
        this.cycleForSingleImage(true);
    }

    /** BRONZER */

    applyBronzer(r, g, b, a, mask){
        let strPtr = _stringToHeap(mask);
        vmt_module._setBronzer(strPtr, r, g, b, a);
        _freeString(strPtr);
        this.cycleForSingleImage(true);
    }

    removeBronzer(){
        vmt_module._resetBronzer();
        this.cycleForSingleImage(true);
    }

    /** EYEBROWS */

    applyEyebrow(r, g, b, a, mask){
        let strPtr = _stringToHeap(mask);
        vmt_module._setEyebrow(strPtr, r, g, b, a);
        _freeString(strPtr);
        this.cycleForSingleImage(true);
    }

    removeEyebrow(){
        vmt_module._resetEyebrow();
        this.cycleForSingleImage(true);
    }

    /** EYESHADOW */

    applyEyeshadow(r, g, b, a, mask, shmr_mask=null, shmr_intensity=null){
        if(shmr_mask && shmr_intensity){
            let strPtr0 = _stringToHeap(mask);
            vmt_module._setEyeshadowShimmerEffect(strPtr0, shmr_intensity);
            _freeString(strPtr0);
        }
        let strPtr1 = _stringToHeap(mask);
        vmt_module._setEyeshadow(strPtr1, r, g, b, a);
        _freeString(strPtr1);
        this.cycleForSingleImage(true);
    }

    removeEyeshadow(){
        vmt_module._resetEyeshadow();
        this.cycleForSingleImage(true);
    }

    /** EYELASH */

    applyEyelash(r, g, b, a, mask){
        let strPtr = _stringToHeap(mask);
        vmt_module._setEyelash(strPtr, r, g, b, a);
        _freeString(strPtr);
        this.cycleForSingleImage(true);
    }

    removeEyelash(){
        vmt_module._resetEyelash();
        this.cycleForSingleImage(true);
    }

    /** EYELINER */

    applyEyeliner(r, g, b, a, mask){
        let strPtr = _stringToHeap(mask);
        vmt_module._setEyeliner(strPtr, r, g, b, a);
        _freeString(strPtr);
        this.cycleForSingleImage(true);
    }

    removeEyeliner(){
        vmt_module._resetEyeliner();
        this.cycleForSingleImage(true);
    }

}

if(!window.VmtHelper){
    window.VmtHelper = new VmtHelper();
}