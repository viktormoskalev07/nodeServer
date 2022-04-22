class CameraController {

    constructor(){
        this.video_elm = document.createElement("video");
        console.debug("video element created");
    }
    
    start(){
        var self = this;
        self.media_stream = window.navigator.mediaDevices.getUserMedia({
            audio: false,
            video: true
        });

        self.media_stream
        .then((stream)=>{
            
            if (window.UserAgentInfo.userAgent.toLowerCase().indexOf("safari") != -1){
                //is safari
                self.video_elm.setAttribute("webkit-playsinline", "webkit-playsinline");
                self.video_elm.setAttribute("playsinline", "true");
            }

            self.stream = stream;
            self.video_elm.srcObject = self.stream;
            self.video_elm.onplay = () => {
                self.interval = setInterval(()=>{
                    if(self.video_elm.videoHeight > 0 && self.video_elm.videoWidth > 0){
                        console.log("camera is ready")
                        document.dispatchEvent(new CustomEvent("camera_is_ready"));
                        clearInterval(self.interval);
                        self.render();
                    }
                },20);
            }
            self.video_elm.play();
        })
        .catch((err)=>{
            console.log("error occurred while starting video.", err)
        });
    }

    play(){
        this.video_elm.play();
        console.log("video is playing");
    }

    pause(){
        this.video_elm.pause();
        console.log("video is paused");
    }

    stop(){
        this.video_elm.pause();
        this.video_elm.src = "";
        if(this.stream) this.stream.getVideoTracks()[0].stop();
        console.log("camera is stopped");
    }

    streamToCanvasId(canvas_id){
        try{
            this.canvas_elm = document.getElementById(canvas_id);
            this.canvas_ctx = this.canvas_elm.getContext("2d");
            console.debug("canvas registered");
        }
        catch(err){
            console.error("no such canvas found");
        }
    }

    render(){
        let self = this;
        if(self.canvas_ctx && self.video_elm && !self.video_elm.paused && !self.video_elm.ended){

                const streemWidth =self.video_elm.videoWidth;
                const streemHeight =self.video_elm.videoHeight;
                const h = window.innerHeight-200;
            const width = h/streemHeight*streemWidth    ;
            const  height=  h  ;
            self.canvas_elm.width = width;
            self.canvas_elm.height = height;
            self.canvas_ctx.translate(width, 0);
            self.canvas_ctx.scale(-1, 1);
            self.canvas_ctx.drawImage(self.video_elm,  Math.round(  width*(1-window.beautyScale)/2 ), 0, Math.round(  width*window.beautyScale ),  Math.round(  height*window.beautyScale ));
            if(self.callback && width > 0 && height > 0) self.callback();
            requestAnimationFrame(self.render.bind(self))
        }
    }

    onEachFrame(cb){
        this.callback = cb;
    }

}

if(window.CameraController === undefined) {
    window.CameraController = new CameraController();
}