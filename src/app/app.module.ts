import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { TreeModule } from '@circlon/angular-tree-component';
import { TagifyModule } from 'ngx-tagify'; 


import { AppComponent } from './app.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { DataLibraryComponent } from './component/DataLibrary/DataLibrary.component';
import { DataSchemaComponent } from './component/DataSchema/DataSchema.component';
import { ProjectComponent } from './component/project/project.component';
import { HighlightModule, HIGHLIGHT_OPTIONS,HighlightOptions } from 'ngx-highlightjs';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { JsonPipe } from '@angular/common';
import { CreateLibraryComponent } from './component/Modals/CreateLibrary/CreateLibrary.component';
import { CreateProjectComponent } from './component/Modals/CreateProject/CreateProject.component';
import { RuleDesignerComponent } from './component/RuleDesigner/RuleDesigner/RuleDesigner.component';
import { ProjectExploreComponent } from './component/ProjectExplore/ProjectExplore.component';
import { ImportSchemaComponent } from './component/Modals/ImportSchema/ImportSchema.component';
import { SaveRulebookComponent } from './component/Modals/SaveRulebook/SaveRulebook.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    DataLibraryComponent,
    DataSchemaComponent,
    ProjectComponent,
    CreateLibraryComponent,
    RuleDesignerComponent,
    CreateProjectComponent,
    ProjectExploreComponent,
    ImportSchemaComponent,
    SaveRulebookComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    FormsModule,
    HighlightModule,
    NgbModule,
    HttpClientModule,
    TreeModule,
    TagifyModule.forRoot()
  ],
  providers: [JsonPipe,
    {
    provide: HIGHLIGHT_OPTIONS,
    useValue: {
      coreLibraryLoader: () => import('highlight.js/lib/core'),
      languages: {
        xml: () => import('highlight.js/lib/languages/xml'),
        typescript: () => import('highlight.js/lib/languages/typescript'),
        scss: () => import('highlight.js/lib/languages/scss'),
        json: () => import('highlight.js/lib/languages/json'),
        css: () => import('highlight.js/lib/languages/css')
      }
    }
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
