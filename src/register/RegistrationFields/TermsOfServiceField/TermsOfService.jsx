import React from 'react';

import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Form, Hyperlink } from '@openedx/paragon';
import PropTypes from 'prop-types';

const TermsOfService = (props) => {
  const {
    errorMessage, onChangeHandler, value,
  } = props;

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
          defaultMessage="{termsOfService}"
          description="Required agreement to the terms and policies."
          values={{
            termsOfService: (
              <Hyperlink variant="muted" destination={getConfig().TOS_LINK || '#'} target="_blank">
                Agree to terms and policies
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
