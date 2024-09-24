import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cambiar',
  templateUrl: './cambiar.page.html',
  styleUrls: ['./cambiar.page.scss'],
})
export class CambiarPage implements OnInit {

  constructor(private router:Router) { }

  ngOnInit() {
  }

  cambiarContrasena(){
    this.router.navigate(['/home'])
  }
}