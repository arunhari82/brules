import { Component, OnInit } from '@angular/core';
import { Project } from 'src/app/Model/Request';
import { CreateProjectComponent } from '../Modals/CreateProject/CreateProject.component';
import { DataLibrary, Schema, Element, ModelLibrary } from 'src/app/Model/Request';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { DBServiceService } from 'src/app/service/DBService.service';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit {

  projectList : Project[] = [];
  service! : DBServiceService;

  constructor(private modalService: NgbModal,service : DBServiceService) { 
    this.service = service;
  }

  ngOnInit() {
    this.service.fetchProjectList().subscribe((data : any) => {
      if(data && data instanceof Array)
      {
         data.forEach((key : string) => {
            this.service.getProject(key).subscribe((projectData : any) => {
                 this.projectList.push(projectData);
            });
         })
      }
    });

  }

  public createProject() {
    const modalRef = this.modalService.open(CreateProjectComponent, { ariaLabelledBy: 'modal-basic-title', size: 'xl', backdrop: 'static' });
    modalRef.componentInstance.schemaList = {
      
    }
    modalRef.result.then(result =>{
      this.service.fetchProjectList().subscribe((data : any) => {
        if(data && data instanceof Array)
        {
           data.forEach((key : string) => {
              this.service.getProject(key).subscribe((projectData : any) => {
                   this.projectList.push(projectData);
              });
           })
        }
      });
    });
  }

}
