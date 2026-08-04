import messages from '../../messages';

const validateOrganizationCode = (value, formatMessage) => {
  let fieldError = '';

  const normalized = String(value || '').trim();

  if (!normalized) {
    fieldError = formatMessage(messages['organization.code.required']);
  }

  return fieldError;
};

export default validateOrganizationCode;
