import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {


  userType: string;

  constructor() {
    this.userType = 'admin'; // Ejemplo: 'admin', 'usuario'
  }

  ngOnInit() {
  }

}
