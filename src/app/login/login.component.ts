import { Component, OnInit } from '@angular/core';
import {Router}  from '@angular/router';
import  msg from '../msg';
import skunkwebservice from '../skunk/skunkwebservice'
import {skunklogin} from '../skunk/skunkwebservice'
import skunkstorage from '../skunk/skunkstorage'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  user:string="";
  pass:string="";
  constructor(
     private router:Router 
  ) { }

  ngOnInit() {
   this.user="admin"
   this.pass="admin"
  }

  onlogin(){
    if(!this.user||!this.pass) return  msg("Completati utilizatorul si parola!")
    //this.router.navigate(["colectii"]);
    let selfthis=this;
skunklogin("sigma_factgest", this.user, this.pass,
                function (ok, dsVerifyLogin) {
                    if (!ok) return msg("Utilizatorul sau parola sunt incorecte!");
                
                    //gUserName = dsVerifyLogin[0].user_name;
                    //gUserNumeComplet = dsVerifyLogin[0].nume;
                    //skunk.open(selcolectie)
                     selfthis.router.navigate(["colectii"]);
                });


  }
  ontest(){
   if(!this.user||!this.pass) return  msg("Completati utilizatorul si parola!")
    //this.router.navigate(["colectii"]);
    let selfthis=this;
    skunklogin("sigma_factgest", this.user, this.pass,
                function (ok, dsVerifyLogin) {
                    if (!ok) return msg("Utilizatorul sau parola sunt incorecte!");
                
                    //gUserName = dsVerifyLogin[0].user_name;
                    //gUserNumeComplet = dsVerifyLogin[0].nume;
                    //skunk.open(selcolectie)
                     selfthis.router.navigate(["fc",143]);
                });


  }

  

}