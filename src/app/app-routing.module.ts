import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { DataLibraryComponent } from './component/DataLibrary/DataLibrary.component';
import { DataSchemaComponent } from './component/DataSchema/DataSchema.component';
import { ProjectComponent } from './component/project/project.component';
import { RuleDesignerComponent } from './component/RuleDesigner/RuleDesigner/RuleDesigner.component';
import { ProjectExploreComponent } from './component/ProjectExplore/ProjectExplore.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path : 'dashboard',component : DashboardComponent},
  { path : 'datalib',component : DataLibraryComponent},
  { path : 'schemas',component : DataSchemaComponent},
  { path : 'projects',component : ProjectComponent},
  { path : 'designer',component : RuleDesignerComponent},
  { path : 'project/:project',component : ProjectExploreComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
