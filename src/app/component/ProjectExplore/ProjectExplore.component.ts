import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Editor, ModelLibrary, Project, ProjectNodeData, RuleBook, Schema } from 'src/app/Model/Request';
import { DBServiceService } from 'src/app/service/DBService.service';
import { ImportSchemaComponent } from '../Modals/ImportSchema/ImportSchema.component';
import { TreeComponent } from '@circlon/angular-tree-component';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-ProjectExplore',
  templateUrl: './ProjectExplore.component.html',
  styleUrls: ['./ProjectExplore.component.css']
})
export class ProjectExploreComponent implements OnInit {
  isLoading : boolean = false;
  loadingText : string = "";
  rulebookPrefix: string = "RB";
  rulebookIndex: number = 1;
  dmnPrefix: string = "DMN";
  dmnIndex: number = 1;
  schemaPrefix: string = "Sch";
  schemaIndex: number = 1;
  portno : number = 9091;
  

  projectId!: string;
  service!: DBServiceService;
  project!: Project;
  nodes: ProjectNodeData[] = [];
  @ViewChild(TreeComponent)
  private tree!: TreeComponent;

  selectedNode!: ProjectNodeData;
  mode: string = "edit";

  options = {
    allowDrag: false,
    allowDrop: false
  }


  openedEditors: Editor[] = [];
  active: string = "";

  constructor(private route: ActivatedRoute, service: DBServiceService, private modalService: NgbModal) {
    this.service = service;
  }


  close(event: MouseEvent, toRemove: Editor) {
    this.openedEditors = this.openedEditors.filter(id => id !== toRemove);
    event.preventDefault();
    event.stopImmediatePropagation();
    if (this.openedEditors.length > 0)
      this.active = this.openedEditors[0].id;
  }

  closeTab(activeTab: string) {
    this.openedEditors = this.openedEditors.filter(id => id.id !== activeTab);
    if (this.openedEditors.length > 0)
      this.active = this.openedEditors[0].id;
  }

  add(event: MouseEvent) {

  }

  onAddDMN()
  {
    let editor: Editor = {
      id: "Untitled" + this.dmnPrefix + " - " + this.dmnIndex,
      mode: "new",
      selectedNode: {
        children: [],
        isRoot: true,
        name: "Untitled",
        type: "DMN"
      }
    }

    this.openedEditors.push(editor);
    this.active = editor.id;
    this.dmnIndex++;
  }

  onAddRuleBook() {
    let editor: Editor = {
      id: "Untitled" + this.rulebookPrefix + " - " + this.rulebookIndex,
      mode: "new",
      selectedNode: {
        children: [],
        isRoot: true,
        name: "Untitled",
        type: "Rulebook"
      }

    }

    this.openedEditors.push(editor);
    this.active = editor.id;
    this.rulebookIndex++;
  }

  onAddNewSchema() {
    let editor: Editor = {
      id: "Untitled" + this.schemaPrefix + " - " + this.schemaIndex,
      mode: "new",
      selectedNode: {
        children: [],
        isRoot: true,
        name: "Untitled",
        type: "Schema"
      }

    }

    this.openedEditors.push(editor);
    this.active = editor.id;
    this.schemaIndex++;
  }


  openTabSchema(library: ModelLibrary) {
    let editor: Editor = {
      id: library.name + "",
      mode: "edit",
      selectedNode: {
        isRoot: false,
        children: [],
        name: library.name,
        type: "Schema"
      }
    }
    this.openedEditors.push(editor);

  }

  onNodeSelect($event: any) {

    console.log($event.node.data);
    this.selectedNode = $event.node.data
     if (this.selectedNode.type == "Library" || this.selectedNode.type == "Books")
         return; 

    let id: string = this.selectedNode.name;

    let editor: Editor = {
      id: id,
      mode: "edit",
      selectedNode: JSON.parse(JSON.stringify(this.selectedNode))
    }

    let canAdd: boolean = true;
    for (var i = 0; i < this.openedEditors.length; i++) {
      if (this.openedEditors[i].id == id) {
        canAdd = false;
        break;
      }
    }

    if (canAdd)
      this.openedEditors.push(editor);

    this.active = id;
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      if (params.get('project') != null) {
        var projectid = params.get('project');
        this.projectId = projectid ? projectid : "";
        this.service.getProject(this.projectId).subscribe((data: any) => {
          this.project = <Project>data;
          let projectTree: ProjectNodeData = {
            name: this.project.projectName,
            type: "Project",
            isRoot: true,
            children: [
              {
                name: "DataModels",
                type: "Library",
                isRoot: false,
                children: []
              },
              {
                name: "RuleBooks",
                type: "Books",
                isRoot: false,
                children: []
              },
              {
                name: "DMN",
                type: "DMN",
                isRoot: false,
                children: []
              }
            ]
          };
          if(this.project.rulebook != null && this.project.rulebook.length > 0)
          {
              this.project.rulebook.forEach((data : string) => {
                 projectTree.children[1].children.push({
                  name: data,
                  type: "Rulebook",
                  isRoot: false,
                  children: []
                 });
              });
          }
          if(this.project.schemas != null && this.project.schemas.length > 0)
          {
              this.project.schemas.forEach((data : string) => {
                 projectTree.children[0].children.push({
                  name: data,
                  type: "Schema",
                  isRoot: false,
                  children: []
                 });
              });
          }

          this.nodes = [];
          this.nodes.push(projectTree);
          this.tree.treeModel.expandAll();
        })
      }
    });
  }

  onUpdateData() {
    this.tree.treeModel.expandAll();
  }

  ngAfterViewInit() {
    this.tree.treeModel.expandAll();
  }

  /* Tools */
  public openImportSchema() {
    const modalRef = this.modalService.open(ImportSchemaComponent, { ariaLabelledBy: 'modal-basic-title', size: 'md', backdrop: 'static' }).result.then((result: any) => {
      let libraryList: Array<ModelLibrary> = result;
      libraryList.forEach((library: ModelLibrary) => {
        this.addSchematoDataModel(library);
      });
      this.updateProject();
      this.tree.treeModel.update();

    });
  }

  public onNewSaveModel($event: any) {
    console.log($event);
    let library: ModelLibrary = <ModelLibrary>$event.result;
    let editor: Editor = <Editor>$event.editor;
    editor.id = library.name;
    if(!this.checkSchemaAlreadyExists(library.name))
       this.addSchematoDataModel(library);
    this.updateProject();
    /* this.closeTab(this.active);
    this.openTabSchema(library);
*/
    this.tree.treeModel.update();
    this.tree.treeModel.expandAll();
  }

  public onNewSaveRuleBook($event: any) {
    console.log($event);
    let rulebook: RuleBook = <RuleBook>$event.result;
    let editor: Editor = <Editor>$event.editor;
    editor.id = rulebook.name;
    if(!this.checkRuleBookAlreadyExists(rulebook.name))
         this.addRulebookToProject(rulebook);
    this.tree.treeModel.update();
    this.tree.treeModel.expandAll();
    this.updateProject();
  }


  private checkSchemaAlreadyExists(schemaName : string) : boolean
  {
       let schemaExists : boolean = false;
       this.nodes[0].children.forEach((children: ProjectNodeData) => {
          if (children.name == "DataModels") {
              children.children.forEach((grandChild : ProjectNodeData) =>{
                  if(grandChild.name == schemaName)
                     schemaExists = true;
              });
          }
       });
       return schemaExists;
  }

  private checkRuleBookAlreadyExists(rulebookName : string) : boolean
  {
       let rulebookExists : boolean = false;
       this.nodes[0].children.forEach((children: ProjectNodeData) => {
          if (children.name == "RuleBooks") {
              children.children.forEach((grandChild : ProjectNodeData) =>{
                  if(grandChild.name == rulebookName)
                     rulebookExists = true;
              });
          }
       });
       return rulebookExists;
  }

  private updateProject() {
    this.service.updateProject(this.project.projectName,this.project).subscribe((data : any) => {});
  }

  private addRulebookToProject(rulebook: RuleBook) {
    this.nodes[0].children.forEach((children: ProjectNodeData) => {
      if (children.name == "RuleBooks") {
        let grandChild: ProjectNodeData = {
          name: rulebook.name,
          type: "Rulebook",
          isRoot: false,
          children: []
        };

        children.children.push(grandChild);
        this.tree.treeModel.update();
        this.tree.treeModel.expandAll();
        if (this.project.rulebook == null) {
          this.project.rulebook = new Array();
          this.project.rulebook.push(rulebook.name);
        }
        else {
          this.project.rulebook.push(rulebook.name);
        }
      }
    });
  }

  private addSchematoDataModel(library: ModelLibrary) {
    this.nodes[0].children.forEach((children: ProjectNodeData) => {
      if (children.name == "DataModels") {
        let grandChild: ProjectNodeData = {
          name: library.name,
          type: "Schema",
          isRoot: false,
          children: []
        };

        children.children.push(grandChild);
        this.tree.treeModel.update();
        this.tree.treeModel.expandAll();
       
          if (this.project.schemas == null) {
            this.project.schemas = new Array();
            this.project.schemas.push(library.name);
          }
          else {
            this.project.schemas.push(library.name);
          }
        
       
      }
    });
  }

  //Project Build/Deploy
  onProjectBuild()
  {
    this.isLoading = true;
    this.loadingText = "Building Project";
    // window.alert("on Project build");
    let subject : Subject<object>  =  this.service.buildProjectRequest(this.project);
    subject.subscribe({
      next : (data : any) => {
        console.log(data);
        this.isLoading = false;
      }
    })
     
  }

  onDeployProject()
  {
    this.isLoading = true;
    this.loadingText = "Deploying Project on port " + this.portno;
     this.service.deployProject(this.project,this.portno).subscribe((data : any) => {
      this.isLoading = false;
      let url = "http://localhost:"+this.portno+"/q/swagger-ui";
      console.log(url);
      window.open(url, "",'fullscreen=no');
     });
  }


}
