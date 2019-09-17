import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { HelloComponent } from './hello.component';
import { LoginComponent } from './login/login.component';
import { MsgComponent } from './msg/msg.component';
import { ListColectiiComponent } from './list-colectii/list-colectii.component';
import { ListFcComponent } from './list-fc/list-fc.component';
import { DataService } from './data.service';
import { MsgService } from './msg.service';
import { FcComponent } from './fc/fc.component';
import { DddwComponent } from './dddw/dddw.component';

@NgModule({
  imports:      [ BrowserModule, FormsModule,
  RouterModule.forRoot([
      { path: '', component: LoginComponent },
      { path: 'colectii', component: ListColectiiComponent },
      { path: 'lista-fc/:col', component: ListFcComponent },
      { path: 'fc/:id', component: FcComponent },
      //{ path: 'aa/:idx', component: ProductDetComponent },
      //{ path: 'cart', component: CartComponent },
      //{ path: 'preturitransport', component: ListaPreturiTransportComponent },
    ])
   ],
  declarations: [ AppComponent, HelloComponent, LoginComponent, MsgComponent, ListColectiiComponent, ListFcComponent, FcComponent, DddwComponent ],
  bootstrap:    [ AppComponent ],
  providers: [DataService, MsgService],
  
})
export class AppModule { }
