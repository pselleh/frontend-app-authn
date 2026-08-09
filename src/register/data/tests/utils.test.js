import { isFormValid, prepareRegistrationPayload } from '../utils';

describe('Payload validation', () => {
  let formatMessage;
  let configurableFormFields;
  let fieldDescriptions;

  beforeEach(() => {
    formatMessage = jest.fn(msg => msg);
    configurableFormFields = {
      confirm_email: true,
    };
    fieldDescriptions = {};
  });

  test('validates name field correctly', () => {
    const payload = { name: ' ' };
    const errors = {};
    const { isValid, fieldErrors } = isFormValid(
      payload,
      errors,
      configurableFormFields,
      fieldDescriptions,
      formatMessage);

    expect(fieldErrors.name).toBeDefined();
    expect(isValid).toBe(false);
  });

  test('validates email field correctly', () => {
    const payload = { email: 'invalid-email' };
    const errors = {};
    const { isValid, fieldErrors } = isFormValid(
      payload, errors, configurableFormFields, fieldDescriptions, formatMessage);

    expect(fieldErrors.email).toBeDefined();
    expect(isValid).toBe(false);
  });

  test('validates username field correctly', () => {
    const payload = { username: 'invalid username' };
    const errors = {};
    const { isValid, fieldErrors } = isFormValid(
      payload, errors, configurableFormFields, fieldDescriptions, formatMessage);

    expect(fieldErrors.username).toBeDefined();
    expect(isValid).toBe(false);
  });

  test('validates password field correctly', () => {
    const payload = { password: 'short' };
    const errors = {};
    const { isValid, fieldErrors } = isFormValid(
      payload, errors, configurableFormFields, fieldDescriptions, formatMessage);

    expect(fieldErrors.password).toBeDefined();
    expect(isValid).toBe(false);
  });

  test('validates multiple fields correctly', () => {
    const payload = {
      name: 'InvalidName!',
      email: 'invalid-email',
      username: 'invalid username',
      password: 'short',
    };
    const errors = {};
    const { isValid, fieldErrors } = isFormValid(
      payload, errors, configurableFormFields, fieldDescriptions, formatMessage);

    expect(fieldErrors.name).toBeDefined();
    expect(fieldErrors.email).toBeDefined();
    expect(fieldErrors.username).toBeDefined();
    expect(fieldErrors.password).toBeDefined();
    expect(isValid).toBe(false);
  });

  test('validates matching confirm password correctly', () => {
    const payload = {
      password: 'VelvetOrbit7392!Q',
      confirm_password: 'VelvetOrbit7392!Q',
    };
    const errors = {};

    const { isValid, fieldErrors } = isFormValid(
      payload,
      errors,
      configurableFormFields,
      fieldDescriptions,
      formatMessage,
    );

    expect(fieldErrors.confirm_password).toBe('');
    expect(isValid).toBe(true);
  });

  test('rejects empty confirm password', () => {
    const payload = {
      password: 'VelvetOrbit7392!Q',
      confirm_password: '',
    };
    const errors = {};

    const { isValid, fieldErrors } = isFormValid(
      payload,
      errors,
      configurableFormFields,
      fieldDescriptions,
      formatMessage,
    );

    expect(fieldErrors.confirm_password).toBeDefined();
    expect(isValid).toBe(false);
  });

  test('rejects mismatched confirm password', () => {
    const payload = {
      password: 'VelvetOrbit7392!Q',
      confirm_password: 'DifferentPassword7392!Q',
    };
    const errors = {};

    const { isValid, fieldErrors } = isFormValid(
      payload,
      errors,
      configurableFormFields,
      fieldDescriptions,
      formatMessage,
    );

    expect(fieldErrors.confirm_password).toBeDefined();
    expect(isValid).toBe(false);
  });

  test('removes confirm password from prepared registration payload', () => {
    const payload = prepareRegistrationPayload(
      {
        email: 'john.doe@example.com',
        password: 'VelvetOrbit7392!Q',
        confirm_password: 'VelvetOrbit7392!Q',
      },
      {},
      false,
      0,
      {},
    );

    expect(payload).not.toHaveProperty('confirm_password');
    expect(payload.password).toBe('VelvetOrbit7392!Q');
  });
});
