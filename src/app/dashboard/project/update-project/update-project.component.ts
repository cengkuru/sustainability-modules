import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-update-project',
  templateUrl: './update-project.component.html',
  styleUrls: ['./update-project.component.scss']
})
export class UpdateProjectComponent implements OnInit {
  project$!: Observable<any>;
  projectId!: any;
  isLoading: boolean = true;  // Loading state flag

  constructor(private route: ActivatedRoute, private db: AngularFireDatabase) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id');
    this.project$ = this.db.object(`/projects/${this.projectId}`).valueChanges().pipe(
        map(project => {
          this.isLoading = false;
          console.log(project);
          return project;
        })
    );
  }
}
