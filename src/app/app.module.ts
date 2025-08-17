import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClient, HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';

import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

import {AppComponent} from "./app.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgxJsonViewerModule} from "ngx-json-viewer";
import {FilterProjectsPipe} from "./pipes/filter-projects.pipe";
import {FilterRolesPipe} from "./pipes/filter-roles.pipe";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {ToastrModule} from "ngx-toastr";
import { TranslateModule } from '@ngx-translate/core';
import { TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AuthInterceptor } from './core/auth.interceptor';

// Import MongoDB services
import { MongoProjectService } from './services/mongodb/mongo-project.service';
import { MongoPolicyService } from './services/mongodb/mongo-policy.service';
import { ProjectService } from './services/project.service';
import { 
  DatabaseProviderService, 
  PROJECT_SERVICE_TOKEN, 
  projectServiceFactory 
} from './services/mongodb/database-provider.service';
import { TokenStorageService } from './services/token-storage.service';

// Factory function for translate loader
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({ declarations: [
        AppComponent,
        FilterProjectsPipe,
        FilterRolesPipe
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        BrowserAnimationsModule,
        ToastrModule.forRoot({
            timeOut: 3000,
            positionClass: 'toast-bottom-right',
            preventDuplicates: true
        }),
        AppRoutingModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            },
            defaultLanguage: 'en'
        }),
        CoreModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        NgxJsonViewerModule], providers: [
        // Provider for MongoDB services
        MongoProjectService,
        MongoPolicyService,
        // Token storage service for authentication
        TokenStorageService,
        // Factory provider to switch between Firebase and MongoDB
        {
            provide: PROJECT_SERVICE_TOKEN,
            useFactory: projectServiceFactory,
            deps: [ProjectService, MongoProjectService]
        },
        DatabaseProviderService,
        // HTTP Interceptor for auth token
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class AppModule { }

