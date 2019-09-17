export default function Skunkskdate(y,m,d)
 {
   //return skunk.SKDate(y,m,d);
   
   if (arguments.length == 0) return new skunk.SKDate();
  if (arguments.length == 1) return new skunk.SKDate(y);
  if (arguments.length == 2) return new skunk.SKDate(y, m);
  if (arguments.length == 3) return new skunk.SKDate(y, m, d);
}

let skunk={}

/* !!!!
am comentat 
if (this instanceof skunk.SKDate) throw ('Data invalida !!');                
in 3 locuri
*/

 skunk.SKDate=function(y, m, d) {  // constructor obiect

    //constructor autoapelat
     if (!(this instanceof skunk.SKDate)) {
         if (arguments.length == 0) return new skunk.SKDate();
         if (arguments.length == 1) return new skunk.SKDate(y);
         if (arguments.length == 2) return new skunk.SKDate(y, m);
         if (arguments.length == 3) return new skunk.SKDate(y, m, d);

    }

    // switch numeri parametrii 
    switch (arguments.length) {
        case 0: // fara parametrii - ziua curenta
            var x = new Date();
            y = x.getFullYear();
            m = x.getMonth() + 1;
            d = x.getDate();
            break;
        case 1: // 1 parametru de tip string separat prin  . - , sau /
            var parts = y.split(/[\s,-.\/]+/), format, i;
            if (parts.length != 3) {               
                if (this instanceof skunk.SKDate) throw ('Data invalida !!');                
                return null;
            }
            format = parts[0].length == 4 ? 0 : 1;
            for (i = 0; i < 3; i += 1) {
                while (parts[i].substring(0,1) == '0') {
                    parts[i] = parts[i].substring(1);
                }
            }
            d = (format) ? parseInt(parts[0]) : parseInt(parts[2]);
            m = parseInt(parts[1]);
            y = (format) ? parseInt(parts[2]) : parseInt(parts[0]);
            break;
        case 3: // 3 parametrii ... an , luna , zi
            break;
        default:
            if (this instanceof skunk.SKDate) throw ('Data invalida !!');
            return null;
    };
    
    Object.defineProperty(this, "day", { value: d, writable: false });
    Object.defineProperty(this, "month", { value: m, writable: false });
    Object.defineProperty(this, "year", { value: y, writable: false });
    Object.defineProperty(this, "an_bisect", { value: this.isBisect(y), writable: false });
    Object.defineProperty(this, "days_in_month", { value: [0, 31, this.an_bisect ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], writable: false });
    Object.defineProperty(this, "months_labels", { value: ['', 'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'], writable: false });
    Object.defineProperty(this, "months_short_labels", { value: ['', 'Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Noi', 'Dec'], writable: false });

    if (arguments.length != 0 && !this.isSKDate()) {
        if (this instanceof skunk.SKDate) throw ('Data invalida !!');
        return null;
    }
}



 skunk.SKDate.tryParse=function(s){     
     try {
         return new skunk.SKDate(s);
     } catch (ex) {
         return null;
     }
 }

// *************************************** metode obiect skunk.SKDate

// isDate - verificare data valida - return true/false
skunk.SKDate.prototype.isSKDate = function () {
    return (this.year > 0 && this.month > 0 && this.month <= 12 && this.day > 0 && this.day <= this.days_in_month[this.month]);
}

// isBisect - determinare an bisect - parametru anul - return true/false
skunk.SKDate.prototype.isBisect = function (a) {
    return ((a % 4 == 0) && ((a % 100 != 0) || (a % 400 == 0)));
} 

//toString()
//conversie la string cu sau fara parametrul de masca cu separatori (- , . /)
//yyyy.mm.dd sau dd.mm.yyyy sau yyyy.mm sau mm.yyyy 
//yyyy mmm dd sau dd mmm yyyy sau yyyy mmm sau mmm yyyy  ,unde  mmm = inseamna denumirea scurta a lunii cu separator spatiu
//yyyy MMM dd sau dd MMM yyyy sau yyyy MMM sau MMM yyyy  ,unde  MMM = inseamna denumirea completa a lunii cu separator spatiu
skunk.SKDate.prototype.toString = function (mask) {
    var luna = ('0' + this.month).right(2)
    var ziua = ('0' + this.day).right(2)

    if (arguments.length == 0) {  // apelare fara parametru de masca : returnez  dd.mm.yyyy (separator in functie de setarile din calc)
        return ziua + "/" + luna + "/" + this.year;
        //.. NU MERGE var reg = new SRegionSettings();
        //2016.07.15 - reg.data_sep are lungime de 3 ??? nmu stiu de ce sunt caractere aiurea - cel putin cand sunt setari pe ENGLEZA
        reg.data_sep="."
        return ziua + reg.data_sep + luna + reg.data_sep + this.year;
    }

    if (mask.indexOf("MMM") > -1 || mask.indexOf("mmm") > -1) { luna = mask.indexOf("MMM") > -1 ? this.months_labels[this.month] : this.months_short_labels[this.month]; }

    var parts_m = mask.split(/[\w]+/);
    var sep = '-';
    if (parts_m.length >= 2) { sep = parts_m[1]; }
    parts_m = mask.split(sep);

    switch (parts_m.length) {
        case 2:
            if (parts_m[0].toUpperCase() == 'YYYY') {
                return this.year + sep + luna;
            }
            else {
                return luna + sep + this.year;
            }
        case 3:
            if (parts_m[0].toUpperCase() == 'YYYY') {
                return this.year + sep + luna + sep + ziua;
            }
            else {
                return ziua + sep + luna + sep + this.year;
            }
        default: {
            return 'Format invalid';
        }
    }
}

// addDays(zile) - adaugare zile la data obiectului - parametru numeric pozitiv - aduna , negativ - scade - return skunk.SKDate
skunk.SKDate.prototype.addDays = function (zile) {
    var an = this.year, luna = this.month, zi = this.day
    if (arguments.length == 1 && typeof zile === 'number' && !isNaN(zile) && zile != 0) {
        var dif, zilemax
        if (zile < 0) {  //scad zile
            do {
                dif = zi
                if (zi + zile <= 0) {
                    luna -= 1;
                    if (luna == 0) {
                        luna += 12;
                        an -= 1;
                    }
                    zilemax = ((this.isBisect(an) && luna == 2) ? 29 : this.days_in_month[luna])
                    zi = zilemax;
                } else {
                    zi += zile;
                    break;
                }
                zile += dif;
            } while (zile < 0);
        } else {  // adun zile
            zilemax = this.days_in_month[luna]
            do {
                dif = zilemax - zi + 1
                if (zi + zile > zilemax) {
                    luna += 1;
                    if (luna > 12) {
                        luna -= 12;
                        an += 1;
                    }
                    zilemax = ((this.isBisect(an) && luna == 2) ? 29 : this.days_in_month[luna])
                    zi = 1;
                } else {
                    zi += zile;
                    break;
                }
                zile -= dif;
            } while (zile > 0);
        }
    }
    return skunk.SKDate(an, luna, zi);
}

// addMonths(luni) - adaugare de luni la data obiectului - parametru numeric pozitiv - aduna , negativ - scade - return skunk.SKDate
skunk.SKDate.prototype.addMonths = function (luni) {
    var an = this.year, luna = this.month, zi = this.day
    if (arguments.length == 1 && typeof luni === 'number' && !isNaN(luni) && luni != 0) {
        var xluni = luna + luni;
        if (luni > 0) { // adun luni
            an += parseInt(xluni / 12);
            luna = xluni % 12;
        } else { // scad luni
            an -= (xluni <= 0) ? (1 - parseInt(xluni / 12)) : 0;
            luna = (xluni <= 0) ? 12 + xluni % 12 : xluni;
        }
        var bisect = (this.isBisect(an) && luna == 2)
        zi = (zi > (bisect ? 29 : this.days_in_month[luna])) ? (bisect ? 29 : this.days_in_month[luna]) : zi
    }
    return skunk.SKDate(an, luna, zi);
}

//addYears(ani) - adaugare de ani la data obiectului - parametru pozitiv - aduna , negativ - scade - return skunk.SKDate
skunk.SKDate.prototype.addYears = function (ani) {
    var an = this.year, luna = this.month, zi = this.day
    if (arguments.length == 1 && typeof ani === 'number' && !isNaN(ani) && ani != 0) {
        an += ani;
        zi = (zi == 29 && luna == 2 && !this.isBisect(an)) ? 28 : zi
    }
    return skunk.SKDate(an, luna, zi);
}

//equal(d) - verfica egalitatea intre data obiectului si data din parametru - return true/false
skunk.SKDate.prototype.equal = function (d) {
    return this.valueOf() == d.valueOf();
}

//notEqual(d) - verfica inegalitatea intre data obiectului si data din parametru - return true/false
skunk.SKDate.prototype.notEequal = function (d) {
    return !this.equal(d);
}

//diff(d) - calculeaza diferenta in  ani , luni si zile dintre data obiectului si data din parametru - return object years:x , months:y , days:z
skunk.SKDate.prototype.diff = function (d) {
    if (this.equal(d)) {
        return {
            years: 0,
            months: 0,
            days: 0
        }
    }
    var dani, dluni, dzile
    var d1 = this, d2 = d
    if (d1 > d2) {
        d1 = d;
        d2 = this;
    }
    dani = d2.year - d1.year;
    dluni = d2.month - d1.month;
    dzile = d2.day - d1.day
    if (dluni < 0) {
        dluni = 12 + dluni;
        dani -= 1;
    }
    if (dzile < 0) {
        dzile = d1.days_in_month[d1.month] - d1.day + d2.day;
        dluni -= 1;
        if (dluni < 0) {
            dluni = 12 + dluni;
            dani -= 1;
        }
    }
    return {
        years: dani,
        months: dluni,
        days: dzile
    }
}

//diffDays(d) - calculeaza diferenta in zile dintre data obiectului si data din parametru - return numeric (+ sau -)
skunk.SKDate.prototype.diffDays = function (d) {
    var zile1, zile2
    zile1 = this.year * 365 + this.day;
    for (var i = 1; i < this.month; i += 1) {
        zile1 += this.days_in_month[i];
    }
    zile2 = d.year * 365 + d.day;
    for (var i = 1; i < d.month; i += 1) {
        zile2 += d.days_in_month[i];
    }
    for (var i = (this.year < d.year ? this.year : d.year) ; i < (this.year < d.year ? d.year : this.year) ; i += 1) {
        if (this.year < d.year) {
            zile2 += (this.isBisect(i)) ? 1 : 0;
        }
        else {
            zile1 += (this.isBisect(i)) ? 1 : 0;
        };
    }
    return (zile2 - zile1);
}

//diffMonths(d) - calculeaza diferenta in luni dintre data obiectului si data din parametru - return numeric (+ sau -)
skunk.SKDate.prototype.diffMonths = function (d) {
    return ((d.year * 12 + d.month) - (this.year * 12 + this.month));
}

//diffYears(d) - calculeaza diferenta in ani dintre data obiectului si data din parametru - return numeric (+ sau -)
skunk.SKDate.prototype.diffYears = function (d) {
    return (d.year - this.year);
}

//lastDayOfWeek() - Returneaza ultima zi din saptamana datei obiectului. - return skunk.SKDate.
skunk.SKDate.prototype.lastDayOfWeek = function () {
    var xa = this.year, xl = this.month, xz = this.day
    xz += 7 - this.dayOfWeek();
    if (xz > this.days_in_month[xl]) {
        xl += 1
        if (xl > 12) {
            xa += 1
            xl = 1
        }
        xz -= (this.isBisect(xa) && xl == 2) ? 29 : this.days_in_month[xl]
    }
    return skunk.SKDate(xa, xl, xz);
}

//lastDayOfMonth() - Returneaza ultima zi din luna datei obiectului. - return skunk.SKDate.
skunk.SKDate.prototype.lastDayOfMonth = function () {
    return skunk.SKDate(this.year, this.month, this.days_in_month[this.month]);
}

//lastDayOfYear() - Returneaza ultima zi din anul datei obiectului. - return skunk.SKDate.
skunk.SKDate.prototype.lastDayOfYear = function () {
    return skunk.SKDate(this.year, 12, 31);
}

//firstDayOfWeek() - Returneaza prima zi din saptamana datei obiectului. - return skunk.SKDate.
skunk.SKDate.prototype.firstDayOfWeek = function () {
    var xa = this.year, xl = this.month, xz = this.day
    xz -= this.dayOfWeek() - 1;
    if (xz <= 0) {
        xl -= 1
        if (xl == 0) {
            xa -= 1
            xl = 12
        }
        xz += (this.isBisect(xa) && xl == 2) ? 29 : this.days_in_month[xl]
    }
    return skunk.SKDate(xa, xl, xz);
}

//firstDayOfMonth() - Returneaza prima zi din luna datei obiectului. - return skunk.SKDate.
skunk.SKDate.prototype.firstDayOfMonth = function () {
    return skunk.SKDate(this.year, this.month, 1);
}

//firstDayOfYear() - Returneaza prima zi din anul datei obiectului. - return skunk.SKDate.
skunk.SKDate.prototype.firstDayOfYear = function () {
    return skunk.SKDate(this.year, 1, 1);
}

//dayOfWeek() - Returneaza un numar intreg care reprezinta ziua din saptamana. Consideram prima zi din saptamana luni = 1 si duminica = 7 ultima zi din spatamana. - return numeric (1-7). 
skunk.SKDate.prototype.dayOfWeek = function () {
    var refd = new skunk.SKDate(2007, 1, 1); // 1 ianuarie 2007 a fost luni = ziua 1 din saptamana
    var xdays = refd.diffDays(this)
    if (xdays < 0) {
        return 1 + (7 + xdays % 7);
    }
    return 1 + xdays % 7;
}

//valueOf()
// return string 'yyyy-mm-dd'
skunk.SKDate.prototype.valueOf = function () {
    return this.year + '-' + ('0' + this.month).right(2) + '-' + ('0' + this.day).right(2);
}
//*********************************************************************

//toJSON()
skunk.SKDate.prototype.toJSON = function () {
    return this.year + '-' + ('0' + this.month).right(2) + '-' + ('0' + this.day).right(2);
}


String.prototype.right = function (n) {
    return isNaN(n) ? null : this.substr(this.length - n, n);
}

String.prototype.left = function (n) {
    return isNaN(n) ? null : this.substr(0, n);
}