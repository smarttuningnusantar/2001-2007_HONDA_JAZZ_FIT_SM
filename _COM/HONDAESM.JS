
function FSL(code, name)
{
  this.Code = code;
  this.Name = name;
}
function FDL(code,model,type)                                         
{                                                                     
  this.Code=code;                                                     
  this.Model=model;                                                   
  this.Type=type;                                                     
}                                                                     
function GetCookie(strName)
{
  var strCookie = document.cookie;
  var strKey, strVal;
  var n, nPos, nSta, nEnd;

  nPos = 0;
  while (nPos < strCookie.length) {
    while (nPos < strCookie.length) {
      if (strCookie.charAt(nPos) != " ") {
        break;
      }
      ++nPos;
    }
    if (nPos >= strCookie.length) {
      break;
    }

    nSta = strCookie.indexOf("=", nPos);
    if (nSta < 0) {
      break;
    }
    strKey = strCookie.substring(nPos, nSta);
    while (++nSta < strCookie.length) {
      if (strCookie.charAt(nPos) != " ") {
        break;
      }
    }
    if (nSta >= strCookie.length) {
      break;
    }
    nEnd = strCookie.indexOf(";", nSta);
    if (nEnd < 0) {
      strVal = strCookie.substring(nSta);
    }
    else {
      strVal = strCookie.substring(nSta, nEnd);
    }
    if (strName == strKey) {
      return(strVal);
    }
    if (nEnd < 0) {
      break;
    }
    nPos = nEnd + 1;
  }

  return("");
}
function SetCookie(strName, strVal, fTmp)
{
  var strBuf;
  var timLim= new Date;

  timLim.setYear(timLim.getYear() + 10);
  strBuf = strName + "=" + strVal + ";";
  if ((typeof(fTmp) == "undefined") || ! fTmp) {
    strBuf += "Expires=" + timLim.toGMTString() + ";";
  }
  document.cookie = strBuf;
}
function ChangeLang(fSub)
{
  var strLang, strPath;
  var wnd;

  
  if (gESM.subSel.length != 2) {                                    
    gESM.subSel = "00";                                             
  }

  
  // Validate language selection
  if (!gESM.Lng || gESM.Lng.length === 0) {
    console.warn("[ChangeLang] gESM.Lng is not initialized");
    return;
  }
  
  if (gESM.lngSel < 0 || gESM.lngSel >= gESM.Lng.length) {
    console.warn("[ChangeLang] Invalid language selection (lngSel=" + gESM.lngSel + "), defaulting to 0");
    gESM.lngSel = 0;
  }
  
  if (!gESM.Lng || gESM.Lng.length === 0) {
    console.error("[ChangeLang] Language array is empty");
    return;
  }
  
  strLang=gESM.Lng[gESM.lngSel].Code;

  if (fSub) {
    
    strPath = "../";
    wnd = parent;
  }
  else {
    strPath = "./";
    wnd = window;
  }
  
  // Validate wnd before using
  if (!wnd) {
    console.error("[ChangeLang] wnd is null or undefined");
    return;
  }
  
  if (typeof(wnd.SetCookie) === 'function') {
    wnd.SetCookie("EsmLang", strLang + gESM.mySel);
  }
  
  if (fSub) {
    // Only reload if wnd has location
    if (wnd && wnd.location && typeof(wnd.location.reload) === 'function') {
      wnd.location.reload();
    }
  }
  else { 
    try {
      if (wnd.F10) wnd.F10.location=strPath+strLang+"/html/ESMTITLE.HTML";
    } catch(e) { console.warn("Cannot set F10 location:", e.message); }
    try {
      if (wnd.F11) wnd.F11.location=strPath+strLang+"/html/ESMSELCT.HTML";
    } catch(e) { console.warn("Cannot set F11 location:", e.message); }
    try {
      if (wnd.F12) wnd.F12.location=strPath+strLang+"/html/ESMBLANK.HTML";
    } catch(e) { console.warn("Cannot set F12 location:", e.message); }
  }                                                                 
}

function ChangeModelYear(fSub)
{
  var strYear, strPath;
  var wnd;

  if(gESM.mySel >= 0) {
    strYear=gESM.ModelInfo[gESM.mySel].Year;

    if (fSub) {
      strPath = "../";
      wnd = parent;
    }
    else {
      strPath = "./";
      wnd = window;
    }
    wnd.SetCookie("EsmYear", strYear);
  }
}                                                                 

function ChangeModelCode(fSub)
{
  var strCode, strPath;
  var wnd;

  if(gESM.mySel >= 0 && gESM.mcSel >= 0) {
    strCode=gESM.ModelInfo[gESM.mySel].CodeList[gESM.mcSel].Code;

    if (fSub) {
      strPath = "../";
      wnd = parent;
    }
    else {
      strPath = "./";
      wnd = window;
    }
    wnd.SetCookie("EsmCode", strCode);                   
  }
}                                                                 

function ChangeModelType(fSub)
{
  var strPath;
  var wnd;

  if(gESM.mdlSel >= 0) {

    if (fSub) {
      strPath = "../";
      wnd = parent;
    }
    else {
      strPath = "./";
      wnd = window;
    }
    wnd.SetCookie("EsmType", gESM.manTyp);                   
  }
}                                                                 
function FS5(id,text)
{
  var data=new Array;
  data.id = id;
  data.Text = text;
  return(data);
}
function dbKeyToHtmlFile(path, dbKey)
{
  return(path + dbKey.substr(5,2) + "/" + dbKey + ".HTML");
}
function LoadStr(strID)
{
  var strBuf, strMsg;
  var nPos, nSta;
  var i;

  strBuf = null;
  for (i=0; i < gMSG.length; ++i) {
    if (gMSG[i].id == strID) {
      strBuf = gMSG[i].Text;
      break;
    }
  }
  if (strBuf == null) {
    alert("Undefined Message-ID:" + strID);
    return("");
  }

  strMsg = "";
  nSta = 0;
  nPos = strBuf.indexOf("\\", nSta);
  while (nPos >= 0) {
    strMsg += strBuf.substring(nSta, nPos);
    switch (strBuf.charAt(nPos+1)) {
      case 'b': strMsg += '\b'; break;
      case 'f': strMsg += '\f'; break;
      case 'n': strMsg += '\n'; break;
      case 'r': strMsg += '\r'; break;
      case 't': strMsg += '\t'; break;
      case '\'':strMsg += '\''; break;
      case '"': strMsg += '"';  break;
      case '\\':strMsg += '\\'; break;
      default:
        strMsg += strBuf.charAt(nPos+1);
        break;
    }
    nSta = nPos + 2;
    nPos = strBuf.indexOf("\\", nSta);
  }
  strMsg += strBuf.substr(nSta);

  return(strMsg);
}
function FormatStr(strID)
{
  var strMsg, strBuf;
  var nPos, nSta, arg;

  strBuf = LoadStr(strID);
  strMsg = "";
  nSta = 0;
  nPos = strBuf.indexOf("$", nSta);
  while (nPos >= 0) {
    strMsg += strBuf.substring(nSta, nPos);
    arg = strBuf.charAt(nPos+1);
    if (isFinite(arg)) {
      if (arg < FormatStr.arguments.length) {
        strMsg += FormatStr.arguments[arg];
      }
      else {
        alert("FormatStr: Undefined argument '" + strBuf.substr(nPos, 2) + "'(at " + (nPos + 1) + "):");
        break;
      }
    }
    else {
      strMsg += arg;
    }
    nSta = nPos + 2;
    nPos = strBuf.indexOf("$", nSta);
  }
  strMsg += strBuf.substr(nSta);

  return(strMsg);
}
