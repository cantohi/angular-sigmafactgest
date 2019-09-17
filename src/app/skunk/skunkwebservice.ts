

export default function skunkwebservice(name) {  
  return new skunk.webService(name)
}
export  function skunklogin(app,usr,pwd,f) {  
  return skunk.login(app,usr,pwd,f)
}
let skunk={}

// !!!!!!!!!!!!!!!!!!!!!
skunk.utils={}
skunk.utils.removeClass=function(){}  //!!!
skunk.utils.getElement=function(){return {}} //!!!

// vezi XXX111 - comentat - ds suplimentar pe login
/// vezi xxx222  - loading panel return
// !!!!!!!

skunk.webService = function (name) {
    var selfthis = this;
    if (!(this instanceof skunk.webService)) return new skunk.webService(name);
    if(!name)name = "/skunkCS/skunk"
    name = "http://localhost:64708/skunkCS/skunk"
    this.name = name; // numele webserivce-ului

    /**
     * Apeleaza o functie a webserviceului
     * identificarea url-ului se face prin conventie(?) pe baza numelui setat in constructor in acelasi domeniu de unde s-a incarcat html-ul
     * @param {string} func - functia care e apelata
     * @param {string} param - parametrii functiei.
     * @returns {string | null} 
     */
    this.call = function (func, param) {
        while (true) {
            var params = JSON.stringify(param);
            var xr = new XMLHttpRequest();
            xr.open("POST", this.name + ".svc/" + func, false);
            xr.setRequestHeader("Content-type", "application/json; charset=utf-8");

            //@Alex - Chrome-ul le pune automat
            //xr.setRequestHeader("Content-length", params.length); 
            //xr.setRequestHeader("Connection", "close");

            xr.send(params);

            var r = ""; // pentru ca daca nu vine nimic nu poate sa-l evalueze pe r
            try {              
                eval("r=" + xr.responseText);               
            }
            catch (ex) {
                alert(xr.responseText, "Eroare comunicare");
                return null;
            }

            if (!r) throw "Eroare comunicare";

            if (r.Eroare) {
                alert(r.Eroare);
                return null;
            }
            return r;
        }
    }

    this.asyncCall = function (func, param, callback, extra) {
        /* extra={
            oneTryOnly:true,   // in caz de eroare (de retea) se opreste 
            noLoadingPanel:true  // nu mai arata loading panelul
        }*/
        //show loading
        if (!extra) extra = {}
        var selfthis = this;
        if (!skunk.webService.aliveApp)  return;        

        if (!extra.noLoadingPanel)
            setTimeout(function () { loadingPanel(true) }, 10);
        param.token = skunk.webService.token;

        var params = JSON.stringify(param);
        var xr = new XMLHttpRequest();
           
        xr.onreadystatechange = function () {
            /* https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
             readyState
             Value	State	Description
                0	UNSENT	Client has been created. open() not called yet.
                1	OPENED	open() has been called.
                2	HEADERS_RECEIVED	send() has been called, and headers and status are available.
                3	LOADING	Downloading; responseText holds partial data.
                4	DONE	The operation is complete.
            --------------------------------------------
               status
               Before the request is complete, the value of status will be 0. It is worth noting that browsers report a status of 0 in case of XMLHttpRequest errors too.
               200 OK
            */

            if (xr.readyState != 4) return;
            if (!skunk.webService.aliveApp) {  // butonul rosu a fost apasat
                if (!extra.noLoadingPanel)
                    setTimeout(function () { loadingPanel(false) }, 10);
                return;
            }
            
            // Pentru ca daca nu vine nimic nu poate sa-l evalueze pe r
            var r = ""; 
            try {              
                if (xr.responseText) eval("r=" + xr.responseText);                
            }
            catch (ex) {                
                r = null
            }

         
            if (!r || xr.status != "200") {
                skunk.utils.removeClass(skunk.webService.loadingDiv.errDiv, "skunk-hidden");                               
                setTimeout(function () {
                    if (!extra.oneTryOnly)
                        selfthis.asyncCall(func, param, callback,extra);
                    if (!extra.noLoadingPanel)
                        setTimeout(function () { loadingPanel(false) }, 10);
                }, 1000);
                return;
            }

            if (callback) callback(r);
            if (!extra.noLoadingPanel)
                setTimeout(function () { loadingPanel(false) }, 10);
        }

        xr.open("POST", this.name + ".svc/" + func+"T", true);
       //xr.setRequestHeader("Content-type", "application/json; charset=utf-8");
      //xr.setRequestHeader("Content-type", "text/plain; charset=utf-8");
     
        xr.send(params);
            
    } 

    function loadingPanel(show) {
      skunk.webService.loadingDiv={}  // !!! in plus
      skunk.webService.loadingDiv.errDiv={}  // !!! in plus
      ///xxx222
      return
       // console.log("loadingPanel(" + show + ");");
        //!!!!! atentie : eswte posibil ca ordinea sa se schime daca e afisat un alert; in  acest caz trebuie tratate altfel
        show = show || false;
        if (show) {
            if (!skunk.webService.aliveApp) return;
             skunk.webService.loadingPanelNr++
            // console.log("+" + skunk.webService.loadingPanelNr);
            //2016.06.01 - se pare ca daca se incarca un template direct in body se poate intampla sa nu mai existe fer. asteptare, 
            //deci verificam existenta ei si nu daca suntem la pasul 2,3 etc

            //if (skunk.webService.loadingPanelNr > 1) return;                       
            if (skunk.webService.loadingDiv && skunk.webService.loadingDiv.parentElement == document.body) return;

            skunk.webService.loadingDiv = document.createElement('div');
            
            skunk.webService.loadingDiv.errDiv = document.createElement('div');
            //!! skunk.utils inca nu e incarcat
            //skunk.utils.addClass(skunk.webService.loadingDiv.errDiv, "skunk-hidden");
            skunk.webService.loadingDiv.errDiv.className = "skunk-hidden"
            skunk.webService.loadingDiv.errDiv.innerHTML = "<div style='position: absolute; left: 50%; margin-left: -125px; top: 25%; width: 250px;  background:white; padding:20px;' ><div style='text-align:center;opacity:1'>Probleme de comunicare. Se incearca reluarea conexiunii! </div><div style='text-align:center;'><button data-name='btn-stop' style='border: 0; border-radius: 4px; background: #a02f42;color:#ffffff;  margin-top:20px;'> Opreste reconectarea </button></div></div>";
            
            skunk.utils.getElement(skunk.webService.loadingDiv.errDiv, "btn-stop").onclick = function () {
                skunk.webService.aliveApp = false;
                document.body.innerHTML = "<div style='position: absolute; left: 50%; top: 50%; margin-top:-150px; margin-left:-200px;background:white; border-radius:4px; padding:30px; width:400px; text-align:center;'> Aplicatia a fost oprita din motive tehnice. Verificati conexiunea la retea! <br/><button style='border: 0; border-radius: 4px; background: #a02f42;color:#ffffff;  margin-top:20px;' onclick='location.reload()'> Reporneste aplicatie</button> </div>";
            }
            skunk.webService.loadingDiv.appendChild(skunk.webService.loadingDiv.errDiv);

            var customInnerDiv = document.createElement('div');
            //*****************************
            //Main Loading overlay            
            skunk.webService.loadingDiv.className = "skunk-loadingPanel";
            setTimeout(function () { skunk.webService.loadingDiv.className = "skunk-loadingPanel skunk-loadingPanel-gray"; }, 10)

            //*****************************
            //Custeom inner loading DIV
            customInnerDiv.style.cssText = 'position:absolute; left:50%; margin-left:-25px; top:50%; margin-top:-25px; width:50px; height:50px; ';
            customInnerDiv.innerHTML = '<div style="position: absolute; left: 50%; top: 50%; margin-top:-16px; margin-left:-16px;">  <div class="skunk-inner-loading">   <div class="skunk-inner-cube1"></div>   <div class="skunk-inner-cube2"></div>        </div>    </div>';

            ///!!!!! Test loader softeh!!!
            /*
            skunk.webService.loadingDiv.className = "skunk-loadingPanelxx";
            setTimeout(function () { skunk.webService.loadingDiv.className = "xx"; }, 20)
            customInnerDiv.innerHTML = '<div style="position: absolute; left: 50%; top: 50%; margin-top:-60px; margin-left:-120px;">  <div class="skunk-inner-loadingaaa">  <img  class="aaaaa" src="template2/img/loader.gif"/>  </div>';
            */

            //customInnerDiv.innerHTML = '<div style="position: absolute; left: 50%; top: 50%; margin-top:-16px; margin-left:-16px;">  <div class="skunk-inner-loading"> <img  class="logorot" src="../../ExBuget/template/css/Logo%20loading.png" />  </div>    </div>'
            //customInnerDiv.innerHTML = "<span style='color:red'>" + skunk.webService.loadingPanelNr.toString() + "</span>";

            skunk.webService.loadingDiv.appendChild(customInnerDiv);
            if (document.body)// sunt cazuri in care se apeleaza WS-ul fara ca body-ul sa fie incarcat- templateul de msgbox si de dilog
                document.body.appendChild(skunk.webService.loadingDiv);
            //document.body.insertBefore(loadingDiv, document.body.firstChild);


            //DEBUG
            //console.log("Loading ONNNN");
        }
        else {
            skunk.webService.loadingPanelNr--;
          //  console.log("-" + skunk.webService.loadingPanelNr);
            if (skunk.webService.loadingPanelNr > 0) return;
            
            if (skunk.webService.loadingDiv && skunk.webService.loadingDiv.parentElement) {  // trebuie skunk.webService.loadingDiv.parentElement pentru ca e posibil sa schimb parintele cu totul=> deci dispare
                //loadP.removeNode(true);
                skunk.webService.loadingDiv.parentElement.removeChild(skunk.webService.loadingDiv);
            }// else console.log("DEBUG: No 'loadingPanelMain' found.");


            //DEBUG
            //console.log("Loading OFFFFFF");
        } 
    }


    this.getFile = function (filename, callback, okfail) {
        var selfthis = this;
        if (!skunk.webService.aliveApp) return;       
        try {

            setTimeout(function () { loadingPanel(true) }, 10);
            var xr = new XMLHttpRequest();
            xr.onreadystatechange = function () {
                //if (!(xr.readyState == 4 && xr.status == 200)) return;                
                if (xr.readyState != 4) return;

                if (!skunk.webService.aliveApp) {
                    setTimeout(function () { loadingPanel(false) }, 10);
                    return;
                }

                if (xr.status != 200) { 
                    if (okfail) {
                        setTimeout(function () { loadingPanel(false) }, 10);
                        if (callback) callback("");
                        return "";
                    }
                    skunk.utils.removeClass(skunk.webService.loadingDiv.errDiv, "skunk-hidden");                
                 
                    setTimeout(function () {                        
                        selfthis.getFile(filename, callback, okfail);
                        setTimeout(function () { loadingPanel(false) }, 10);
                    }, 1000);
                    
                    return;
                }

                if (callback) callback(xr.responseText);
                setTimeout(function () { loadingPanel(false) }, 10);
            }


            xr.open("GET", filename + "?request" + Math.random() + Date(), true);
            xr.send();
            return "";//xr.responseText;
        }
        catch (err) { // ERORI GRAVE - teoretic nu ar trebui sa apara
            if (!okfail && confirm("A aparut o eroare la comunicarea cu serverul (0). Doriti detalii ?") == true) {
                alert(err);
            }
        }
        return "";
    }
    var bodyContent = function (str) {
        var ret = str.substr(str.indexOf("<body") + 5);
        ret = ret.substr(ret.indexOf(">") + 1);
        ret = ret.substr(0, ret.indexOf("</body>"));
        ret = ret.replace(/\r\n/g, "");  // altfel pune un spatiu intre input-uri              
        return ret;
    }
 
    this.loadTemplate = function (container, filename, callback, okfail) {
       
        if (window.gDebugChangeTemplateDir)
            filename = filename.toLowerCase().replace("template", window.gDebugChangeTemplateDir);

            var str = this.getFile(filename, function (str) {
             
                if (container) container.innerHTML = bodyContent(str);
                if (callback) callback(bodyContent(str));
            },okfail)
     
    }


}
skunk.webService.aliveApp = true;
skunk.webService.loadingPanelNr = 0
skunk.webService.token = null;
skunk.webService.disconected = false;
skunk.webService.login = function (s, u, p, f) {
    ///<param name='f' type='function'> callback cu parametri : ok,dsVerifyLogin, errorCode, errorMessage  </param>    
    var ws = new skunk.webService("");    
    ws.asyncCall("login", { application: s, user: u, password: p }, function (r) {
        skunk.webService.token = null;
        if (r &&r.token) 
            skunk.webService.token = r.token;
        if (r.errorCode) {
           if (f) f(false, null,r.errorCode,r.errorMessage);
            return;
        }   
        f(true)     // in plus xxx111
        /*  XXX111
        var dsVerifyLogin = skunk.storage("login");
        dsVerifyLogin.retrieve(u,p);
        dsVerifyLogin.onretrieveend = function () {
            if (u == null) dsVerifyLogin.insertRow();
            if (f) f(true, dsVerifyLogin);
        }
        */
    });
}
skunk.login = skunk.webService.login;

skunk.webService.logout = function (f) {

    var ws = new skunk.webService("");
    ws.asyncCall("logout", { token: skunk.webService.token }, function (r) {
        skunk.webService.token = null;
        if (f) f();   
    });
}
skunk.logout = skunk.webService.logout;

skunk.webService.sendMail = function (to, subj, msg, a1, a2) {
    var ws = new skunk.webService("");
    var callback,
        msgText = null,
        msgIsHtml = false,
        fromMail = null,
        fromName = null;
    if (typeof msg === "object") {
        if (msg.text) msgText = msg.text;
        if (msg.isHtml) msgIsHtml = msg.isHtml;
    } else {
        msgText = msg;
    }
    if (a1) {
        if (typeof a1 === "string") {
            fromMail = a1;
        } if (typeof a1 === "object") {
            if (a1.mail) fromMail = a1.mail;
            if (a1.name) fromName = a1.name;
        } if (typeof a1 === "function") {
            callback = a1;
        }
    }
    if (a2 && typeof a2 === "function") {
        callback = a2;
    }
    ws.asyncCall("sendMail", { from: fromMail, fromName: fromName, to: to, subject: subj, body: msgText, isBodyHtml: msgIsHtml }, function (r) {
        if (callback) callback(r);
    });
}
skunk.sendMail = skunk.webService.sendMail;

/*
var cacheFile = function () {
    this.name = null;
    this.bytes = null;
}

var Cacheing = function(){
    var selfthis = this;
    this._files = [];

    this.fileExist = function( findFile ) {
        for (var i=0; i< this._files.length;  i++){
            if ( findFile ==  this._files[i].name)
            return true;
        }
        return false;
    }

    this.fileIndex = function (findFile) {
        for (var i = 0; i < this._files.length; i++) {
            if (findFile == this._files[i].name);
            return i;
        }
        return -1;
    }

    this.addFile = function( filepath , filebyes ) {
        var selfthis = this;
        if (!filepath || this.fileExist(filepath)) return;
        var f = new cacheFile();
        f.name = filepath;

        if (!filebyes) {
            var str = skunk.webService().getFile(filepath, function (str) {
                f.bytes = str;
            });
        }
        else {
            f.bytes = filebyes;
        }

        this._files.push(f);
    }

    this.getFile = function (filepath) {
        var index = this.fileIndex(filepath);
        if ( index >= 0) {
            return this._files[index].bytes;
        }
    }

}

skunk.cache = new Cacheing();
*/