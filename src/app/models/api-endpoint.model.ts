export enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE'
}

export interface ApiEndpoint {
    title: string;
    method: HttpMethod;
    path: string;
    description: string;
    parameters?: ApiParameter[];
    responses?: ApiResponse[];
    exampleUrl?: string;
    requestBodyExample?: string;
}

export interface ApiParameter {
    name: string;
    in: 'path' | 'query' | 'body';
    required: boolean;
    type: string;
    description: string;
}

export interface ApiResponse {
    status: number;
    description: string;
    example?: string;
}
