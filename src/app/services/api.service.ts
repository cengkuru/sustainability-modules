import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiEndpoint, HttpMethod } from "../models/api-endpoint.model";

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private baseUrl = 'https://api.oc4ids.example.com/v1';

    constructor() {}

    getApiEndpoints(): Observable<ApiEndpoint[]> {
        const endpoints: ApiEndpoint[] = [
            {
                title: 'Get Project Details',
                method: HttpMethod.GET,
                path: '/projects/{projectId}',
                description: 'Retrieve detailed information about a specific infrastructure project.',
                parameters: [
                    { name: 'projectId', in: 'path', required: true, type: 'string', description: 'The unique identifier of the project.' },
                    { name: 'includeContracts', in: 'query', required: false, type: 'boolean', description: 'Flag to include related contracts.' }
                ],
                responses: [
                    {
                        status: 200,
                        description: 'Successful response with project details.',
                        example: `
{
  "id": "OC4IDS-PT-001",
  "title": "Highway Expansion Project",
  "description": "Expansion of the main highway connecting two major cities",
  "status": "implementation",
  "sector": "transport",
  "location": {
    "description": "Between City A and City B"
  },
  "budget": {
    "amount": 1000000,
    "currency": "USD"
  }
}`
                    },
                    { status: 404, description: 'Project not found.' }
                ],
                exampleUrl: `${this.baseUrl}/projects/OC4IDS-PT-001?includeContracts=true`
            },
            {
                title: 'List All Projects',
                method: HttpMethod.GET,
                path: '/projects',
                description: 'Retrieve a list of all infrastructure projects.',
                parameters: [
                    { name: 'page', in: 'query', required: false, type: 'integer', description: 'Page number for pagination.' },
                    { name: 'pageSize', in: 'query', required: false, type: 'integer', description: 'Number of items per page.' }
                ],
                responses: [
                    {
                        status: 200,
                        description: 'Successful response with a list of projects.',
                        example: `
{
  "projects": [
    {
      "id": "OC4IDS-PT-001",
      "title": "Highway Expansion Project"
    },
    {
      "id": "OC4IDS-PT-002",
      "title": "New City Hospital Construction"
    }
  ],
  "totalCount": 50,
  "page": 1,
  "pageSize": 10
}`
                    },
                    { status: 400, description: 'Invalid pagination parameters.' }
                ],
                exampleUrl: `${this.baseUrl}/projects?page=1&pageSize=10`
            },
            {
                title: 'Create New Project',
                method: HttpMethod.POST,
                path: '/projects',
                description: 'Create a new infrastructure project.',
                parameters: [
                    { name: 'body', in: 'body', required: true, type: 'object', description: 'Project details' }
                ],
                responses: [
                    {
                        status: 201,
                        description: 'Project created successfully.',
                        example: `
{
  "id": "OC4IDS-PT-003",
  "title": "New Metro Line Project",
  "status": "planning"
}`
                    },
                    { status: 400, description: 'Invalid input data.' }
                ],
                exampleUrl: `${this.baseUrl}/projects`,
                requestBodyExample: `
{
  "title": "New Metro Line Project",
  "description": "Construction of a new metro line in the capital city",
  "sector": "transport",
  "status": "planning"
}`
            },
            {
                title: 'Update Project',
                method: HttpMethod.PUT,
                path: '/projects/{projectId}',
                description: 'Update an existing infrastructure project.',
                parameters: [
                    { name: 'projectId', in: 'path', required: true, type: 'string', description: 'The unique identifier of the project.' },
                    { name: 'body', in: 'body', required: true, type: 'object', description: 'Updated project details' }
                ],
                responses: [
                    {
                        status: 200,
                        description: 'Project updated successfully.',
                        example: `
{
  "id": "OC4IDS-PT-001",
  "title": "Updated Highway Expansion Project",
  "status": "implementation"
}`
                    },
                    { status: 404, description: 'Project not found.' },
                    { status: 400, description: 'Invalid input data.' }
                ],
                exampleUrl: `${this.baseUrl}/projects/OC4IDS-PT-001`,
                requestBodyExample: `
{
  "title": "Updated Highway Expansion Project",
  "status": "implementation"
}`
            },
            {
                title: 'Delete Project',
                method: HttpMethod.DELETE,
                path: '/projects/{projectId}',
                description: 'Delete an infrastructure project.',
                parameters: [
                    { name: 'projectId', in: 'path', required: true, type: 'string', description: 'The unique identifier of the project.' }
                ],
                responses: [
                    { status: 204, description: 'Project deleted successfully.' },
                    { status: 404, description: 'Project not found.' }
                ],
                exampleUrl: `${this.baseUrl}/projects/OC4IDS-PT-001`
            },
            {
                title: 'Get Project Contracts',
                method: HttpMethod.GET,
                path: '/projects/{projectId}/contracts',
                description: 'Retrieve all contracts associated with a specific project.',
                parameters: [
                    { name: 'projectId', in: 'path', required: true, type: 'string', description: 'The unique identifier of the project.' }
                ],
                responses: [
                    {
                        status: 200,
                        description: 'Successful response with a list of contracts.',
                        example: `
{
  "contracts": [
    {
      "id": "OC4IDS-CT-001",
      "title": "Main Construction Contract",
      "status": "active",
      "value": {
        "amount": 800000,
        "currency": "USD"
      }
    },
    {
      "id": "OC4IDS-CT-002",
      "title": "Environmental Impact Assessment",
      "status": "completed",
      "value": {
        "amount": 50000,
        "currency": "USD"
      }
    }
  ]
}`
                    },
                    { status: 404, description: 'Project not found.' }
                ],
                exampleUrl: `${this.baseUrl}/projects/OC4IDS-PT-001/contracts`
            }
        ];
        return of(endpoints);
    }
}
