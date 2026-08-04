import React from 'react';
import { useDispatch } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

import validateOrganizationCode from './validator';
import { FormGroup } from '../../../common-components';
import { clearRegistrationBackendError } from '../../data/actions';

const OrganizationCodeField = (props) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const {
    handleErrorChange,
  } = props;

  const handleOnBlur = (event) => {
    const { value } = event.target;
    const fieldError = validateOrganizationCode(value, formatMessage);

    if (fieldError) {
      handleErrorChange('organization_code', fieldError);
    }
  };

  const handleOnFocus = () => {
    handleErrorChange('organization_code', '');
    dispatch(clearRegistrationBackendError('organization_code'));
  };

  return (
    <FormGroup
      {...props}
      handleBlur={handleOnBlur}
      handleFocus={handleOnFocus}
    />
  );
};

OrganizationCodeField.defaultProps = {
  errorMessage: '',
};

OrganizationCodeField.propTypes = {
  errorMessage: PropTypes.string,
  value: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleErrorChange: PropTypes.func.isRequired,
};

export default OrganizationCodeField;
