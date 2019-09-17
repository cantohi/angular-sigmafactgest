import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-msg',
  templateUrl: './msg.component.html',
  styleUrls: ['./msg.component.css']
})
export class MsgComponent implements OnInit {
  static appMsg:MsgComponent;
  txt="test"
  show="none"
  
  constructor() {    
    MsgComponent.appMsg=this;
    
   }
   
  ngOnInit() {
  }
  msg(txt){
    //alert(txt)
    this.txt=txt
    this.show="";
  }
  onclick(nr){
    this.show="none";
  }
}
export default function msg(txt){
  if(!MsgComponent.appMsg)
    return alert("test msg")
 MsgComponent.appMsg.msg(txt)  ;
}
