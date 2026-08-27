import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Form, Hyperlink } from '@openedx/paragon';
import PropTypes from 'prop-types';

const TermsOfService = (props) => {
  const {
    errorMessage, onChangeHandler, value,
  } = props;

  const termsUrl = getConfig().TOS_LINK || 'https://centerforbusinessacceleration.com/terms/';
  const privacyUrl = getConfig().PRIVACY_POLICY || 'https://centerforbusinessacceleration.com/privacy/';

  return (
    <div id="terms-of-service" className="micro text-muted">
      <Form.Checkbox
        className="form-field--checkbox mt-1"
        id="tos"
        checked={value}
        name="terms_of_service"
        value={value}
        onChange={onChangeHandler}
      >
        <FormattedMessage
          id="register.page.terms.of.service"
          defaultMessage="I have read and agree to the {termsOfService} and {privacyPolicy}."
          description="Required agreement to Terms of Service and Privacy Policy with links."
          values={{
            termsOfService: (
              <Hyperlink
                className="cba-tos-link"
                variant="muted"
                destination={termsUrl}
                target="_blank"
                showLaunchIcon={false}
              >
                Terms of Service
              </Hyperlink>
            ),
            privacyPolicy: (
              <Hyperlink
                className="cba-tos-link"
                variant="muted"
                destination={privacyUrl}
                target="_blank"
                showLaunchIcon={false}
              >
                Privacy Policy
              </Hyperlink>
            ),
          }}
        />
      </Form.Checkbox>
      {errorMessage && (
        <Form.Control.Feedback type="invalid" className="form-text-size" hasIcon={false}>
          {errorMessage}
        </Form.Control.Feedback>
      )}
    </div>
  );
};

TermsOfService.defaultProps = {
  errorMessage: '',
  value: false,
};

TermsOfService.propTypes = {
  errorMessage: PropTypes.string,
  onChangeHandler: PropTypes.func.isRequired,
  value: PropTypes.bool,
};

export default TermsOfService;
