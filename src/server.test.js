/**
 * @jest-environment node
 */

const chai = require('chai');
const chaiHttp = require('chai-http');
const { app } = require('../server');

chai.use(chaiHttp);
const expect = chai.expect;

describe('server routes', () => {
  it('DELETE /sessions should return 204', () => {
    return chai
      .request(app)
      .delete('/sessions')
      .then(res => {
        expect(res).to.have.status(204);
      });
  });
});
