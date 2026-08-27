import React from 'react';
import { useDispatch } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Form, FormControlFeedback } from '@openedx/paragon';
import PropTypes from 'prop-types';

import { COUNTRY_CODE_KEY, COUNTRY_DISPLAY_KEY } from './validator';
import { clearRegistrationBackendError } from '../../data/actions';
import messages from '../../messages';

/**
 * Country field wrapper.
 *
 * Country is rendered as a true select control. No country is selected
 * automatically. United States is shown first, followed by the remaining
 * countries alphabetically.
 */
const CountryField = (props) => {
  const {
    countryList,
    selectedCountry,
    onChangeHandler,
    handleErrorChange,
    onFocusHandler,
    isRequired,
  } = props;

  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const normalizedCountryList = [...countryList]
    .filter(country => country[COUNTRY_CODE_KEY]?.toUpperCase() !== 'US')
    .sort((a, b) => (
      a[COUNTRY_DISPLAY_KEY].localeCompare(b[COUNTRY_DISPLAY_KEY])
    ));

  const unitedStates = countryList.find(
    country => country[COUNTRY_CODE_KEY]?.toUpperCase() === 'US',
  ) || {
    [COUNTRY_CODE_KEY]: 'US',
    [COUNTRY_DISPLAY_KEY]: 'United States',
  };

  const orderedCountryList = [
    {
      ...unitedStates,
      [COUNTRY_CODE_KEY]: 'US',
      [COUNTRY_DISPLAY_KEY]: 'United States',
    },
    ...normalizedCountryList,
  ];

  const handleOnFocus = (event) => {
    handleErrorChange('country', '');
    dispatch(clearRegistrationBackendError('country'));
    onFocusHandler(event);
  };

  const handleOnBlur = (event) => {
    if (!isRequired && !event.target.value) {
      handleErrorChange('country', '');
      return;
    }

    if (isRequired && !event.target.value) {
      handleErrorChange(
        'country',
        formatMessage(messages['empty.country.field.error']),
      );
      return;
    }

    handleErrorChange('country', '');
  };

  const handleOnChange = (event) => {
    const countryCode = event.target.value;

    if (!countryCode) {
      onChangeHandler(
        { target: { name: 'country' } },
        { countryCode: '', displayValue: '' },
      );
      return;
    }

    const country = orderedCountryList.find(
      item => item[COUNTRY_CODE_KEY] === countryCode,
    );

    onChangeHandler(
      { target: { name: 'country' } },
      {
        countryCode,
        displayValue: country ? country[COUNTRY_DISPLAY_KEY] : '',
      },
    );
  };

  return (
    <Form.Group
      controlId="country"
      isInvalid={Boolean(props.errorMessage)}
    >
      <Form.Label>
        {formatMessage(messages['registration.country.label'])}
      </Form.Label>

      <Form.Control
        as="select"
        name="country"
        value={selectedCountry.countryCode || ''}
        onFocus={handleOnFocus}
        onBlur={handleOnBlur}
        onChange={handleOnChange}
        aria-invalid={props.errorMessage ? 'true' : 'false'}
      >
        <option value="">Select a country/region</option>

        {orderedCountryList.map(country => (
          <option
            key={country[COUNTRY_CODE_KEY]}
            value={country[COUNTRY_CODE_KEY]}
          >
            {country[COUNTRY_DISPLAY_KEY]}
          </option>
        ))}
      </Form.Control>

      {props.errorMessage && (
        <FormControlFeedback type="invalid">
          {props.errorMessage}
        </FormControlFeedback>
      )}
    </Form.Group>
  );
};

CountryField.propTypes = {
  countryList: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string,
      name: PropTypes.string,
    }),
  ).isRequired,
  errorMessage: PropTypes.string,
  isRequired: PropTypes.bool,
  onChangeHandler: PropTypes.func.isRequired,
  handleErrorChange: PropTypes.func.isRequired,
  onFocusHandler: PropTypes.func.isRequired,
  selectedCountry: PropTypes.shape({
    displayValue: PropTypes.string,
    countryCode: PropTypes.string,
  }),
};

CountryField.defaultProps = {
  errorMessage: null,
  isRequired: true,
  selectedCountry: {
    displayValue: '',
    countryCode: '',
  },
};

export default CountryField;
