function com_cmaginet_phishing_Handler() {
}

com_cmaginet_phishing_Handler.prototype = new ZmZimletBase();
com_cmaginet_phishing_Handler.prototype.constructor = com_cmaginet_phishing_Handler;

com_cmaginet_phishing_Handler.prototype.init =
function() {
  this._disablePreview = this.getBoolConfig("disablePreview",true);

  com_cmaginet_phishing_Handler.REGEXES = [];
  //populate regular expressions
  var s = this.getConfig("ZIMLET_CONFIG_REGEX_VALUE");

  if(s){
    var r = new RegExp(s,"gi");
    if(r)
      com_cmaginet_phishing_Handler.REGEXES.push(r);
  }

  if (/^\s*true\s*$/i.test(this.getConfig("supportUNC"))) {
    s = this.getConfig("ZIMLET_UNC_REGEX_VALUE");
    var r = new RegExp(s,"gi");
    if(r)
    com_cmaginet_phishing_Handler.REGEXES.push(r);
  }

  console.log('Cmaginetttttttttttttttttttttt Inicio');
  console.log('s', s);
}

com_cmaginet_phishing_Handler.IGNORE = AjxUtil.arrayAsHash([".", ",", ";", "!", "*", ":", "?", ")", "]", "}"]);

com_cmaginet_phishing_Handler.prototype.match =
function(line, startIndex) {
  for (var i = 0; i < com_cmaginet_phishing_Handler.REGEXES.length; i++) {

    var re = com_cmaginet_phishing_Handler.REGEXES[i];
    re.lastIndex = startIndex;
    var m = re.exec(line);
    if (!m) { continue; }

    var url = m[0];
    var last = url.charAt(url.length - 1);
    while (url.length && com_cmaginet_phishing_Handler.IGNORE[last]) {
      url = url.substring(0, url.length - 1);
      last = url.charAt(url.length - 1);
    }
    m[0] = url;
    return m;
  }
};

com_cmaginet_phishing_Handler.prototype._getHtmlContent =
function(html, idx, obj, context) {
  console.log('Cmaginetttttttttttttttttttttt');
  console.log(html, idx, obj, context);

  var escapedUrl = obj.replace(/\"/g, '\"').replace(/^\s+|\s+$/g, "");
  if (escapedUrl.substr(0, 4) == 'www.') {
    escapedUrl = "http://" + escapedUrl;
  }
  if (escapedUrl.indexOf("\\\\") == 0) {
    obj.isUNC = true;
    escapedUrl = "file://" + escapedUrl;
  }
  escapedUrl = escapedUrl.replace(/\\/g, '/');

  var link = "<a target='_blank' href='" + escapedUrl; // Default link to use when ?app= fails

  if (escapedUrl.split(/[\?#]/)[0] == ("" + window.location).split(/[\?#]/)[0]) {
    var paramStr = escapedUrl.substr(escapedUrl.indexOf("?"));
    if (paramStr) {
      var params = AjxStringUtil.parseQueryString(escapedUrl);
      if (params) {
        var app = params.app;
        if (app && app.length > 0) {
          app = app.toUpperCase();
          if (appCtxt.getApp(ZmApp[app])) {
            link = "<a href='javascript:top.appCtxt.getAppController().activateApp(top.ZmApp." + app + ", null, null);";
          }
        }
      }
    }
  }
  html[0] = '<div>HOLA MUNDO</div>'
  html[idx++] = link;
  html[idx++] = "'>";
  html[idx++] = AjxStringUtil.htmlEncode(obj);
  html[idx++] = "Ecuaudor";
  html[idx++] = "</a>";
  return idx;
};

com_cmaginet_phishing_Handler.prototype.clicked = function(){
  var tooltip = DwtShell.getShell(window).getToolTip();
  if (tooltip) {
    tooltip.popdown();
  }
  return true;
};

com_cmaginet_phishing_Handler.prototype.toolTipPoppedUp =
function(spanElement, obj, context, canvas) {

  var url = obj.replace(/^\s+|\s+$/g, "");
  if (/^\s*true\s*$/i.test(this.getConfig("stripUrls"))) {
    url = url.replace(/[?#].*$/, "");
  }
  if (url.indexOf("\\\\") == 0) {
    url = "file:" + url;
  }
  url = url.replace(/\\/g, '/');

  if (this._disablePreview || url.indexOf("file://") == 0) {  // local files
    this._showUrlThumbnail(url, canvas);
  } else {
    // Pre-load placeholder image
    (new Image()).src = this.getResource('blank_pixel.gif');
    this._showFreeThumbnail(url, canvas);
  }
};

com_cmaginet_phishing_Handler.prototype._showUrlThumbnail = function(url, canvas){
  canvas.innerHTML = "<b>ECUADOR URL:</b> " + AjxStringUtil.htmlEncode(decodeURI(url));
};
