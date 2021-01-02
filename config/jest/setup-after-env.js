import nock from 'nock';

beforeAll(() => {
  // Disable all HTTP requests
  nock.disableNetConnect();
});

afterAll(() => {
  nock.enableNetConnect();
});
