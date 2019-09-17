import { Injectable } from '@angular/core';
import  msg from './msg'

@Injectable()
export class MsgService {
  msg(s){
   return msg(s)
  }
}