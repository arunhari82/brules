import { TagData } from 'ngx-tagify';

export interface ExecutionSummary
{
    serviceName : String,
    endpoint : String,
    executionCount : number,
    errorCount : number,
    
}

export interface DataLibrary 
{
    id : number,
    name : string,
    version : string,
    noofschemas : number,
    schemas : Schema[]
}

export interface Schema
{
    name : string,
    version : string,
    elements : Element[],
    isRoot : boolean
    isSelected? : boolean
}

export interface Element
{
    nodeid : number,
    name : string,
    datatype : string | Schema,
    isList : boolean
}

export interface Project
{
    projectName : string,
    projectDescription : string,
    version : string,
    orgName : string,
    tags : TagData[],
    schemas? : string[],
    rulebook? : string[]
}

export interface SchemaGroup
{
    schemaList : Schema[],
    drl : string
}

export interface ModelLibrary
{
    id : number,
    name : string,
    version : string,
    isSelected? : boolean,
    schemaGroupList : SchemaGroup[]
}

export interface TreeNodeData
{
    name : string,
    type : string,
    isList : boolean,
    path : string,
    datatypePath : string,
    children : TreeNodeData[]
    isRoot : boolean
}

export interface ProjectNodeData
{
    name : string,
    type : string,
    isRoot : boolean,
    children : ProjectNodeData[]
}

export interface RuleCondition
{
    droppedObjLHS : TreeNodeData,
    droppedObjRHS? : TreeNodeData,
    lhs : string,
    operator? : string,
    rhs? : string,
    rhsType : string,
    joinCondition? : string,
    schemaPathLHS? : string
    schemaPathRHS? : string
}

export interface RuleAction
{
    droppedObjLHS? : TreeNodeData,
    droppedObjRHS? : TreeNodeData,
    lhs : string,
    assignmentOperator : string,
    rhs? : string,
    schemaPathLHS? : string,
    schemaPathRHS? : string,
    rhsType : string,
}

export interface Rule {
    name : string,
    conditions : RuleCondition[],
    actions : RuleAction[]
}

export interface RuleWrapper {
    type : string,
    rules? : Rule[],
    spreadsheetInfo? : SpreadSheet
}

export interface RuleBook {
    name : string,
    version : string,
    ruleList? : RuleWrapper[],
    generatedDRL : string
}

export interface SpreadSheet
{
    id : string,
    ruleConditions : RuleCondition[],
    ruleActions :  RuleAction[],
    ruleTemplate : Rule
}

export interface DRLConditionObject
{
    bindVariable : string,
    conditionString : string,
    path : string
}

export interface DRLActionObject
{
    bindVariable : string,
    path : string
}

export interface Editor {
    id : string,
    mode : string,
    selectedNode : ProjectNodeData
}