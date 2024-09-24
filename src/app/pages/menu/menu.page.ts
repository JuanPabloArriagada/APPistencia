import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {

  userType: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Recoger el parámetro de la ruta
    this.userType = this.route.snapshot.paramMap.get('userType') || ''; 
    console.log('Tipo de Usuario:', this.userType);
  }
}
