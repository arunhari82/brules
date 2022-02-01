import { Component, OnInit } from '@angular/core';
import { ExecutionSummary } from '../../Model/Request';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  data!: ExecutionSummary[];

  constructor() { }

  ngOnInit() {
    this.data = [
      {
        serviceName: "Invoice Rule Service",
        endpoint: "https://rules.redhat.com/customername/namespace/invoice",
        executionCount: 4000,
        errorCount: 0
      },
      {
        serviceName: "PO Rule Service",
        endpoint: "https://rules.redhat.com/customername/namespace/po",
        executionCount: 23452,
        errorCount: 5
      },
      {
        serviceName: "Order Matching Service",
        endpoint: "https://rules.redhat.com/customername/namespace/matchorder",
        executionCount: 73412,
        errorCount: 12
      },
      {
        serviceName: "Inventory Service",
        endpoint: "https://rules.redhat.com/customername/namespace/inventory",
        executionCount: 86344,
        errorCount: 0
      }
    ];
  }

}
