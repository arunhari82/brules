import { Component, OnInit } from '@angular/core';
import { DataLibrary, Schema } from 'src/app/Model/Request';

@Component({
  selector: 'app-DataLibrary',
  templateUrl: './DataLibrary.component.html',
  styleUrls: ['./DataLibrary.component.css']
})
export class DataLibraryComponent implements OnInit {

  dataList! : DataLibrary[];
  schemaList! : Schema[];

  constructor() { }

  ngOnInit() {
    this.dataList = [{
      id : 1,
      name : "Claim",
      version : "1.1.0",
      noofschemas : 10,
      schemas : []
    },
    {
      id : 2,
      name : "Policy",
      version : "1.1.0",
      noofschemas : 200,
      schemas : [
        {
          name : "Quote Request",
          version : "1.1.0",
          isRoot : false,
          elements : [
            {
              nodeid : 1,
              name : "Identifier",
              datatype : "Number",
              isList : false,
            },
            {
              nodeid : 1,
              name : "Name",
              datatype : "String",
              isList : false,
            },
            {
              nodeid : 1,
              name : "Type",
              datatype : "String",
              isList : false,
            },
          ]
        },
        {
          name : "Quote Response",
          version : "1.1.1",
          isRoot : false,
          elements : [
            {
              nodeid : 1,
              name : "Quote Number",
              datatype : "Number",
              isList : false,
            },
            {
              nodeid : 1,
              name : "Annual Premium",
              datatype : "Number",
              isList : false,
            },
            {
              nodeid : 1,
              name : "Quote Type",
              datatype : "String",
              isList : false,
            },
          ]
        },
        {
          name : "Policy Request",
          version : "1.2.0",
          isRoot : false,
          elements : [
            {
              nodeid : 1,
              name : "Policy Number",
              datatype : "String",
              isList : false,
            },
            {
              nodeid : 2,
              name : "Quote",
              datatype : "Quote Request",
              isList : true,
            },
            {
              nodeid : 2,
              name : "Name",
              datatype : "String",
              isList : false,
            },
            {
              nodeid : 3,
              name : "Covered Amount",
              datatype : "Number",
              isList : false,
            },
            {
              nodeid : 4,
              name : "Covered Period Start",
              datatype : "Date",
              isList : false,
            },
            {
              nodeid : 4,
              name : "Covered Period End",
              datatype : "Date",
              isList : false,
            }
          ]
        }
      ]
    },
    {
      id : 3,
      name : "Quote",
      version : "1.3.0",
      noofschemas : 67,
      schemas : []
    },
    {
      id : 4,
      name : "Customer",
      version : "1.0.0",
      noofschemas : 34,
      schemas : []
    },
    {
      id : 4,
      name : "Pricing",
      version : "1.2.0",
      noofschemas : 100,
      schemas : []
    }
  ];

  

  }

}
