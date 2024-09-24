import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  userType: string = '';

  constructor(private router:Router) { }

  ngOnInit() {
  }

  enviar(){
    this.router.navigate(['/menu' , { userType: this.userType }])
  }

  setUserType(type: string) {
    this.userType = type;
    
    console.log(this.userType);
  }

  recuperar(){
    this.router.navigate(['/recuperar'])
  }
}
