import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DBServiceService } from 'src/app/service/DBService.service';
import { ModelLibrary, Schema, SchemaGroup,TreeNodeData,Element, RuleBook, RuleWrapper, RuleCondition, Rule, RuleAction, SpreadSheet, DRLConditionObject, DRLActionObject, Editor } from 'src/app/Model/Request';
import { TreeModel, TreeNode,TreeComponent  } from '@circlon/angular-tree-component';
import *  as jspreadsheet from 'jspreadsheet-ce';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SaveRulebookComponent } from '../../Modals/SaveRulebook/SaveRulebook.component';

@Component({
  selector: 'app-RuleDesigner',
  templateUrl: './RuleDesigner.component.html',
  styleUrls: ['./RuleDesigner.component.css']
})
export class RuleDesignerComponent implements OnInit {

  showCode : boolean = false;
  isOnlyRootSchema : boolean = true;
  divElement : HTMLDivElement[] = [];
  service! : DBServiceService;
  libraryList : ModelLibrary[] = [];
  nodes : TreeNodeData[] = [];
  options = {
    allowDrag : true,
    allowDrop : false
  }

  @Input()
  editor! : Editor;
  @Input()
  mode! : string;
  @Output()
  saveJsonObject : EventEmitter<Object> = new EventEmitter();

  queryString : Array<string> = [];

  generatedDRL : string = "";
  ruleindex : number = 1;
  spreadsheetIndex : number = 1;
  droppedEvent : Array<Object> = [];
  droppedActionEvent : Array<Object> = [];
  ruleBook : RuleBook = {
    name : "SampleRuleBook",
    version : "1.0",
    ruleList : [],
    generatedDRL : ""
  };
  
  @ViewChild("schemaTree")
  tree! : TreeComponent;

  constructor(private modalService: NgbModal,service : DBServiceService) { 
    this.service = service;
  }

  

  switchtoBook()
  {
    this.showCode = false;
  }

  switchtoCode()
  {
    this.showCode = true;
  }

  /* public saveCreatedSchema() {
    const modalRef = this.modalService.open(CreateLibraryComponent, { ariaLabelledBy: 'modal-basic-title', size: 'md', backdrop: 'static' });
    modalRef.componentInstance.schemaList = {
      schemaList : this.generatedSchemaList
    }
  } */

  convertSubSchemas(datatype : string,library : ModelLibrary,currentSchemaNode : TreeNodeData)
  {
    library.schemaGroupList.forEach((schemaGrp : SchemaGroup) => {
      schemaGrp.schemaList.forEach((schema : Schema) => {
        if(schema.name == datatype)
        { 
            schema.elements.forEach((element : Element) => {
              let grandChild : TreeNodeData = {
                name : element.name,
                type : <string>element.datatype,
                children : [],
                isList : element.isList,
                path : currentSchemaNode.path + "." +element.name,
                datatypePath : currentSchemaNode.datatypePath+"."+element.datatype+"="+element.isList,
                isRoot : false

              }
              if(grandChild.type == "string" || grandChild.type == "integer" || grandChild.type == "boolean" || grandChild.type == "number") 
                 currentSchemaNode.children.push(grandChild);
              else
                {
                  currentSchemaNode.children.push(grandChild);
                  this.convertSubSchemas(grandChild.type,library,grandChild);
                }
            });
        }
      });
    });
  }

  convertoSchemas()
  {
    this.nodes = [];
    this.libraryList.forEach((library : ModelLibrary) => {
      let node : TreeNodeData = {
         name : library.name,
         type : "Library",
         children : [],
         isList : false,
         path : "",
         datatypePath : "",
         isRoot : false,
      }
      library.schemaGroupList.forEach((schemaGrp : SchemaGroup) => {
        schemaGrp.schemaList.forEach((schema : Schema) => {
          
           let childNode : TreeNodeData = {
             name : schema.name,
             type : "Schema",
             isList : false,
             path : schema.name,
             children : [],
             isRoot : schema.isRoot,
             datatypePath : schema.name
           }
           schema.elements.forEach((element : Element) => {
             let grandChild : TreeNodeData = {
               name : element.name,
               type : <string>element.datatype,
               children : [],
               isList : element.isList,
               path : childNode.path + "." +element.name,
               datatypePath : childNode.datatypePath + "."+element.datatype+"="+element.isList,
               isRoot : false
             }
             if(grandChild.type == "string" || grandChild.type == "integer" || grandChild.type == "boolean" || grandChild.type == "number") 
                   childNode.children.push(grandChild);
              else
              {
                 childNode.children.push(grandChild);
                 this.convertSubSchemas(grandChild.type,library,grandChild);
              }
             
           });
           if(childNode.isRoot)
              node.children.push(childNode);

        });
      });
      this.nodes.push(node);
      console.log(this.nodes);
   });
  }

  onTreeDrop(node : any,rule : Rule)
  {
      if(node.element.data.children instanceof Array)
      {
          if(node.element.data.children.length > 0)
          {
               window.alert("Complex Objects are not supported");
               return;
          }
      }
      console.log("Dropped");
      console.log(node);
      this.droppedEvent.push(node.element.data);
    
      let ruleCondition : RuleCondition = {
        droppedObjLHS : <TreeNodeData> node.element.data,
        lhs : <string>node.element.data.name, //.replaceAll("\.","/")
        schemaPathLHS : node.element.data.path.replaceAll("\.","/"),
        rhsType : "constant"
      }
      rule.conditions.push(ruleCondition);
  }

  onTreeDropRHS(node : any,ruleCondition : RuleCondition)
  {
    if(node.element.data.children instanceof Array)
    {
        if(node.element.data.children.length > 0)
        {
             window.alert("Complex Objects are not supported");
             return;
        }
    }
      this.droppedEvent.push(node.element.data);
      ruleCondition.droppedObjRHS =<TreeNodeData> node.element.data;
      ruleCondition.rhs = <string>node.element.data.name; 
      ruleCondition.schemaPathRHS = node.element.data.path.replaceAll("\.","/");
  }

  onTreeDropActionRHS(node : any,ruleAction : RuleAction)
  {
    if(node.element.data.children instanceof Array)
    {
        if(node.element.data.children.length > 0)
        {
             window.alert("Complex Objects are not supported");
             return;
        }
    }
      this.droppedEvent.push(node.element.data);
      ruleAction.droppedObjRHS =<TreeNodeData> node.element.data;
      ruleAction.rhs = <string>node.element.data.name; 
      ruleAction.schemaPathRHS = node.element.data.path.replaceAll("\.","/"); 
  }

  onActionTreeDrop(node : any,rule : Rule)
  {
    if(node.element.data.children instanceof Array)
    {
        if(node.element.data.children.length > 0)
        {
             window.alert("Complex Objects are not supported");
             return;
        }
    }
   
    this.droppedActionEvent.push(node.element.data);
  
    let action : RuleAction = {
      droppedObjLHS : <TreeNodeData> node.element.data,
      lhs : <string>node.element.data.name, //.replaceAll("\.","/")
      schemaPathLHS : node.element.data.path.replaceAll("\.","/"),
      rhsType : "constant",
      assignmentOperator : "="
    }
    rule.actions.push(action);
  }

  onRHSTypeSwitch(ruleCondition : RuleCondition)
  {
     if(ruleCondition.rhsType == 'constant')
         ruleCondition.rhsType = 'variable'
     else
         ruleCondition.rhsType = 'constant'
  }

  onRHSTypeSwitchAction(ruleAction : RuleAction)
  {
    if(ruleAction.rhsType == 'constant')
    ruleAction.rhsType = 'variable'
else
    ruleAction.rhsType = 'constant'
  }

  convertToSpreadsheet(rule : Rule)
  {
     let spreadsheet : SpreadSheet ={
       id : "spreadsheet" + this.spreadsheetIndex,
       ruleConditions : rule.conditions,
       ruleActions : rule.actions,
       ruleTemplate : rule
     }
     let ruleWrapper : RuleWrapper = {
       type : 'SpreadSheet',
       spreadsheetInfo : spreadsheet
     }
     this.ruleBook.ruleList?.push(ruleWrapper);
  }

  ngAfterViewChecked()
  {
    this.updateSpreadSheetTable();
  }

  findSpreadsheetRule(id : string) : RuleWrapper
  {
      let ruleWrappertest! : RuleWrapper;
      this.ruleBook.ruleList?.forEach((ruleWrapper : RuleWrapper) => {
        if(ruleWrapper.spreadsheetInfo?.id == id)
        ruleWrappertest = ruleWrapper;
      });
      return ruleWrappertest;
  }

  updateSpreadSheetTable()
  {
    let id : string = "spreadsheet" + this.spreadsheetIndex;
     let ruleWrapper : RuleWrapper = this.findSpreadsheetRule(id);
     this.renderTable(id,ruleWrapper);
     this.spreadsheetIndex++;
  }


  cloneRule(rule : Rule)
  {
    let ruleWrapper : RuleWrapper = {
      type : 'FreeForm',
      rules : []
    }

    let clonerule : Rule = {
      name : "Rule #"+this.ruleindex,
      conditions : JSON.parse(JSON.stringify(rule.conditions)),
      actions : JSON.parse(JSON.stringify(rule.actions))
    }

    ruleWrapper.rules?.push(clonerule);
    this.ruleBook.ruleList?.push(ruleWrapper);
    this.ruleindex++;
  }

  deleteRule(rule : Rule)
  {
      this.ruleBook.ruleList?.forEach((ruleWrapper : RuleWrapper) => {
        ruleWrapper.rules = ruleWrapper.rules?.filter((ruleRow : Rule) => {
           if(ruleRow.name == rule.name)
             return false;
           else
             return true;  
         });
      });
  }

  addRule()
  {
     let ruleWrapper : RuleWrapper = {
       type : 'FreeForm',
       rules : []
     }

     let rule : Rule = {
       name : "Rule #"+this.ruleindex,
       conditions : [],
       actions : []
     }

     ruleWrapper.rules?.push(rule);
     this.ruleBook.ruleList?.push(ruleWrapper);
     this.ruleindex++;
  }

  ngOnInit() {
    if(this.mode == "edit")
    {
       this.service.getRuleBook(this.editor.id).subscribe((data : any)=>{
            this.ruleBook = <RuleBook>data;
       });
    }
    this.service.fetchLibraryList().subscribe((data : any) => {
      if(data instanceof Array)
      {
         data.forEach((library : string) => {
           console.log(library);
           this.service.getLibrary(library).subscribe((data : any) => {
              this.libraryList.push(data);
              this.convertoSchemas();
           });
           console.log(this.libraryList);
           
         });
        
      }
    });
  }

  renderTable(id : string,ruleWrapper : RuleWrapper)
  {
    let divElement : HTMLDivElement;
    divElement = document.getElementById(id) as HTMLDivElement;
    if(divElement == null)
      return;

     let dataRowList = [];
     let dataRow =  [true,"Rule #1"];
     let totalColumns : number = ruleWrapper.spreadsheetInfo ? ruleWrapper.spreadsheetInfo?.ruleActions.length + ruleWrapper.spreadsheetInfo?.ruleConditions.length : 0;
     var columnsList : jspreadsheet.Column[] = [
        { type: 'checkbox',width: 100,title: "Rule Enabled"},
        { type: "text", width: 150,title : "Rule Name"}
      ]  

       ruleWrapper.spreadsheetInfo?.ruleConditions.forEach((ruleCondition : RuleCondition)=>{
         let newcolumn : jspreadsheet.Column= {
             type: "text", 
             width: 150,
             title : ruleCondition.lhs + " " + ruleCondition.operator,
             
            
         }
         columnsList.push(newcolumn);
         dataRow.push(ruleCondition.rhs ? ruleCondition.rhs : "");
      });

      ruleWrapper.spreadsheetInfo?.ruleActions.forEach((ruleAction : RuleAction) => {
        let newcolumn : jspreadsheet.Column = {
            type: "text", 
            width: 150,
            title : ruleAction.lhs
        }
        columnsList.push(newcolumn);
        dataRow.push(ruleAction.rhs ? ruleAction.rhs : "");
     }); 
     dataRowList.push(dataRow);

    jspreadsheet(divElement, {
      filters : true,
      data:  dataRowList,
      columns: columnsList,
      tableHeight: "500px",
      tableOverflow: true,
      about: "Rule Demo",
      nestedHeaders:[
        [
            {
                title: 'Decision Table from Template',
                colspan: 2 + totalColumns
            },
        ],
        [
           {
            title: 'Metadata',
            colspan: 2,

           },           
          {
                title: 'Condition',
                colspan: ruleWrapper.spreadsheetInfo?.ruleConditions.length

            },
            {
                title: 'Action',
                colspan: ruleWrapper.spreadsheetInfo?.ruleActions.length
            }
        ],
    ],
    allowRenameColumn: true,
    allowManualInsertColumn: false,
    allowComments:true,
    allowExport: true,
    pagination: 10,
    search : true,
    minDimensions : [2+totalColumns,5]
    }); 
  }

  generateDRL()
  {
      this.switchtoCode();
      this.queryString = [];
      let ruleunitname : string = "unit " + this.ruleBook.name + "; \n\n";
      let importheader : string = `import org.kie.kogito.rules.DataSource;\nimport org.kie.kogito.rules.DataStream;\nimport org.kie.kogito.rules.DataStore;\nimport org.kie.kogito.rules.RuleUnitData;\n\n\n`;
     
      let declareRuleUnitStart = "declare " + this.ruleBook.name + " extends RuleUnitData \n"
      let declareRuleUnitEnd = "end \n\n\n"
      let declareRuleUnitMiddle ="";
    
      let rootPaths : string[] = this.getRootSchemasUsed();
      let filteredRootPath = [... new Set(rootPaths)];
      filteredRootPath.forEach((rootVar : string) =>{
         let variable = rootVar.toLowerCase();
         declareRuleUnitMiddle = declareRuleUnitMiddle + "\t" + variable + " : DataStore<"+rootVar+"> = DataSource.createStore() \n";
         let querystr : string = "$"+variable+ " : " + "/"+variable;
         this.queryString.push(querystr);
      });



      let ruleCode : string = this.generateRuleDRL();
      let queryString : string = this.generateQuery();
      let generatedDRL : string = ruleunitname + importheader + declareRuleUnitStart + declareRuleUnitMiddle + declareRuleUnitEnd + ruleCode +"\n" + queryString;    
      console.log(generatedDRL);
      this.generatedDRL = generatedDRL;

  }
  private generateQuery() : string
  {
      let str = "";
      this.queryString.forEach((query : string,index : number) => {
        str = str + "query executeRules" + (index + 1) + "\n";
        str = str + "\t" + query + "\n";
        str = str + "end \n";
      });
      
      return str;
   
  }


  private generateRuleDRL() : string
  {
    //Generate Rules
    let ruleCode : string = "";
    this.ruleBook.ruleList?.forEach((rule : RuleWrapper) => {
      rule.rules?.forEach((rule : Rule) => {
        let ruleArray : Array<DRLConditionObject> = [];
        let ruleStr = 'rule "' + rule.name + '" \nwhen\n';
        rule.conditions.forEach((cond : RuleCondition,ruleIndex : number) => {
            let condtionarray : Array<DRLConditionObject> = this.convertConditiontoDRLSyntax(cond);
            ruleArray = ruleArray.concat(condtionarray);
        });
        let finalRuleArray = this.dedupRuleCondition(ruleArray);
        console.log(finalRuleArray);
        finalRuleArray.forEach((drlCondition : DRLConditionObject) =>  {
           ruleStr = ruleStr + "\t" + drlCondition.bindVariable + " : " + drlCondition.path;
           if(drlCondition.conditionString != "")
               ruleStr = ruleStr + "[" + drlCondition.conditionString + "]\n";
           else
               ruleStr = ruleStr + "\n";    
        });
        ruleStr = ruleStr + "then\n";
        rule.actions.forEach((action : RuleAction) => {
           let actionObj : DRLActionObject = this.convertActiontoDRLSyntax(action,finalRuleArray);
           ruleStr = ruleStr + "\t" + actionObj.path + "\n";
        });

        ruleStr = ruleStr + "end\n\n";

        ruleCode = ruleCode + ruleStr;
      });
   });

   return ruleCode;
  }

  private convertActiontoDRLSyntax(action : RuleAction,finalRuleArray : DRLConditionObject[]) : DRLActionObject
  {
      let actionObj! : DRLActionObject;
      let actionObjArray : Array<DRLActionObject> = [];
      actionObjArray = this.findBindVariable(action,finalRuleArray);
      let pathSplitsString : Array<string> = action.schemaPathLHS? action.schemaPathLHS.split("/") : [];
      let foundBindVar! : DRLActionObject;
      for(var i=pathSplitsString.length -1;i>=0;i--)
      {
        let bindVar : string = pathSplitsString[i].toLowerCase();
        actionObjArray.forEach((actionObj : DRLActionObject) => {
           if(actionObj.bindVariable == bindVar && foundBindVar === undefined)
           {
                foundBindVar = actionObj;                
           }
        });
        if(foundBindVar !== undefined)
          break;
      }

      let str : string = action.droppedObjLHS? action.droppedObjLHS.path.toLowerCase() : "";
      let output = "$"+str.substring(str.indexOf("\."+foundBindVar.bindVariable+"\.") + 1,str.length);
      let outputObjArray  = output.split(".");
      let actionPath : string = "";
      outputObjArray.forEach((outputPath : string,index : number) => {
          if(index == outputObjArray.length - 1)
          {
             actionPath = actionPath + "." + "set" + this.captalize(outputPath);
             if(action.droppedObjLHS?.type == "string")
                 actionPath = actionPath +  '("'+action.rhs+'");';
             else    
                 actionPath = actionPath + "("+action.rhs+");"
          }
          else if(index == 0)
          {
             actionPath = outputPath;
          }
          else
          {
            actionPath = actionPath+".get"+ this.captalize(outputPath)+"()"
          }
      });

      actionObj = {
        bindVariable : "$"+outputObjArray[0],
        path : actionPath
      }

      console.log(output);
      return actionObj;
  }

  private captalize(str : string) : string
  {
       return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private findBindVariable(action : RuleAction,finalRuleConditions : DRLConditionObject[]) : DRLActionObject[]
  {
       let actionObjArray : Array<DRLActionObject> = [];
       action.schemaPathLHS?.split("/").forEach((path : string) => {
          finalRuleConditions.forEach((cond : DRLConditionObject) => {
              if(cond.bindVariable.split("$")[1] == path.toLowerCase())
              {
                   let object : DRLActionObject = {
                      bindVariable : cond.bindVariable.split("$")[1],
                      path : ""
                   }
                   actionObjArray.push(object);
              }
          });
       });
       return actionObjArray;
  }

  private dedupRuleCondition(drlConditions : DRLConditionObject[]) : DRLConditionObject[]
  {
      let processedBindVar : Array<string> = [];
      let dedupedProcessedDrlCondition : Array<DRLConditionObject> = [];

       drlConditions.forEach((drlCondition : DRLConditionObject) => {
              if(processedBindVar.indexOf(drlCondition.bindVariable) == -1)
              {
                  processedBindVar.push(drlCondition.bindVariable);
                  dedupedProcessedDrlCondition.push(drlCondition);
              }
              else
              {
                dedupedProcessedDrlCondition.forEach((conditionObj : DRLConditionObject) => {
                   if(conditionObj.bindVariable == drlCondition.bindVariable)
                   {
                      if(conditionObj.conditionString != "")
                         conditionObj.conditionString = conditionObj.conditionString + "," + drlCondition.conditionString;
                      else
                        conditionObj.conditionString =  drlCondition.conditionString;                           
                   }
                   if(conditionObj.conditionString[conditionObj.conditionString.length - 1] == ",")
                   {
                        conditionObj.conditionString = conditionObj.conditionString.substring(0,conditionObj.conditionString.length-1);
                   }
                });
              }
       });
       return dedupedProcessedDrlCondition;
  }

  private convertConditiontoDRLSyntax(ruleCondition : RuleCondition) : DRLConditionObject[]
  {
    
    let strArray : Array<DRLConditionObject> = []; 
    let pathArray : Array<string> = [];
    let str = "";
    pathArray = ruleCondition.schemaPathLHS ? ruleCondition.schemaPathLHS?.split("/") : [];
    pathArray.forEach((data : string,index : number)=>{
           let str = "";
           if(index == 0 && pathArray.length == 2)
           {
               let object : DRLConditionObject = {
                 bindVariable :  "$"+data.toLowerCase(),
                 conditionString : "",
                 path : "/"+data.toLowerCase()
               }

               let datatypePath : string = ruleCondition.droppedObjLHS.datatypePath;
               object.path = object.path + "#"+datatypePath.split(".")[index].split("=")[0];
                    let condition = pathArray[pathArray.length-1]+ " " + ruleCondition.operator + " ";
                       if(ruleCondition.rhsType == "constant")
                       {
                          if(ruleCondition.droppedObjLHS.type == "string")
                              condition = condition + '"' + ruleCondition.rhs + '"';
                          else
                              condition = condition + " " + ruleCondition.rhs + "";
                       }
                       else
                       {
                           let rulePathSplits = ruleCondition.rhs?.split("/");
                           if(rulePathSplits != null)
                           {
                              let rhsPath = "$"+rulePathSplits[rulePathSplits.length - 2].toLowerCase()+"."+rulePathSplits[rulePathSplits.length - 1]
                              condition = condition + " " + rhsPath + "";
                           }
                           
                       }
               
               object.conditionString = condition;
               strArray.push(object);
               console.log(ruleCondition.droppedObjLHS);
           }
           if(index == 0 && pathArray.length > 2)
           {
               let object : DRLConditionObject = {
                 bindVariable :  "$"+data.toLowerCase(),
                 conditionString : "",
                 path : "/"+data.toLowerCase()
               }
               strArray.push(object);
               console.log(ruleCondition.droppedObjLHS);
           }
           else if (index == pathArray.length - 1)
           {
               // Do Nothing as this is the last element
           }
           else if (index == pathArray.length - 2)
           {
                let drlpath : string = "";
                str = "$" + data.toLowerCase() + " : " ;
                let path : string = ruleCondition.droppedObjLHS.path;
                let datatypePath : string = ruleCondition.droppedObjLHS.datatypePath;
                let output  = path.substring(0,path.indexOf("\."+data+"\.") + data.length+1).toLowerCase().replaceAll("\.","/");
                let outputvars =  output.split("/");
                let condition : string = "";
                outputvars.forEach((outputpath : string,dataindex : number)=>{
                      if(dataindex == 0)
                        drlpath = "/"  + outputpath+"[this == $"+outputpath+"]"
                      else if(dataindex == outputvars.length - 1)
                        {
                          drlpath = drlpath + "/" + outputpath + "#"+datatypePath.split(".")[dataindex].split("=")[0];
                          condition = pathArray[pathArray.length-1]+ " " + ruleCondition.operator + " ";
                          if(ruleCondition.rhsType == "constant")
                          {
                            if(ruleCondition.droppedObjLHS.type == "string")
                                condition = condition + '"' + ruleCondition.rhs + '"';
                            else
                                condition = condition + " " + ruleCondition.rhs + "";
                          }
                          else
                          {
                                let rulePathSplits = ruleCondition.schemaPathRHS?.split("/");
                                if(rulePathSplits != null)
                                {
                                    let rhsPath = "$"+rulePathSplits[rulePathSplits.length - 2].toLowerCase()+"."+rulePathSplits[rulePathSplits.length - 1]
                                    condition = condition + " " + rhsPath + "";
                                }
                          }
                        }
                      else
                        drlpath = drlpath + "/" + outputpath +"[this == $"+outputpath+"]";
                });
               let object : DRLConditionObject = {
                 bindVariable : "$" + data.toLowerCase(),
                 conditionString : condition,
                 path : drlpath
               }

                strArray.push(object);
           }
           else
           {
              let drlpath : string = "";
              let path : string = ruleCondition.droppedObjLHS.path;
              let datatypePath : string = ruleCondition.droppedObjLHS.datatypePath;
              let output  = path.substring(0,path.indexOf("\."+data+"\.") + data.length+1).toLowerCase().replaceAll("\.","/");
              let outputvars =  output.split("/");
              outputvars.forEach((outputpath : string,dataindex : number)=>{
                    if(dataindex == 0)
                       drlpath = "/"  + outputpath+"[this == $"+outputpath+"]";
                    else if(dataindex == outputvars.length - 1)
                       drlpath = drlpath + "/" + outputpath + "#"+datatypePath.split(".")[dataindex].split("=")[0];
                    else
                       drlpath = drlpath + "/" + outputpath;
              });
              let object : DRLConditionObject = {
                bindVariable : "$" + data.toLowerCase(),
                conditionString : "",
                path : drlpath
              }
              strArray.push(object);
           }
    });

    let finalArray = [... new Set(strArray)];
    console.log(finalArray);
    return finalArray;
  }

  private getRootSchemasUsed() : string[]
  {
     let rootPath : string[] = [];
     this.ruleBook.ruleList?.forEach((ruleWrapper : RuleWrapper) => {
        ruleWrapper.rules?.forEach((rule : Rule) => {
          rule.conditions.forEach((ruleCondition : RuleCondition)=>{
              let rootObj : string  = ruleCondition.schemaPathLHS? ruleCondition.schemaPathLHS?.split("/")[0] : "";
              rootPath.push(rootObj);
          });
        });
     });
     return rootPath;
  }

  deleteRuleCondition(rule : Rule,ruleCondition : RuleCondition)
  {
      rule.conditions = rule.conditions.filter((cond : RuleCondition) => {
        if(cond.schemaPathLHS == ruleCondition.schemaPathLHS)
            return false;
        else
            return true;
      });
  }

  deleteRuleAction(rule : Rule,ruleAction : RuleAction)
  {
    rule.actions = rule.actions.filter((action : RuleAction) => {
      if(action.schemaPathLHS == ruleAction.schemaPathLHS)
          return false;
      else
          return true;
    });
  }

  saveRulebook()
  {
    const modalRef = this.modalService.open(SaveRulebookComponent, { ariaLabelledBy: 'modal-basic-title', size: 'md', backdrop: 'static' });
    this.generateDRL(); 
    this.ruleBook.generatedDRL = this.generatedDRL;
    
    modalRef.result.then((result : any) => {
        this.saveJsonObject.emit({result : result,editor : this.editor});
    });
   
    
    modalRef.componentInstance.rulebook = this.ruleBook;
  }
    
  
}

