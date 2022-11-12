/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
 *
 */

/* global Client */

/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

var oauth2orize = require('oauth2orize'),
    passport = require('passport'),
    login = require('connect-ensure-login'),
    bcrypt = require('bcryptjs'),
    trustedClientPolicy = require('../api/policies/isTrustedClient.js'),
    loginSocialService = require('../api/services/loginSocialService.js'),
    oauth2_server = require('./oauth2.js').server;

//var serveStatic = require('serve-static')
module.exports.routes = {


    //  ╦ ╦╔═╗╔╗ ╔═╗╔═╗╔═╗╔═╗╔═╗
    //  ║║║║╣ ╠╩╗╠═╝╠═╣║ ╦║╣ ╚═╗
    //  ╚╩╝╚═╝╚═╝╩  ╩ ╩╚═╝╚═╝╚═╝

    /***************************************************************************
     *                                                                          *
     * Make the view located at `views/homepage.ejs` your home page.            *
     *                                                                          *
     * (Alternatively, remove this and add an `index.html` file in your         *
     * `assets` directory)                                                      *
     *                                                                          *
     ***************************************************************************/
	/*//'GET /assets/*': require('express').static(process.cwd() + '/assets'),
	'GET /assets/*': {
     fn: function(app) {
       //require('express').static(process.cwd() + '/assets/');
       app.use('/', require('express').static(process.cwd() + '/assets/'));
     },
     skipAssets: false
  },*/
	/*'/images/*': function(request, response) {
        response.status(200).json({ message: 'Welcome to Shejobs API.' });
    },*/
    '/': function(request, response) {
        response.status(200).json({ message: 'Welcome to Shejobs API.' });
    },

    /***************************************************************************
     *                                                                          *
     * More custom routes here...                                               *
     * (See https://sailsjs.com/config/routes for examples.)                    *
     *                                                                          *
     * If a request to a URL doesn't match any of the routes in this file, it   *
     * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
     * not match any of those, it is matched against static assets.             *
     *                                                                          *
     ***************************************************************************/
	 
	 /*Swagger UI root path  for json data  */
	 'get /swagger.json': (_, res) => {
	const swaggerJson = require('../swagger.json')
    if (!swaggerJson) {
      res
        .status(404)
        .set('content-type', 'application/json')
        .send({message: 'Cannot find swagger.json, has the server generated it?'})
    }
    return res
      .status(200)
      .set('content-type', 'application/json')
      .send(swaggerJson)
  },
  
	'POST /scoremaster/upload' : { controller: 'scoremaster', action: 'upload'},
	
	/*Contact form routes*/
	'POST /contact/create': { controller: 'contact', action: 'create' },
	
	/*invities routes*/	
    'POST /invitestatus/create' : { controller: 'invitestatus', action: 'create' },
     'POST /invitestatus/cancel' : { controller: 'invitestatus', action: 'cancel' },

	/*Country routes*/
    'GET /country/list/': { controller: 'country', action: 'list',swagger: {
        tags: ["Country"],
		summary:"This api list out the country details ",
		//deprecated:true,
		parameters: [{
			name: "page",
              in: "query",
			  required: true,
              type: "number",
              description: "Enter the page limite"
            },{
              name: "limit",
			  in: "query",
              required: true,
              type: "number",
              description: "Enter the country limite"
            },{
              in: "query",
              name: "search",
              required: false,
              type: "string",
              description: "Enter the string value "
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
	'POST /country/create': { controller: 'country', action: 'create' },
    'POST /country/find': { controller: 'country', action: 'find' },
    'GET /country/findone/:id': { controller: 'country', action: 'findone' ,swagger: {
		summary:"This api list out the country details based on the country id ",
		description:"Use Admin/Employer/User AccessToken",
        tags: ["Country"],
			parameters: [{
              in: "path",
              name: "id",
			  required: true,
			  type:"number",
              description: "Enter the Country id "
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'PUT /country/update/:id': { controller: 'country', action: 'update' },
    'POST /country/delete' : { controller: 'country', action: 'delete' },
    'POST /country/upload' : { controller: 'country', action: 'upload' },
	
	/* Notification routes */
	
    'POST /notification/count': { controller: 'notification', action: 'count',swagger: {
		summary:"This api show the  Notification count based on User/Employer",
		description:"Use Employer AccessToken to get the Employer Notification count \nUse User AccessToken to get the Used Notification count",
        tags: ["Notification"],
			parameters: [{
              in: "query",
              name: "view",
			  required: true,
			  type:"string",
			  enum:["employee","user"],
              description: ""
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    } },
    'POST /notification/details': { controller: 'notification', action: 'details' ,swagger: {
		summary:"This api show the  Notification details based on User/Employer",
		description:"Use Employer AccessToken to get the Employer Notification details \nUse User AccessToken to get the Used Notification details",
        tags: ["Notification"],
			parameters: [{
              in: "query",
              name: "limit",
			  required: true,
			  type:"number",
              description: "Enter the limit of the notification"
            },{
              in: "query",
              name: "page",
			  required: true,
			  type:"number",
              description: "Enter the page limit"
            },{
              in: "query",
              name: "view",
			  required: true,
			  type:"string",
			  enum:["employee","user"],
              description: ""
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    } },
	
	/*language routes*/
    'GET /language/list': { controller: 'language', action: 'list' ,swagger: {
		summary:"This api show the  Language details",
		description:"",
        tags: ["Language"],
			parameters: [{
              in: "query",
              name: "page",
			  required: true,
			  type:"number",
              description: "Enter the page number"
            },{
              in: "query",
              name: "limit",
			  required: true,
			  type:"number",
              description: "Enter the limit"
            },{
              in: "query",
              name: "search",
			  required: false,
			  type:"string",
              description: "Enter the search value"
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'POST /language/find': { controller: 'language', action: 'find' },
    'POST /language/create': { controller: 'language', action: 'create' },
    'GET /language/findone/:id': { controller: 'language', action: 'findone' ,swagger: {
		summary:"This api show the  Language details based on the language id",
		description:"Use Admin/Employer/User AccessToken",
        tags: ["Language"],
			parameters: [{
              in: "path",
              name: "id",
			  required: true,
			  type:"number",
              description: "Enter the Lnaguage id "
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'PUT /language/update/:id': { controller: 'language', action: 'update' },
    'POST /language/delete' : { controller: 'language', action: 'delete' },
    'POST /language/upload' : { controller: 'language', action: 'upload' },
	
    /*Client routes*/
    'GET /clients/create': nonGetHandler,
    'POST /clients/create': { controller: 'clients', action: 'create' },
    'GET /clients/list': { controller: 'clients', action: 'list' },

	'GET /user/application/delete/:id': nonGetHandler,
    'POST /user/application/delete/:id': { controller: 'jobpostings', action: 'applications/delete-application' },
    
	
    /*Users routes*/
    'GET /users/list': { controller: 'users', action: 'list' },
    'GET /users/signup': nonGetHandler,
    'POST /users/signup': { controller: 'users', action: 'signup',swagger: {
		summary:"This api used for create user account",
		description:"",
        tags: ["Users"],
		parameters: [{
              in: "body",
              name: "body",
              required: true,
              schema: {
				  properties:{
					email: { type: "string",format:"email",example:"email@mailinator.com" },
					first_name: { type: "string" ,example:"first_name"},
					last_name: { type: "string" ,example:"last_name"},
					password: { type: "string",minLength:"6" ,example:"New@1234"}
				  }
			  },
		
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
	'POST /users/delete-account': { controller: 'users', action: 'delete-account',swagger: {
		summary:"This api used for delete user account",
		description:"",
        tags: ["Users"],
		parameters: [{
              in: "body",
              name: "body",
              required: true,
              schema: {
				  properties:{
					id: { type: "integer",example:"555",format: "int64" },
				  }
			  },
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    } },
    'GET /users/view/:id': { controller: 'users', action: 'view' ,swagger: {
		summary:"This api used for view user details",
		description:"Use Employer AccessToken",
        tags: ["Users"],
		parameters: [{
              in: "path",
              name: "id",
              required: true,
              type: "number",
              description: "Enter the User id"
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'GET /users/profile': { controller: 'users', action: 'profile' ,swagger: {
		summary:"This api used for view user details based on the user accesstoken",
		description:"Use User AccessToken",
        tags: ["Users"],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'GET /users/update': nonGetHandler,
    'POST /users/update': { controller: 'users', action: 'update',swagger: {
		summary:"This api update the user details based on the user accesstoken ",
		description:"Use User AccessToken",
        tags: ["Users"],
			parameters: [{
              in: "body",
              name: "body",
              required: true,
              schema: {
				  properties:{
					  authorized_country: { type: "array",items:{type:"number",example:"99"}},
					  authorized_country_select: { type: "array",example:null},
					  availability:{ type: "number",example:"0"},
					  bio:{ type: "string",example:"Lorem Ipsum"},
					  blog:{ type: "string",example:"www.google.com"},
					  blogBoolen:{ type: "boolean",example:true},
					  certification:{ type: "array",example:["sap ai","sap test"]},
					  city: { type: "string",example:"coimbatore"},
					  clients_worked:{ type: "array",items:{type:"strung",example:"tcs"}},
					  country: { type: "string",example:"india"},
					  current_employer: { type: "string",example:"karthi"},
					  current_employer_role: { type: "string",example:"web"},
					domains_worked: { type: "array",example:["63","14","16"]},
					 education_qualification: {
					 type:"array",
					items: {
                       type: "object",
                       properties: {
                          degree: {
                             type: "string",
							 example:"bachelors"
                          },
						  field_of_study: {
                             type: "string",
							 example:"bsc"
                          },
						  year_of_completion: {
                             type: "number",
							 example:"2021",
                          }
                       }
                    }},
					employer_role_type: { type: "string",example:"Technofunctional"},
					end_to_end_implementation: { type: "number",example:"1"},
					entry: { type: "boolean",example:false},
					experience: { type: "number",example:"1"},
					first_name: { type: "string",example:"Karthi"},
					github: { type: "string",example:"www.google.com"},
					githubBoolen: { type: "boolean",example:true},
					hands_on_experience: { 
					 type:"array",
					items: {
                       type: "object",
                       properties: {
                          exp_type: {
                             type: "string",
							 example:"years"
                          },
						  experience: {
                             type: "number",
							 example:"1"
                          },
						  skill_id: {
                             type: "number",
							 example:"2",
                          },
						  skill_name: {
                             type: "string",
							 example:"SAP IM",
                          }
                       }
                    }},
					job_role: { type: "string",example:"SAP MM Consultant"},
					job_type: { type: "array",example:["1000","1001","1002","1003","1004"]},
					language_known: { 
					 type:"array",
					items: {
                       type: "object",
                       properties: {
                          fluent: {
                             type: "boolean",
							 example:false
                          },
						  intermediate: {
                             type: "boolean",
							 example:false
                          },
						  language: {
                             type: "number",
							 example:"1",
                          },
						  native: {
                             type: "boolean",
							 example:true,
                          }
                       }
                    }},
					last_name: { type: "string",example:"keyan"},
					latlng: {
                       type: "object",
                       properties: {
                          lat: {
                             type: "number",
							 example:"11.0168445"
                          },
						  lng: {
                             type: "number",
							 example:"76.9558321"
                          }
                       }
					},
					linkedin:{ type: "string",example:"www.google.com"},
					linkedinBoolen: { type: "boolean",example:true},
					nationality: { type: "number",example:"99"},
					new_skills: { type: "array",example:[""]},
					other_skills: { type: "array",example:["Testing","uidesign"]},
					phone:{ type: "number",example:"+911232434344"},
					portfolio: { type: "string",example:"www.google.com"},
					portfolioBoolen: { type: "boolean",example:true},
					preferred_countries: { type: "array",example:["99"]},
					preferred_location:{ type: "string",example:null},
					preferred_locations: { 
					 type:"array",
					items: {
                       type: "object",
                       properties: {
                          city: {
                             type: "string",
							 example:""
                          },
						  country: {
                             type: "string",
							 example:""
                          },
						  state: {
                             type: "string",
							 example:"",
                          },
						  stateShort: {
                             type: "string",
							 example:"",
                          }
                       }
                    }},
					privacy_protection: { 
					 type:"array",
                       type: "object",
					   properties: {
                          available_for_opportunity: {
                             type: "boolean",
							 example:true
                          },
						  current_employer: {
                             type: "boolean",
							 example:true
                          },
						  email: {
                             type: "boolean",
							 example:true,
                          },
						  employer_mail_send: {
                             type: "boolean",
							 example:true,
                          },
						  interview_scheduled: {
                             type: "boolean",
							 example:true,
                          },
						  new_match: {
                             type: "boolean",
							 example:true,
                          },
						  phone: {
                             type: "boolean",
							 example:true,
                          },
						  photo: {
                             type: "boolean",
							 example:true,
                          },
						  profile_rejected: {
                             type: "boolean",
							 example:true,
                          },
						  profile_shortlisted: {
                             type: "boolean",
							 example:true,
                          },
						  reference: {
                             type: "boolean",
							 example:true,
                          }
					   }},
					programming_skills: { type: "array",example:["Hana Architecture","CSS","Sql"]},
					reference: { 
					 type:"array",
					items: {
                       type: "object",
                       properties: {
                          company_name: {
                             type: "string",
							 example:"sap world"
                          },
						  email: {
                             type: "string",
							 example:"testuser@mailinator.com"
                          },
						  name: {
                             type: "string",
							 example:"trsting",
                          },
                       }
                    }},
					remote_only: { type: "boolean",example:false},
					sap_experience: { type: "string",example:"1"},
					 skills:{ type: "array",example:["2","4","3","6"]},
					 skills_Data: { type: "string",example:null},
					 skills_Datas: { type: "string",example:null},
					 social_media_link: { type: "string",example:null},
					 state: { type: "string",example:"tamil nadu"},
					 travel: { type: "number",example:"25"},
					 visa_sponsered: { type: "boolean",example:true},
					 visa_type: { type: "string",example:null},
					 willing_to_relocate: { type: "boolean",example:true},
					 youtube: { type: "string",example:"www.google.com"},
					 youtubeBoolen: { type: "boolean",example:true},
					 zipcode: { type: "string",example:"12345"},
				  }
			  },
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'GET /users/update-photo': nonGetHandler,
    'POST /users/update-photo': { controller: 'users', action: 'update-photo' ,swagger: {
		summary:"This api update the user photo based on the user accesstoken ",
		description:"Use User AccessToken",
        tags: ["Users"],
		parameters: [{
              in: "formData",
              name: "photo",
              required: true,
			  type: "file",
              description: ""
            },{
              in: "formData",
              name: "extension",
              required: true,
			  type: "string",
			  enum:[
			  "jpg",
			  "png"
			  ],
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'GET /users/update-doc-resume': nonGetHandler,
    'POST /users/update-doc-resume': { controller: 'users', action: 'update-doc-resume' ,swagger: {
		summary:"This api update the user resume based on the user accesstoken ",
		description:"Use User AccessToken",
        tags: ["Users"],
		parameters: [{
              in: "formData",
              name: "doc_resume",
              required: true,
			  type: "file",
              description: ""
            },{
              in: "formData",
              name: "title",
              required: true,
			  type: "string",
              description: ""
            },{
              in: "formData",
              name: "extension",
              required: true,
			  type: "string",
			  enum:[
			  "doc",
			  "docx",
			  "pdf"
			  ],
              description: ""
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'GET /users/update-doc-cover': nonGetHandler,
    'POST /users/update-doc-cover': { controller: 'users', action: 'update-doc-cover',swagger: {
		summary:"This api update the user cover letter based on the user accesstoken ",
		description:"Use User AccessToken",
        tags: ["Users"],
		parameters: [{
              in: "formData",
              name: "doc_cover",
              required: true,
			  type: "file",
              description: ""
            },{
              in: "formData",
              name: "title",
              required: true,
			  type: "string",
              description: ""
            },{
              in: "formData",
              name: "extension",
              required: true,
			  type: "string",
			  enum:[
			  "doc",
			  "docx",
			  "pdf"
			  ],
			  allowExtensions: [ '.doc', '.docx','.pdf'],
              description: ""
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    } },
    'GET /users/delete-resume': nonGetHandler,
    'POST /users/delete-resume': { controller: 'users', action: 'resume-delete' ,swagger: {
		summary:"This api delete the user resume based on the user accesstoken ",
		description:"Use User AccessToken",
        tags: ["Users"],
			parameters: [{
              in: "body",
              name: "body",
              required: true,
			  schema: {
				  properties:{
					file_key: { type: "string",example:"resume5671665745869324.docx" },
				  }
			  },
              description: ""
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'GET /users/delete-cover': nonGetHandler,
    'POST /users/delete-cover': { controller: 'users', action: 'cover-delete',swagger: {
		summary:"This api delete the user cover letter based on the user accesstoken ",
		description:"Use User AccessToken",
        tags: ["Users"],
		parameters: [{
              in: "body",
              name: "body",
              required: true,
              schema: {
				  properties:{
					file_key: { type: "string",example:"resume5671665745869324.docx" },
				  }
			  },
              description: ""
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    } },
    'GET /users/choose-default-resume': nonGetHandler,
    'POST /users/choose-default-resume': { controller: 'users', action: 'choose-default-resume' ,swagger: {
		summary:"This api used to select  default resume based on the user accesstoken ",
		description:"Use User AccessToken",
        tags: ["Users"],
		parameters: [{
              in: "body",
              name: "body",
              required: true,
              schema: {
				  properties:{
					file_key: { type: "string",example:"resume5671665745869324.docx" },
				  }
			  },
              description: ""
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'GET /users/update-video-resume': nonGetHandler,
    'POST /users/update-video-resume': { controller: 'users', action: 'update-video-resume' },
    'GET /users/check-user-handle/:user_handle': { controller: 'users', action: 'check-user-handle' },
    'GET /users/update-user-handle': nonGetHandler,
    'POST /users/update-user-handle': { controller: 'users', action: 'update-user-handle' },
    'GET /users/update-phone': nonGetHandler,
    'POST /users/update-phone': { controller: 'users', action: 'update-phone' },
    'GET /users/update-email': nonGetHandler,
    'POST /users/update-email': { controller: 'users', action: 'update-email' },
    'GET /users/employments/create': nonGetHandler,
    'POST /users/employments/create': { controller: 'users', action: 'employments/create' },
    'GET /users/employments/update/:id': nonGetHandler,
    'POST /users/employments/update/:id': { controller: 'users', action: 'employments/update' },
    'GET /users/employments/delete': nonGetHandler,
    'POST /users/employments/delete': { controller: 'users', action: 'employments/delete' },
    'GET /users/educations/create': nonGetHandler,
    'POST /users/educations/create': { controller: 'users', action: 'educations/create' },
    'GET /users/educations/update/:id': nonGetHandler,
    'POST /users/educations/update/:id': { controller: 'users', action: 'educations/update' },
    'GET /users/educations/delete': nonGetHandler,
    'POST /users/educations/delete': { controller: 'users', action: 'educations/delete' },
    'GET /users/change-status': nonGetHandler,
    'POST /users/change-status/:id': { controller: 'users', action: 'change-status' },
    'GET /users/user-dashboard': nonGetHandler,
    'POST /users/user-dashboard': { controller: 'users', action: 'user-dashboard' ,swagger: {
		summary:"This api show the Dasboard's Needs details",
		description:"Use User AccessToken \nThe parameters of the 'view' have some option like \n1. matches \n2. visa \n3. interview \n4. shortlisted \n5. applied",
        tags: ["Users"],
		parameters: [{
              in: "body",
              name: "body",
              required: true,
              schema: {
				  properties:{
					id: { type: "number",example:"user_id" },
					view: { type: "string",example:"Remove_this_text_and_Insert_any_one_param_menction_above"}
				  }
			  },
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'GET /users/job-approach-invitation': { controller: 'users', action: 'job-approach-invitation' },
    /*Employers routes*/
    'GET /employers/list': { controller: 'employers', action: 'list',swagger: {
		summary:"This api list out the Employer details",
		description:"Use Admin AccessToken",
        tags: ["Employers"],
		parameters: [{
              in: "query",
              name: "page",
              required: true,
			  type: "number",
			  
            },{
              in: "query",
              name: "limit",
              required: true,
			  type: "number",
              
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }  },
    'GET /employers/signup': nonGetHandler,
    'POST /employers/signup': { controller: 'employers', action: 'signup' ,swagger: {
		summary:"This api used for create Employer account",
		description:"",
        tags: ["Employers"],
		parameters: [{
              in: "body",
              name: "body",
              required: true,
              schema: {
				  properties:{
					 company: { type: "string" ,example:"company name"},
					email: { type: "string",format:"email",example:"email@mailinator.com" },
					first_name: { type: "string" ,example:"first_name"},
					last_name: { type: "string" ,example:"last_name"},
					password: { type: "string",minLength:"6" ,example:"New@1234"}
				  }
			  },
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'GET /employers/view/:id': { controller: 'employers', action: 'view' ,swagger: {
		summary:"This api show the  Employer Details",
		description:"Use Admin/Employer AccessToken",
        tags: ["Employers"],
		parameters: [{
              in: "path",
              name: "id",
              required: true,
              type: "integer",example:"50",format: "int64",
              description: "Enter the Employer id"
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'GET /employers/profile': { controller: 'employers', action: 'profile' ,swagger: {
		summary:"This api show the  Employer Profile Details based on the employer accesstoken",
		description:"Use Employer AccessToken",
        tags: ["Employers"],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'GET /employers/update/:id': nonGetHandler,
    'POST /employers/update': { controller: 'employers', action: 'update' },
    'GET /employers/update-photo': nonGetHandler,
    'POST /employers/update-photo': { controller: 'employers', action: 'update-photo' ,swagger: {
		summary:"This api update the Employer Profile Photo based on the employer accesstoken",
		description:"Use Employer AccessToken",
        tags: ["Employers"],
		parameters: [{
              in: "formData",
              name: "photo",
              required: true,
			  type: "file",
              description: ""
            },{
              in: "formData",
              name: "extension",
              required: true,
			  type: "string",
			  enum:[
			  "jpg",
			  "png"
			  ],
              description: ""
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'GET /employers/update-phone': nonGetHandler,
    'POST /employers/update-phone': { controller: 'employers', action: 'update-phone' },
    'GET /employers/update-email': nonGetHandler,
    'POST /employers/update-email': { controller: 'employers', action: 'update-email' },
    'GET /employers/approach-job-seeker': nonGetHandler,
    'POST /employers/approach-job-seeker': { controller: 'employers', action: 'approach-job-seeker' },
    'GET /employers/update-company-profile': nonGetHandler,
    'POST /employers/update-company-profile': { controller: 'employers', action: 'update-company-profile' ,swagger: {
		summary:"This api update the Employer Profile Details based on the employer accesstoken",
		description:"Use Employer AccessToken",
        tags: ["Employers"],
		description: "",
			parameters: [{
              in: "body",
              name: "body",
              required: true,
              schema: {
				  properties:{
					  address: { type: "string",example:""},
					  city: { type: "string",example:"coimbatore"},
					  contact: { type: "array",items:{type:"number",example:"+911234567899"}},
					  country: { type: "string",example:"india"},
					  description: { type: "string",example:"ccccccccccccccccccccccccccccccccccccddddddddddddddddddddddddddddddddcfffffffffffffffffffffffffffffffffffffffffffffffsssssssssss"},
					  email_id: { type: "string",format:"email",example:"karthihr@mailinator.com" },
					  invite_url: { type: "string",example:null},
					  latlng: {
                       type: "object",
                       properties: {
                          lat: {
                             type: "number",
							 example:"11.0168445"
                          },
						  lng: {
                             type: "number",
							 example:"76.9558321"
                          }
                       }
					},
					  linkedin: { type: "string",example:"https://www.google.com/"},
					 linkedinBoolen: { type: "boolean",example:true},
					 name: { type: "strike",example:"SAP World",description:"company name"},
					 state: { type: "strike",example:"tamil nadu",description:"company name"},
					 social_media_link: { 
					 type:"array",
					items: {
                       type: "object",
                       properties: {
                          media: {
                             type: "string",
							 example:"linkedin"
                          },
						  url: {
                             type: "string",
							 example:"https://www.google.com/"
                          },
						  visibility: {
                             type: "boolean",
							 example:true
                          }
                       }
                    }},
					 website: { type: "strike",example:"http://www.google.com",description:"Enter the company website url"},
					 zipcode: { type: "string",example:"1234",description:"Enter the zipcode"},

					  
				  }
			  },
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'GET /employers/company-profile': { controller: 'employers', action: 'company-profile' ,swagger: {
		summary:"This api show the Employer Profile Details based on the employer accesstoken",
		description:"Use Employer AccessToken",
        tags: ["Employers"],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'GET /employerssave-profile': nonGetHandler,
    'POST /employers/save-profile': { controller: 'employers', action: 'save-profile' ,swagger: {
		summary:"This api save or remove the user details in the saved-profile list",
		description:"Use Employer AccessToken \n1. delete param 0 used for add the user to the  saved list \n2.delete param 1 used for remove the user form the saved list",
        tags: ["Employers"],
			parameters: [{
              in: "body",
              name: "body",
              required: true,
              schema: {
				  properties:{
					delete: { type: "number",example:"0"},
					user_id: { type: "number",example:"657"},
				  }
			  },
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'GET /employers/saved-profiles': { controller: 'employers', action: 'saved-profiles',swagger: {
		summary:"This api show saved-profile user list",
		description:"Use Employer AccessToken ",
        tags: ["Employers"],
		parameters: [{
              in: "path",
              name: "page",
              required: true,
			  type: "number",
			  
            },{
              in: "path",
              name: "limit",
              required: true,
			  type: "number",
              
            },{
              in: "path",
              name: "status",
              required: true,
			  type: "string",
			  enum:["1"],
              
            },{
              in: "path",
              name: "search",
              required: false,
			  type: "string",
              
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    } },
	'GET /employers/employers-dashboard': nonGetHandler,
    'POST /employers/employers-dashboard': { controller: 'employers', action: 'employers-dashboard' ,swagger: {
		summary:"This api show the Dasboard's Needs details",
		description:"Use Employer AccessToken \nThe parameters of the 'view' have some option like \n1. hiringtrend \n2. chartDetails ",
        tags: ["Employers"],
		parameters: [{
              in: "body",
              name: "body",
              required: true,
              schema: {
				  properties:{
					id: { type: "number",example:"emp_id" },
					view: { type: "string",example:"Remove_this_text_and_Insert_any_one_param_menction_above"}
				  }
			  },
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    /*Jobs routes*/
    'GET /jobpostings/list': { controller: 'jobpostings', action: 'list', swagger: {
		summary:"This api show the Employer postedJobs  details",
		description:"Use Employer AccessToken",
        tags: ["Jobpostings"],
		parameters: [{
              in: "query",
              name: "page",
              required: true,
			  type: "number",
			  
            },{
              in: "query",
              name: "limit",
              required: true,
			  type: "number",
			  enum:["1000"],
              
            },{
              in: "query",
              name: "view",
              required: true,
			  type: "string",
			  enum:["postedJobs"],
              
            },{
              in: "query",
              name: "expand",
              required: true,
			  type: "string",
			  enum:["company"],
              
            },{
              in: "query",
              name: "company",
              required: true,
			  type: "number",
			  description:"Enter the emp_id"
              
            },{
              in: "query",
              name: "sort",
              required: true,
			  type: "string",
			  enum:["created_at.desc"],
              
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    } },
    'GET /jobpostings/list/users/count': { controller: 'users', action: 'users-job-count',swagger: {
		summary: "This api list out the Total number of matches ,application,shortlisted count have jobs ",
		description:"Use Employer AccessToken",
        tags: ["Jobpostings"],
		parameters: [{
              in: "query",
              name: "page",
              required: true,
			  type: "number",
			  
            },{
              in: "query",
              name: "status",
              required: true,
			  type: "number",
			  enum:["1"],
              
            },{
              in: "query",
              name: "limit",
              required: false,
			  type: "string",
              
            },{
              in: "query",
              name: "expand",
              required: false,
			  type: "string",
			  enum:["company"],
              
            },{
              in: "query",
              name: "company",
              required: true,
			  type: "number",
			  description:"Enter the emp_id"
              
            },{
              in: "query",
              name: "view",
              required: false,
			  type: "string",
			  enum:["applicants","shortlisted"],
			  description:"1.''- this option show the matching have job count\n2.'applicants' this options show the applicants have job count\n3.'shortlisted' this options show the shortlisted have job count"
              
            },{
              in: "query",
              name: "sort",
              required: false,
			  type: "created_at.desc",
			  enum:["created_at.desc"],
              
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }  },
    'GET /jobpostings/create': nonGetHandler,
    'POST /jobpostings/create': { controller: 'jobpostings', action: 'create',swagger: {
		summary: "This api create a new job",
		description:"Use Employer AccessToken",
        tags: ["Jobpostings"],
			parameters: [{
              in: "body",
              name: "body",
              required: true,
              schema: {
				  properties:{
					  
					availability: { type: "number",example:"15"},
					certification: { type: "array",example:["sap am","sam test","sam ai"]},
					contract_duration: { type: "string",example:""},
					 description:{ type: "string",example:"ZNsuuDFgdE3BUXaKdH5l8ZIvFIHfyL6Gb1MhtG0AYxpTkoCjQS4nTz7d7egq40A9J0EMELmic9A1a4ZbvXXcARY20US47Upr8myYQ8RsS398R4kd3MVSVrahLyGVHBGxfwzQcLnPuKqSBmJY0Wd94KtrFA2fTJgAeKKDpSb2lElX7AWu2QsKvtOTqyvRybwNl4zT93YBdDnd4bVx4jFUSUYhrrbdbwLiOMhxhLrOJylZzR3IX6XpXcNcQPUielZBearer"},
					 domain: { type: "array",example:["13","14"]},
					 education: { type: "string",example:"Diploma"},
					 employer_role_type: { type: "string",example:"Functional"},
					 end_to_end_implementation: { type: "number",example:"1"},
					 entry: { type: "boolean",example:false},
					 experience: { type: "number",example:"1"},
					 extra_criteria: { type: "array"},
					 facing_role: { type: "string",example:null},
					 financial_benefits: {
					 type:"array",
                       type: "object",
					   properties: {
                          corporate_plan: {
                             type: "boolean",
							 example:true
                          },
						  performance_bonus: {
                             type: "boolean",
							 example:true
                          },
						  purchase_plan: {
                             type: "boolean",
							 example:true,
                          },
						  retirement_plan: {
                             type: "boolean",
							 example:true,
                          },
						  tuition_reimbursement: {
                             type: "boolean",
							 example:false,
                          }
					   }},
					   hands_on_experience: { 
					 type:"array",
					items: {
                       type: "object",
                       properties: {
                          exp_type: {
                             type: "string",
							 example:"years"
                          },
						  experience: {
                             type: "number",
							 example:"1"
                          },
						  skill_id: {
                             type: "number",
							 example:"2",
                          },
						  skill_name: {
                             type: "string",
							 example:"SAP IM",
                          }
                       }
                    }},
					health_wellness: {
					 type:"array",
                       type: "object",
					   properties: {
                          dental: {
                             type: "boolean",
							 example:true
                          },
						  disability: {
                             type: "boolean",
							 example:true
                          },
						  life: {
                             type: "boolean",
							 example:true,
                          },
					   }},
					   job_locations: {
					 type:"array",
					items: {
                       type: "object",
                       properties: {
                          city: {
                             type: "string",
							 example:"Coimbatore"
                          },
						  country: {
                             type: "string",
							 example:"India"
                          },
						  countryshort: {
                             type: "string",
							 example:"IN",
                          },
						  state: {
                             type: "string",
							 example:"Tamil Nadu",
                          },
						  stateshort: {
                             type: "string",
							 example:"TN",
                          },
						  zipcode: {
                             type: "string",
							 example:null,
                          }
                       }

                    }},
					language: { type: "array",example:["1","113"]},
					match_select: {
					 type:"array",
                       type: "object",
					   properties: {
                          1: {
                             type: "string",
							 example:"0",
                          },
						  2: {
                             type: "string",
							 example:"0",
                          },
						  3: {
                             type: "string",
							 example:"0",
                          },
						  4: {
                             type: "string",
							 example:"0",
                          },
						  5: {
                             type: "string",
							 example:"0",
                          },
						  availability: {
                             type: "string",
							 example:"0",
                          },
						  certification: {
                             type: "string",
							 example:"",
                          },
						  domain: {
                             type: "string",
							 example:"2",
                          },
						  education: {
                             type: "string",
							 example:"",
                          },
						  employer_role_type: {
                             type: "string",
							 example:"1",
                          },
						  end_to_end_implementation: {
                             type: "string",
							 example:"1",
                          },
						  experience: {
                             type: "string",
							 example:"0",
                          },
						  hands_on_experience: {
                             type: "string",
							 example:"0",
                          },
						  language: {
                             type: "string",
							 example:"2",
                          },
						  need_reference: {
                             type: "string",
							 example:"1",
                          },
						  optinal_skills: {
                             type: "string",
							 example:"1",
                          },
						  programming_skills: {
                             type: "string",
							 example:"",
                          },
						  sap_experience: {
                             type: "string",
							 example:"0",
                          },
						  skills: {
                             type: "string",
							 example:"1",
                          },
						  travel_opportunity: {
                             type: "string",
							 example:"2",
                          },
						  type: {
                             type: "string",
							 example:"0",
                          },
						  work_authorization: {
                             type: "string",
							 example:"0",
                          },
					   }},
					   max: { type: "string",example:"17:00"},
					   min: { type: "string",example:"08:00"},
					   must_match: {
					 type:"array",
                       type: "object",
					   properties: {
						  availability: {
                             type: "boolean",
							 example:true,
                          },
						  certification: {
                             type: "boolean",
							 example:true,
                          },
						  domain: {
                             type: "boolean",
							 example:true,
                          },
						  end_to_end_implementation: {
                             type: "boolean",
							 example:true,
                          },
						  experience: {
                             type: "boolean",
							 example:true,
                          },
						  hands_on_experience: {
                             type: "boolean",
							 example:true,
                          },
						  optinal_skills: {
                             type: "boolean",
							 example:true,
                          },
						  programming_skills: {
                             type: "boolean",
							 example:true,
                          },
						  remote: {
                             type: "boolean",
							 example:true,
                          },
						  sap_experience: {
                             type: "boolean",
							 example:true,
                          },
						  skills: {
                             type: "boolean",
							 example:true,
                          },
						  travel_opportunity: {
                             type: "boolean",
							 example:true,
                          },
						  type: {
                             type: "boolean",
							 example:true,
                          },
						  visa_sponsorship: {
                             type: "boolean",
							 example:true,
                          },
						  work_authorization: {
                             type: "boolean",
							 example:true,
                          },
					   }},
					   need_reference: { type: "boolean",example:true},
					   negotiable: { type: "boolean",example:false},
					   new_skills: { type: "array"},
					   number_of_positions: { type: "number",example:"5"},
					   office_perks: {
					 type:"array",
                       type: "object",
					   properties: {
                          free_food: {
                             type: "boolean",
							 example:true
                          },
						  office_space: {
                             type: "boolean",
							 example:true
                          },
						  social_outings: {
                             type: "boolean",
							 example:true,
                          },
						  telecommuting: {
                             type: "boolean",
							 example:true,
                          },
						  wellness_program: {
                             type: "boolean",
							 example:true,
                          },
					   }},
					   optinal_skills: { type: "array",example:["Testing","desgign"]},
					   others: {
					 type:"array",
					 items:{
                       type: "object",
					   properties: {
                          id: {
                             type: "string",
							 example:"1"
                          },
						  title: {
                             type: "string",
							 example:"Should have done client facing role"
                          },
						  value: {
                             type: "boolean",
							 example:true,
                          },
					 }}},
					 others_data: { type: "string",example:null},
					 paid_off: {
					 type:"array",
                       type: "object",
					   properties: {
                          maternity: {
                             type: "boolean",
							 example:true
                          },
						  paid_parental_leave: {
                             type: "boolean",
							 example:true
                          },
						  paid_sick_leaves: {
                             type: "boolean",
							 example:true,
                          },
						  vacation_policy: {
                             type: "boolean",
							 example:true,
                          },
					   }},
					   programming_skills: { type: "array",example:["Hana Architecture","SAP Data Services","Java"]},
					   remote: { type: "boolean",example:true},
					   remote_option: { type: "string",example:"0"},
					   salary: { type: "string",example:"1000"},
					   salary_currency: { type: "String",example:"USD"},
					   salary_type: { type: "number",example:"2"},
					   sap_experience: { type: "number",example:"1"},
					   screening_process: {
					 type:"array",
					 items:{
                       type: "object",
					   properties: {
						  title: {
                             type: "string",
							 example:"Face to Face"
                          },
					 }}},
					 skills: { type: "array",example:["2","5","6"]},
					 skills_Data: { type: "string",example:null},
					 skills_Datas: { type: "string",example:null},
					 temp_screening_process: { type: "string",example:null},
					 title: { type: "string",example:"Swagger job posting"},
					 training_experience: { type: "string",example:null},
					 travel_opportunity: { type: "string",example:"50"},
					 type: { type: "string",example:"101"},
					 visa_sponsorship: { type: "boolean",example:true},
					 willing_to_relocate: { type: "string",example:null},
					 work_authorization: { type: "number",example:"2"},
					
				  }},
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'GET /jobpostings/view/:id': { controller: 'jobpostings', action: 'view' ,swagger: {
        tags: ["Jobpostings"],
		summary:"This api can used for view particular employer posted job details",
		parameters: [{
              in: "query",
              name: "expand",
              required: true,
              type: "string",
			  enum:["company"],
            },{
              in: "path",
              name: "id",
              required: true,
              type: "number",example:"108",
              description: "Enter the job id"
            },{
              in: "query",
              name: "emp_id",
              required: true,
              type: "number",example:"74",
              description: "Enter the Employer id"
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    } },
    'GET /jobpostings/update/:id': nonGetHandler,
    'POST /jobpostings/update/:id': { controller: 'jobpostings', action: 'update' ,swagger: {
		summary:"This api update the job based on the job_id",
		description:"Use Employer AccessToken",
        tags: ["Jobpostings"],
			parameters: [{
              in: "body",
              name: "body",
              required: true,
              schema: {
				  properties:{
					id: { type: "number",example:"Enter_the_job_id"},  
					availability: { type: "number",example:"15"},
					certification: { type: "array",example:["sap am","sam test","sam ai"]},
					contract_duration: { type: "string",example:""},
					 description:{ type: "string",example:"ZNsuuDFgdE3BUXaKdH5l8ZIvFIHfyL6Gb1MhtG0AYxpTkoCjQS4nTz7d7egq40A9J0EMELmic9A1a4ZbvXXcARY20US47Upr8myYQ8RsS398R4kd3MVSVrahLyGVHBGxfwzQcLnPuKqSBmJY0Wd94KtrFA2fTJgAeKKDpSb2lElX7AWu2QsKvtOTqyvRybwNl4zT93YBdDnd4bVx4jFUSUYhrrbdbwLiOMhxhLrOJylZzR3IX6XpXcNcQPUielZBearer"},
					 domain: { type: "array",example:["13","14"]},
					 education: { type: "string",example:"Diploma"},
					 employer_role_type: { type: "string",example:"Functional"},
					 end_to_end_implementation: { type: "number",example:"1"},
					 entry: { type: "boolean",example:false},
					 experience: { type: "number",example:"1"},
					 extra_criteria: { type: "array"},
					 facing_role: { type: "string",example:null},
					 financial_benefits: {
					 type:"array",
                       type: "object",
					   properties: {
                          corporate_plan: {
                             type: "boolean",
							 example:true
                          },
						  performance_bonus: {
                             type: "boolean",
							 example:true
                          },
						  purchase_plan: {
                             type: "boolean",
							 example:true,
                          },
						  retirement_plan: {
                             type: "boolean",
							 example:true,
                          },
						  tuition_reimbursement: {
                             type: "boolean",
							 example:false,
                          }
					   }},
					   hands_on_experience: { 
					 type:"array",
					items: {
                       type: "object",
                       properties: {
                          exp_type: {
                             type: "string",
							 example:"years"
                          },
						  experience: {
                             type: "number",
							 example:"1"
                          },
						  skill_id: {
                             type: "number",
							 example:"2",
                          },
						  skill_name: {
                             type: "string",
							 example:"SAP IM",
                          }
                       }
                    }},
					health_wellness: {
					 type:"array",
                       type: "object",
					   properties: {
                          dental: {
                             type: "boolean",
							 example:true
                          },
						  disability: {
                             type: "boolean",
							 example:true
                          },
						  life: {
                             type: "boolean",
							 example:true,
                          },
					   }},
					   job_locations: {
					 type:"array",
					items: {
                       type: "object",
                       properties: {
                          city: {
                             type: "string",
							 example:"Coimbatore"
                          },
						  country: {
                             type: "string",
							 example:"India"
                          },
						  countryshort: {
                             type: "string",
							 example:"IN",
                          },
						  state: {
                             type: "string",
							 example:"Tamil Nadu",
                          },
						  stateshort: {
                             type: "string",
							 example:"TN",
                          },
						  zipcode: {
                             type: "string",
							 example:null,
                          }
                       }

                    }},
					language: { type: "array",example:["1","113"]},
					match_select: {
					 type:"array",
                       type: "object",
					   properties: {
                          1: {
                             type: "string",
							 example:"0",
                          },
						  2: {
                             type: "string",
							 example:"0",
                          },
						  3: {
                             type: "string",
							 example:"0",
                          },
						  4: {
                             type: "string",
							 example:"0",
                          },
						  5: {
                             type: "string",
							 example:"0",
                          },
						  availability: {
                             type: "string",
							 example:"0",
                          },
						  certification: {
                             type: "string",
							 example:"",
                          },
						  domain: {
                             type: "string",
							 example:"2",
                          },
						  education: {
                             type: "string",
							 example:"",
                          },
						  employer_role_type: {
                             type: "string",
							 example:"1",
                          },
						  end_to_end_implementation: {
                             type: "string",
							 example:"1",
                          },
						  experience: {
                             type: "string",
							 example:"0",
                          },
						  hands_on_experience: {
                             type: "string",
							 example:"0",
                          },
						  language: {
                             type: "string",
							 example:"2",
                          },
						  need_reference: {
                             type: "string",
							 example:"1",
                          },
						  optinal_skills: {
                             type: "string",
							 example:"1",
                          },
						  programming_skills: {
                             type: "string",
							 example:"",
                          },
						  sap_experience: {
                             type: "string",
							 example:"0",
                          },
						  skills: {
                             type: "string",
							 example:"1",
                          },
						  travel_opportunity: {
                             type: "string",
							 example:"2",
                          },
						  type: {
                             type: "string",
							 example:"0",
                          },
						  work_authorization: {
                             type: "string",
							 example:"0",
                          },
					   }},
					   max: { type: "string",example:"17:00"},
					   min: { type: "string",example:"08:00"},
					   must_match: {
					 type:"array",
                       type: "object",
					   properties: {
						  availability: {
                             type: "boolean",
							 example:true,
                          },
						  certification: {
                             type: "boolean",
							 example:true,
                          },
						  domain: {
                             type: "boolean",
							 example:true,
                          },
						  end_to_end_implementation: {
                             type: "boolean",
							 example:true,
                          },
						  experience: {
                             type: "boolean",
							 example:true,
                          },
						  hands_on_experience: {
                             type: "boolean",
							 example:true,
                          },
						  optinal_skills: {
                             type: "boolean",
							 example:true,
                          },
						  programming_skills: {
                             type: "boolean",
							 example:true,
                          },
						  remote: {
                             type: "boolean",
							 example:true,
                          },
						  sap_experience: {
                             type: "boolean",
							 example:true,
                          },
						  skills: {
                             type: "boolean",
							 example:true,
                          },
						  travel_opportunity: {
                             type: "boolean",
							 example:true,
                          },
						  type: {
                             type: "boolean",
							 example:true,
                          },
						  visa_sponsorship: {
                             type: "boolean",
							 example:true,
                          },
						  work_authorization: {
                             type: "boolean",
							 example:true,
                          },
					   }},
					   need_reference: { type: "boolean",example:true},
					   negotiable: { type: "boolean",example:false},
					   new_skills: { type: "array"},
					   number_of_positions: { type: "number",example:"5"},
					   office_perks: {
					 type:"array",
                       type: "object",
					   properties: {
                          free_food: {
                             type: "boolean",
							 example:true
                          },
						  office_space: {
                             type: "boolean",
							 example:true
                          },
						  social_outings: {
                             type: "boolean",
							 example:true,
                          },
						  telecommuting: {
                             type: "boolean",
							 example:true,
                          },
						  wellness_program: {
                             type: "boolean",
							 example:true,
                          },
					   }},
					   optinal_skills: { type: "array",example:["Testing","desgign"]},
					   others: {
					 type:"array",
					 items:{
                       type: "object",
					   properties: {
                          id: {
                             type: "string",
							 example:"1"
                          },
						  title: {
                             type: "string",
							 example:"Should have done client facing role"
                          },
						  value: {
                             type: "boolean",
							 example:true,
                          },
					 }}},
					 others_data: { type: "string",example:null},
					 paid_off: {
					 type:"array",
                       type: "object",
					   properties: {
                          maternity: {
                             type: "boolean",
							 example:true
                          },
						  paid_parental_leave: {
                             type: "boolean",
							 example:true
                          },
						  paid_sick_leaves: {
                             type: "boolean",
							 example:true,
                          },
						  vacation_policy: {
                             type: "boolean",
							 example:true,
                          },
					   }},
					   programming_skills: { type: "array",example:["Hana Architecture","SAP Data Services","Java"]},
					   remote: { type: "boolean",example:true},
					   remote_option: { type: "string",example:"0"},
					   salary: { type: "string",example:"1000"},
					   salary_currency: { type: "String",example:"USD"},
					   salary_type: { type: "number",example:"2"},
					   sap_experience: { type: "number",example:"1"},
					   screening_process: {
					 type:"array",
					 items:{
                       type: "object",
					   properties: {
						  title: {
                             type: "string",
							 example:"Face to Face"
                          },
					 }}},
					 skills: { type: "array",example:["2","5","6"]},
					 skills_Data: { type: "string",example:null},
					 skills_Datas: { type: "string",example:null},
					 temp_screening_process: { type: "string",example:null},
					 title: { type: "string",example:"Swagger job posting"},
					 training_experience: { type: "string",example:null},
					 travel_opportunity: { type: "string",example:"50"},
					 type: { type: "string",example:"101"},
					 visa_sponsorship: { type: "boolean",example:true},
					 willing_to_relocate: { type: "string",example:null},
					 work_authorization: { type: "number",example:"2"},
					
				  }},
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'GET /jobpostings/update-photo/:id': nonGetHandler,
    'POST /jobpostings/update-photo/:id': { controller: 'jobpostings', action: 'update-photo' },
    'GET /jobpostings/delete': nonGetHandler,
    'POST /jobpostings/delete': { controller: 'jobpostings', action: 'delete' ,swagger: {
		summary:"This api delete the job based on the job_id",
		description:"Use Employer AccessToken",
        tags: ["Jobpostings"],
		parameters: [{
              in: "body",
              name: "body",
			  required: true,
              schema: {
				  properties:{
					ids: { type: "array",items:{type:"number",example:"Remove_this_test_and_Enter_the_job_id"} },
				  }
			  },
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'GET /jobpostings/change-status/:id': nonGetHandler,
    'POST /jobpostings/change-status/:id': { controller: 'jobpostings', action: 'change-status' ,swagger: {
		summary:"This api change-status the job based on the job_id",
		description:"Use Employer AccessToken\n1. status param  have some parameters like  \n1.status='0' Active the job \n2.status='98' Pause the job \n1.status='0' Deactive the job ",
        tags: ["Jobpostings"],
			parameters: [{
              in: "path",
              name: "id",
			  required: true,
			  type:"number",
              description: "Enter the job_id "
            },{
              in: "query",
              name: "status",
			  required: true,
			  type:"string",
			  enum:["1","98","0"],
			  description: "A. status param  have some parameters like  \n1.status='0' Active the job \n2.status='98' Pause the job \n1.status='0' Deactive the job ",
            },{
              in: "query",
              name: "status_glossary",
			  required: true,
			  type:"string",
			  enum:["active","pause","close"],
              description: ""
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    } },
    'GET /jobpostings/apply': nonGetHandler,
    'POST /jobpostings/apply': { controller: 'jobpostings', action: 'apply' ,swagger: {
		summary:"This api can allow the user to apply the mathcing jobs",
		description:"Use User AccessToken",
        tags: ["Jobpostings"],
			parameters: [{
              in: "formData",
              name: "job_posting",
			  required: true,
			  type:"number",
              description: "Enter the job_id"
            },{
              in: "formData",
              name: "others",
			  required: false,
			  type:"string",
			  description: "Enter if other skill requirement from employer site",
            },{
              in: "formData",
              name: "user_resume",
			  required: true,
			  type:"file",
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    } },
    'GET /jobpostings/applications/list': { controller: 'jobpostings', action: 'applications/list' ,swagger: {
        tags: ["Jobpostings"],
		summary:"This api can list out the job application list and list out the short_listed user in the Employer Module",
		description:"Use Employer AccessToken",
			parameters: [{
              in: "query",
              name: "page",
			  required: true,
			  type:"number",
              description: ""
            },{
              in: "query",
              name: "limit",
			  required: false,
			  type:"number",
			  
			  description: "",
            },{
              in: "query",
              name: "expand",
			  required: true,
			  type:"string",
			  enum:["job_posting,user,employer"]
            },{
              in: "query",
              name: "sort",
			  required: true,
			  type:"string",
			  enum:["updated_at.desc"]
            },{
              in: "query",
              name: "job_posting",
			  required: true,
			  type:"number",
			  description:"Enter the job id"
            },{
              in: "query",
              name: "short_listed",
			  required: false,
			  type:"number",
			  enum:["1"],
			  description:"select  - for application details \n 1 for the short_listed" 
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'GET /jobpostings/applications/list-for-user': { controller: 'jobpostings', action: 'applications/list-for-user' ,swagger: {
		summary:"This api can list out the job application list on the  User Module",
		description:"Use User AccessToken",
        tags: ["Jobpostings"],
			parameters: [{
              in: "query",
              name: "page",
			  required: true,
			  type:"number",
              description: ""
            },{
              in: "query",
              name: "limit",
			  required: false,
			  type:"number",
			  
			  description: "",
            },{
              in: "query",
              name: "expand",
			  required: true,
			  type:"string",
			  enum:["job_posting,user,employer"]
            },{
              in: "query",
              name: "sort",
			  required: true,
			  type:"string",
			  enum:["updated_at.desc"]
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'GET /jobpostings/applications/view/:id': { controller: 'jobpostings', action: 'applications/view' ,swagger: {
        tags: ["Jobpostings"],
		summary:"This api can show the job application details based on the  application_id / Ever application of the job cantain application_id",
		description:"Use Employer AccessToken",
			parameters: [{
              in: "path",
              name: "id",
			  required: true,
			  type:"number",
              description: "Enter the application_id"
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'GET /jobpostings/applications/view-for-user/:id': { controller: 'jobpostings', action: 'applications/view-for-user'},
    'GET /jobpostings/applications/change-status/:id': nonGetHandler,
    'POST /jobpostings/applications/change-status/:id': { controller: 'jobpostings', action: 'change-status' },
    'GET /jobpostings/applications/short-list-user/:id': nonGetHandler,
    'POST /jobpostings/applications/short-list-user': { controller: 'jobpostings', action: 'applications/short-list-user' ,swagger: {
        tags: ["Jobpostings"],
		summary:"This api can perform short-list-user process like short-list or reject user and change the interview status and schedule interview ",
		description:"Use Employer AccessToken",
		parameters: [{
              in: "body",
              name: "body",
              required: true,
              schema: {
				  properties:{
					application_status: {
					 type:"array",
					items: {
                       type: "object",
                       properties: {
                          comments: {
                             type: "string",
							 example:""
                          },
						  date: {
                             type: "string",
							 example:"2022-11-12T04:08:00.592Z"
                          },
						  id: {
                             type: "number",
							 example:"1",
                          },
						  status: {
                             type: "string",
							 example:"APPLICATION UNDER REVIEW",
                          }
                       },
                    }},
					apps: { type: "boolean",example:true},
					invite_status: { type: "boolean",example:false},
					invite_url: { type: "string",example:""},
					job_posting: { type: "string",example:"119"},
					short_listed: { type: "boolean",example:true},
					user: { type: "number",example:"633"},
					views: { type: "number",example:false},
					
				  }
			  },
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
	
	
	
    'GET /jobpostings/job-scoring': { controller: 'jobpostings', action: 'job-scoring' ,swagger: {
		summary:"This api can get job-scoring",
		description:"Use Employer AccessToken",
        tags: ["Jobpostings"],
			parameters: [{
              in: "query",
              name: "additional_fields",
			  required: true,
			  type:"string",
			  enum:["job_application"],
              description: ""
            },{
              in: "query",
              name: "id",
			  required: true,
			  type:"number",
              description: "Enter the job id "
            },{
              in: "query",
              name: "location_id",
			  required: true,
			  type:"number",
			  enum:["0"],
              description: ""
            },{
              in: "query",
              name: "user_id",
			  required: true,
			  type:"number",
              description: "Enter the user id"
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'GET /jobpostings/user-scoring': { controller: 'jobpostings', action: 'user-scoring',swagger: {
		summary:"This api can get user-scoring",
		description:"Use User AccessToken",
        tags: ["Jobpostings"],
			parameters: [{
              in: "query",
              name: "city",
			  required: true,
			  type:"string",
              description: "Enter the jobseeker  city"
            },{
              in: "query",
              name: "country",
			  required: true,
			  type:"string",
              description: "Enter the jobseeker  country"
            },{
              in: "query",
              name: "expand",
			  required: true,
			  type:"string",
			  enum:["company"],
              description: ""
            },{
              in: "query",
              name: "id",
			  required: true,
			  type:"number",
              description: "Enter the user id"
            },{
              in: "query",
              name: "job_id",
			  required: true,
			  type:"number",
              description: "Enter the job_id"
            },{
              in: "query",
              name: "visa_sponsered",
			  required: true,
			  type:"string",
			  enum:["true","false"],
              description: "visa_sponsered based on the user profile"
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    } },
    'GET /jobpostings/send-email': { controller: 'jobpostings', action: 'send-email' ,swagger: {
		summary:"This api can send a email to the user ",
		description:"Use Employer AccessToken",
        tags: ["Jobpostings"],
			parameters: [{
              in: "query",
              name: "job_id",
			  required: true,
			  type:"number",
              description: "Enter the job_id"
            },{
              in: "query",
              name: "location_id",
			  required: false,
			  type:"number",
              description: "Enter the location id"
            },{
              in: "query",
              name: "email_id",
			  required: true,
			  type:"string",
			   format: "email",
				pattern: "",
              description: "Enter the jobseeker email id"
            },{
              in: "query",
              name: "account",
			  required: true,
			  type:"number",
              description: "Enter the user id"
            },{
              in: "query",
              name: "id",
			  required: true,
			  type:"number",
              description: "Enter the user id"
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},

    /*Site routes*/
    'GET /site/health': { controller: 'site', action: 'health' },
    'GET /site/report': nonGetHandler,
    'POST /site/report': { controller: 'site', action: 'report' },

    /*Account routes*/
    'GET /accounts/request-reset-password': nonGetHandler,
    'POST /accounts/request-reset-password': { controller: 'accounts', action: 'request-reset-password' ,swagger: {
		summary:"This api send reset-password link to the email id",
		description:"\nType param 0 = User \n 1 = Employer \n 2 = Admin",
        tags: ["Accounts"],
			parameters: [{
              in: "body",
              name: "body",
              required: true,
              schema: {
				  properties:{
					email: { type: "string",example:"Enter_the_mail_id"},
					type: { type: "number",example:"0"}
				  }
			  },
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    } },
    'GET /accounts/reset-password': nonGetHandler,
    'POST /accounts/reset-password': { controller: 'accounts', action: 'reset-password'  ,swagger: {
		summary:"This api can reset the password",
		description:"",
        tags: ["Accounts"],
			parameters: [{
              in: "body",
              name: "body",
              required: true,
              schema: {
				  properties:{
					confirmPassword: { type: "string",example:"New@1234"},
					password: { type: "string",example:"New@1234"},
					id: { type: "number",example:"633"},
					token: { type: "string",example:"TZMY1otWL58qMLS8b2Lt"},
					verify: { type: "boolean",example:"false"},
				  }
			  },
              description: ""
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
	'GET /accounts/verify-otp': nonGetHandler,
    'POST /accounts/verify-otp': { controller: 'employers', action: 'verify-otp' ,swagger: {
		summary:"This api can verify the otp ",
		description:"",
        tags: ["Accounts"],
			parameters: [{
              in: "body",
              name: "body",
              required: true,
              schema: {
				  properties:{
					id: { type: "number", example:"Enter_emp_id"},
					otp: { type: "number", example:"456423"},
				  }
			  },
              description: ""
            }],
			consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'POST /accounts/send-otp': { controller: 'employers', action: 'send-otp' ,swagger: {
		summary:"This api send-opt to the employer mail id when the login by Temporary password ",
		description:"",
        tags: ["Accounts"],
			parameters: [{
              in: "body",
              name: "body",
              required: true,
              schema: {
				  properties:{
					id: { type: "number", example:"110"},
					otp: { type: "number", example:"456423"},
				  }
			  },
              description: ""
            }],
			consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'GET /accounts/verify': nonGetHandler,
    'POST /accounts/verify': { controller: 'accounts', action: 'verify' ,swagger: {
		summary:"This api verify the otp if it is correct employer move to the Reset Password page",
        tags: ["Accounts"],
			parameters: [{
              in: "body",
              name: "body",
              required: true,
              schema: {
				  properties:{
					id: { type: "number", example:"109"},
					token: { type: "number", example:"5ec5Tvyopl1O2A9krtMh"},
				  }
			  },
              description: ""
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'GET /accounts/update-password': nonGetHandler,
    'POST /accounts/update-password': { controller: 'accounts', action: 'update-password' ,swagger: {
		summary:"This api can update the password",
		description:"Use Admin/Employer/User AccessToken",
        tags: ["Accounts"],
			parameters: [{
              in: "body",
              name: "body",
              required: true,
              schema: {
				  properties:{
					email: { type: "string", example:"karthihr@mailinator.com"},
					password: { type: "string",example:"New@1234"}
				  }
			  },
              description: ""
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},

    /*Admins routes*/
    'GET /admins/create': nonGetHandler,
    'POST /admins/create': { controller: 'admins', action: 'create' },
    'GET /admins/profile': { controller: 'admins', action: 'profile'  ,swagger: {
		summary:"This api can get the Admin details",
		description:"Use Admin AccessToken",
        tags: ["Admins"],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
	'GET /admins/dashboard-details': nonGetHandler,
    'POST /admins/dashboard-details': { controller: 'admins', action: 'dashboard-details',swagger: {
		summary:"This api can get the Dashboard  details",
		description:"Use Admin AccessToken",
        tags: ["Admins"],
			parameters: [{
              in: "body",
              name: "body",
              required: true,
              schema: {
				  properties:{
					column: { type: "string", example:"title"},
					limit: { type: "number", example:"1000"},
					day: { type: "number", example:"10000"},
					page: { type: "page", example:"1"},
					search: { type: "string", example:""},
					sort: { type: "string",example:"asc"},
					view: { type: "string",example:"all"}
				  }
			  },
              description: ""
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    } },
	'GET /admins/user-list': nonGetHandler,
    'POST /admins/user-list': { controller: 'admins', action: 'user-list' ,swagger: {
		summary:"This api can get the user-list details",
		description:"Use Admin AccessToken",
        tags: ["Admins"],
			parameters: [{
              in: "body",
              name: "body",
              required: true,
              schema: {
				  properties:{
					column: { type: "string", example:"first_name"},
					limit: { type: "number", example:"1000"},
					page: { type: "page", example:"1"},
					search: { type: "string", example:""},
					sort: { type: "string",example:"asc"},
					view: { type: "string",example:"all"}
				  }
			  },
              description: ""
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
	'GET /admins/employee-list': nonGetHandler,
    'POST /admins/employee-list': { controller: 'admins', action: 'employee-list' ,swagger: {
		summary:"This api can get the employee-list details",
		description:"Use Admin AccessToken",
        tags: ["Admins"],
			parameters: [{
              in: "body",
              name: "body",
              required: true,
              schema: {
				  properties:{
					column: { type: "string", example:"company"},
					limit: { type: "number", example:"1000"},
					page: { type: "page", example:"1"},
					search: { type: "string", example:""},
					sort: { type: "string",example:"asc"},
					view: { type: "string",example:"all"}
				  }
			  },
              description: ""
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'GET /admins/list': { controller: 'admins', action: 'list' ,swagger: {
		summary:"This api can get the Employer and user counts  details",
		description:"Use Admin AccessToken",
        tags: ["Admins"],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    } },
    'GET /admins/update-photo': nonGetHandler,
    'POST /admins/update-photo': { controller: 'admins', action: 'update-photo' },
    'POST /admins/profile-complete-invite': { controller: 'admins', action: 'profile-complete-invite',swagger: {
		summary:"This api can send email ('profile-complete-invite') to the users",
		description:"Use Admin AccessToken",
        tags: ["Admins"],
			parameters: [{
              in: "query",
              name: "id",
			  required: true,
			  type:"number",
              description: "Enter the userid"
            },{
              in: "query",
              name: "message",
			  required: true,
			  type:"string",
              description: "Enter the message"
            },{
              in: "query",
              name: "subject",
			  required: true,
			  type:"string",
              description: "Enter the subject"
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    } },
	'POST /admins/employer-complete-invite': { controller: 'admins', action: 'employer-complete-invite' ,swagger: {
		summary:"This api can send email ('employer-complete-invite') to the Employers",
		description:"Use Admin AccessToken",
        tags: ["Admins"],
			parameters: [{
              in: "query",
              name: "id",
			  required: true,
			  type:"number",
              description: "Enter the emp_id"
            },{
              in: "query",
              name: "message",
			  required: true,
			  type:"string",
              description: "Enter the message"
            },{
              in: "query",
              name: "subject",
			  required: true,
			  type:"string",
              description: "Enter the subject"
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
	'POST /admins/create-employer': { controller: 'admins', action: 'add-employer' ,swagger: {
		summary:"This api can cretate a employer login",
		description:"Use Admin AccessToken",
        tags: ["Admins"],
			parameters: [{
              in: "body",
              name: "body",
              required: true,
              schema: {
				  properties:{
					company: { type: "string", example:"sap"},
					email: { type: "string", example:"karthihrnewadmin@mailinator.com"},
					first_name: { type: "string", example:"karthihr"},
					last_name: { type: "string", example:"keyan"},
					password: { type: "string",example:"od123456"},
					phone: { type: "string",example:"1122234567"}
				  }
			  },
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},

    /*Location routes*/
    'GET /locations/states': { controller: 'locations', action: 'states' },
    'GET /locations/countries': { controller: 'locations', action: 'countries' },
    'GET /locations/cities': { controller: 'locations', action: 'cities/list' },
    'GET /locations/cities/view/:id': { controller: 'locations', action: 'cities/view' },
    'GET /locations/areas': { controller: 'locations', action: 'areas' },

    /*Category routes*/
    'GET /categories/create': nonGetHandler,
    'POST /categories/create': { controller: 'categories', action: 'create' },
    'GET /categories/update/:id': nonGetHandler,
    'POST /categories/update/:id': { controller: 'categories', action: 'update' },
    'GET /categories/change-status/:id': nonGetHandler,
    'POST /categories/change-status/:id': { controller: 'categories', action: 'change-status' },
    'GET /categories/update-photo/:id': nonGetHandler,
    'POST /categories/update-photo/:id': { controller: 'categories', action: 'update-photo' },
    'GET /categories/delete': nonGetHandler,
    'POST /categories/delete': { controller: 'categories', action: 'delete' },
    'GET /categories/list': { controller: 'categories', action: 'list' },
    'GET /categories/view/:id': { controller: 'categories', action: 'view' },

    /*Educations routes*/
    'GET /educations/degrees/create': nonGetHandler,
    'POST /educations/degrees/create': { controller: 'educations', action: 'degrees/create' },
    'GET /educations/degrees/update/:id': nonGetHandler,
    'POST /educations/degrees/update/:id': { controller: 'educations', action: 'degrees/update' },
    'GET /educations/degrees/change-status/:id': nonGetHandler,
    'POST /educations/degrees/change-status/:id': { controller: 'educations', action: 'degrees/change-status' },
    'GET /educations/degrees/delete': nonGetHandler,
    'POST /educations/degrees/delete': { controller: 'educations', action: 'degrees/delete' },
    'GET /educations/degrees/view/:id': { controller: 'educations', action: 'degrees/view' },
    'GET /educations/degrees/list': { controller: 'educations', action: 'degrees/list' },

    'GET /educations/fields/create': nonGetHandler,
    'POST /educations/fields/create': { controller: 'educations', action: 'fields/create' },
    'GET /educations/fields/update/:id': nonGetHandler,
    'POST /educations/fields/update/:id': { controller: 'educations', action: 'fields/update' },
    'GET /educations/fields/change-status/:id': nonGetHandler,
    'POST /educations/fields/change-status/:id': { controller: 'educations', action: 'fields/change-status' },
    'GET /educations/fields/delete': nonGetHandler,
    'POST /educations/fields/delete': { controller: 'educations', action: 'fields/delete' },
    'GET /educations/fields/view/:id': { controller: 'educations', action: 'fields/view' },
    'GET /educations/fields/list': { controller: 'educations', action: 'fields/list' },

    'GET /educations/institutions/create': nonGetHandler,
    'POST /educations/institutions/create': { controller: 'educations', action: 'institutions/create' },
    'GET /educations/institutions/update/:id': nonGetHandler,
    'POST /educations/institutions/update/:id': { controller: 'educations', action: 'institutions/update' },
    'GET /educations/institutions/change-status/:id': nonGetHandler,
    'POST /educations/institutions/change-status/:id': { controller: 'educations', action: 'institutions/change-status' },
    'GET /educations/institutions/delete': nonGetHandler,
    'POST /educations/institutions/delete': { controller: 'educations', action: 'institutions/delete' },
    'GET /educations/institutions/view/:id': { controller: 'educations', action: 'institutions/view' },
    'GET /educations/institutions/list': { controller: 'educations', action: 'institutions/list' },

    /*Industries routes*/
    'GET /industries/list': { controller: 'industries', action: 'list' ,swagger: {
		summary:"This api can get the  industries details ",
		description:"Use Admin AccessToken",
        tags: ["Industries"],
			parameters: [{
              in: "query",
              name: "page",
			  required: true,
			  type:"number",
              description: "Enter the page"
            },{
              in: "query",
              name: "limit",
			  required: true,
			  type:"string",
              description: "Enter the limit"
            },{
              in: "query",
              name: "sort",
			  required: true,
			  type:"string",
			  enum:["name asc"],
              description: ""
            },{
              in: "query",
              name: "search",
			  required: false,
			  type:"string",
              description: ""
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'GET /industries/view/:id': { controller: 'industries', action: 'view' ,swagger: {
		summary:"This api can get the  industries details based on the passed id ",
		description:"Use Admin AccessToken",
        tags: ["Industries"],
			parameters: [{
              in: "path",
              name: "id",
			  required: true,
			  type:"number",
              description: "Enter the Industries id"
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'POST /industries/update-photo/:id': { controller: 'industries', action: 'update-photo' },
    'POST /industries/create': { controller: 'industries', action: 'create' ,swagger: {
		summary:"This api can create a new industries name ",
		description:"Use Admin AccessToken",
        tags: ["Industries"],
			parameters: [{
              in: "body",
              name: "body",
              required: true,
              schema: {
				  properties:{
					name: { type: "string", example:"aaaa"},
				  }
			  },
              description: "Enter the Industries name"
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
	'POST /industries/upload': { controller: 'industries', action: 'upload' },
    'POST /industries/update/:id': { controller: 'industries', action: 'update' ,swagger: {
		summary:"This api can update a industries name based on the industries id ",
		description:"Use Admin AccessToken",
        tags: ["Industries"],
			parameters: [{
              in: "path",
              name: "id",
              required: true,
			type: "string",
			example:"1",
              description: "Enter the Industries id"
            },{
              in: "body",
              name: "body",
              required: true,
              schema: {
				  properties:{
					name:{ type: "string", example:"abcde"},
				  }
			  },
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'GET /industries/find': { controller: 'industries', action: 'find' ,swagger: {
		summary:"This api can find all industries details",
		description:"Use Admin AccessToken",
        tags: ["Industries"],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'GET /industries/findone/:id': { controller: 'industries', action: 'findone' ,swagger: {
		summary:"This api can find  industries details based on the id",
		description:"Use Admin AccessToken",
        tags: ["Industries"],
			parameters: [{
              in: "path",
              name: "id",
			  required: true,
			  type:"number",
              description: "Enter the Industries id"
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'POST /industries/delete/:id' : { controller : 'industries' , action : 'delete',swagger: {
		summary:"This api can delete  industries details based on the id",
		description:"Use Admin AccessToken",
        tags: ["Industries"],
			parameters: [{
              in: "path",
              name: "id",
			  required: true,
			  type:"number",
              description: "Enter the Industries id for delete"
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},

    /*Skill_tags routes*/
    'GET /skill-tags/list': { controller: 'skill-tags', action: 'list' ,swagger: {
		summary:"This api can get  skill-tags details",
		description:"Use Admin AccessToken",
        tags: ["Skill-tags"],
			parameters: [{
              in: "query",
              name: "page",
			  required: true,
			  type:"number",
              description: "Enter the page"
            },{
              in: "query",
              name: "limit",
			  required: true,
			  type:"string",
              description: "Enter the limit"
            },{
              in: "query",
              name: "sort",
			  required: true,
			  type:"string",
			  enum:["tag asc"],
              description: ""
            },{
              in: "query",
              name: "search",
			  required: false,
			  type:"string",
              description: ""
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'GET /skill-tags/create': nonGetHandler,
    'POST /skill-tags/create': { controller: 'skill-tags', action: 'create' },
	
    'POST /skill-tags/creates': { controller: 'skill-tags', action: 'creates' ,swagger: {
		summary:"This api can create a new skill-tags details",
		description:"Use Admin AccessToken",
        tags: ["Skill-tags"],
			parameters: [{
              in: "body",
              name: "body",
              required: true,
              schema: {
				  properties:{
					long_tag:{ type: "string", example:"computes science"},
					tag:{ type: "string", example:"cs"},
				  }
			  },
              description: "Enter the Skill-tag name"
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'POST /skill-tags/update/:id': { controller: 'skill-tags', action: 'update' ,swagger: {
		summary:"This api can update a  skill-tags details based on the id",
		description:"Use Admin AccessToken",
        tags: ["Skill-tags"],
			parameters: [{
              in: "path",
              name: "id",
              required: true,
			type: "string",
			example:"1",
              description: "Enter the Skill-tag id"
            },{
              in: "body",
              name: "body",
              required: true,
              schema: {
				  properties:{
					long_tag:{ type: "string", example:"Business Planning and Simulation"},
					tag:{ type: "string", example:"BW-BPS"},
				  }
			  },
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'GET /skill-tags/find': { controller: 'skill-tags', action: 'find' ,swagger: {
		summary:"This api can get all  skill-tags details ",
		description:"Use Admin AccessToken",
        tags: ["Skill-tags"],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'GET /skill-tags/findone/:id': { controller: 'skill-tags', action: 'findone' ,swagger: {
		summary:"This api can get particular skill-tags details based on the id ",
		description:"Use Admin AccessToken",
        tags: ["Skill-tags"],
			parameters: [{
              in: "path",
              name: "id",
			  required: true,
			  type:"number",
              description: "Enter the skill id"
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'POST /skill-tags/delete/:id': { controller: 'skill-tags', action: 'delete' ,swagger: {
		summary:"This api can delete particular skill-tags details based on the id ",
		description:"Use Admin AccessToken",
        tags: ["Skill-tags"],
			parameters: [{
              in: "path",
              name: "id",
			  required: true,
			  type:"number",
              description: "Enter the skill id"
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
	'POST /skill-tags/upload': { controller: 'skill-tags', action: 'upload' },
	
	
    /*Program routes*/
    'GET /program/list': { controller: 'program', action: 'list' ,swagger: {
		summary:"This api can get program list details ",
		description:"Use Admin AccessToken",
        tags: ["Program"],
			parameters: [{
              in: "query",
              name: "page",
			  required: true,
			  type:"number",
              description: "Enter the page"
            },{
              in: "query",
              name: "limit",
			  required: true,
			  type:"string",
              description: "Enter the limit"
            },{
              in: "query",
              name: "sort",
			  required: true,
			  type:"string",
			  enum:["name asc"],
              description: ""
            },{
              in: "query",
              name: "search",
			  required: false,
			  type:"string",
              description: ""
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'GET /program/create': nonGetHandler,
    'POST /program/create': { controller: 'program', action: 'create' ,swagger: {
		summary:"This api can create a new program list details ",
		description:"Use Admin AccessToken",
        tags: ["Program"],
			parameters: [{
              in: "body",
              name: "body",
              required: true,
              schema: {
				  properties:{
					name: { type: "string", example:"aaaa"},
				  }
			  },
              description: "Enter the programing name"
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
     'POST /program/delete/:id' : { controller : 'program' , action : 'delete',swagger: {
		 summary:"This api can delete program list details based on the id",
		description:"Use Admin AccessToken",
        tags: ["Program"],
			parameters: [{
              in: "path",
              name: "id",
              required: true,
			  type:"number",
              description: "Enter the programing id"
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
    'GET /program/update/:id': nonGetHandler,
     'POST /program/update/:id': { controller: 'program', action: 'update',swagger: {
		 summary:"This api can update a program list details based on the id",
		description:"Use Admin AccessToken",
        tags: ["Program"],
			parameters: [{
              in: "path",
              name: "id",
              required: true,
			type: "string",
			example:"54",
              description: "Enter the programing id"
            },{
              in: "body",
              name: "body",
              required: true,
              schema: {
				  properties:{
					name:{ type: "string", example:"react"},
				  }
			  },
              description: "Enter the programing name"
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    } },
	 'POST /program/upload': { controller: 'program', action: 'upload' },

     /*workauthorization routes */
     'GET /workauthorization/list': { controller: 'workauthorization', action: 'list' ,swagger: {
		 summary:"This api can get  workauthorization  list details ",
		description:"Use Admin AccessToken",
        tags: ["Workauthorization"],
			parameters: [{
              in: "query",
              name: "page",
			  required: true,
			  type:"number",
              description: "Enter the page"
            },{
              in: "query",
              name: "limit",
			  required: true,
			  type:"string",
              description: "Enter the limit"
            },{
              in: "query",
              name: "sort",
			  required: true,
			  type:"string",
			  enum:["name asc"],
              description: ""
            },{
              in: "query",
              name: "search",
			  required: false,
			  type:"string",
              description: ""
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
     'POST /workauthorization/create': { controller: 'workauthorization', action: 'create' ,swagger: {
		 summary:"This api can create a new  workauthorization  list details ",
		description:"Use Admin AccessToken",
        tags: ["Workauthorization"],
			parameters: [{
              in: "body",
              name: "body",
              required: true,
              schema: {
				  properties:{
					country:{ type: "string", example:"3"},
					name:{ type: "string", example:"Algeria"},
					visa:{ type: "string", example:"1"},
				  }
			  },
              description: "Enter the Workauthorization name"
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
     'POST /workauthorization/delete/:id' : { controller : 'workauthorization' , action : 'delete',swagger: {
		 summary:"This api can delete  workauthorization  list details based on the id",
		description:"Use Admin AccessToken",
        tags: ["Workauthorization"],
			parameters: [{
              in: "path",
              name: "id",
			  required: true,
			  type:"number",
              description: "Enter the id"
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},
     'POST /workauthorization/update/:id': { controller: 'workauthorization', action: 'update' ,swagger: {
		 summary:"This api can update  workauthorization  list details based on the id",
		description:"Use Admin AccessToken",
        tags: ["Workauthorization"],
			parameters: [{
              in: "path",
              name: "id",
              required: true,
			type: "string",
			example:"1",
              description: "Enter the Workauthorization id "
            },{
              in: "body",
              name: "body",
              required: true,
              schema: {
				  properties:{
					country:{ type: "string", example:"1"},
					name:{ type: "string", example:"Afghanistan"},
					visa:{ type: "string", example:"h1b"},
				  }
			  },
              description: "Enter the Workauthorization name"
            }],
        consumes: ["application/json"],
        produces: ["application/json"],
        responses: {
          "200": {description: "The requested resource"},
          "404": {description: "Resource not found"},
          "500": {description: "Internal server error"}
        },
		security:[{"Authorization":[]}]
    }},

 
    /*Subscription plans routes*/
    'GET /subscription-plans/create': nonGetHandler,
    'POST /subscription-plans/create': { controller: 'subscription-plans', action: 'create' },
    'GET /subscription-plans/update/:id': nonGetHandler,
    'POST /subscription-plans/update/:id': { controller: 'subscription-plans', action: 'update' },
    'GET /subscription-plans/change-status/:id': nonGetHandler,
    'POST /subscription-plans/change-status/:id': { controller: 'subscription-plans', action: 'change-status' },
    'GET /subscription-plans/delete/:id': nonGetHandler,
    'POST /subscription-plans/delete/:id': { controller: 'subscription-plans', action: 'delete' },
    'GET /subscription-plans/list': { controller: 'subscription-plans', action: 'list' },
    'GET /subscription-plans/view/:id': { controller: 'subscription-plans', action: 'view' },

    /*User subscriptions routes*/
    'GET /users/subscriptions/create': nonGetHandler,
    'POST /users/subscriptions/create': { controller: 'users', action: 'subscriptions/create' },

    /*Oauth 2 - Endpoints*/
    'GET /oauth/token': nonGetHandler,

    /*Get Access Token Using Password*/
    'POST /oauth/token': [
        trustedClientPolicy,
        passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
        oauth2_server.token(),
        oauth2_server.errorHandler()
    ],

    /*Get Access Token Using Social Login*/
    "POST /users/social-login": [
        function(req, res, next) {
            passport.authenticate(
                ["basic", "oauth2-client-password"], { session: false },
                function(error, client) {
                    if (!client) {
                        return res.status(401).json({ message: "Unauthorized" });
                    } else {
                        req.user = client;
                        next();
                    }
                }
            )(req, res, next);
        },
        loginSocialService
    ],

    /*Renders login page*/
    // 'GET /login': function(req, res){
    //     var user = req.flash("userdata");
    //     var userdata = '';
    //     if(user !== 'undefined' && user.length>0){
    //        userdata = user[0];
    //     }
    //     return res.view('pages/login', {
    //         message: req.flash("error"),
    //         userdata: userdata
    //     });
    // },

    /*Handle post data from login page*/
    // 'POST /login': function(req, res, next){
    //     passport.authenticate('local', function(err, user, info) {
    //         req.flash("userdata",req.body);
    //         if (err) {
    //             req.flash("error",info.message);
    //             return next(err);
    //         }
    //         if (!user) {
    //             req.flash("error",info.message);
    //             return res.redirect('/login');
    //         }
    //         req.logIn(user, function(err) {
    //             if (err) { return next(err); }
    //             return res.redirect(req.session.returnTo ? req.session.returnTo : "/");
    //         });
    //     })(req, res, next);
    // },

    /*Handle post data from login page*/
    // 'POST /users/social-login': [function(req, res, next){
    //     passport.authenticate(['basic', 'oauth2-client-password'], { session: false },function(error, client){
    //         if(!client){
    //             return res.status(401).json({message:"Unauthorized"});
    //         }
    //         else{
    //             req.user=client;
    //             next();
    //         }
    //     })(req, res, next);
    // },loginSocialService],

    'GET /logout': function(req, res) {
        req.logout();
        res.redirect('/login');
    }


    /*Render authorize page.
     *
     * Sample URL: http://localhost:1337/oauth/authorize?response_type=token&client_id=8MONB4VIJX&redirect_uri=http://localhost:8080/
     * Sample URL: http://localhost:1337/oauth/authorize?response_type=code&client_id=8MONB4VIJX&redirect_uri=http://localhost:8080/
     * */
    // 'GET /oauth/authorize': [
    //     login.ensureLoggedIn(),
    //     oauth2_server.authorize(function(clientId, redirectURI, done) {
    //         Client.findOne({clientId: clientId}, function(err, client) {
    //           if (err) { return done(err); }
    //           if (!client) { return done(null, false); }
    //           if (client.redirectURI !== redirectURI) { return done(null, false); }
    //           return done(null, client, client.redirectURI);
    //         });
    //     }),
    //     function(req, res, next){
    //         // TRUSTED CLIENT
    //         // if client is trusted, skip ahead to next,
    //         // which is the server.decision() function
    //         // that normally is called when you post the auth dialog form
    //         if (req.oauth2.client.trusted) {
    //             // add needed params to simulate auth dialog being posted
    //             req.trusted = true;
    //             req.body = req.query;
    //             req.body.transaction_id = req.oauth2.transactionID;
    //             return next();
    //         }
    //         return res.render('pages/dialog', {
    //             transactionID: req.oauth2.transactionID,
    //             user: req.user,
    //             client: req.oauth2.client,
    //             jwtToken: req.query.token
    //         });
    //     },
    //     // We added this 2 methods here in case the form is skipped (TRUSTED CLIENT)
    //     oauth2_server.decision(),
    //     oauth2_server.errorHandler()
    // ],
    //
    // 'POST /oauth/authorize/decision': [
    //     login.ensureLoggedIn(),
    //     oauth2_server.decision()
    // ]
};

function nonGetHandler(request, response) {
    return response.status(405).json({ message: 'The requested method must be POST.' });
}