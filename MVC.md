Model
View
Controller

With MVC you are creating the enitre application in the server side.

RoR, PHP(Laravel CodeIgniter)

Backend
Router file receives GET /users it calls the controller/method that belongs to that URL
UserController->get() in here the controller will call the model to get things from the DB
UserModel->all() returns the data [ORM]
UserController will pass that data to a view
View->render('list.html', data);

With RESTful API your managing the data in the backend side and view on the front end side.

Backend API/Frontend Client
Router file receives GET /users it call the callback function that belongs to the route(controller alike file)
Callback function call the model to get things from the DB
UserModel->all() returns the data [ORM]
Callback function will sent back a json string(view alike)

import ftr from 'Footer'; //const ftr = require('Footer');
import { FooterContact, HOME } from 'Footer'; //const ftr = require('Footer'); const FooterContact = ftr.FooterContact;
