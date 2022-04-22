// identifies user agent / operating system / device

window.UserAgentInfo = {};

window.UserAgentInfo.osname="unknown";
if (navigator.appVersion.indexOf("Win")!=-1) window.UserAgentInfo.osname="windows";
if (navigator.appVersion.indexOf("Mac")!=-1) window.UserAgentInfo.osname="macos";
if (navigator.appVersion.indexOf("X11")!=-1) window.UserAgentInfo.osname="unix";
if (navigator.appVersion.indexOf("Linux")!=-1) window.UserAgentInfo.osname="linux";

window.UserAgentInfo.userAgent = (function () {
    var ua = navigator.userAgent,
        tem,
        M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE ' + (tem[1] || '');
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
        if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
    return M.join(' ');
})();

window.UserAgentInfo.platform = navigator.platform.toLowerCase()
