class Notification {
    static permission = 'granted';
    static maxActions = 2;
    static name = 'Notification';
    constructor(title, options) {
        let packageSet = new Set();
        packageSet.add(title).add(options);
        let json_package = JSON.stringify([...packageSet]);
        CefSharp.PostMessage(json_package);
        //alert(title);
    }
    static requestPermission() {
        return new Promise((res, rej) => {
            res('granted');
        })
    }   
};
window.Notification = Notification;


var fakeWebRTC = window.RTCPeerConnection;


class RTCIceCandidate {
    constructor(data)
    {
        if(data)
        {
            for(const key in data)
            {
                this[key] = data[key];
            }
        }
    }
}
class RTCPeerConnectionIceEvent {
    constructor(data)
    {
        if(data)
        {
            for(const key in data)
            {
                this[key] = data[key];
            }
        }
    }
}

class RTCPeerConnection {
    constructor(servers, mediaConstraints)
    {
        let self = this;
        this.pc = new fakeWebRTC(servers, mediaConstraints);

        this.updateProperties();
        this.updateEvents();

        self.addEventListener("icegatheringstatechange", function(event)
        {
            let connection = event.target;
            self.updateProperties();
            switch(connection.iceGatheringState)
            {
                case "complete":
                    let sdp = null;
                    self.localDescription.sdp.split('\n').forEach(function(line)
                    {
                        if(line.indexOf('a=candidate:') === 0)
                        {
                            var ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
                            if(ip_regex.exec(line) && ip_regex.exec(line).length > 1)
                            {
                                let replace = line.split(' ');
                                replace[4] = yp_public;
                                line = replace.join(' ');
                            }
                        }
                        sdp += line + "\n";
                    });
                    self.localDescription.sdp = sdp;
                break;
            }
        });
    }

    updateProperties()
    {
        this.canTrickleIceCandidates = this.pc.canTrickleIceCandidates;
        this.connectionState = this.pc.connectionState;
        this.currentLocalDescription = this.pc.currentLocalDescription;
        this.currentRemoteDescription = this.pc.currentRemoteDescription;
        this.iceConnectionState = this.pc.iceConnectionState;
        this.iceGatheringState = this.pc.iceGatheringState;
        this.localDescription = this.pc.localDescription;
        this.pendingLocalDescription = this.pc.pendingLocalDescription;
        this.pendingRemoteDescription = this.pc.pendingRemoteDescription;
        this.remoteDescription = this.pc.remoteDescription;
        this.sctp = this.pc.sctp;
        this.signalingState = this.pc.signalingState;
    }

    updateEvents()
    {
        let self = this;
        //event
        this.pc.onaddstream = this.onaddstream;
        this.pc.onconnectionstatechange = this.onconnectionstatechange;
        this.pc.ondatachannel = this.ondatachannel;
        this.pc.onicecandidateerror = this.onicecandidateerror;
        this.pc.oniceconnectionstatechange = this.oniceconnectionstatechange;
        this.pc.onicegatheringstatechange = this.onicegatheringstatechange;
        this.pc.onnegotiationneeded = this.onnegotiationneeded;
        this.pc.onremovestream = this.onremovestream;
        this.pc.onsignalingstatechange = this.onsignalingstatechange;
        this.pc.ontrack = this.ontrack;

        if(this.onicecandidate && typeof this.onicecandidate == "function")
        {
            this.pc.addEventListener("icecandidate", function(event){
                
                if (event.candidate)
                {
                    event = new RTCPeerConnectionIceEvent(event);
                    let new_candidate = new RTCIceCandidate(event.candidate);
                    const parts = new_candidate.candidate.split(' ');

                    let replace_yp = parts[7] !== 'host' ? yp_public : yp_local;

                    new_candidate.address = replace_yp;
                    parts[4] = replace_yp;
                    new_candidate.candidate = parts.join(' ');
                    event.candidate = new_candidate;         
                }
                self.onicecandidate(event);
            });
        }
    }

    addEventListener(type, listeners = null, options = null)
    {
        this.pc.addEventListener(type, listeners, options);
    }
    dispatchEvent(event)
    {
        this.pc.dispatchEvent(event);
    }
    removeEventListener(type, listeners = null, options = null)
    {
        this.pc.removeEventListener(type, listeners, options);
    }

    createDataChannel(label, options = null)
    {
        this.updateEvents();
        let result = this.pc.createDataChannel(label, options);
        this.updateProperties();
        return result;
    }

    async addIceCandidate(candidate, successCallback = null, failureCallback = null)
    {
        let self = this;
        successCallback = successCallback || function(result){};
        failureCallback = failureCallback || function(result){};

        if(successCallback === null)
        {
            return new Promise(function(resolve, reject){
                self.pc.addIceCandidate(candidate, function(result){
                    self.updateProperties();
                    resolve(result);
                }, function(error){
                    self.updateProperties();
                    reject(error);
                }, options);
            });
        }

        return self.pc.addIceCandidate(candidate, function(result){
            self.updateProperties();
            successCallback(result);
        }, function(error){
            self.updateProperties();
            failureCallback(error);
        }, options);
    }

    async createOffer(successCallback = null, failureCallback = null, options = null)
    {
        this.updateEvents();
        let self = this;
        if(successCallback && failureCallback == null && options == null)
        {
            options = successCallback;
            successCallback = null;
            failureCallback = null;
        }

        if(successCallback === null)
        {
            return new Promise(function(resolve, reject){
                self.pc.createOffer(function(result){
                    self.updateProperties();
                    resolve(result);
                }, function(error){
                    self.updateProperties();
                    reject(error);
                }, options);
            });
        }

        successCallback = successCallback || function(result){};
        failureCallback = failureCallback || function(result){};


        return this.pc.createOffer(function(result){
            self.updateProperties();
            successCallback(result);
        }, function(error){
            self.updateProperties();
            failureCallback(error);
        }, options);
    }

    async createAnswer(successCallback = null, failureCallback = null, options = null)
    {
        this.updateEvents();
        let self = this;
        if(successCallback && failureCallback == null && options == null)
        {
            options = successCallback;
            successCallback = null;
            failureCallback = null;
        }

        if(successCallback === null)
        {
            return new Promise(function(resolve, reject){
                self.pc.createAnswer(function(result){
                    self.updateProperties();
                    resolve(result);
                }, function(error){
                    self.updateProperties();
                    reject(error);
                }, options);
            });
        }

        successCallback = successCallback || function(result){};
        failureCallback = failureCallback || function(result){};


        return this.pc.createAnswer(function(result){
            self.updateProperties();
            successCallback(result);
        }, function(error){
            self.updateProperties();
            failureCallback(error);
        }, options);
    }

    async setLocalDescription(sessionDescription, successCallback, errorCallback)
    {
        let self = this;
        successCallback = successCallback || function(success){};
        errorCallback = errorCallback || function(error){};

        return this.pc.setLocalDescription(sessionDescription, function(success){
            successCallback(success);
        }, function(error){
            errorCallback(error);
        });
    }

    close()
    {
        this.pc.close();
    }

};
    
window.RTCPeerConnection = RTCPeerConnection;
window.mozRTCPeerConnection = RTCPeerConnection;
window.webkitRTCPeerConnection = RTCPeerConnection;
window.msRTCPeerConnection = RTCPeerConnection;