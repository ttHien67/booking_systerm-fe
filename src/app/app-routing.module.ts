import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';



const routes: Routes = [
  {
    path: 'account', loadChildren: () => import('./account/account.module').then(m=> m.AccountModule)
  },
  {
    path: '',  loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule)
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules,
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {}