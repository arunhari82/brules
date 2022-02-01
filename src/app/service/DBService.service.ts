import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ModelLibrary, Project, RuleBook, SchemaGroup } from '../Model/Request';
import { forkJoin, Observable, Subject } from "rxjs";
import { tap } from "rxjs/operators";


@Injectable({
  providedIn: 'root'
})
export class DBServiceService {

  infinispanDBBaseURL :  string = "http://localhost:11222/rest/v2/caches/";
  bruleServiveURL : string = "http://localhost:9090/";

  constructor(private http: HttpClient)
  {
        
  }

  fetchLibraryList()
  {
    let url = this.infinispanDBBaseURL + "model-library/?action=keys";
    const headers = {
      'content-type': 'application/json',
      'Key-Content-Type' : "test"
    };

    return this.http.get(url,{ headers });
  }

  addLibrary(libraryName : string,library : ModelLibrary)
  {
    let url = this.infinispanDBBaseURL + "model-library/"+libraryName;
    const headers = {
      'Content-Type': 'application/json',
      'Key-Content-Type' : "application/json"
    };

    return this.http.put(url,library,{ headers });
  }

  

  getLibrary(libraryName : string)
  {
    let url = this.infinispanDBBaseURL + "model-library/"+libraryName;
    const headers = {
      'Content-Type': 'application/json',
      'Key-Content-Type' : "application/json"
    };

    return this.http.get(url,{ headers });
  }


  updateProject(projectName : string,project : Project)
  {
    let url = this.infinispanDBBaseURL + "project/"+projectName;
    const headers = {
      'Content-Type': 'application/json',
      'Key-Content-Type' : "application/json"
    };

    return this.http.put(url,project,{ headers });
  }

  addProject(projectName : string,project : Project)
  {
    let url = this.infinispanDBBaseURL + "project/"+projectName;
    const headers = {
      'Content-Type': 'application/json',
      'Key-Content-Type' : "application/json"
    };

    return this.http.put(url,project,{ headers });
  }

  fetchProjectList()
  {
    let url = this.infinispanDBBaseURL + "project/?action=keys";
    const headers = {
      'content-type': 'application/json',
      'Key-Content-Type' : "test"
    };

    return this.http.get(url,{ headers });
  }

  getProject(projectName : string)
  {
    let url = this.infinispanDBBaseURL + "project/"+projectName;
    const headers = {
      'Content-Type': 'application/json',
      'Key-Content-Type' : "application/json"
    };

    return this.http.get(url,{ headers });
  }

  addRuleBook(rulebookName : string,rulebook : RuleBook)
  {
    let url = this.infinispanDBBaseURL + "rulebook/"+rulebookName;
    const headers = {
      'Content-Type': 'application/json',
      'Key-Content-Type' : "application/json"
    };

    return this.http.put(url,rulebook,{ headers });
  }

  fetchRuleBookList()
  {
    let url = this.infinispanDBBaseURL + "rulebook/?action=keys";
    const headers = {
      'content-type': 'application/json',
      'Key-Content-Type' : "test"
    };

    return this.http.get(url,{ headers });
  }

  getRuleBook(rulebookName : string)
  {
    let url = this.infinispanDBBaseURL + "rulebook/"+rulebookName;
    const headers = {
      'Content-Type': 'application/json',
      'Key-Content-Type' : "application/json"
    };

    return this.http.get(url,{ headers });
  }


  buildProjectRequest(project : Project) 
  {
    let postData = {
      "name" : project.projectName,
      "companyName" : project.orgName,
      "version" : project.version,
      rulebooks : new Array<object>(),
      models :  new Array<object>()
    }

    let subject = new Subject<object>();

    let fetchRequest : Array<any> = [];

    project.rulebook?.forEach((data : string) => {
      fetchRequest.push(this.getRuleBook(data).pipe(tap(res => console.log(res))));
    })

    project.schemas?.forEach((data : string) => {
      fetchRequest.push(this.getLibrary(data).pipe(tap(res => console.log(res))));
    })

  
    forkJoin(fetchRequest).subscribe((allResult :any) => {
      allResult.forEach((data : any) => { 
        if(data.schemaGroupList === undefined)
               {
                  let rulebook = <RuleBook> data;
                  let rulebookObj = {
                    name : rulebook.name,
                    value : rulebook.generatedDRL
                  };
                  postData.rulebooks.push(rulebookObj);
               }
              else
               {
                let library = <ModelLibrary> data;
                let schemaGroup = library.schemaGroupList[0];
                library.schemaGroupList.forEach((schemaGrp : SchemaGroup) => {
                  let libraryObj = {
                    name : library.name,
                    value : schemaGrp.drl
                  };
                   postData.models.push(libraryObj);
                });
               }
      });
      console.log(postData);
       this.buildProject(postData).subscribe((projectResponse : any) => {
            window.alert(" Build Result : " + projectResponse.result);
            subject.next(projectResponse);
      }); 
    });
    
    return subject;
  }

  buildProject(postData : any)
  {

    console.log(postData);
     
    let url = this.bruleServiveURL + "project/build";
    const headers = {
      'Content-Type': 'application/json',
      'X-Custom' : 'bruleServices'
    };

    return this.http.post(url,postData,{ headers });
  }

  deployProject(project : Project,portno : number)
  {

    let postData = {
       projectName : project.projectName,
       portno : portno
    }
    
     
    let url = this.bruleServiveURL + "project/deploy";
    const headers = {
      'Content-Type': 'application/json',
      'X-Custom' : 'bruleServices'
    };

    return this.http.post(url,postData,{ headers });
  }

}
