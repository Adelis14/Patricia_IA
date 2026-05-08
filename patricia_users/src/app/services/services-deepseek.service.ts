import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServicesDeepseekService {

  url:string = 'https://patricia-ia.onrender.com/api/openai/'
  //url:string = 'https://assistant-iujo-api.vercel.app/api/openai/'

  constructor(
    private http: HttpClient
  ) { }

  async setPrompt(prompt:any): Promise<any>{
    debugger;

    const headers = new HttpHeaders({ 
      'Content-Type': 'application/json',
      'Bypass-Tunnel-Reminder': 'true'
    });

    return await firstValueFrom(this.http.post(`${this.url}prompt_gpt`, { prompt }, { headers }));
  }


}
