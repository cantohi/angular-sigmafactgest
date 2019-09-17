import { Injectable } from '@angular/core';
import {Observable,of} from 'rxjs'
import skunkstorage from './skunk/skunkstorage'

@Injectable()
export class DataService {  
  gColectie = null;
//  gIsFifoOnline = 0;
//  gPosibilFifoOnline = 0;
//  gUserName = null;
//  gUserNumeComplet = null;

    //pb interface
  //gPBInit = 0;
  //gPB = 0;
  //gColPB=null
  //gUsrPB=null;
  //gPwdPB=null;
  gFoPB=null;//din spit
  //gPacPB = null;// din medis
  //gNrRegAmbPB = null;// din medis
  gSectPB=null;
  //gMedicPB=null;
  gMedicSefPB = null;
  //gLucrID = null;
  gPBAparat = 1;
  //gDecontEmis = 0;
  //gDreptReemitereDecont = 0;
  //gFiecareUserCuFoaiaLui=0 
  //gTiparireOSinguraData=0
  //gDuplicareFcAnterioare=0
    
  constructor() { }

init=0;
verifinit(){
  //date de test la apel direct - sa o blochez daca nu sunt eu
  // e nevoie pentru ca se reincarca direct pagina cand fac modificari
  if(this.init) return;
  this.gColectie=1;
}



public getHeroes():Observable<Hero[]>{
    this.msgService.add("Lista eroi apelata")
    //return of( heroes_init); 
    
  ret=this.httpClient.get<Hero[]>(this.url)
      .pipe(
        tap((x)=>this.log("date primite p1"+JSON.stringify(x))),
        catchError(this.handleError('getHeroes',[{name:"lipsa",id:-9}]))  ,
        tap((x)=>this.log("date primite p2"+JSON.stringify(x))),
       );
   
    this.msgService.add("Lista eroi end apel")
    return ret

  }

public get(sql:string,param={}):Observable<Object[]>{
  let ds =  skunkstorage() 
    ds.setSqlSelect(sql);
    ds.retrieve(param) //{ idant: idAntet });
  let selfthis=this
  let rez=[];
    ds.onretrieveend = function () {          
      for(var i=0;i<ds.length;i++)
        rez.push(ds[i])                 
    }
    return of(rez);
  }



}