import { Component, OnInit } from '@angular/core';
import{Router} from '@angular/router';
import {ActivatedRoute}  from '@angular/router';
import {DataService} from '../data.service'
import {MsgService} from '../msg.service'

@Component({
  selector: 'app-list-fc',
  templateUrl: './list-fc.component.html',
  styleUrls: ['./list-fc.component.css']
})
/*
de facut
!!! initializarea din pb - din param http
maio sunt 2 ds-uri - la ce folosesc
data1 - val init - 3 zile
*/
export class ListFcComponent implements OnInit {  
  lista_foi=[]
  sel=null
  param={
    nrfoaie:null,
    finalizat:null,
    sectie_id:null,
    data1:null,//Date.now()-3,
    data2:null
  }
  constructor(
    private router:Router,
    private route:ActivatedRoute,
    private msgServ:MsgService,
    private dataServ:DataService
    ) 
    { }

  ngOnInit() {
    this.route.paramMap.subscribe(
      p=>{
        this.dataServ.gColectie=p.get("col");    
        this.displayFCList()
      })
  }
  displayFCList(){
    /*
    this.lista_foi.retrieve({
                ra_fo: gFoPB, ra_act: this.param.nrfoaie, ra_finalizat: this.param.finalizat, ra_colectie: gColectie, ra_sectie: gSectPB,
                ra_aparat0: gPBAparat,   // trebuie ca parametri sa fie in ordine - da aia sunt duplicati
                ra_med: gFoPB == null ? gMedicSefPB : null,
                ra_aparat: gPBAparat,         ra_sect:this.param.sectie_id, ra_d1:this.param.data1, ra_d2:this.param.data2
            });
            */
        this.dataServ.get("lista_foi_condica",
        {
          ra_fo: this.dataServ.gFoPB, ra_act: this.param.nrfoaie, ra_finalizat: this.param.finalizat,
          ra_colectie: this.dataServ.gColectie, ra_sectie: this.dataServ.gSectPB,
          ra_aparat0: this.dataServ.gPBAparat,   // trebuie ca parametri sa fie in ordine - da aia sunt duplicati
          ra_med: this.dataServ.gFoPB == null ? this.dataServ.gMedicSefPB : null,
          ra_aparat: this.dataServ.gPBAparat,
          ra_sect:this.param.sectie_id, ra_d1:this.param.data1, ra_d2:this.param.data2
        }).subscribe(
          l=>this.lista_foi=l
        );
  }

  oneditare(){
   //this.msgServ.msg("test")          
   //this.router.navigate(['lista-fc',this.sel.colectie])   
     if(this.sel==null) 
        return this.msgServ.msg("Selectati o FC")    
     if (this.dataServ.gPBAparat && !this.sel.aparat)
                return this.msgServ.msg("Nu puteti edita o foaie care nu e de aparat in aceasta fereastra. Puteti doar sa o tipariti!");

     this.router.navigate(['fc',this.sel.fc_id])   
  }
}
