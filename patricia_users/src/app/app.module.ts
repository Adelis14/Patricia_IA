import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms'; // <-- Add this import
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


//Pertenece ya a la conexion con backend
import { HttpClientModule } from '@angular/common/http';

//Componentes
import { UserDeepseekComponent } from './components/user-deepseek/user-deepseek.component';
import { InicioIujoComponent } from './components/inicio-iujo/inicio-iujo.component';


@NgModule({
  declarations: [
    AppComponent,
    UserDeepseekComponent,
    InicioIujoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
