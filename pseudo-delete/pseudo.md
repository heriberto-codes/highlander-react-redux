# Steps
- npm install
  - [ ] Express
  - [ ] bodyParser
  - [ ] morgan
  - [ ] uuid

- Create directories and files
  - [ ] touch `models.js`
  - [ ] touch `server.js`
  - [ ] touch `blogPostRouter.js`
  - [ ] touch `gitignore` add this below

          # dependencies
            - node_modules

          # testing
            - what ever testing files i create

          # misc
            - .DS_Store
            - .env
            - npm-debug.log
            - pseudo.md & all markdown files
            - travis.yml
            - config.js

# On server.js
- [ ] require express
- [ ] require morgan
- [ ] create a new instance of express
- [ ] require the router endpoint files
- [ ] app.use the middleware i.e morgan
- [ ] app.use /blog-post router which will tie in the file blogPostRouter
- [ ] stub out both versions of the runServer function
- [ ] stub out closeServer function
- [ ] stub out conditional if(require.main === module)....
- [ ] export file out with function via object destructuring

# On BlogPostModels AKA Schema
  - [ ] require mongoose
  - [ ] create a var Schema and store mongoose.Schema
  - [ ] create schema model
  - [ ] create virtual method for the Schema
  - [ ] create the methods.apiRepr for the Schema
  - [ ] export the schema mongoose.model('Blog', blogPostSchema)

# On blogPostRouter
  - [ ] require express
  - [ ] create a new express router instance and store it in a router var
  - [ ] require bodyparser
  - [ ] store body.parser.json() in a jsonParser var
  - [ ] require {blogPost} from  models
  - [ ] Stub out `GET` and `POST` endpoints
  - [ ] Stub out `DELETE` and `POST` endpoints
  - [ ] Stub out dummy blog post
  - [ ] Stub out `app.use` for middleware
  - [ ] module export = router

# Set up test

>Notes:

>1) Seed the database For instance, for the restaurants app,
>we'll seed the database with documents representing fake restaurants.

>2) Make an HTTP request and assert about the response
>This could be a GET, POST, PUT, or DELETE request to an endpoint.
>Like when we first learned about integration testing,
>we'll inspect the response object, ensuring that it has the right code
>and the right data. Unlike before, now we'll compare the data returned by the API
>to a known state of the database.

>For instance, if we were testing a get -restaurant-by-id endpoint,
>and we make a request to /restaurants/123abc, we'll compare the values for
>name, borough in the response to the values for restaurant in our database.

>3) Inspect the database after making requests This point mainly applies to
>tests for PUT and DELETE endpoints. When testing a PUT endpoint for updating
>restaurants, for instance, after inspecting the response object, we'll query
>the database for the restaurant we updated to prove that it was properly
>updated in the db. For a DELETE endpoint, after making a request to the
>API and inspecting the response, we'll query the DB to ensure that the
>document we deleted no longer exists.

>4) Tear down It's crucial that our tests are fully independent from one another.
>If a previous test added or removed documents from the database, it shouldn't
>effect subsequent tests. To this end, we'll add a tear down step that happens
>after each test, that drops the database. By doing this and seeding the database
>before each test, we'll ensure that no state is maintained between each test.

  - [ ] npm install `--save-dev mocha`
  - [ ] npm install `--save-dev chai`
  - [ ] npm install `--save-dev chai-http`
  - [ ] npm install `--save-dev Faker`
  - [ ] mkdir test
  - [ ] touch `test-blog-posts`
  - [ ] Go to `package.json` and add "mocha" to test: in scripts
  - [ ] Require the following on my test file
    - [ ] const chai = require('chai');
    - [ ] const chaiHttp = require('chai-http');
    - [ ] const should = chai.should();
    - [ ] chai.use(chaiHttp);
  - [ ] pull in required modules
    - [ ] Faker
    - [ ] mongoose
    - [ ] Your Model
    - [ ] Server
    - [ ] Test Database URL
  - [ ] Update config file to include "pretest": "DATABASE_URL=test-database-url", in `package.json` file
  - [ ] Setup test file with test data environment
    - [ ] tearDownDb function
    - [ ] seedData function
  - [ ] Write first describe 'blog posts API resource'
    - [ ] before function
    - [ ] beforeEach function
    - [ ] afterEach function
    - [ ] after function
  - [ ] Stub out 1st describe for GET request endpoint
  >Strategy:
    1. Get back all posts returned by by GET request to `ENDPOINT`.
    2. Prove res has right status, data type.
    3. Prove the number of posts we got back is equal to number in db.

- [ ] Stub out 2nd describe for GET request endpoint
  >Strategy:
  Get back all posts, and ensure they have expected keys

- [ ] Stub out 1st describe for POST request endpoint
  >Strategy:
    1. make a POST request with data,
    2. Then prove that the post we get back has right keys, and that `id` is there (which means the data was inserted into db)

- [ ] Stub out 1st describe for PUT request endpoint
  >Strategy:
    1. Get an existing post from db & set newBlogPost.id = post.id
    2. Make a PUT request to update that post
    3. Prove post returned by request contains data we sent
    4. Prove post in db is correctly updated

- [ ] Stub out 1st describe for DELETE request endpoint


# Set up continuous integration test
  - [ ] Set up both runServer and CloseServer function on server file
  - [ ] touch `.travis.yml`
  - [ ] connect Travis CI with repo and add the following to the file
    - [ ] language: node_js
    - [ ] node_js: node
  - [ ] Provision mLab
  - [ ] Use mongoimport to seed your mLab database with some data.
    > mongoimport --db my-scratch-db --collection restaurants --drop --file ~/Desktop/primer-dataset.json --host ds119728.mlab.com --port 19728  -u <username> -p <password>

  - [ ] Install TravisCI CLI from the command line
    - [ ] gem install travis
    - [ ] travis login
    - [ ] travis setup heroku
    - [ ] git diff
  - [ ] Create app on Heroku
    - [ ] heroku create
    - [ ] Paste app name on deploy:app: in `.travis.yml`
    - [ ] Push to github and track test on Travis CI

# Steps for Highlander
  - [ ] Create an Epic
  - [ ] Create user personas
  - [ ] Create user stories
  - [ ] Filter down to MVP user stories
  - [ ] Create userflow
  - [ ] Map out Data Structure
  - [ ] Set up Knexfile.js
  - [ ] Create Migration files
  - [ ] Create Seed files
  - [ ] Create bookshel.config.js file
  - [ ] Set up CI and small test and push to master
  - [ ] Create models
  - [ ] Create routes
