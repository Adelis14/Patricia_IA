import { Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inicio-iujo',
  templateUrl: './inicio-iujo.component.html',
  styleUrls: ['./inicio-iujo.component.css']
})
export class InicioIujoComponent implements OnInit {


  constructor(
   private router:Router
  ){}

  ngOnInit(): void {
  }


  redirigirPrompts(){
    this.router.navigate(['/gpt-user/prompts']);
  }

}
