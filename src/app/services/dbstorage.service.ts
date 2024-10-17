import { Key } from './../../../node_modules/ngx-indexed-db/lib/ngx-indexed-db.meta.d';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { NgxIndexedDBModule } from 'ngx-indexed-db';


@Injectable({
  providedIn: 'root'
})


export class LocalDBService {

  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init(); 
  }

  async init() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);
    const storage = await this.storage.create();
    this._storage = storage;
  }

  public registro(key: string, value:any){
    this._storage?.set(key, value);
  }

  public async login(key: string){
    const valor = await this._storage?.get(key);
    return valor
  }
}