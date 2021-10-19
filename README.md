# SAP Service

Rest API service for job discovery app.

## Steps to get the API application running on a server.

1. Install the latest NodeJS [More details](https://nodejs.org).
2. Install all the node dependencies using the following command.
    ``` npm install ```
3. Install a forever daemon application using the following command.
    ``` npm install -g forever ```
4. Run and start the node server using the following command for DEVELOPMENT environment.
    ``` forever start -c "npm run start --prefix {PATH}" {PATH} ```
5. Run and start the node server using the following command for PRODUCTION environment.
    ``` forever start -c "npm run PROD_start --prefix {PATH}" {PATH} ```

## Steps to get the API Doc application running on a server.

1. Install the latest NodeJS [More details](https://nodejs.org).
2. Install all the node dependencies using the following command.
    ``` npm install ```
3. Install a forever daemon application using the following command.
    ``` npm install -g forever ```
4. Run and start the node server using the following command.
    ``` forever start -c "npm run serve-static --prefix {PATH}" {PATH} ```    


### Links

+ [Get started with NodeJS](https://nodejs.org/en/)
+ [Get started with SailsJS](https://sailsjs.com/get-started)
+ [Sails framework documentation](https://sailsjs.com/documentation)
+ [Version notes / upgrading](https://sailsjs.com/documentation/upgrading)
+ [Deployment tips](https://sailsjs.com/documentation/concepts/deployment)
+ [Community support options](https://sailsjs.com/support)
+ [Professional / enterprise options](https://sailsjs.com/enterprise)
+ [Swagger UI](https://swagger.io/)
