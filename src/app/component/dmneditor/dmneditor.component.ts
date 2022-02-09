import { Component, Input, OnInit } from '@angular/core';
import * as DmnEditor from "@kogito-tooling/kie-editors-standalone/dist/dmn";
import { StandaloneEditorApi } from "@kogito-tooling/kie-editors-standalone/dist/common/Editor";
import { Editor, Project } from 'src/app/Model/Request';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DBServiceService } from 'src/app/service/DBService.service';

@Component({
  selector: 'app-dmneditor',
  templateUrl: './dmneditor.component.html',
  styleUrls: ['./dmneditor.component.css']
})
export class DmneditorComponent implements OnInit {

  dmnEditor!: StandaloneEditorApi;
  currentFileName!: string;

  @Input()
  editor!: Editor;
  @Input()
  mode!: string;
  @Input()
  project!: Project;

  isLoading : boolean = false;
  loadingText : string = "";

  service!: DBServiceService;

  constructor(private modalService: NgbModal, service: DBServiceService) {
    this.service = service;
  }

  ngOnInit() {

  }

  ngAfterViewInit() {  
    if (this.mode == "new") {
      this.isLoading = true;
      this.loadingText = "Initializing DMN with schemas. Please wait"; 
      this.service.generateDMN(this.project).subscribe((data: any) => {
        console.log(data.dmnXML);
        var resources = new Map();
        let content: string = data.dmnXML;
        let args = {
          container: document.getElementById("bpmn-editor" + this.editor.id)!,
          initialContent: Promise.resolve(content),
          readOnly: false,
          origin: "*",
          resources: resources

        };
        this.dmnEditor = DmnEditor.open(args);
        setTimeout(()=>{this.isLoading = false},2000);
      });
    }


  }

  public onClose() {
    if (this.dmnEditor) {
      this.dmnEditor.close();
      this.currentFileName = ""; // reset the file name
    }
  }


}
