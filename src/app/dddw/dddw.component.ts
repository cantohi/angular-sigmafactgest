import { Component, OnInit,Input } from '@angular/core';
import{Observable,Subject} from 'rxjs'

@Component({
  selector: 'dddw',
  templateUrl: './dddw.component.html',
  styleUrls: ['./dddw.component.css']
})

export class DddwComponent implements OnInit {
  @Input() list$=[];
  list=[];
  listF=[];
  constructor(
  ) { }
  
search(s:string){  
  this.listF=this.list.filter(
    x=>{x.nume+='a'
      return(x.nume.toLowerCase().indexOf(s.toLowerCase())==0)
    }
  )
}

  ngOnInit() {    
    this.listF=[]; // initial nu afisam nimic
    this.list$.subscribe(x=>{
      this.list=x    
    });
    
  }

}