import { Component, OnInit } from '@angular/core';
import{Router} from '@angular/router';
import {DataService} from '../data.service'
import {MsgService} from '../msg.service'

@Component({
  selector: 'app-list-colectii',
  templateUrl: './list-colectii.component.html',
  styleUrls: ['./list-colectii.component.css']
})

export class ListColectiiComponent implements OnInit {
    sel=null;  
    lista=[]
    constructor(
      private router:Router,
      private msgServ:MsgService,
      private dataServ:DataService
    ) { }

  ngOnInit() {       
        this.dataServ.get("lista_colectii").subscribe(
          l=>this.lista=l
        );
  }
  
   onselecteaza(){
     if(this.sel==null) 
        return this.msgServ.msg("Selectati o colectie")          
     this.router.navigate(['lista-fc',this.sel.colectie])
   }

}