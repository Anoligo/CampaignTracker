// Provide a uuid implementation globally before tests run so that modules using
// `window.uuid` during import do not fail.
global.window = global.window || {};
global.window.uuid = {
  v4: () => 'mock-uuid'
};

beforeEach(() => {
  localStorage.clear();
});
