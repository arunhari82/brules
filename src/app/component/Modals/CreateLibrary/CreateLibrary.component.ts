import { Component, OnInit,Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { SchemaGroup } from 'src/app/Model/Request';
import { ModelLibrary } from 'src/app/Model/Request';
import { DBServiceService } from 'src/app/service/DBService.service';

@Component({
  selector: 'app-CreateLibrary',
  templateUrl: './CreateLibrary.component.html',
  styleUrls: ['./CreateLibrary.component.css']
})
export class CreateLibraryComponent implements OnInit {

  faTimesCircle = faTimesCircle;
  constructor(public activeModal: NgbActiveModal,private service : DBServiceService) { 

  }
  @Input()
  schemaGroup! : SchemaGroup;
  library! : ModelLibrary;


  ngOnInit() {
     this.library = {
       id : 2,
       name : "",
       version : "",
       schemaGroupList : [this.schemaGroup]
     }
  }

  dismiss()
  {
    this.activeModal.dismiss();
  }

  onSave()
  {
    console.log(this.library);
    console.log(JSON.stringify(this.library));
    this.service.addLibrary(this.library.name,this.library).subscribe((data : any) => {
      window.alert("Library added successfully");
      this.activeModal.close(this.library);
    });
  }
 
}
