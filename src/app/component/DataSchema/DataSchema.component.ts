import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DataLibrary, Schema, Element, ModelLibrary, SchemaGroup, Editor, TreeNodeData } from 'src/app/Model/Request';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { CreateLibraryComponent } from '../Modals/CreateLibrary/CreateLibrary.component';
import { DBServiceService } from 'src/app/service/DBService.service';

@Component({
  selector: 'app-DataSchema',
  templateUrl: './DataSchema.component.html',
  styleUrls: ['./DataSchema.component.css']
})
export class DataSchemaComponent implements OnInit {

  @Input()
  mode! : string;
  @Input()
  libraryKey! : string;
  @Input()
  editor! : Editor;

  @Output()
  saveJsonObject : EventEmitter<Object> = new EventEmitter();

  nodes : TreeNodeData[] = [];
  options = {
    allowDrag: false,
    allowDrop: false
  }

  dataList!: DataLibrary[];
  schemaList!: Schema[];
  generatedSchemaList!: Schema[];
  schemaGroup! : SchemaGroup;
  currentSchema!: Schema;
  jsonData: string = "";
  drlModel: string = "";
  modelName : string = "";
  service! : DBServiceService;


  constructor(private modalService: NgbModal,service : DBServiceService) { 
    this.service = service;
  }

  public saveCreatedSchema() {
    const modalRef = this.modalService.open(CreateLibraryComponent, { ariaLabelledBy: 'modal-basic-title', size: 'md', backdrop: 'static' });
     
    modalRef.result.then((result : any) => {
        this.saveJsonObject.emit({result : result,editor : this.editor});
    });
    this.schemaGroup = {
      drl : this.drlModel,
      schemaList : this.generatedSchemaList
    }
    
    modalRef.componentInstance.schemaGroup = this.schemaGroup;
  }

  onDeleteElement(rec : Schema,element : Element)
  {
     rec.elements = rec.elements.filter((ele : Element) => {
        if(ele.nodeid == element.nodeid)
          return false;
        else
          return true;  
     });
     this.generateDRLModel();
  }

  onAddNewElement(rec : Schema)
  {
     var element : Element = {
        datatype : "string",
        isList : false,
        name : "",
        nodeid : rec.elements.length + 1
     }

     rec.elements.push(element);
     this.generateDRLModel();
  }

  private updateSchemaReferences(oldValue : string,newValue : string)
  {
      if(oldValue == "")
        return;
      this.generatedSchemaList.forEach((currentSchema : Schema)  => {
          currentSchema.elements.forEach((element : Element) => {
              if(element.datatype == oldValue)
                  element.datatype = newValue;
          });
      });
  }


  public generateDRLModelAfterUpdateRef(value : string)
  {
     this.updateSchemaReferences(this.modelName,value);
     this.generateDRLModel();
  } 

  public generateDRLModel() {
    this.drlModel = "import java.util.Date; \nimport java.util.ArrayList;\n\n";
    this.generatedSchemaList.forEach((model: Schema) => {
      this.drlModel = this.drlModel + "declare " + model.name + "\n";
      model.elements.forEach((element: Element) => {
        let dataType = element.datatype;
        if (element.datatype == "string")
          dataType = "String"
        else if (element.datatype == "integer" && !element.isList)
          dataType = "int"
        else if (element.datatype == "integer" && element.isList)
          dataType = "Integer"  
        else if (element.datatype == "number")
          dataType = "Double"
        else if (element.datatype == "boolean")
          dataType = "Boolean"
        else if (element.datatype == "date")
          dataType = "Date"

        if (!element.isList)
          this.drlModel = this.drlModel + "   " + element.name + " : " + dataType + "\n";
        else
          this.drlModel = this.drlModel + "   " + element.name + " : ArrayList<" + dataType + ">" + "\n";
      })
      this.drlModel = this.drlModel + "end" + "\n\n";
    });
  }

  private convertToJavaClassType(data: string): string {
    const result = data.replace(/([A-Z])/g, '$1');

    // converting first character to uppercase and join it to the final string
    const final = result.charAt(0).toUpperCase() + result.slice(1);
    return final;
  }

  private findInstanceType(data: any): string {
    if (data instanceof Object)
      return "Object";
    if (data instanceof String)
      return "String";
    if (data instanceof Boolean)
      return "Boolean";
    if (data instanceof Number)
      return "Number"
    return "";
  }

  private objectToSchema(jsonObject: any, prop: any) {
    let childSchema: Schema = {
      name: this.convertToJavaClassType(prop),
      version: "1.0",
      elements: [],
      isRoot : false
    }
    let j = 1;
    Object.keys(jsonObject[prop]).forEach((childprop: any) => {
      let childElement: Element = {
        name: childprop,
        datatype: typeof (jsonObject[prop][childprop]),
        isList: false,
        nodeid: j
      }

      if (childElement.datatype == "number") {
        if (Number.isInteger(jsonObject[prop][childprop]))
          childElement.datatype = "integer";
      }

      if (childElement.datatype == "string") {
        try {
          if (jsonObject[prop][childprop].indexOf("-") != -1) {
            let value = Date.parse(jsonObject[prop][childprop]);
            if (!(isNaN(value)))
              childElement.datatype = "date";
          }

        } catch (e) { }
      }

      if (jsonObject[prop][childprop] == null)
        childElement.datatype = "string";

      if (jsonObject[prop][childprop] instanceof Array ) {
        childElement.isList = true;
        if (typeof (jsonObject[prop][childprop][0]) != "object" &&  jsonObject[prop][childprop].length > 0 )
        {
          childElement.datatype = typeof (jsonObject[prop][childprop][0]);
          if (childElement.datatype == "number") {
            if (Number.isInteger(jsonObject[prop][childprop][0]))
            childElement.datatype = "integer";
          }

          if (childElement.datatype == "string") {
            try {
              if (jsonObject[prop][childprop][0].indexOf("-") != -1) {
                let value = Date.parse(jsonObject[prop]);
                if (!(isNaN(value)))
                childElement.datatype = "date";
              }
            } catch (e) { }
          }
        }
        else {
          let obj = jsonObject[prop][childprop][0];
          this.createSchemaFromObject(obj, this.convertToJavaClassType(childprop + "SubType"));
          childElement.datatype = this.convertToJavaClassType(childprop + "SubType");
        }
      }

      if (jsonObject[prop][childprop] != null && childElement.datatype == "object" && !(jsonObject[prop][childprop] instanceof Array)) {
        this.objectToSchema(jsonObject[prop], childprop);
        childElement.datatype = this.convertToJavaClassType(childprop);
      }
      childSchema.elements.push(childElement);
      j++;
    });
    this.generatedSchemaList.push(childSchema);

  }


  createSchemaFromObject(jsonObject: any, name: string) {

    let currentSchema: Schema = {
      name: name,
      version: "1.0",
      isRoot : false,
      elements: []
    };
    try {
      var i = 1;
      Object.keys(jsonObject).forEach((prop: any) => {

        let element: Element = {
          name: prop,
          datatype: typeof (jsonObject[prop]),
          isList: false,
          nodeid: i
        }

        if (element.datatype == "number") {
          if (Number.isInteger(jsonObject[prop]))
            element.datatype = "integer";
        }

        if (element.datatype == "string") {
          try {
            if (jsonObject[prop].indexOf("-") != -1) {
              let value = Date.parse(jsonObject[prop]);
              if (!(isNaN(value)))
                element.datatype = "date";
            }
          } catch (e) { }
        }

        if (jsonObject[prop] == null)
          element.datatype = "string"

        if (jsonObject[prop] instanceof Array) {
          element.isList = true;

          if (typeof (jsonObject[prop][0]) != "object" && jsonObject[prop].length > 0) {
            element.datatype = typeof (jsonObject[prop][0]);
            if (typeof (jsonObject[prop][0]) == "number") {
              if (Number.isInteger(jsonObject[prop][0]))
                element.datatype = "integer";
            }

            if (typeof (jsonObject[prop][0]) == "string") {
              try {
                if (jsonObject[prop].indexOf("-") != -1) {
                  let value = Date.parse(jsonObject[prop][0]);
                  if (!(isNaN(value)))
                    element.datatype = "date";
                }
              } catch (e) { }
            }
          }
          else if (jsonObject[prop].length == 0)
            element.datatype = "string";
          else {
            let obj = jsonObject[prop][0];
            this.createSchemaFromObject(obj, this.convertToJavaClassType(prop + "SubType"));
            element.datatype = this.convertToJavaClassType(prop + "SubType");
          }
        }
        if (jsonObject[prop] != null && typeof (jsonObject[prop]) == "object" && !(jsonObject[prop] instanceof Array)) {
          this.objectToSchema(jsonObject, prop);
          element.datatype = this.convertToJavaClassType(prop);
        }
        i++;
        currentSchema.elements.push(element);

      });
      this.generatedSchemaList.push(currentSchema);

    } catch (e) {
      console.log("Unable to parse schema" + e);
    }
    console.log(this.generatedSchemaList);
  }


  translateTextArea() {
    this.generatedSchemaList = [];
    let currentSchema: Schema = {
      name: "Request",
      version: "1.0",
      elements: [],
      isRoot : true
    };
    try {
      var jsonObject = JSON.parse(this.jsonData);
      var i = 1;
      Object.keys(jsonObject).forEach((prop: any) => {

        let element: Element = {
          name: prop,
          datatype: typeof (jsonObject[prop]),
          isList: false,
          nodeid: i
        }

        if (element.datatype == "number") {
          if (Number.isInteger(jsonObject[prop]))
            element.datatype = "integer";
        }

        if (element.datatype == "string") {
          try {
            if (jsonObject[prop].indexOf("-") != -1) {
              let value = Date.parse(jsonObject[prop]);
              if (!(isNaN(value)))
                element.datatype = "date";
            }
          } catch (e) { }
        }

        if (jsonObject[prop] == null)
          element.datatype = "string"

        if (jsonObject[prop] instanceof Array) {
          element.isList = true;

          if (typeof (jsonObject[prop][0]) != "object" && jsonObject[prop].length > 0)
          {
            element.datatype = typeof (jsonObject[prop][0]);
            if (typeof (jsonObject[prop][0]) == "number") {
              if (Number.isInteger(jsonObject[prop][0]))
                element.datatype = "integer";
            }

            if (typeof (jsonObject[prop][0]) == "string") {
              try {
                if (jsonObject[prop].indexOf("-") != -1) {
                  let value = Date.parse(jsonObject[prop][0]);
                  if (!(isNaN(value)))
                    element.datatype = "date";
                }
              } catch (e) { }
            }
          }
          else if (jsonObject[prop].length == 0)
            element.datatype = "string";
          else {
            let obj = jsonObject[prop][0];
            this.createSchemaFromObject(obj, this.convertToJavaClassType(prop + "SubType"));
            element.datatype = this.convertToJavaClassType(prop + "SubType");
          }
        }
        if (jsonObject[prop] != null && typeof (jsonObject[prop]) == "object" && !(jsonObject[prop] instanceof Array)) {
          this.objectToSchema(jsonObject, prop);
          element.datatype = this.convertToJavaClassType(prop);
        }
        i++;
        currentSchema.elements.push(element);

      });
      this.generatedSchemaList.push(currentSchema);

    } catch (e) {
      console.log("Unable to parse schema" + e);
      window.alert("Error Generating DRL Schema" + e);
    }
    this.currentSchema = currentSchema;
    console.log(this.generatedSchemaList);
    this.generateDRLModel();
  }

  ngOnInit() {
      console.log("Mode : " + this.mode);
      if(this.mode == "edit")
      {
          this.service.getLibrary(this.libraryKey).subscribe((data : any) => {
             let library : ModelLibrary = data;
             this.schemaGroup = library.schemaGroupList[0];
             library.schemaGroupList.forEach((schemaGrp : SchemaGroup) => {
                this.drlModel = schemaGrp.drl;
                this.generatedSchemaList = schemaGrp.schemaList;
                schemaGrp.schemaList.forEach((schema : Schema) => {
                  if(schema.isRoot)
                    this.currentSchema = schema;
                });
             })
             
          });
      }
   
  }

}
