function Com_Zimbra_Url() {
}

Com_cmaginet_phishing.prototype = new ZmZimletBase();
Com_cmaginet_phishing.prototype.constructor = com_cmaginet_phishing_handler;

Com_cmaginet_phishing.prototype.init =
function() {
  this._disablePreview = this.getBoolConfig("disablePreview",true);

  Com_cmaginet_phishing.REGEXES = [];
  //populate regular expressions
  var s = this.getConfig("ZIMLET_CONFIG_REGEX_VALUE");

  if(s){
    var r = new RegExp(s,"gi");
    if(r)
    Com_cmaginet_phishing.REGEXES.push(r);
  }

  if (/^\s*true\s*$/i.test(this.getConfig("supportUNC"))) {
    s = this.getConfig("ZIMLET_UNC_REGEX_VALUE");
    var r = new RegExp(s,"gi");
    if(r)
    Com_cmaginet_phishing.REGEXES.push(r);
  }
}

Com_cmaginet_phishing.IGNORE = AjxUtil.arrayAsHash([".", ",", ";", "!", "*", ":", "?", ")", "]", "}"]);

Com_cmaginet_phishing.prototype.match =
function(line, startIndex) {
  for (var i = 0; i < Com_cmaginet_phishing.REGEXES.length; i++) {

    var re = Com_cmaginet_phishing.REGEXES[i];
    re.lastIndex = startIndex;
    var m = re.exec(line);
    if (!m) { continue; }

    var url = m[0];
    var last = url.charAt(url.length - 1);
    while (url.length && Com_cmaginet_phishing.IGNORE[last]) {
      url = url.substring(0, url.length - 1);
      last = url.charAt(url.length - 1);
    }
    m[0] = url;
    return m;
  }
};

Com_cmaginet_phishing.prototype._getHtmlContent =
function(html, idx, obj, context) {

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
  console.log('Cmaginetttttttttttttttttttttt');
  html[idx++] = link;
  html[idx++] = "'>";
  html[idx++] = AjxStringUtil.htmlEncode(obj);
  html[idx++] = "Ecaudor";
  html[idx++] = "</a>";
  return idx;
};
