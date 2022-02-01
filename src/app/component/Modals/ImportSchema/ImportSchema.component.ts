import { Component, OnInit } from '@angular/core';
import { library } from '@fortawesome/fontawesome-svg-core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModelLibrary, Schema, SchemaGroup } from 'src/app/Model/Request';
import { DBServiceService } from 'src/app/service/DBService.service';

@Component({
  selector: 'app-ImportSchema',
  templateUrl: './ImportSchema.component.html',
  styleUrls: ['./ImportSchema.component.css']
})
export class ImportSchemaComponent implements OnInit {

  service! : DBServiceService;
  libraryList : ModelLibrary[] = [];

  constructor(public activeModal: NgbActiveModal,service : DBServiceService) { 
    this.service = service;    
  }

  ngOnInit() {

    this.service.fetchLibraryList().subscribe((data : any) => {
      if(data instanceof Array)
      {
         data.forEach((library : string) => {
           console.log(library);
           this.service.getLibrary(library).subscribe((data : any) => {
              this.libraryList.push(data);
           }); 
         });
        
      }
    });

  }

  onImport()
  {
     let selectedSchema : Array<ModelLibrary> = [];
     this.libraryList.forEach((library : ModelLibrary) => {
      if(library.isSelected)
         selectedSchema.push(library);
     });

     this.activeModal.close(selectedSchema);
  }

  dismiss()
  {
    this.activeModal.dismiss();
  }


}
