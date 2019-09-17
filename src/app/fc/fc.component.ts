import { Component, OnInit } from '@angular/core';
import{Router} from '@angular/router';
import {ActivatedRoute}  from '@angular/router';
import {DataService} from '../data.service'
import {MsgService} from '../msg.service'

@Component({
  selector: 'app-fc',
  templateUrl: './fc.component.html',
  styleUrls: ['./fc.component.css']
})
/*
antet
antet pac
pozitii
lista med
find_fc_deschisa_sect
dup_fc_list
dup_med_list
*/
export class FcComponent implements OnInit {
    idAntet=null
    antet={};
    pozitii=null
    dddwSectii=[];
   constructor(    
    private router:Router,
    private route:ActivatedRoute,
    private msgServ:MsgService,
    private dataServ:DataService
    ) 
    { }

  ngOnInit() {  
    this.dataServ.verifinit(); 
    this.route.paramMap.subscribe(
      p=>{
         this.loadFC(p.get("id")); 
                   
      })
  }
  loadFC(idAntet){
    this.idAntet=idAntet;
    
        //this.antet.setDropDown({ sectie_id: { code: "lista_sectii_fc", params: [gColectie, gSectPB] }, //medicsef_id: { code: "lista_medici_sefi", params: [gColectie, gColectie, gMedicSefPB] }, tip_mat: //"tip_mat", si_flt_fo: { code: "dd_grgest", params: [gColectie] } });
    

      this.dataServ.get("antet_fc",{ idant: this.idAntet }).subscribe(
          ant=>{                     
             this.antet=ant
          }
        );
       // this.dataServ.get("lista_sectii_fc",[this.dataServ.gColectie, this.dataServ.gSectPB] ).subscribe(
       //   l=>this.dddwSectii=l          
       // );
       this.dddwSectii= this.dataServ.get("lista_sectii_fc",[this.dataServ.gColectie, this.dataServ.gSectPB] )
  }

 onclose(){
  this.router.navigate(['lista-fc',1])
 }
}