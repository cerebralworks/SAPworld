module.exports.swaggerConfig = {
    disable: false,
    //   pathToGenerateFile: '/nirav/test/asb/xyz/',
    //   fileName: 'swagger.json',
    defaults: {
        pathsToIgnore: ['api/v1/'],
        responses: {
            "200": {
                description: "The requested resource"
            },
            "404": {
                description: "Resource not found"
            },
            "500": {
                description: "Internal server error"
            }
        },
        security: [{
            "Authorization": []
        }]
    },
    swagger: {
        swagger: "2.0",
        info: {
            title: "Swagger Json",
            description: "",
            termsOfService: "",
            contact: {
                name: "",
                url: "",
                email: ""
            },
            license: {
                name: "",
                url: ""
            },
            version: ""
        },
        host: "localhost:1337",
        basePath: "/",
        schemes: [
            "http",
            "https"
        ],
        externalDocs: {
            url: ""
        },
        parameters: {
            WhereQueryParam: {
                in: "query",
                name: "where",
                required: false,
                type: "string",
                description: "This follows the standard from http://sailsjs.com/documentation/reference/blueprint-api/find-where"
            },
            LimitQueryParam: {
                in: "query",
                name: "limit",
                required: false,
                type: "integer",
                description: "The maximum number of records to send back (useful for pagination). Defaults to undefined"
            },
            SkipQueryParam: {
                in: "query",
                name: "skip",
                required: false,
                type: "integer",
                description: "The number of records to skip (useful for pagination)."
            },
            SortQueryParam: {
                in: "query",
                name: "sort",
                required: false,
                type: "string",
                description: "The sort order. By default, returned records are sorted by primary key value in ascending order. e.g. ?sort=lastName%20ASC"
            },
            PopulateQueryParam: {
                in: "query",
                name: "populate",
                required: false,
                type: "string",
                description: "check for better understanding -> http://sailsjs.com/documentation/reference/blueprint-api/find-where"
            },
            PageQueryParam: {
                in: "query",
                name: "page",
                required: false,
                type: "integer",
                description: "This helps with pagination and when the limit is known"
            },
            SelectQueryParam: {
                in: "query",
                name: "select",
                required: false,
                type: "string",
                description: 'This helps with what to return for the user and its "," delimited'
            },
            TokenHeaderParam: {
                in: "header",
                name: "token",
                required: false,
                type: "string",
                description: "Incase we want to send header information along our request"
            },
            IDPathParam: {
                in: "path",
                name: "id",
                required: true,
                type: "string",
                description: "This is to identify a particular object out"
            },
            PerPageQueryParam: {
                in: "query",
                name: "perPage",
                required: false,
                type: "integer",
                description: "This helps with pagination and when the limit is known for pagify"
            }
        },
        paths: {},
        definitions: {},
        securityDefinitions: {
            "Authorization": {
                "type": "apiKey",
                "description": "user JWT Auth Token",
                "name": "Authorization",
                "in": "header",
                "flow": "password"
            },
        }
    }
};