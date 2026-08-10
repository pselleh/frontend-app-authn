import { Provider } from 'react-redux';

import { mergeConfig } from '@edx/frontend-platform';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { fireEvent, render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';

import { COUNTRY_CODE_KEY, COUNTRY_DISPLAY_KEY } from './validator';
import { CountryField } from '../index';

const mockStore = configureStore();

jest.mock('react-router-dom', () => {
  const mockNavigation = jest.fn();

  // eslint-disable-next-line react/prop-types
  const Navigate = ({ to }) => {
    mockNavigation(to);
    return <div />;
  };

  return {
    ...jest.requireActual('react-router-dom'),
    Navigate,
    mockNavigate: mockNavigation,
  };
});

describe('CountryField', () => {
  let props = {};
  let store = {};

  const reduxWrapper = children => (
    <IntlProvider locale="en">
      <Provider store={store}>{children}</Provider>
    </IntlProvider>
  );

  const routerWrapper = children => (
    <Router>
      {children}
    </Router>
  );

  const initialState = {
    register: {},
  };

  beforeEach(() => {
    store = mockStore(initialState);

    props = {
      countryList: [
        {
          [COUNTRY_CODE_KEY]: 'PK',
          [COUNTRY_DISPLAY_KEY]: 'Pakistan',
        },
        {
          [COUNTRY_CODE_KEY]: 'CA',
          [COUNTRY_DISPLAY_KEY]: 'Canada',
        },
        {
          [COUNTRY_CODE_KEY]: 'US',
          [COUNTRY_DISPLAY_KEY]: 'United States',
        },
      ],
      selectedCountry: {
        countryCode: '',
        displayValue: '',
      },
      errorMessage: '',
      onChangeHandler: jest.fn(),
      handleErrorChange: jest.fn(),
      onFocusHandler: jest.fn(),
    };

    window.location = { search: '' };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('native country select', () => {
    mergeConfig({
      SHOW_CONFIGURABLE_EDX_FIELDS: true,
    });

    it('renders with no country selected by default', () => {
      const { container } = render(
        routerWrapper(reduxWrapper(<CountryField {...props} />)),
      );

      const countrySelect = container.querySelector('select[name="country"]');

      expect(countrySelect).toBeTruthy();
      expect(countrySelect.value).toBe('');
    });

    it('renders the placeholder followed by United States as the first real option', () => {
      const { container } = render(
        routerWrapper(reduxWrapper(<CountryField {...props} />)),
      );

      const countrySelect = container.querySelector('select[name="country"]');
      const options = Array.from(countrySelect.options);

      expect(options[0].value).toBe('');
      expect(options[0].textContent).toBe('Select a country/region');

      expect(options[1].value).toBe('US');
      expect(options[1].textContent).toBe('United States');
    });

    it('keeps the remaining countries available after United States', () => {
      const { container } = render(
        routerWrapper(reduxWrapper(<CountryField {...props} />)),
      );

      const countrySelect = container.querySelector('select[name="country"]');
      const options = Array.from(countrySelect.options);

      expect(options.map(option => option.value)).toEqual([
        '',
        'US',
        'CA',
        'PK',
      ]);

      expect(options.map(option => option.textContent)).toEqual([
        'Select a country/region',
        'United States',
        'Canada',
        'Pakistan',
      ]);
    });

    it('selects United States and sends its code and display value', () => {
      const { container } = render(
        routerWrapper(reduxWrapper(<CountryField {...props} />)),
      );

      const countrySelect = container.querySelector('select[name="country"]');

      fireEvent.change(countrySelect, {
        target: {
          name: 'country',
          value: 'US',
        },
      });

      expect(props.onChangeHandler).toHaveBeenCalledTimes(1);
      expect(props.onChangeHandler).toHaveBeenCalledWith(
        { target: { name: 'country' } },
        {
          countryCode: 'US',
          displayValue: 'United States',
        },
      );
    });

    it('allows another country to be selected', () => {
      const { container } = render(
        routerWrapper(reduxWrapper(<CountryField {...props} />)),
      );

      const countrySelect = container.querySelector('select[name="country"]');

      fireEvent.change(countrySelect, {
        target: {
          name: 'country',
          value: 'PK',
        },
      });

      expect(props.onChangeHandler).toHaveBeenCalledTimes(1);
      expect(props.onChangeHandler).toHaveBeenCalledWith(
        { target: { name: 'country' } },
        {
          countryCode: 'PK',
          displayValue: 'Pakistan',
        },
      );
    });

    it('does not auto-select backend country', () => {
      store = mockStore({
        ...initialState,
        register: {
          ...initialState.register,
          backendCountryCode: 'US',
        },
      });

      const { container } = render(
        reduxWrapper(<CountryField {...props} isRequired={false} />),
      );

      const countrySelect = container.querySelector('select[name="country"]');

      expect(countrySelect.value).toBe('');
      expect(props.onChangeHandler).not.toHaveBeenCalled();
    });

    it('clears validation error when optional country is left blank', () => {
      const { container } = render(
        reduxWrapper(<CountryField {...props} isRequired={false} />),
      );

      const countrySelect = container.querySelector('select[name="country"]');

      fireEvent.change(countrySelect, {
        target: {
          name: 'country',
          value: '',
        },
      });

      expect(props.onChangeHandler).toHaveBeenCalledWith(
        { target: { name: 'country' } },
        {
          countryCode: '',
          displayValue: '',
        },
      );

      fireEvent.blur(countrySelect);

      expect(props.handleErrorChange).toHaveBeenCalledWith('country', '');
    });

    it('clears error and invokes focus handler on focus', () => {
      const { container } = render(
        routerWrapper(reduxWrapper(<CountryField {...props} />)),
      );

      const countrySelect = container.querySelector('select[name="country"]');

      fireEvent.focus(countrySelect);

      expect(props.handleErrorChange).toHaveBeenCalledWith('country', '');
      expect(props.onFocusHandler).toHaveBeenCalled();
    });

    it('displays an existing country error', () => {
      const errorProps = {
        ...props,
        errorMessage: 'country error message',
      };

      const { container } = render(
        routerWrapper(reduxWrapper(<CountryField {...errorProps} />)),
      );

      const feedbackElement = container.querySelector(
        '.pgn__form-control-description.pgn__form-text-invalid',
      );

      expect(feedbackElement).toBeTruthy();
      expect(feedbackElement.textContent).toContain('country error message');
    });
  });
});
