import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { Project, SchemaGroup } from 'src/app/Model/Request';
import { ModelLibrary } from 'src/app/Model/Request';
import { DBServiceService } from 'src/app/service/DBService.service';
import { TagData, TagifySettings } from 'ngx-tagify';

@Component({
  selector: 'app-CreateProject',
  templateUrl: './CreateProject.component.html',
  styleUrls: ['./CreateProject.component.css']
})
export class CreateProjectComponent implements OnInit {

  faTimesCircle = faTimesCircle;
  project! : Project;
  tags: TagData[] = [];

  settings: TagifySettings = {
    placeholder: 'Add tags start typing...',
    callbacks: {
      click: (e) => { console.log(e.detail); }
    }
  };

  constructor(public activeModal: NgbActiveModal,private service : DBServiceService) { 
      this.project = {
           orgName : "testorg",
           projectDescription : "",
           projectName : "",
           tags : [],
           schemas : [],
           rulebook : [],
           version : ""
      }
  }
  


  ngOnInit() {
  }

  dismiss()
  {
    this.activeModal.dismiss();
  }

  onSave()
  {
      this.project.tags = this.tags;
      this.service.addProject(this.project.projectName,this.project).subscribe((data : any) => {
        window.alert("Project added successfully");
        this.activeModal.close();
      });
  }

}
