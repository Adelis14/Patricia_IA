import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//componentes
import { UserDeepseekComponent } from './components/user-deepseek/user-deepseek.component';
import { InicioIujoComponent } from './components/inicio-iujo/inicio-iujo.component';

const routes: Routes = [
  { path: '', redirectTo: 'gpt-user', pathMatch: 'full' },
  { path: 'gpt-user', component: InicioIujoComponent},
  { path: 'gpt-user/prompts', component: UserDeepseekComponent},
  { path: '**', redirectTo: 'gpt-user', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
