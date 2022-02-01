import { Component, Input, OnInit } from '@angular/core';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModelLibrary, RuleBook, SchemaGroup } from 'src/app/Model/Request';
import { DBServiceService } from 'src/app/service/DBService.service';

@Component({
  selector: 'app-SaveRulebook',
  templateUrl: './SaveRulebook.component.html',
  styleUrls: ['./SaveRulebook.component.css']
})
export class SaveRulebookComponent implements OnInit {
  faTimesCircle = faTimesCircle;
  constructor(public activeModal: NgbActiveModal,private service : DBServiceService) { 

  }
  @Input()
  rulebook! : RuleBook;
  
  ngOnInit() {
     
  }

  dismiss()
  {
    this.activeModal.dismiss();
  }

  onSave()
  {
    console.log(this.rulebook);
    this.service.addRuleBook(this.rulebook.name,this.rulebook).subscribe((data : any) => {
      window.alert("Rulebook saved successfully");
      this.activeModal.close(this.rulebook);
    });
  }
 

}
