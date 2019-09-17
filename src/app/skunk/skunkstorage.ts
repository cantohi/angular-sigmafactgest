import skunkwebservice from './skunkwebservice'
import skunkskdate from './skunkskdate'
import  msg from '../msg';

export default function skunkstorage() {  
  return new skunk.storage();
}
//!!!!
function MessageBox(m){
//  alert(m)
  msg(m)
}

let skunk={}
skunk.webService=skunkwebservice;
skunk.SKDate=skunkskdate;
/// <reference path="utils.js" />

skunk.storageData = function () {
    if (!(this instanceof skunk.storageData)) {
        return new skunk.storageData();
    }
    this.tbl = "";
    this.pk = "";
    this.pkindex = null;
    this.cols = [];
    this.rows = [];
};
function row() {
    this.val = [];
    this.originalVal = [];
    this.rowid = null;
    this.colStatus = [];
    this.status = "";
}
function col() {
    this.name = "";
    this.size = "";
    this.type = "";
    this.isautoincrement = "";
    this.basetable = "";
    this.isunique = "";
    this.allowdbnull = "";
    this.dropDown = null;
}



//!! cand fac retrieve pe un storagederivat - fie el chiar displayStoarege - nu se populeaza si view-ul storageului de baza -- dar nu stiu daca asta e o problema in sine
// !!! mai mult - contine un rand care e chiar invalid !!!!

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//  FOARTE IMPORTANT - la derivare - se intampla urmatorul fenomen : sa zicem ca am c si p ( p derivat din c)
//  daca scriu intr-o functie de pe parinte care e apelata pe copil
//  this.variabila=valoare   =>  IN PARINTE NU SE VEDE  adica p.variabila - nu are valoare
//  daca scriu 
//  selfthis.variabila=valoare   => se vede si in copil si in parinete adica p.variabila a aceeasi cu c.variabila
//  asta din cauza ca selfthis se va refera la obiectul care a creat functia - adica ala initialul
// DECI: pentru variabile share-uite : se foloseste selfthis;
// pentru variabile unice : se foloseste this (cum ar fi pentru view)
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

skunk.storage = function (astorage) {

    if (astorage instanceof skunk.storage) {
        var storagex = Object.create(astorage);
        storagex.setViewRoot();
        storagex.initMemberVar();
        return storagex;
    }
    if (!(this instanceof skunk.storage)) {
        return new skunk.storage(astorage);
    }
    this.view = null;
    this.afisCol = []; // vector de perechi { col: column_name, label: label }
    this.initMemberVar();
    this.storageData = skunk.storageData();
    this.tbl = this.storageData.tbl;
    Object.defineProperty(this, "length", { get: function () { return selfthis.storageData.rows.length; } });
    Object.defineProperty(this, "cols", { get: function () { return selfthis.storageData.cols; } });

    var selfthis = this;
    var sqlCode = "";
    var getSet;
    var registeredObj = [];
    var dropDownList = [];
    var permitedColTypes=['integer','string','number','decimal','date','time','datetime']
    function DropDown() {
        this.colName = "";
        this.storage = null;
    };

    function GetSet() {
        //var selfrow=this;
        this.idx;
        this.defProp = function (nume, c) {
            Object.defineProperty(this, nume, {
                get: function () { return this.getItem(c); },
                set: function (v) { this.setItem(c, v); }
            });
        };
        this.getItem = function (c) {
            if (typeof c == "string") return selfthis.storageData.rows[this.idx].val[selfthis.getColumnIndex(c)];
            return selfthis.storageData.rows[this.idx].val[c];
        };
       
        this.getItemDisplay = function (c) {
            if (typeof c == "string") c = selfthis.getColumnIndex(c);
            var v = selfthis.storageData.rows[this.idx].val[c];
            if (v === null) return "";
            
            if (selfthis.storageData.cols[c].dropDown && selfthis.storageData.cols[c].dropDown.storageData && selfthis.storageData.cols[c].dropDown.storageData.cols) {
                for (var i = 0; i < selfthis.storageData.cols[c].dropDown.length; i++) {
                    //trebuie sa vad cum determin datacolumn-ul
                    if (v == selfthis.storageData.cols[c].dropDown[i].getItem(0)) {
                        v = selfthis.storageData.cols[c].dropDown[i].getItem(1);
                        break;
                    }
                }
            } else
                switch (selfthis.storageData.cols[c].type) {
                    case 'integer':
                        // if (v && (isNaN(v) || parseInt(v, 10) != v)) error = true;

                        break;
                    case 'string':
                        // if (selfthis.storageData.cols[c].size && v && (v.length > selfthis.storageData.cols[c].size)) error = true;
                        break;
                    case 'datetime':
                        //var padLeft = skunk.utils.padLeft;
                        //v= padLeft(v.getUTCDate(), "0", 2) + "." + padLeft(1 + v.getUTCMonth(), "0", 2) + "." + v.getUTCFullYear() +
                        //         " " + padLeft(v.getUTCHours(), "0", 2) + ":" + padLeft(v.getUTCMinutes(), "0", 2) + ":" + padLeft(v.getUTCSeconds(), "0", 2) + ":" + padLeft(v.getUTCMilliseconds(), "0", 3);

                        break;
                    case 'decimal':
                        // if (v && (isNaN(v) || Number(v).toFixed(selfthis.storageData.cols[c].size) != parseFloat(v))) error = true;
                        //v = v.toLocaleString(undefined, { minimumFractionDigits: selfthis.storageData.cols[c].size });
                        // v = v.toLocaleString(undefined, { maximumFractionDigits:20 });
                        v = this.numberToString(v);
                       
                        break;
                    case 'number':
                        // if (v && (isNaN(v) || parseInt(v, 10) != v)) error = true;
                        //v = v.toLocaleString(undefined, { maximumFractionDigits: 20 });
                        v = this.numberToString(v);
                        break;
                    case 'date':
                        break;
                    case 'time':
                        break;
                    default:
                        break;
                }

            return v.toString();
        };

        //!!!!! Edge/ie11  cand se apeleaza tolocalestring=> se apeleaza automat fucntia:  resolveLocaleBestFit care sta mult ( 1 sec la 10000 apeluri)
        // trebuie facuta functia urmatoare si folosita si testata ( nu merge reverse acum)
        var sz = (1000).toLocaleString();
        if (sz.length == 4)
            sz = "";
        else
            sz = sz.substr(1, 1);
        var sv = (2 / 10).toLocaleString().substr(1, 1)        
        
        this.numberToString = function (n) {
            //Edge/ie11  cand se apeleaza tolocalestring=> se apeleaza automat fucntia:  resolveLocaleBestFit care sta mult ( 1 sec la 10000 apeluri)
            if(n===null) return "";
            n = n.toString();
            var zz = "";
            var nn = n;
            if (nn.indexOf( ".") > 0) {
                zz = nn.substr(nn.indexOf(".") + 1)
                nn = nn.substr(0, nn.indexOf("."))
            }          
            var nn2 = "";
            for (var i = nn.length - 1,j=0; i >= 0; i--,j++)
            {
                nn2 = nn.substr(i, 1)+nn2;
                if (j % 3 == 2&&i>0) nn2=sz+nn2;
            }
            /*while (nn != "") {
                nn2 += nn.substr(0, 3) + sz;
                nn = nn.substr(3);
            }*/
            if (zz) nn2 += sv + zz;
            return nn2;
        }
       

        this.getItemOriginal = function (c) {
            if (typeof c == "string") return selfthis.storageData.rows[this.idx].originalVal[selfthis.getColumnIndex(c)];
            return selfthis.storageData.rows[this.idx].originalVal[c];
        };
        this._msgAfisErrVal = 0
        this.setItem = function (c, v) {
            var refresh = function () {
                selfthis.refreshObjects(this, selfthis.storageData.cols[c].name, true);
            };

            if (typeof c == "string") c = selfthis.getColumnIndex(c);
            if (c < 0 || c >= selfthis.storageData.cols.length) return;

            if (v === undefined) {
                MessageBox("Valoare incorecta pentru camp", "Ok!", function (response) { refresh.call(this); })
                return;
            }

            var error = false;
            var errorText = "Valoare incorecta!";
            if (v && selfthis.storageData.cols[c].dropDown && selfthis.storageData.cols[c].dropDown.storageData && selfthis.storageData.cols[c].dropDown.storageData.cols) {
                error = true;
                for (var i = 0; i < selfthis.storageData.cols[c].dropDown.length; i++) {
                    if (v == selfthis.storageData.cols[c].dropDown[i].getItem(0)) {
                        error = false;
                        break;
                    }
                }
            }
            switch (selfthis.storageData.cols[c].type) {
                case 'integer':
                    if (v && (isNaN(v) || parseInt(v, 10) != v)) error = true;
                    else if (v) v = parseInt(v, 10)
                    break;
                case 'string':
                    if (selfthis.storageData.cols[c].size && v && (v.length > selfthis.storageData.cols[c].size)) {
                        errorText = 'Dimensiunea maxima a campului este de: ' + selfthis.storageData.cols[c].size;
                        error = true;
                    }
                    break;
                case 'datetime':
                    if (!v) v = null;
                    //if (v&& !(v instanceof Date)) error = true;
                    /* 2016.06.21 - trecut pe setitemdisplay
                    if (v && (new Date(v.substr(6, 4) + "-" + v.substr(3, 2) + "-" + v.substr(0, 2)) == "Invalid Date" || (v.substr(11) && !(new RegExp("^(([0-1]?[0-9])|([2][0-3])):([0-5]?[0-9])(:([0-5]?[0-9]))?$").test(v.substr(11)))))) error = true;
                    if (v && !error) {
                        var d= skunk.storage.stringAsDate(v)
                        if (!v) error = true;
                        else   v=d;
                    }
                    */

                    break;
                case 'number':
                case 'decimal':                   
                    if (v && (isNaN(v) || Number(v).toFixed(selfthis.storageData.cols[c].size) != parseFloat(v))) error = true;
                    else if (v) v = parseFloat(v)
                    break;
                case 'number_old':// number e double
                    if (v && (isNaN(v) || parseInt(v, 10) != v)) error = true;
                    else if (v) v = parseInt(v, 10)
                    break;
                case 'date':
                    if (v && !(v instanceof skunk.SKDate)) error = true;
                    break;
                case 'time':
                    break;
                default:
                    break;
            }
            if (!error) {
                selfthis.storageData.rows[this.idx].val[c] = v;
                if (selfthis.storageData.rows[this.idx].status == "O") selfthis.storageData.rows[this.idx].status = "M";
                refresh.call(this);
            }
            else {
                MessageBox(errorText, "Ok!", function (response) { refresh.call(this); });
            }

        };
        this.setItemDisplay = function (c, v) {
            var refresh = function () { selfthis.refreshObjects(this, selfthis.storageData.cols[c].name, true); };
            if (typeof c == "string") c = selfthis.getColumnIndex(c);
            if (c < 0 || c >= selfthis.storageData.cols.length) return;
            var error = false;
            var errorText=''
            var getLabel = function () {
                var l = ""
                if (selfthis.getColumnLabel) l = selfthis.getColumnLabel(selfthis.storageData.cols[c].name);
                if (!l) l = selfthis.storageData.cols[c].name;
                if (!l) l = "";
                l = l.replaceAll("_", " ");
                return l;
            }

            
            
            if (selfthis.storageData.cols[c].dropDown && selfthis.storageData.cols[c].dropDown.storageData && selfthis.storageData.cols[c].dropDown.storageData.cols) {
                if (v == null) {
                    v = null;// descriere null=>id null
                }
                else {
                    for (var i = 0; i < selfthis.storageData.cols[c].dropDown.length; i++) {
                        error = true;
                        if (v == selfthis.storageData.cols[c].dropDown[i].getItem(1)) {
                            v = selfthis.storageData.cols[c].dropDown[i].getItem(0);
                            error = false;
                            break;
                        }
                    }
                }
            } else
                switch (selfthis.storageData.cols[c].type) {
                    case 'integer':
                        if (!v && v !== 0)
                            v = null
                        else if (v && (isNaN(v) || parseInt(v, 10) != v))
                            error = true;
                        else {
                            v = parseInt(v, 10)
                            if (v.toString().length > 9) error = true;
                        }
                        break;
                    case 'string':
                        if (selfthis.storageData.cols[c].size && v && (v.length > selfthis.storageData.cols[c].size)) {
                            errorText = 'Dimensiunea maxima a campului '+getLabel()+' este de ' + selfthis.storageData.cols[c].size + ' caractere';
                            error = true;
                        };
                        break;
                    case 'datetime':
                        if (!v) v = null;

                        if (v && (new Date(v.substr(6, 4) + "-" + v.substr(3, 2) + "-" + v.substr(0, 2)) == "Invalid Date" || (v.substr(11) && !(new RegExp("^(([0-1]?[0-9])|([2][0-3])):([0-5]?[0-9])(:([0-5]?[0-9]))?$").test(v.substr(11)))))) error = true;
                        //if (v && !error) {
                        //    var d= skunk.storage.stringAsDate(v)
                        //    if (!v) error = true;
                        //    else   v=d;
                        //}


                        break;
                    case 'number':
                    case 'decimal':
                        if (v) {
                            var sz = (1000).toLocaleString();
                            if (sz.length == 4)
                                sz = "";
                            else
                                sz = sz.substr(1, 1);  
                            var sv = (2 / 10).toLocaleString().substr(1, 1)
                          
                            if (sz == ".") sz = ".";
                            if (sv == ".") sv = ".";
                            v = v.replaceAll(sz, "");
                            v = v.replaceAll(sv, ".")
                                                    }
                        if (!v && v !== 0)
                            v = null
                        else if (v && (isNaN(v) || Number(v).toFixed(selfthis.storageData.cols[c].size) != parseFloat(v)))
                            error = true;
                        else {
                            v = Number(v).toFixed(selfthis.storageData.cols[c].size); v = Number(v)
                            if (v.toString().indexOf("e") > 0) error = true;  // daca il scrie in forma exponentiala - e prea mare
                            if (v.toString().length > 16) error = true;                           
                        }
                        // se pare ca la valori prea mari nu merge conversia bine : 2 cazuri din sting in number (js);  2 din number in db
                        break;
                    case 'number_old':
                        if (v && (isNaN(v) || parseInt(v, 10) != v)) error = true;
                        break;
                    case 'date':
                        if (!v) v = null;
                        if (v) {
                            v = skunk.SKDate.tryParse(v); // daca nu apelez cu new - atunci e reapelat din constructor si crede ca are 3 parametri
                            if (!v) error = true;
                        }
                        break;
                    case 'time':
                        break;
                    default:
                        break;
                }


            if (error) {
                // MessageBox("Valoare incorecta pentru camp", "Ok!", function (response) { refresh.call(this); });
                //!! pe enter (in IE) e apelat evenimentul de 2 ori 
                var selfthispusaici = this;
                if (this._msgAfisErrVal == 0) {
                    this._msgAfisErrVal = 1;
                    l = getLabel();
                    if (!errorText) errorText="Valoare incorecta pentru " + l + "!"
                    MessageBox(errorText, "Ok!", function (response) { selfthispusaici._msgAfisErrVal = 0; refresh.call(this); })
                }
                return;
            }
            return this.setItem(c, v);
        }
        this.getValueByDisplay = function (c, v) {
            if (typeof c == "string") c = selfthis.getColumnIndex(c);
            if (c < 0 || c >= selfthis.storageData.cols.length) return;
            var ret = v;
            if (selfthis.storageData.cols[c].dropDown && selfthis.storageData.cols[c].dropDown.storageData && selfthis.storageData.cols[c].dropDown.storageData.cols) {
                ret = undefined;
                for (var i = 0; i < selfthis.storageData.cols[c].dropDown.length; i++) {
                    if (v == selfthis.storageData.cols[c].dropDown[i].getItem(1)) {
                        ret = selfthis.storageData.cols[c].dropDown[i].getItem(0);
                        break;
                    }
                }
            }
            return ret;
        }
        this.hasStatus = function (status) {
            if (!status) return false;
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i].indexOf(selfthis.storageData.rows[this.idx].status) > -1) return true;
            }
            return false;
        };
        this.getStatus = function () {
            return selfthis.storageData.rows[this.idx].status;
        };
        // !! daca sterg un rand si apoi dau seStatus("O") - nu mai apare pe ecran; am pus refresh object - o fi bine ? 
        this.setStatus = function (status) {
            if (!status || typeof status != "string" || status.length != 1 || 'NMOD'.indexOf(status) < 0) return;

            selfthis.storageData.rows[this.idx].status = status;
            if (status == "O")
                for (var j = 0 ; j < selfthis.storageData.cols.length ; j++)
                    selfthis.storageData.rows[this.idx].originalVal[j] = selfthis.storageData.rows[this.idx].val[j];


        };
        // adobe air se supara pentru ca delete e si cuvant rezervat
        this.deleteRow = function () {
            if (this.hasStatus('N')) {
                this.discard();
                return;
            }
            else {
                for (var j = 0 ; j < selfthis.storageData.cols.length ; j++) selfthis.storageData.rows[this.idx].val[j] = selfthis.storageData.rows[this.idx].originalVal[j];
                this.setStatus('D');
            }
            selfthis.refreshObjects(this)
        };
        this.discard = function (faraRefresh) {
            // !!! daca facem splice trebuie sa recalculam si idx pentru row-uri pentru ca nu pastram randul din storageData ci pastram pe obiectul getSet
            //  si trebuie sa-l mutam si in jos ca sa-l avem referinta corecta
            for (var i = this.idx + 1; i < selfthis.length; i++) {
                selfthis[i].idx--;
                selfthis[i - 1] = selfthis[i]
            }
            selfthis.storageData.rows.splice(this.idx, 1);
            delete selfthis[selfthis.storageData.rows.length];
            if (faraRefresh) return;
            selfthis.refreshObjects();
        };
        this.undo = function () {
            if (this.hasStatus('N')) {
                this.discard();
                return
            }
            for (var i = 0; i < selfthis.storageData.cols.length; i++) selfthis.storageData.rows[this.idx].val[i] = selfthis.storageData.rows[this.idx].originalVal[i];
            //var oldstatus = selfthis.storageData.rows[this.idx].status;
            // !!! cele sterse trebuie sa se intoarca la statusul O - pentru ca la stergere oricum li s-au pus valorile origianale
            //if (this.hasStatus('D')) this.setStatus('M');
            if (this.hasStatus('D')) this.setStatus('O');
            else (this.setStatus('O'));
            // !!! randurile sterse ar trebuie aduse inapoi de catre programator sau framework???;de folosit setView()
            // !!! dar daca randuri sterse sunt vizibile pe ecran?
            selfthis.refreshObjects(this);
        }
    }

    this.refreshObjects = function (r, c, faraRefresh) {
        if (!registeredObj.length && !faraRefresh) selfthis.refreshView();
        for (var i = 0 ; i < registeredObj.length; i++) {
            if (registeredObj[i].refreshView && !faraRefresh) registeredObj[i].refreshView();
            registeredObj[i].trigger(r, c);
        }
    };

    

    // recalculeaza tot view-ul - necesar la crearea initiala; retrieve
    // setViewRoot - e pe ds-ul de baza ; setview pe fiecare in parte; avem 2 ca sa nu se autoapeleze
    this.setViewRoot = function () {
        // view-ul nu trebuie busit pentru ca mai pot fi si alte proprietati cum ar fi view.sum
        // e treba lui filter sa-l intretina        
        // view-ul trebuie refacutcomplet
        this.setView()
        for (var i = 0 ; i < registeredObj.length; i++)
            if (registeredObj[i].setView) registeredObj[i].setView();

    };
    this.setView = function () {
        this.filter(this.currentFilter);
    };


    // lasa doar randurile valide si nesterse in view-ul curent necesar la deleterow,discrad,undo, si update
    // nu putem apela setview sau filter in acest caz pentru ca ar dispare si randuri care nu mai sunt conforme cu filtrul curent ( adica cele noi + cele modificate)
    this.refreshView = function () {
        //this.filter(this.currentFilter);

        /* for(var i=this.view.length -1;i>=0;i--){
             var gasit=false;
             for (var j = 0; j < this.length; j++)
                 if (this.view[i] == this[j]) gasit = true;
             if (!gasit || this.filterDeletedRows && this.view[i].hasStatus("D"))             
                 this.view.splice(i,1)            
         }*/
        for (var i = this.view.length - 1; i >= 0; i--) {
            if (this.view[i].idx < 0 || this.view[i].idx >= this.length || this.view[i] != this[this.view[i].idx] || this.filterDeletedRows && this.view[i].hasStatus("D"))
                this.view.splice(i, 1)
        }

    }


    this.ofCreate = function () {
        selfthis.storageData.cols = [];
        selfthis.storageData.rows = [];
        selfthis.storageData.table = "";
        switch (arguments.length) {
            case 1:
                var arg = [];
                //in cazul in care primesc un obiect sau un vector simplu adaug argumentul in arg
                if (Array.isArray(arguments[0])) {
                    if (!(Array.isArray(arguments[0][0])) && typeof arguments[0][0] != "object") { arg.push(arguments[0]); } else { arg = arguments[0]; }
                } else arg.push(arguments[0]);
                //formez numele coloanelor
                var i = 0;
                var _col_types = {};
                for (var i = 0; i < arg.length;i++) {
                    if (!arg[i]._col_types) { continue; }
                    _col_types = arg[i]._col_types;
                    break;
                }
                for (var a in arg[0]) {
                    var c = new col();
                    if (typeof arg[0] == "object" && !(Array.isArray(arg[0]))) { c.name = a; }
                    else { c.name = "col" + i.toString(); }
                    if (!c.type) c.type = _col_types[c.name] || "string";
                    selfthis.storageData.cols.push(c);

                    i++;

                }
                //for lista de randuri
                for (var i = 0; i < arg.length; i++) {
                    if (arg[i]._col_types) { continue; }
                    var r = new row();
                    var k = 0;
                    for (var j in arg[i]) {
                        r.val[k] = arg[i][j];
                        r.originalVal[k] = arg[i][j];
                        k++;
                    }
                    r.status = "O";
                    selfthis.storageData.rows.push(r);
                }
                //getSet = new GetSet();
                selfthis.ofGetSet();
                selfthis.setViewRoot()
                selfthis.refreshObjects();
                selfthis.refreshDropDown();
                break;
            default:
                //daca nu primesc nici un argument intorc null
                return null;
        }

    };
    this.init = this.ofCreate;

    this.setColTypes = function () {
        var colTypes = arguments[0]
        if (!colTypes) return;
        for (col in colTypes) {
            if (selfthis.getColumnIndex(col) < 0) return skunk.msg("Coloana " + col + " negasita");
            if (!colTypes[col].type || typeof colTypes[col].type !== 'string') return skunk.msg("Tip nespecificat pentru coloana " + col);
            if (permitedColTypes.indexOf(colTypes[col].type) < 0) return skunk.msg("Tip incorect pentru coloana " + col);
        }
        for (columnName in colTypes) {
            var col = selfthis.storageData.cols[selfthis.getColumnIndex(columnName)];
            col.type = colTypes[columnName].type;
            if (colTypes[columnName].size) col.size = colTypes[columnName].size;
        }
    };
    this.getColType = function (col) {
        if (typeof col == "string") col = selfthis.getColumnIndex(col);
        if (col < 0 || col >= selfthis.storageData.cols.length) return;
        return selfthis.storageData.cols[col].type;
    }
    this.toString = function (cols) {
        var s = "";
        for (var i = -1; i < selfthis.storageData.rows.length ; i++) {
            for (var j = 0; j < selfthis.storageData.cols.length; j++) {
                if (i == -1 && cols) s += selfthis.storageData.cols[j] + "\t";
                if (i >= 0) s += selfthis.storageData.rows[i].val[j] + "\t";
            }
            s = s.substr(0, s.length - 1);
            //s+="\n"
            s += "<br>";
        }
        return s;
    };

    this.setSqlSelect = function (sql) {
        sqlCode = sql;
        selfthis.setViewRoot();
    };
    this.getSqlSelect = function () {
        return sqlCode;
    };
    this.setDropDown = function (dd) {
        //tin minte in dropdown ds-ul si numele coloanei
        for (var a in dd) {
            var d = new DropDown();
            d.colName = a;
            d.param = []
            if (dd[a] instanceof skunk.storage) d.storage = dd[a];
            else if (dd[a].code && dd[a].params) {
                d.storage = skunk.storage(dd[a].code);
                d.param = dd[a].params;
            }
            else d.storage = skunk.storage(dd[a]);

            for (var i = 0; i < dropDownList.length; i++) {
                if (d.colName == dropDownList[i].colName) {
                    dropDownList.splice(i, 1);
                    break;
                }
            }
            dropDownList.push(d);
        }

        selfthis._dropDowntoCol();

        //2016.06.15 - daca e un dw extern - fara retrieve - atunci nu se afiuseaza dropdownurile daca nu dam redraw()
        // if(redraw)selfthis.redraw();

    };
    //din vectorul de dropwdown-uri incerc sa leg la coloane in cazul in care am coloane
    this._dropDowntoCol = function () {
        for (var i = 0; i < selfthis.storageData.cols.length; i++) {
            selfthis.storageData.cols[i].dropDown = null;
            for (var j = 0; j < dropDownList.length; j++) {
                if (selfthis.storageData.cols[i].name == dropDownList[j].colName) {
                    selfthis.storageData.cols[i].dropDown = dropDownList[j].storage;
                }
            }
        }
    };
    this.getDropDown = function (c) {
        if (typeof c == "string") return selfthis.storageData.cols[selfthis.getColumnIndex(c)].dropDown;
        return selfthis.storageData.cols[c].dropDown;
    };
    //!! daca argumentul primit pentru dd e storage tot se face retrieve ???
    this.refreshDropDown = function (callback, forceRetrieve) {        
        if (dropDownList.length === 0) {
            if (callback) callback();
            return;
        }        
                
        if (selfthis._inrefreshDropDown) { alert("ERR SYS: storage refreshDropDown : refreshDropDown paralel - trebuie serializat"); return -1; }
        selfthis._inrefreshDropDown = true;
        selfthis._dropDowntoCol();
        var nrRetrieve = 0;
        var final = function (col) {
            if (col) { selfthis.refreshObjects(null, col, true); }
            nrRetrieve++;            
            if (nrRetrieve >= dropDownList.length){
                if(callback)
                    callback();                
                selfthis._inrefreshDropDown = false;
            }        
        };
        for (var i = 0; i < dropDownList.length; i++) {
            var col = null;
            for (var j = 0; j < selfthis.storageData.cols.length; j++) {
                if (selfthis.storageData.cols[j].dropDown === dropDownList[i].storage && selfthis.storageData.cols[j].name === dropDownList[i].colName) {
                    col = selfthis.storageData.cols[j].name;
                    break;
                }
            }
            //dropDownList[i].storage.retrieve(final.bind(null,col));
            var pp = dropDownList[i].param.slice() // ne trebuie o copie
            pp.push(final.bind(null, col))
            if (!dropDownList[i].storage._min1retrive || forceRetrieve)
                dropDownList[i].storage.retrieve.apply(dropDownList[i].storage, pp);
            else
                final(col);
            dropDownList[i].storage._min1retrive = true;
        }
    };

    this.onretrieveend = null;
    // !!! se pare ca daca dau un argument null atunci e interpretat ca si cum nu ar fi parametru=> eroare
    this.retrieve = function () {         
        if (this.length > 0&&sqlCode)// altfel se da reset si pe storageurile care nu au apucat sa fie complet definite - mai ales  dddw-urile; si apoi se apeleaza redraw 
            this.reset();
        var params = [];
        for (var i = 0; i < arguments.length; i++) {
            if (i == arguments.length - 1 && typeof arguments[i] == "function") var callback = arguments[i];
            else {
                // !! daca avem obiecte pe post de argumente de retrieve atuncin nu merge cum trebuie
                // poate ar trebui verificat daca obiectul are sau nu functia valueOf - ca sa se serializeze ; sau nu - ca sa fie serailizat ca o gramada de parametri
                //  !! sau mai bine sa-l scoatem ???
                // !! cica trebuie sa ramana ca sa putem avea parametri cu nume
                if (typeof arguments[i] == "object" && arguments[i] !== null && !arguments[i].isSKDate) {  // pentru ca typeof null e object=> avem probleme de la asta
                    for (var a in arguments[i]) params.push({ name: ':' + a, value: arguments[i][a] });
                } else params.push({ value: arguments[i] });
            }
        }

        var response = function (r) {
            
            if (r.errorCode) {
                if (r.errorMsg === 'Sesiune expirata' && skunk.sesiune_expirata_callback) {
                    MessageBox(r.errorMsg, "Ok!", skunk.sesiune_expirata_callback);
                } else {
                    MessageBox(r.errorMsg);
                }         
                return;
            }
            selfthis.storageData = r;
            if (!selfthis.storageData.cols) {
                MessageBox(selfthis.storageData);
                return;
            }
            for (var j = 0 ; j < selfthis.storageData.cols.length ; j++)
                selfthis.storageData.cols[j].name = selfthis.storageData.cols[j].name.toLowerCase();

            for (var i = 0 ; i < selfthis.storageData.rows.length ; i++) {
                var r = selfthis.storageData.rows[i];
                r.status = "O";
                r.originalVal = [];
                for (var j = 0 ; j < selfthis.storageData.cols.length ; j++) {
                    //if (selfthis.storageData.cols[j].type == "datetime")
                    //    r.val[j] = Date(r.val[j]);
                    if (selfthis.storageData.cols[j].type == "integer" && r.val[j] !== null)
                        r.val[j] = parseInt(r.val[j], 10);
                    if (selfthis.storageData.cols[j].type == "decimal" && r.val[j] !== null)
                        r.val[j] = parseFloat(r.val[j]);
                    if (selfthis.storageData.cols[j].type == "date" && r.val[j] !== null)
                        r.val[j] = new skunk.SKDate(r.val[j]); // daca nu apelez cu new - atunci e reapelat din constructor si crede ca are 3 parametri
                    r.originalVal[j] = r.val[j];
                }
            }
            //getSet = new GetSet();
            selfthis.ofGetSet();
            response2();
        }
        // pe storageDisplay extern trebuie sa terminam cu retrieve ca sa fie initailizate dddwurile definite
        var response2 = function (r) {
            selfthis.setViewRoot()
            selfthis.refreshObjects();
            selfthis.refreshDropDown(function () {
                selfthis._fatalUpdateError = 0;
                if (callback) callback.apply(selfthis);
                if (selfthis.onretrieveend)
                    selfthis.onretrieveend();
                for (var i = 0 ; i < registeredObj.length; i++)
                    if (registeredObj[i] && registeredObj[i].onretrieveend) registeredObj[i].onretrieveend();
            });
        };
        if (!sqlCode) {
            response2();
            return;
        }
        var ws = skunk.webService();
        //var ws = skunk.localDB();
        ws.asyncCall("Retrieve", { sql: sqlCode, sqlParams: params }, response);

        //ws.asyncCall("test2", { sql: sqlCode, sqlParams: params });
        //ws.asyncCall("test2", { sql: sqlCode, sqlParams: params });
        //ws.asyncCall("test2", { sql: sqlCode, sqlParams: params });
        //ws.asyncCall("test2", { sql: sqlCode, sqlParams: params });

        //ws.asyncCall("Retrieve2", { sql: sqlCode, sqlParams: params }, response);
    };

    this.ofGetSet = function () {
        getSet = new GetSet();
        for (var i = 0 ; i < selfthis.storageData.cols.length; i++) getSet.defProp(selfthis.storageData.cols[i].name, i);
        // ......   idx-ul trebuie sal am modificabil pentru cazul in care fac discard - si trebuie recalculat
        //for (var i = 0 ; i < selfthis.storageData.rows.length ; i++) selfthis[i] = Object.create(getSet, { idx: { value: i } });
        for (var i = 0 ; i < selfthis.storageData.rows.length ; i++) {
            selfthis[i] = Object.create(getSet);
            selfthis[i].idx = i;
        }
    };

    this.getCols = function () { return selfthis.storageData.cols; };

    this.getColumnIndex = function (c) {
        for (var i = 0; i < selfthis.storageData.cols.length; i++) {
            if (selfthis.storageData.cols[i].name == c) return i;
        }
        return -1;
    };
    //!! e o mica problema /ceva de hotarat : cand fac insert intr-un storage se adauga ramndul si in toate view-urile storageurilor derivtae ???
    this.insertRow = function (r) {
        var newrow = new row();
        newrow.status = "N";
        for (var i = 0; i < selfthis.storageData.cols.length; i++) {
            var val = null;
            if (r && r[selfthis.storageData.cols[i].name] !== undefined) val = r[selfthis.storageData.cols[i].name];
            newrow.val[i] = val;
            newrow.originalVal[i] = null;
        }
        selfthis.storageData.rows.push(newrow);
        // ......   idx-ul trebuie sal am modificabil pentru cazul in care fac discard - si trebuie recalculat
        //selfthis[selfthis.length - 1] = Object.create(getSet, { idx: { value: selfthis.length - 1 } });
        selfthis[selfthis.length - 1] = Object.create(getSet);
        selfthis[selfthis.length - 1].idx = selfthis.length - 1;
        this.view.push(selfthis[selfthis.length - 1]);
        selfthis.refreshObjects(selfthis[selfthis.length - 1], undefined, true);
        return selfthis[selfthis.length - 1];
    };

    this.deleteRow = function (r) {
        if (!r && this.getRow) r = this.getRow();
        if (r) r.deleteRow();
    };

    this.discardRow = function (r) { if (r) r.discard(); };

    // daca dau doar r.undo - nu mai stiu sa o aduc pe ecran ; trebuie adusa pe ecran doar in storageDisplayul care cere acest lucru nu in toate
    this.undoRow = function (r) {
        var oldstatus = this.storageData.rows[r.idx].status;
        r.undo();
        if (oldstatus == "D") {// cand anulez stergerea nu aparea pe ecran                
            var gasit = false;
            for (var j = 0; j < this.view.length; j++)
                if (this == this.view[j]) gasit = true;
            if (!gasit) this.view.push(r)
            selfthis.refreshObjects(r, undefined, true);
        }
    }

    // daca statusul e new - nu se salveaza - de rediscutat - 
    // !!! daca sunt 5000 de randuri dureaza 2 minute - asa ca incerca  cceva bulk - deocamdata doar insert
    this.dbErrorTranslate = function (sqldbcode, sqlerrtext) {
        if (!sqlerrtext) sqlerrtext = ""
        var errtext = "";
        if (!isNaN(sqldbcode))
            sqldbcode = parseInt(sqldbcode);

        switch (sqldbcode) {
            case -193:
            case -196:
                errtext = "Exista deja o inregistrare de acest fel/Inregistrare duplicat"
                break;
            case -198:
                errtext = "Inregistrarea este folosita in alta tabela"
                break;
            case -239:
                errtext = "Exista deja o inregistrare cu acest cod"
                break;
            case -268:
                errtext = "Exista deja o inregistrare cu acest cod 2"
                break;
            case -1811:
            case -25580:
                errtext = "Ati fost deconectat de la baza de date"
                break;
            case -660:
                errtext = sqlerrtext + "~r~n";
                if (errtext.indexOf("Communication link failure") > 0)
                    errtext = "Ati fost deconectat de la baza de date remote"
                else if (errtext.toLowerCase().indexOf('raiserror') > 0) {
                    errtext = errtext.substr(errtext.toLowerCase().indexOf('raiserror'))
                    errtext = errtext.substr(errtext.toLowerCase().indexOf(':') + 1)
                    errtext = errtext.substr(0, errtext.toLowerCase().indexOf('\r\n'))
                }
                break;
            case -656:
                errtext = "Conectarea la baza de date auxiliara nu a reusit"
                break;
            case -908:
                errtext = "Conectarea la baza de date nu a reusit~r~n" + sqlerrtext;
                break;
            case -3:
                errtext = "Modificare/Stergere anulata: Inregistrarea a fost modificata";//"Alt utilizator a modificat/sters inregistrarea"		
                break;
            case -195:
                errtext = sqlerrtext
                errtext = errtext.substr(errtext.toLowerCase().indexOf('column'))
                errtext = errtext.substr(errtext.toLowerCase().indexOf("'") + 1)
                errtext = errtext.substr(0, errtext.toLowerCase().indexOf("'"))
                //isCol=errtext // -  pentru focus

                var lst
                lst = sqlerrtext.substr(sqlerrtext.toLowerCase().indexOf(' in table'))
                lst = sqlerrtext.substr(lst.toLowerCase().indexOf("'") + 1)
                lst = sqlerrtext.substr(0, lst.toLowerCase().indexOf("'"))

                errtext = "Completati coloana " + errtext
                break;
            case -158:
                //Eroare salvare (-158): 
                //ERROR [22003] [Sybase][ODBC Driver][SQL Anywhere]Value 12 out of range for destination 
                errtext = sqlerrtext
                errtext = errtext.substr(errtext.toLowerCase().indexOf('value '))
                errtext = errtext.substr(errtext.toLowerCase().indexOf(' ') + 1)
                errtext = errtext.substr(0, errtext.toLowerCase().indexOf(' '))
                errtext = "Valoarea " + errtext + " este in afara intervalului permis de baza de date"
                break
            default:
                errtext = sqlerrtext + "\r\n";
                if (errtext.toLowerCase().indexOf('raiserror') > 0) {
                    errtext = errtext.substr(errtext.toLowerCase().indexOf('raiserror'))
                    errtext = errtext.substr(errtext.toLowerCase().indexOf(':') + 1)
                    errtext = errtext.substr(0, errtext.toLowerCase().indexOf('\r\n'))
                }
                //2016.11.06 - vine textul raiserror de 2 ori - pe sigma factgest :  {"ERROR [HY000] [Sybase][ODBC Driver][SQL Anywhere]RAISERROR executed: RAISERROR executed: Nu gasesc pozitia in st_ies_leg (FIFOO)!\n\n"}
                if (errtext.toLowerCase().indexOf('raiserror') > 0) {
                    errtext = errtext.substr(errtext.toLowerCase().indexOf('raiserror'))
                    errtext = errtext.substr(errtext.toLowerCase().indexOf(':') + 1)                   
                }
        }

        return errtext;
    }
    //this.onupdateend = null; !!! nu merge pentruc a daca nu e nimic modificat se apeleaza imediat - si atunci daca onupdateend e definit dupa apelul lui update => nu exista inca
   
    this.update = function (callback, extra) {
        // updateurile trebuie serializate pentru ca sa putem determina erorile de retea si sa fortam reluarea updateului ;
        // facem verificarea si aici ca sa putem sa identificam si in cazul in care updatul se lanseaza pe mai multe storage-uri dar nu au toate randuri modificate
        if (skunk.storage._inUpdateSRV) { alert("ERR SYS: storage update : update paralel - trebuie serializat"); return -1; }
        if (selfthis._fatalUpdateError) {
            if (callback) callback(-1, "La salvarea precedenta a aparut o problema pe retea care a dus la incapacitatea sistemului de corectare a erorii. Va rugam reincarcati fereastra.");
            return;
        }
                

        if (callback) callback = callback.bind(selfthis);
        if (!selfthis.isModified() && !extra) {
            if (callback) callback(0, "");
            if (this.onupdateend) this.onupdateend(0, "");            
            return
        }

        var err = selfthis.ofVerifyGetText();
        if (err) {
            if (callback) callback(-1, err);
            if (this.onupdateend) this.onupdateend(-1, err);           
            return;
        };

        var updateStr = skunk.storageData();


        if (extra && extra.bulkInsert) updateStr.bulkInsert = true;
        if (extra && extra.cmdBefore) updateStr.cmdBefore = extra.cmdBefore;
        if (extra && extra.cmdAfter) updateStr.cmdAfter = extra.cmdAfter;
        updateStr.tbl = selfthis.storageData.tbl;
        updateStr.pk = selfthis.storageData.pk;
        updateStr.pkindex = selfthis.storageData.pkindex;
        for (var i = 0; i < selfthis.storageData.rows.length ; i++) {
            selfthis.storageData.rows[i].rowid = i;
            if (selfthis.storageData.rows[i].status == "O") continue;
            updateStr.rows.push(selfthis.storageData.rows[i]);
        }
        for (var i = 0; i < selfthis.storageData.cols.length ; i++) {
            var c = new col();
            c.name = selfthis.storageData.cols[i].name;
            c.size = selfthis.storageData.cols[i].size;
            c.type = selfthis.storageData.cols[i].type;
            c.isautoincrement = selfthis.storageData.cols[i].isautoincrement;
            c.basetable = selfthis.storageData.cols[i].basetable;
            c.isunique = selfthis.storageData.cols[i].isunique;
            c.allowdbnull = selfthis.storageData.cols[i].allowdbnull;
            updateStr.cols.push(c);
        }

                
        // updateurile trebuie serializate pentru ca sa putem determina erorile de retea si sa fortam reluarea updateului 
        if (skunk.storage._inUpdateSRV) { alert("ERR SYS: storage update : update paralel - trebuie serializat"); return -1; }
        skunk.storage._inUpdateSRV = 1;

        var response = function (ret) {
            skunk.storage._inUpdateSRV = 0;
            if (!ret || !ret.error || ret.error.errorCode != 0) {
                if (ret && ret.error) ret.error.errorMsg = selfthis.dbErrorTranslate(ret.error.errorCode, ret.error.errorMsg);
                //if (callback) callback(0, ret);
                // se pare ca atunci cand expira sesiune pe bune inapoi vine ret.Message si nu sesiune expirata
                if (!ret || !ret.error) {
                    var lerr = "eroare";
                    if (ret && ret.Message) lerr = ret.Message;
                    ret = { error: {errorCode:-1,errorMsg:lerr}     }
                }
                if (ret.error.errorCode == -101 || ret.error.errorCode == -102)
                    selfthis._fatalUpdateError = 1;
                
                if (callback) callback((ret && ret.error ? ret.error.errorCode : -1), (ret && ret.error ? ret.error.errorMsg : ret));
                if (this.onupdateend) this.onupdateend((ret && ret.error ? ret.error.errorCode : -1), (ret && ret.error ? ret.error.errorMsg : ret));                
                return;
            }
            //alert(ret.rows.length)
            for (var i = selfthis.storageData.rows.length - 1; i > -1 ; i--) {
                if (selfthis.storageData.rows[i].status == "O") continue;
                if (selfthis.storageData.rows[i].status == "D") {
                    selfthis[i].discard(true);
                    continue;
                };
                //recuperez randurile venite in ret.rows
                var k = -1
                for (var j = 0; j < ret.rows.length ; j++) {
                    if (ret.rows[j].rowid == selfthis.storageData.rows[i].rowid) {
                        k = j;
                        break;
                    }
                }
                for (var j = 0; j < selfthis.storageData.cols.length ; j++) {
                    if (k > -1 && selfthis.storageData.cols[j].type == "integer" && ret.rows[k].val[j] !== null)
                        ret.rows[k].val[j] = parseInt(ret.rows[k].val[j], 10);
                    if (k > -1 && selfthis.storageData.cols[j].type == "decimal" && ret.rows[k].val[j] !== null)
                        ret.rows[k].val[j] = parseFloat(ret.rows[k].val[j]);
                    if (k > -1 && selfthis.storageData.cols[j].type == "date" && ret.rows[k].val[j] !== null)
                        ret.rows[k].val[j] = new skunk.SKDate(ret.rows[k].val[j]); // daca nu apelez cu new - atunci e reapelat din constructor si crede ca are 3 parametri
                    if (k > -1 && selfthis.storageData.cols[j].type == "time" && ret.rows[k].val[j] !== null && ret.rows[k].val[j].Hours)
                        ret.rows[k].val[j] = (ret.rows[k].val[j].Hours < 10 ? '0' : '') + ret.rows[k].val[j].Hours + ':' +
                                            (ret.rows[k].val[j].Minutes < 10 ? '0' : '') + ret.rows[k].val[j].Minutes + ':' +
                                            (ret.rows[k].val[j].Seconds < 10 ? '0' : '') + ret.rows[k].val[j].Seconds
                    if (k > -1) selfthis.storageData.rows[i].val[j] = ret.rows[k].val[j];
                    selfthis.storageData.rows[i].originalVal[j] = selfthis.storageData.rows[i].val[j];
                }
                selfthis.storageData.rows[i].status = "O";
            }

            selfthis.refreshObjects();
            if (callback) callback(0, "");
            if (this.onupdateend) this.onupdateend(0, "");
        };


        var ws = skunk.webService();
        if (!skunk.updateSeqNo) skunk.updateSeqNo = 0;
        skunk.updateSeqNo++;
       
        ws.asyncCall("UpdateStructure", { obj1: updateStr, tbl: selfthis.tbl, updateSeqNo: skunk.updateSeqNo }, response);       
    };

    this.ofRegister = function (obj) {
        if (registeredObj.indexOf(obj) > -1) return 0;
        registeredObj.push(obj);
        return 1;
    };

    this.ofUnregister = function (obj) {
        var r = registeredObj.indexOf(obj);
        if (r < 0) return 0;
        registeredObj.splice(r, 1);
        return 1;
    };
    // !!!! trebuie rescris sa stearga tot deodata, nu cu splice
    this.reset = function () {
        for (var i = selfthis.length - 1; i >= 0; i--) selfthis[i].discard(true);
        selfthis.refreshObjects();
    };

    this.ofVerifyExcludeColumns = [];
    this.ofVerifySetExcludeColumns = function (v) {
        for (var i = 0; i < v.length; i++)
            if (selfthis.ofVerifyExcludeColumns.indexOf(v[i]) < 0) selfthis.ofVerifyExcludeColumns.push(v[i]);
    }
    this.ofVerifyColumns = [];
    this.ofVerifySetColumns = function (v) {
        for (var i = 0; i < v.length; i++)
            if (selfthis.ofVerifyColumns.indexOf(v[i]) < 0) selfthis.ofVerifyColumns.push(v[i]);
    }
    this.ofVerify = function () {
        var s = this.ofVerifyGetText();
        if (!s) return true;
        skunk.msg(s);
        return false;
    }
    this.ofVerifyGetText = function () {
        //verificare de null
        var s = "";
        var nrc = 0;
        var nrr = 0;
        var lastLin = -1;
        for (var i = 0 ; i < selfthis.length; i++) {
            if (selfthis[i].hasStatus("O", "D")) continue;
            for (var j = 0 ; j < selfthis.storageData.cols.length; j++) {
                var nn = selfthis.storageData.cols[j].name;
                if ((selfthis.storageData.cols[j].allowdbnull == "True" || selfthis.storageData.cols[j].isautoincrement == "True") && selfthis.ofVerifyColumns.indexOf(nn) < 0) continue;
                if (selfthis.ofVerifyExcludeColumns.indexOf(nn) >= 0) continue;
                if (selfthis.storageData.rows[i].val[j] === null) {
                    if (nn.substr(0, 3) == "id_") nn = nn.substr(3)                    
                    if (nn.substr(nn.length - 3, 3) == "_id") nn = nn.substr(0, nn.length - 3)
                    //s += "Completati coloana " + nn + (selfthis.length > 1 ? " la linia: " + (i + 1) : "") + "<br/>";
                    //if (selfthis.length > 1 && lastLin != i) {
                    // daca updateul a fost apelat pentru un form mostenit dintr-un list nu ai e cazul sa-i afisam si linia, de aceea folosim this.view.length si nu selfthis.length
                    if (this.view.length > 1 && lastLin != i) {
                        if (s) s += "<br/>"
                        lastLin = i;
                        nrr++
                        s += "La linia " + (i + 1) + " :"
                    }
                    s += nn + ", ";
                    nrc++;
                }
            }
        }
        if (s && s.right(2) == ", ") s = s.substr(0, s.length - 2)

        if (s) s = "Completati:" + (nrr ? "<br/>" : " ") + s;
        return s;
    };

    this.isModified = function () {
        for (var i = 0; i < selfthis.length; i++) {
            if (!selfthis[i].hasStatus("O")) return true;
        }
        return false;
    };

    this.getColumnNameByIndex = function (c) {
        if (!selfthis.storageData || !selfthis.storageData.cols || !selfthis.storageData.cols[c]) return;
        return selfthis.storageData.cols[c].name;
    };

    this.getDisplayColumn = function () {
        return selfthis.getColumnNameByIndex(1);
    };

    if (arguments.length > 0) {
        if (typeof arguments[0] == "object") this.ofCreate(arguments[0]);
        else this.setSqlSelect.apply(this, arguments);
    }


    selfthis.setViewRoot();
};

/// <reference path="D:\Work\Proiecte TFS\SF\SoftehFramework\SoftehFramework\SoftehFramework\JS/SstorageData.js" />
//skunk.storage.prototype.filterRows = [];

skunk.storage.prototype.initMemberVar = function () {
    this.sortIndex = [];
    this.currentFilter = null;  // necesar la refacerea view-ului
    this.baseFilter = null; // pentru setarea unui filtru fix
    this.filterDeletedRows = true;
}

// Functie ce returneaza indexul coloane
skunk.storage.prototype.getColumnIndex = function (c) {
    for (var i = 0; i < this.storageData.cols.length; i++) {
        if (this.storageData.cols[i].name == c) return i
    }
    return -1;
}

// Sortare 
skunk.storage.prototype.compare = function (a, b) {
    var ret;
    var EQUAL = 0; GREATER = 1; LOWER = -1;
    var valA, valB;
    var breakFor = false;
    ret = EQUAL;

    for (var i = 0; i < this.sortIndex.length; i++) {

        valA = a.getItem(this.sortIndex[i].index);
        valB = b.getItem(this.sortIndex[i].index);

        switch (this.storageData.cols[this.sortIndex[i].index].type) {

            case 'string':

                if (valA === null && valB === null) {
                    continue;
                } else if (valA === null) {
                    ret = GREATER * this.sortIndex[i].type;
                    breakFor = true;
                    break;
                } else if (valB === null) {
                    ret = LOWER * this.sortIndex[i].type;
                    breakFor = true;
                    break;
                }

                if (valA.toLowerCase() === valB.toLowerCase()) continue;
                if (valA.toLowerCase() > valB.toLowerCase()) {
                    ret = GREATER * this.sortIndex[i].type;
                    breakFor = true;
                    break;
                }
                if (valA.toLowerCase() < valB.toLowerCase()) {
                    ret = LOWER * this.sortIndex[i].type;
                    breakFor = true;
                    break;
                }
                break;

            default:

                if (valA === valB) continue;
                if (valA > valB) {
                    ret = GREATER * this.sortIndex[i].type;
                    breakFor = true;
                    break;
                }
                if (valA < valB) {
                    ret = LOWER * this.sortIndex[i].type;
                    breakFor = true;
                    break;
                }
                break;
        }
        if (breakFor) break;

    }
    return ret;
}

skunk.storage.prototype.sort = function () {
    var r = null;
    if (this.getRow) r = this.getRow();
    this.sortIndex = [];
    this.lastSort = arguments[0]
    for (i = 0; i < arguments.length; i++)
        switch (typeof arguments[i]) {
            case 'number':
                this.sortIndex.push({ index: arguments[i], type: 1 })
                break
            case 'string':
                this.sortIndex.push({ index: this.getColumnIndex(arguments[i]), type: 1 })
                break;
            case 'object':
                // Array,
                var arg = arguments[i];
                if (arg instanceof Array) {
                    this.sortIndex.push({
                        index: typeof arg[0] == 'string' ? this.getColumnIndex(arg[0]) : arg[0],
                        type: arg[1] == 'asc' || arg[1] == 'ascendent' || arg[1] == 1 ? 1 : -1
                    });

                }
                else {
                    this.sortIndex.push({
                        index: this.getColumnIndex(arg.column),
                        type: arg.type == 'asc' || arg.type == 'ascendent' || arg.type == 1 ? 1 : -1
                    });
                }
                break;
        }
    this.view.sort(this.compare.bind(this));
    if (this.redraw) this.redraw();
    if (r && this.scrollToRow) this.scrollToRow(r);
}


// Filtru

//!!! 2016.07.26 - dupa filtru ar trebui si sa scroleze undeva; daca deja am scrolat la coada de tot ( macar virtual) ramane randul aiurea)
//  !!! poate nu aici ci pe storageDisplay - trebuie vazut
/* !! o modalitate mai simpla pentru  cautare de text pentru ca acum trebuie sa scriu asa :
 vv = JSON.stringify(vv).toLowerCase()            
            selfthis.lista.filter("cod_fiscal&&cod_fiscal.toLowerCase().indexOf(" + vv + ")>=0 || denumire&&denumire.toLowerCase().indexOf(" + vv + ")>=0 || den_industrie&&den_industrie.toLowerCase().indexOf(" + vv + ")>=0")
*/

skunk.storage.prototype._initview = function () {
    this.view.sum = this.sum;
}
skunk.storage.prototype.setBaseFilter=function(f){
    this.baseFilter=f;
}

skunk.storage.prototype.filter = function (_baubau_filter) {
   

    this.currentFilter = (!_baubau_filter) ? null : _baubau_filter;

    if (this.baseFilter)
        _baubau_filter = "(" + this.baseFilter + ")" + (_baubau_filter ? " && ( " + _baubau_filter + ")" : "")
    //console.info(_baubau_filter);
  

    // view-ul nu trebuie busit pentru ca mai pot fi si alte proprietati cum ar fi view.sum
    this.view = [];
    this._initview();
    //filtru direct pe rand
    if (_baubau_filter && _baubau_filter.idx != undefined) {
        //!!!! de ce randul mai are idx setat daca nu mai apartine de nimic ?????
        // rand nou + undo => r nu mai e in storage => nu mai trebuie sa fie nici in view
        var idx = -1;
        for (var i = 0; i < this.length; i++)
            if (this[i] == _baubau_filter) idx = i;
        if (idx >= 0)
            this.view.push(_baubau_filter);
        if (this.redraw) this.redraw();
        return;
    }
    
    if (!_baubau_filter) {
        for (var _baubau_i = 0; _baubau_i < this.length ; _baubau_i++) {
            if (this.filterDeletedRows && this[_baubau_i].hasStatus("D")) continue;
            this.view.push(this[_baubau_i]);
        }
        if (this.lastSort)
            this.sort(this.lastSort)
        if (this.redraw) this.redraw();
        return
    }

    if (_baubau_filter.replaceAll("==", "XX").replaceAll(">=", "XX").replaceAll("<=", "XX").replaceAll("!=", "XX").indexOf("=") >= 0)
        // ar trebui daca e in mod debug - sa dau eroare
        //alert("Expresie filtru incorecta , contine '='  : "+_baubau_filter )
        _baubau_filter = "1==2";

    //filtru pe exprsie
    var fct = null;
    var sf = "fct=function("
    for (var _baubau_i = 0; _baubau_i < this.storageData.cols.length; _baubau_i++) {
        if (_baubau_i > 0) sf += " , "
        sf += this.storageData.cols[_baubau_i].name;
        sf += " , " + this.storageData.cols[_baubau_i].name + "_displ";
    }
    sf += ") { return " + _baubau_filter + " } "
    // alert(sf)
    try {
        eval(sf);
    } catch (ex) {
        fct = function () { return 0; }
        if (location && location.toString().indexOf("localhost:65430") >= 0) 
            alert("Sintaxa filtru incorecta  ; verificati == and or  : " + _baubau_filter)
    }
    // ca sa nu evaluam toate coloanele verificam daca sunt dflosite in expresie
    var _baubau_colfol = [];    
    for (var _baubau_j = 0; _baubau_j < this.storageData.cols.length; _baubau_j++)
        _baubau_colfol.push(_baubau_filter.indexOf(this.storageData.cols[_baubau_j].name) >= 0);
    for (var _baubau_i = 0 ; _baubau_i < this.length ; _baubau_i++) {
        if (this.filterDeletedRows && this[_baubau_i].hasStatus("D")) continue;
        var ar = [];
        for (var _baubau_j = 0; _baubau_j < this.storageData.cols.length; _baubau_j++)
            if (_baubau_colfol[_baubau_j]) {
                ar.push(this[_baubau_i].getItem(_baubau_j))
                ar.push(this[_baubau_i].getItemDisplay(_baubau_j))
            } else { ar.push(null); ar.push(null);}

        try {
           // var ff = fct.apply(null, ar);
            if (fct.apply(null, ar)) { this.view.push(this[_baubau_i]); }
        } catch (_baubau_ex) {
            // !!! de vazut ce facem cu erorile de evaluare de la filter - nu trebuie in nici un caz sa dam eroare urata
               alert(_baubau_ex)
        }

    }
    if (this.lastSort)
        this.sort(this.lastSort)
    if (this.redraw) this.redraw();
    //2016.11.07- daca scrolez mult in jos + filtru a.i. length<curent index=> pe ecran nu se mai afiseaza nimic, asa ca fortam scolltorow(0)
    if(this.scrollToRow) this.scrollToRow(this.view[0]);
    return
    // dureaza cam mulr : 3s 15.000 randuri
    //!!!!!! zona cu variabile autocreate asa ca la toate variabilele de carea am bnevoie le pun prefix _baubau_
    for (var _baubau_i = 0; _baubau_i < this.storageData.cols.length; _baubau_i++) {
        eval("var " + this.storageData.cols[_baubau_i].name);
    }

    for (var _baubau_i = 0 ; _baubau_i < this.length ; _baubau_i++) {
        if (this.filterDeletedRows && this[_baubau_i].hasStatus("D")) continue;
        for (var _baubau_j = 0; _baubau_j < this.storageData.cols.length; _baubau_j++) {

            switch (this.storageData.cols[_baubau_j].type) {
                case 'string':
                case 'date':
                case 'datetime':
                    var _baubau_vv = this[_baubau_i].getItem(_baubau_j)
                    if (!_baubau_vv) _baubau_vv = "";
                    _baubau_vv = JSON.stringify(_baubau_vv)  // daca stringul contine ' => rezulta eroare evaluare                    
                    //eval(this.storageData.cols[j].name + " = '" + vv + "'");
                    eval(this.storageData.cols[_baubau_j].name + " = " + _baubau_vv + "");
                    break;
                default:
                    eval(this.storageData.cols[_baubau_j].name + " = " + this[_baubau_i].getItem(_baubau_j) + "");
            }
        }
        try {
            if (eval(_baubau_filter) == true) { this.view.push(this[_baubau_i]); }
        } catch (_baubau_ex) {
            // !!! de vazut ce facem cu erorile de evaluare de la filter - nu trebuie in nici un caz sa dam eroare urata
            // alert(ex)
        }

    }

    if (this.redraw) this.redraw();
}
skunk.storage.prototype.filter_getExprFromColAndVal = function (col, val, poz, expr) {
    //poz - 0 - tot, 1 la inceput, 2 la sfarsit
    if (!expr) expr = "";
    var f = expr;
    if (!val) return f;
    var vv = JSON.stringify(val).toLowerCase()
    col += "_displ"
    if (f) f += " && "
    f += col + "!==null&&" + col + ".toLowerCase().indexOf(" + vv + ")"
    if(poz==1)
        f+=" ==0 "        
    else if(poz==2)
        f += " == length("+col+") - " +length(vv) 
    else
        f+=" >=0 "        
    return f;
}
skunk.storage.prototype.filterByCol = function (col, val) {
    this.filter(this.filter_getExprFromColAndVal(col,val))
}
skunk.storage.prototype.filterByVal = function (val) {
    var f = "";
    if (!val) return this.filter();

    var vv = JSON.stringify(val).toLowerCase()
    
    
        for (var i = 0; i < this.cols.length; i++) {
            var c = this.cols[i].name;
            c += "_displ"
            if (f != "") f += " || "
            // ca sa mearga si pe dropdown - nu mai tinem cont de tip 
            //   if (selfthis.grid.cols[i].type == "string")
            f += c + "!==null&&" + c + ".toLowerCase().indexOf(" + vv + ")>=0 "
            //else
            //  f += c + "!==null&&" + c + ".toString()==" + vv + " "
        }
    
    this.filter(f)
}

//!!!! am adugat intr-un skgrid wxisgtent si nu a functionat
// Compute
skunk.storage.prototype.compute = function (col, expresion) {
    var _index = this.storageData.cols.length;

    var computeCol = {};

    computeCol.isautoincrement = false;
    computeCol.size = 0;
    computeCol.type = "computed"
    computeCol.name = col;

    this.storageData.cols.push(computeCol);

    var colIndex = this.getColumnIndex(col);



    for (var i = 0; i < this.storageData.cols.length; i++) {
        eval("var " + this.storageData.cols[i].name);
    }

    for (var i = 0 ; i < this.length ; i++) {

        for (var j = 0; j < this.storageData.cols.length; j++) {
            eval(this.storageData.cols[j].name + " = '" + this[i].getItem(j) + "'");
        }

        var compute = null
        eval("compute=" + expresion);

        this[i].setItem(colIndex, compute)
    }

    // TO DO 
    // Sa se acceseze  a[0].noua  ? 
    //this.storageData.defProp(this.storageData.cols[colIndex].name, colIndex);

}

// Sum, Max, Min, Avg
skunk.storage.prototype.footerExpresions = []
skunk.storage.prototype.Sum = {}
skunk.storage.prototype.Max = {}
skunk.storage.prototype.Min = {}
skunk.storage.prototype.Avg = {}

skunk.storage.prototype.sum = function (f) {
    var t = 0;
    for (var i = 0; i < this.length; i++) {
        var vc = 0;
        if (typeof f == "function")
            vc = f(this[i]);
        else if (this[i][f] !== undefined)
            vc = this[i][f] - 0; // ca sa fortam conversia la numar; daca e grid automat nu sunt inca numere
        else //  !!! de eiomplementat f ca expresie  ex :  col1 +col2
            alert("storage sum - evaluare expresie neimplemantata")
        if (vc && !isNaN(vc)) t += vc;
    }
    return t;
}

skunk.storage.prototype.footer = function (expresion) {
    var selfthis = this;

    var sum = function (col) {
        var s = 0;
        for (var i = 0; i < selfthis.length ; i++) {
            s += selfthis[i].getItem(col) - 0;
        }

        Object.defineProperty(selfthis.Sum, col, { writable: true, enumerable: true, configurable: true, value: s });

    }

    var max = function (col) {

        if (selfthis.length < 1) return null
        m = selfthis[0].getItem(col);

        for (var i = 1; i < selfthis.length ; i++) {
            if (m < selfthis[i].getItem(col)) {
                m = selfthis[i].getItem(col)
            }
        }
        Object.defineProperty(selfthis.Max, col, { writable: true, enumerable: true, configurable: true, value: m });
    }

    var min = function (col) {

        if (selfthis.length < 1) return null
        m = selfthis[0].getItem(col);

        for (var i = 1; i < selfthis.length ; i++) {
            if (m > selfthis[i].getItem(col)) {
                m = selfthis[i].getItem(col)
            }
        }
        Object.defineProperty(selfthis.Min, col, { writable: true, enumerable: true, configurable: true, value: m });
    }

    var average = function (col) {
        var s = 0;
        for (var i = 0; i < selfthis.length ; i++) {
            s += selfthis[i].getItem(selfthis.getColumnIndex(col));
        }
        if (selfthis.length) s = s / selfthis.length;
        Object.defineProperty(selfthis.Avg, col, { writable: true, enumerable: true, configurable: true, value: s });
    }


    //eval ("var exp = " + expresion);
    //return exp;
    //
    eval(expresion);
}

skunk.storage.prototype.viewSortIndex = function () {
    var s = "";
    for (var i = 0; i < this.sortIndex.length; i++) {
        s += "Index:" + this.sortIndex[i].index + " Type:" + this.sortIndex[i].type;
    }

    return s;
}
skunk.storage.prototype.getColumnLabel = function (col) {
    if (!this.afisCol) return;
    //this.storageData.cols[i].name
    for (var i = 0; i < this.afisCol.length; i++)
        if (col == this.afisCol[i].col)
            return this.afisCol[i].label;
    return null;
}

skunk.storage.stringAsDate = function (val) {
    if (val == "" || !val) return null;
    val = val.toString();
    val = val.replaceAll("/", ".");
    var d = val.substr(0, val.indexOf("."));
    val = val.substr(val.indexOf(".") + 1);
    var l = val.substr(0, val.indexOf("."))
    var a = val.substr(val.indexOf(".") + 1);
    try {
        val = new Date(Date.UTC(a, l - 1, d));
        if (!val.getYear() || val.getFullYear() < 1902) return null;
    } catch (ex) { return null; }

    return val;
}

skunk.storage.prototype.toTable = function (titlu, labels, cols) {
    var ret = "<table><thead><tr>"

    if (labels && labels.length > 0) {
        for (var j = 0; j < this.storageData.cols.length; j++) {
            ret += "<th>" + ((labels[j]) ? labels[j] : " ") + "</th>";
        }
    }
    else {
        for (var j = 0; j < this.storageData.cols.length; j++) {
            ret += "<th>" + this.storageData.cols[j].name + "</th>";
        }
    }

    ret += "</tr></thead><tbody>";

    if (cols == undefined) {
        cols = []
        for (var i = 0 ; i < this.storageData.cols.length ; i++)
            cols.push(this.storageData.cols[i].name)
    }
    //for (var i = 0 ; i < this.storageData.rows.length ; i++) {
    for (var i = 0 ; i < this.view.length ; i++) {
        ret += "<tr>";
        for (var j = 0; j < cols.length; j++) {
            ret += "<td>" + this.view[i].getItemDisplay(cols[j]) + "</td>";
        }
        ret += "</tr>";
    }

    ret += "</tbody></table>";


    ret = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">' +
        '<head><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>' + titlu + '</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml></head>' +
        '<body>' + ret + '</body></html>';
    return ret;
}

skunk.storage.prototype.foreachRow = function (f) {    
    for (var i = 0; i < this.length; i++) {
        var ok = f.bind(this)(this[i])
        if (ok === 0 || ok === false) return false;        
    }    
    return true;
}
//!!!!! de facut urmatoarea constructoie
skunk.storage.prototype.nextRow = function (r) {
    if (!this.length) return null;
    if (!r) return this[0];
    if (r.idx + 1 >= this.length) return null;
    return this[r.idx + 1];
}
//var r = null;
//while (r = selfthis.pozitii.next(r)) {


// intoarce null sau primul rand gasit
skunk.storage.prototype.find = function (expr) {
    var f = skunk.storage(this);
    f.filter(expr);
    if (f.view.length < 1) return null;
    return f.view[0];
}
// intoarce null sau primul rand gasit
skunk.storage.prototype.getDropDownRow = function (r,c) {
    var d = this.getDropDown(c);
    if (!d) return null;
    // e prea lung cu find->silter
   // return d.find(d.cols[0].name+"=="+r[c])
    //var cn = d.cols[0].name
    for (var i = 0; i < d.length; i++)
        if (d[i].getItem(0) == r[c])
            return d[i];
    return null;       
};
